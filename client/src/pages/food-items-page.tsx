import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/main-layout";
import { FoodItemCard } from "@/components/food-item-card";
import { FoodItemModal } from "@/components/food-item-modal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FoodCategory, FoodItemWithDaysLeft, foodCategories } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function FoodItemsPage() {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<FoodItemWithDaysLeft | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch food items
  const { 
    data: foodItems = [], 
    isLoading,
    refetch: refetchFoodItems
  } = useQuery<FoodItemWithDaysLeft[]>({
    queryKey: ["/api/food-items"],
  });
  
  // Filter food items based on category and search term
  const filteredItems = foodItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expiring-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete food item",
        variant: "destructive",
      });
    }
  };
  
  // Category style mapping
  const categoryStyles: Record<string, string> = {
    all: "bg-primary text-white",
    dairy: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    meat: "bg-red-100 text-red-800 hover:bg-red-200",
    vegetables: "bg-green-100 text-green-800 hover:bg-green-200",
    fruits: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    grains: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    other: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Filter Bar */}
        <Card className="sticky top-0 z-10">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge 
                variant={selectedCategory === "all" ? "default" : "outline"}
                className={`px-3 py-1.5 cursor-pointer text-sm font-medium ${categoryStyles.all}`}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Badge>
              
              {foodCategories.map(category => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`
                    px-3 py-1.5 cursor-pointer text-sm font-medium capitalize
                    ${selectedCategory === category ? categoryStyles.all : categoryStyles[category]}
                  `}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            
            <Input
              placeholder="Search food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>
        
        {/* Food Items List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <FoodItemCard 
                key={item.id}
                item={item}
                onView={handleViewItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No food items found</h3>
            {selectedCategory !== "all" ? (
              <p className="text-gray-600">No items in the {selectedCategory} category</p>
            ) : searchTerm ? (
              <p className="text-gray-600">No items match your search for "{searchTerm}"</p>
            ) : (
              <p className="text-gray-600">Your food inventory is empty. Add some items!</p>
            )}
          </div>
        )}
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
