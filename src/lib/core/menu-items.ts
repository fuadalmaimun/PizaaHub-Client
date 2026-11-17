import type { MenuItem } from "../types/menu";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function menuItemsUrl() {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }
  return `${BASE_URL.replace(/\/+$/, "")}/menu-items`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMenuItem(value: unknown): value is MenuItem {
  return (
    isRecord(value) &&
    (typeof value.name === "string" || typeof value.itemName === "string") &&
    typeof value.description === "string" &&
    typeof value.price === "number" &&
    typeof value.category === "string"
  );
}

function getItemsFromResponse(payload: unknown): MenuItem[] {
  let items: unknown;

  if (Array.isArray(payload)) {
    items = payload;
  } else if (isRecord(payload)) {
    items = payload.data ?? payload.items ?? payload.menuItems;
    if (isRecord(items)) {
      items = items.items ?? items.menuItems;
    }
  }

  if (!Array.isArray(items) || !items.every(isMenuItem)) {
    throw new Error("The menu API returned an unexpected response.");
  }

  return items;
}

function isApprovedAndActive(item: MenuItem) {
  return (
    item.status === "approved" &&
    item.isAvailable !== false &&
    item.isActive !== false
  );
}

export function isPremiumMenuItem(item: MenuItem) {
  const plan =
    item.vendor?.subscriptionPlan ??
    item.vendorPlan ??
    item.vendorSubscriptionPlan;
  return plan?.toLowerCase() === "premium";
}

export async function getMenuItems(signal?: AbortSignal) {
  const response = await fetch(menuItemsUrl(), {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Could not load menu items (${response.status}).`);
  }

  const payload: unknown = await response.json();
  return getItemsFromResponse(payload)
    .filter(isApprovedAndActive)
    .sort((first, second) => {
      const premiumDifference =
        Number(isPremiumMenuItem(second)) - Number(isPremiumMenuItem(first));
      if (premiumDifference !== 0) return premiumDifference;
      return (second.rating ?? 0) - (first.rating ?? 0);
    });
}

export async function getFeaturedMenuItems(signal?: AbortSignal) {
  return (await getMenuItems(signal)).slice(0, 6);
}

export async function addMenuItems(pizzaData: MenuItem[]) {
  const response = await fetch(menuItemsUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pizzaData),
  });

  if (!response.ok) {
    throw new Error(`Could not add menu items (${response.status}).`);
  }

  return response.json();
}

export async function getMenuItemDetails(id: string) {
  const response = await fetch(`${BASE_URL}/menu-items/${id}`);

  if (!response.ok) {
    throw new Error("Could not load menu item details.");
  }

  return response.json();
}