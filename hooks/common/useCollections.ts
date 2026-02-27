"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface CollectionSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    items: number;
  };
}

export interface CollectionDetail extends Omit<CollectionSummary, "_count"> {
  items: {
    id: string;
    order: number;
    post: {
      id: string;
      title: string;
      slug: string;
      meta: string;
      thumbnailUrl: string | null;
      createdAt: string;
      author: {
        id: string;
        name: string;
      };
    };
  }[];
}

const fetchCollections = async (): Promise<CollectionSummary[]> => {
  const response = await axios.get("/api/collections");
  return response.data.data;
};

const fetchCollection = async (slug: string): Promise<CollectionDetail> => {
  const response = await axios.get(`/api/collections/${slug}`);
  return response.data.data;
};

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });
};

export const useCollection = (slug: string) => {
  return useQuery({
    queryKey: ["collection", slug],
    queryFn: () => fetchCollection(slug),
    enabled: !!slug,
  });
};
