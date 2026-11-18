"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  HashIcon,
  Loader2Icon,
  ShieldCheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  getVendorSubscription,
  getVendorTransaction,
  verifyVendorPayment,
  type VendorTransaction,
} from "@/lib/core/server";

type PaymentState = "checking" | "active" | "pending" | "guest";

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

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="max-w-[62%] break-all text-right font-semibold">
        {children}
      </dd>
    </div>
  );
}

function TransactionDetails({
  transaction,
  email,
}: {
  transaction: VendorTransaction;
  email?: string;
}) {
  return (
    <dl className="mt-6 divide-y divide-orange-100 rounded-xl border border-orange-100 bg-orange-50/50 px-4 text-sm dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-800/30">
      <DetailRow label="Plan">PizzaHub Premium · Yearly</DetailRow>
      <DetailRow label="Amount">
        <span className="text-primary">
          {formatMoney(transaction.amount, transaction.currency)}
        </span>{" "}
        <span className="text-xs font-medium text-muted-foreground">
          {(transaction.currency || "usd").toUpperCase()} / year
        </span>
      </DetailRow>
      <DetailRow label="Status">
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {transaction.status}
        </span>
      </DetailRow>
      <DetailRow label="Payment date">{formatDate(transaction.createdAt)}</DetailRow>
      <DetailRow label="Transaction ID">
        <span className="font-mono text-xs">{transaction._id}</span>
      </DetailRow>
      {transaction.stripeSessionId && (
        <DetailRow label="Stripe session">
          <span className="font-mono text-[11px] text-muted-foreground">
            {transaction.stripeSessionId}
          </span>
        </DetailRow>
      )}
      {transaction.stripeInvoiceId && (
        <DetailRow label="Stripe invoice">
          <span className="font-mono text-[11px] text-muted-foreground">
            {transaction.stripeInvoiceId}
          </span>
        </DetailRow>
      )}
      {transaction.periodEnd && (
        <DetailRow label="Premium valid until">
          {formatDate(transaction.periodEnd)}
        </DetailRow>
      )}
      {email && <DetailRow label="Billed to">{email}</DetailRow>}
    </dl>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";
  const { data: sessionData, isPending } = authClient.useSession();
  const token = sessionData?.session.token;
  const isVendor = sessionData?.user?.role === "vendor";
  const email = sessionData?.user?.email;

  const [state, setState] = useState<PaymentState>("checking");
  const [transaction, setTransaction] = useState<VendorTransaction | null>(null);

  // If the visitor is not a signed-in vendor we cannot load private details.
  const displayState: PaymentState =
    !isPending && (!token || !isVendor) ? "guest" : state;

  useEffect(() => {
    if (isPending) return;
    if (!token || !isVendor) return;

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function checkPayment() {
      attempts += 1;

      // Preferred path: verify the Stripe session server-side, then load the
      // saved transaction (works even if the webhook is delayed).
      if (sessionId) {
        if (attempts === 1) {
          try {
            await verifyVendorPayment(token as string, sessionId);
          } catch {
            // Payment may still be processing — keep checking below.
          }
        }

        try {
          const saved = await getVendorTransaction(
            token as string,
            sessionId,
          );
          if (!cancelled) {
            setTransaction(saved);
            setState("active");
          }
          return;
        } catch {
          // Not saved yet — poll again below.
        }
      }

      // Fallback for links without session_id: check the vendor plan.
      try {
        const data = await getVendorSubscription(token as string);
        if (cancelled) return;
        if (data.subscriptionPlan === "premium") {
          setState("active");
          return;
        }
      } catch {
        // Ignore and retry.
      }

      if (cancelled) return;

      if (attempts >= 10) {
        setState("pending");
        return;
      }

      timer = setTimeout(checkPayment, 1500);
    }

    void checkPayment();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isPending, isVendor, sessionId, token]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-16 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="w-full max-w-2xl rounded-2xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/50 sm:p-10 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
        {displayState === "checking" ? (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10">
              <Loader2Icon className="size-8 animate-spin" />
            </span>
            <h1 className="mt-6 text-center text-2xl font-bold tracking-tight">
              Confirming your payment...
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              We are verifying your Stripe payment and activating Premium. This
              usually takes only a few seconds.
            </p>
          </>
        ) : displayState === "active" ? (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10">
              <CheckCircle2Icon className="size-8" />
            </span>
            <h1 className="mt-6 text-center text-2xl font-bold tracking-tight">
              Payment successful!
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {transaction
                ? "Your Premium plan is active. Here is your payment receipt."
                : "Your payment was verified and your restaurant is now on the Premium plan."}
            </p>

            {transaction && (
              <TransactionDetails transaction={transaction} email={email} />
            )}

            {!transaction && (
              <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-center text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Unlimited menu items and homepage featuring are now unlocked.
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="bg-primary text-primary-foreground">
                <Link href="/dashboard/vendor">
                  Go to Vendor Dashboard
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/vendor/subscription">
                  View Payment History
                </Link>
              </Button>
            </div>
          </>
        ) : displayState === "guest" ? (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10">
              <CheckCircle2Icon className="size-8" />
            </span>
            <h1 className="mt-6 text-center text-2xl font-bold tracking-tight">
              Payment successful
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Thank you! Your Premium plan activates automatically once Stripe
              confirms the payment. Sign in as the vendor to see your receipt and
              transaction ID.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="bg-primary text-primary-foreground">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10">
              <ClockIcon className="size-8" />
            </span>
            <h1 className="mt-6 text-center text-2xl font-bold tracking-tight">
              Payment is being confirmed
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Stripe has not finished confirming the payment yet. Your Premium
              plan will activate automatically — there is no need to pay again.
              You can also check your subscription page in a minute.
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
          </>
        )}

        <p className="mt-8 flex items-center justify-center gap-2 border-t border-orange-100 pt-6 text-xs text-muted-foreground dark:border-stone-800">
          <ShieldCheckIcon className="size-4 text-emerald-600" />
          Payments are secured and verified by Stripe.
        </p>

        {transaction && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <HashIcon className="size-3.5" />
            Keep your transaction ID for support: {transaction._id}
          </p>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-16 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
          <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-6 py-4 text-sm text-muted-foreground shadow-lg dark:border-stone-800 dark:bg-stone-900">
            <Loader2Icon className="size-5 animate-spin text-primary" />
            Loading your payment...
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
