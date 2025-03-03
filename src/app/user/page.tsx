"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";
import Link from "next/link";
import { IAppliance } from "@/models/Appliance";
import { ICategory } from "@/models/Category";

// Types
interface ApplianceCardProps {
  appliance: IAppliance;
}

interface CategoryCardProps {
  category: ICategory;
}

// Hero Carousel Component
const HeroCarousel = ({ appliances }: { appliances: IAppliance[] }) => {
  return (
    <div className="w-full overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          {appliances.map((appliance) => (
            <CarouselItem key={appliance._id}>
              <Link href={`/user/appliances/${appliance._id}`}>
                <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-xl">
                  <Image
                    src={appliance.images[0] || "/placeholder-appliance.jpg"}
                    alt={appliance.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="absolute bottom-0 p-6 text-white">
                      <h3 className="text-2xl font-bold">{appliance.name}</h3>
                      <p className="text-lg">
                        {appliance.specifications.brand} - ₹
                        {appliance.pricing.daily}/day
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};

// Appliance Card Component
const ApplianceCard = ({ appliance }: ApplianceCardProps) => {
  return (
    <Link href={`/user/appliances/${appliance._id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={appliance.images[0] || "/placeholder-appliance.jpg"}
            alt={appliance.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">{appliance.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            {appliance.specifications.brand}
          </p>
          <div className="flex items-center mt-1">
            <span className="text-sm">
              Rating: {appliance.ratings || "New"}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              ({appliance.reviewCount || 0} reviews)
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <p className="font-semibold">₹{appliance.pricing.daily}/day</p>
        </CardFooter>
      </Card>
    </Link>
  );
};

// Category Card Component
const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/user/appliances?category=${category._id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="relative h-32 w-full overflow-hidden">
          <Image
            src={category.image || "/placeholder-category.jpg"}
            alt={category.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h3 className="text-xl font-bold text-white">{category.name}</h3>
          </div>
        </div>
      </Card>
    </Link>
  );
};

// Filter Component
const FilterSheet = ({
  onApplyFilters,
}: {
  onApplyFilters: (filters: any) => void;
}) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    // Fetch brands
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/appliances/brands");
        const data = await res.json();
        if (res.ok) {
          setAvailableBrands(data.brands);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  const handleApplyFilters = () => {
    onApplyFilters({
      category: selectedCategory === "all" ? "" : selectedCategory,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      brands: selectedBrands,
    });
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Appliances</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Category</h3>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Daily Price Range</h3>
            <div className="px-2">
              <Slider
                defaultValue={priceRange}
                max={5000}
                step={100}
                onValueChange={setPriceRange}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">₹{priceRange[0]}</p>
              <p className="text-sm">₹{priceRange[1]}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Brands</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableBrands.map((brand) => (
                <Button
                  key={brand}
                  type="button"
                  variant={
                    selectedBrands.includes(brand) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleBrand(brand)}
                  className="justify-start"
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Main Home Page Component
const HomePage = () => {
  const [featuredAppliances, setFeaturedAppliances] = useState<IAppliance[]>(
    []
  );
  const [popularAppliances, setPopularAppliances] = useState<IAppliance[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch featured appliances
        const featuredRes = await fetch("/api/appliances/featured");
        const featuredData = await featuredRes.json();

        // Fetch popular appliances
        const popularRes = await fetch("/api/appliances/popular");
        const popularData = await popularRes.json();

        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        const categoriesData = await categoriesRes.json();

        if (featuredRes.ok) {
          setFeaturedAppliances(featuredData.appliances);
        }

        if (popularRes.ok) {
          setPopularAppliances(popularData.appliances);
        }

        if (categoriesRes.ok) {
          setCategories(categoriesData.categories);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/user/appliances?search=${searchQuery}`;
  };

  const handleApplyFilters = (filters: any) => {
    const params = new URLSearchParams();

    if (filters.category) {
      params.append("category", filters.category);
    }

    if (filters.priceMin) {
      params.append("priceMin", filters.priceMin.toString());
    }

    if (filters.priceMax) {
      params.append("priceMax", filters.priceMax.toString());
    }

    if (filters.brands && filters.brands.length > 0) {
      params.append("brands", filters.brands.join(","));
    }

    window.location.href = `/user/appliances?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            type="text"
            placeholder="Search for appliances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        <FilterSheet onApplyFilters={handleApplyFilters} />
      </div>

      {/* Featured Appliances Carousel */}
      {featuredAppliances.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Featured Appliances</h2>
          <HeroCarousel appliances={featuredAppliances} />
        </section>
      )}

      {/* Categories Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <Link
            href="/user/appliances"
            className="text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      </section>

      {/* Popular Appliances */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Popular Appliances</h2>
          <Link
            href="/user/appliances"
            className="text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularAppliances.slice(0, 8).map((appliance) => (
            <ApplianceCard key={appliance._id} appliance={appliance} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
