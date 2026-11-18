"use client";

import { useEffect, useState } from "react";
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
  createVendorCheckoutSession,
  getVendorSubscription,
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

export default function VendorSubscription() {
  const { user, token, isPending, isVendor, isBlocked } =
    useVendorDashboardAccess();

  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (isPending || !isVendor || isBlocked) return;

    const controller = new AbortController();
    void getVendorSubscription(token ?? "", controller.signal)
      .then((data) => {
        setPlan(data.subscriptionPlan);
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

  async function handleUpgrade() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsStartingPayment(true);
    try {
      // The backend creates a Stripe Checkout Session and returns its URL.
      // Premium is activated only after Stripe confirms the payment via webhook.
      const checkoutUrl = await createVendorCheckoutSession(token);
      window.location.href = checkoutUrl;
    } catch (cause) {
      toast.error(
        errorMessage(cause, "Could not start the payment. Please try again."),
      );
      setIsStartingPayment(false);
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

  const isPremium = plan === "premium";

  return (
    <VendorDashboardFrame
      title="Subscription"
      description="Compare plans and upgrade your restaurant to Premium."
      actions={
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
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
            ? "You have unlimited menu items and your items are featured on the homepage. Thank you for supporting PizzaHub!"
            : `Free vendors can keep up to 3 active menu items. Upgrade once for ${PREMIUM_PRICE} to unlock unlimited items and homepage featuring.`}
        </p>
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
            <span className="text-base font-medium text-white/40"> one-time</span>
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
            onClick={() => void handleUpgrade()}
            disabled={isPremium || isStartingPayment || isLoading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
          >
            {isStartingPayment ? (
              <>
                <Loader2 aria-hidden="true" size={16} className="animate-spin" />
                Redirecting to Stripe...
              </>
            ) : isPremium ? (
              <>
                <Check aria-hidden="true" size={16} />
                Premium is active
              </>
            ) : (
              <>
                <Crown aria-hidden="true" size={16} />
                Upgrade to Premium
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-white/40">
            Secure payment by Stripe. Premium activates automatically after the
            payment is confirmed.
          </p>
        </article>
      </section>
    </VendorDashboardFrame>
  );
}
