"use client";

import { useState, type FC } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCreateComment } from "@/hooks/query/useComments";
import toast from "react-hot-toast";

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const CommentForm: FC<CommentFormProps> = ({
  postId,
  parentCommentId,
  onCancel,
  placeholder = "Write a comment...",
  autoFocus = false,
}) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [content, setContent] = useState("");
  const createComment = useCreateComment(postId);

  if (!session) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        <Link
          href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`}
          className="text-foreground underline hover:text-muted-foreground transition-colors"
        >
          Sign in
        </Link>{" "}
        to join the conversation.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    createComment.mutate(
      {
        content: trimmed,
        authorId: session.user!.id,
        parentCommentId,
      },
      {
        onSuccess: () => {
          setContent("");
          onCancel?.();
        },
        onError: () => {
          toast.error("Failed to post comment.");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={parentCommentId ? 2 : 3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || createComment.isPending}
          className="px-4 py-1.5 text-xs font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createComment.isPending
            ? "Posting..."
            : parentCommentId
              ? "Reply"
              : "Comment"}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
