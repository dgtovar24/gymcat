/**
 * AI-powered search endpoint
 * POST /api/search
 * Body: { query: string }
 * Response: { filters: { maxPrice, facilities, city, is24h, chain }, explanation: string, query: string }
 */
export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const query = (body.query || "").trim();
    if (!query) return json({ error: "Query required" }, 400);

    const apiKey = process.env.DEEPSEEK_API_KEY || (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEEPSEEK_API_KEY);
    if (!apiKey) {
      return json({ filters: {}, explanation: query, query, fallback: "no-api-key" });
    }

    const systemPrompt = `Eres un asistente que convierte consultas en español sobre gimnasios en filtros JSON.

Reglas:
- "maxPrice": número máximo en euros (ej: "menos de 40€" → 40)
- "facilities": array de slugs de instalaciones mencionadas. Slugs válidos: piscina, sauna, spa, crossfit, parking, spinning, yoga, pilates, zumba, boxeo, guarderia, cafeteria, wifi, clases-dirigidas, peso-libre, cardio, pesas, funcional, power-rack, bano-turco, jacuzzi, toallas, taquillas, app, abierto-24h
- "city": nombre de ciudad (ej: Barcelona, Terrassa)
- "is24h": true solo si menciona "24h", "24 horas", "abierto 24h", "todo el día", "madrugada"
- "chain": nombre de cadena (Basic-Fit, VivaGym, DIR, McFit, AltaFit, Eurofitness, Holmes Place, Metropolitan, Snap Fitness)
- "sortBy": "price_asc" (más barato) o "price_desc" (más caro)
- "explanation": breve resumen de lo que se buscó (ej: "Piscina hasta 40€ en Barcelona")

Responde SOLO JSON válido. Sin markdown.`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        temperature: 0,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return json({ filters: {}, explanation: query, query, fallback: "api-error" });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let filters: any;
    try {
      filters = JSON.parse(content);
    } catch {
      return json({ filters: {}, explanation: query, query, fallback: "parse-error" });
    }

    return json({ filters, explanation: filters.explanation || query, query });

  } catch (_error) {
    return json({ filters: {}, explanation: "", query: "", fallback: "error" });
  }
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
