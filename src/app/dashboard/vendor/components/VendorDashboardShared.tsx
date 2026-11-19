"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/dashboard";
import {
  DashboardHeader,
  DashboardPage,
  DashboardStatus,
} from "@/app/dashboard/components/DashboardKit";

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
    <DashboardPage>
      <DashboardHeader
        eyebrow="VENDOR WORKSPACE"
        title={title}
        description={description}
        actions={actions}
      />
      {children}
    </DashboardPage>
  );
}

export function VendorDashboardStatus({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return <DashboardStatus error={error}>{children}</DashboardStatus>;
}

export function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}
