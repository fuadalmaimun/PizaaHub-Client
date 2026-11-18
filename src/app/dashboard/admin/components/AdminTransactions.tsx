"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CreditCard, RefreshCw, Store, UserRound } from "lucide-react";

import {
  getAdminTransactions,
  type AdminTransaction,
} from "@/lib/core/server";

import {
  AdminDashboardFrame,
  AdminDashboardStatus,
  errorMessage,
  useAdminDashboardAccess,
} from "./AdminDashboardShared";

function formatMoney(amount: number, currency?: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "usd").toUpperCase(),
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function planLabel(transaction: AdminTransaction) {
  if (transaction.kind === "renewal") return "Premium renewal";
  if (transaction.plan === "premium") return "Premium (yearly)";
  return transaction.plan ?? "Premium";
}

function statusClasses(status: string) {
  const value = status.toLowerCase();
  if (value === "paid" || value === "active") {
    return "bg-emerald-400/10 text-emerald-300";
  }
  if (value === "pending" || value === "open" || value === "incomplete") {
    return "bg-amber-400/10 text-amber-300";
  }
  return "bg-red-400/10 text-red-300";
}

export default function AdminTransactions() {
  const { user, token, isPending, isAdmin, isBlocked } =
    useAdminDashboardAccess();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (isPending || !isAdmin || isBlocked || !token) return;

    const controller = new AbortController();
    void getAdminTransactions(token, controller.signal)
      .then((result) => {
        setTransactions(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load transactions."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isAdmin, isBlocked, isPending, reloadCount, token]);

  async function refresh() {
    if (!token) return;

    setIsRefreshing(true);
    try {
      setTransactions(await getAdminTransactions(token));
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause, "Could not refresh transactions."));
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

  const totalRevenue = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const vendorCount = new Set(
    transactions.map((transaction) => transaction.vendorId).filter(Boolean),
  ).size;

  return (
    <AdminDashboardFrame
      title="Transactions"
      description="Every Premium subscription payment on PizzaHub. This list is read-only."
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
        <div role="status" className="mt-8 space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading transactions...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-white/55">
          No transactions yet. Vendor Premium payments will appear here.
        </div>
      ) : (
        <>
          {/* Summary */}
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#111315] p-5">
              <dt className="flex items-center gap-2 text-sm text-white/55">
                <CreditCard aria-hidden="true" size={16} />
                Total payments
              </dt>
              <dd className="mt-2 text-2xl font-bold">
                {transactions.length}
              </dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111315] p-5">
              <dt className="text-sm text-white/55">Total amount</dt>
              <dd className="mt-2 text-2xl font-bold text-emerald-300">
                {formatMoney(totalRevenue, transactions[0]?.currency)}
              </dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111315] p-5">
              <dt className="flex items-center gap-2 text-sm text-white/55">
                <Store aria-hidden="true" size={16} />
                Paying vendors
              </dt>
              <dd className="mt-2 text-2xl font-bold">{vendorCount}</dd>
            </div>
          </dl>

          <ul className="mt-6 space-y-3">
            {transactions.map((transaction) => {
              const vendor = transaction.vendor;
              const vendorName =
                vendor?.businessName || vendor?.name || "Unknown vendor";

              return (
                <li
                  key={transaction._id}
                  className="rounded-xl border border-white/10 bg-[#111315] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white/5 text-emerald-300">
                        {vendor?.image ? (
                          <Image
                            src={vendor.image}
                            alt=""
                            fill
                            sizes="44px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <UserRound aria-hidden="true" size={20} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">
                          {vendorName}
                        </h2>
                        <p className="mt-0.5 break-all text-sm text-white/55">
                          {vendor?.name ? `${vendor.name} · ` : ""}
                          {vendor?.email ?? "Vendor account deleted"}
                        </p>
                        <p className="mt-1 break-all text-[11px] text-white/35">
                          Vendor ID: {transaction.vendorId ?? "Unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {formatMoney(transaction.amount, transaction.currency)}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-bold uppercase ${statusClasses(transaction.status)}`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <dt className="text-xs text-white/40">
                        Subscription plan
                      </dt>
                      <dd className="mt-1 font-semibold">{planLabel(transaction)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-white/40">Payment date</dt>
                      <dd className="mt-1 text-white/75">
                        {formatDate(transaction.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-white/40">Paid until</dt>
                      <dd className="mt-1 text-white/75">
                        {transaction.periodEnd
                          ? formatDate(transaction.periodEnd)
                          : "Not available"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-white/40">Transaction ID</dt>
                      <dd className="mt-1 break-all font-mono text-[11px] text-white/60">
                        {transaction._id}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </AdminDashboardFrame>
  );
}
