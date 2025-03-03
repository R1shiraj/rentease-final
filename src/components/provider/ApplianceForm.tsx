"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createAppliance, updateAppliance } from "@/app/actions/appliance";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { X, Upload, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string(),
  images: z.array(z.string()).min(1, {
    message: "At least one image is required.",
  }),
  specifications: z.object({
    brand: z.string().min(1, { message: "Brand is required." }),
    model: z.string().min(1, { message: "Model is required." }),
    year: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  }),
  pricing: z.object({
    daily: z.coerce
      .number()
      .positive({ message: "Daily rate must be positive." }),
    weekly: z.coerce
      .number()
      .positive({ message: "Weekly rate must be positive." }),
    monthly: z.coerce
      .number()
      .positive({ message: "Monthly rate must be positive." }),
    deposit: z.coerce
      .number()
      .nonnegative({ message: "Deposit must be non-negative." }),
  }),
  status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ApplianceFormProps {
  categories: any[];
  appliance?: any; // For edit mode
}

export default function ApplianceForm({
  categories,
  appliance,
}: ApplianceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize the form with default values or the existing appliance's values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: appliance
      ? {
          ...appliance,
          specifications: {
            brand: appliance.specifications.brand,
            model: appliance.specifications.model,
            year: appliance.specifications.year,
          },
          pricing: {
            daily: appliance.pricing.daily,
            weekly: appliance.pricing.weekly,
            monthly: appliance.pricing.monthly,
            deposit: appliance.pricing.deposit,
          },
        }
      : {
          name: "",
          description: "",
          category: "",
          images: [],
          specifications: {
            brand: "",
            model: "",
            year: new Date().getFullYear(),
          },
          pricing: {
            daily: 0,
            weekly: 0,
            monthly: 0,
            deposit: 0,
          },
          status: "AVAILABLE",
        },
  });

  // Function to handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = form.getValues("images");
    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      form.setValue("images", [...currentImages, ...uploadedUrls]);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your images.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Function to remove an image
  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    form.setValue("images", updatedImages);
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (appliance) {
        // Update existing appliance
        const result = await updateAppliance(appliance._id, values);
        if (result.success) {
          toast({
            title: "Appliance updated",
            description: "Your appliance has been updated successfully.",
          });

          // Set redirecting state before navigation
          setIsRedirecting(true);
          router.push("/provider/appliances");
        } else {
          toast({
            title: "Update failed",
            description: result.error || "Failed to update appliance.",
            variant: "destructive",
          });
          setIsSubmitting(false);
        }
      } else {
        // Create new appliance
        const result = await createAppliance(values);
        if (result.success) {
          toast({
            title: "Appliance created",
            description: "Your new appliance has been added successfully.",
          });

          // Set redirecting state before navigation
          setIsRedirecting(true);
          router.push("/provider/appliances");
        } else {
          toast({
            title: "Creation failed",
            description: result.error || "Failed to create appliance.",
            variant: "destructive",
          });
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
    // We don't set isSubmitting to false here because we want the form to remain in a submitting state until navigation completes
  };

  // Disable the entire form when navigating
  const isFormDisabled = isSubmitting || isRedirecting || uploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {isRedirecting && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4 p-6 bg-background rounded-lg shadow-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-xl font-medium">
                {appliance
                  ? "Redirecting to appliances..."
                  : "Creating appliance..."}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information Section */}
          <Card
            className={`p-6 col-span-2 ${isFormDisabled ? "opacity-70" : ""}`}
          >
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Refrigerator"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormDescription>
                      The name of your appliance.
                    </FormDescription>
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
                      disabled={isFormDisabled}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the category that best fits your appliance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your appliance, including its features and condition."
                        {...field}
                        rows={4}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description helps customers understand what
                      they're renting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Specifications Section */}
          <Card
            className={`p-6 col-span-2 ${isFormDisabled ? "opacity-70" : ""}`}
          >
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="specifications.brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Samsung"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specifications.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="RT21M6215SR"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specifications.year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Pricing Section */}
          <Card
            className={`p-6 col-span-2 ${isFormDisabled ? "opacity-70" : ""}`}
          >
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="grid gap-6 md:grid-cols-4">
              <FormField
                control={form.control}
                name="pricing.daily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Rate (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricing.weekly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Rate (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricing.monthly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rate (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricing.deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Deposit (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Images Section */}
          <Card
            className={`p-6 col-span-2 ${isFormDisabled ? "opacity-70" : ""}`}
          >
            <h2 className="text-xl font-semibold mb-4">Images</h2>
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {field.value.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square border rounded-md overflow-hidden"
                          >
                            <Image
                              src={image}
                              alt={`Product image ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                              aria-label="Remove image"
                              disabled={isFormDisabled}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <label
                          className={`relative aspect-square flex items-center justify-center border border-dashed rounded-md ${
                            isFormDisabled
                              ? "cursor-not-allowed bg-muted/30"
                              : "cursor-pointer hover:bg-muted/50"
                          }`}
                        >
                          {uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              <span className="sr-only">Upload image</span>
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageUpload}
                                disabled={isFormDisabled}
                              />
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload clear images of your appliance. At least one image is
                    required.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Status Section */}
          <Card
            className={`p-6 col-span-2 ${isFormDisabled ? "opacity-70" : ""}`}
          >
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Availability Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                      disabled={isFormDisabled}
                    >
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem
                          value="AVAILABLE"
                          id="available"
                          disabled={isFormDisabled}
                        />
                        <label
                          htmlFor="available"
                          className={`text-sm font-medium leading-none ${
                            isFormDisabled ? "opacity-70" : ""
                          }`}
                        >
                          Available
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem
                          value="RENTED"
                          id="rented"
                          disabled={isFormDisabled}
                        />
                        <label
                          htmlFor="rented"
                          className={`text-sm font-medium leading-none ${
                            isFormDisabled ? "opacity-70" : ""
                          }`}
                        >
                          Rented
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem
                          value="MAINTENANCE"
                          id="maintenance"
                          disabled={isFormDisabled}
                        />
                        <label
                          htmlFor="maintenance"
                          className={`text-sm font-medium leading-none ${
                            isFormDisabled ? "opacity-70" : ""
                          }`}
                        >
                          Under Maintenance
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/provider/appliances")}
            disabled={isFormDisabled}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isFormDisabled}>
            {isSubmitting || isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {appliance ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{appliance ? "Update Appliance" : "Create Appliance"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
