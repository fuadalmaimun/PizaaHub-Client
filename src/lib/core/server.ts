import { BASE_URL } from "./menu-items";
import type { MenuItem } from "../types/menu";

export type VendorMenuItemInput = {
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  isActive?: boolean;
};

export type VendorOrder = {
  _id?: string;
  id?: string;
  status?: string;
  itemId?: string;
  itemName?: string;
  item?: {
    itemName?: string;
    name?: string;
  } | string;
  customerId?: string;
  customerName?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  message?: string;
  createdAt?: string;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function apiUrl(path: string) {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }
  return `${BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function getErrorMessage(response: Response) {
  const text = await response.text();
  if (!text) return `Request failed (${response.status}).`;

  try {
    const payload: unknown = JSON.parse(text);
    if (isRecord(payload)) {
      if (typeof payload.message === "string") return payload.message;
      if (typeof payload.error === "string") return payload.error;
    }
  } catch (cause) {
    if (!(cause instanceof SyntaxError)) throw cause;
  }

  return text;
}

async function request(
  path: string,
  token: string,
  options: RequestOptions = {},
): Promise<unknown> {
  if (!token.trim()) {
    throw new Error("Your session token is missing. Please sign in again.");
  }

  const response = await fetch(apiUrl(path), {
    method: options.method ?? "GET",
    signal: options.signal,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
    },
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const text = await response.text();
  if (!text) return null;

  try {
    const payload: unknown = JSON.parse(text);
    return payload;
  } catch (cause) {
    if (cause instanceof SyntaxError) {
      throw new Error("The backend returned an invalid JSON response.");
    }
    throw cause;
  }
}

function getCollection(
  payload: unknown,
  collectionName: "menuItems" | "orders",
): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload)) {
    if (Array.isArray(payload[collectionName])) {
      return payload[collectionName];
    }
    if (collectionName === "menuItems" && Array.isArray(payload.items)) {
      return payload.items;
    }
    if ("data" in payload) {
      return getCollection(payload.data, collectionName);
    }
  }
  throw new Error(`The backend returned an invalid ${collectionName} response.`);
}

function isMenuItem(value: unknown): value is MenuItem {
  return (
    isRecord(value) &&
    (typeof value.itemName === "string" || typeof value.name === "string") &&
    typeof value.description === "string" &&
    typeof value.price === "number" &&
    typeof value.category === "string"
  );
}

function isVendorOrder(value: unknown): value is VendorOrder {
  return (
    isRecord(value) &&
    (typeof value._id === "string" || typeof value.id === "string")
  );
}

export async function getVendorOverview(token: string, signal?: AbortSignal) {
  return request("/vendor/overview", token, { signal });
}

export async function getVendorMenuItems(
  token: string,
  signal?: AbortSignal,
): Promise<MenuItem[]> {
  const payload = await request("/vendor/menu-items", token, { signal });
  const items = getCollection(payload, "menuItems");
  if (!items.every(isMenuItem)) {
    throw new Error("The backend returned an invalid vendor menu item.");
  }
  return items;
}

export async function createVendorMenuItem(
  token: string,
  item: VendorMenuItemInput,
) {
  return request("/menu-items", token, {
    method: "POST",
    body: item,
  });
}

export async function updateVendorMenuItem(
  token: string,
  id: string,
  item: Partial<VendorMenuItemInput>,
) {
  return request(`/menu-items/${encodeURIComponent(id)}`, token, {
    method: "PATCH",
    body: item,
  });
}

export async function deleteVendorMenuItem(token: string, id: string) {
  return request(`/menu-items/${encodeURIComponent(id)}`, token, {
    method: "DELETE",
  });
}

export async function getVendorOrders(
  token: string,
  signal?: AbortSignal,
): Promise<VendorOrder[]> {
  const payload = await request("/vendor/orders", token, { signal });
  const orders = getCollection(payload, "orders");
  if (!orders.every(isVendorOrder)) {
    throw new Error("The backend returned an invalid vendor order.");
  }
  return orders;
}

export async function updateVendorOrder(
  token: string,
  id: string,
  status: "accepted" | "rejected",
) {
  return request(`/vendor/orders/${encodeURIComponent(id)}`, token, {
    method: "PATCH",
    body: { status },
  });
}
