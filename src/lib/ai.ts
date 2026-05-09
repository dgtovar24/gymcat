/**
 * DeepSeek AI client for structured data extraction and summarization.
 *
 * Used for:
 * 1. Parsing raw gym HTML into structured JSON (prices, facilities, hours)
 * 2. Summarizing Google Maps reviews into pros/cons
 * 3. Generating SEO-friendly descriptions
 */

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

export class DeepSeekClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || "";
    if (!this.apiKey) {
      throw new Error(
        "DEEPSEEK_API_KEY is required. Set it in .env or pass to constructor.",
      );
    }
  }

  /**
   * Send a chat completion request to DeepSeek.
   */
  async chat(
    messages: DeepSeekMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      responseFormat?: { type: "json_object" };
    },
  ): Promise<string> {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || "deepseek-v4-pro",
        messages,
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.maxTokens ?? 4096,
        response_format: options?.responseFormat,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  /**
   * Extract structured data from unstructured text using a JSON Schema prompt.
   */
  async extractJSON<T>(
    systemPrompt: string,
    inputText: string,
    jsonSchema: object,
  ): Promise<T> {
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: `${systemPrompt}\n\nYou MUST respond with valid JSON that conforms to this schema:\n${JSON.stringify(jsonSchema, null, 2)}`,
      },
      { role: "user", content: inputText },
    ];

    const raw = await this.chat(messages, {
      responseFormat: { type: "json_object" },
      temperature: 0.1,
    });

    try {
      // Strip markdown code fences if present
      const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(clean) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse AI response as JSON.\nRaw: ${raw.slice(0, 500)}`,
      );
    }
  }
}

// Singleton instance (lazy)
let client: DeepSeekClient | null = null;

export function getAIClient(): DeepSeekClient {
  if (!client) {
    client = new DeepSeekClient();
  }
  return client;
}
