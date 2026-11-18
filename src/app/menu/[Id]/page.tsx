"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Pizza, Star, Store } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { createCustomerOrder } from "@/lib/core/server";
import { getMenuItems } from "@/lib/core/menu-items";
import type { MenuItem } from "@/lib/types/menu";

function itemName(item: MenuItem) {
  return item.itemName ?? item.name ?? "Pizza";
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

function todayDateInputValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function MenuItemDetailsPage() {
  const { Id: id } = useParams<{ Id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(todayDateInputValue);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.replace("/sign-in");
    }
  }, [isSessionPending, router, session]);

  useEffect(() => {
    const controller = new AbortController();

    getMenuItems(controller.signal)
      .then((items) => {
        const foundItem = items.find(
          (menuItem) => (menuItem._id ?? menuItem.id) === id,
        );

        if (!foundItem) {
          setItem(null);
          setError("This menu item was not found or is no longer available.");
          return;
        }

        setItem(foundItem);
        setError(null);
        setSelectedImage(0);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setItem(null);
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load this menu item. Please try again.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedId(id);
      });

    return () => controller.abort();
  }, [id]);

  const images = useMemo(
    () => {
      const availableImages = [...(item?.images ?? []), item?.image].filter(
        (image): image is string => Boolean(image),
      );
      return [...new Set(availableImages)];
    },
    [item],
  );

  if (isSessionPending || !session?.user) {
    return (
      <main className="grid min-h-[60svh] place-items-center bg-[#08090b] px-5 text-white">
        <p role="status" className="text-sm text-white/60">
          {isSessionPending ? "Checking your account..." : "Redirecting to sign in..."}
        </p>
      </main>
    );
  }

  if (loadedId !== id) {
    return (
      <main className="mx-auto min-h-[70svh] w-full max-w-7xl px-5 py-10 text-white sm:px-8">
        <div className="grid animate-pulse gap-8 lg:grid-cols-2">
          <div className="aspect-4/3 rounded-2xl bg-white/10" />
          <div className="space-y-5 py-4">
            <div className="h-4 w-1/4 rounded bg-white/10" />
            <div className="h-10 w-2/3 rounded bg-white/10" />
            <div className="h-5 w-1/3 rounded bg-white/10" />
            <div className="h-24 rounded bg-white/10" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="grid min-h-[70svh] place-items-center bg-[#08090b] px-5 py-12 text-white">
        <div className="max-w-lg text-center">
          <Pizza
            aria-hidden="true"
            className="mx-auto mb-4 text-emerald-400"
            size={40}
          />
          <h1 className="text-2xl font-bold">Menu item unavailable</h1>
          <p role="alert" className="mt-3 text-sm text-white/60">
            {error ?? "This menu item was not found or is no longer available."}
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  const user = session.user;
  const isCustomer = user.role === "customer";
  const isBlocked = Boolean(user.isBlocked);
  const isVendorOwner =
    user.role === "vendor" && item.vendorId === user.id;
  const canOrder = isCustomer && !isBlocked;
  const itemIsOrderable =
    item !== null &&
    item.status === "approved" &&
    item.isAvailable !== false &&
    item.isActive !== false;
  const canPlaceOrder = canOrder && !isVendorOwner && itemIsOrderable;

  async function handlePlaceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = session?.user;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (user.role !== "customer" || isBlocked || isVendorOwner) {
      toast.error("Your account is not allowed to order this item.");
      return;
    }
    if (!itemIsOrderable) {
      toast.error("This menu item is no longer available for ordering.");
      return;
    }

    const token = session?.session.token;
    const itemId = item?._id ?? item?.id ?? id;
    if (!token || !itemId) {
      toast.error("Your session or menu item is unavailable. Please try again.");
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);
    try {
      await createCustomerOrder(token, {
        itemId,
        deliveryDate,
        deliveryAddress: deliveryAddress.trim(),
        ...(message.trim() ? { message: message.trim() } : {}),
      });
      toast.success("Order placed successfully.");
      router.push("/dashboard/customer/orders");
    } catch (cause) {
      const errorMessage =
        cause instanceof Error ? cause.message : "Could not place your order.";
      setOrderError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  return (
    <main className="min-h-[70svh] bg-[#08090b] px-5 pb-16 pt-10 text-white sm:px-8 sm:pb-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to menu
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:gap-12">
          <section aria-label="Menu item images">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={itemName(item)}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-emerald-400/70">
                  <Pizza aria-hidden="true" size={56} />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Show image ${index + 1} of ${images.length}`}
                    aria-pressed={selectedImage === index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative size-20 shrink-0 overflow-hidden rounded-lg border transition ${
                      selectedImage === index
                        ? "border-emerald-400"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="80px"
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
              {item.category}
            </p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {itemName(item)}
              </h1>
              {typeof item.rating === "number" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-300/5 px-3 py-1 text-sm text-amber-300">
                  <Star
                    aria-hidden="true"
                    className="fill-current"
                    size={14}
                  />
                  {item.rating.toFixed(1)}
                </span>
              )}
            </div>

            <p className="mt-5 text-3xl font-bold text-white">
              ৳{item.price.toLocaleString("en-BD")}
            </p>
            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-white/65">
              {item.description}
            </p>

            <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <p className="flex items-center gap-3 text-sm text-white/70">
                <MapPin
                  aria-hidden="true"
                  className="shrink-0 text-emerald-400"
                  size={17}
                />
                {item.location ?? "Location not listed"}
              </p>
              <p className="flex items-center gap-3 text-sm text-white/70">
                <Store
                  aria-hidden="true"
                  className="shrink-0 text-emerald-400"
                  size={17}
                />
                {vendorName(item)}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-emerald-400/15 bg-emerald-400/4 p-5">
              <h2 className="text-lg font-semibold">Order this item</h2>
              {canPlaceOrder ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Food orders do not require online payment.
                  </p>
                  {!isOrderFormOpen ? (
                    <Button
                      type="button"
                      onClick={() => setIsOrderFormOpen(true)}
                      className="mt-4 w-full bg-emerald-600 py-5 text-white hover:bg-emerald-500"
                    >
                      Order Now
                    </Button>
                  ) : (
                    <form
                      onSubmit={handlePlaceOrder}
                      className="mt-5 space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="deliveryDate" className="text-white/80">
                          Delivery Date
                        </Label>
                        <Input
                          id="deliveryDate"
                          type="date"
                          min={todayDateInputValue()}
                          required
                          value={deliveryDate}
                          onChange={(event) =>
                            setDeliveryDate(event.target.value)
                          }
                          className="h-11 border-white/15 bg-[#090a0b] text-white [color-scheme:dark]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="deliveryAddress"
                          className="text-white/80"
                        >
                          Delivery Address
                        </Label>
                        <Input
                          id="deliveryAddress"
                          required
                          autoComplete="street-address"
                          value={deliveryAddress}
                          onChange={(event) =>
                            setDeliveryAddress(event.target.value)
                          }
                          placeholder="Enter your delivery address"
                          className="h-11 border-white/15 bg-[#090a0b] text-white placeholder:text-white/35"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orderMessage" className="text-white/80">
                          Message (optional)
                        </Label>
                        <Textarea
                          id="orderMessage"
                          rows={3}
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          placeholder="Add delivery instructions"
                          className="border-white/15 bg-[#090a0b] text-white placeholder:text-white/35"
                        />
                      </div>
                      {orderError && (
                        <p role="alert" className="text-sm text-red-300">
                          {orderError}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="submit"
                          disabled={isSubmittingOrder}
                          className="flex-1 bg-emerald-600 py-5 text-white hover:bg-emerald-500"
                        >
                          {isSubmittingOrder ? "Placing order..." : "Place Order"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmittingOrder}
                          onClick={() => setIsOrderFormOpen(false)}
                          className="border-white/15 bg-transparent py-5 text-white hover:bg-white/5 hover:text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm leading-6 text-white/60">
                  {isBlocked
                    ? "Your account is blocked and cannot place orders."
                    : isVendorOwner
                      ? "You cannot order your own menu item."
                      : !itemIsOrderable
                        ? "This menu item is not available for ordering."
                        : "Only customers can place food orders."}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
