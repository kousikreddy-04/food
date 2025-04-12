import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CameraComponent } from "@/components/ui/camera";
import { FoodIdentifier } from "@/components/food-identifier";
import { Camera, X, Check, Image } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertFoodItemSchema, foodCategories } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AddItemPage() {
  const { toast } = useToast();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Handle food identification results
  const handleFoodIdentified = (food: { name: string; category: typeof foodCategories[number] }) => {
    form.setValue("name", food.name);
    form.setValue("category", food.category);
    toast({
      title: "Food Identified",
      description: `Identified as ${food.name} (${food.category})`,
    });
  };
  
  // Define form schema
  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    category: z.enum(foodCategories),
    manufactureDate: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Please enter a valid date",
    }),
    expiryDate: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Please enter a valid date",
    }),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    // Note: image is handled separately
  }).refine(data => {
    const mfgDate = new Date(data.manufactureDate);
    const expDate = new Date(data.expiryDate);
    return mfgDate <= expDate;
  }, {
    message: "Expiry date must be after manufacture date",
    path: ["expiryDate"],
  });
  
  type FormValues = z.infer<typeof formSchema>;
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "other",
      manufactureDate: format(new Date(), "yyyy-MM-dd"),
      expiryDate: "",
      price: 0,
    },
  });
  
  // Create food item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        image: capturedImage,
      };
      
      const res = await apiRequest("POST", "/api/food-items", payload);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Food item added successfully",
      });
      
      // Reset form
      form.reset({
        name: "",
        category: "other",
        manufactureDate: format(new Date(), "yyyy-MM-dd"),
        expiryDate: "",
        price: 0,
      });
      setCapturedImage(null);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expiring-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add food item",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: FormValues) => {
    createItemMutation.mutate(data);
  };
  
  // Handle image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageCapture = (image: string) => {
    setCapturedImage(image);
    setIsCameraOpen(false);
  };
  
  const removeImage = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Add New Food Item</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Milk, Eggs, Bread"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {foodCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              <span className="capitalize">{category}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="manufactureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacture Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-1">
                  <Label>Item Photo</Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      {/* Image preview (when available) */}
                      {capturedImage ? (
                        <div className="mb-3">
                          <img 
                            className="h-32 object-cover mx-auto" 
                            src={capturedImage} 
                            alt="Item preview" 
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={removeImage}
                            className="mt-2 text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Camera className="h-12 w-12 text-gray-400" />
                          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-600 mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              type="button"
                              className="mr-2"
                              onClick={() => setIsCameraOpen(true)}
                            >
                              <Camera className="mr-2 h-4 w-4" /> 
                              Take a photo
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              type="button"
                              asChild
                            >
                              <label>
                                <Image className="mr-2 h-4 w-4" /> 
                                Upload
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleFileUpload}
                                />
                              </label>
                            </Button>
                            
                            <FoodIdentifier 
                              onSelect={handleFoodIdentified} 
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setCapturedImage(null);
                  }}
                >
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={createItemMutation.isPending}
                >
                  {createItemMutation.isPending ? "Adding Item..." : "Add Item"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-md">
          <CameraComponent 
            onImageCapture={handleImageCapture}
            onCancel={() => setIsCameraOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
