import { FoodItemWithDaysLeft } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

interface FoodItemCardProps {
  item: FoodItemWithDaysLeft;
  onView: (item: FoodItemWithDaysLeft) => void;
  onDelete: (id: number) => void;
}

// Get category styled badge
function getCategoryBadge(category: string) {
  const styles: Record<string, string> = {
    dairy: "bg-blue-500",
    meat: "bg-red-500",
    vegetables: "bg-green-500",
    fruits: "bg-purple-500",
    grains: "bg-yellow-500",
    other: "bg-gray-500"
  };
  
  return (
    <Badge className={`absolute top-0 right-0 mt-2 mr-2 ${styles[category]}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}

// Get days left badge
function getDaysLeftBadge(daysLeft: number) {
  let bgColor = "bg-green-600";
  
  if (daysLeft <= 0) {
    bgColor = "bg-gray-700";
  } else if (daysLeft <= 3) {
    bgColor = "bg-red-600";
  } else if (daysLeft <= 7) {
    bgColor = "bg-yellow-500";
  }
  
  return (
    <Badge className={`absolute bottom-0 left-0 mb-2 ml-2 ${bgColor}`}>
      {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
    </Badge>
  );
}

export function FoodItemCard({ item, onView, onDelete }: FoodItemCardProps) {
  // Placeholder image based on category
  const placeholderImages: Record<string, string> = {
    dairy: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    meat: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    vegetables: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    fruits: "https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    grains: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    other: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  };
  
  const imageUrl = item.image || placeholderImages[item.category];
  
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={item.name} 
          className="w-full h-48 object-cover"
        />
        {getCategoryBadge(item.category)}
        {getDaysLeftBadge(item.daysLeft)}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Expires: {format(new Date(item.expiryDate), "MMM dd, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button 
            size="sm"
            onClick={() => onView(item)}
          >
            View Details
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-400 hover:text-red-500"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
