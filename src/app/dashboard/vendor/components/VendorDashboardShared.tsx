"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/dashboard";

export function useVendorDashboardAccess() {
  const router = useRouter();
  const { data: sessionData, isPending } = authClient.useSession();
  const user = sessionData?.user;
  const token = sessionData?.session.token;

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace("/sign-in");
    } else if (user.role !== "vendor") {
      router.replace(dashboardPath(user.role));
    }
  }, [isPending, router, user]);

  return {
    user,
    token,
    isPending,
    isVendor: user?.role === "vendor",
    isBlocked: Boolean(user?.isBlocked),
  };
}

export function VendorDashboardFrame({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[70svh] bg-[#08090b] px-5 pb-16 pt-10 text-white sm:px-8 sm:pb-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-emerald-400">
              VENDOR WORKSPACE
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-white/55">{description}</p>
          </div>
          {actions}
        </div>
        {children}
      </div>
    </main>
  );
}

export function VendorDashboardStatus({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <main className="grid min-h-[60svh] place-items-center bg-[#08090b] px-5 text-white">
      <p
        role={error ? "alert" : "status"}
        className={`text-center text-sm ${error ? "text-red-200" : "text-white/60"}`}
      >
        {children}
      </p>
    </main>
  );
}

export function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}
