// src/app/user/reviews/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Review {
  _id: string;
  applianceId: {
    _id: string;
    name: string;
    images: string[];
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/user/reviews");
        const data = await res.json();

        if (res.ok) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-muted/30 rounded-lg">
          <Star className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No reviews yet</h2>
          <p className="text-muted-foreground mb-6">
            You have not reviewed any appliances yet.
          </p>
          <Button onClick={() => router.push("/user/rentals/history")}>
            View Rental History
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Appliance Image */}
                  <div className="relative aspect-square w-full sm:w-40 overflow-hidden rounded-lg">
                    <Image
                      src={
                        review.applianceId.images[0] ||
                        "/placeholder-appliance.jpg"
                      }
                      alt={review.applianceId.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Review Details */}
                  <div className="flex-1">
                    <h3 className="font-medium">{review.applianceId.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
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
                    <p className="text-sm mt-2">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Reviewed on {format(new Date(review.createdAt), "PP")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
