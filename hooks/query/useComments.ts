"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// ── Types ───────────────────────────────────────────────────

export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface CommentData {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  _count: {
    likes: number;
    replies: number;
  };
}

// ── Fetch comments for a post ───────────────────────────────

export const useComments = (postId: string) => {
  return useQuery<CommentData[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await axios.get(`/api/comments?postId=${postId}`);
      return res.data.data;
    },
    enabled: !!postId,
  });
};

// ── Fetch replies for a comment ─────────────────────────────

export const useReplies = (parentId: string) => {
  return useQuery<CommentData[]>({
    queryKey: ["comments", "replies", parentId],
    queryFn: async () => {
      const res = await axios.get(`/api/comments?parentId=${parentId}`);
      return res.data.data;
    },
    enabled: !!parentId,
  });
};

// ── Create a comment ────────────────────────────────────────

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      content: string;
      authorId: string;
      parentCommentId?: string;
    }) => {
      const res = await axios.post("/api/comments", {
        ...data,
        postId,
      });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "replies", variables.parentCommentId],
        });
      }
    },
  });
};

// ── Delete a comment ────────────────────────────────────────

export const useDeleteComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      userId,
    }: {
      commentId: string;
      userId: string;
    }) => {
      await axios.delete(`/api/comments/${commentId}?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
};

// ── Toggle comment like ─────────────────────────────────────

export const useToggleCommentLike = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      userId,
    }: {
      commentId: string;
      userId: string;
    }) => {
      const res = await axios.post(`/api/comments/${commentId}/likes`, {
        userId,
      });
      return res.data.data as { liked: boolean; likesCount: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
};
