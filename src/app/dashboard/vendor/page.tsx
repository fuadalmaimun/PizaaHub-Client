"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/dashboard";
import {
  createVendorMenuItem,
  deleteVendorMenuItem,
  getVendorMenuItems,
  getVendorOrders,
  getVendorOverview,
  updateVendorMenuItem,
  updateVendorOrder,
  type VendorMenuItemInput,
  type VendorOrder,
} from "@/lib/core/server";
import type { MenuItem } from "@/lib/types/menu";

type DashboardTab = "overview" | "menu" | "orders";

type MenuForm = {
  itemName: string;
  category: string;
  description: string;
  price: string;
  location: string;
  images: string[];
};

type DashboardData = {
  overview: Record<string, unknown>;
  menuItems: MenuItem[];
  orders: VendorOrder[];
};

const EMPTY_FORM: MenuForm = {
  itemName: "",
  category: "",
  description: "",
  price: "",
  location: "",
  images: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOverviewRecord(payload: unknown): Record<string, unknown> {
  let value = payload;
  for (let depth = 0; depth < 3 && isRecord(value); depth += 1) {
    if (isRecord(value.data)) {
      value = value.data;
    } else if (isRecord(value.overview)) {
      value = value.overview;
    } else {
      return value;
    }
  }
  if (isRecord(value)) return value;
  throw new Error("The backend returned an invalid vendor overview.");
}

async function loadDashboardData(
  token: string,
  signal?: AbortSignal,
): Promise<DashboardData> {
  const [overview, menuItems, orders] = await Promise.all([
    getVendorOverview(token, signal),
    getVendorMenuItems(token, signal),
    getVendorOrders(token, signal),
  ]);
  return {
    overview: getOverviewRecord(overview),
    menuItems,
    orders,
  };
}

function getOverviewStats(overview: Record<string, unknown>) {
  const stats: Array<{ label: string; value: string | number | boolean }> = [];
  for (const [key, value] of Object.entries(overview)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      stats.push({ label: key, value });
    } else if (isRecord(value)) {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (
          typeof nestedValue === "string" ||
          typeof nestedValue === "number" ||
          typeof nestedValue === "boolean"
        ) {
          stats.push({ label: nestedKey, value: nestedValue });
        }
      }
    }
  }
  return stats;
}

function readableLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

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

function orderId(order: VendorOrder) {
  return order._id ?? order.id;
}

function orderItemName(order: VendorOrder) {
  if (typeof order.item === "string") return order.item;
  return (
    order.item?.itemName ??
    order.item?.name ??
    order.itemName ??
    order.itemId ??
    "Menu item"
  );
}

function formatDate(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

export default function VendorDashboard() {
  const router = useRouter();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const user = sessionData?.user;
  const token = sessionData?.session.token;

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [overview, setOverview] = useState<Record<string, unknown> | null>(
    null,
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (isSessionPending) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (user.role !== "vendor") {
      router.replace(dashboardPath(user.role));
      return;
    }
    if (user.isBlocked) return;

    const controller = new AbortController();
    void Promise.resolve().then(async () => {
      try {
        if (!token) {
          throw new Error(
            "Your session token is missing. Please sign in again.",
          );
        }
        const data = await loadDashboardData(token, controller.signal);
        if (controller.signal.aborted) return;
        setOverview(data.overview);
        setMenuItems(data.menuItems);
        setOrders(data.orders);
        setError(null);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load vendor dashboard."));
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    });

    return () => controller.abort();
  }, [isSessionPending, reloadCount, router, token, user]);

  const overviewStats = useMemo(
    () => (overview ? getOverviewStats(overview) : []),
    [overview],
  );

  function applyDashboardData(data: DashboardData) {
    setOverview(data.overview);
    setMenuItems(data.menuItems);
    setOrders(data.orders);
    setError(null);
  }

  async function refreshDashboard(tokenValue: string) {
    const data = await loadDashboardData(tokenValue);
    applyDashboardData(data);
  }

  function retryLoading() {
    setIsLoading(true);
    setError(null);
    setReloadCount((count) => count + 1);
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsEditorOpen(true);
  }

  function startEdit(item: MenuItem) {
    const id = itemId(item);
    if (!id) {
      toast.error("This menu item has no valid ID.");
      return;
    }
    setEditingId(id);
    setForm({
      itemName: itemName(item),
      category: item.category,
      description: item.description,
      price: String(item.price),
      location: item.location ?? "",
      images: item.images ?? (item.image ? [item.image] : []),
    });
    setIsEditorOpen(true);
  }

  async function uploadImages(files: File[]) {
    if (files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const body = new FormData();
        body.set("image", file);
        const response = await fetch("/api/images/upload", {
          method: "POST",
          body,
        });
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message =
            isRecord(payload) && typeof payload.error === "string"
              ? payload.error
              : `Image upload failed (${response.status}).`;
          throw new Error(message);
        }
        if (!isRecord(payload) || typeof payload.url !== "string") {
          throw new Error("Image upload returned an invalid response.");
        }
        uploadedUrls.push(payload.url);
      }
      setForm((current) => ({
        ...current,
        images: [...current.images, ...uploadedUrls],
      }));
      toast.success(
        uploadedUrls.length === 1
          ? "Image uploaded."
          : `${uploadedUrls.length} images uploaded.`,
      );
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not upload menu images."));
    } finally {
      setIsUploadingImages(false);
    }
  }

  async function saveMenuItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a valid price greater than zero.");
      return;
    }
    if (form.images.length === 0) {
      toast.error("Upload at least one menu item image.");
      return;
    }

    const input: VendorMenuItemInput = {
      itemName: form.itemName.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price,
      location: form.location.trim(),
      images: form.images,
    };

    setIsSaving(true);
    try {
      if (editingId) {
        await updateVendorMenuItem(token, editingId, input);
        toast.success("Menu item updated.");
      } else {
        await createVendorMenuItem(token, input);
        toast.success("Menu item created.");
      }
      setIsEditorOpen(false);
      setEditingId(null);
      try {
        await refreshDashboard(token);
      } catch (cause) {
        setError(
          `Saved successfully, but could not refresh dashboard data: ${errorMessage(cause, "Unknown error.")}`,
        );
      }
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not save menu item."));
    } finally {
      setIsSaving(false);
    }
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
      try {
        await refreshDashboard(token);
      } catch (cause) {
        setError(
          `Availability updated, but could not refresh dashboard data: ${errorMessage(cause, "Unknown error.")}`,
        );
      }
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
      try {
        await refreshDashboard(token);
      } catch (cause) {
        setError(
          `Deleted successfully, but could not refresh dashboard data: ${errorMessage(cause, "Unknown error.")}`,
        );
      }
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not delete menu item."));
    } finally {
      setBusyItemId(null);
    }
  }

  async function changeOrderStatus(
    order: VendorOrder,
    status: "accepted" | "rejected",
  ) {
    const id = orderId(order);
    if (!token || !id) {
      toast.error("Could not identify this order.");
      return;
    }

    setBusyOrderId(id);
    try {
      await updateVendorOrder(token, id, status);
      toast.success(`Order ${status}.`);
      try {
        await refreshDashboard(token);
      } catch (cause) {
        setError(
          `Order updated, but could not refresh dashboard data: ${errorMessage(cause, "Unknown error.")}`,
        );
      }
    } catch (cause) {
      toast.error(errorMessage(cause, `Could not ${status} order.`));
    } finally {
      setBusyOrderId(null);
    }
  }

  async function refreshNow() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      await refreshDashboard(token);
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh dashboard data.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isSessionPending || !user || user.role !== "vendor") {
    return (
      <main className="grid min-h-[60svh] place-items-center bg-[#08090b] px-5 text-white">
        <p role="status" className="text-sm text-white/60">
          {isSessionPending ? "Checking your account..." : "Redirecting..."}
        </p>
      </main>
    );
  }

  if (user.isBlocked) {
    return (
      <main className="grid min-h-[60svh] place-items-center bg-[#08090b] px-5 text-white">
        <p role="alert" className="text-center text-sm text-red-200">
          Your account is blocked and cannot access vendor tools.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[70svh] bg-[#08090b] px-5 pb-16 pt-10 text-white sm:px-8 sm:pb-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-emerald-400">
              VENDOR WORKSPACE
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome, {user.name || "Vendor"}
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Manage your menu and customer orders.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshNow}
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
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10">
          {(["overview", "menu", "orders"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-3 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-white/55 hover:text-white"
              }`}
            >
              {tab === "menu"
                ? "My Menu Items"
                : tab === "orders"
                  ? "Customer Orders"
                  : "Overview"}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"
          >
            <span>{error}</span>
            {!isLoading && (
              <button
                type="button"
                onClick={refreshNow}
                className="font-semibold underline underline-offset-4"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div
            role="status"
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-white/10 bg-white/5"
              />
            ))}
            <span className="sr-only">Loading vendor data...</span>
          </div>
        ) : error && !overview ? (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-white/70">Vendor data could not be loaded.</p>
            <button
              type="button"
              onClick={retryLoading}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
            >
              Try again
            </button>
          </div>
        ) : activeTab === "overview" ? (
          <section aria-label="Vendor overview" className="mt-8">
            {overviewStats.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {overviewStats.map((stat, index) => (
                  <article
                    key={`${stat.label}-${index}`}
                    className="rounded-xl border border-white/10 bg-[#111315] p-5"
                  >
                    <p className="text-sm text-white/55">
                      {readableLabel(stat.label)}
                    </p>
                    <p className="mt-3 break-words text-2xl font-bold text-white">
                      {typeof stat.value === "boolean"
                        ? stat.value
                          ? "Yes"
                          : "No"
                        : String(stat.value)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#111315] p-6 text-sm text-white/55">
                The backend did not return overview metrics.
              </div>
            )}

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => setActiveTab("menu")}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-emerald-400/30"
              >
                <p className="text-sm text-white/55">Menu items from backend</p>
                <p className="mt-2 text-2xl font-bold">{menuItems.length}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-emerald-400">
                  Manage menu
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-emerald-400/30"
              >
                <p className="text-sm text-white/55">
                  Customer orders from backend
                </p>
                <p className="mt-2 text-2xl font-bold">{orders.length}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-emerald-400">
                  View orders
                </span>
              </button>
            </div>
          </section>
        ) : activeTab === "menu" ? (
          <section aria-label="Vendor menu items" className="mt-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">My Menu Items</h2>
                <p className="mt-1 text-sm text-white/50">
                  {menuItems.length} items returned by your vendor API.
                </p>
              </div>
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-emerald-500"
              >
                <Plus aria-hidden="true" size={17} />
                Add menu item
              </button>
            </div>

            {isEditorOpen && (
              <form
                onSubmit={saveMenuItem}
                className="mb-6 rounded-2xl border border-white/10 bg-[#111315] p-5 sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    {editingId ? "Edit menu item" : "Add menu item"}
                  </h3>
                  <button
                    type="button"
                    aria-label="Close menu item form"
                    onClick={() => setIsEditorOpen(false)}
                    className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <X aria-hidden="true" size={18} />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-white/70">
                    Item name
                    <input
                      required
                      value={form.itemName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          itemName: event.target.value,
                        }))
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-white outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="text-sm text-white/70">
                    Category
                    <input
                      required
                      value={form.category}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-white outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="text-sm text-white/70">
                    Price
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-white outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="text-sm text-white/70">
                    Location
                    <input
                      required
                      value={form.location}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-white outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="text-sm text-white/70 sm:col-span-2">
                    Description
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 py-2 text-white outline-none focus:border-emerald-500"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/70">
                      Menu images (ImgBB)
                      <span className="mt-2 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-[#090a0b] px-3 py-3 text-sm text-white/60 transition hover:border-emerald-400/50 hover:text-white">
                        {isUploadingImages ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="animate-spin"
                            size={17}
                          />
                        ) : (
                          <ImagePlus aria-hidden="true" size={17} />
                        )}
                        {isUploadingImages ? "Uploading..." : "Choose images"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          disabled={isUploadingImages}
                          onChange={(event) => {
                            const files = Array.from(
                              event.currentTarget.files ?? [],
                            );
                            event.currentTarget.value = "";
                            void uploadImages(files);
                          }}
                          className="sr-only"
                        />
                      </span>
                    </label>
                    {form.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {form.images.map((image, index) => (
                          <div
                            key={`${image}-${index}`}
                            className="relative size-20 overflow-hidden rounded-lg border border-white/10"
                          >
                            <Image
                              src={image}
                              alt={`Menu item image ${index + 1}`}
                              fill
                              sizes="80px"
                              unoptimized
                              className="object-cover"
                            />
                            <button
                              type="button"
                              aria-label={`Remove image ${index + 1}`}
                              onClick={() =>
                                setForm((current) => ({
                                  ...current,
                                  images: current.images.filter(
                                    (_, imageIndex) => imageIndex !== index,
                                  ),
                                }))
                              }
                              className="absolute right-1 top-1 rounded-full bg-black/75 p-1 text-white hover:bg-red-600"
                            >
                              <X aria-hidden="true" size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingImages}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving && (
                      <LoaderCircle
                        aria-hidden="true"
                        className="animate-spin"
                        size={16}
                      />
                    )}
                    {editingId ? "Save changes" : "Create item"}
                  </button>
                </div>
              </form>
            )}

            {menuItems.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-white/55">
                No menu items were returned by the backend.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {menuItems.map((item, index) => {
                  const id = itemId(item);
                  const image = item.images?.[0] ?? item.image;
                  const active = itemIsActive(item);
                  return (
                    <article
                      key={id ?? `${itemName(item)}-${index}`}
                      className="overflow-hidden rounded-xl border border-white/10 bg-[#111315]"
                    >
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
                            <h3 className="mt-1 truncate font-semibold">
                              {itemName(item)}
                            </h3>
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
                            onClick={() => startEdit(item)}
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
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section aria-label="Vendor customer orders" className="mt-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Customer Orders</h2>
              <p className="mt-1 text-sm text-white/50">
                Review and respond to pending orders.
              </p>
            </div>
            {orders.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-white/55">
                No orders were returned by the backend.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const id = orderId(order);
                  const pending = order.status?.toLowerCase() === "pending";
                  return (
                    <article
                      key={id ?? `order-${index}`}
                      className="rounded-xl border border-white/10 bg-[#111315] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                            Order {id ? `#${id.slice(-8)}` : ""}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold">
                            {orderItemName(order)}
                          </h3>
                        </div>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-white/70">
                          {order.status ?? "Status unavailable"}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
                        <p>
                          <span className="text-white/35">Customer: </span>
                          {order.customerName ??
                            order.customerId ??
                            "Not provided"}
                        </p>
                        <p>
                          <span className="text-white/35">Delivery date: </span>
                          {formatDate(order.deliveryDate)}
                        </p>
                        <p className="sm:col-span-2">
                          <span className="text-white/35">Address: </span>
                          {order.deliveryAddress ?? "Not provided"}
                        </p>
                        {order.message && (
                          <p className="sm:col-span-2">
                            <span className="text-white/35">
                              Instructions:{" "}
                            </span>
                            {order.message}
                          </p>
                        )}
                      </div>
                      {pending && (
                        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                          <button
                            type="button"
                            disabled={!id || busyOrderId === id}
                            onClick={() =>
                              void changeOrderStatus(order, "accepted")
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold transition hover:bg-emerald-500 disabled:opacity-50"
                          >
                            <Check aria-hidden="true" size={16} />
                            {busyOrderId === id ? "Updating..." : "Accept"}
                          </button>
                          <button
                            type="button"
                            disabled={!id || busyOrderId === id}
                            onClick={() =>
                              void changeOrderStatus(order, "rejected")
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-400/25 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                          >
                            <X aria-hidden="true" size={16} />
                            Reject
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
