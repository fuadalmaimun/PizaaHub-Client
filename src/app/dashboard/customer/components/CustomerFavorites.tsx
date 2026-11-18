"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Pizza, Star, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import { Button } from "@/components/ui/button";
import {
  getCustomerFavorites,
  removeCustomerFavorite,
} from "@/lib/core/server";
import type { MenuItem } from "@/lib/types/menu";

import {
  CustomerDashboardFrame,
  CustomerDashboardStatus,
  errorMessage,
  useCustomerDashboardAccess,
} from "./CustomerDashboardShared";

function itemId(item: MenuItem) {
  return item._id ?? item.id;
}

function itemName(item: MenuItem) {
  return item.itemName ?? item.name ?? "Pizza";
}

export default function CustomerFavorites() {
  const { user, token, isPending, isCustomer, isBlocked } =
    useCustomerDashboardAccess();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !isCustomer || isBlocked || !token) return;

    const controller = new AbortController();
    void getCustomerFavorites(token, controller.signal)
      .then((favorites) => {
        setItems(favorites);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load your wishlist."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isBlocked, isCustomer, isPending, reloadCount, token]);

  async function removeFavorite(item: MenuItem) {
    const id = itemId(item);
    if (!token || !id) {
      toast.error("Could not identify this menu item.");
      return;
    }

    setBusyItemId(id);
    try {
      await removeCustomerFavorite(token, id);
      setItems((currentItems) =>
        currentItems.filter((currentItem) => itemId(currentItem) !== id),
      );
      toast.success("Removed from your wishlist.");
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not remove this favorite."));
    } finally {
      setBusyItemId(null);
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
      title="My Wishlist"
      description="Keep the menu items you love together in one place."
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
        <div role="status" className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading your wishlist...</span>
        </div>
      ) : error && items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.035] p-8 text-center text-sm text-white/65">
          Your wishlist could not be loaded.
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
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-12 text-center">
          <Heart aria-hidden="true" className="mx-auto text-rose-400" size={34} />
          <h2 className="mt-3 text-lg font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-white/55">
            Save menu items you want to order later.
          </p>
          <Link
            href="/menu"
            className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const id = itemId(item);
            const image = item.images?.[0] ?? item.image;

            return (
              <article
                key={id ?? `${itemName(item)}-${index}`}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
              >
                <Link
                  href={id ? `/menu/${encodeURIComponent(id)}` : "/menu"}
                  className="relative block aspect-4/3 bg-white/5"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={itemName(item)}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-emerald-400/70">
                      <Pizza aria-hidden="true" size={38} />
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                    {item.category}
                  </p>
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <h2 className="truncate text-lg font-semibold">
                      {itemName(item)}
                    </h2>
                    {typeof item.rating === "number" && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-sm text-amber-400">
                        <Star
                          aria-hidden="true"
                          className="fill-current"
                          size={14}
                        />
                        {item.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/50">
                    <MapPin aria-hidden="true" size={14} />
                    {item.location ?? "Location not listed"}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <p className="font-bold">
                      ৳{item.price.toLocaleString("en-BD")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!id || busyItemId === id}
                      onClick={() => void removeFavorite(item)}
                      className="border-white/15 bg-transparent text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                    >
                      <Trash2 aria-hidden="true" size={15} />
                      {busyItemId === id ? "Removing..." : "Remove"}
                    </Button>
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
          Retry loading favorites
        </button>
      )}
    </CustomerDashboardFrame>
  );
}
