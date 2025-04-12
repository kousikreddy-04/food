import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/main-layout";
import { DashboardSummary } from "@/components/dashboard-summary";
import { ExpiringItems } from "@/components/expiring-items";
import { RecipeSuggestions } from "@/components/recipe-suggestions";
import { FoodItemModal } from "@/components/food-item-modal";
import { apiRequest } from "@/lib/queryClient";
import { FoodItemWithDaysLeft, RecipeWithMatch } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<FoodItemWithDaysLeft | null>(null);
  
  // Fetch food items
  const { 
    data: foodItems = [], 
    isLoading: isLoadingFoodItems,
    refetch: refetchFoodItems 
  } = useQuery<FoodItemWithDaysLeft[]>({
    queryKey: ["/api/food-items"],
  });
  
  // Fetch expiring items
  const { 
    data: expiringItems = [],
    isLoading: isLoadingExpiringItems
  } = useQuery<FoodItemWithDaysLeft[]>({
    queryKey: ["/api/expiring-items"],
  });
  
  // Fetch recipe suggestions
  const { 
    data: recipes = [],
    isLoading: isLoadingRecipes
  } = useQuery<RecipeWithMatch[]>({
    queryKey: ["/api/recipes"],
  });
  
  // Handle food item view
  const handleViewItem = (item: FoodItemWithDaysLeft) => {
    setSelectedItem(item);
  };
  
  // Handle food item deletion
  const handleDeleteItem = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/food-items/${id}`);
      toast({
        title: "Item deleted",
        description: "Food item has been successfully deleted",
      });
      refetchFoodItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete food item",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Dashboard Summary */}
        <DashboardSummary 
          foodItems={foodItems} 
          isLoading={isLoadingFoodItems} 
        />
        
        {/* Expiring Items */}
        <ExpiringItems 
          items={expiringItems} 
          isLoading={isLoadingExpiringItems}
          onViewItem={handleViewItem}
        />
        
        {/* Recipe Suggestions */}
        <RecipeSuggestions 
          recipes={recipes} 
          isLoading={isLoadingRecipes} 
        />
      </div>
      
      {/* Food Item Details Modal */}
      <FoodItemModal 
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onDelete={handleDeleteItem}
      />
    </MainLayout>
  );
}
