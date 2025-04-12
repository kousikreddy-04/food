import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertFoodItemSchema, FoodItem } from "@shared/schema";
import { format, differenceInDays } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to ensure user is authenticated
  const ensureAuth = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Food Items API
  app.get("/api/food-items", ensureAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const foodItems = await storage.getFoodItems(userId);
      
      // Add daysLeft property to each food item
      const itemsWithDaysLeft = foodItems.map(item => {
        const expiryDate = new Date(item.expiryDate);
        const daysLeft = differenceInDays(expiryDate, new Date());
        return { ...item, daysLeft };
      });
      
      res.json(itemsWithDaysLeft);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  app.post("/api/food-items", ensureAuth, async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.parse(req.body);
      const userId = req.user!.id;
      
      const foodItem = await storage.createFoodItem({
        ...validatedData,
        userId
      });
      
      res.status(201).json(foodItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create food item" });
      }
    }
  });

  app.delete("/api/food-items/:id", ensureAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const foodItem = await storage.getFoodItem(id);
      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }
      
      if (foodItem.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteFoodItem(id);
      res.status(200).json({ message: "Food item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });

  // Expiring Items API
  app.get("/api/expiring-items", ensureAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const foodItems = await storage.getFoodItems(userId);
      
      const now = new Date();
      const expiringItems = foodItems
        .map(item => {
          const expiryDate = new Date(item.expiryDate);
          const daysLeft = differenceInDays(expiryDate, now);
          return { ...item, daysLeft };
        })
        .filter(item => item.daysLeft <= 7)
        .sort((a, b) => a.daysLeft - b.daysLeft);
      
      res.json(expiringItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expiring items" });
    }
  });

  // Recipes API
  app.get("/api/recipes", ensureAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const foodItems = await storage.getFoodItems(userId);
      const recipes = await storage.getRecipes();
      
      // Get ingredients for each recipe
      const recipesWithIngredients = await Promise.all(
        recipes.map(async (recipe) => {
          const ingredients = await storage.getRecipeIngredients(recipe.id);
          return { ...recipe, ingredients };
        })
      );
      
      // Calculate match percentage based on available food items
      const foodCategories = foodItems.map(item => item.category);
      const recipesWithMatch = recipesWithIngredients.map(recipe => {
        const totalIngredients = recipe.ingredients.length;
        if (totalIngredients === 0) return { ...recipe, matchPercentage: 0, missingIngredients: 0 };
        
        const matchingIngredients = recipe.ingredients.filter(
          ingredient => foodCategories.includes(ingredient.category as any)
        );
        
        const matchPercentage = Math.round((matchingIngredients.length / totalIngredients) * 100);
        const missingIngredients = totalIngredients - matchingIngredients.length;
        
        return {
          ...recipe,
          matchPercentage,
          missingIngredients
        };
      });
      
      // Sort by match percentage (descending)
      const sortedRecipes = recipesWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);
      
      res.json(sortedRecipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  // Notifications API
  app.get("/api/notifications", ensureAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const foodItems = await storage.getFoodItems(userId);
      
      const now = new Date();
      const notifications = [];
      let notificationId = 1;
      
      for (const item of foodItems) {
        const expiryDate = new Date(item.expiryDate);
        const daysLeft = differenceInDays(expiryDate, now);
        
        if (daysLeft <= 3 && daysLeft >= 0) {
          notifications.push({
            id: notificationId++,
            itemId: item.id,
            message: `${item.name} expires in ${daysLeft} days`,
            type: "threeDays",
            createdAt: new Date()
          });
        } else if (daysLeft <= 7 && daysLeft > 3) {
          notifications.push({
            id: notificationId++,
            itemId: item.id,
            message: `${item.name} expires in ${daysLeft} days`,
            type: "week",
            createdAt: new Date()
          });
        }
      }
      
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // AI Recipe Suggestions API
  app.get("/api/ai-recipes", ensureAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const foodItems = await storage.getFoodItems(userId);
      
      // Filter out medicines
      const nonMedicineItems = foodItems.filter(item => item.category !== 'medicines');
      
      // Get ingredient names for AI suggestions
      const ingredientNames = nonMedicineItems.map(item => item.name);
      
      // Import the OpenAI function here to avoid circular dependencies
      const { getRecipeSuggestions } = await import("./openai");
      
      // Get AI-generated recipe suggestions
      const recipes = await getRecipeSuggestions(ingredientNames);
      
      res.json(recipes);
    } catch (error) {
      console.error("Error getting AI recipe suggestions:", error);
      res.status(500).json({ message: "Failed to get AI recipe suggestions" });
    }
  });

  // Medicines API
  app.get("/api/medicines", ensureAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const allItems = await storage.getFoodItems(userId);
      
      // Filter only medicines
      const medicines = allItems
        .filter(item => item.category === 'medicines')
        .map(item => {
          const expiryDate = new Date(item.expiryDate);
          const daysLeft = differenceInDays(expiryDate, new Date());
          
          return {
            ...item,
            daysLeft
          };
        });
      
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medicines" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
