"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Pizza, RefreshCw, Star } from "lucide-react";

import {
  getFeaturedMenuItems,
  isPremiumMenuItem,
} from "@/lib/core/menu-items";
import type { MenuItem } from "@/lib/types/menu";

function itemName(item: MenuItem) {
  return item.itemName ?? item.name ?? "Featured pizza";
}

function itemImage(item: MenuItem) {
  return item.images?.[0] ?? item.image;
}

function vendorName(item: MenuItem) {
  return item.vendor?.businessName ?? item.vendor?.name ?? item.vendorName;
}

function FeaturedCard({ item }: { item: MenuItem }) {
  const image = itemImage(item);
  const id = item._id ?? item.id;

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-white/[0.055]">
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
        {image ? (
          <Image
            src={image}
            alt={itemName(item)}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-emerald-400/70">
            <Pizza aria-hidden="true" size={42} />
          </div>
        )}
        {isPremiumMenuItem(item) && (
          <span className="absolute left-3 top-3 rounded-full border border-emerald-400/30 bg-black/70 px-3 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur">
            Featured
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
              {item.category}
            </p>
            <h3 className="mt-1 truncate text-lg font-semibold text-white">
              {itemName(item)}
            </h3>
          </div>
          {typeof item.rating === "number" && (
            <span className="inline-flex shrink-0 items-center gap-1 text-sm text-amber-300">
              <Star aria-hidden="true" className="fill-current" size={14} />
              {item.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-white/55">
          {item.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            <p className="text-lg font-bold text-white">
              ৳{item.price.toLocaleString("en-BD")}
            </p>
            {(item.location || vendorName(item)) && (
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-white/45">
                {item.location && <MapPin aria-hidden="true" size={12} />}
                {item.location ?? vendorName(item)}
              </p>
            )}
          </div>
          <Link
            href={id ? `/menu/${encodeURIComponent(id)}` : "/menu"}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            View Details
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
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
              <FeaturedCard key={item._id ?? item.id ?? `${itemName(item)}-${index}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
