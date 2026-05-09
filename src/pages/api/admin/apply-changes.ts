/**
 * Apply detected changes from web analysis to the gym record
 * POST /api/admin/apply-changes
 * Body: { gym_id: number }
 */
export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const gymId = body.gym_id;
    if (!gymId) return json({ error: "gym_id required" }, 400);

    const { db } = await import("@lib/db");
    const { gyms, facilities, gymFacilities } = await import("@lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const gymRows = await db.select().from(gyms).where(eq(gyms.id, gymId)).limit(1);
    const gym = gymRows[0];
    if (!gym) return json({ error: "Gym not found" }, 404);
    if (!gym.website) return json({ error: "No tiene web" }, 400);

    // Re-analyze to get fresh data
    const apiKey = process.env.DEEPSEEK_API_KEY || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.DEEPSEEK_API_KEY : '');
    if (!apiKey) return json({ error: "DeepSeek API key not configured" }, 500);

    const { settings } = await import("@lib/db/schema");
    const allSettings = await db.select().from(settings);
    const aiModel = allSettings.find(s => s.key === "ai_model")?.value || "deepseek-v4-pro";

    const facRows = await db.select({ slug: facilities.slug, name: facilities.name })
      .from(gymFacilities).innerJoin(facilities, eq(gymFacilities.facilityId, facilities.id))
      .where(eq(gymFacilities.gymId, gymId));
    const currentFacs = facRows.map(f => f.name).join(", ");

    // Fetch website
    let html = "";
    try {
      const res = await fetch(gym.website, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GymCat/1.0)" },
        signal: AbortSignal.timeout(10000),
      });
      html = await res.text();
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                 .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                 .replace(/<[^>]+>/g, " ")
                 .replace(/\s+/g, " ")
                 .slice(0, 6000);
    } catch (e: any) {
      return json({ error: `No se pudo acceder a la web: ${e.message}` }, 500);
    }

    const currentData = {
      name: gym.name,
      price_monthly: gym.monthlyPriceLow ? Number(gym.monthlyPriceLow).toFixed(0) + "€/mes" : "desconocido",
      matricula: gym.matriculaFee ? Number(gym.matriculaFee).toFixed(0) + "€" : "sin matrícula",
      maintenance: gym.annualMaintenanceFee ? Number(gym.annualMaintenanceFee).toFixed(0) + "€/año" : "sin mantenimiento",
      facilities: currentFacs || "sin datos",
      open247: gym.isOpen247 ? "sí" : "no",
      address: gym.address || "desconocida",
    };

    const systemPrompt = `Eres un actualizador de datos para GymCat. Extrae los datos ACTUALES de la web del gimnasio.

DATOS ACTUALES EN GYMCAT:
- Nombre: ${currentData.name}
- Precio mensual: ${currentData.price_monthly}
- Matrícula: ${currentData.matricula}
- Mantenimiento anual: ${currentData.maintenance}
- Abierto 24h: ${currentData.open247}
- Dirección: ${currentData.address}
- Instalaciones: ${currentData.facilities}

Extrae de la web y devuelve SOLO un JSON con los valores ACTUALES que aparecen hoy en la web:

{
  "price_monthly": número en euros (ej: 29.99, null si no se encuentra),
  "matricula_fee": número en euros (ej: 0, null si no se encuentra),
  "annual_maintenance_fee": número en euros (null si no se encuentra),
  "is_open_247": true/false/null,
  "facilities_add": ["slug1", "slug2"],
  "address": "dirección si aparece"
}`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `CONTENIDO DE LA WEB:\n${html}` },
        ],
        temperature: 0,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) return json({ error: "DeepSeek API error" }, 500);
    const data = await response.json();
    const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    // Apply changes
    const updates: any = { updatedAt: new Date() };
    const changes: string[] = [];

    if (result.price_monthly && typeof result.price_monthly === 'number') {
      updates.monthlyPriceLow = String(result.price_monthly);
      changes.push(`Precio: ${currentData.price_monthly} → ${result.price_monthly}€`);
    }
    if (result.matricula_fee !== undefined && result.matricula_fee !== null) {
      updates.matriculaFee = String(result.matricula_fee);
      changes.push(`Matrícula: ${currentData.matricula} → ${result.matricula_fee}€`);
    }
    if (result.annual_maintenance_fee !== undefined && result.annual_maintenance_fee !== null) {
      updates.annualMaintenanceFee = String(result.annual_maintenance_fee);
      changes.push(`Mantenimiento: ${currentData.maintenance} → ${result.annual_maintenance_fee}€`);
    }
    if (result.is_open_247 !== undefined && result.is_open_247 !== null) {
      updates.isOpen247 = result.is_open_247;
      changes.push(`24h: ${currentData.open247} → ${result.is_open_247 ? 'sí' : 'no'}`);
    }

    if (Object.keys(updates).length > 1) {
      await db.update(gyms).set(updates).where(eq(gyms.id, gymId));
    }

    return json({
      success: true,
      summary: changes.length ? changes.join(" · ") : "No se detectaron cambios aplicables",
      changes,
    });

  } catch (error: any) {
    return json({ error: error.message }, 500);
  }
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
