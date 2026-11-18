"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Pizza, Star, Store } from "lucide-react";

import { isPremiumMenuItem } from "@/lib/core/menu-items";
import type { MenuItem } from "@/lib/types/menu";

function itemName(item: MenuItem) {
  return item.itemName ?? item.name ?? "Featured pizza";
}

function vendorName(item: MenuItem) {
  return (
    item.vendor?.businessName ??
    item.vendor?.name ??
    item.vendorName ??
    (item.vendorId
      ? `Vendor #${item.vendorId.slice(-6)}`
      : "Local PizzaHub vendor")
  );
}

export default function FeaturedCard({
  item,
  detailsHref,
  isSessionPending = false,
}: {
  item: MenuItem;
  detailsHref?: string;
  isSessionPending?: boolean;
}) {
  const image = item.images?.[0] ?? item.image;
  const id = item._id ?? item.id;
  const href =
    detailsHref ?? (id ? `/menu/${encodeURIComponent(id)}` : "/menu");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-white/[0.055]">
      <div className="relative aspect-4/3 overflow-hidden bg-white/5">
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

      <div className="flex flex-1 flex-col p-4 sm:p-5">
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
              {item.reviewCount ? (
                <span className="text-xs text-white/45">
                  ({item.reviewCount})
                </span>
              ) : null}
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-white/55">
          {item.description}
        </p>

        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-white/45">
          <p className="flex items-center gap-2">
            <MapPin
              aria-hidden="true"
              className="shrink-0 text-emerald-400"
              size={13}
            />
            <span className="truncate">
              {item.location ?? "Location not listed"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Store
              aria-hidden="true"
              className="shrink-0 text-emerald-400"
              size={13}
            />
            <span className="truncate">{vendorName(item)}</span>
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-lg font-bold text-white">
            ৳{item.price.toLocaleString("en-BD")}
          </p>
          {isSessionPending ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1 text-sm font-semibold text-white/45"
            >
              Loading...
            </button>
          ) : (
            <Link
              href={href}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
            >
              View Details
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
