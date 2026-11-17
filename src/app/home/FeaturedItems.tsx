"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";

import FeaturedCard from "@/app/home/FeaturedCard";
import { getFeaturedMenuItems } from "@/lib/core/menu-items";
import type { MenuItem } from "@/lib/types/menu";

function itemName(item: MenuItem) {
  return item.itemName ?? item.name ?? "Featured pizza";
}

export default function FeaturedItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getFeaturedMenuItems(controller.signal)
      .then(setItems)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load featured pizzas. Please try again.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [retryCount]);

  return (
    <section className="bg-[#08090b] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-375">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-emerald-400">
              MADE FRESH, LOVED ALWAYS
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Pizzas
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/55 sm:text-base">
              Explore today&apos;s favorites, made fresh by our local pizza
              makers.
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            Explore all menu
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
              >
                <div className="aspect-[4/3] animate-pulse bg-white/10" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/4 animate-pulse rounded bg-white/10" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
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
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <RefreshCw aria-hidden="true" size={15} />
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-12 text-center text-sm text-white/55">
            No featured pizzas are available right now. Please check back soon.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <FeaturedCard
                key={item._id ?? item.id ?? `${itemName(item)}-${index}`}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
