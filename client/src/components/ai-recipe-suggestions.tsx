import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

type AIRecipe = {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
};

export function AIRecipeSuggestions() {
  const [activeTab, setActiveTab] = useState("0");
  
  const { 
    data: recipes = [], 
    isLoading, 
    error, 
    refetch,
    isFetching
  } = useQuery<AIRecipe[]>({
    queryKey: ["/api/ai-recipes"],
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Recipe Suggestions</CardTitle>
          <CardDescription>Generating custom recipes based on your ingredients...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Recipe Suggestions</CardTitle>
          <CardDescription>There was an error loading recipe suggestions</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-destructive mb-4">Failed to load AI recipe suggestions</p>
          <Button onClick={handleRefresh} variant="outline">Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (recipes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Recipe Suggestions</CardTitle>
          <CardDescription>Add some food items to get personalized recipe suggestions!</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">No recipes available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>AI Recipe Suggestions</CardTitle>
          <CardDescription>
            Smart recipe ideas based on ingredients you have
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            {recipes.map((_, index) => (
              <TabsTrigger
                key={index}
                value={index.toString()}
                className="flex-1"
              >
                Recipe {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {recipes.map((recipe, index) => (
            <TabsContent key={index} value={index.toString()}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{recipe.name}</h3>
                  <p className="text-sm text-muted-foreground">{recipe.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Ingredients</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {recipe.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="text-sm">{ingredient}</li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <p className="text-sm whitespace-pre-line">{recipe.instructions}</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}