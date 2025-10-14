import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const productsData: Array<any> = [];

  try {
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const branch = searchParams.get("branch");
    const category = searchParams.get("category") || "trucks";
    const sortBy = searchParams.get("sortBy") || "relevance";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    try {
      const client = await clientPromise;
      const db = client.db("main");
      const data = await db.collection("inventory").find({}).toArray();
      productsData.push(...data);
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { success: false, error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    // Transform inventory data to match Product interface
    const transformedProducts = productsData.map((item) => ({
      id: item._id || item.id || Math.random(),
      name: item.name || "Unnamed Product",
      imageUrl: item.imageUrl || "/images/placeholder.jpg",
      imageAlt: item.name || "Product image",
      price: item.price || 0, // Return the numeric price directly from database
      description: item.description || "No description available",
      category: item.category || "general", 
      branch: item.location || "unknown",
      rating: item.rating || 5,
      createdAt: item.createdAt,
      lastUpdated: item.lastUpdated
    }));

    let filteredProducts = transformedProducts.filter(
      (product) => product.category === category
    );

    // Apply branch filter
    if (branch) {
      filteredProducts = filteredProducts.filter(
        (product) => product.branch === branch
      );
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter((product) => {
        const price = product.price || 0;
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "latest":
        filteredProducts.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.lastUpdated || 0).getTime();
          const dateB = new Date(b.createdAt || b.lastUpdated || 0).getTime();
          return dateB - dateA;
        });
        break;
      default:
        // relevance - keep original order
        break;
    }

    return NextResponse.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
