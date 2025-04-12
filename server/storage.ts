import { 
  User, InsertUser, FoodItem, InsertFoodItem, 
  Recipe, Ingredient, foodCategories
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Mock recipes and ingredients data
const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: "Chicken Pasta",
    description: "A delicious pasta dish with chicken and vegetables",
    imageUrl: "https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructions: "1. Cook pasta according to package instructions. 2. Sauté chicken until fully cooked. 3. Add vegetables and sauce. 4. Mix in pasta and serve."
  },
  {
    id: 2,
    name: "Vegetable Stir Fry",
    description: "A healthy stir fry with fresh vegetables",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructions: "1. Heat oil in a pan. 2. Add vegetables and stir fry for 5 minutes. 3. Add sauce and continue cooking for 2 minutes. 4. Serve over rice."
  },
  {
    id: 3,
    name: "Fruit Smoothie",
    description: "A refreshing smoothie with fresh fruits",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructions: "1. Add all fruits to a blender. 2. Add yogurt and milk. 3. Blend until smooth. 4. Serve immediately."
  },
  {
    id: 4,
    name: "Vegetable Soup",
    description: "A hearty vegetable soup",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructions: "1. Sauté onions and garlic. 2. Add vegetables and broth. 3. Simmer for 20 minutes. 4. Season and serve."
  },
  {
    id: 5,
    name: "Rice Bowl",
    description: "A nutritious rice bowl with vegetables and protein",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    instructions: "1. Cook rice according to package instructions. 2. Prepare vegetables and protein. 3. Assemble bowl with rice, vegetables, and protein. 4. Add sauce and serve."
  }
];

const mockIngredients: Ingredient[] = [
  { id: 1, recipeId: 1, name: "Pasta", amount: "200g", category: "grains" },
  { id: 2, recipeId: 1, name: "Chicken", amount: "300g", category: "meat" },
  { id: 3, recipeId: 1, name: "Bell Peppers", amount: "1", category: "vegetables" },
  { id: 4, recipeId: 1, name: "Onion", amount: "1", category: "vegetables" },
  { id: 5, recipeId: 1, name: "Garlic", amount: "2 cloves", category: "vegetables" },
  { id: 6, recipeId: 1, name: "Tomato Sauce", amount: "200ml", category: "other" },
  { id: 7, recipeId: 1, name: "Olive Oil", amount: "2 tbsp", category: "other" },
  { id: 8, recipeId: 1, name: "Salt", amount: "to taste", category: "other" },
  
  { id: 9, recipeId: 2, name: "Broccoli", amount: "1 head", category: "vegetables" },
  { id: 10, recipeId: 2, name: "Carrots", amount: "2", category: "vegetables" },
  { id: 11, recipeId: 2, name: "Bell Peppers", amount: "2", category: "vegetables" },
  { id: 12, recipeId: 2, name: "Onion", amount: "1", category: "vegetables" },
  { id: 13, recipeId: 2, name: "Garlic", amount: "3 cloves", category: "vegetables" },
  { id: 14, recipeId: 2, name: "Soy Sauce", amount: "3 tbsp", category: "other" },
  { id: 15, recipeId: 2, name: "Vegetable Oil", amount: "2 tbsp", category: "other" },
  
  { id: 16, recipeId: 3, name: "Banana", amount: "1", category: "fruits" },
  { id: 17, recipeId: 3, name: "Strawberries", amount: "100g", category: "fruits" },
  { id: 18, recipeId: 3, name: "Blueberries", amount: "50g", category: "fruits" },
  { id: 19, recipeId: 3, name: "Yogurt", amount: "100g", category: "dairy" },
  { id: 20, recipeId: 3, name: "Milk", amount: "200ml", category: "dairy" },
  
  { id: 21, recipeId: 4, name: "Carrots", amount: "2", category: "vegetables" },
  { id: 22, recipeId: 4, name: "Celery", amount: "2 stalks", category: "vegetables" },
  { id: 23, recipeId: 4, name: "Onion", amount: "1", category: "vegetables" },
  { id: 24, recipeId: 4, name: "Garlic", amount: "2 cloves", category: "vegetables" },
  { id: 25, recipeId: 4, name: "Potatoes", amount: "2", category: "vegetables" },
  { id: 26, recipeId: 4, name: "Vegetable Broth", amount: "1L", category: "other" },
  { id: 27, recipeId: 4, name: "Olive Oil", amount: "2 tbsp", category: "other" },
  { id: 28, recipeId: 4, name: "Herbs", amount: "to taste", category: "other" },
  { id: 29, recipeId: 4, name: "Salt", amount: "to taste", category: "other" },
  
  { id: 30, recipeId: 5, name: "Rice", amount: "200g", category: "grains" },
  { id: 31, recipeId: 5, name: "Avocado", amount: "1", category: "vegetables" },
  { id: 32, recipeId: 5, name: "Cucumber", amount: "1", category: "vegetables" },
  { id: 33, recipeId: 5, name: "Carrots", amount: "1", category: "vegetables" },
  { id: 34, recipeId: 5, name: "Eggs", amount: "2", category: "other" },
  { id: 35, recipeId: 5, name: "Soy Sauce", amount: "2 tbsp", category: "other" }
];

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getFoodItems(userId: number): Promise<FoodItem[]>;
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  createFoodItem(foodItem: InsertFoodItem & { userId: number }): Promise<FoodItem>;
  deleteFoodItem(id: number): Promise<void>;
  
  getRecipes(): Promise<Recipe[]>;
  getRecipeIngredients(recipeId: number): Promise<Ingredient[]>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foodItems: Map<number, FoodItem>;
  private recipes: Recipe[];
  private ingredients: Ingredient[];
  
  currentUserId: number;
  currentFoodItemId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.foodItems = new Map();
    this.recipes = [...mockRecipes];
    this.ingredients = [...mockIngredients];
    
    this.currentUserId = 1;
    this.currentFoodItemId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 1 day in ms
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      name: insertUser.name ?? null
    } as User;
    this.users.set(id, user);
    return user;
  }

  async getFoodItems(userId: number): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(foodItem: InsertFoodItem & { userId: number }): Promise<FoodItem> {
    const id = this.currentFoodItemId++;
    const newItem = {
      ...foodItem,
      id,
      createdAt: new Date(),
      image: foodItem.image ?? null
    } as FoodItem;
    this.foodItems.set(id, newItem);
    return newItem;
  }

  async deleteFoodItem(id: number): Promise<void> {
    this.foodItems.delete(id);
  }

  async getRecipes(): Promise<Recipe[]> {
    return this.recipes;
  }

  async getRecipeIngredients(recipeId: number): Promise<Ingredient[]> {
    return this.ingredients.filter(ingredient => ingredient.recipeId === recipeId);
  }
}

export const storage = new MemStorage();
