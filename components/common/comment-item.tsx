"use client";

import { useState, type FC } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FiHeart, FiMessageCircle, FiTrash2 } from "react-icons/fi";
import {
  useReplies,
  useDeleteComment,
  useToggleCommentLike,
  type CommentData,
} from "@/hooks/query/useComments";
import CommentForm from "./comment-form";

interface CommentItemProps {
  comment: CommentData;
  postId: string;
  depth?: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const CommentItem: FC<CommentItemProps> = ({ comment, postId, depth = 0 }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const { data: replies } = useReplies(showReplies ? comment.id : "");

  const deleteComment = useDeleteComment(postId);
  const toggleLike = useToggleCommentLike(postId);

  const isAuthor = userId === comment.authorId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canDelete = isAuthor || isAdmin;
  const hasReplies = comment._count.replies > 0;

  const handleDelete = () => {
    if (!userId) return;
    deleteComment.mutate({ commentId: comment.id, userId });
  };

  const handleLike = () => {
    if (!userId) return;
    toggleLike.mutate({ commentId: comment.id, userId });
  };

  return (
    <div className={depth > 0 ? "ml-6 sm:ml-10" : ""}>
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <div className="shrink-0">
          {comment.author.avatar ? (
            <Image
              src={comment.author.avatar}
              alt={comment.author.name}
              width={depth > 0 ? 28 : 32}
              height={depth > 0 ? 28 : 32}
              className="rounded-full"
            />
          ) : (
            <div
              className={`rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground ${
                depth > 0 ? "w-7 h-7" : "w-8 h-8"
              }`}
            >
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">
              {comment.author.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap wrap-break-word">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {userId && (
              <button
                onClick={handleLike}
                disabled={toggleLike.isPending}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <FiHeart
                  size={13}
                  className={
                    comment._count.likes > 0 ? "fill-red-400 text-red-400" : ""
                  }
                />
                {comment._count.likes > 0 && (
                  <span>{comment._count.likes}</span>
                )}
              </button>
            )}

            {userId && depth < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <FiMessageCircle size={13} />
                Reply
              </button>
            )}

            {hasReplies && !showReplies && (
              <button
                onClick={() => setShowReplies(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {comment._count.replies}{" "}
                {comment._count.replies === 1 ? "reply" : "replies"}
              </button>
            )}

            {hasReplies && showReplies && (
              <button
                onClick={() => setShowReplies(false)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Hide replies
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteComment.isPending}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors ml-auto"
              >
                <FiTrash2 size={12} />
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Reply to ${comment.author.name}...`}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && replies && replies.length > 0 && (
        <div className="border-l-2 border-border">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
