// src/app/provider/profile/business-info-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateProviderProfile } from "@/app/actions/provider";
import { IUser } from "@/models/User";

interface BusinessInfoFormProps {
  provider: IUser;
}

interface BusinessFormValues {
  businessName: string;
  businessStreet: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
}

export default function BusinessInfoForm({ provider }: BusinessInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<BusinessFormValues>({
    defaultValues: {
      businessName: provider.businessName || "",
      businessStreet: provider.businessAddress?.street || "",
      businessCity: provider.businessAddress?.city || "",
      businessState: provider.businessAddress?.state || "",
      businessZipCode: provider.businessAddress?.zipCode || "",
    },
  });

  async function onSubmit(data: BusinessFormValues) {
    try {
      setIsLoading(true);
      await updateProviderProfile({
        businessName: data.businessName,
        businessAddress: {
          street: data.businessStreet,
          city: data.businessCity,
          state: data.businessState,
          zipCode: data.businessZipCode,
        },
      });
      toast({
        title: "Business Information Updated",
        description: "Your business information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating business info:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your business information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-md font-medium">Business Address</h3>

          <FormField
            control={form.control}
            name="businessStreet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Business St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="businessCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessZipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
