"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  ShieldCheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getVendorSubscription } from "@/lib/core/server";

type ActivationStatus = "checking" | "active" | "pending" | "guest";

export default function PaymentSuccessPage() {
  const { data: sessionData, isPending } = authClient.useSession();
  const token = sessionData?.session.token;
  const isVendor = sessionData?.user?.role === "vendor";

  const [status, setStatus] = useState<ActivationStatus>("checking");

  // If the visitor is not a signed-in vendor we do not poll at all.
  // This is derived instead of stored so the effect never sets state directly.
  const displayStatus: ActivationStatus =
    !isPending && (!token || !isVendor) ? "guest" : status;

  // Stripe redirects here right after payment. The backend webhook usually
  // arrives within a second or two, so we check a few times before giving up.
  useEffect(() => {
    if (isPending) return;

    if (!token || !isVendor) return;

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function checkPlan() {
      attempts += 1;

      try {
        const data = await getVendorSubscription(token as string);
        if (cancelled) return;

        if (data.subscriptionPlan === "premium") {
          setStatus("active");
          return;
        }
      } catch {
        // The webhook may still be running — just try again below.
      }

      if (cancelled) return;

      if (attempts >= 10) {
        setStatus("pending");
        return;
      }

      timer = setTimeout(checkPlan, 2000);
    }

    void checkPlan();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isPending, isVendor, token]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-16 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="w-full max-w-xl rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-xl shadow-orange-100/50 sm:p-10 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
        {displayStatus === "checking" ? (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10">
              <Loader2Icon className="size-8 animate-spin" />
            </span>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              Payment received!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We are waiting for Stripe to confirm your payment. This usually
              takes only a few seconds.
            </p>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-amber-600">
              <ClockIcon className="size-4" />
              Activating your Premium plan...
            </p>
          </>
        ) : displayStatus === "active" ? (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10">
              <CheckCircle2Icon className="size-8" />
            </span>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              Welcome to Premium!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment was verified and your restaurant is now on the
              Premium plan. You can add unlimited menu items and your items are
              featured on the homepage.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="bg-primary text-primary-foreground">
                <Link href="/dashboard/vendor">
                  Go to Vendor Dashboard
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/vendor/menu-items">Add Menu Items</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10">
              <ClockIcon className="size-8" />
            </span>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              Payment successful
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {displayStatus === "guest"
                ? "Your Premium plan activates automatically once Stripe confirms the payment. Sign in as the vendor to see the updated plan."
                : "Stripe is still confirming your payment. Your Premium plan will activate automatically in the next few moments — no need to pay again."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {isVendor ? (
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link href="/dashboard/vendor/subscription">
                    View Subscription
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </>
        )}

        <p className="mt-8 flex items-center justify-center gap-2 border-t border-orange-100 pt-6 text-xs text-muted-foreground dark:border-stone-800">
          <ShieldCheckIcon className="size-4 text-emerald-600" />
          Payments are secured and verified by Stripe.
        </p>
      </div>
    </main>
  );
}
