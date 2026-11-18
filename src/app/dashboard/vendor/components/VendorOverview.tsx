"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Pizza, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  getVendorMenuItems,
  getVendorOrders,
  getVendorOverview,
} from "@/lib/core/server";

import {
  errorMessage,
  useVendorDashboardAccess,
  VendorDashboardFrame,
  VendorDashboardStatus,
} from "./VendorDashboardShared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOverviewRecord(payload: unknown): Record<string, unknown> {
  let value = payload;
  for (let depth = 0; depth < 3 && isRecord(value); depth += 1) {
    if (isRecord(value.data)) {
      value = value.data;
    } else if (isRecord(value.overview)) {
      value = value.overview;
    } else {
      return value;
    }
  }
  if (isRecord(value)) return value;
  throw new Error("The backend returned an invalid vendor overview.");
}

function getOverviewStats(overview: Record<string, unknown>) {
  const stats: Array<{ label: string; value: string | number | boolean }> = [];
  for (const [key, value] of Object.entries(overview)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      stats.push({ label: key, value });
    } else if (isRecord(value)) {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (
          typeof nestedValue === "string" ||
          typeof nestedValue === "number" ||
          typeof nestedValue === "boolean"
        ) {
          stats.push({ label: nestedKey, value: nestedValue });
        }
      }
    }
  }
  return stats;
}

function readableLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function VendorOverview() {
  const { user, token, isPending, isVendor, isBlocked } =
    useVendorDashboardAccess();
  const [overview, setOverview] = useState<Record<string, unknown> | null>(
    null,
  );
  const [menuItemCount, setMenuItemCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (isPending || !isVendor || isBlocked) return;

    const controller = new AbortController();
    void Promise.all([
      getVendorOverview(token ?? "", controller.signal),
      getVendorMenuItems(token ?? "", controller.signal),
      getVendorOrders(token ?? "", controller.signal),
    ])
      .then(([overviewData, items, orders]) => {
        setOverview(getOverviewRecord(overviewData));
        setMenuItemCount(items.length);
        setOrderCount(orders.length);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load vendor overview."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isPending, isVendor, reloadCount, token]);

  const stats = useMemo(
    () => (overview ? getOverviewStats(overview) : []),
    [overview],
  );

  async function refreshOverview() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      const [overviewData, items, orders] = await Promise.all([
        getVendorOverview(token),
        getVendorMenuItems(token),
        getVendorOrders(token),
      ]);
      setOverview(getOverviewRecord(overviewData));
      setMenuItemCount(items.length);
      setOrderCount(orders.length);
      setError(null);
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh vendor overview.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isPending || !user || !isVendor) {
    return (
      <VendorDashboardStatus>
        {isPending ? "Checking your account..." : "Redirecting..."}
      </VendorDashboardStatus>
    );
  }

  if (isBlocked) {
    return (
      <VendorDashboardStatus error>
        Your account is blocked and cannot access vendor tools.
      </VendorDashboardStatus>
    );
  }

  if (!token) {
    return (
      <VendorDashboardStatus error>
        Your session token is missing. Please sign in again.
      </VendorDashboardStatus>
    );
  }

  return (
    <VendorDashboardFrame
      title={`Welcome, ${user.name || "Vendor"}`}
      description="Manage your menu and customer orders."
      actions={
        <button
          type="button"
          onClick={() => void refreshOverview()}
          disabled={isRefreshing || isLoading}
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
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading vendor data...</span>
        </div>
      ) : error && !overview ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-white/70">Vendor data could not be loaded.</p>
        </div>
      ) : (
        <>
          <section aria-label="Vendor overview" className="mt-8">
            {stats.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <article
                    key={`${stat.label}-${index}`}
                    className="rounded-xl border border-white/10 bg-[#111315] p-5"
                  >
                    <p className="text-sm text-white/55">
                      {readableLabel(stat.label)}
                    </p>
                    <p className="mt-3 break-words text-2xl font-bold text-white">
                      {typeof stat.value === "boolean"
                        ? stat.value
                          ? "Yes"
                          : "No"
                        : String(stat.value)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#111315] p-6 text-sm text-white/55">
                The backend did not return overview metrics.
              </div>
            )}
          </section>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Link
              href="/dashboard/vendor/menu-items"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30"
            >
              <Pizza aria-hidden="true" className="text-emerald-400" size={22} />
              <p className="mt-3 text-sm text-white/55">
                Menu items from backend
              </p>
              <p className="mt-2 text-2xl font-bold">{menuItemCount}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-400">
                Manage menu
              </span>
            </Link>
            <Link
              href="/dashboard/vendor/orders"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30"
            >
              <ClipboardList
                aria-hidden="true"
                className="text-emerald-400"
                size={22}
              />
              <p className="mt-3 text-sm text-white/55">
                Customer orders from backend
              </p>
              <p className="mt-2 text-2xl font-bold">{orderCount}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-emerald-400">
                View orders
              </span>
            </Link>
          </div>
        </>
      )}
    </VendorDashboardFrame>
  );
}
