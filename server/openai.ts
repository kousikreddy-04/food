import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY is not set. AI features will not work.");
}

// Initialize the OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy_key"
});

/**
 * Identify food items from an image
 */
export async function identifyFoodFromImage(
  base64Image: string
): Promise<Array<{name: string; category: string; confidence: number}>> {
  if (!process.env.OPENAI_API_KEY) {
    return [{
      name: "API Key Required",
      category: "unknown",
      confidence: 0
    }];
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a helpful food identification assistant. Analyze the food image and identify what food items are present. 
          Return ONLY a JSON object with the following format:
          {
            "items": [
              {
                "name": "The name of the food item",
                "category": "The category (Fruit, Vegetable, Dairy, Meat, Bakery, Snack, Beverage, Frozen, Canned, Condiment, or Other)",
                "confidence": A number between 0 and 1 representing your confidence in this identification
              }
            ]
          }
          Only identify major food items visible in the image. If you can't identify any food items, return an empty array.`
        },
        {
          role: "user",
          content: [
            {
              type: "text", 
              text: "What food items do you see in this image?"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || null;
    
    if (content) {
      const result = JSON.parse(content);
      return result.items || [];
    }
    
    return [];
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
 * Get recipe suggestions based on a list of ingredients
 */
export async function getRecipeSuggestions(
  ingredients: string[], 
  count: number = 3
): Promise<Array<{name: string; ingredients: string[]; instructions: string; description: string;}>> {
  if (!process.env.OPENAI_API_KEY) {
    return [
      {
        name: "API Key Required",
        ingredients: ["Please add OPENAI_API_KEY to use recipe suggestions"],
        instructions: "An OpenAI API key is required to generate recipe suggestions.",
        description: "Add your OpenAI API key to enable AI-powered recipe suggestions."
      }
    ];
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a helpful cooking assistant. Based on the provided ingredients, suggest ${count} creative recipes. Return ONLY a JSON array of recipes with the following format for each recipe:
          {
            "name": "Recipe Name",
            "description": "Brief description of the recipe",
            "ingredients": ["Ingredient 1", "Ingredient 2", ...],
            "instructions": "Step by step cooking instructions"
          }`,
        },
        {
          role: "user",
          content: `I have these ingredients: ${ingredients.join(", ")}. Please suggest ${count} recipes I can make.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || null;
    
    if (content) {
      const result = JSON.parse(content);
      return result.recipes || [];
    }
    
    return [];
  } catch (error) {
    console.error("Error getting recipe suggestions:", error);
    return [{
      name: "Error Getting Suggestions",
      ingredients: ["Could not fetch recipe suggestions"],
      instructions: "There was an error connecting to the AI service. Please try again later.",
      description: "Error connecting to OpenAI API"
    }];
  }
}