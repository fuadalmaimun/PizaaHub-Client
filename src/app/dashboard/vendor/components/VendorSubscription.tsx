"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Crown,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

import {
  cancelVendorSubscription,
  getVendorSubscription,
  getVendorTransactions,
  type VendorSubscription as VendorSubscriptionInfo,
  type VendorTransaction,
} from "@/lib/core/server";

import {
  errorMessage,
  useVendorDashboardAccess,
  VendorDashboardFrame,
  VendorDashboardStatus,
} from "./VendorDashboardShared";

const PREMIUM_PRICE = "$10";

const FREE_FEATURES = [
  "Up to 3 active menu items",
  "Accept and reject customer orders",
  "Standard placement in the menu",
];

const PREMIUM_FEATURES = [
  "Unlimited active menu items",
  "Featured placement on the homepage",
  "Premium badge on your menu items",
  "Everything in the Free plan",
];

const FREE_LIMITS = [
  "More than 3 active menu items",
  "Featured homepage placement",
  "Premium badge on your items",
];

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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function VendorSubscription() {
  const router = useRouter();
  const { user, token, isPending, isVendor, isBlocked } =
    useVendorDashboardAccess();

  const [subscription, setSubscription] = useState<VendorSubscriptionInfo>({
    subscriptionPlan: "free",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const [transactions, setTransactions] = useState<VendorTransaction[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !isVendor || isBlocked) return;

    const controller = new AbortController();
    void getVendorSubscription(token ?? "", controller.signal)
      .then((data) => {
        setSubscription(data);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            errorMessage(cause, "Could not load your subscription plan."),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isPending, isVendor, reloadCount, token]);

  useEffect(() => {
    if (isPending || !isVendor || isBlocked) return;

    const controller = new AbortController();
    void getVendorTransactions(token ?? "", controller.signal)
      .then((data) => {
        setTransactions(data);
        setHistoryError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setHistoryError(
            errorMessage(cause, "Could not load your payment history."),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsHistoryLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isPending, isVendor, reloadCount, token]);

  async function handleToggleRenewal() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsUpdatingPlan(true);
    try {
      // Stops (or restarts) the yearly Stripe renewal.
      const next = await cancelVendorSubscription(
        token,
        !subscription.cancelAtPeriodEnd,
      );

      setSubscription((current) => ({ ...current, ...next }));
      toast.success(
        next.cancelAtPeriodEnd
          ? "Renewal cancelled. Premium stays active until the paid year ends."
          : "Yearly renewal resumed. Premium will continue automatically.",
      );
      setReloadCount((count) => count + 1);
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not update your subscription."));
    } finally {
      setIsUpdatingPlan(false);
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

  const isPremium = subscription.subscriptionPlan === "premium";
  const renewsOn = subscription.subscriptionExpiresAt
    ? formatDate(subscription.subscriptionExpiresAt)
    : null;

  return (
    <VendorDashboardFrame
      title="Subscription"
      description="Compare plans and upgrade your restaurant to Premium."
      actions={
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setIsHistoryLoading(true);
            setReloadCount((count) => count + 1);
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            aria-hidden="true"
            size={16}
            className={isLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      }
    >
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {/* Current plan */}
      <section
        aria-label="Current plan"
        className="mt-8 rounded-2xl border border-white/10 bg-[#111315] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-emerald-400">
              CURRENT PLAN
            </p>
            {isLoading ? (
              <p className="mt-2 text-2xl font-bold text-white/50">
                Loading...
              </p>
            ) : (
              <p className="mt-2 flex items-center gap-2 text-2xl font-bold">
                {isPremium ? (
                  <Crown aria-hidden="true" size={24} className="text-amber-400" />
                ) : null}
                {isPremium ? "Premium" : "Free"}
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isPremium
                ? "bg-amber-400/15 text-amber-300"
                : "bg-white/10 text-white/60"
            }`}
          >
            {isPremium ? "ACTIVE" : "LIMITED"}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-white/55">
          {isPremium
            ? subscription.cancelAtPeriodEnd && renewsOn
              ? `Premium ends on ${renewsOn} and will not renew. You keep unlimited menu items until then.`
              : renewsOn
                ? `You have unlimited menu items and homepage featuring. The plan renews automatically on ${renewsOn} for ${PREMIUM_PRICE}/year.`
                : "You have unlimited menu items and your items are featured on the homepage. Thank you for supporting PizzaHub!"
            : `Free vendors can keep up to 3 active menu items. Upgrade for ${PREMIUM_PRICE}/year to unlock unlimited items and homepage featuring.`}
        </p>

        {isPremium && renewsOn && (
          <button
            type="button"
            onClick={() => void handleToggleRenewal()}
            disabled={isUpdatingPlan}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdatingPlan ? (
              <>
                <Loader2 aria-hidden="true" size={14} className="animate-spin" />
                Updating...
              </>
            ) : subscription.cancelAtPeriodEnd ? (
              "Resume yearly renewal"
            ) : (
              "Cancel yearly renewal"
            )}
          </button>
        )}
      </section>

      {/* Plan comparison */}
      <section aria-label="Plan comparison" className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Free plan */}
        <article className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-bold">Free</h2>
          <p className="mt-1 text-sm text-white/55">
            Everything you need to start selling.
          </p>
          <p className="mt-4 text-3xl font-bold">
            $0
            <span className="text-base font-medium text-white/40"> / forever</span>
          </p>

          <ul className="mt-5 space-y-2 text-sm text-white/70">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check
                  aria-hidden="true"
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                {feature}
              </li>
            ))}
            {FREE_LIMITS.map((limit) => (
              <li key={limit} className="flex items-start gap-2 text-white/40">
                <X
                  aria-hidden="true"
                  size={16}
                  className="mt-0.5 shrink-0 text-white/30"
                />
                {limit}
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled
            className="mt-6 w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/40"
          >
            {isPremium ? "Included" : "Current plan"}
          </button>
        </article>

        {/* Premium plan */}
        <article className="relative flex flex-col rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 via-[#111315] to-[#111315] p-6">
          <span className="absolute right-5 top-5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
            BEST VALUE
          </span>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Crown aria-hidden="true" size={20} className="text-amber-400" />
            Premium
          </h2>
          <p className="mt-1 text-sm text-white/55">
            For restaurants ready to grow.
          </p>
          <p className="mt-4 text-3xl font-bold">
            {PREMIUM_PRICE}
            <span className="text-base font-medium text-white/40"> / year</span>
          </p>

          <ul className="mt-5 space-y-2 text-sm text-white/70">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Sparkles
                  aria-hidden="true"
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-400"
                />
                {feature}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => router.push("/payment/checkout")}
            disabled={isPremium || isLoading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
          >
            {isPremium ? (
              <>
                <Check aria-hidden="true" size={16} />
                Premium is active
              </>
            ) : (
              <>
                <Crown aria-hidden="true" size={16} />
                Upgrade to Premium — {PREMIUM_PRICE}/year
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-white/40">
            Yearly subscription — renews automatically. You can cancel the
            renewal anytime and keep Premium until the paid year ends.
          </p>
        </article>
      </section>

      {/* Payment history */}
      <section
        aria-label="Payment history"
        className="mt-6 rounded-2xl border border-white/10 bg-[#111315] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">Payment history</h2>
            <p className="mt-1 text-sm text-white/50">
              Your Premium payments, amounts and transaction IDs.
            </p>
          </div>
          {!isHistoryLoading && transactions.length > 0 && (
            <span className="text-xs font-semibold text-white/40">
              {transactions.length} payment{transactions.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {isHistoryLoading ? (
          <div role="status" className="mt-4 space-y-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg border border-white/5 bg-white/5"
              />
            ))}
            <span className="sr-only">Loading payment history...</span>
          </div>
        ) : historyError ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"
          >
            {historyError}
          </p>
        ) : transactions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/45">
            No payments yet. Upgrade to Premium and your transaction will appear
            here.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {transactions.map((transaction) => (
              <li
                key={transaction._id}
                className="flex flex-wrap items-start justify-between gap-3 py-4 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {formatMoney(transaction.amount, transaction.currency)}
                    <span className="mx-2 text-white/30">·</span>
                    <span className="text-white/65">
                      {transaction.kind === "renewal"
                        ? "Premium renewal"
                        : transaction.plan === "premium"
                          ? "Premium plan"
                          : (transaction.plan ?? "Payment")}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {formatDate(transaction.createdAt)}
                    {transaction.periodEnd
                      ? ` · Paid until ${formatDate(transaction.periodEnd)}`
                      : ""}
                  </p>
                  <p className="mt-1.5 break-all font-mono text-[11px] text-white/35">
                    TX: {transaction._id}
                  </p>
                  <p className="mt-0.5 break-all font-mono text-[11px] text-white/25">
                    {transaction.stripeInvoiceId
                      ? `Invoice: ${transaction.stripeInvoiceId}`
                      : `Stripe session: ${transaction.stripeSessionId}`}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold uppercase text-emerald-300">
                  {transaction.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </VendorDashboardFrame>
  );
}
