import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Warn if API key is missing
 */
if (!process.env.GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set. AI features will not work.");
}

/**
 * Initialize Gemini client
 */
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "dummy_key"
);

/**
 * Safely extract JSON from Gemini responses
 * (handles ```json ... ``` and extra text)
 */
function extractJSON(text: string): any {
  // Remove markdown code fences
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: extract first JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No valid JSON found in Gemini response");
    }
    return JSON.parse(match[0]);
  }
}

/**
 * Identify food items from an image (Gemini)
 */
export async function identifyFoodFromImage(
  base64Image: string
): Promise<Array<{ name: string; category: string; confidence: number }>> {

  if (!process.env.GEMINI_API_KEY) {
    return [{
      name: "API Key Required",
      category: "unknown",
      confidence: 0
    }];
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          {
            text: `
You are a food identification assistant.

Analyze the image and return ONLY valid JSON in this format:
{
  "items": [
    {
      "name": "Food name",
      "category": "Fruit | Vegetable | Dairy | Meat | Bakery | Snack | Beverage | Frozen | Canned | Condiment | Other",
      "confidence": 0.0
    }
  ]
}

If no food is detected, return:
{ "items": [] }
            `
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            }
          }
        ]
      }
    ]);

    const text = result.response.text();
    const parsed = extractJSON(text);

    return parsed.items || [];

  } catch (error) {
    console.error("Error identifying food from image:", error);
    return [{
      name: "Error Identifying Food",
      category: "unknown",
      confidence: 0
    }];
  }
}

/**
 * Get recipe suggestions based on ingredients (Gemini)
 */
export async function getRecipeSuggestions(
  ingredients: string[],
  count: number = 3
): Promise<Array<{
  name: string;
  ingredients: string[];
  instructions: string;
  description: string;
}>> {

  if (!process.env.GEMINI_API_KEY) {
    return [{
      name: "API Key Required",
      ingredients: ["Please add GEMINI_API_KEY to use recipe suggestions"],
      instructions: "A Gemini API key is required to generate recipe suggestions.",
      description: "Add your Gemini API key to enable AI-powered recipes."
    }];
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a cooking assistant.

Using these ingredients:
${ingredients.join(", ")}

Suggest ${count} recipes.

Return ONLY valid JSON in this format:
{
  "recipes": [
    {
      "name": "Recipe name",
      "description": "Short description",
      "ingredients": ["item1", "item2"],
      "instructions": "Step-by-step instructions"
    }
  ]
}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = extractJSON(text);
    return parsed.recipes || [];

  } catch (error) {
    console.error("Error getting recipe suggestions:", error);
    return [{
      name: "Error Getting Suggestions",
      ingredients: ["Could not fetch recipe suggestions"],
      instructions: "There was an error connecting to the Gemini API.",
      description: "Error connecting to Gemini"
    }];
  }
}
