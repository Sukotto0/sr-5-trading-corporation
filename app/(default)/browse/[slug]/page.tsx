"use client";
import { useState, useMemo, useEffect } from "react";
import { Filter, SortAsc, X, ChevronDown, Search, MapPin } from "lucide-react";
import {
  useFilters,
  useProducts,
  type ProductsQueryParams,
} from "@/hooks/useQuery";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const productsCategory = [
  { name: "Trucks", href: "/browse/trucks" },
  { name: "Heavy Equipment", href: "/browse/heavy-equipment" },
  { name: "Units", href: "/browse/units" },
  { name: "Engine", href: "/browse/engine" },
  { name: "Tools", href: "/browse/tools" },
  { name: "Parts & Accessories", href: "/browse/parts-accessories" },
];

// Sort options for products
const sortOptions = [
  { name: "Most Relevant", value: "relevance" },
  { name: "Latest", value: "latest" },
  { name: "Price: Low to High", value: "price-low" },
  { name: "Price: High to Low", value: "price-high" },
];

export default function Browse({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [selectedFilters, setSelectedFilters] = useState<ProductsQueryParams>({
    category: slug,
  });
  const [currentSort, setCurrentSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [showDevWarning, setShowDevWarning] = useState(true);

  // Fetch filters and products using React Query
  const {
    data: filters = [],
    isLoading: filtersLoading,
    error: filtersError,
  } = useFilters();
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({
    ...selectedFilters,
    sortBy: currentSort,
    search: searchQuery,
  });

  // Filter out products with 0 or negative quantity
  const availableProducts = useMemo(() => {
    return products.filter((product) => product.quantity > 0);
  }, [products]);

  // Handle filter changes
  const handleFilterChange = (
    filterId: string,
    optionValue: string,
    checked: boolean
  ) => {
    setSelectedFilters((prev) => {
      if (checked) {
        return { ...prev, [filterId.toLowerCase()]: optionValue };
      } else {
        const newFilters = { ...prev };
        delete newFilters[filterId.toLowerCase() as keyof ProductsQueryParams];
        return newFilters;
      }
    });
  };

  useEffect(() => {
    console.log(products)
  }, [products])
  
  // Handle sort changes
  const handleSortChange = (sortValue: string) => {
    setCurrentSort(sortValue);
  };

  // Handle price range changes
  const handlePriceRangeChange = (type: "min" | "max", value: string) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);

    // Update selected filters
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };

      if (newRange.min && !isNaN(parseFloat(newRange.min))) {
        newFilters.minPrice = parseFloat(newRange.min);
      } else {
        delete newFilters.minPrice;
      }

      if (newRange.max && !isNaN(parseFloat(newRange.max))) {
        newFilters.maxPrice = parseFloat(newRange.max);
      } else {
        delete newFilters.maxPrice;
      }

      return newFilters;
    });
  };

  // Handle search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({ category: slug });
    setPriceRange({ min: "", max: "" });
    setSearchQuery("");
  };

  // Get active filter count
  const activeFilterCount = Object.keys(selectedFilters).filter(
    (key) => key !== "category"
  ).length;

  if (filtersError || productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground">
              Failed to load data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {slug
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Discover our range of {slug.replace("-", " ")} products
            </p>
          </div>
        </div>

        {/* Search and Controls Bar */}
        <div className="mb-6 space-y-4">
          {/* Search Results Info */}
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            {searchQuery
              ? productsLoading
                ? "Searching..."
                : `${products.length} results for "${searchQuery}"`
              : productsLoading
                ? "Loading products..."
                : `${products.length} products found`}
          </div>

            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={`Search ${slug.replace("-", " ")} products...`}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="flex items-center gap-2 flex-1">
                  <SortAsc className="h-4 w-4 shrink-0" />
                  <Select value={currentSort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden shrink-0">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Categories & Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6 px-3">
                    {/* Categories Section */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Categories</h3>
                      <nav className="space-y-1">
                        {productsCategory.map((category) => {
                          const categorySlug = category.href.split('/browse/')[1];
                          const isActive = categorySlug === slug;
                          return (
                            <Link
                              key={category.name}
                              href={category.href}
                              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              {category.name}
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t pt-4 space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-sm">Product Filters</h3>
                        {activeFilterCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-auto p-1 text-xs"
                          >
                            Clear ({activeFilterCount})
                          </Button>
                        )}
                      </div>

                      {/* Mobile filters content */}
                      {filtersLoading ? (
                        <div className="space-y-6">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-3">
                              <Skeleton className="h-4 w-1/3" />
                              <div className="space-y-2">
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-2/3" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        filters.map((section) => (
                          <div key={section.id} className="space-y-3">
                            <Label className="text-sm font-medium">
                              {section.name}
                            </Label>
                          {section.type === "price-range" ? (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`min-price-mobile`}
                                  className="text-sm"
                                >
                                  Min Price (₱)
                                </Label>
                                <Input
                                  id={`min-price-mobile`}
                                  type="number"
                                  placeholder="0"
                                  min="0"
                                  value={priceRange.min}
                                  onChange={(e) =>
                                    handlePriceRangeChange(
                                      "min",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`max-price-mobile`}
                                  className="text-sm"
                                >
                                  Max Price (₱)
                                </Label>
                                <Input
                                  id={`max-price-mobile`}
                                  type="number"
                                  placeholder="No limit"
                                  min="0"
                                  value={priceRange.max}
                                  onChange={(e) =>
                                    handlePriceRangeChange(
                                      "max",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {section.options.map((option) => (
                                <div
                                  key={option.value}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`filter-mobile-${section.id}-${option.value}`}
                                    checked={
                                      selectedFilters[
                                        section.id.toLowerCase() as keyof ProductsQueryParams
                                      ] === option.value
                                    }
                                    onCheckedChange={(checked) =>
                                      handleFilterChange(
                                        section.id,
                                        option.value,
                                        checked as boolean
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`filter-mobile-${section.id}-${option.value}`}
                                    className="text-sm font-normal"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Desktop Sidebar */}
            <Card className="hidden lg:block h-fit sticky top-8 py-6">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <nav className="space-y-2">
                  {productsCategory.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        category.href.includes(slug)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>

                {/* Desktop Filters */}
                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Filters</h3>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear ({activeFilterCount})
                      </Button>
                    )}
                  </div>

                  {filtersLoading ? (
                    <div className="space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3">
                          <Skeleton className="h-4 w-1/3" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filters.map((section) => (
                        <Collapsible key={section.id} defaultOpen>
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-0 text-left">
                            <Label className="font-medium cursor-pointer">
                              {section.name}
                            </Label>
                            <ChevronDown className="h-4 w-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3">
                            {section.type === "price-range" ? (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`min-price-desktop`}
                                    className="text-sm"
                                  >
                                    Min (₱)
                                  </Label>
                                  <Input
                                    id={`min-price-desktop`}
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    value={priceRange.min}
                                    onChange={(e) =>
                                      handlePriceRangeChange(
                                        "min",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`max-price-desktop`}
                                    className="text-sm"
                                  >
                                    Max (₱)
                                  </Label>
                                  <Input
                                    id={`max-price-desktop`}
                                    type="number"
                                    placeholder="No limit"
                                    min="0"
                                    value={priceRange.max}
                                    onChange={(e) =>
                                      handlePriceRangeChange(
                                        "max",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {section.options.map((option) => (
                                  <div
                                    key={option.value}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`filter-desktop-${section.id}-${option.value}`}
                                      checked={
                                        selectedFilters[
                                          section.id.toLowerCase() as keyof ProductsQueryParams
                                        ] === option.value
                                      }
                                      onCheckedChange={(checked) =>
                                        handleFilterChange(
                                          section.id,
                                          option.value,
                                          checked as boolean
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={`filter-desktop-${section.id}-${option.value}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {option.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Grid */}
            <div className="lg:col-span-3">
              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : availableProducts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <h3 className="text-lg font-medium mb-2">
                      No products found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters to see more results.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {availableProducts.length} products
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {availableProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={
                          slug == "tools" || slug == "parts-accessories"
                            ? `/view/e/${product.id}`
                            : `/view/v/${product.id}`
                        }
                        className="group"
                      >
                        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:scale-[1.02] h-full">
                          <div className="aspect-square overflow-hidden">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={400}
                              height={500}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <CardContent className="p-3 sm:p-4 flex flex-col justify-between flex-1">
                            <h3 className="font-medium line-clamp-2 mb-2 text-sm sm:text-base">
                              {product.name}
                            </h3>
                            <div className="space-y-2">
                              <p className="text-lg sm:text-2xl font-bold text-primary">
                                ₱{Number(product.price).toLocaleString()}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {product.quantity} in stock
                                </Badge>
                                <Badge variant="outline" className="text-xs flex items-center gap-1 capitalize">
                                  <MapPin className="h-3 w-3" />
                                  {product.branch}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Development Warning */}
          {showDevWarning && (
            <Alert className="fixed bottom-4 right-4 max-w-sm z-50 border-yellow-200 bg-yellow-50">
              <AlertDescription className="flex items-start gap-2">
                <span>⚠️</span>
                <div className="flex-1 text-sm">
                  This website is currently in development. All products shown
                  are placeholders only.
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => setShowDevWarning(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
