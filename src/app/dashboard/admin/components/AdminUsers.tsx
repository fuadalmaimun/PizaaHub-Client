"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RefreshCw, Search, ShieldCheck, ShieldOff, UserRound } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import {
  getAdminUsers,
  updateAdminUserBlockStatus,
  type AdminUser,
} from "@/lib/core/server";

import {
  AdminDashboardFrame,
  AdminDashboardStatus,
  errorMessage,
  useAdminDashboardAccess,
} from "./AdminDashboardShared";

type RoleFilter = "" | "customer" | "vendor" | "admin";

function userId(user: AdminUser) {
  return user._id ?? user.id;
}

function formatDate(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function AdminUsers() {
  const { user, token, isPending, isAdmin, isBlocked } =
    useAdminDashboardAccess();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !isAdmin || isBlocked || !token) return;

    const controller = new AbortController();
    void getAdminUsers(
      token ?? "",
      { search, role: role || undefined },
      controller.signal,
    )
      .then((result) => {
        setUsers(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load users."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isAdmin, isBlocked, isPending, reloadCount, role, search, token]);

  async function refresh() {
    if (!token) {
      toast.error("Your session token is missing. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    try {
      setUsers(await getAdminUsers(token, { search, role: role || undefined }));
      setError(null);
    } catch (cause) {
      const message = errorMessage(cause, "Could not refresh users.");
      setError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function toggleUserBlock(userToUpdate: AdminUser) {
    const id = userId(userToUpdate);
    if (!token || !id) {
      toast.error("Could not identify this user.");
      return;
    }
    if (userToUpdate.email === user?.email) {
      toast.error("You cannot block your own admin account.");
      return;
    }

    const nextBlockedState = !userToUpdate.isBlocked;
    setBusyUserId(id);
    try {
      await updateAdminUserBlockStatus(token, id, nextBlockedState);
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          userId(currentUser) === id
            ? { ...currentUser, isBlocked: nextBlockedState }
            : currentUser,
        ),
      );
      toast.success(
        nextBlockedState ? "User blocked." : "User unblocked.",
      );
    } catch (cause) {
      toast.error(errorMessage(cause, "Could not update user access."));
    } finally {
      setBusyUserId(null);
    }
  }

  if (isPending || !user || !isAdmin) {
    return (
      <AdminDashboardStatus>
        {isPending ? "Checking your account..." : "Redirecting..."}
      </AdminDashboardStatus>
    );
  }

  if (isBlocked) {
    return (
      <AdminDashboardStatus error>
        Your account is blocked and cannot access admin tools.
      </AdminDashboardStatus>
    );
  }

  if (!token) {
    return (
      <AdminDashboardStatus error>
        Your session token is missing. Please sign in again.
      </AdminDashboardStatus>
    );
  }

  return (
    <AdminDashboardFrame
      title="Manage Users"
      description="Search user accounts, review their details, and manage access."
      actions={
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            aria-hidden="true"
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(searchInput.trim());
        }}
        className="mt-8 grid gap-3 rounded-xl border border-white/10 bg-[#111315] p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
      >
        <label className="relative">
          <span className="sr-only">Search users by name or email</span>
          <Search
            aria-hidden="true"
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or email"
            className="h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-500"
          />
        </label>
        <label>
          <span className="sr-only">Filter users by role</span>
          <select
            value={role}
            onChange={(event) => {
              const value = event.target.value;
              setRole(
                value === "customer" || value === "vendor" || value === "admin"
                  ? value
                  : "",
              );
            }}
            className="h-11 w-full rounded-lg border border-white/10 bg-[#090a0b] px-3 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          <Search aria-hidden="true" size={16} />
          Search
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <div role="status" className="mt-6 space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
          <span className="sr-only">Loading users...</span>
        </div>
      ) : error && users.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/65">
          Users could not be loaded.
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setReloadCount((count) => count + 1);
            }}
            className="ml-2 font-semibold text-emerald-300 underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-white/55">
          No users match your search.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {users.map((listedUser, index) => {
            const id = userId(listedUser);
            const blocked = Boolean(listedUser.isBlocked);
            const isSelf = listedUser.email === user.email;

            return (
              <article
                key={id ?? `${listedUser.email}-${index}`}
                className="rounded-xl border border-white/10 bg-[#111315] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/5 text-emerald-300">
                      {listedUser.image ? (
                        <Image
                          src={listedUser.image}
                          alt=""
                          fill
                          sizes="40px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <UserRound aria-hidden="true" size={19} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-white">
                        {listedUser.name}
                      </h2>
                      <p className="mt-0.5 break-all text-sm text-white/55">
                        {listedUser.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white/5 px-2.5 py-1 capitalize text-white/65">
                          {listedUser.role}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 ${
                            blocked
                              ? "bg-red-400/10 text-red-300"
                              : "bg-emerald-400/10 text-emerald-300"
                          }`}
                        >
                          {blocked ? "Blocked" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!id || isSelf || busyUserId === id}
                    onClick={() => void toggleUserBlock(listedUser)}
                    title={
                      isSelf
                        ? "You cannot block your own admin account."
                        : undefined
                    }
                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      blocked
                        ? "border-emerald-400/20 text-emerald-300 hover:bg-emerald-400/10"
                        : "border-red-400/20 text-red-300 hover:bg-red-400/10"
                    }`}
                  >
                    {blocked ? (
                      <ShieldCheck aria-hidden="true" size={16} />
                    ) : (
                      <ShieldOff aria-hidden="true" size={16} />
                    )}
                    {busyUserId === id
                      ? "Updating..."
                      : blocked
                        ? "Unblock"
                        : "Block"}
                  </button>
                </div>

                <dl className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-white/40">User ID</dt>
                    <dd className="mt-1 break-all text-white/70">
                      {id ?? "Unavailable"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-white/40">Business</dt>
                    <dd className="mt-1 text-white/70">
                      {listedUser.businessName ?? "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-white/40">Registered</dt>
                    <dd className="mt-1 text-white/70">
                      {formatDate(listedUser.createdAt)}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </AdminDashboardFrame>
  );
}
