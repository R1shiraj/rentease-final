"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ShoppingCart,
  Calendar,
  Info,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { format, addDays } from "date-fns";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  applianceId: string;
  appliance: {
    _id: string;
    name: string;
    images: string[];
    pricing: {
      daily: number;
      weekly: number;
      monthly: number;
      deposit: number;
    };
  };
  addedAt: string;
  startDate?: Date;
  endDate?: Date;
}

const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<{
    [key: string]: { startDate: Date | null; endDate: Date | null };
  }>({});

  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/user/cart");
        const data = await res.json();

        if (res.ok) {
          setCartItems(data.cartItems);

          // Initialize the date selector states
          const initialDates: {
            [key: string]: { startDate: Date | null; endDate: Date | null };
          } = {};
          data.cartItems.forEach((item: CartItem) => {
            initialDates[item.id] = {
              startDate: null,
              endDate: null,
            };
          });
          setSelectedDates(initialDates);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    setIsRemoving(itemId);
    try {
      const res = await fetch(`/api/user/cart/${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
        // Also remove from selectedDates
        const updatedDates = { ...selectedDates };
        delete updatedDates[itemId];
        setSelectedDates(updatedDates);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleCheckout = () => {
    // Check if at least one item is in the cart
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description:
          "Please add items to your cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    router.push("/user/cart/checkout");
  };

  const calculateDepositTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.appliance.pricing.deposit || 0),
      0
    );
  };

  // Show date selection popover for calendar button
  const handleDateSelection = (
    itemId: string,
    dateType: "start" | "end",
    date: Date | null
  ) => {
    if (date) {
      setSelectedDates((prev) => {
        const current = { ...prev };

        // If selecting start date and it's after current end date, reset end date
        if (
          dateType === "start" &&
          current[itemId].endDate &&
          date > current[itemId].endDate
        ) {
          current[itemId] = {
            startDate: date,
            endDate: addDays(date, 7), // Default to 7 days after start date
          };
        }
        // If selecting end date and it's before current start date, don't update
        else if (
          dateType === "end" &&
          current[itemId].startDate &&
          date < current[itemId].startDate
        ) {
          return current;
        }
        // Normal update
        else {
          current[itemId] = {
            ...current[itemId],
            [dateType === "start" ? "startDate" : "endDate"]: date,
          };

          // If setting start date and no end date exists, set default end date
          if (dateType === "start" && !current[itemId].endDate) {
            current[itemId].endDate = addDays(date, 7);
          }
        }

        return current;
      });
    }
  };

  const getDaysBetween = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateRental = (days: number, pricing: any) => {
    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return months * pricing.monthly + remainingDays * pricing.daily;
    } else if (days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return weeks * pricing.weekly + remainingDays * pricing.daily;
    } else {
      return days * pricing.daily;
    }
  };

  const handleRentNow = (itemId: string) => {
    const item = cartItems.find((item) => item.id === itemId);
    const dates = selectedDates[itemId];

    if (!item || !dates.startDate || !dates.endDate) {
      toast({
        title: "Missing information",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    const days = getDaysBetween(dates.startDate, dates.endDate);
    const amount = calculateRental(days, item.appliance.pricing);

    router.push(
      `/user/cart/checkout?applianceId=${
        item.appliance._id
      }&startDate=${dates.startDate.toISOString()}&endDate=${dates.endDate.toISOString()}&totalAmount=${amount}&deposit=${
        item.appliance.pricing.deposit
      }`
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const depositTotal = calculateDepositTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        {cartItems.length > 0 && (
          <Badge variant="outline" className="text-sm">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </Badge>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-muted/20 rounded-xl shadow-sm">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <ShoppingCart className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-medium mb-3">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Looks like you have not added any appliances to rent yet. Browse our
            collection to find what you need.
          </p>
          <Link href="/user/appliances">
            <Button className="px-6">Browse Appliances</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 sm:h-auto sm:w-1/3">
                      <Image
                        src={
                          item.appliance.images[0] ||
                          "/placeholder-appliance.jpg"
                        }
                        alt={item.appliance.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-lg">
                            {item.appliance.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2 text-sm">
                            <Badge variant="outline">
                              ₹{item.appliance.pricing.daily}/day
                            </Badge>
                            <Badge variant="outline">
                              ₹{item.appliance.pricing.weekly}/week
                            </Badge>
                            <Badge variant="outline">
                              ₹{item.appliance.pricing.monthly}/month
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemoving === item.id}
                        >
                          {isRemoving === item.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5 text-destructive" />
                          )}
                        </Button>
                      </div>

                      {/* Date selection */}
                      <div className="mt-4 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="w-full sm:w-auto">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {selectedDates[item.id]?.startDate
                                    ? format(
                                        selectedDates[item.id]
                                          .startDate as Date,
                                        "PPP"
                                      )
                                    : "Select start date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={
                                    selectedDates[item.id]?.startDate ||
                                    undefined
                                  }
                                  onSelect={(date) =>
                                    handleDateSelection(item.id, "start", date)
                                  }
                                  initialFocus
                                  disabled={(date) => date < new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="text-center">to</div>

                          <div className="w-full sm:w-auto">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {selectedDates[item.id]?.endDate
                                    ? format(
                                        selectedDates[item.id].endDate as Date,
                                        "PPP"
                                      )
                                    : "Select end date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={
                                    selectedDates[item.id]?.endDate || undefined
                                  }
                                  onSelect={(date) =>
                                    handleDateSelection(item.id, "end", date)
                                  }
                                  initialFocus
                                  disabled={(date) =>
                                    date <
                                    (selectedDates[item.id]?.startDate ||
                                      new Date())
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {/* Rental quote preview */}
                        {selectedDates[item.id]?.startDate &&
                          selectedDates[item.id]?.endDate && (
                            <div className="bg-primary/10 p-3 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span>Rental period:</span>
                                <span>
                                  {getDaysBetween(
                                    selectedDates[item.id].startDate as Date,
                                    selectedDates[item.id].endDate as Date
                                  )}{" "}
                                  days
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span>Rental amount:</span>
                                <span className="font-medium">
                                  ₹
                                  {calculateRental(
                                    getDaysBetween(
                                      selectedDates[item.id].startDate as Date,
                                      selectedDates[item.id].endDate as Date
                                    ),
                                    item.appliance.pricing
                                  )}
                                </span>
                              </div>
                              <Button
                                className="w-full mt-3"
                                onClick={() => handleRentNow(item.id)}
                              >
                                Rent Now
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="sticky top-8 space-y-6">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h2 className="font-medium text-lg mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Items in cart</span>
                      <span>{cartItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center">
                            <span>Security Deposit</span>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[250px] text-sm">
                              This is a refundable amount that will be returned
                              when you return the appliance in good condition.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span>₹{depositTotal}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="h-10 flex items-center justify-between font-medium">
                      <span>Estimated Deposit</span>
                      <span className="text-lg">₹{depositTotal}</span>
                    </div>
                    <div className="text-sm text-muted-foreground italic">
                      * Rental prices will be calculated at checkout based on
                      your selected dates.
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    className="w-full h-12 text-lg font-medium gap-2"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>

              <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                <h3 className="font-medium mb-1">Why rent with us?</h3>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>No long-term commitments</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Free delivery and pickup</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Maintenance included</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Easy replacement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
