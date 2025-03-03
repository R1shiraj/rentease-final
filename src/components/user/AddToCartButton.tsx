// Add this to your appliance detail page (src/app/user/appliances/[id]/page.tsx)
// This is a partial implementation focusing on the "Add to Cart" button functionality

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Sample implementation of an Add to Cart button component
// You can incorporate this into your existing appliance detail page
interface AddToCartButtonProps {
  applianceId: string;
}

const AddToCartButton = ({ applianceId }: AddToCartButtonProps) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCart, setIsCheckingCart] = useState(true);
  const { toast } = useToast();

  // Check if the appliance is already in the cart
  useEffect(() => {
    const checkIfInCart = async () => {
      setIsCheckingCart(true);
      try {
        const res = await fetch("/api/user/cart");
        const data = await res.json();

        if (res.ok) {
          const inCart = data.cartItems.some(
            (item: any) => item.appliance._id === applianceId
          );
          setIsInCart(inCart);
        }
      } catch (error) {
        console.error("Error checking cart:", error);
      } finally {
        setIsCheckingCart(false);
      }
    };

    checkIfInCart();
  }, [applianceId]);

  const addToCart = async () => {
    if (isInCart) {
      // Navigate to cart if already added
      window.location.href = "/user/cart";
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applianceId }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsInCart(true);
        toast({
          title: "Added to cart",
          description: "The appliance has been added to your cart",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add to cart",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingCart) {
    return (
      <Button disabled className="w-full md:w-auto">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        Checking...
      </Button>
    );
  }
  // w-full flex items-center justify-center gap-2
  return (
    <Button
      onClick={addToCart}
      className={`w-full ${isInCart ? "bg-green-600 hover:bg-green-700" : ""}`} //removed md:w-auto
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
          Adding...
        </>
      ) : isInCart ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          View in Cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
};

export default AddToCartButton;

// To use this component in your appliance detail page:
// <AddToCartButton applianceId={appliance._id} />
