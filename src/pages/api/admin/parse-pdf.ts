/**
 * PDF parsing endpoint for admin
 * POST /api/admin/parse-pdf
 * Accepts multipart form with a PDF file
 * Returns structured gym data extracted by DeepSeek
 */
export async function POST({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return json({ error: "No PDF file provided" }, 400);
    }

    // Read PDF as text using basic extraction
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Simple PDF text extraction (works for text-based PDFs)
    let text = "";
    try {
      text = extractPDFText(buffer);
    } catch (e) {
      // If extraction fails, try reading as plain text
      text = buffer.toString("utf-8").slice(0, 8000);
    }

    if (!text || text.length < 20) {
      return json({ error: "Could not extract text from PDF" }, 400);
    }

    // Call DeepSeek to extract structured data
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return json({ error: "DeepSeek API key not configured" }, 500);
    }

    const systemPrompt = `Eres un extractor de datos para GymCat. Extrae información estructurada de gimnasios desde texto de PDF.

REGLAS:
- "name": nombre completo del gimnasio
- "address": dirección completa
- "phone": teléfono
- "website": web
- "description": descripción del gimnasio (máximo 300 caracteres)
- "monthly_price_low": precio mensual más bajo en euros (número)
- "monthly_price_high": precio mensual más alto (número)
- "matricula_fee": cuota de matrícula en euros (número, 0 si no hay)
- "annual_maintenance_fee": cuota de mantenimiento anual (número, 0 si no hay)
- "is_open_247": true si abre 24h
- "facilities": array de slugs de instalaciones. Slugs válidos: pesas, cardio, peso-libre, funcional, power-rack, piscina, spa, sauna, bano-turco, jacuzzi, clases-dirigidas, spinning, yoga, pilates, crossfit, boxeo, zumba, body-pump, parking, guarderia, cafeteria, toallas, taquillas, wifi, app, abierto-24h, acceso-ilimitado

Responde SOLO JSON válido. Sin markdown. Valores null para lo que no encuentres.`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text.slice(0, 10000) },
        ],
        temperature: 0,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return json({ error: "DeepSeek API error" }, 500);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const extracted = JSON.parse(content);

    return json({ success: true, data: extracted });

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

/** Basic PDF text extraction without external dependencies */
function extractPDFText(buffer: Buffer): string {
  const str = buffer.toString("latin1");
  const texts: string[] = [];

  // Find text between BT and ET markers
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  while ((match = btRegex.exec(str)) !== null) {
    const block = match[1];
    // Extract text within parentheses: (text) Tj
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      texts.push(tjMatch[1]);
    }
  }

  // Fallback: extract all readable text
  if (texts.length === 0) {
    const readable = str.replace(/[^\x20-\x7E\xC0-\xFF\n\r\t]/g, " ");
    return readable.replace(/\s+/g, " ").trim();
  }

  return texts.join(" ").replace(/\s+/g, " ").trim();
}
