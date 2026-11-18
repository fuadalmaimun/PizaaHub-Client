"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/dashboard";

export function useAdminDashboardAccess() {
  const router = useRouter();
  const { data: sessionData, isPending } = authClient.useSession();
  const user = sessionData?.user;
  const token = sessionData?.session.token;
  const role: string | undefined = user?.role;

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace("/sign-in");
    } else if (role !== "admin") {
      router.replace(dashboardPath(role));
    }
  }, [isPending, role, router, user]);

  return {
    user,
    token,
    isPending,
    isAdmin: role === "admin",
    isBlocked: Boolean(user?.isBlocked),
  };
}

export function AdminDashboardFrame({
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
              ADMIN WORKSPACE
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

export function AdminDashboardStatus({
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

export function getRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}
