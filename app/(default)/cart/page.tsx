"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getCartItems, updateCartItem, removeCartItem } from "@/app/actions";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCartIcon, ArrowRight, ShoppingBag, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
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
  availableStock: number;
};

export default function ShoppingCart() {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
    if (item && item.quantity < item.availableStock) {
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
    } else if (item && item.quantity >= item.availableStock) {
      alert(`Cannot exceed available stock (${item.availableStock} units available)`);
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

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(cartItems.map(item => item._id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.has(item._id));

  const subtotal =
    selectedCartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const total = subtotal; // Keeping total the same as subtotal for simplicity (no taxes/shipping)

  const handleCheckout = () => {
    
  }

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
              {/* Select All / Deselect All */}
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs"
                >
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  className="text-xs"
                >
                  <Square className="h-3 w-3 mr-1" />
                  Deselect All
                </Button>
                <span className="text-sm text-muted-foreground ml-auto">
                  {selectedItems.size} of {cartItems.length} selected
                </span>
              </div>
              {cartItems?.map((item) => (
                <Card key={item._id} className={selectedItems.has(item._id) ? "border-emerald-500 border-2" : ""}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <Checkbox
                            checked={selectedItems.has(item._id)}
                            onCheckedChange={() => toggleItemSelection(item._id)}
                          />
                        </div>
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
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.availableStock} in stock
                          </p>
                          
                          {/* Quantity Controls - Mobile */}
                          <div className="flex items-center space-x-2 mt-3 sm:hidden">
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
                              disabled={item.quantity >= item.availableStock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Remove Button - Mobile */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item._id)}
                          className="text-destructive hover:text-destructive sm:hidden"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quantity Controls - Desktop */}
                      <div className="hidden sm:flex items-center space-x-2">
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
                          disabled={item.quantity >= item.availableStock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total - Mobile: Bottom, Desktop: Right */}
                      <div className="flex justify-between items-center sm:block sm:text-right">
                        <span className="text-sm text-muted-foreground sm:hidden">Total:</span>
                        <p className="font-semibold text-lg">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button - Desktop */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item._id)}
                        className="text-destructive hover:text-destructive hidden sm:flex"
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
              <div className="lg:col-span-1 sticky top-20 h-fit">
                <Card className=" py-6">
                  <CardHeader className="">
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Selected Items List */}
                    {selectedCartItems.length > 0 && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        <p className="text-sm font-medium text-muted-foreground">Selected Items ({selectedCartItems.length})</p>
                        {selectedCartItems.map((item) => (
                          <div key={item._id} className="flex justify-between text-sm py-2 border-b">
                            <div className="flex-1">
                              <p className="font-medium line-clamp-1">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                            </div>
                            <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(total)}</span>
                    </div>

                    {selectedItems.size > 0 ? (
                      <Link 
                        href={{
                          pathname: "/checkout",
                          query: { items: Array.from(selectedItems).join(',') }
                        }} 
                        className="w-full flex flex-row items-center justify-center bg-emerald-600 text-white px-4 py-3 rounded-md font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    ) : (
                      <Button disabled className="w-full">
                        Select items to checkout
                      </Button>
                    )}
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
