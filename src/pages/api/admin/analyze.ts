/**
 * Analyze gym website for changes using AI
 * POST /api/admin/analyze
 * Body: { gym_id: number }
 * Response: { changes: {...}, summary: string }
 */
export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const gymId = body.gym_id;

    if (!gymId) {
      return json({ error: "gym_id required" }, 400);
    }

    const { db } = await import("@lib/db");
    const { gyms, facilities, gymFacilities } = await import("@lib/db/schema");
    const { eq } = await import("drizzle-orm");

    // Load gym
    const gymRows = await db.select().from(gyms).where(eq(gyms.id, gymId)).limit(1);
    const gym = gymRows[0];
    if (!gym) return json({ error: "Gym not found" }, 404);

    if (!gym.website) {
      return json({ error: "Este gimnasio no tiene web. Añade el enlace en Editar." }, 400);
    }

    // Load current facilities
    const facRows = await db.select({ slug: facilities.slug, name: facilities.name })
      .from(gymFacilities)
      .innerJoin(facilities, eq(gymFacilities.facilityId, facilities.id))
      .where(eq(gymFacilities.gymId, gymId));
    const currentFacs = facRows.map(f => f.name).join(", ");

    // Fetch gym website
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

    if (!html || html.length < 100) {
      return json({ error: "No se pudo extraer contenido de la web." }, 500);
    }

    // Current gym data snapshot
    const currentData = {
      name: gym.name,
      price_monthly: gym.monthlyPriceLow ? Number(gym.monthlyPriceLow).toFixed(2) + "€" : "desconocido",
      matricula: gym.matriculaFee ? Number(gym.matriculaFee).toFixed(2) + "€" : "sin matrícula",
      maintenance: gym.annualMaintenanceFee ? Number(gym.annualMaintenanceFee).toFixed(2) + "€" : "sin mantenimiento",
      facilities: currentFacs || "sin datos",
      open247: gym.isOpen247 ? "sí" : "no",
      address: gym.address || "desconocida",
    };

    // Call DeepSeek
    const apiKey = process.env.DEEPSEEK_API_KEY || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.DEEPSEEK_API_KEY : '');
    if (!apiKey) return json({ error: "DeepSeek API key not configured" }, 500);

    // Load model setting
    const { settings } = await import("@lib/db/schema");
    const allSettings = await db.select().from(settings);
    const aiModel = allSettings.find(s => s.key === "ai_model")?.value || "deepseek-chat";

    const systemPrompt = `Eres un analizador de cambios para GymCat. Compara los datos actuales de un gimnasio con el contenido de su web y detecta diferencias.

DATOS ACTUALES EN GYMCAT:
- Nombre: ${currentData.name}
- Precio mensual: ${currentData.price_monthly}
- Matrícula: ${currentData.matricula}
- Mantenimiento anual: ${currentData.maintenance}
- Abierto 24h: ${currentData.open247}
- Dirección: ${currentData.address}
- Instalaciones: ${currentData.facilities}

Tu tarea: analizar el contenido de la web y devolver SOLO un JSON con los cambios detectados.

ESTRUCTURA JSON:
{
  "has_changes": true/false,
  "changes": {
    "name": {"before": "...", "after": "...", "changed": true/false},
    "price_monthly": {"before": "...", "after": "...", "changed": true/false},
    "matricula": {"before": "...", "after": "...", "changed": true/false},
    "maintenance": {"before": "...", "after": "...", "changed": true/false},
    "open247": {"before": "...", "after": "...", "changed": true/false},
    "address": {"before": "...", "after": "...", "changed": true/false},
    "facilities": {"before": "...", "after": "...", "changed": true/false, "added": [], "removed": []}
  },
  "summary": "Resumen en español de los cambios encontrados",
  "confidence": 0-1
}`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `CONTENIDO DE LA WEB:\n${html}` },
        ],
        temperature: 0,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return json({ error: "DeepSeek API error" }, 500);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(content);

    // Update last analyzed timestamp
    await db.update(gyms).set({ lastAnalyzedAt: new Date() } as any).where(eq(gyms.id, gymId));

    return json({
      success: true,
      gym_name: gym.name,
      website: gym.website,
      ...result,
    });

  } catch (error: any) {
    return json({ error: error.message }, 500);
  }
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
