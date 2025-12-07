"use client";
import React, { use, useEffect, useState } from "react";
import { createCheckoutOnsite, createReservation, getProduct, createAppointment } from "@/app/actions";
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
  X,
  CreditCard,
  Banknote
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
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [branch, setBranch] = useState("");
  const { slug } = use(params);

  // console.log('🚀 PRODUCT PAGE COMPONENT LOADED - SLUG:', slug);

  const { isSignedIn, user } = useUser();

  useEffect(() => {
    async function fetchProduct() {
      const fetchedProduct = await getProduct(slug);
      const product = fetchedProduct.data;
      setProduct(product || null);
      setReservationFee((product?.price || 0) * 0.05);
      // Set branch from product location
      setBranch(product?.location || "Albay");
      // Use first image from images array, fallback to imageUrl
      const initialImage = product?.images && product.images.length > 0 ? product.images[0] : product?.imageUrl || "";
      setSelectedImage(initialImage);
      setCurrentImageIndex(0);
      
      setInitialLoad(false);
    }
    fetchProduct();
  }, [slug]);

  const handleOpenModal = (type: "reserve" | "book") => {
    setModalType(type);
    setShowModal(true);
    // Reset form fields (branch is set from product location)
    setPickupDate("");
    setPickupTime("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType(null);
    // Reset form fields (branch stays set from product location)
    setPickupDate("");
    setPickupTime("");
  };

  // Get tomorrow's date for minimum date validation
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleNextImage = () => {
    const allImages = product?.images && product.images.length > 0 
      ? product.images 
      : product?.imageUrl 
      ? [product.imageUrl] 
      : [];
    if (allImages.length > 0) {
      const nextIndex = (currentImageIndex + 1) % allImages.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(allImages[nextIndex]);
    }
  };

  const handlePreviousImage = () => {
    const allImages = product?.images && product.images.length > 0 
      ? product.images 
      : product?.imageUrl 
      ? [product.imageUrl] 
      : [];
    if (allImages.length > 0) {
      const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(allImages[prevIndex]);
    }
  };

  const handleThumbnailClick = (img: string, index: number) => {
    setSelectedImage(img);
    setCurrentImageIndex(index);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.target as HTMLFormElement);
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    // Validate required fields
    if (!firstName || firstName.trim().length < 2) {
      alert("Please enter a valid first name.");
      return;
    }

    if (!lastName || lastName.trim().length < 2) {
      alert("Please enter a valid last name.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Validate phone number (Philippine format)
    const phoneRegex = /^(09|\+639)\d{9}$/;
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    if (!phone || !phoneRegex.test(cleanedPhone)) {
      alert("Please enter a valid Philippine mobile number (e.g., 09XX-XXX-XXXX).");
      return;
    }

    // Validate branch selection
    if (!branch) {
      alert("Please select a pickup location.");
      return;
    }

    // Validate pickup date
    if (!pickupDate) {
      alert("Please select a pickup date.");
      return;
    }

    // Validate that date is tomorrow or later
    const selectedDate = new Date(pickupDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < tomorrow) {
      alert("Pickup date must be at least tomorrow or later.");
      return;
    }

    // Validate pickup time
    if (!pickupTime) {
      alert("Please select a pickup time.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format appointment date/time
      const appointment = `${pickupDate} ${pickupTime}`;

      // Generate reference number
      const referenceNumber = `SR5-${firstName.slice(0, 1)}${lastName.slice(0, 1)}-${Date.now()}`;

      // Create transaction data structure
      const transactionData = {
        _id: referenceNumber,
        firstName,
        lastName,
        email,
        phone,
        items: [
          {
            name: product?.name || "",
            code: slug,
            quantity: 1,
            amount: {
              value: reservationFee
            },
            totalAmount: {
              value: reservationFee
            }
          }
        ],
        toPay: reservationFee,
        productPrice: product?.price || 0,
        userId: user?.id || "",
        appointment,
        branch,
        paymentMethod: "online", // Reservations are always online payment
        referenceNumber
      };

      if (modalType === "reserve") {
        const data = await createCheckoutOnsite(transactionData);

        if (data?.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          alert("Failed to initialize payment gateway. Please try again.");
          setIsSubmitting(false);
        }
      } else if (modalType === "book") {
        // Create appointment for test drive
        const appointmentData = {
          firstName,
          lastName,
          email,
          phoneNumber: phone,
          purpose: `Test Drive - ${product?.name}`,
          preferredDate: pickupDate,
          preferredTime: pickupTime,
          userId: user?.id || "",
          branch,
          productId: slug,
          productName: product?.name || "",
          status: "scheduled"
        };

        const result = await createAppointment(appointmentData);

        if (result?.success) {
          alert("✅ Test drive appointment booked successfully!");
          handleCloseModal();
          setIsSubmitting(false);
        } else {
          alert("Failed to book test drive. Please try again.");
          setIsSubmitting(false);
        }
      }
    } catch (error: any) {
      console.error("Reservation error:", error);
      alert("Failed to process reservation. Please try again.");
      setIsSubmitting(false);
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
                  <div className="aspect-square relative overflow-hidden group">
                    <Image
                      src={selectedImage || (product.images && product.images.length > 0 ? product.images[0] : product.imageUrl)}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Navigation Arrows */}
                    {(() => {
                      const allImages = product.images && product.images.length > 0 
                        ? product.images 
                        : product.imageUrl 
                        ? [product.imageUrl] 
                        : [];
                      // console.log('🎯 ARROWS - allImages:', allImages, 'length:', allImages.length, 'will show?', allImages.length > 1);
                      return allImages.length > 1 ? (
                        <>
                          <button
                            onClick={handlePreviousImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Previous image"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Next image"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          {/* Image Counter */}
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                            {currentImageIndex + 1} / {allImages.length}
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Image Gallery Thumbnails */}
              {(() => {
                // Combine all available images
                const allImages = product.images && product.images.length > 0 
                  ? product.images 
                  : product.imageUrl 
                  ? [product.imageUrl] 
                  : [];
                
                // console.log('Gallery - All images:', allImages, 'Length:', allImages.length);
                
                return allImages.length > 1 ? (
                  <div className="relative">
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-2">
                        {allImages.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => handleThumbnailClick(img, index)}
                            className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all shrink-0 w-20 h-20 ${
                              currentImageIndex === index ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Image
                              src={img}
                              alt={`Image ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

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
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b z-10 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {modalType === "reserve" ? "Reserve Your Vehicle" : "Book a Test Drive"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Contact Information */}
              <section className="space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-emerald-600" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column - Contact Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          defaultValue={user?.firstName ?? ""}
                          placeholder="Juan"
                          className="w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          defaultValue={user?.lastName ?? ""}
                          placeholder="Dela Cruz"
                          className="w-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""}
                        placeholder="juan@email.com"
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Contact Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="09XXXXXXXXX"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column - Schedule Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch" className="text-sm font-medium text-gray-700">
                        Pickup Location
                      </Label>
                      <Input
                        id="branch"
                        type="text"
                        value={branch ? `${branch}` : "Loading..."}
                        className="w-full bg-gray-50 cursor-not-allowed capitalize"
                        readOnly
                        disabled
                      />
                      {/* <p className="text-xs text-gray-500">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        Based on product location
                      </p> */}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickupDate" className="text-sm font-medium text-gray-700">
                        {modalType === "reserve" ? "Pickup Date" : "Test Drive Date"}
                      </Label>
                      <Input
                        id="pickupDate"
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={getTomorrowDate()}
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickupTime" className="text-sm font-medium text-gray-700">
                        {modalType === "reserve" ? "Pickup Time" : "Test Drive Time"}
                      </Label>
                      <select
                        id="pickupTime"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        required
                      >
                        <option value="">Choose a time...</option>
                        {Array.from({ length: 37 }, (_, i) => {
                          const hours = 8 + Math.floor(i / 4);
                          const minutes = (i % 4) * 15;
                          if (hours > 17 || (hours === 17 && minutes > 0)) return null;
                          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                          const displayTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
                          return <option key={timeString} value={timeString}>{displayTime}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Order Summary - Only for Reserve */}
              {modalType === "reserve" && (
                <section className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Order Summary</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      {product?.images && product.images.length > 0 ? (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{product?.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 capitalize">{product?.category}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2 text-sm sm:text-base">
                      <div className="flex justify-between text-gray-700">
                        <span>Full Price:</span>
                        <span className="font-medium">₱{product?.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Reservation Fee (5%):</span>
                        <span>₱{reservationFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                        <span>Balance on Claiming:</span>
                        <span>₱{(product!.price - reservationFee).toLocaleString()}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <ul className="text-xs sm:text-sm text-blue-900 space-y-1">
                        <li>• A 5% reservation fee is required to secure your vehicle</li>
                        <li>• The remaining balance will be due upon claiming</li>
                        <li>• The reservation fee is non-refundable</li>
                        <li>• Failure to claim within 1 week will result in forfeiture</li>
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1 py-5 sm:py-6 text-base"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-5 sm:py-6 text-base bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : modalType === "reserve" ? (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Proceed to Payment
                    </>
                  ) : (
                    <>
                      <CalendarDays className="h-5 w-5 mr-2" />
                      Book Test Drive
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
