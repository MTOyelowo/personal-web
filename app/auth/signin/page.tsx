"use client";

import { FC } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AiFillGoogleCircle } from "react-icons/ai";
import Link from "next/link";
import Logo from "@/components/ui/logo";

const SignInPage: FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted font-space-grotesk">
        <p className="text-lg text-muted-foreground animate-pulse">
          Signing you in...
        </p>
      </div>
    );
  }

  // Already authenticated — redirect
  if (session) {
    const isAdmin = (session.user as { role?: string })?.role === "ADMIN";
    setTimeout(() => {
      router.push(isAdmin ? "/admin" : "/");
    }, 1500);
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-muted font-space-grotesk gap-3">
        <p className="text-lg text-green-600 dark:text-green-400 animate-pulse font-medium">
          Sign in successful
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to {isAdmin ? "dashboard" : "home"}...
        </p>
      </div>
    );
  }

  // Sign-in form
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-muted font-space-grotesk">
      <div className="w-full max-w-sm mx-auto p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Sign in to access your account
        </p>

        {/* Google Sign In */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-card border-2 border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <AiFillGoogleCircle size={22} className="text-red-500" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Back to site */}
        <p className="text-center text-sm text-muted-foreground">
          Just browsing?{" "}
          <Link
            href="/"
            className="text-foreground font-medium hover:underline"
          >
            Go back home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
