"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import { authClient } from "@/lib/auth-client";
import {
  addCustomerFavorite,
  getCustomerFavorites,
  removeCustomerFavorite,
} from "@/lib/core/server";

export default function FavoriteButton({ itemId }: { itemId: string }) {
  const { data: session, isPending } = authClient.useSession();
  const token = session?.session.token;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isPending || session?.user?.role !== "customer" || !token) return;

    const controller = new AbortController();
    void getCustomerFavorites(token, controller.signal)
      .then((items) => {
        setIsFavorite(
          items.some((item) => (item._id ?? item.id) === itemId),
        );
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          toast.error(
            cause instanceof Error
              ? cause.message
              : "Could not check your favorites.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsReady(true);
      });

    return () => controller.abort();
  }, [isPending, itemId, session?.user?.role, token]);

  if (isPending || session?.user?.role !== "customer" || !token || !isReady) {
    return null;
  }

  async function toggleFavorite() {
    if (session?.user?.isBlocked) {
      toast.error("Blocked accounts cannot manage favorites.");
      return;
    }
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsUpdating(true);
    try {
      if (isFavorite) {
        await removeCustomerFavorite(token, itemId);
        setIsFavorite(false);
        toast.success("Removed from your wishlist.");
      } else {
        await addCustomerFavorite(token, itemId);
        setIsFavorite(true);
        toast.success("Added to your wishlist.");
      }
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not update favorites.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      disabled={isUpdating}
      onClick={() => void toggleFavorite()}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Heart
        aria-hidden="true"
        size={17}
        className={isFavorite ? "fill-rose-400 text-rose-400" : ""}
      />
      {isFavorite ? "Saved" : "Add to wishlist"}
    </button>
  );
}
