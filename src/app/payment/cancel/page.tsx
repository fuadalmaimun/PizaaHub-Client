import Link from "next/link";
import { ArrowLeftIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4 py-16 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="w-full max-w-xl rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-xl shadow-orange-100/50 sm:p-10 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10">
          <XCircleIcon className="size-8" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You cancelled the checkout, so no money was taken and your plan is
          still Free. You can upgrade to Premium whenever you are ready.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/dashboard/vendor/subscription">
              Try Again
              <ArrowLeftIcon className="size-4" />
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
