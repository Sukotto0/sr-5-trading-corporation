"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getCartItems, updateCartItem, removeCartItem } from "@/app/actions";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCartIcon, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Helper for formatting currency (using the Philippine Peso symbol for consistency)
const formatCurrency = (amount: any) => {
  // Basic currency formatting with commas for thousands
  return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

type CartItem = {
  _id: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
};
export default function ShoppingCart() {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getCartItems(user.id).then((response) => {
        if (response) {
          // Additional client-side filtering to ensure only items matching the current user ID are shown
          const filteredItems = response.filter((item: any) => item.userId === user.id);
          setCartItems(filteredItems || []);
        }
        setLoading(false);
      });
    }
  }, [user]);

  const incrementQuantity = async (id: string) => {
    const item = cartItems.find(item => item._id === id);
    if (item) {
      const newQuantity = item.quantity + 1;
      try {
        const result = await updateCartItem(id, newQuantity);
        if (result.success) {
          setCartItems((prev) =>
            prev?.map((item) =>
              item._id === id ? { ...item, quantity: newQuantity } : item
            )
          );
        } else {
          console.error('Failed to update cart item:', result.error);
        }
      } catch (error) {
        console.error('Error updating cart item:', error);
      }
    }
  };

  const decrementQuantity = async (id: string) => {
    const item = cartItems.find(item => item._id === id);
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      try {
        const result = await updateCartItem(id, newQuantity);
        if (result.success) {
          setCartItems((prev) =>
            prev?.map((item) =>
              item._id === id ? { ...item, quantity: newQuantity } : item
            )
          );
        } else {
          console.error('Failed to update cart item:', result.error);
        }
      } catch (error) {
        console.error('Error updating cart item:', error);
      }
    }
  };

  const removeItem = async (id: string) => {
    try {
      const result = await removeCartItem(id);
      if (result.success) {
        setCartItems((prev) => prev?.filter((item) => item._id !== id));
      } else {
        console.error('Failed to remove cart item:', result.error);
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  const subtotal =
    cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const total = subtotal; // Keeping total the same as subtotal for simplicity (no taxes/shipping)

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCartIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Shopping Cart
          </h1>
          <Badge variant="secondary" className="ml-auto">
            {cartItems?.length || 0} items
          </Badge>
        </div>

        {cartItems && cartItems?.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start shopping to add items to your cart
              </p>
              <Link className="flex flex-row mx-auto items-center gap-2 bg-emerald-600 w-fit text-white px-3 py-2 rounded" href="/browse/trucks">
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                Start Shopping
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems?.map((item) => (
                <Card key={item._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="shrink-0">
                        <Image
                          className="h-16 w-16 rounded-lg object-cover"
                          src={item.imageUrl}
                          alt={item.productName}
                          width={64}
                          height={64}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => decrementQuantity(item._id)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => incrementQuantity(item._id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            {cartItems && cartItems?.length > 0 && (
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>₱0.00</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>

                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>

                    <div className="text-center text-xs text-muted-foreground">
                      <p>Secure checkout powered by Stripe</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
