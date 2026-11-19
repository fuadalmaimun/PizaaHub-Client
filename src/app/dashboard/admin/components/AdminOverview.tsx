"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  CreditCard,
  Pizza,
  ShieldCheck,
  Store,
  UserCog,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

import {
  getAdminMenuItems,
  getAdminOverview,
  getAdminTransactions,
  type AdminTransaction,
} from "@/lib/core/server";
import type { MenuItem } from "@/lib/types/menu";

import {
  AdminDashboardFrame,
  AdminDashboardStatus,
  errorMessage,
  getRecord,
  useAdminDashboardAccess,
} from "./AdminDashboardShared";
import {
  AreaTrendChart,
  BarSeriesChart,
  DonutChart,
  type ChartDatum,
} from "@/app/dashboard/components/DashboardCharts";
import {
  CHART_COLORS,
  DashboardError,
  DashboardSkeleton,
  Panel,
  ProfileCard,
  QuickLink,
  RefreshButton,
  StatCard,
} from "@/app/dashboard/components/DashboardKit";

type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalMenuItems: number;
  pendingMenuItems: number;
  totalTransactions: number;
};

function parseStats(payload: unknown): AdminStats {
  const root = getRecord(payload);
  const record = getRecord(root?.data) ?? getRecord(root?.overview) ?? root;
  if (!record) {
    throw new Error("The backend returned invalid admin overview data.");
  }

  const getCount = (key: keyof AdminStats) => {
    const value = record[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("The backend returned invalid admin overview data.");
    }
    return value;
  };

  return {
    totalUsers: getCount("totalUsers"),
    totalVendors: getCount("totalVendors"),
    totalCustomers: getCount("totalCustomers"),
    totalMenuItems: getCount("totalMenuItems"),
    pendingMenuItems: getCount("pendingMenuItems"),
    // Older deployments do not send this field yet.
    totalTransactions: Number.isFinite(record.totalTransactions)
      ? Number(record.totalTransactions)
      : 0,
  };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthlyRevenue(transactions: AdminTransaction[]): ChartDatum[] {
  const now = new Date();
  const buckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      name: MONTHS[date.getMonth()],
      value: 0,
    };
  });
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const transaction of transactions) {
    if (String(transaction.status).toLowerCase() !== "paid") continue;
    const created = new Date(transaction.createdAt);
    if (Number.isNaN(created.getTime())) continue;
    const bucket = byKey.get(`${created.getFullYear()}-${created.getMonth()}`);
    if (bucket) bucket.value += transaction.amount;
  }

  return buckets.map(({ name, value }) => ({
    name,
    value: Math.round(value * 100) / 100,
  }));
}

function currencySymbol(transactions: AdminTransaction[]) {
  const currency = (transactions[0]?.currency ?? "usd").toUpperCase();
  if (currency === "USD") return "$";
  if (currency === "BDT") return "৳";
  if (currency === "EUR") return "€";
  return `${currency} `;
}

export default function AdminOverview() {
  const { user, token, isPending, isAdmin, isBlocked } =
    useAdminDashboardAccess();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (isPending || !isAdmin || isBlocked) return;

    const controller = new AbortController();
    void Promise.all([
      getAdminOverview(token ?? "", controller.signal),
      getAdminMenuItems(token ?? "", {}, controller.signal),
      getAdminTransactions(token ?? "", controller.signal),
    ])
      .then(([overviewData, items, paymentRows]) => {
        setStats(parseStats(overviewData));
        setMenuItems(items);
        setTransactions(paymentRows);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load admin overview."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isAdmin, isBlocked, isPending, reloadCount, token]);

  async function refresh() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      const [overviewData, items, paymentRows] = await Promise.all([
        getAdminOverview(token),
        getAdminMenuItems(token),
        getAdminTransactions(token),
      ]);
      setStats(parseStats(overviewData));
      setMenuItems(items);
      setTransactions(paymentRows);
      setError(null);
      toast.success("Admin overview refreshed.");
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh admin overview.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  const menuStatusData = useMemo<ChartDatum[]>(() => {
    const counts: Record<string, number> = {
      approved: 0,
      pending: 0,
      rejected: 0,
      inactive: 0,
    };
    for (const item of menuItems) {
      const status = (item.status ?? "pending").toLowerCase();
      counts[status] = (counts[status] ?? 0) + 1;
    }
    return [
      { name: "Approved", value: counts.approved, color: CHART_COLORS.emerald },
      { name: "Pending", value: counts.pending, color: CHART_COLORS.amber },
      { name: "Rejected", value: counts.rejected, color: CHART_COLORS.rose },
      { name: "Inactive", value: counts.inactive, color: "#64748b" },
    ];
  }, [menuItems]);

  const revenueData = useMemo(() => monthlyRevenue(transactions), [transactions]);
  const revenueTotal = useMemo(
    () =>
      transactions
        .filter((row) => String(row.status).toLowerCase() === "paid")
        .reduce((sum, row) => sum + row.amount, 0),
    [transactions],
  );
  const paidCount = useMemo(
    () =>
      transactions.filter(
        (row) => String(row.status).toLowerCase() === "paid",
      ).length,
    [transactions],
  );

  if (isPending || !user || !isAdmin) {
    return (
      <AdminDashboardStatus>
        {isPending ? "Checking your account..." : "Redirecting..."}
      </AdminDashboardStatus>
    );
  }

  if (isBlocked) {
    return (
      <AdminDashboardStatus error>
        Your account is blocked and cannot access admin tools.
      </AdminDashboardStatus>
    );
  }

  if (!token) {
    return (
      <AdminDashboardStatus error>
        Your session token is missing. Please sign in again.
      </AdminDashboardStatus>
    );
  }

  const roleData: ChartDatum[] = stats
    ? [
        {
          name: "Vendors",
          value: stats.totalVendors,
          color: CHART_COLORS.amber,
        },
        {
          name: "Customers",
          value: stats.totalCustomers,
          color: CHART_COLORS.violet,
        },
        {
          name: "Admins",
          value: Math.max(
            0,
            stats.totalUsers - stats.totalVendors - stats.totalCustomers,
          ),
          color: CHART_COLORS.sky,
        },
      ]
    : [];

  return (
    <AdminDashboardFrame
      title={`Welcome, ${user.name || "Admin"}`}
      description="Monitor users, menu reviews and Premium subscription revenue across PizzaHub."
      actions={
        <>
          <Link
            href="/dashboard/admin/menu-items"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 sm:text-sm"
          >
            <ClipboardCheck aria-hidden="true" size={15} />
            Review items
          </Link>
          <RefreshButton
            onClick={() => void refresh()}
            busy={isLoading || isRefreshing}
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
        <DashboardSkeleton cards={6} charts={2} />
      ) : error && !stats ? (
        <Panel>
          <p className="py-6 text-center text-sm text-white/60">
            Admin overview could not be loaded.
          </p>
        </Panel>
      ) : (
        <>
          {stats && stats.pendingMenuItems > 0 && (
            <Link
              href="/dashboard/admin/menu-items"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100 transition hover:border-amber-400/40 sm:px-5"
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck aria-hidden="true" size={17} />
                <span>
                  <strong className="font-semibold">
                    {stats.pendingMenuItems} menu item
                    {stats.pendingMenuItems === 1 ? "" : "s"}
                  </strong>{" "}
                  waiting for your review.
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                Review now
                <ArrowRight aria-hidden="true" size={14} />
              </span>
            </Link>
          )}

          <section
            aria-label="Admin platform overview"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <StatCard
              icon={Users}
              label="Registered users"
              value={stats?.totalUsers ?? 0}
              hint="Customers, vendors and admins"
              accent="sky"
              href="/dashboard/admin/users"
            />
            <StatCard
              icon={Store}
              label="Vendors"
              value={stats?.totalVendors ?? 0}
              hint="Restaurants selling on PizzaHub"
              accent="amber"
              href="/dashboard/admin/users?role=vendor"
            />
            <StatCard
              icon={Users}
              label="Customers"
              value={stats?.totalCustomers ?? 0}
              hint="People ordering pizza"
              accent="violet"
              href="/dashboard/admin/users?role=customer"
            />
            <StatCard
              icon={Pizza}
              label="Menu items"
              value={stats?.totalMenuItems ?? 0}
              hint="Across every vendor"
              accent="emerald"
              href="/dashboard/admin/menu-items"
            />
            <StatCard
              icon={ShieldCheck}
              label="Pending reviews"
              value={stats?.pendingMenuItems ?? 0}
              hint={
                stats && stats.pendingMenuItems > 0
                  ? "Needs your approval"
                  : "Everything reviewed"
              }
              accent="orange"
              href="/dashboard/admin/menu-items?status=pending"
            />
            <StatCard
              icon={CreditCard}
              label="Transactions"
              value={stats?.totalTransactions ?? transactions.length}
              hint="Premium subscription payments"
              accent="teal"
              href="/dashboard/admin/transactions"
            />
          </section>

          <div className="grid gap-4 lg:grid-cols-5">
            <Panel
              className="lg:col-span-2"
              title="Users by role"
              description="How your community is distributed."
            >
              <DonutChart
                data={roleData}
                centerValue={stats?.totalUsers ?? 0}
                centerLabel="Users"
                suffix=" users"
              />
            </Panel>

            <Panel
              className="lg:col-span-3"
              title="Menu items by status"
              description="Approval pipeline across all vendors."
              action={
                <Link
                  href="/dashboard/admin/menu-items"
                  className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  Manage
                </Link>
              }
            >
              <BarSeriesChart
                data={menuStatusData}
                suffix=" items"
                height={220}
              />
            </Panel>
          </div>

          <Panel
            title="Premium revenue"
            description={`${paidCount} paid transaction${paidCount === 1 ? "" : "s"} in total${
              revenueTotal > 0
                ? ` · ${currencySymbol(transactions)}${revenueTotal.toFixed(2)} collected`
                : ""
            }`}
            action={
              <Link
                href="/dashboard/admin/transactions"
                className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
              >
                All transactions
              </Link>
            }
          >
            <AreaTrendChart
              data={revenueData}
              color={CHART_COLORS.emerald}
              valuePrefix={currencySymbol(transactions)}
              height={240}
            />
          </Panel>

          <div className="grid gap-4 lg:grid-cols-3">
            <ProfileCard
              name={user.name}
              email={user.email}
              image={user.image}
              role="admin"
              createdAt={user.createdAt ? String(user.createdAt) : null}
              editHref="/dashboard/admin/profile"
            />

            <Panel
              className="lg:col-span-2"
              title="Quick actions"
              description="Jump straight into the tools you use most."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <QuickLink
                  href="/dashboard/admin/users"
                  icon={UserCog}
                  title="Manage users"
                  description="Block, unblock and change roles"
                  accent="sky"
                />
                <QuickLink
                  href="/dashboard/admin/menu-items"
                  icon={UtensilsCrossed}
                  title="Approve menu items"
                  description="Review vendor submissions"
                  accent="orange"
                />
                <QuickLink
                  href="/dashboard/admin/transactions"
                  icon={CreditCard}
                  title="Transactions"
                  description="Premium subscription history"
                  accent="teal"
                />
                <QuickLink
                  href="/dashboard/admin/profile"
                  icon={ShieldCheck}
                  title="Admin profile"
                  description="Update your name and photo"
                  accent="violet"
                />
              </div>
            </Panel>
          </div>
        </>
      )}
    </AdminDashboardFrame>
  );
}
