import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: {
    items: T[];
    pagination: PaginationData;
  };
}

// Success response helper
export function successResponse<T>(
  data: T,
  status: number = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

// Error response helper
export function errorResponse(
  error: string,
  status: number = 400,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status },
  );
}

// Paginated response helper
export function paginatedResponse<T>(
  items: T[],
  pagination: PaginationData,
  status: number = 200,
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data: {
        items,
        pagination,
      },
    },
    { status },
  );
}

// Standard error messages
export const ErrorMessages = {
  MISSING_FIELDS: "Missing required fields",
  UNAUTHORIZED: "Unauthorized access",
  NOT_FOUND: "Resource not found",
  ALREADY_EXISTS: "Resource already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  SERVER_ERROR: "Internal server error",
  INVALID_REQUEST: "Invalid request",
} as const;

// Status codes
export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
} as const;
