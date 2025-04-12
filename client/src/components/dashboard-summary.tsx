import { FoodCategory, FoodItemWithDaysLeft } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Archive, 
  AlertTriangle, 
  AlertCircle 
} from "lucide-react";

interface DashboardSummaryProps {
  foodItems: FoodItemWithDaysLeft[];
  isLoading: boolean;
}

export function DashboardSummary({ foodItems, isLoading }: DashboardSummaryProps) {
  // Count total items
  const totalItems = foodItems.length;
  
  // Count items expiring in the next week
  const expiringItems = foodItems.filter(item => item.daysLeft <= 7 && item.daysLeft > 3).length;
  
  // Count items critically expiring (3 days or less)
  const criticalItems = foodItems.filter(item => item.daysLeft <= 3 && item.daysLeft >= 0).length;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Food Inventory Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-3">
                <Archive className="text-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-semibold">{totalItems}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-3">
                <AlertTriangle className="text-orange-500 h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiring Soon</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-semibold">{expiringItems}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-3">
                <AlertCircle className="text-red-600 h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Critical (3 days)</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-semibold">{criticalItems}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
