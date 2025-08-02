"use client";

import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuth() {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const signOut = async () => {
    try {
      await clerkSignOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const redirectToSignIn = () => {
    if (!isRedirecting) {
      setIsRedirecting(true);
      router.push("/sign-in");
    }
  };

  const redirectToSignUp = () => {
    if (!isRedirecting) {
      setIsRedirecting(true);
      router.push("/sign-up");
    }
  };

  const redirectToDashboard = () => {
    if (!isRedirecting) {
      setIsRedirecting(true);
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn && isRedirecting) {
      setIsRedirecting(false);
    }
  }, [isLoaded, isSignedIn, isRedirecting]);

  return {
    isLoaded,
    isSignedIn,
    userId,
    user,
    signOut,
    redirectToSignIn,
    redirectToSignUp,
    redirectToDashboard,
    isRedirecting,
  };
}
