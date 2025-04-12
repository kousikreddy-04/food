import { pgTable, text, serial, integer, boolean, timestamp, varchar, date, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
});

export const foodCategories = [
  "dairy",
  "meat",
  "vegetables",
  "fruits",
  "grains",
  "other"
] as const;

export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category", { enum: foodCategories }).notNull(),
  manufactureDate: date("manufacture_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
  price: real("price").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  instructions: text("instructions"),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull(),
  name: text("name").notNull(),
  amount: text("amount"),
  category: text("category", { enum: foodCategories }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Login = z.infer<typeof loginSchema>;
export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type Ingredient = typeof ingredients.$inferSelect;
export type FoodCategory = typeof foodCategories[number];

// Extended types for frontend functionality
export type FoodItemWithDaysLeft = FoodItem & {
  daysLeft: number;
};

export type RecipeWithMatch = Recipe & {
  matchPercentage: number;
  ingredients: Ingredient[];
  missingIngredients: number;
};

export type NotificationType = "week" | "threeDays";

export type Notification = {
  id: number;
  itemId: number;
  message: string;
  type: NotificationType;
  createdAt: Date;
};
