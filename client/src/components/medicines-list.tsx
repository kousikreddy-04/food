import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pill } from "lucide-react";
import { FoodItemWithDaysLeft } from "@shared/schema";

export function MedicinesList() {
  const { 
    data: medicines = [], 
    isLoading 
  } = useQuery<FoodItemWithDaysLeft[]>({
    queryKey: ["/api/medicines"],
  });

  // Helper function to determine status badge color
  const getStatusBadge = (daysLeft: number) => {
    if (daysLeft <= 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysLeft <= 3) {
      return <Badge variant="destructive">Critical</Badge>;
    }
    if (daysLeft <= 7) {
      return <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600">Warning</Badge>;
    }
    if (daysLeft <= 30) {
      return <Badge variant="secondary">Good</Badge>;
    }
    return <Badge variant="outline">Long Term</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="h-5 w-5 mr-2" />
            Medicines
          </CardTitle>
          <CardDescription>Track and manage your medicine inventory</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (medicines.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="h-5 w-5 mr-2" />
            Medicines
          </CardTitle>
          <CardDescription>Track and manage your medicine inventory</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-2">No medicines in your inventory</p>
          <p className="text-sm text-muted-foreground">
            Add medicines from the "Add Item" page with "medicines" as the category
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Pill className="h-5 w-5 mr-2" />
          Medicines
        </CardTitle>
        <CardDescription>Track and manage your medicine inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {medicines.map((medicine) => (
            <div key={medicine.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{medicine.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(medicine.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {getStatusBadge(medicine.daysLeft)}
                  <span className="text-xs mt-1">
                    {medicine.daysLeft <= 0
                      ? "Expired"
                      : `${medicine.daysLeft} days left`}
                  </span>
                </div>
              </div>
              {medicine.image && (
                <div className="mt-2">
                  <img
                    src={medicine.image}
                    alt={medicine.name}
                    className="h-16 w-16 object-cover rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}