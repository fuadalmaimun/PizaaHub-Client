"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Heart,
  Pizza,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

import {
  getCustomerOrders,
  getCustomerOverview,
  type CustomerOrder,
} from "@/lib/core/server";

import {
  CustomerDashboardFrame,
  CustomerDashboardStatus,
  errorMessage,
  useCustomerDashboardAccess,
} from "./CustomerDashboardShared";
import {
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

type CustomerOverviewData = {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  rejectedOrders: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOverview(payload: unknown): CustomerOverviewData {
  let value = payload;
  for (let depth = 0; depth < 3 && isRecord(value); depth += 1) {
    if (isRecord(value.data)) {
      value = value.data;
    } else if (isRecord(value.overview)) {
      value = value.overview;
    } else {
      break;
    }
  }

  if (
    !isRecord(value) ||
    typeof value.totalOrders !== "number" ||
    typeof value.pendingOrders !== "number" ||
    typeof value.acceptedOrders !== "number" ||
    typeof value.rejectedOrders !== "number"
  ) {
    throw new Error("The backend returned invalid customer overview data.");
  }

  return {
    totalOrders: value.totalOrders,
    pendingOrders: value.pendingOrders,
    acceptedOrders: value.acceptedOrders,
    rejectedOrders: value.rejectedOrders,
  };
}

function formatDate(value?: string) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function statusChip(status?: string) {
  switch (status?.toLowerCase()) {
    case "accepted":
      return "bg-emerald-400/10 text-emerald-300";
    case "rejected":
      return "bg-rose-400/10 text-rose-300";
    case "cancelled":
      return "bg-white/10 text-white/55";
    default:
      return "bg-amber-400/10 text-amber-300";
  }
}

export default function CustomerOverview() {
  const { user, token, isPending, isCustomer, isBlocked } =
    useCustomerDashboardAccess();
  const [overview, setOverview] = useState<CustomerOverviewData | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (isPending || !isCustomer || isBlocked) return;

    const controller = new AbortController();
    void Promise.all([
      getCustomerOverview(token ?? "", controller.signal),
      getCustomerOrders(token ?? "", controller.signal),
    ])
      .then(([overviewData, orderRows]) => {
        setOverview(parseOverview(overviewData));
        setOrders(orderRows);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load customer overview."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isCustomer, isPending, reloadCount, token]);

  async function refreshOverview() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      const [overviewData, orderRows] = await Promise.all([
        getCustomerOverview(token),
        getCustomerOrders(token),
      ]);
      setOverview(parseOverview(overviewData));
      setOrders(orderRows);
      setError(null);
      toast.success("Your dashboard is up to date.");
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh customer overview.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  const statusData = useMemo<ChartDatum[]>(() => {
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

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => {
          const first = new Date(a.createdAt ?? 0).getTime();
          const second = new Date(b.createdAt ?? 0).getTime();
          return second - first;
        })
        .slice(0, 4),
    [orders],
  );

  const acceptedRate =
    overview && overview.totalOrders > 0
      ? Math.round((overview.acceptedOrders / overview.totalOrders) * 100)
      : 0;

  if (isPending || !user || !isCustomer) {
    return (
      <CustomerDashboardStatus>
        {isPending ? "Checking your account..." : "Redirecting..."}
      </CustomerDashboardStatus>
    );
  }

  if (isBlocked) {
    return (
      <CustomerDashboardStatus error>
        Your account is blocked and cannot access customer tools.
      </CustomerDashboardStatus>
    );
  }

  if (!token) {
    return (
      <CustomerDashboardStatus error>
        Your session token is missing. Please sign in again.
      </CustomerDashboardStatus>
    );
  }

  return (
    <CustomerDashboardFrame
      title={`Welcome, ${user.name || "Customer"}`}
      description="Track your orders, wishlist and delivery progress in one place."
      actions={
        <>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 sm:text-sm"
          >
            <Pizza aria-hidden="true" size={15} />
            Order pizza
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
      ) : error && !overview ? (
        <Panel>
          <p className="py-6 text-center text-sm text-white/60">
            Customer overview could not be loaded.
          </p>
        </Panel>
      ) : (
        <>
          <section
            aria-label="Customer order summary"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard
              icon={ClipboardList}
              label="Total orders"
              value={overview?.totalOrders ?? 0}
              hint="Every pizza you ordered"
              accent="sky"
              href="/dashboard/customer/orders"
            />
            <StatCard
              icon={Clock3}
              label="Pending"
              value={overview?.pendingOrders ?? 0}
              hint="Waiting for vendor response"
              accent="amber"
              href="/dashboard/customer/orders"
            />
            <StatCard
              icon={CheckCircle2}
              label="Accepted"
              value={overview?.acceptedOrders ?? 0}
              hint={`${acceptedRate}% of your orders`}
              accent="emerald"
              href="/dashboard/customer/orders"
            />
            <StatCard
              icon={XCircle}
              label="Rejected"
              value={overview?.rejectedOrders ?? 0}
              hint="Vendors could not fulfil"
              accent="rose"
              href="/dashboard/customer/orders"
            />
          </section>

          <div className="grid gap-4 lg:grid-cols-5">
            <Panel
              className="lg:col-span-2"
              title="Order breakdown"
              description="Where your orders stand right now."
            >
              <DonutChart
                data={statusData}
                centerValue={overview?.totalOrders ?? orders.length}
                centerLabel="Orders"
                suffix=" orders"
              />
            </Panel>

            <Panel
              className="lg:col-span-3"
              title="Recent orders"
              description="Your latest pizza requests."
              action={
                <Link
                  href="/dashboard/customer/orders"
                  className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  View all
                </Link>
              }
              padded={false}
            >
              {recentOrders.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-white/45">
                  No orders yet. Your first pizza is waiting on the menu.
                  <div className="mt-4">
                    <Link
                      href="/menu"
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                    >
                      Browse menu
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-white/8">
                  {recentOrders.map((order) => {
                    const image = order.itemImage ?? order.images?.[0];
                    const name = order.itemName ?? "Pizza order";
                    return (
                      <li
                        key={order._id ?? order.id ?? name}
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03] sm:px-5"
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt=""
                            width={48}
                            height={48}
                            unoptimized
                            className="size-12 shrink-0 rounded-xl border border-white/10 object-cover"
                          />
                        ) : (
                          <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-emerald-300">
                            <Pizza aria-hidden="true" size={20} />
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-white/45">
                            {order.vendorBusinessName ??
                              order.vendorName ??
                              "Local vendor"}{" "}
                            · {formatDate(order.deliveryDate)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusChip(order.status)}`}
                        >
                          {order.status ?? "pending"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ProfileCard
              name={user.name}
              email={user.email}
              image={user.image}
              role="customer"
              createdAt={user.createdAt ? String(user.createdAt) : null}
              editHref="/dashboard/customer/profile"
            />

            <Panel
              className="lg:col-span-2"
              title="Quick actions"
              description="Shortcuts to the things you do most."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <QuickLink
                  href="/menu"
                  icon={Pizza}
                  title="Browse the menu"
                  description="Find your next favorite pizza"
                  accent="emerald"
                />
                <QuickLink
                  href="/dashboard/customer/orders"
                  icon={ClipboardList}
                  title="My orders"
                  description="Track or cancel pending orders"
                  accent="orange"
                />
                <QuickLink
                  href="/dashboard/customer/favorites"
                  icon={Heart}
                  title="My wishlist"
                  description="Saved pizzas you love"
                  accent="rose"
                />
                <QuickLink
                  href="/dashboard/customer/profile"
                  icon={RefreshCw}
                  title="Profile settings"
                  description="Name, photo and details"
                  accent="violet"
                />
              </div>
            </Panel>
          </div>
        </>
      )}
    </CustomerDashboardFrame>
  );
}
