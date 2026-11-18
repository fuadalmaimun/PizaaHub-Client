"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/dashboard";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      router.replace(dashboardPath(session.user.role));
      return;
    }

    router.replace("/sign-in");
  }, [isPending, session, router]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center gap-3 bg-[#fffaf2] px-4 text-[#30251f] dark:bg-[#070809] dark:text-white">
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-emerald-500" />
      <p className="text-sm font-medium">Completing your sign in...</p>
    </main>
  );
}
