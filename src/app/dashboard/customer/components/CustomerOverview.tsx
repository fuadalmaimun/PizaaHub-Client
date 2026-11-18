"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import { getCustomerOverview } from "@/lib/core/server";

import {
  CustomerDashboardFrame,
  CustomerDashboardStatus,
  errorMessage,
  useCustomerDashboardAccess,
} from "./CustomerDashboardShared";

type CustomerOverviewData = {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  rejectedOrders: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOverview(payload: unknown): CustomerOverviewData {
  let value = payload;
  for (let depth = 0; depth < 3 && isRecord(value); depth += 1) {
    if (isRecord(value.data)) {
      value = value.data;
    } else if (isRecord(value.overview)) {
      value = value.overview;
    } else {
      break;
    }
  }

  if (
    !isRecord(value) ||
    typeof value.totalOrders !== "number" ||
    typeof value.pendingOrders !== "number" ||
    typeof value.acceptedOrders !== "number" ||
    typeof value.rejectedOrders !== "number"
  ) {
    throw new Error("The backend returned invalid customer overview data.");
  }

  return {
    totalOrders: value.totalOrders,
    pendingOrders: value.pendingOrders,
    acceptedOrders: value.acceptedOrders,
    rejectedOrders: value.rejectedOrders,
  };
}

const statLabels: Array<{
  key: keyof CustomerOverviewData;
  label: string;
}> = [
  { key: "totalOrders", label: "Total Orders" },
  { key: "pendingOrders", label: "Pending Orders" },
  { key: "acceptedOrders", label: "Accepted Orders" },
  { key: "rejectedOrders", label: "Rejected Orders" },
];

export default function CustomerOverview() {
  const { user, token, isPending, isCustomer, isBlocked } =
    useCustomerDashboardAccess();
  const [overview, setOverview] = useState<CustomerOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (isPending || !isCustomer || isBlocked) return;

    const controller = new AbortController();
    void getCustomerOverview(token ?? "", controller.signal)
      .then(parseOverview)
      .then((data) => {
        setOverview(data);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load customer overview."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isCustomer, isPending, reloadCount, token]);

  async function refreshOverview() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      setOverview(parseOverview(await getCustomerOverview(token)));
      setError(null);
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh customer overview.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isPending || !user || !isCustomer) {
    return (
      <CustomerDashboardStatus>
        {isPending ? "Checking your account..." : "Redirecting..."}
      </CustomerDashboardStatus>
    );
  }

  if (isBlocked) {
    return (
      <CustomerDashboardStatus error>
        Your account is blocked and cannot access customer tools.
      </CustomerDashboardStatus>
    );
  }

  if (!token) {
    return (
      <CustomerDashboardStatus error>
        Your session token is missing. Please sign in again.
      </CustomerDashboardStatus>
    );
  }

  return (
    <CustomerDashboardFrame
      title={`Welcome, ${user.name || "Customer"}`}
      description="Track your orders and delivery progress."
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
          {statLabels.map(({ key }) => (
            <div
              key={key}
              className="h-28 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading customer overview...</span>
        </div>
      ) : error && !overview ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/65">
          Customer overview could not be loaded.
        </div>
      ) : (
        <>
          <section
            aria-label="Customer order summary"
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {statLabels.map(({ key, label }) => (
              <article
                key={key}
                className="rounded-xl border border-white/10 bg-[#111315] p-5"
              >
                <p className="text-sm text-white/55">{label}</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {overview?.[key] ?? 0}
                </p>
              </article>
            ))}
          </section>

          <Link
            href="/dashboard/customer/orders"
            className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30"
          >
            <div>
              <p className="font-semibold">View My Orders</p>
              <p className="mt-1 text-sm text-white/55">
                Review delivery details or cancel a pending order.
              </p>
            </div>
            <ClipboardList
              aria-hidden="true"
              className="shrink-0 text-emerald-400"
              size={22}
            />
          </Link>
        </>
      )}
    </CustomerDashboardFrame>
  );
}
