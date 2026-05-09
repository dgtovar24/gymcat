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
    const gmapsKey = getS("google_maps_api_key") || process.env.GOOGLE_MAPS_API_KEY || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.GOOGLE_MAPS_API_KEY : '');
    const placeId = placeIdFromForm || getS("google_place_id") || "";

    const apiKey = process.env.DEEPSEEK_API_KEY || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.DEEPSEEK_API_KEY : '');
    if (!apiKey) {
      return json({ error: "DeepSeek API key not configured" }, 500);
    }

    let pdfText = "";
    let reviewText = "";
    let webText = "";

    // 1. Extract PDF text
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      pdfText = extractPDFText(buffer);
      // If PDF text looks like binary garbage, discard it
      if (pdfText && isBinaryGarbage(pdfText)) {
        pdfText = "";
      }
    }

    // 2. Scrape websites for text using ScrapingBee (renders JavaScript)
    const websiteUrl = formData.get("website_url")?.toString() || "";
    const urlsToScrape = websiteUrl ? websiteUrl.split("\n").filter(Boolean) : [];
    const webTexts: string[] = [];
    const scrapingBeeKey = process.env.SCRAPINGBEE_API_KEY || "";
    for (const url of urlsToScrape.slice(0, 3)) {
      try {
        let html = "";
        if (scrapingBeeKey) {
          const sbUrl = `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeKey}&url=${encodeURIComponent(url.trim())}&render_js=true&wait=3000&premium_proxy=true&country_code=es`;
          const sbRes = await fetch(sbUrl, { signal: AbortSignal.timeout(20000) });
          html = await sbRes.text();
        } else {
          const webRes = await fetch(url.trim(), {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GymCat/1.0)" },
            signal: AbortSignal.timeout(8000),
          });
          html = await webRes.text();
        }
        html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                   .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                   .replace(/<[^>]+>/g, " ")
                   .replace(/\s+/g, " ")
                   .slice(0, 6000);
        if (html.length > 50) webTexts.push(`[${url}]\n${html}`);
      } catch {}
    }
    if (webTexts.length > 0) webText = webTexts.join("\n\n");

    // 3. Fetch Google Maps reviews if API key is configured
    if (gmapsKey && (gymName || placeId)) {
      try {
        let pid = placeId;
        // Always try to find by name first (more reliable than URL extraction)
        if (gymName) {
          const searchRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(gymName + " " + gymAddress + " gimnasio barcelona")}&inputtype=textquery&fields=place_id,formatted_address,name&key=${gmapsKey}`
          );
          const searchData = await searchRes.json();
          if (searchData.candidates?.length > 0) {
            pid = searchData.candidates[0].place_id;
            // Use the found name/address if not already set
            if (!gymAddress && searchData.candidates[0].formatted_address) {
              // Store in closure for later use
            }
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

    // 4. Call DeepSeek to extract structured data
    const sources = [];
    if (pdfText) sources.push("PDF del gimnasio");
    if (webText) sources.push("web del gimnasio");
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
      pdfText ? `CONTENIDO DEL PDF:\n${pdfText.slice(0, 4000)}` : "",
      webText ? `CONTENIDO DE LA WEB:\n${webText.slice(0, 4000)}` : "",
      reviewText ? `RESEÑAS DE GOOGLE MAPS:\n${reviewText.slice(0, 4000)}` : "",
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
        webChars: webText.length,
        webSample: webText.slice(0, 500),
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

function isBinaryGarbage(text: string): boolean {
  // If >30% of chars are non-printable, it's binary garbage
  const nonPrintable = text.replace(/[\x20-\x7E\xC0-\xFF\n\r\t ]/g, "").length;
  return text.length > 0 && nonPrintable / text.length > 0.3;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function extractPDFText(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  const texts: string[] = [];

  // Find all stream objects and try to decompress FlateDecode
  const streamRegex = /\/Filter\s*\/FlateDecode[\s\S]*?stream\s*\r?\n([\s\S]*?)endstream/g;
  let match: RegExpExecArray | null;
  while ((match = streamRegex.exec(raw)) !== null) {
    try {
      const compressed = Buffer.from(match[1]!, "latin1");
      const decompressed = require("zlib").inflateSync(compressed).toString("utf-8");
      // Extract text between BT/ET
      const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
      let btMatch: RegExpExecArray | null;
      while ((btMatch = btRegex.exec(decompressed)) !== null) {
        const tjRegex = /\(([^)]*)\)\s*Tj/g;
        let tjMatch: RegExpExecArray | null;
        while ((tjMatch = tjRegex.exec(btMatch[1]!)) !== null) {
          const txt = tjMatch[1]!.trim();
          if (txt.length > 1 && !/^[\\\/\[\]<>]+$/.test(txt)) texts.push(txt);
        }
      }
      // Also try TJ arrays
      const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
      let tjArrMatch: RegExpExecArray | null;
      while ((tjArrMatch = tjArrayRegex.exec(decompressed)) !== null) {
        const strMatch = tjArrMatch[1]!.match(/\(([^)]*)\)/g);
        if (strMatch) {
          strMatch.forEach(s => {
            const t = s.slice(1, -1).trim();
            if (t.length > 1) texts.push(t);
          });
        }
      }
    } catch {}
  }

  // Also extract uncompressed BT/ET text
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  while ((match = btRegex.exec(raw)) !== null) {
    const block = match[1]!;
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const txt = tjMatch[1]!.trim();
      if (txt.length > 1) texts.push(txt);
    }
  }

  if (texts.length > 0) {
    return texts.join(" ").replace(/\s+/g, " ").trim();
  }

  return "";
}
