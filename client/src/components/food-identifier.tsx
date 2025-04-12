import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CameraComponent } from "@/components/ui/camera";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Camera, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FoodCategory, foodCategories } from "@shared/schema";

interface IdentifiedFood {
  name: string;
  category: string;
  confidence: number;
}

interface FoodIdentifierProps {
  onSelect?: (food: {
    name: string;
    category: FoodCategory;
  }) => void;
}

export function FoodIdentifier({ onSelect }: FoodIdentifierProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identifiedItems, setIdentifiedItems] = useState<IdentifiedFood[]>([]);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleImageCapture = (image: string) => {
    setCapturedImage(image);
    identifyFood(image);
  };

  const identifyFood = async (image: string) => {
    try {
      setIsIdentifying(true);
      setShowResults(false);
      
      const response = await apiRequest("POST", "/api/identify-food", { image });
      const data = await response.json();
      
      setIdentifiedItems(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error identifying food:", error);
      toast({
        title: "Error",
        description: "Failed to identify food from image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSelectFood = (item: IdentifiedFood) => {
    // Convert category string to a valid food category
    let category: FoodCategory = "other";
    
    // Find the closest matching category
    const normalizedItemCategory = item.category.toLowerCase();
    for (const cat of foodCategories) {
      if (normalizedItemCategory.includes(cat.toLowerCase())) {
        category = cat as FoodCategory;
        break;
      }
    }
    
    // Call the callback with the selected food item
    if (onSelect) {
      onSelect({
        name: item.name,
        category
      });
    }
    
    // Close the dialog
    setIsOpen(false);
    setCapturedImage(null);
    setIdentifiedItems([]);
    setShowResults(false);
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setIdentifiedItems([]);
    setShowResults(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCapturedImage(null);
    setIdentifiedItems([]);
    setShowResults(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          <Camera className="h-4 w-4" />
          <span>Identify Food</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!capturedImage ? (
          <CameraComponent 
            onImageCapture={handleImageCapture} 
            onCancel={handleClose} 
          />
        ) : (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Identified Food</h3>
              <p className="text-sm text-muted-foreground">
                We analyzed your image and found these food items:
              </p>
            </div>
            
            {isIdentifying ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Analyzing your image...</p>
              </div>
            ) : showResults ? (
              <>
                <div className="max-h-[320px] overflow-y-auto mb-4">
                  {identifiedItems.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No food items identified. Try taking another photo.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {identifiedItems.map((item, index) => (
                        <li 
                          key={index}
                          className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
                          onClick={() => handleSelectFood(item)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs rounded-full px-2 py-1 bg-primary/10 text-primary">
                                {Math.round(item.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleCancel}>
                    Try Again
                  </Button>
                  <Button onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}