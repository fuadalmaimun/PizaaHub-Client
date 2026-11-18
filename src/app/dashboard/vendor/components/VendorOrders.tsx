"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import {
  getVendorOrders,
  updateVendorOrder,
  type VendorOrder,
} from "@/lib/core/server";

import {
  errorMessage,
  useVendorDashboardAccess,
  VendorDashboardFrame,
  VendorDashboardStatus,
} from "./VendorDashboardShared";

function orderId(order: VendorOrder) {
  return order._id ?? order.id;
}

function orderItemName(order: VendorOrder) {
  if (typeof order.item === "string") return order.item;
  return (
    order.item?.itemName ??
    order.item?.name ??
    order.itemName ??
    order.itemId ??
    "Menu item"
  );
}

function formatDate(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function VendorOrders() {
  const { user, token, isPending, isVendor, isBlocked } =
    useVendorDashboardAccess();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !isVendor || isBlocked) return;

    const controller = new AbortController();
    void getVendorOrders(token ?? "", controller.signal)
      .then((vendorOrders) => {
        setOrders(vendorOrders);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load customer orders."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isPending, isVendor, reloadCount, token]);

  async function refreshOrders() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      setOrders(await getVendorOrders(token));
      setError(null);
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh customer orders.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function changeOrderStatus(
    order: VendorOrder,
    status: "accepted" | "rejected",
  ) {
    const id = orderId(order);
    if (!token || !id) {
      toast.error("Could not identify this order.");
      return;
    }

    setBusyOrderId(id);
    try {
      await updateVendorOrder(token, id, status);
      toast.success(`Order ${status}.`);
      setIsLoading(true);
      setReloadCount((count) => count + 1);
    } catch (cause) {
      toast.error(errorMessage(cause, `Could not ${status} order.`));
    } finally {
      setBusyOrderId(null);
    }
  }

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
      title="Customer Orders"
      description="Review orders and respond to pending requests."
      actions={
        <button
          type="button"
          onClick={() => void refreshOrders()}
          disabled={isRefreshing || isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            aria-hidden="true"
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      }
    >
      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <div role="status" className="mt-8 space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading customer orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-white/55">
          No orders were returned by the backend.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order, index) => {
            const id = orderId(order);
            const pending = order.status?.toLowerCase() === "pending";

            return (
              <article
                key={id ?? `order-${index}`}
                className="rounded-xl border border-white/10 bg-[#111315] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                      Order {id ? `#${id.slice(-8)}` : ""}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {orderItemName(order)}
                    </h2>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-white/70">
                    {order.status ?? "Status unavailable"}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
                  <p>
                    <span className="text-white/35">Customer: </span>
                    {order.customerName ?? order.customerId ?? "Not provided"}
                  </p>
                  <p>
                    <span className="text-white/35">Delivery date: </span>
                    {formatDate(order.deliveryDate)}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-white/35">Address: </span>
                    {order.deliveryAddress ?? "Not provided"}
                  </p>
                  {order.message && (
                    <p className="sm:col-span-2">
                      <span className="text-white/35">Instructions: </span>
                      {order.message}
                    </p>
                  )}
                </div>
                {pending && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      disabled={!id || busyOrderId === id}
                      onClick={() =>
                        void changeOrderStatus(order, "accepted")
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <Check aria-hidden="true" size={16} />
                      {busyOrderId === id ? "Updating..." : "Accept"}
                    </button>
                    <button
                      type="button"
                      disabled={!id || busyOrderId === id}
                      onClick={() =>
                        void changeOrderStatus(order, "rejected")
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-red-400/25 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                    >
                      <X aria-hidden="true" size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      {error && !isLoading && (
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setReloadCount((count) => count + 1);
          }}
          className="mt-4 text-sm font-semibold text-emerald-300 underline underline-offset-4"
        >
          Retry loading orders
        </button>
      )}
    </VendorDashboardFrame>
  );
}
