"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClipboardList, Pizza, RefreshCw, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  cancelCustomerOrder,
  getCustomerOrders,
  type CustomerOrder,
} from "@/lib/core/server";

import {
  CustomerDashboardFrame,
  CustomerDashboardStatus,
  errorMessage,
  useCustomerDashboardAccess,
} from "./CustomerDashboardShared";

function orderId(order: CustomerOrder) {
  return order._id ?? order.id;
}

function orderItemName(order: CustomerOrder) {
  return order.itemName ?? "Pizza order";
}

function formatDate(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function statusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "accepted":
      return "bg-emerald-400/10 text-emerald-300";
    case "rejected":
      return "bg-red-400/10 text-red-300";
    case "cancelled":
      return "bg-white/10 text-white/55";
    default:
      return "bg-amber-400/10 text-amber-300";
  }
}

export default function CustomerOrders() {
  const { user, token, isPending, isCustomer, isBlocked } =
    useCustomerDashboardAccess();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<CustomerOrder | null>(
    null,
  );

  useEffect(() => {
    if (isPending || !isCustomer || isBlocked) return;

    const controller = new AbortController();
    void getCustomerOrders(token ?? "", controller.signal)
      .then((customerOrders) => {
        setOrders(
          customerOrders.filter(
            (order) => order.status?.toLowerCase() !== "cancelled",
          ),
        );
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load your orders."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isCustomer, isPending, reloadCount, token]);

  async function refreshOrders() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      setOrders(
        (await getCustomerOrders(token)).filter(
          (order) => order.status?.toLowerCase() !== "cancelled",
        ),
      );
      setError(null);
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh your orders.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function cancelOrder(order: CustomerOrder) {
    const id = orderId(order);
    if (!token || !id || order.status?.toLowerCase() !== "pending") {
      toast.error("Only your pending orders can be cancelled.");
      return;
    }

    setBusyOrderId(id);
    try {
      await cancelCustomerOrder(token, id);
      setOrders((currentOrders) =>
        currentOrders.filter((currentOrder) => orderId(currentOrder) !== id),
      );
      setOrderToCancel(null);
      toast.success("Order cancelled and permanently deleted.");
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not cancel this order."));
    } finally {
      setBusyOrderId(null);
    }
  }

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
      title="My Orders"
      description="Check your order status, delivery information, and request details."
      actions={
        <Button
          type="button"
          variant="outline"
          onClick={() => void refreshOrders()}
          disabled={isRefreshing || isLoading}
          className="border-white/15 bg-transparent text-white/80 hover:bg-white/5 hover:text-white"
        >
          <RefreshCw
            aria-hidden="true"
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </Button>
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

      <AlertDialog
        open={orderToCancel !== null}
        onOpenChange={(open) => {
          if (!open && !busyOrderId) setOrderToCancel(null);
        }}
      >
        <AlertDialogContent className="border border-white/10 bg-[#15171b] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {orderToCancel
                ? `Your pending order for ${orderItemName(orderToCancel)} will be permanently deleted. This cannot be undone.`
                : "This pending order will be permanently deleted. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-white/10 bg-white/[0.03]">
            <AlertDialogCancel
              disabled={busyOrderId !== null}
              className="border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Keep order
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={busyOrderId !== null || !orderToCancel}
              onClick={() => {
                if (orderToCancel) void cancelOrder(orderToCancel);
              }}
            >
              {busyOrderId ? "Deleting..." : "Permanently cancel"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <div role="status" className="mt-8 space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading your orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
          <Pizza
            aria-hidden="true"
            className="mx-auto text-emerald-400"
            size={32}
          />
          <p className="mt-3 text-sm text-white/60">You have no orders yet.</p>
          <Link
            href="/menu"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order, index) => {
            const id = orderId(order);
            const status = order.status?.toLowerCase();
            const image = order.itemImage ?? order.images?.[0];

            return (
              <article
                key={id ?? `customer-order-${index}`}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#111315]"
              >
                <div className="grid gap-5 p-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-white/5">
                    {image ? (
                      <Image
                        src={image}
                        alt={orderItemName(order)}
                        fill
                        sizes="128px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-emerald-400/60">
                        <Pizza aria-hidden="true" size={34} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {orderItemName(order)}
                        </h2>
                        <p className="mt-1 text-sm text-white/55">
                          Vendor:{" "}
                          {order.vendorBusinessName ??
                            order.vendorName ??
                            order.vendorId ??
                            "Not provided"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(status)}`}
                      >
                        {order.status ?? "Status unavailable"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
                      <p>
                        <span className="text-white/35">Delivery date: </span>
                        {formatDate(order.deliveryDate)}
                      </p>
                      <p>
                        <span className="text-white/35">Request date: </span>
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="sm:col-span-2 break-words">
                        <span className="text-white/35">Delivery address: </span>
                        {order.deliveryAddress ?? "Not provided"}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-emerald-300">
                          <ClipboardList aria-hidden="true" size={16} />
                          View order details
                        </summary>
                        <div className="mt-3 space-y-2 text-sm text-white/55">
                          {id && <p>Order ID: {id}</p>}
                          {typeof order.itemPrice === "number" && (
                            <p>
                              Item price: ৳
                              {order.itemPrice.toLocaleString("en-BD")}
                            </p>
                          )}
                          <p>Item ID: {order.itemId ?? "Not provided"}</p>
                          {order.message && <p>Message: {order.message}</p>}
                        </div>
                      </details>

                      {status === "pending" && (
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={!id || busyOrderId === id}
                          onClick={() => setOrderToCancel(order)}
                        >
                          <X aria-hidden="true" />
                          Cancel order
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
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
    </CustomerDashboardFrame>
  );
}
