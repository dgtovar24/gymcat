/**
 * AI Generation endpoint — PDF parsing + Google Reviews + form auto-fill
 * POST /api/admin/generate
 * Accepts multipart form: pdf (file, optional) + gym_name (string, optional)
 * Returns structured gym data from combined sources
 */
export async function POST({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;
    const gymName = formData.get("gym_name")?.toString() || "";
    const gymAddress = formData.get("gym_address")?.toString() || "";
    const rawPlaceId = formData.get("place_id")?.toString() || "";

    // Extract Place ID from Google Maps URL if needed
    const placeIdFromForm = extractPlaceId(rawPlaceId);

    // Load settings
    const { db } = await import("@lib/db");
    const { settings } = await import("@lib/db/schema");
    const allSettings = await db.select().from(settings);
    const getS = (key: string) => allSettings.find(s => s.key === key)?.value || "";

    const aiModel = getS("ai_model") || "deepseek-chat";
    const gmapsKey = getS("google_maps_api_key") || process.env.GOOGLE_MAPS_API_KEY || "";
    const placeId = placeIdFromForm || getS("google_place_id") || "";

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return json({ error: "DeepSeek API key not configured" }, 500);
    }

    let pdfText = "";
    let reviewText = "";

    // 1. Extract PDF text
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      pdfText = extractPDFText(buffer);
      if (!pdfText || pdfText.length < 20) {
        pdfText = "";
      }
    }

    // 2. Fetch Google Maps reviews if API key is configured
    if (gmapsKey && (gymName || placeId)) {
      try {
        let pid = placeId;
        // If no Place ID, try to find it by name
        if (!pid && gymName) {
          const searchRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(gymName + " " + gymAddress)}&inputtype=textquery&fields=place_id&key=${gmapsKey}`
          );
          const searchData = await searchRes.json();
          if (searchData.candidates?.length > 0) {
            pid = searchData.candidates[0].place_id;
          }
        }

        if (pid) {
          const detailsRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${pid}&fields=reviews,rating,user_ratings_total&language=es&key=${gmapsKey}`
          );
          const detailsData = await detailsRes.json();
          const reviews = detailsData.result?.reviews || [];

          if (reviews.length > 0) {
            const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
            const recentReviews = reviews
              .filter((r: any) => r.time * 1000 > threeMonthsAgo)
              .slice(0, 20);
            reviewText = recentReviews
              .map((r: any, i: number) => `Reseña ${i + 1} (${r.rating}/5): ${r.text}`)
              .join("\n\n");
          }
        }
      } catch (e) {
        console.error("Google Maps error:", e);
      }
    }

    // 3. Call DeepSeek to extract structured data
    const sources = [];
    if (pdfText) sources.push("PDF del gimnasio");
    if (reviewText) sources.push("reseñas de Google Maps");

    const systemPrompt = `Eres un extractor de datos para GymCat. Analiza la información combinada de ${sources.join(" y ") || "fuentes disponibles"} y extrae datos estructurados.

REGLAS:
- "name": nombre completo del gimnasio
- "address": dirección completa
- "phone": teléfono
- "website": web
- "description": descripción del gimnasio basada en TODA la información (máximo 400 caracteres)
- "monthly_price_low": precio mensual más bajo en euros (número)
- "monthly_price_high": precio mensual más alto (número)
- "matricula_fee": cuota de matrícula en euros (número, 0 si no hay)
- "annual_maintenance_fee": cuota de mantenimiento anual (número, 0 si no hay)
- "is_open_247": true si abre 24h
- "facilities": array de slugs de instalaciones mencionadas. Slugs: pesas, cardio, peso-libre, funcional, power-rack, piscina, spa, sauna, bano-turco, jacuzzi, clases-dirigidas, spinning, yoga, pilates, crossfit, boxeo, zumba, body-pump, parking, guarderia, cafeteria, toallas, taquillas, wifi, app, abierto-24h
- "ai_summary_pros": array de 3-5 aspectos positivos extraídos de las reseñas
- "ai_summary_cons": array de 3-5 aspectos negativos extraídos de las reseñas
- "overall_sentiment": "positive", "negative" o "neutral" según el tono general

Responde SOLO JSON válido. Valores null para lo que no encuentres.`;

    const userContent = [
      pdfText ? `CONTENIDO DEL PDF:\n${pdfText.slice(0, 6000)}` : "",
      reviewText ? `RESEÑAS DE GOOGLE MAPS:\n${reviewText.slice(0, 6000)}` : "",
      gymName ? `Nombre sugerido: ${gymName}` : "",
    ].filter(Boolean).join("\n\n---\n\n");

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
          { role: "user", content: userContent || "No hay datos disponibles" },
        ],
        temperature: 0,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return json({ error: "DeepSeek API error: " + response.status }, 500);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const extracted = JSON.parse(content);

    return json({
      success: true,
      data: extracted,
      sources: { hasPdf: !!pdfText, hasReviews: !!reviewText, reviewCount: reviewText ? reviewText.split("Reseña").length - 1 : 0 },
    });

  } catch (error: any) {
    return json({ error: error.message }, 500);
  }
}

/** Extract Place ID from Google Maps URL or return raw ID */
function extractPlaceId(input: string): string {
  if (!input) return "";
  // If it's already a Place ID (starts with ChIJ)
  if (input.startsWith("ChIJ")) return input;
  // Extract from Google Maps URL: place_id:XXX or !3d...!4d...!6s... or /place/XXX/
  const idMatch = input.match(/place_id[:=]([^&]+)/) || input.match(/\/place\/[^/]+\/[^/]+\/([^/?]+)/);
  if (idMatch) return idMatch[1];
  // Extract ChIJ from URL
  const chijMatch = input.match(/(ChIJ[a-zA-Z0-9_-]{20,})/);
  if (chijMatch) return chijMatch[1];
  // If looks like an ID (alphanumeric with underscore/dash, >10 chars)
  if (/^[A-Za-z0-9_-]{10,}$/.test(input.trim())) return input.trim();
  return "";
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function extractPDFText(buffer: Buffer): string {
  const str = buffer.toString("latin1");
  const texts: string[] = [];
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match: RegExpExecArray | null;
  while ((match = btRegex.exec(str)) !== null) {
    const block = match[1]!;
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      texts.push(tjMatch[1]!);
    }
  }
  if (texts.length === 0) {
    const readable = str.replace(/[^\x20-\x7E\xC0-\xFF\n\r\t]/g, " ");
    return readable.replace(/\s+/g, " ").trim();
  }
  return texts.join(" ").replace(/\s+/g, " ").trim();
}
