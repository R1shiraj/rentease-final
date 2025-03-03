// src/components/payment/StripePaymentForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
}

// Wrapped component that contains the Elements provider
export function StripePaymentWrapper({
  amount,
  onSuccess,
  onCancel,
  metadata = {},
}: {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  metadata?: Record<string, any>;
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        // const response = await fetch("/api/payment", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ amount, metadata }),
        // });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment intent");
        }

        setClientSecret(data.clientSecret);
      } catch (error: any) {
        setError(error.message);
        console.error("Payment setup error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, metadata]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p className="font-medium">Payment Setup Error</p>
        <p className="text-sm mt-1">{error}</p>
        <Button variant="outline" className="mt-3" onClick={onCancel}>
          Go back
        </Button>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#7c3aed",
      },
    },
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <StripePaymentForm
            clientSecret={clientSecret}
            onSuccess={onSuccess}
            onCancel={onCancel}
            amount={amount}
          />
        </Elements>
      )}
    </div>
  );
}

// The actual form component that will be rendered inside Elements
function StripePaymentForm({
  clientSecret,
  onSuccess,
  onCancel,
  amount,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check the payment intent status right away
    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case "succeeded":
            setMessage("Payment succeeded!");
            onSuccess();
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Please provide your payment details.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      });
    }
  }, [stripe, clientSecret, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/user/rentals/success`,
        receipt_email: email,
      },
      redirect: "if_required",
    });

    // If no redirect happened, we need to handle the result
    if (error) {
      console.error("Payment confirmation error:", error);
      setMessage(
        error.message || "An error occurred during payment. Please try again."
      );
    } else {
      // The payment succeeded!
      setMessage("Payment succeeded!");
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg mb-4 flex justify-between">
        <span>Total Amount:</span>
        <span className="font-bold">₹{amount.toFixed(2)}</span>
      </div>

      <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={(e) => setEmail(e.value.email)}
      />

      <PaymentElement id="payment-element" />

      {message && (
        <div
          className={`p-3 rounded-md ${
            message.includes("succeeded")
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          disabled={isLoading}
          className="flex-1"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={isLoading || !stripe || !elements}
          type="submit"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₹${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}
