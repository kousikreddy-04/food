import { useState } from "react";
import { FoodItemWithDaysLeft } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";

interface ExpiringItemsProps {
  items: FoodItemWithDaysLeft[];
  isLoading: boolean;
  onViewItem: (item: FoodItemWithDaysLeft) => void;
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    dairy: "🥛",
    meat: "🥩",
    vegetables: "🥦",
    fruits: "🍎",
    grains: "🌾",
    other: "🍽️"
  };
  
  return icons[category] || "🍽️";
}

export function ExpiringItems({ items, isLoading, onViewItem }: ExpiringItemsProps) {
  const [displayCount, setDisplayCount] = useState(5);
  
  // Sort items by days left (ascending)
  const sortedItems = [...items].sort((a, b) => a.daysLeft - b.daysLeft);
  
  // Get items to display
  const displayedItems = sortedItems.slice(0, displayCount);
  
  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">Expiring Soon</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 divide-y divide-gray-200">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-2" />
                </div>
              </div>
              <div className="flex items-center">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 ml-4 rounded-full" />
              </div>
            </div>
          ))
        ) : displayedItems.length > 0 ? (
          displayedItems.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">{getCategoryIcon(item.category)}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Badge 
                  variant="outline" 
                  className={`
                    ${item.daysLeft <= 3 
                      ? 'bg-red-100 text-red-800 border-red-200' 
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }
                  `}
                >
                  {item.daysLeft} days left
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onViewItem(item)}
                  className="ml-2"
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No expiring items found!</p>
            <p className="text-sm text-gray-400 mt-1">All your food items are good for more than a week.</p>
          </div>
        )}
      </CardContent>
      
      {items.length > displayCount && (
        <CardFooter className="border-t border-gray-200 px-6 py-4">
          <Link to="/food-items" className="text-sm font-medium text-primary hover:text-primary-dark">
            View all expiring items →
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
