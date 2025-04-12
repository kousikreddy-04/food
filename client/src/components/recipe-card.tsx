import { RecipeWithMatch } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useState } from "react";

interface RecipeCardProps {
  recipe: RecipeWithMatch;
  onView: (recipe: RecipeWithMatch) => void;
}

export function RecipeCard({ recipe, onView }: RecipeCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  
  // Get match percentage badge color
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <Card className="overflow-hidden border border-gray-200 bg-gray-50">
      <div className="relative">
        <img 
          src={recipe.imageUrl || "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"} 
          alt={recipe.name} 
          className="w-full h-44 object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${getMatchColor(recipe.matchPercentage)}`}
        >
          {recipe.matchPercentage}% match
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-gray-900">{recipe.name}</h3>
        
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <span className="mr-1">🍽️</span>
          {recipe.ingredients.length === 0 ? (
            <span>No ingredients specified</span>
          ) : recipe.missingIngredients === 0 ? (
            <span>All {recipe.ingredients.length} ingredients available</span>
          ) : (
            <span>
              {recipe.ingredients.length} ingredients ({recipe.missingIngredients} missing)
            </span>
          )}
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button 
            className="flex-1"
            onClick={() => onView(recipe)}
          >
            View Recipe
          </Button>
          
          <Button 
            variant={isSaved ? "default" : "outline"}
            className={isSaved ? "bg-primary text-white" : "text-primary"}
            size="icon"
            onClick={() => setIsSaved(!isSaved)}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
