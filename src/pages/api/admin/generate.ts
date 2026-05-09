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

    const aiModel = getS("ai_model") || "deepseek-v4-pro";
    const gmapsKey = getS("google_maps_api_key") || process.env.GOOGLE_MAPS_API_KEY || "";
    const placeId = placeIdFromForm || getS("google_place_id") || "";

    const apiKey = process.env.DEEPSEEK_API_KEY || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.DEEPSEEK_API_KEY : '');
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

    const systemPrompt = `Eres un extractor de datos para GymCat. Analiza TODA la información disponible y extrae TODOS los datos que puedas encontrar. NO devuelvas campos vacíos si encuentras información — rellena TODO lo que detectes.

DATOS A EXTRAER (rellena todos los que encuentres):
- "name": nombre completo del gimnasio
- "address": dirección completa
- "phone": teléfono (formato español)
- "website": web oficial
- "description": descripción detallada (máximo 400 caracteres) — SIEMPRE rellena esto si hay texto disponible
- "monthly_price_low": precio mensual en euros (número, busca patrones como "29,99€/mes" o "desde 29.99")
- "matricula_fee": cuota de matrícula (número, 0 si dice "sin matrícula" o "gratis")
- "annual_maintenance_fee": mantenimiento anual (número)
- "is_open_247": true si menciona "24h", "24 horas", "abierto todo el día"
- "facilities": array de slugs. Busca menciones de: pesas, cardio, peso-libre, funcional, power-rack, piscina, spa, sauna, bano-turco, jacuzzi, clases-dirigidas, spinning, yoga, pilates, crossfit, boxeo, zumba, body-pump, parking, guarderia, cafeteria, toallas, taquillas, wifi, app, abierto-24h
- "ai_summary_pros": 3-5 aspectos positivos (de reseñas o del texto)
- "ai_summary_cons": 3-5 aspectos negativos

IMPORTANTE: Busca precios en formatos españoles (29,99€). Busca instalaciones mencionadas en el texto. Busca horarios y teléfonos. Rellena la descripción SIEMPRE que haya texto.

Responde SOLO JSON válido.`;

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
    let extracted: any;
    try {
      extracted = JSON.parse(content);
    } catch {
      extracted = {};
    }

    // Count how many fields were filled
    const filledFields: string[] = [];
    if (extracted.name) filledFields.push("Nombre");
    if (extracted.address) filledFields.push("Dirección");
    if (extracted.phone) filledFields.push("Teléfono");
    if (extracted.website) filledFields.push("Web");
    if (extracted.description) filledFields.push("Descripción");
    if (extracted.monthly_price_low) filledFields.push("Precio");
    if (extracted.matricula_fee != null) filledFields.push("Matrícula");
    if (extracted.annual_maintenance_fee) filledFields.push("Mantenimiento");
    if (extracted.facilities?.length) filledFields.push("Instalaciones");
    if (extracted.is_open_247) filledFields.push("24h");
    if (extracted.ai_summary_pros?.length || extracted.ai_summary_cons?.length) filledFields.push("Reseñas");

    return json({
      success: true,
      data: extracted,
      filledFields,
      debug: {
        pdfChars: pdfText.length,
        pdfSample: pdfText.slice(0, 500),
        reviewChars: reviewText.length,
        urls_analyzed: [],
        userContentLength: userContent.length,
      },
      sources: {
        hasPdf: !!pdfText,
        pdfLength: pdfText.length,
        hasReviews: !!reviewText,
        reviewCount: reviewText ? reviewText.split("Reseña").length - 1 : 0,
      },
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
  // Extract from Google Maps URL: ftid=XXX or 0x...:0x... pattern
  const ftidMatch = input.match(/ftid=([^&]+)/);
  if (ftidMatch) return decodeURIComponent(ftidMatch[1]);
  // Extract hex Place ID from !1s... pattern
  const hexMatch = input.match(/!1s(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/);
  if (hexMatch) return hexMatch[1] + ":" + hexMatch[2];
  // Extract from /place/XXX/ pattern
  const idMatch = input.match(/place_id[:=]([^&]+)/) || input.match(/\/place\/[^/]+\/[^/]+\/([^/?]+)/);
  if (idMatch) return idMatch[1];
  // Extract ChIJ pattern
  const chijMatch = input.match(/(ChIJ[a-zA-Z0-9_-]{20,})/);
  if (chijMatch) return chijMatch[1];
  // If looks like an ID
  if (/^[A-Za-z0-9_-]{10,}$/.test(input.trim())) return input.trim();
  return "";
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function extractPDFText(buffer: Buffer): string {
  // Try UTF-8 first (works for modern PDFs with embedded text)
  const utf8 = buffer.toString("utf-8");
  // Extract text between BT/ET markers
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  const texts: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = btRegex.exec(utf8)) !== null) {
    const block = match[1]!;
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const txt = tjMatch[1]!.trim();
      if (txt.length > 1) texts.push(txt);
    }
  }

  // If BT/ET extraction found text, return it
  if (texts.length > 5) {
    return texts.join(" ").replace(/\s+/g, " ").trim();
  }

  // Fallback 1: try to find text in stream objects
  const streamRegex = /stream\s+([\s\S]*?)endstream/g;
  let streamMatch: RegExpExecArray | null;
  const streamTexts: string[] = [];
  while ((streamMatch = streamRegex.exec(utf8)) !== null) {
    const content = streamMatch[1]!;
    const readable = content.replace(/[^\x20-\x7E\xC0-\xFF\n\r\t]/g, " ")
      .replace(/\s+/g, " ").trim();
    if (readable.length > 10) streamTexts.push(readable.slice(0, 500));
  }
  if (streamTexts.length > 0) {
    return streamTexts.join("\n").slice(0, 6000);
  }

  // Fallback 2: remove non-printable chars
  const readable = utf8.replace(/[^\x20-\x7E\xC0-\xFF\n\r\t]/g, " ");
  const cleaned = readable.replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 6000);
}
