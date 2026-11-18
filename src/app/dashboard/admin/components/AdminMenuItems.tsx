"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { toast } from "@/components/ui/sonner";
import { Check, RefreshCw, Search, Trash2, X } from "lucide-react";

import {
  deleteAdminMenuItem,
  getAdminMenuItems,
  updateAdminMenuItemStatus,
} from "@/lib/core/server";
import type { MenuItem } from "@/lib/types/menu";

import {
  AdminDashboardFrame,
  AdminDashboardStatus,
  errorMessage,
  useAdminDashboardAccess,
} from "./AdminDashboardShared";

type StatusFilter = "" | "pending" | "approved" | "rejected" | "inactive";

function itemId(item: MenuItem) {
  return item._id ?? item.id;
}

function itemName(item: MenuItem) {
  return item.itemName ?? item.name ?? "Menu item";
}

export default function AdminMenuItems() {
  const { user, token, isPending, isAdmin, isBlocked } =
    useAdminDashboardAccess();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (isPending || !isAdmin || isBlocked || !token) return;

    const controller = new AbortController();
    void getAdminMenuItems(
      token ?? "",
      { search, status: status || undefined },
      controller.signal,
    )
      .then((result) => {
        setItems(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load menu items."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isAdmin, isBlocked, isPending, reloadCount, search, status, token]);

  async function refresh() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      setItems(
        await getAdminMenuItems(token, {
          search,
          status: status || undefined,
        }),
      );
      setError(null);
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh menu items.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function changeStatus(item: MenuItem, nextStatus: "approved" | "rejected") {
    const id = itemId(item);
    if (!token || !id) {
      toast.error("Could not identify this menu item.");
      return;
    }

    setBusyItemId(id);
    try {
      await updateAdminMenuItemStatus(token, id, nextStatus);
      setItems((currentItems) =>
        currentItems.flatMap((currentItem) => {
          if (itemId(currentItem) !== id) return [currentItem];
          if (status && status !== nextStatus) return [];
          return [{ ...currentItem, status: nextStatus }];
        }),
      );
      toast.success(
        nextStatus === "approved" ? "Menu item approved." : "Menu item rejected.",
      );
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not update menu item status."));
    } finally {
      setBusyItemId(null);
    }
  }

  async function deleteItem() {
    const id = itemToDelete && itemId(itemToDelete);
    if (!token || !id) {
      toast.error("Could not identify this menu item.");
      return;
    }

    setBusyItemId(id);
    try {
      await deleteAdminMenuItem(token, id);
      setItems((currentItems) =>
        currentItems.filter((currentItem) => itemId(currentItem) !== id),
      );
      setItemToDelete(null);
      toast.success("Menu item deleted.");
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not delete menu item."));
    } finally {
      setBusyItemId(null);
    }
  }

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

  return (
    <AdminDashboardFrame
      title="Manage Menu Items"
      description="Review submissions, update visibility status, and remove inappropriate items."
      actions={
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading || isRefreshing}
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
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(searchInput.trim());
        }}
        className="mt-8 grid gap-3 rounded-xl border border-white/10 bg-[#111315] p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
      >
        <label className="relative">
          <span className="sr-only">Search menu item names</span>
          <Search
            aria-hidden="true"
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search menu item"
            className="h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-500"
          />
        </label>
        <label>
          <span className="sr-only">Filter menu items by status</span>
          <select
            value={status}
            onChange={(event) => {
              const value = event.target.value;
              setStatus(
                value === "pending" ||
                  value === "approved" ||
                  value === "rejected" ||
                  value === "inactive"
                  ? value
                  : "",
              );
            }}
            className="h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          <Search aria-hidden="true" size={16} />
          Search
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      <AlertDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !busyItemId) setItemToDelete(null);
        }}
      >
        <AlertDialogContent className="border border-white/10 bg-[#15171b] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this menu item?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {itemToDelete
                ? `${itemName(itemToDelete)} will be permanently deleted. This cannot be undone.`
                : "This menu item will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-white/10 bg-white/[0.03]">
            <AlertDialogCancel
              disabled={busyItemId !== null}
              className="border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Keep item
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={busyItemId !== null || !itemToDelete}
              onClick={() => void deleteItem()}
            >
              {busyItemId ? "Deleting..." : "Delete item"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <div role="status" className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading menu items...</span>
        </div>
      ) : error && items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/65">
          Menu items could not be loaded.
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setReloadCount((count) => count + 1);
            }}
            className="ml-2 font-semibold text-emerald-300 underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-white/55">
          No menu items match the selected filters.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((item, index) => {
            const id = itemId(item);
            const image = item.images?.[0] ?? item.image;
            const itemStatus = item.status ?? "unknown";

            return (
              <article
                key={id ?? `${itemName(item)}-${index}`}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#111315]"
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
                  <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-white/5 sm:aspect-square">
                    {image ? (
                      <Image
                        src={image}
                        alt={itemName(item)}
                        fill
                        sizes="(max-width: 640px) 100vw, 144px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-white/30">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                          {item.category}
                        </p>
                        <h2 className="mt-1 truncate font-semibold">
                          {itemName(item)}
                        </h2>
                      </div>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs capitalize text-white/65">
                        {itemStatus}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-white/55">
                      {item.description}
                    </p>
                    <dl className="mt-3 space-y-1 text-xs text-white/50">
                      <div className="flex gap-1">
                        <dt>Vendor:</dt>
                        <dd className="truncate">
                          {item.vendorName ??
                            item.vendor?.businessName ??
                            item.vendor?.name ??
                            item.vendorId ??
                            "Not provided"}
                        </dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>Location:</dt>
                        <dd>{item.location ?? "Not provided"}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>Price:</dt>
                        <dd>৳{item.price.toLocaleString("en-BD")}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 p-4">
                  <button
                    type="button"
                    disabled={!id || busyItemId === id || itemStatus === "approved"}
                    onClick={() => void changeStatus(item, "approved")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Check aria-hidden="true" size={14} />
                    {busyItemId === id ? "Updating..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={!id || busyItemId === id || itemStatus === "rejected"}
                    onClick={() => void changeStatus(item, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/25 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X aria-hidden="true" size={14} />
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={!id || busyItemId === id}
                    onClick={() => setItemToDelete(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/25 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 aria-hidden="true" size={14} />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AdminDashboardFrame>
  );
}
