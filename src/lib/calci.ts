// This are some calculations used by the "src\app\user\rentals\history\page.tsx" page

// src/lib/calci.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This function combines Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format date to display in a human-readable format
export function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// Calculate duration in days between two dates
export function getDurationInDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Format currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
    }).format(amount);
}