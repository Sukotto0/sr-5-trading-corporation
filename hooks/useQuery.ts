import { useQuery } from "@tanstack/react-query";

export interface FilterOption {
  value: string;
  label: string;
  checked: boolean;
  stars?: number;
}

export interface Filter {
  id: string;
  name: string;
  type?: string;
  options: FilterOption[];
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  description: string;
  quantity: number;
  category: string;
  location: string;
  branch: string;
  createdAt?: string;
  lastUpdated?: string;
  images?: string[];
}

export interface ProductsQueryParams {
  branch?: string;
  rating?: string;
  category?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// Fetch filters
export const useFilters = () => {
  return useQuery({
    queryKey: ["filters"],
    queryFn: async (): Promise<Filter[]> => {
      const response = await fetch("/api/filters");
      if (!response.ok) {
        throw new Error("Failed to fetch filters");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch filters");
      }
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Add this at the end of the file to declare the custom JSX element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      trendIcon: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

// Fetch products with filters
export const useProducts = (params: ProductsQueryParams = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return useQuery({
    queryKey: ["products", params],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch(`/api/products?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch products");
      }
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
