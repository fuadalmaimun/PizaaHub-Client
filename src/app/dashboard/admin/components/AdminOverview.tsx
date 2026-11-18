"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck, Users, UtensilsCrossed } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import { getAdminOverview } from "@/lib/core/server";

import {
  AdminDashboardFrame,
  AdminDashboardStatus,
  errorMessage,
  getRecord,
  useAdminDashboardAccess,
} from "./AdminDashboardShared";

type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalMenuItems: number;
  pendingMenuItems: number;
};

const statCards: Array<{
  key: keyof AdminStats;
  label: string;
  icon: typeof Users;
  color: string;
}> = [
  {
    key: "totalUsers",
    label: "Registered Users",
    icon: Users,
    color: "text-sky-300 bg-sky-400/10",
  },
  {
    key: "totalVendors",
    label: "Vendors",
    icon: UtensilsCrossed,
    color: "text-amber-300 bg-amber-400/10",
  },
  {
    key: "totalCustomers",
    label: "Customers",
    icon: Users,
    color: "text-violet-300 bg-violet-400/10",
  },
  {
    key: "totalMenuItems",
    label: "Menu Items",
    icon: UtensilsCrossed,
    color: "text-emerald-300 bg-emerald-400/10",
  },
  {
    key: "pendingMenuItems",
    label: "Pending Reviews",
    icon: ShieldCheck,
    color: "text-orange-300 bg-orange-400/10",
  },
];

function parseStats(payload: unknown): AdminStats {
  const root = getRecord(payload);
  const record = getRecord(root?.data) ?? getRecord(root?.overview) ?? root;
  if (!record) {
    throw new Error("The backend returned invalid admin overview data.");
  }

  const getCount = (key: keyof AdminStats) => {
    const value = record[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("The backend returned invalid admin overview data.");
    }
    return value;
  };

  return {
    totalUsers: getCount("totalUsers"),
    totalVendors: getCount("totalVendors"),
    totalCustomers: getCount("totalCustomers"),
    totalMenuItems: getCount("totalMenuItems"),
    pendingMenuItems: getCount("pendingMenuItems"),
  };
}

export default function AdminOverview() {
  const { user, token, isPending, isAdmin, isBlocked } =
    useAdminDashboardAccess();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (isPending || !isAdmin || isBlocked) return;

    const controller = new AbortController();
    void getAdminOverview(token ?? "", controller.signal)
      .then(parseStats)
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load admin overview."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isAdmin, isBlocked, isPending, reloadCount, token]);

  async function refresh() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      setStats(parseStats(await getAdminOverview(token)));
      setError(null);
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh admin overview.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isPending || !user || !isAdmin) {
    return (
      <AdminDashboardStatus>
        {isPending ? "Checking your account..." : "Redirecting..."}
      </AdminDashboardStatus>
    );
  }

  if (isBlocked) {
    return (
      <AdminDashboardStatus error>
        Your account is blocked and cannot access admin tools.
      </AdminDashboardStatus>
    );
  }

  if (!token) {
    return (
      <AdminDashboardStatus error>
        Your session token is missing. Please sign in again.
      </AdminDashboardStatus>
    );
  }

  return (
    <AdminDashboardFrame
      title={`Welcome, ${user.name || "Admin"}`}
      description="Monitor PizzaHub users and menu review activity."
      actions={
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            aria-hidden="true"
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      }
    >
      {error && (
        <div
          role="alert"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"
        >
          <span>{error}</span>
          {!isLoading && (
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setReloadCount((count) => count + 1);
              }}
              className="font-semibold underline underline-offset-4"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {statCards.map((card) => (
            <div
              key={card.key}
              className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading admin overview...</span>
        </div>
      ) : error && !stats ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/65">
          Admin overview could not be loaded.
        </div>
      ) : (
        <section
          aria-label="Admin platform overview"
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.key}
                className="rounded-xl border border-white/10 bg-[#111315] p-5"
              >
                <span
                  className={`inline-flex size-10 items-center justify-center rounded-lg ${card.color}`}
                >
                  <Icon aria-hidden="true" size={19} />
                </span>
                <p className="mt-4 text-sm text-white/55">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {stats?.[card.key] ?? 0}
                </p>
              </article>
            );
          })}
        </section>
      )}
    </AdminDashboardFrame>
  );
}
