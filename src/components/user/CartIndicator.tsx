// src/components/user/CartIndicator.tsx
"use client";

import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CartIndicator = () => {
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await fetch("/api/user/cart");
        if (res.ok) {
          const data = await res.json();
          setCartCount(data.cart.length);
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();
  }, []);

  return (
    <button
      onClick={() => router.push("/user/cart")}
      className="relative p-2 hover:bg-accent rounded-lg"
    >
      <ShoppingCart className="h-6 w-6" />
      {cartCount > 0 && (
        <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full px-1.5">
          {cartCount}
        </span>
      )}
    </button>
  );
};

export default CartIndicator;
