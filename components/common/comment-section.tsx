"use client";

import type { FC } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { useComments } from "@/hooks/query/useComments";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";

interface CommentSectionProps {
  postId: string;
}

const CommentSection: FC<CommentSectionProps> = ({ postId }) => {
  const { data: comments, isLoading } = useComments(postId);

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-6">
        <FiMessageSquare size={20} />
        Comments
        {comments && comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({comments.length})
          </span>
        )}
      </h2>

      <CommentForm postId={postId} />

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-muted-foreground py-4">
            Loading comments...
          </p>
        )}

        {!isLoading && comments && comments.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}

        {comments &&
          comments.length > 0 &&
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
      </div>
    </section>
  );
};

export default CommentSection;
