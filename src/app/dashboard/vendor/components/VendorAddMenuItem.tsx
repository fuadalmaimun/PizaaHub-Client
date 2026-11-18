"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";

import { createVendorMenuItem } from "@/lib/core/server";

import VendorMenuItemForm from "./VendorMenuItemForm";
import {
  useVendorDashboardAccess,
  VendorDashboardFrame,
  VendorDashboardStatus,
} from "./VendorDashboardShared";

export default function VendorAddMenuItem() {
  const router = useRouter();
  const { user, token, isPending, isVendor, isBlocked } =
    useVendorDashboardAccess();

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

  return (
    <VendorDashboardFrame
      title="Add Menu Item"
      description="Add a new item to your restaurant's menu."
    >
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
    </VendorDashboardFrame>
  );
}
