
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const VIVID_WARM_PROMPT = `You are a CSS filter expert. Your task is to generate CSS filter values to replicate a cinematic filter inspired by iPhone's Vivid Warm style. This style increases color vibrancy, enriches warm tones, gently enhances contrast, and slightly reduces exposure for a moody yet natural look.

Respond with a JSON object containing a single key "filter" whose value is the CSS string.

Example response:
{
  "filter": "saturate(1.2) contrast(1.1) brightness(0.95) sepia(0.15) hue-rotate(-5deg)"
}

Do not add any other text, markdown, or explanations outside of the JSON object.`;

/**
 * Uses the Gemini API to generate a CSS filter string for the "Vivid Warm" effect.
 * @returns A promise that resolves to the CSS filter string.
 */
export async function getVividWarmFilterCss(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: VIVID_WARM_PROMPT,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            filter: {
              type: Type.STRING,
              description: "The CSS filter string to apply the vivid warm effect."
            }
          }
        },
        temperature: 0.5, // Encourage more consistent, less "creative" CSS values
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response.");
    }
    
    // The response is already validated by the schema, so we can parse it.
    const result = JSON.parse(jsonText);

    if (typeof result.filter === 'string' && result.filter.length > 0) {
      return result.filter;
    } else {
      throw new Error("Invalid or empty filter value in API response.");
    }

  } catch (error) {
    console.error("Error fetching CSS filter from Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while communicating with the Gemini API.");
  }
}
