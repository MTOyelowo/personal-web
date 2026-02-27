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
      <div className="flex justify-center items-center min-h-screen bg-gray-50 font-space-grotesk">
        <p className="text-lg text-gray-500 animate-pulse">Signing you in...</p>
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 font-space-grotesk gap-3">
        <p className="text-lg text-green-600 animate-pulse font-medium">
          Sign in successful
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to {isAdmin ? "dashboard" : "home"}...
        </p>
      </div>
    );
  }

  // Sign-in form
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 font-space-grotesk">
      <div className="w-full max-w-sm mx-auto p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Sign in to access your account
        </p>

        {/* Google Sign In */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <AiFillGoogleCircle size={22} className="text-red-500" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Back to site */}
        <p className="text-center text-sm text-gray-500">
          Just browsing?{" "}
          <Link href="/" className="text-gray-900 font-medium hover:underline">
            Go back home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
