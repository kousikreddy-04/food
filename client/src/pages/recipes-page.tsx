import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/main-layout";
import { RecipeCard } from "@/components/recipe-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { RecipeWithMatch } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "match" | "name" | "ingredients";

export default function RecipesPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithMatch | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("match");
  
  // Fetch recipes
  const { 
    data: recipes = [], 
    isLoading 
  } = useQuery<RecipeWithMatch[]>({
    queryKey: ["/api/recipes"],
  });
  
  // Sort recipes based on selected option
  const sortedRecipes = [...recipes].sort((a, b) => {
    switch (sortBy) {
      case "match":
        return b.matchPercentage - a.matchPercentage;
      case "name":
        return a.name.localeCompare(b.name);
      case "ingredients":
        return a.ingredients.length - b.ingredients.length;
      default:
        return 0;
    }
  });
  
  // Handle recipe view
  const handleViewRecipe = (recipe: RecipeWithMatch) => {
    setSelectedRecipe(recipe);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Recipe List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Recipe Suggestions</CardTitle>
                <CardDescription>Based on your current food inventory</CardDescription>
              </div>
              <div>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Sort by Match %</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="ingredients">Sort by Ingredient Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : sortedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRecipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id}
                    recipe={recipe}
                    onView={handleViewRecipe}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipe suggestions available</h3>
                <p className="text-gray-600">Add more food items to get recipe suggestions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recipe Details Modal */}
      <Dialog open={selectedRecipe !== null} onOpenChange={() => setSelectedRecipe(null)}>
        {selectedRecipe && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{selectedRecipe.name}</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {selectedRecipe.description || "A delicious recipe to try"}
              </DialogDescription>
            </DialogHeader>
            
            {selectedRecipe.imageUrl && (
              <div className="relative rounded-md overflow-hidden">
                <img 
                  src={selectedRecipe.imageUrl} 
                  alt={selectedRecipe.name} 
                  className="w-full h-56 object-cover"
                />
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Ingredients</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedRecipe.ingredients.map(ingredient => (
                    <li key={ingredient.id} className="text-gray-700">
                      {ingredient.name} {ingredient.amount && `(${ingredient.amount})`}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
                <p className="text-gray-700">{selectedRecipe.instructions || "No instructions provided."}</p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                <p className="text-sm font-medium text-green-800">
                  {selectedRecipe.matchPercentage}% match with your food inventory
                </p>
                {selectedRecipe.missingIngredients > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    You are missing {selectedRecipe.missingIngredients} ingredient(s)
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setSelectedRecipe(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </MainLayout>
  );
}
