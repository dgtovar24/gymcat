/**
 * AI Parsing Pipeline — Prompt templates and JSON Schemas.
 *
 * Converts raw HTML/text from gym websites into structured data
 * using DeepSeek with strict JSON Schema validation.
 */

import { getAIClient } from "@lib/ai";

// ==========================================================================
// JSON Schemas for AI Extraction
// ==========================================================================

/** Expected output structure for gym price extraction. */
export const GYM_EXTRACTION_SCHEMA = {
  type: "object",
  required: ["gym_name", "prices", "facilities", "raw_confidence"],
  properties: {
    gym_name: {
      type: "string",
      description: "Full name of the gym as it appears on the website",
    },
    address: {
      type: "string",
      description: "Full street address",
    },
    city: {
      type: "string",
      description: "City name (e.g., Barcelona, Terrassa)",
    },
    phone: {
      type: "string",
      description: "Phone number if found",
    },
    website: {
      type: "string",
      description: "Official website URL of this specific gym",
    },
    prices: {
      type: "array",
      description: "List of all pricing plans found",
      items: {
        type: "object",
        required: ["type", "amount"],
        properties: {
          type: {
            type: "string",
            enum: ["matricula", "monthly", "annual_maintenance", "penalty", "additional"],
            description: "Type of fee",
          },
          label: {
            type: "string",
            description:
              'Plan name (e.g., "Standard", "Premium", "Estudiante")',
          },
          amount: {
            type: "number",
            description: "Price in EUR (numeric only, no currency symbols)",
            minimum: 0,
            maximum: 1000,
          },
          currency: {
            type: "string",
            default: "EUR",
          },
          conditions: {
            type: "string",
            description:
              'Any conditions (e.g., "Permanencia 12 meses", "Sin permanencia")',
          },
        },
      },
    },
    facilities: {
      type: "array",
      description: "List of detected facilities/amenities",
      items: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            description: "Facility name in Spanish (e.g., Piscina, Sauna)",
          },
          category: {
            type: "string",
            enum: ["cardio", "strength", "wellness", "classes", "services", "access"],
          },
        },
      },
    },
    opening_hours: {
      type: "object",
      description: "Opening hours per day",
      properties: {
        is_24h: {
          type: "boolean",
        },
        monday: { type: "string" },
        tuesday: { type: "string" },
        wednesday: { type: "string" },
        thursday: { type: "string" },
        friday: { type: "string" },
        saturday: { type: "string" },
        sunday: { type: "string" },
      },
    },
    raw_confidence: {
      type: "number",
      description: "How confident the AI is in the extraction (0-1)",
      minimum: 0,
      maximum: 1,
    },
    notes: {
      type: "string",
      description: "Any important notes about the data quality or missing info",
    },
  },
};

/** Expected output for review summarization. */
export const REVIEW_SUMMARY_SCHEMA = {
  type: "object",
  required: ["top_pros", "top_cons", "common_topics", "overall_sentiment"],
  properties: {
    top_pros: {
      type: "array",
      description: "Top 5 most mentioned positive aspects",
      items: { type: "string" },
      maxItems: 5,
    },
    top_cons: {
      type: "array",
      description: "Top 5 most mentioned negative aspects",
      items: { type: "string" },
      maxItems: 5,
    },
    common_topics: {
      type: "array",
      items: {
        type: "object",
        required: ["topic", "count"],
        properties: {
          topic: { type: "string" },
          count: { type: "integer" },
        },
      },
      description: "Topics mentioned across reviews with frequency",
    },
    overall_sentiment: {
      type: "string",
      enum: ["positive", "negative", "neutral"],
      description: "Overall sentiment across all reviews",
    },
    estimated_rating: {
      type: "number",
      description: "Estimated rating out of 5 based on sentiment analysis",
      minimum: 1,
      maximum: 5,
    },
  },
};

// ==========================================================================
// Prompt Templates
// ==========================================================================

const GYM_EXTRACTION_PROMPT = `You are a precision data extraction AI for Gymcat, a gym comparison platform in Cataluña, Spain.

Your task: Extract structured pricing, facilities, and operational data from gym website HTML/text.

CRITICAL RULES:
1. Prices MUST be in EUR as plain numbers (e.g., 29.99 not "29,99€").
2. Never invent or guess missing data — mark confidence low or omit.
3. Monthly prices above 100€ are suspicious in Spain — flag in notes.
4. Look for hidden fees: matrícula (sign-up), mantenimiento anual (annual maintenance), penalizaciones (penalties).
5. Convert Spanish number format (29,99) to standard decimal (29.99).
6. Detect if pricing is "desde" (starting from) — mark the lowest tier.
7. Extract facilities from text mentions, lists, or icon descriptions.
8. For opening hours, detect if the gym advertises "24h" or "abierto 24 horas".

RESPOND WITH VALID JSON ONLY. No markdown, no explanations.`;

const REVIEW_SUMMARY_PROMPT = `You are a review analysis AI for Gymcat. Summarize gym reviews into structured pros, cons, and topics.

Rules:
- Extract the most frequently mentioned positive AND negative points.
- Group similar complaints into single topics (e.g., "machines often broken" and "maintenance issues" → "Equipment maintenance")
- Output in Spanish (the platform language).
- Be critical and honest — don't sugarcoat.

RESPOND WITH VALID JSON ONLY.`;

// ==========================================================================
// Extraction Functions
// ==========================================================================

export interface GymExtractionResult {
  gym_name: string;
  address?: string;
  city?: string;
  phone?: string;
  website?: string;
  prices: {
    type: "matricula" | "monthly" | "annual_maintenance" | "penalty" | "additional";
    label?: string;
    amount: number;
    currency?: string;
    conditions?: string;
  }[];
  facilities: {
    name: string;
    category?: string;
  }[];
  opening_hours?: {
    is_24h?: boolean;
    [day: string]: string | boolean | undefined;
  };
  raw_confidence: number;
  notes?: string;
}

/**
 * Extract structured gym data from raw HTML/text using DeepSeek.
 */
export async function extractGymData(
  htmlOrText: string,
  sourceUrl?: string,
): Promise<GymExtractionResult> {
  const ai = getAIClient();

  // Add source URL context if available
  const input = sourceUrl
    ? `SOURCE URL: ${sourceUrl}\n\nRAW CONTENT:\n${htmlOrText.slice(0, 8000)}`
    : htmlOrText.slice(0, 8000);

  const result = await ai.extractJSON<GymExtractionResult>(
    GYM_EXTRACTION_PROMPT,
    input,
    GYM_EXTRACTION_SCHEMA,
  );

  // Validate pricing sanity
  validatePricingSanity(result);

  return result;
}

/**
 * Extract pros/cons/topics from a batch of reviews.
 */
export async function summarizeReviews(
  reviews: string[],
): Promise<{
  top_pros: string[];
  top_cons: string[];
  common_topics: { topic: string; count: number }[];
  overall_sentiment: "positive" | "negative" | "neutral";
  estimated_rating: number;
}> {
  const ai = getAIClient();
  const input = reviews.join("\n---\n").slice(0, 12000);

  return ai.extractJSON(REVIEW_SUMMARY_PROMPT, input, REVIEW_SUMMARY_SCHEMA);
}

/**
 * Validate extracted pricing against sanity thresholds.
 * Flags suspicious values for manual review.
 */
function validatePricingSanity(result: GymExtractionResult): void {
  const WARN_THRESHOLDS = {
    monthly_low: 10, // Below 10€/month is suspicious
    monthly_high: 120, // Above 120€/month is premium (possible but flag)
    matricula_high: 200, // Sign-up fee above 200€ is unusual
  };

  for (const price of result.prices) {
    if (price.type === "monthly") {
      if (price.amount < WARN_THRESHOLDS.monthly_low) {
        result.notes = (result.notes || "") +
          `⚠️ ALERTA: Precio mensual sospechosamente bajo (${price.amount}€) — ¿Error de extracción? `;
        result.raw_confidence = Math.min(result.raw_confidence, 0.5);
      }
      if (price.amount > WARN_THRESHOLDS.monthly_high) {
        result.notes = (result.notes || "") +
          `⚠️ Precio premium (${price.amount}€) — verificar si es correcto. `;
      }
    }
    if (price.type === "matricula" && price.amount > WARN_THRESHOLDS.matricula_high) {
      result.notes = (result.notes || "") +
        `⚠️ Matrícula alta (${price.amount}€) — verificar si incluye extras. `;
    }
  }
}
