import type { Post, User, Comment } from "@prisma/client";

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Post Types
export interface PostsQueryParams extends PaginationParams {
  category?: string;
  tag?: string;
  search?: string;
}

export interface CreatePostDto {
  title: string;
  slug: string;
  meta: string;
  content: string;
  category: string;
  tags?: string[];
  thumbnail?: {
    url: string;
    publicId: string;
  };
  authorId: string;
}

export interface UpdatePostDto {
  title?: string;
  slug?: string;
  meta?: string;
  content?: string;
  category?: string;
  tags?: string[];
  thumbnail?: {
    url: string;
    publicId: string;
  };
  featured?: boolean;
  editorPick?: boolean;
}

export interface PostWithAuthor extends Post {
  author: Pick<User, "id" | "name" | "email" | "avatar">;
  _count?: {
    likes: number;
    comments: number;
  };
}

export type PostResponse = ApiResponse<PostWithAuthor>;

export type PostsResponse = ApiResponse<{
  posts: PostWithAuthor[];
  pagination: PaginationMeta;
}>;

// Auth Types
export interface SignupDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export type SafeUser = Omit<User, "password">;

export type AuthResponse = ApiResponse<{
  user: SafeUser;
  token?: string;
}>;

// Comment Types
export interface CreateCommentDto {
  content: string;
  postId: string;
  authorId: string;
  parentCommentId?: string;
}

export interface CommentsQueryParams {
  postId?: string;
  parentId?: string;
}

export interface CommentWithAuthor extends Comment {
  author: Pick<User, "id" | "name" | "email" | "avatar">;
  _count?: {
    likes: number;
    replies: number;
  };
}

export type CommentResponse = ApiResponse<CommentWithAuthor>;

export type CommentsResponse = ApiResponse<CommentWithAuthor[]>;

// User Types
export interface UpdateUserDto {
  name?: string;
  bio?: string;
  avatar?: string;
}

export type UserResponse = ApiResponse<SafeUser>;

// Like Types
export interface LikeDto {
  userId: string;
}

export type LikeResponse = ApiResponse<{
  liked: boolean;
  likesCount: number;
}>;

// Re-export Prisma types for convenience
export type { Post, User, Comment, Role } from "@prisma/client";
