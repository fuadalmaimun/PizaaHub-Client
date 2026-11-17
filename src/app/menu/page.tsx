"use client";

import { useEffect, useMemo, useState } from "react";
import { Pizza, RefreshCw, Search } from "lucide-react";

import FeaturedCard from "@/app/home/FeaturedCard";
import { authClient } from "@/lib/auth-client";
import { getMenuItems } from "@/lib/core/menu-items";
import type { MenuItem } from "@/lib/types/menu";

function getName(item: MenuItem) {
  return item.itemName ?? item.name ?? "Pizza";
}

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [priceOrder, setPriceOrder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  useEffect(() => {
    const controller = new AbortController();

    getMenuItems(controller.signal)
      .then(setItems)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load menu items. Please try again.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [retryCount]);

  const categories = useMemo(
    () =>
      [
        ...new Set(items.map((item) => item.category.trim()).filter(Boolean)),
      ].sort(),
    [items],
  );
  const locations = useMemo(
    () =>
      [
        ...new Set(items.map((item) => item.location?.trim()).filter(Boolean)),
      ].sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const result = items.filter((item) => {
      const matchesName = getName(item)
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesCategory = !category || item.category === category;
      const matchesLocation = !location || item.location === location;
      return matchesName && matchesCategory && matchesLocation;
    });

    if (priceOrder === "low-to-high") {
      result.sort((first, second) => first.price - second.price);
    } else if (priceOrder === "high-to-low") {
      result.sort((first, second) => second.price - first.price);
    }

    return result;
  }, [items, search, category, location, priceOrder]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setLocation("");
    setPriceOrder("");
  }

  function retryLoading() {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  }

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <div className="mx-auto max-w-375 px-5 pt-4 sm:px-8 lg:px-12">
      </div>

      <section className="px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-12">
        <div className="mx-auto max-w-375">
          <div className="mb-8 max-w-2xl sm:mb-10">
            <p className="text-xs font-bold tracking-[0.18em] text-emerald-400">
              FRESH FROM OUR LOCAL PIZZERIAS
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Browse Menu
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
              Find your next favorite from freshly made pizzas, sides, and more.
            </p>
          </div>

          <div className="mb-8 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative sm:col-span-2 lg:col-span-1">
              <span className="sr-only">Search menu by name</span>
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                size={17}
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pizzas..."
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0c0e10] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20"
              />
            </label>

            <label>
              <span className="sr-only">Filter by category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0c0e10] px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20"
              >
                <option value="">All categories</option>
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by location</span>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0c0e10] px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20"
              >
                <option value="">All locations</option>
                {locations.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Sort by price</span>
              <select
                value={priceOrder}
                onChange={(event) => setPriceOrder(event.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0c0e10] px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20"
              >
                <option value="">Sort by price</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </label>
          </div>

          {!isLoading && !error && items.length > 0 && (
            <p className="mb-4 text-sm text-white/50" aria-live="polite">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"} found
            </p>
          )}

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
                >
                  <div className="aspect-4/3 animate-pulse bg-white/10" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-1/4 animate-pulse rounded bg-white/10" />
                    <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-400/20 bg-red-400/5 px-6 py-10 text-center"
            >
              <p className="text-sm text-red-200">{error}</p>
              <button
                type="button"
                onClick={retryLoading}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <RefreshCw aria-hidden="true" size={15} />
                Try again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/2.5 px-6 py-12 text-center">
              <Pizza
                aria-hidden="true"
                className="mx-auto mb-3 text-emerald-400/70"
                size={36}
              />
              <h2 className="text-lg font-semibold text-white">
                {items.length === 0
                  ? "No menu items available yet"
                  : "No pizzas match your filters"}
              </h2>
              <p className="mt-2 text-sm text-white/55">
                {items.length === 0
                  ? "Please check back soon for fresh menu items."
                  : "Try another search or clear the selected filters."}
              </p>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item, index) => (
                <FeaturedCard
                  key={item._id ?? item.id ?? `${getName(item)}-${index}`}
                  item={item}
                  detailsHref={
                    !session?.user
                      ? "/sign-in"
                      : item._id || item.id
                        ? `/menu/${encodeURIComponent(item._id ?? item.id ?? "")}`
                        : "/menu"
                  }
                  isSessionPending={isSessionPending}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
