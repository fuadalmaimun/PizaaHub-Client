"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  CrownIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WifiIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import {
  createVendorCheckoutSession,
  getVendorSubscription,
} from "@/lib/core/server";
import { dashboardPath } from "@/lib/dashboard";

const PREMIUM_PRICE = "$10.00";

const FEATURES = [
  "Unlimited active menu items",
  "Featured placement on the homepage",
  "Premium badge on all your items",
  "All Free plan features included",
];

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

function PaymentStatus({
  children,
  error = false,
}: {
  children: React.ReactNode;
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

export default function PaymentCheckoutPage() {
  const router = useRouter();
  const { data: sessionData, isPending } = authClient.useSession();
  const user = sessionData?.user;
  const token = sessionData?.session.token;
  const userRole: string | undefined = user?.role;
  const isVendor = userRole === "vendor";

  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (!isVendor) {
      router.replace(dashboardPath(userRole));
      return;
    }
    if (user.isBlocked) return;

    const controller = new AbortController();
    void getVendorSubscription(token ?? "", controller.signal)
      .then((data) => {
        setPlan(data.subscriptionPlan);
      })
      .catch(() => {
        // Not a blocker — the payment can still be started.
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingPlan(false);
      });

    return () => controller.abort();
  }, [isPending, isVendor, router, token, user, userRole]);

  async function handlePay() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRedirecting(true);
    setError(null);
    try {
      const checkoutUrl = await createVendorCheckoutSession(token);
      window.location.href = checkoutUrl;
    } catch (cause) {
      const message = errorMessage(
        cause,
        "Could not start the payment. Please try again.",
      );
      setError(message);
      toast.error(message);
      setIsRedirecting(false);
    }
  }

  if (isPending || !user || !isVendor) {
    return (
      <PaymentStatus>
        {isPending ? "Checking your account..." : "Redirecting..."}
      </PaymentStatus>
    );
  }

  if (user.isBlocked) {
    return (
      <PaymentStatus error>
        Your account is blocked and cannot upgrade to Premium.
      </PaymentStatus>
    );
  }

  if (isLoadingPlan) {
    return <PaymentStatus>Loading your subscription...</PaymentStatus>;
  }

  if (plan === "premium") {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-16 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
        <div className="w-full max-w-xl rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-xl shadow-orange-100/50 sm:p-10 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10">
            <CrownIcon className="size-8" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            You are already Premium
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your restaurant already has unlimited menu items and homepage
            featuring. No payment is needed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/dashboard/vendor/subscription">
                View Subscription
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/vendor">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-12 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 sm:py-16">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/dashboard/vendor/subscription"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeftIcon className="size-4" />
          Back to subscription
        </Link>

        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheckIcon className="size-3.5" />
            SECURE CHECKOUT
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Upgrade to <span className="text-primary">Premium</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A $10 yearly subscription. Cancel anytime — you keep Premium until
            the paid year ends.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Order summary */}
          <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10">
                <CrownIcon className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold">PizzaHub Premium</h2>
                <p className="text-xs text-muted-foreground">
                  Yearly subscription · Renews automatically
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2 border-t border-orange-100 pt-4 text-sm dark:border-stone-800">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Premium plan</dt>
                <dd className="font-semibold">{PREMIUM_PRICE} / year</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Billing cycle</dt>
                <dd className="font-semibold">Every 12 months</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd className="font-semibold">$0.00</dd>
              </div>
              <div className="flex justify-between border-t border-orange-100 pt-3 text-base dark:border-stone-800">
                <dt className="font-bold">Total due today</dt>
                <dd className="font-bold text-primary">{PREMIUM_PRICE}</dd>
              </div>
            </dl>

            <p className="mt-4 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-xs text-muted-foreground dark:bg-stone-800/60">
              <SparklesIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              Premium activates right after payment and your transaction is
              saved in your payment history. Stripe renews it every year for{" "}
              {PREMIUM_PRICE} — you can cancel the renewal anytime.
            </p>
          </section>

          {/* Payment method */}
          <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-lg font-bold">Payment method</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Demo card preview — real card details are entered on Stripe.
            </p>

            {/* Demo card */}
            <div className="relative mt-4 aspect-[1.6/1] overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-5 text-white shadow-xl">
              <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/30 blur-2xl" />
              <div className="absolute -bottom-12 -left-8 size-40 rounded-full bg-amber-400/20 blur-2xl" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.24em] text-amber-300">
                      PIZZAHUB
                    </p>
                    <p className="text-xs font-semibold text-white/80">
                      PREMIUM MEMBER
                    </p>
                  </div>
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white/80">
                    DEMO
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-10 items-center justify-center rounded-md bg-gradient-to-br from-amber-300 to-amber-500">
                    <span className="h-3 w-6 rounded-sm border border-amber-700/40" />
                  </span>
                  <WifiIcon className="size-5 rotate-90 text-white/70" />
                </div>

                <div>
                  <p className="font-mono text-lg tracking-[0.18em] sm:text-xl">
                    4242 4242 4242 4242
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3 text-[10px] uppercase tracking-wider text-white/60">
                    <div className="min-w-0">
                      <p>Cardholder</p>
                      <p className="truncate text-xs font-semibold normal-case tracking-normal text-white">
                        {user.name || "PizzaHub Vendor"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>Expires</p>
                      <p className="text-xs font-semibold text-white">12/34</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              This card is only a design preview. On Stripe use test card{" "}
              <span className="font-mono font-semibold">4242 4242 4242 4242</span>.
            </p>

            {/* Email */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-3 dark:border-stone-800 dark:bg-stone-800/50">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm dark:bg-stone-900">
                <MailIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Receipt email
                </p>
                <p className="truncate text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              This email is already filled in on the Stripe payment page.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
              >
                {error}
              </p>
            )}

            <Button
              type="button"
              onClick={() => void handlePay()}
              disabled={isRedirecting}
              className="mt-5 h-12 w-full bg-primary text-base text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
            >
              {isRedirecting ? (
                <>
                  <Loader2Icon className="size-5 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <LockIcon className="size-4" />
                  Pay {PREMIUM_PRICE} / year with Stripe
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </Button>

            <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
              <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
              You will be redirected to Stripe. Your card details never touch
              PizzaHub servers.
            </p>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2Icon className="size-4 text-emerald-600" />
            Instant activation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <LockIcon className="size-4 text-emerald-600" />
            Stripe secured payment
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheckIcon className="size-4 text-emerald-600" />
            Transaction receipt in your dashboard
          </span>
        </div>
      </div>
    </main>
  );
}
