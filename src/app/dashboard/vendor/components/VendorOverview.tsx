"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  CreditCard,
  Crown,
  Pizza,
  Plus,
  Store,
  TrendingUp,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

import {
  getVendorMenuItems,
  getVendorOrders,
  getVendorOverview,
  type VendorOrder,
} from "@/lib/core/server";
import type { MenuItem } from "@/lib/types/menu";

import {
  errorMessage,
  useVendorDashboardAccess,
  VendorDashboardFrame,
  VendorDashboardStatus,
} from "./VendorDashboardShared";
import {
  BarSeriesChart,
  DonutChart,
  type ChartDatum,
} from "@/app/dashboard/components/DashboardCharts";
import {
  Badge,
  CHART_COLORS,
  DashboardError,
  DashboardSkeleton,
  Panel,
  ProfileCard,
  QuickLink,
  RefreshButton,
  StatCard,
  UsageMeter,
} from "@/app/dashboard/components/DashboardKit";

type VendorStats = {
  totalMenuItems: number;
  activeMenuItems: number;
  pendingOrders: number;
  acceptedOrders: number;
};

const FREE_ACTIVE_ITEM_LIMIT = 3;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStats(payload: unknown): VendorStats {
  let value = payload;
  for (let depth = 0; depth < 3 && isRecord(value); depth += 1) {
    if (isRecord(value.data)) value = value.data;
    else if (isRecord(value.overview)) value = value.overview;
    else break;
  }

  if (!isRecord(value)) {
    throw new Error("The backend returned an invalid vendor overview.");
  }

  const count = (key: keyof VendorStats) =>
    typeof value[key] === "number" ? Number(value[key]) : 0;

  return {
    totalMenuItems: count("totalMenuItems"),
    activeMenuItems: count("activeMenuItems"),
    pendingOrders: count("pendingOrders"),
    acceptedOrders: count("acceptedOrders"),
  };
}

function itemIsActive(item: MenuItem) {
  return (
    item.status !== "inactive" &&
    item.isActive !== false &&
    item.isAvailable !== false
  );
}

export default function VendorOverview() {
  const { user, token, isPending, isVendor, isBlocked } =
    useVendorDashboardAccess();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (isPending || !isVendor || isBlocked) return;

    const controller = new AbortController();
    void Promise.all([
      getVendorOverview(token ?? "", controller.signal),
      getVendorMenuItems(token ?? "", controller.signal),
      getVendorOrders(token ?? "", controller.signal),
    ])
      .then(([overviewData, menuItems, orderRows]) => {
        setStats(parseStats(overviewData));
        setItems(menuItems);
        setOrders(orderRows);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load vendor overview."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isPending, isVendor, reloadCount, token]);

  async function refreshOverview() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      const [overviewData, menuItems, orderRows] = await Promise.all([
        getVendorOverview(token),
        getVendorMenuItems(token),
        getVendorOrders(token),
      ]);
      setStats(parseStats(overviewData));
      setItems(menuItems);
      setOrders(orderRows);
      setError(null);
      toast.success("Vendor overview refreshed.");
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh vendor overview.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  const isPremium = user?.subscriptionPlan === "premium";
  const activeCount = useMemo(() => items.filter(itemIsActive).length, [items]);

  const orderStatusData = useMemo<ChartDatum[]>(() => {
    const counts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
    };
    for (const order of orders) {
      const status = String(order.status ?? "pending").toLowerCase();
      counts[status] = (counts[status] ?? 0) + 1;
    }
    return [
      { name: "Pending", value: counts.pending, color: CHART_COLORS.amber },
      { name: "Accepted", value: counts.accepted, color: CHART_COLORS.emerald },
      { name: "Rejected", value: counts.rejected, color: CHART_COLORS.rose },
      { name: "Cancelled", value: counts.cancelled, color: "#64748b" },
    ];
  }, [orders]);

  const itemStatusData = useMemo<ChartDatum[]>(() => {
    const counts: Record<string, number> = {
      approved: 0,
      pending: 0,
      rejected: 0,
      inactive: 0,
    };
    for (const item of items) {
      const status = (item.status ?? "pending").toLowerCase();
      counts[status] = (counts[status] ?? 0) + 1;
    }
    return [
      { name: "Approved", value: counts.approved, color: CHART_COLORS.emerald },
      { name: "Pending", value: counts.pending, color: CHART_COLORS.amber },
      { name: "Rejected", value: counts.rejected, color: CHART_COLORS.rose },
      { name: "Inactive", value: counts.inactive, color: "#64748b" },
    ];
  }, [items]);

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
      title={`Welcome, ${user.name || "Vendor"}`}
      description="Track your menu, orders and Premium subscription at a glance."
      actions={
        <>
          <Link
            href="/dashboard/vendor/add-menu-item"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 sm:text-sm"
          >
            <Plus aria-hidden="true" size={15} />
            Add item
          </Link>
          <RefreshButton
            onClick={() => void refreshOverview()}
            busy={isRefreshing || isLoading}
          />
        </>
      }
    >
      {error && (
        <DashboardError
          message={error}
          onRetry={() => {
            setIsLoading(true);
            setReloadCount((count) => count + 1);
          }}
        />
      )}

      {isLoading ? (
        <DashboardSkeleton cards={4} charts={2} />
      ) : error && !stats ? (
        <Panel>
          <p className="py-6 text-center text-sm text-white/60">
            Vendor data could not be loaded.
          </p>
        </Panel>
      ) : (
        <>
          <section
            aria-label="Vendor overview"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard
              icon={Pizza}
              label="Menu items"
              value={stats?.totalMenuItems ?? items.length}
              hint={`${activeCount} active right now`}
              accent="emerald"
              href="/dashboard/vendor/menu-items"
            />
            <StatCard
              icon={Store}
              label="Active items"
              value={activeCount}
              hint={
                isPremium
                  ? "Unlimited on Premium"
                  : `${Math.min(activeCount, FREE_ACTIVE_ITEM_LIMIT)} of ${FREE_ACTIVE_ITEM_LIMIT} Free plan slots used`
              }
              accent={isPremium ? "amber" : "sky"}
              href="/dashboard/vendor/menu-items"
            />
            <StatCard
              icon={ClipboardList}
              label="Pending orders"
              value={stats?.pendingOrders ?? 0}
              hint="Waiting for your decision"
              accent="orange"
              href="/dashboard/vendor/orders"
            />
            <StatCard
              icon={TrendingUp}
              label="Accepted orders"
              value={stats?.acceptedOrders ?? 0}
              hint="Ready for delivery"
              accent="teal"
              href="/dashboard/vendor/orders"
            />
          </section>

          <div className="grid gap-4 lg:grid-cols-5">
            <Panel
              className="lg:col-span-2"
              title="Orders by status"
              description="Every order you have received."
              action={
                <Link
                  href="/dashboard/vendor/orders"
                  className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  View
                </Link>
              }
            >
              <DonutChart
                data={orderStatusData}
                centerValue={orders.length}
                centerLabel="Orders"
                suffix=" orders"
              />
            </Panel>

            <Panel
              className="lg:col-span-3"
              title="Menu items by status"
              description="Approval state of your published items."
              action={
                <Link
                  href="/dashboard/vendor/menu-items"
                  className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  Manage
                </Link>
              }
            >
              <BarSeriesChart data={itemStatusData} suffix=" items" height={220} />
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ProfileCard
              name={user.name}
              email={user.email}
              image={user.image}
              role="vendor"
              plan={user.subscriptionPlan}
              businessName={user.businessName}
              createdAt={user.createdAt ? String(user.createdAt) : null}
              editHref="/dashboard/vendor/profile"
            />

            <Panel
              className="lg:col-span-2"
              title="Plan & usage"
              description="Free plan allows 3 active items. Premium is unlimited."
              action={
                <Badge tone={isPremium ? "amber" : "neutral"} icon={Crown}>
                  {isPremium ? "Premium" : "Free"}
                </Badge>
              }
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <UsageMeter
                  label="Active menu items"
                  used={activeCount}
                  limit={FREE_ACTIVE_ITEM_LIMIT}
                  unlimited={isPremium}
                  hint={
                    isPremium
                      ? "Premium vendors get unlimited active items and featured placement."
                      : activeCount >= FREE_ACTIVE_ITEM_LIMIT
                        ? "Limit reached. Deactivate an item or upgrade for unlimited items."
                        : `You can activate ${FREE_ACTIVE_ITEM_LIMIT - activeCount} more item${
                            FREE_ACTIVE_ITEM_LIMIT - activeCount === 1 ? "" : "s"
                          } on the Free plan.`
                  }
                />

                <div className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div>
                    <p className="text-xs font-semibold text-white/55">
                      {isPremium
                        ? "Your Premium subscription"
                        : "Unlock more with Premium"}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-white/45">
                      {isPremium
                        ? "Unlimited items, featured homepage placement and priority visibility."
                        : "Unlimited menu items, a Premium badge and featured homepage placement for $10/year."}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/vendor/subscription"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                  >
                    <CreditCard aria-hidden="true" size={14} />
                    {isPremium ? "Manage subscription" : "Upgrade to Premium"}
                  </Link>
                </div>
              </div>
            </Panel>
          </div>

          <Panel title="Quick actions" description="Everything one click away.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <QuickLink
                href="/dashboard/vendor/add-menu-item"
                icon={Plus}
                title="Add menu item"
                description="Publish a new pizza"
                accent="emerald"
              />
              <QuickLink
                href="/dashboard/vendor/menu-items"
                icon={Pizza}
                title="My menu"
                description="Edit, toggle or delete items"
                accent="sky"
              />
              <QuickLink
                href="/dashboard/vendor/orders"
                icon={ClipboardList}
                title="Customer orders"
                description="Accept or reject orders"
                accent="orange"
              />
              <QuickLink
                href="/dashboard/vendor/subscription"
                icon={Crown}
                title="Subscription"
                description="Plan, renewal and receipts"
                accent="amber"
              />
            </div>
          </Panel>
        </>
      )}
    </VendorDashboardFrame>
  );
}
