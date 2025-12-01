"use client";
import React, { use, useEffect, useState } from "react";
import { createReservation, getProduct } from "@/app/actions";
import { Product } from "@/hooks/useQuery";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Tag, 
  ShoppingCart, 
  Lock,
  CalendarDays,
  Truck,
  Shield,
  RefreshCw,
  Car,
  X
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

export default function VehicleDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [initialLoad, setInitialLoad] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [reservationFee, setReservationFee] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"reserve" | "book" | null>(null);
  const { slug } = use(params);

  const { isSignedIn, user } = useUser();

  useEffect(() => {
    async function fetchProduct() {
      const fetchedProduct = await getProduct(slug);
      setProduct(fetchedProduct.data || null);
      setReservationFee((fetchedProduct.data?.price || 0) * 0.05);
      setInitialLoad(false);
    }
    fetchProduct();
  }, [slug]);

  const handleOpenModal = (type: "reserve" | "book") => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("productName", product?.name || "");
    formData.append("productId", slug);
    formData.append("userId", user?.id || "");
    formData.append("reservationFee", reservationFee.toString());
    formData.append("productPrice", product?.price.toString() || "0");

    if (modalType === "reserve") {
      const data = await createReservation(formData);

      window.open(data.redirectUrl, "_blank")?.focus();
      setIsSubmitting(false);
      handleCloseModal();
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
              Vehicle Not Found
            </CardTitle>
            <p className="text-muted-foreground mb-4">
              The vehicle with ID "{slug}" could not be located.
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
    <>
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
              <Card className="overflow-hidden">
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
                <Card>
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

                <Card>
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

                <Card>
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
                    {isOutOfStock ? "Out of Stock" : "Available"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3">
                {isSignedIn ? (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleOpenModal("reserve")}
                      disabled={isOutOfStock}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {isOutOfStock ? "Out of Stock" : "Reserve Unit"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      onClick={() => handleOpenModal("book")}
                      disabled={isOutOfStock}
                    >
                      <Car className="h-5 w-5 mr-2" />
                      Book Test Drive
                    </Button>
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="lg" className="w-full">
                      <Lock className="h-5 w-5 mr-2" />
                      Sign In to Continue
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

              {/* Reservation Fee Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reservation Fee (5%)</span>
                      <span className="font-medium">₱{reservationFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Balance on Claiming</span>
                      <span className="font-medium">₱{(product.price - reservationFee).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                    <CardTitle>Vehicle Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {product.description || "No description available for this vehicle."}
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
                      <div className="flex justify-between py-2">
                        <span className="font-medium">Reservation Fee</span>
                        <span className="text-muted-foreground">5% of total price</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto py-6">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={handleCloseModal}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-center pr-8">
                {modalType === "reserve" ? "Reserve Your Vehicle" : "Book a Test Drive"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      defaultValue={user?.firstName ?? ""}
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      defaultValue={user?.lastName ?? ""}
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Contact Number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""}
                    placeholder="Email Address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment">
                    Preferred Date & Time of {modalType === "reserve" ? "Claiming" : "Test Drive"}
                  </Label>
                  <Input
                    id="appointment"
                    name="appointment"
                    type="datetime-local"
                    min={(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.toISOString().slice(0, 16);
                    })()}
                    required
                  />
                </div>

                {modalType === "reserve" && (
                  <>
                    <Separator className="my-4" />
                    <Card className="py-6">
                      <CardHeader>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Reservation Fee:</span>
                          <span className="font-medium">₱{reservationFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pay upon claiming:</span>
                          <span className="font-medium">₱{(product.price - reservationFee).toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• A 5% reservation fee is required to secure your vehicle.</p>
                          <p>• The remaining balance will be due upon claiming.</p>
                          <p>• The reservation fee is non-refundable.</p>
                          <p>• Failure to claim within 1 week will result in forfeiture.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                    variant={modalType === "reserve" ? "default" : "secondary"}
                  >
                    {isSubmitting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : modalType === "reserve" ? (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    ) : (
                      <CalendarDays className="h-4 w-4 mr-2" />
                    )}
                    {modalType === "reserve" ? "Reserve Now" : "Book Now"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
