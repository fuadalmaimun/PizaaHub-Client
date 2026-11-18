"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, RefreshCw, Store, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import {
  deleteVendorMenuItem,
  getVendorMenuItems,
  updateVendorMenuItem,
  type VendorMenuItemInput,
} from "@/lib/core/server";
import type { MenuItem } from "@/lib/types/menu";

import VendorMenuItemForm from "./VendorMenuItemForm";
import {
  errorMessage,
  useVendorDashboardAccess,
  VendorDashboardFrame,
  VendorDashboardStatus,
} from "./VendorDashboardShared";

function itemId(item: MenuItem) {
  return item._id ?? item.id;
}

function itemName(item: MenuItem) {
  return item.itemName ?? item.name ?? "Menu item";
}

function itemIsActive(item: MenuItem) {
  return (
    item.status !== "inactive" &&
    item.isActive !== false &&
    item.isAvailable !== false
  );
}

export default function VendorMenuItems() {
  const { user, token, isPending, isVendor, isBlocked } =
    useVendorDashboardAccess();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !isVendor || isBlocked) return;

    const controller = new AbortController();
    void getVendorMenuItems(token ?? "", controller.signal)
      .then((menuItems) => {
        setItems(menuItems);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load your menu items."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isPending, isVendor, reloadCount, token]);

  async function refreshItems() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      setItems(await getVendorMenuItems(token));
      setError(null);
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh menu items.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function saveItem(id: string, input: VendorMenuItemInput) {
    if (!token) throw new Error("Your session token is missing.");
    await updateVendorMenuItem(token, id, input);
    toast.success("Menu item updated.");
    setEditingItem(null);
    setIsLoading(true);
    setReloadCount((count) => count + 1);
  }

  async function toggleAvailability(item: MenuItem) {
    const id = itemId(item);
    if (!token || !id) {
      toast.error("Could not identify this menu item.");
      return;
    }

    setBusyItemId(id);
    try {
      await updateVendorMenuItem(token, id, {
        isActive: !itemIsActive(item),
      });
      toast.success(
        itemIsActive(item) ? "Menu item deactivated." : "Menu item activated.",
      );
      setIsLoading(true);
      setReloadCount((count) => count + 1);
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not update menu item."));
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeMenuItem(item: MenuItem) {
    const id = itemId(item);
    if (!token || !id) {
      toast.error("Could not identify this menu item.");
      return;
    }

    setBusyItemId(id);
    try {
      await deleteVendorMenuItem(token, id);
      toast.success("Menu item deleted.");
      setIsLoading(true);
      setReloadCount((count) => count + 1);
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not delete menu item."));
    } finally {
      setBusyItemId(null);
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
      title="My Menu Items"
      description="Manage, update, and track your published menu items."
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refreshItems()}
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
          <Link
            href="/dashboard/vendor/add-menu-item"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-emerald-500"
          >
            <Plus aria-hidden="true" size={17} />
            Add menu item
          </Link>
        </div>
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
        <div role="status" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading menu items...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-white/55">
          <p>No menu items were returned by the backend.</p>
          <Link
            href="/dashboard/vendor/add-menu-item"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-500"
          >
            <Plus aria-hidden="true" size={16} />
            Add your first item
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const id = itemId(item);
            const image = item.images?.[0] ?? item.image;
            const active = itemIsActive(item);

            return (
              <article
                key={id ?? `${itemName(item)}-${index}`}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#111315]"
              >
                {editingItem && id && id === itemId(editingItem) ? (
                  <div className="p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="font-semibold">Edit menu item</h2>
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="rounded-lg px-3 py-1.5 text-sm text-white/60 hover:bg-white/10 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                    <VendorMenuItemForm
                      key={id}
                      item={editingItem}
                      submitLabel="Save changes"
                      onSubmit={async (input) => {
                        if (!id) {
                          throw new Error("Could not identify this menu item.");
                        }
                        await saveItem(id, input);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-4/3 bg-white/5">
                      {image ? (
                        <Image
                          src={image}
                          alt={itemName(item)}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-white/30">
                          <Store aria-hidden="true" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                            {item.category}
                          </p>
                          <h2 className="mt-1 truncate font-semibold">
                            {itemName(item)}
                          </h2>
                        </div>
                        <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/60">
                          {item.status ?? "Status unavailable"}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-10 text-sm text-white/55">
                        {item.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <p className="font-bold">
                          ৳{item.price.toLocaleString("en-BD")}
                        </p>
                        <span
                          className={`text-xs font-semibold ${
                            active ? "text-emerald-300" : "text-white/45"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!id || busyItemId === id}
                          onClick={() => setEditingItem(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/5 disabled:opacity-40"
                        >
                          <Pencil aria-hidden="true" size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={!id || busyItemId === id}
                          onClick={() => void toggleAvailability(item)}
                          className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/5 disabled:opacity-40"
                        >
                          {busyItemId === id
                            ? "Saving..."
                            : active
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                        <button
                          type="button"
                          disabled={!id || busyItemId === id}
                          onClick={() => void removeMenuItem(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
                        >
                          <Trash2 aria-hidden="true" size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
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
          Retry loading items
        </button>
      )}
    </VendorDashboardFrame>
  );
}
