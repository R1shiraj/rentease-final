// src/app/user/appliances/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Star,
  ChevronLeft,
  Truck,
  Zap,
  Shield,
  CheckCircle,
  Info,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { IAppliance } from "@/models/Appliance";
import { IReview } from "@/models/Review";
import { toast } from "@/components/ui/use-toast";
import AddToCartButton from "@/components/user/AddToCartButton";

const ApplianceDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [appliance, setAppliance] = useState<IAppliance | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [rentalDuration, setRentalDuration] = useState({
    days: 0,
    weeks: 0,
    months: 0,
  });
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const fetchApplianceData = async () => {
      setIsLoading(true);
      try {
        // Fetch appliance details
        const applianceRes = await fetch(`/api/appliances/${params.id}`);
        const applianceData = await applianceRes.json();

        // Fetch reviews for this appliance
        const reviewsRes = await fetch(`/api/appliances/${params.id}/reviews`);
        const reviewsData = await reviewsRes.json();

        if (applianceRes.ok) {
          setAppliance(applianceData.appliance);
        }

        if (reviewsRes.ok) {
          setReviews(reviewsData.reviews);
        }
      } catch (error) {
        console.error("Error fetching appliance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchApplianceData();
    }
  }, [params.id]);

  useEffect(() => {
    // Calculate rental duration and total cost whenever the date range changes
    if (dateRange.from && dateRange.to && appliance) {
      const startDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);

      // Calculate the total days
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the last day

      // Calculate months, weeks, and remaining days
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays - months * 30;
      const weeks = Math.floor(remainingDays / 7);
      const days = remainingDays - weeks * 7;

      setRentalDuration({ days, weeks, months });

      // Calculate total cost
      const { daily, weekly, monthly } = appliance.pricing;
      const totalCost = monthly * months + weekly * weeks + daily * days;
      setTotalCost(totalCost);
    } else {
      setRentalDuration({ days: 0, weeks: 0, months: 0 });
      setTotalCost(0);
    }
  }, [dateRange, appliance]);

  const handleProceedToCheckout = () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Select dates",
        description: "Please select rental dates to proceed",
        variant: "destructive",
      });
      return;
    }

    const queryParams = new URLSearchParams({
      applianceId: params.id as string,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
      totalAmount: totalCost.toString(),
      deposit: appliance?.pricing.deposit.toString() || "0",
    }).toString();

    router.push(`/user/cart/checkout?${queryParams}`);
  };

  // // Updated handleAddToCart function - no date requirement
  // const handleAddToCart = async () => {
  //   try {
  //     setIsAddingToCart(true);

  //     const res = await fetch("/api/user/cart", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         applianceId: params.id,
  //       }),
  //     });

  //     if (res.ok) {
  //       toast({
  //         title: "Success",
  //         description: "Added to cart!",
  //       });
  //     } else {
  //       const data = await res.json();
  //       toast({
  //         title: "Error",
  //         description: data.error || "Failed to add to cart",
  //         variant: "destructive",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error adding to cart:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to add to cart",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsAddingToCart(false);
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!appliance) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Appliance not found</h2>
        <p className="text-muted-foreground mt-2">
          The appliance you are looking for does not exist or has been removed.
        </p>
        <Button
          variant="default"
          className="mt-4"
          onClick={() => router.push("/user/appliances")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Appliances
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Appliance Images */}
        <div className="lg:col-span-3">
          <Carousel className="w-full">
            <CarouselContent>
              {appliance.images?.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <Image
                      src={image || "/placeholder-appliance.jpg"}
                      alt={`${appliance.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        {/* Appliance Details and Booking */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{appliance.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-primary text-primary mr-1" />
                <span>{appliance.ratings || "New"}</span>
              </div>
              <span className="mx-2 text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">
                {appliance.reviewCount || 0} reviews
              </span>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div>
            <h2 className="text-lg font-medium mb-2">Rental Pricing</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Daily</p>
                <p className="font-bold">₹{appliance.pricing.daily}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Weekly</p>
                <p className="font-bold">₹{appliance.pricing.weekly}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Monthly</p>
                <p className="font-bold">₹{appliance.pricing.monthly}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Security deposit: ₹{appliance.pricing.deposit} (refundable)
            </p>
          </div>

          {/* Quick Add to Cart Button
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            ) : null}
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button> */}

          <AddToCartButton applianceId={appliance?._id} />

          <Separator />

          {/* Date Selection */}
          <div>
            <h2 className="text-lg font-medium mb-2">Select Rental Dates</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Select dates to calculate costs and proceed to checkout
            </p>
            <div className="flex flex-col space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "PPP")} -{" "}
                          {format(dateRange.to, "PPP")}
                        </>
                      ) : (
                        format(dateRange.from, "PPP")
                      )
                    ) : (
                      "Select dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Rental Duration and Cost Summary */}
          {dateRange.from && dateRange.to && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Rental Summary</h3>
                <div className="space-y-2 text-sm">
                  {rentalDuration.months > 0 && (
                    <div className="flex justify-between">
                      <span>{rentalDuration.months} month(s)</span>
                      <span>
                        ₹{appliance.pricing.monthly * rentalDuration.months}
                      </span>
                    </div>
                  )}
                  {rentalDuration.weeks > 0 && (
                    <div className="flex justify-between">
                      <span>{rentalDuration.weeks} week(s)</span>
                      <span>
                        ₹{appliance.pricing.weekly * rentalDuration.weeks}
                      </span>
                    </div>
                  )}
                  {rentalDuration.days > 0 && (
                    <div className="flex justify-between">
                      <span>{rentalDuration.days} day(s)</span>
                      <span>
                        ₹{appliance.pricing.daily * rentalDuration.days}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Rental Cost</span>
                    <span>₹{totalCost}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Security Deposit</span>
                    <span>₹{appliance.pricing.deposit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rent Now Button */}
          <Button
            className="w-full"
            onClick={handleProceedToCheckout}
            disabled={!dateRange.from || !dateRange.to}
          >
            Rent Now
          </Button>

          {/* Additional Benefits */}
          <div className="space-y-3 mt-4">
            <div className="flex gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Free delivery and pickup</span>
            </div>
            <div className="flex gap-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Installation included</span>
            </div>
            <div className="flex gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Damage protection available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Description, Specifications, and Reviews */}
      <Tabs defaultValue="description" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <div className="prose max-w-none">
            <p>{appliance.description}</p>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="font-medium">{appliance.specifications.brand}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-medium">{appliance.specifications.model}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{appliance.specifications.year}</p>
              </div>
              {/* Display additional specifications */}
              {Object.entries(appliance.specifications).map(([key, value]) => {
                if (!["brand", "model", "year"].includes(key)) {
                  return (
                    <div className="space-y-1" key={key}>
                      <p className="text-sm text-muted-foreground">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </p>
                      <p className="font-medium">{value as string}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-medium">
                      {review.userId.name || "Anonymous User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), "PP")}
                    </span>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplianceDetailsPage;
