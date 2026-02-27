"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// ── Dashboard Stats ─────────────────────────────────────────

interface DashboardStats {
  posts: number;
  dailyWords: number;
  collections: number;
  categories: number;
  recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    createdAt: string;
    author: { name: string };
    _count: { comments: number; likes: number };
  }>;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const res = await axios.get<{ success: boolean; data: DashboardStats }>(
        "/api/admin/stats",
      );
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

// ── Categories ──────────────────────────────────────────────

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  _count: { posts: number; collections: number };
}

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await axios.get<{
        success: boolean;
        data: AdminCategory[];
      }>("/api/categories");
      return res.data.data;
    },
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      description?: string;
    }) => {
      const res = await axios.post("/api/categories", data);
      return res.data.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      slug?: string;
      description?: string;
      order?: number;
    }) => {
      const res = await axios.patch(`/api/categories/${id}`, data);
      return res.data.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/categories/${id}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
};

// ── Posts ────────────────────────────────────────────────────

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  meta: string;
  categoryId: string;
  tags: string[];
  thumbnailUrl: string | null;
  featured: boolean;
  editorPick: boolean;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; avatar: string | null };
  category: { id: string; name: string } | null;
  _count: { likes: number; comments: number };
}

interface PostsResponse {
  posts: AdminPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useAdminPosts = (
  page = 1,
  limit = 20,
  search?: string,
  categoryId?: string,
) => {
  return useQuery({
    queryKey: ["admin", "posts", page, limit, search, categoryId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId);
      const res = await axios.get<{ success: boolean; data: PostsResponse }>(
        `/api/posts?${params}`,
      );
      return res.data.data;
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/posts/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "posts"] }),
  });
};

export const useTogglePostField = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      field,
    }: {
      id: string;
      field: "featured" | "editorPick";
    }) => {
      const res = await axios.patch(`/api/posts/${id}/toggle`, { field });
      return res.data.data as {
        id: string;
        featured: boolean;
        editorPick: boolean;
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "posts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// ── Daily Words ─────────────────────────────────────────────

export interface AdminDailyWord {
  id: string;
  date: string;
  text: string;
  author: string | null;
  source: string | null;
  commentary: string | null;
  backgrounds: Array<{ id: string; src: string; alt: string; order: number }>;
  createdAt: string;
}

export const useAdminDailyWords = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["admin", "daily-words", page, limit],
    queryFn: async () => {
      const res = await axios.get<{
        success: boolean;
        data: { dailyWords: AdminDailyWord[]; total: number };
      }>(`/api/admin/daily-words?page=${page}&limit=${limit}`);
      return res.data.data;
    },
  });
};

export const useCreateDailyWord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      date: string;
      text: string;
      author?: string;
      source?: string;
      commentary?: string;
      backgrounds?: Array<{ src: string; alt?: string }>;
    }) => {
      const res = await axios.post("/api/daily-words", data);
      return res.data.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "daily-words"] }),
  });
};

export const useUpdateDailyWord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      date?: string;
      text?: string;
      author?: string;
      source?: string;
      commentary?: string;
      backgrounds?: Array<{ src: string; alt?: string }>;
    }) => {
      const res = await axios.patch(`/api/daily-words/${id}`, data);
      return res.data.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "daily-words"] }),
  });
};

export const useDeleteDailyWord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/daily-words/${id}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "daily-words"] }),
  });
};

// ── Collections ─────────────────────────────────────────────

export interface AdminCollection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  order: number;
  categoryId: string;
  category: { id: string; name: string };
  _count: { items: number };
  createdAt: string;
}

export const useAdminCollections = (categoryId?: string) => {
  return useQuery({
    queryKey: ["admin", "collections", categoryId],
    queryFn: async () => {
      const params = categoryId ? `?categoryId=${categoryId}` : "";
      const res = await axios.get<{
        success: boolean;
        data: AdminCollection[];
      }>(`/api/collections${params}`);
      return res.data.data;
    },
  });
};

export const useCreateCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      slug: string;
      description?: string;
      coverUrl?: string;
      categoryId: string;
    }) => {
      const res = await axios.post("/api/collections", data);
      return res.data.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "collections"] }),
  });
};

export const useUpdateCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      slug?: string;
      description?: string;
      coverUrl?: string;
      categoryId?: string;
    }) => {
      const res = await axios.patch(`/api/collections/${id}`, data);
      return res.data.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "collections"] }),
  });
};

export const useDeleteCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/collections/${id}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "collections"] }),
  });
};
