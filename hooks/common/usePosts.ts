"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PostSummary } from "@/lib/transformPosts";

interface PostsQueryOptions {
  page?: number;
  limit?: number;
  featured?: boolean;
  editorPick?: boolean;
}

const fetchPosts = async (
  options: PostsQueryOptions = {},
): Promise<PostSummary[]> => {
  const { page = 1, limit = 10, featured, editorPick } = options;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (featured) params.set("featured", "true");
  if (editorPick) params.set("editorPick", "true");
  const response = await axios.get(`/api/posts?${params}`);
  return response.data.data.posts;
};

export const usePosts = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["posts", page, limit],
    queryFn: () => fetchPosts({ page, limit }),
  });
};

export const useFeaturedPosts = (limit = 2) => {
  return useQuery({
    queryKey: ["posts", "featured", limit],
    queryFn: () => fetchPosts({ limit, featured: true }),
  });
};

export const useEditorPicks = (limit = 3) => {
  return useQuery({
    queryKey: ["posts", "editorPick", limit],
    queryFn: () => fetchPosts({ limit, editorPick: true }),
  });
};

const fetchPostsByCategory = async (
  categoryId: string,
): Promise<PostSummary[]> => {
  const response = await axios.get(
    `/api/posts?categoryId=${categoryId}&limit=100`,
  );
  return response.data.data.posts;
};

const fetchPostsByTag = async (tag: string): Promise<PostSummary[]> => {
  const response = await axios.get(
    `/api/posts?tag=${encodeURIComponent(tag)}&limit=100`,
  );
  return response.data.data.posts;
};

export const usePostsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ["posts", "category", categoryId],
    queryFn: () => fetchPostsByCategory(categoryId),
    enabled: !!categoryId,
  });
};

export const usePostsByTag = (tag: string) => {
  return useQuery({
    queryKey: ["posts", "tag", tag],
    queryFn: () => fetchPostsByTag(tag),
    enabled: !!tag,
  });
};
