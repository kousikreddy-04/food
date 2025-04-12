import { RecipeWithMatch } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useState } from "react";

interface RecipeSuggestionsProps {
  recipes: RecipeWithMatch[];
  isLoading: boolean;
}

export function RecipeSuggestions({ recipes, isLoading }: RecipeSuggestionsProps) {
  const [displayCount, setDisplayCount] = useState(3);
  
  // Sort recipes by match percentage (descending)
  const sortedRecipes = [...recipes].sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  // Get top recipes to display
  const displayedRecipes = sortedRecipes.slice(0, displayCount);
  
  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">Recipe Suggestions</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Based on your current food inventory</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-40" />
                <div className="p-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
            ))
          ) : displayedRecipes.length > 0 ? (
            displayedRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden border border-gray-200 bg-gray-50">
                {recipe.imageUrl && (
                  <div className="relative">
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.name} 
                      className="w-full h-40 object-cover"
                    />
                    <Badge 
                      className={`
                        absolute top-2 right-2 
                        ${recipe.matchPercentage >= 80 
                          ? 'bg-green-500' 
                          : recipe.matchPercentage >= 50 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }
                      `}
                    >
                      {recipe.matchPercentage}% match
                    </Badge>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{recipe.name}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    {recipe.missingIngredients === 0 ? (
                      <span>All ingredients available</span>
                    ) : (
                      <span>{recipe.missingIngredients} ingredient{recipe.missingIngredients !== 1 ? 's' : ''} missing</span>
                    )}
                  </div>
                  <Button className="mt-3 w-full">
                    View Recipe
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No recipe suggestions available</p>
              <p className="text-sm text-gray-400 mt-1">Add more food items to get recipe suggestions</p>
            </div>
          )}
        </div>
      </CardContent>
      
      {recipes.length > displayCount && (
        <CardFooter className="border-t border-gray-200 px-6 py-4">
          <Link to="/recipes" className="text-sm font-medium text-primary hover:text-primary-dark">
            View all recipe suggestions →
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
