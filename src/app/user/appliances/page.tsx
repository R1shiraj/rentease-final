"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { IAppliance } from "@/models/Appliance";
import { ICategory } from "@/models/Category";
import { Filter, Search, Star, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ApplianceCardProps {
  appliance: IAppliance;
}

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
          <CardTitle className="text-lg line-clamp-1">
            {appliance.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            {appliance.specifications.brand}
          </p>
          <div className="flex items-center mt-1">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-primary text-primary mr-1" />
              <span className="text-sm">{appliance.ratings || "New"}</span>
            </div>
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

// Define MobileFilters outside the main component
const MobileFilters = ({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  selectedBrands,
  toggleBrand,
  applyFilters,
  resetFilters,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-6">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Category</h3>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
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

          {/* Price Range Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Daily Price Range</h3>
            <div className="px-2">
              <Slider
                value={priceRange}
                max={5000}
                step={100}
                onValueChange={setPriceRange}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm">₹{priceRange[0]}</p>
              <p className="text-sm">₹{priceRange[1]}</p>
            </div>
          </div>

          {/* Brands Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Brands</h3>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div className="flex items-center space-x-2" key={brand}>
                  <Checkbox
                    id={`brand-mobile-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <label
                    htmlFor={`brand-mobile-${brand}`}
                    className="text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleBrand(brand);
                    }}
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6 flex flex-col gap-2 sm:flex-row">
          <SheetClose asChild>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

const AppliancesListPage = () => {
  const searchParams = useSearchParams();
  const [appliances, setAppliances] = useState<IAppliance[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [filteredAppliances, setFilteredAppliances] = useState<IAppliance[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedSort, setSelectedSort] = useState("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch appliances
        const appliancesRes = await fetch("/api/appliances");
        const appliancesData = await appliancesRes.json();

        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        const categoriesData = await categoriesRes.json();

        // Fetch brands
        const brandsRes = await fetch("/api/appliances/brands");
        const brandsData = await brandsRes.json();

        if (appliancesRes.ok) {
          setAppliances(appliancesData.appliances);
        }

        if (categoriesRes.ok) {
          setCategories(categoriesData.categories);
        }

        if (brandsRes.ok) {
          setBrands(brandsData.brands);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever the dependencies change
    let results = [...appliances];

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (appliance) =>
          appliance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appliance.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          appliance.specifications.brand
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // // Filter by category
    // if (selectedCategory) {
    //   results = results.filter(
    //     (appliance) => appliance.category === selectedCategory
    //   );
    // }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      results = results.filter(
        (appliance) => appliance.category === selectedCategory
      );
    }

    // Filter by price range
    results = results.filter(
      (appliance) =>
        appliance.pricing.daily >= priceRange[0] &&
        appliance.pricing.daily <= priceRange[1]
    );

    // Filter by brands
    if (selectedBrands.length > 0) {
      results = results.filter((appliance) =>
        selectedBrands.includes(appliance.specifications.brand)
      );
    }

    // Apply sorting
    if (selectedSort === "price-low") {
      results.sort((a, b) => a.pricing.daily - b.pricing.daily);
    } else if (selectedSort === "price-high") {
      results.sort((a, b) => b.pricing.daily - a.pricing.daily);
    } else if (selectedSort === "rating") {
      results.sort((a, b) => b.ratings - a.ratings);
    } else if (selectedSort === "newest") {
      results.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setFilteredAppliances(results);
    setCurrentPage(1);
  }, [
    appliances,
    searchQuery,
    selectedCategory,
    priceRange,
    selectedBrands,
    selectedSort,
  ]);

  // // Handle form submission for search
  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Update URL params but don't navigate away
  //   const params = new URLSearchParams(searchParams.toString());
  //   if (searchQuery) {
  //     params.set("search", searchQuery);
  //   } else {
  //     params.delete("search");
  //   }
  //   window.history.replaceState({}, "", `?${params.toString()}`);
  // };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  // Add a new handler for applying filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  //handler for reset filters
  const resetFilters = () => {
    // Reset all filter states
    setSelectedCategory("all");
    setSelectedBrands([]);
    setPriceRange([0, 5000]);

    // Also update the URL params
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    // Keep the search query if needed, or remove it too
    // params.delete("search");
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  // Filter toggles
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppliances.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAppliances.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  //   // Modified MobileFilters component
  //   const MobileFilters = () => (
  //     <Sheet>
  //       <SheetTrigger asChild>
  //         <Button variant="outline" className="md:hidden">
  //           <SlidersHorizontal className="h-4 w-4 mr-2" />
  //           Filters
  //         </Button>
  //       </SheetTrigger>
  //       <SheetContent side="left" className="overflow-y-auto">
  //         <SheetHeader>
  //           <SheetTitle>Filters</SheetTitle>
  //         </SheetHeader>
  //         <div className="py-4 space-y-6">
  //           {/* Category Filter */}
  //           <div>
  //             <h3 className="text-sm font-medium mb-2">Category</h3>
  //             <Select
  //               value={selectedCategory}
  //               onValueChange={setSelectedCategory}
  //             >
  //               <SelectTrigger className="w-full">
  //                 <SelectValue placeholder="All Categories" />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 <SelectItem value="all">All Categories</SelectItem>
  //                 {categories.map((category) => (
  //                   <SelectItem key={category._id} value={category._id}>
  //                     {category.name}
  //                   </SelectItem>
  //                 ))}
  //               </SelectContent>
  //             </Select>
  //           </div>

  //           {/* Price Range Filter */}
  //           <div>
  //             <h3 className="text-sm font-medium mb-2">Daily Price Range</h3>
  //             <div className="px-2">
  //               <Slider
  //                 defaultValue={priceRange}
  //                 max={5000}
  //                 step={100}
  //                 onValueChange={setPriceRange}
  //               />
  //             </div>
  //             <div className="flex items-center justify-between mt-2">
  //               <p className="text-sm">₹{priceRange[0]}</p>
  //               <p className="text-sm">₹{priceRange[1]}</p>
  //             </div>
  //           </div>

  //           {/* Brands Filter */}
  //           <div>
  //             <h3 className="text-sm font-medium mb-2">Brands</h3>
  //             <div className="grid grid-cols-2 gap-2">
  //               {brands.map((brand) => (
  //                 <Button
  //                   key={brand}
  //                   type="button"
  //                   variant={
  //                     selectedBrands.includes(brand) ? "default" : "outline"
  //                   }
  //                   size="sm"
  //                   onClick={() => toggleBrand(brand)}
  //                   className="justify-start text-xs"
  //                 >
  //                   {brand}
  //                 </Button>
  //               ))}
  //             </div>
  //           </div>
  //         </div>
  //         <SheetFooter className="mt-6">
  //           <Button
  //             onClick={() => {
  //               // Apply filters logic here
  //               const params = new URLSearchParams(searchParams.toString());
  //               if (selectedCategory !== "all") {
  //                 params.set("category", selectedCategory);
  //               } else {
  //                 params.delete("category");
  //               }
  //               window.history.replaceState({}, "", `?${params.toString()}`);
  //             }}
  //           >
  //             Apply Filters
  //           </Button>
  //         </SheetFooter>
  //       </SheetContent>
  //     </Sheet>
  //   );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Explore Appliances</h1>

      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <Input
            type="text"
            placeholder="Search appliances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <MobileFilters
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
            applyFilters={applyFilters}
            resetFilters={resetFilters} // Add this line
          />
          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Filters */}
        <div className="hidden md:block w-64 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Filters</h3>
            <Separator className="mb-4" />

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Category</h4>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
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

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Daily Price Range</h4>
              <div className="px-2">
                <Slider
                  defaultValue={priceRange}
                  max={5000}
                  step={100}
                  onValueChange={setPriceRange}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm">₹{priceRange[0]}</p>
                <p className="text-sm">₹{priceRange[1]}</p>
              </div>
            </div>

            {/* Brands Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Brands</h4>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div className="flex items-center space-x-2" key={brand}>
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => toggleBrand(brand)}
                    />
                    <label htmlFor={`brand-${brand}`} className="text-sm">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appliances Grid */}
        <div className="flex-1">
          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            {filteredAppliances.length}{" "}
            {filteredAppliances.length === 1 ? "appliance" : "appliances"} found
          </p>

          {filteredAppliances.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-10">
              <p className="text-lg font-medium mb-2">No appliances found</p>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedBrands([]);
                  setPriceRange([0, 5000]);
                  setSearchQuery("");
                  setSelectedSort("");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentItems.map((appliance) => (
                  <ApplianceCard key={appliance._id} appliance={appliance} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }).map((_, index) => (
                      <Button
                        key={index}
                        variant={
                          currentPage === index + 1 ? "default" : "outline"
                        }
                        onClick={() => paginate(index + 1)}
                        className="w-10 h-10 p-0"
                      >
                        {index + 1}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppliancesListPage;
