"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  _count: {
    posts: number;
    collections: number;
  };
}

const fetchCategories = async (): Promise<CategorySummary[]> => {
  const response = await axios.get("/api/categories");
  return response.data.data;
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
};

export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const response = await axios.get("/api/categories");
      const categories: CategorySummary[] = response.data.data;
      const found = categories.find((c) => c.slug === slug);
      if (!found) throw new Error("Category not found");
      return found;
    },
    enabled: !!slug,
  });
};
