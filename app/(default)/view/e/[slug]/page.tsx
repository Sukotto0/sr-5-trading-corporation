"use client";
import React, { use, useEffect, useState } from "react";
import { addToCart, getProduct } from "@/app/actions";
import { Product } from "@/hooks/useQuery";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Tag, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Lock,
  Truck,
  Shield,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [initialLoad, setInitialLoad] = useState(true);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { slug } = use(params);

  const { isSignedIn, user } = useUser();

  useEffect(() => {
    async function fetchProduct() {
      const fetchedProduct = await getProduct(slug);
      setProduct(fetchedProduct.data || null);
      setInitialLoad(false);
    }
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddToCartLoading(true);

    const formData = new FormData();
    formData.append("productId", slug);
    formData.append("productName", product?.name || "");
    formData.append("userId", user?.id || "");
    formData.append("price", product?.price.toString() || "0");
    formData.append("quantity", quantity.toString());
    formData.append("imageUrl", product?.imageUrl || "");

    console.log("Add to cart:", Object.fromEntries(formData.entries()));
    const response = await addToCart(Object.fromEntries(formData.entries()));
    if (response.success) {
      setAddToCartLoading(false);
      alert("Item added to cart successfully!");
    } else {
      setAddToCartLoading(false);
      alert("Failed to add item to cart.");
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const isOutOfStock = !!(product && product.quantity === 0);

  // Loading state
  if (initialLoad) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-6 w-40 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl font-bold text-destructive mb-2">
              Product Not Found
            </CardTitle>
            <p className="text-muted-foreground mb-4">
              The item with ID "{slug}" could not be located.
            </p>
            <Button onClick={() => history.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/browse/${product.category}`}>
                  {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="text-muted-foreground">
                {product.name}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => history.back()} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="py-0">
                <CardContent className="flex items-center p-4">
                  <Package className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Stock</p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity} available
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="py-0">
                <CardContent className="flex items-center p-4">
                  <Tag className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {product.category}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="py-0">
                <CardContent className="flex items-center p-4">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {product.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold text-primary">
                  ₱{typeof product.price === "number" 
                    ? product.price.toLocaleString() 
                    : "Price Unavailable"}
                </div>
                <Badge 
                  variant={isOutOfStock ? "destructive" : "default"}
                  className="text-sm"
                >
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Quantity Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Quantity</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        Math.max(1, parseInt(e.target.value) || 1),
                        product.quantity || 1
                      )
                    )
                  }
                  className="w-20 text-center"
                  disabled={isOutOfStock}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.quantity || 0) || isOutOfStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {product.quantity} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isSignedIn ? (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={addToCartLoading || isOutOfStock}
                  >
                    {addToCartLoading ? (
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 mr-2" />
                    )}
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    disabled={isOutOfStock}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Now
                  </Button>
                </>
              ) : (
                <SignInButton mode="modal">
                  <Button size="lg" className="w-full">
                    <Lock className="h-5 w-5 mr-2" />
                    Sign In to Purchase
                  </Button>
                </SignInButton>
              )}
            </div>

            {/* Features */}
            {/* <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RefreshCw className="h-4 w-4 text-primary" />
                <span>Easy Returns</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card className="py-6">
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {product.description || "No description available for this product."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card className="py-6">
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Category</span>
                      <span className="text-muted-foreground capitalize">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Location</span>
                      <span className="text-muted-foreground capitalize">{product.location}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Stock Quantity</span>
                      <span className="text-muted-foreground">{product.quantity}</span>
                    </div>
                    {/* <div className="flex justify-between py-2">
                      <span className="font-medium">Product ID</span>
                      <span className="text-muted-foreground font-mono">{slug}</span>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
