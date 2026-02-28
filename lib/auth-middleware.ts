import type { Role } from "@/prisma/generated/prisma/client";
import { auth } from "@/lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Verify the current session and return the authenticated user.
 * Works in both API routes and server components.
 */
export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? "",
      role: session.user.role,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

/** Check if user has admin role. */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "ADMIN";
}

/** Require authentication — throws if not logged in. */
export async function requireAuth(): Promise<AuthUser> {
  const user = await verifyAuth();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/** Require admin role — throws if not admin. */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (!isAdmin(user)) {
    throw new Error("Forbidden - Admin access required");
  }

  return user;
}
