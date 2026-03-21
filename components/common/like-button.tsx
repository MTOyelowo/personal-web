"use client";

import { useSession } from "next-auth/react";
import { FiHeart } from "react-icons/fi";
import { usePostLikeStatus, useTogglePostLike } from "@/hooks/query/useLikes";
import Link from "next/link";

interface LikeButtonProps {
  postId: string;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: likeStatus } = usePostLikeStatus(postId, userId);
  const toggleLike = useTogglePostLike(postId);

  const liked = likeStatus?.liked ?? false;
  const count = likeStatus?.likesCount ?? 0;

  const handleToggle = () => {
    if (!userId) return;
    toggleLike.mutate(userId);
  };

  if (!session) {
    return (
      <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <FiHeart size={18} />
        <span>{count}</span>
        <Link
          href="/auth/signin"
          className="text-xs underline hover:text-foreground transition-colors ml-1"
        >
          Sign in to like
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={toggleLike.isPending}
      className="inline-flex items-center gap-1.5 text-sm transition-colors group"
      aria-label={liked ? "Unlike post" : "Like post"}
    >
      <FiHeart
        size={18}
        className={
          liked
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground group-hover:text-red-400 transition-colors"
        }
      />
      <span
        className={
          liked
            ? "text-red-500 font-medium"
            : "text-muted-foreground group-hover:text-foreground transition-colors"
        }
      >
        {count}
      </span>
    </button>
  );
}
