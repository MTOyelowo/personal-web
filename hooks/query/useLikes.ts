"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// ── Types ───────────────────────────────────────────────────

interface LikeStatus {
  liked: boolean;
  likesCount: number;
}

// ── Get like status for a post ──────────────────────────────

export const usePostLikeStatus = (postId: string, userId?: string) => {
  return useQuery<LikeStatus>({
    queryKey: ["post-likes", postId, userId],
    queryFn: async () => {
      const params = userId ? `?userId=${userId}` : "";
      const res = await axios.get(`/api/posts/${postId}/likes${params}`);
      return res.data.data;
    },
    enabled: !!postId,
  });
};

// ── Toggle like on a post ───────────────────────────────────

export const useTogglePostLike = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await axios.post(`/api/posts/${postId}/likes`, { userId });
      return res.data.data as LikeStatus;
    },
    onSuccess: (data, userId) => {
      queryClient.setQueryData(["post-likes", postId, userId], data);
      // Also invalidate the post query to update the count
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
};
