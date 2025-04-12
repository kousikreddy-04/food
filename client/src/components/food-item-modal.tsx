import { FoodItemWithDaysLeft } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface FoodItemModalProps {
  item: FoodItemWithDaysLeft | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export function FoodItemModal({ item, isOpen, onClose, onDelete }: FoodItemModalProps) {
  if (!item) return null;
  
  // Placeholder image based on category
  const placeholderImages: Record<string, string> = {
    dairy: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    meat: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    vegetables: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    fruits: "https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    grains: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    other: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  };
  
  const imageUrl = item.image || placeholderImages[item.category];
  
  // Get the color for days left text
  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 0) return "text-gray-600";
    if (daysLeft <= 3) return "text-red-600";
    if (daysLeft <= 7) return "text-yellow-600";
    return "text-green-600";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={item.name} 
            className="w-full h-56 sm:h-64 object-cover sm:rounded-t-lg"
          />
        </div>
        
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{item.name}</DialogTitle>
          <div className="flex items-center mt-1 gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
              {item.category}
            </span>
            <span className={`px-2 py-1 bg-red-100 text-xs rounded-full ${getDaysLeftColor(item.daysLeft)}`}>
              {item.daysLeft <= 0 ? "Expired" : `${item.daysLeft} days left`}
            </span>
          </div>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Price:</p>
              <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Added on:</p>
              <p className="font-medium text-gray-900">
                {format(new Date(item.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Manufacture Date:</p>
              <p className="font-medium text-gray-900">
                {format(new Date(item.manufactureDate), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expiry Date:</p>
              <p className="font-medium text-gray-900">
                {format(new Date(item.expiryDate), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Days Remaining:</p>
            <p className={`font-medium ${getDaysLeftColor(item.daysLeft)}`}>
              {item.daysLeft <= 0 ? "Expired" : `${item.daysLeft} days`}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="destructive" 
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
          >
            Delete Item
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
