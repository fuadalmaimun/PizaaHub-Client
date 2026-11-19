"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import { createVendorMenuItem, getVendorMenuItems } from "@/lib/core/server";
import type { MenuItem } from "@/lib/types/menu";

import VendorMenuItemForm from "./VendorMenuItemForm";
import {
  useVendorDashboardAccess,
  VendorDashboardFrame,
  VendorDashboardStatus,
} from "./VendorDashboardShared";

/** Free vendors may keep this many active items. Premium is unlimited. */
const FREE_ACTIVE_ITEM_LIMIT = 3;

function itemIsActive(item: MenuItem) {
  return (
    item.status !== "inactive" &&
    item.isActive !== false &&
    item.isAvailable !== false
  );
}

export default function VendorAddMenuItem() {
  const router = useRouter();
  const { user, token, isPending, isVendor, isBlocked } =
    useVendorDashboardAccess();
  const [activeCount, setActiveCount] = useState<number | null>(null);

  useEffect(() => {
    if (!token || !isVendor || isBlocked) return;

    const controller = new AbortController();
    void getVendorMenuItems(token, controller.signal)
      .then((items) => {
        setActiveCount(items.filter(itemIsActive).length);
      })
      .catch(() => {
        // The create call still checks the limit on the server.
        setActiveCount(null);
      });

    return () => controller.abort();
  }, [isBlocked, isVendor, token]);

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

  const isPremium = user.subscriptionPlan === "premium";
  const limitReached =
    !isPremium &&
    activeCount !== null &&
    activeCount >= FREE_ACTIVE_ITEM_LIMIT;

  return (
    <VendorDashboardFrame
      title="Add Menu Item"
      description="Add a new item to your restaurant's menu."
    >
      {limitReached ? (
        <div className="mt-8 rounded-xl border border-amber-400/30 bg-amber-400/10 p-6 text-amber-100">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Crown aria-hidden="true" size={18} className="text-amber-300" />
            Free plan limit reached
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-100/80">
            Your Free plan already has {activeCount} active menu items (limit{" "}
            {FREE_ACTIVE_ITEM_LIMIT}). Deactivate one of them, or upgrade to
            Premium to publish unlimited items.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/vendor/subscription"
              className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#221703] transition hover:bg-amber-300"
            >
              Upgrade to Premium
            </Link>
            <Link
              href="/dashboard/vendor/menu-items"
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5"
            >
              Back to my menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <VendorMenuItemForm
            submitLabel="Create item"
            onCancel={() => router.push("/dashboard/vendor/menu-items")}
            onSubmit={async (input) => {
              await createVendorMenuItem(token, input);
              toast.success("Menu item created.");
              router.push("/dashboard/vendor/menu-items");
            }}
          />
        </div>
      )}
    </VendorDashboardFrame>
  );
}
