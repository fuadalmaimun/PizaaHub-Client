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

export type CustomerOrder = {
  _id?: string;
  id?: string;
  itemId?: string;
  itemName?: string;
  itemImage?: string | null;
  images?: string[];
  itemPrice?: number | null;
  vendorId?: string;
  vendorName?: string;
  vendorBusinessName?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  message?: string;
  status?: string;
  createdAt?: string;
};

export type CustomerOrderInput = {
  itemId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
};

export type AdminUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  isBlocked?: boolean;
  image?: string;
  businessName?: string;
  createdAt?: string;
};

export type AdminUserFilters = {
  search?: string;
  role?: "vendor" | "customer" | "admin";
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    cache: "no-store",
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

function getArrayPayload(payload: unknown, key: string): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload)) {
    if (Array.isArray(payload[key])) return payload[key];
    if ("data" in payload) return getArrayPayload(payload.data, key);
  }
  throw new Error(`The backend returned an invalid ${key} response.`);
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

function isAdminUser(value: unknown): value is AdminUser {
  return (
    isRecord(value) &&
    (typeof value._id === "string" || typeof value.id === "string") &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.role === "string"
  );
}

function isVendorOrder(value: unknown): value is VendorOrder {
  return (
    isRecord(value) &&
    (typeof value._id === "string" || typeof value.id === "string")
  );
}

function isCustomerOrder(value: unknown): value is CustomerOrder {
  return (
    isRecord(value) &&
    (typeof value._id === "string" || typeof value.id === "string") &&
    typeof value.status === "string"
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

export async function getCustomerOverview(
  token: string,
  signal?: AbortSignal,
) {
  return request("/customer/overview", token, { signal });
}

export async function getCustomerOrders(
  token: string,
  signal?: AbortSignal,
): Promise<CustomerOrder[]> {
  const payload = await request("/customer/orders", token, { signal });
  const customerOrders = getCollection(payload, "orders");
  if (!customerOrders.every(isCustomerOrder)) {
    throw new Error("The backend returned an invalid customer order.");
  }
  return customerOrders;
}

export async function createCustomerOrder(
  token: string,
  order: CustomerOrderInput,
) {
  return request("/orders", token, {
    method: "POST",
    body: order,
  });
}

export async function cancelCustomerOrder(token: string, id: string) {
  return request(`/customer/orders/${encodeURIComponent(id)}`, token, {
    method: "DELETE",
  });
}

export async function getAdminOverview(token: string, signal?: AbortSignal) {
  return request("/admin/overview", token, { signal });
}

export async function getAdminUsers(
  token: string,
  filters: AdminUserFilters = {},
  signal?: AbortSignal,
): Promise<AdminUser[]> {
  const query = new URLSearchParams();
  if (filters.search?.trim()) {
    query.set("search", escapeRegExp(filters.search.trim()));
  }
  if (filters.role) query.set("role", filters.role);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const payload = await request(`/admin/users${suffix}`, token, { signal });
  const users = getArrayPayload(payload, "users");
  if (!users.every(isAdminUser)) {
    throw new Error("The backend returned an invalid admin users response.");
  }
  return users;
}

export async function updateAdminUserBlockStatus(
  token: string,
  id: string,
  isBlocked: boolean,
) {
  return request(`/admin/users/${encodeURIComponent(id)}`, token, {
    method: "PATCH",
    body: { isBlocked },
  });
}

export async function getAdminMenuItems(
  token: string,
  filters: { search?: string; status?: string } = {},
  signal?: AbortSignal,
): Promise<MenuItem[]> {
  const query = new URLSearchParams();
  if (filters.search?.trim()) {
    query.set("search", escapeRegExp(filters.search.trim()));
  }
  if (filters.status) query.set("status", filters.status);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const payload = await request(`/admin/menu-items${suffix}`, token, {
    signal,
  });
  const items = getArrayPayload(payload, "menuItems");
  if (!items.every(isMenuItem)) {
    throw new Error("The backend returned an invalid admin menu items response.");
  }
  return items;
}

export async function updateAdminMenuItemStatus(
  token: string,
  id: string,
  status: "approved" | "rejected",
) {
  return request(`/admin/menu-items/${encodeURIComponent(id)}`, token, {
    method: "PATCH",
    body: { status },
  });
}

export async function deleteAdminMenuItem(token: string, id: string) {
  return request(`/admin/menu-items/${encodeURIComponent(id)}`, token, {
    method: "DELETE",
  });
}
