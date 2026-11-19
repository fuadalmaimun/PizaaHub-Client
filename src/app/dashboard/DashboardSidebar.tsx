"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  ClipboardList,
  CreditCard,
  Heart,
  LayoutDashboard,
  Menu,
  Pizza,
  Plus,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { dashboardPath, profileSettingsPath } from "@/lib/dashboard";

type DashboardRole = "customer" | "vendor" | "admin";

type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const roleTitles: Record<DashboardRole, string> = {
  customer: "Customer Dashboard",
  vendor: "Vendor Dashboard",
  admin: "Admin Dashboard",
};

const roleWorkspaces: Record<DashboardRole, string> = {
  customer: "Order & track your pizzas",
  vendor: "Grow your pizza business",
  admin: "Keep PizzaHub healthy",
};

const roleAccents: Record<DashboardRole, string> = {
  customer: "from-emerald-500/25 to-amber-500/5 text-emerald-300",
  vendor: "from-amber-500/25 to-emerald-500/5 text-amber-300",
  admin: "from-amber-500/25 to-orange-500/5 text-amber-300",
};

function isDashboardRole(role: string): role is DashboardRole {
  return role === "customer" || role === "vendor" || role === "admin";
}

function getSidebarItems(role: DashboardRole): SidebarItem[] {
  const overview = {
    label: "Overview",
    href: dashboardPath(role),
    icon: LayoutDashboard,
  };
  const profile = {
    label: "Profile Settings",
    href: profileSettingsPath(role),
    icon: Settings,
  };

  if (role === "customer") {
    return [
      overview,
      {
        label: "My Orders",
        href: "/dashboard/customer/orders",
        icon: ClipboardList,
      },
      {
        label: "My Wishlist",
        href: "/dashboard/customer/favorites",
        icon: Heart,
      },
      profile,
    ];
  }

  if (role === "vendor") {
    return [
      overview,
      {
        label: "My Menu Items",
        href: "/dashboard/vendor/menu-items",
        icon: Pizza,
      },
      {
        label: "Add Menu Item",
        href: "/dashboard/vendor/add-menu-item",
        icon: Plus,
      },
      {
        label: "Customer Orders",
        href: "/dashboard/vendor/orders",
        icon: ClipboardList,
      },
      {
        label: "Subscription",
        href: "/dashboard/vendor/subscription",
        icon: CreditCard,
      },
      profile,
    ];
  }

  return [
    overview,
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Manage Menu Items",
      href: "/dashboard/admin/menu-items",
      icon: Pizza,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: CreditCard,
    },
    profile,
  ];
}

/** The one action each role performs most often. */
function primaryAction(role: DashboardRole) {
  if (role === "vendor") {
    return {
      href: "/dashboard/vendor/add-menu-item",
      label: "Add menu item",
      icon: Plus,
    };
  }
  if (role === "admin") {
    return {
      href: "/dashboard/admin/menu-items",
      label: "Review menu items",
      icon: ShieldCheck,
    };
  }
  return { href: "/menu", label: "Order a pizza", icon: Pizza };
}

function initials(name?: string | null) {
  const letters = (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return letters || "?";
}

const ROLE_ICONS: Record<DashboardRole, LucideIcon> = {
  customer: UserRound,
  vendor: Store,
  admin: ShieldCheck,
};

function SidebarPanel({
  role,
  pathname,
  items,
  name,
  email,
  image,
  plan,
  onNavigate,
}: {
  role: DashboardRole;
  pathname: string;
  items: SidebarItem[];
  name?: string | null;
  email?: string | null;
  image?: string | null;
  plan?: string | null;
  onNavigate?: () => void;
}) {
  const overviewHref = dashboardPath(role);
  const action = primaryAction(role);
  const ActionIcon = action.icon;
  const RoleIcon = ROLE_ICONS[role];
  const isPremium = plan === "premium";

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d0f11] p-3.5 shadow-xl shadow-black/20">
      {/* Identity */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-3">
        <div
          className={`pointer-events-none absolute -right-6 -top-8 size-20 rounded-full bg-gradient-to-br blur-2xl ${roleAccents[role]}`}
        />
        <div className="relative flex items-center gap-3">
          <Link
            href={profileSettingsPath(role)}
            onClick={onNavigate}
            className="shrink-0"
            aria-label="Open profile settings"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                width={44}
                height={44}
                className="size-11 rounded-xl border border-white/15 object-cover"
              />
            ) : (
              <span className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-sm font-bold text-white/80">
                {initials(name)}
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {name || "PizzaHub user"}
            </p>
            <p className="truncate text-[11px] text-white/45">
              {email || "Signed in"}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold capitalize text-white/70">
              <RoleIcon aria-hidden="true" size={10} />
              {role}
              {role === "vendor" && ` · ${isPremium ? "premium" : "free"}`}
            </span>
          </div>
        </div>
      </div>

      {/* Primary action */}
      <Link
        href={action.href}
        onClick={onNavigate}
        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      >
        <ActionIcon aria-hidden="true" size={15} />
        {action.label}
        <ChevronRight
          aria-hidden="true"
          size={14}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </Link>

      {/* Navigation */}
      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1">
        <p className="px-2 pb-1.5 text-[10px] font-bold tracking-[0.16em] text-white/30">
          {roleTitles[role].toUpperCase()}
        </p>

        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== overviewHref &&
              pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
              className={`relative flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-200 ring-1 ring-inset ring-emerald-400/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-emerald-400" />
              )}
              <Icon
                aria-hidden="true"
                size={17}
                className={isActive ? "text-emerald-300" : "text-white/45"}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <p className="border-t border-white/10 px-2 pt-3 text-[10px] leading-5 text-white/30">
        {roleWorkspaces[role]}
      </p>
    </div>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const user = session?.user;
  const role = user && isDashboardRole(user.role) ? user.role : undefined;
  const isMobileOpen = mobileOpenPath === pathname;

  if (isPending || !role || user?.isBlocked) return null;

  const items = getSidebarItems(role);
  const current =
    [...items]
      .sort((first, second) => second.href.length - first.href.length)
      .find(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      ) ?? items[0];

  const panelProps = {
    role,
    pathname,
    items,
    name: user?.name,
    email: user?.email,
    image: user?.image,
    plan: user?.subscriptionPlan,
  };

  return (
    <>
      {/* Mobile / tablet top bar */}
      <div className="px-4 pt-4 sm:px-6 lg:hidden">
        <div className="sticky top-[4.5rem] z-30 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d0f11]/95 px-2.5 py-2 backdrop-blur-md">
          <button
            type="button"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-dashboard-sidebar"
            aria-label="Open dashboard menu"
            onClick={() => setMobileOpenPath(isMobileOpen ? null : pathname)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition hover:border-emerald-400/30 hover:text-emerald-300"
          >
            {isMobileOpen ? (
              <X aria-hidden="true" size={17} />
            ) : (
              <Menu aria-hidden="true" size={17} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold tracking-[0.16em] text-emerald-400">
              {roleTitles[role].toUpperCase()}
            </p>
            <p className="truncate text-sm font-semibold text-white">
              {current?.label ?? "Overview"}
            </p>
          </div>

          <Link
            href={profileSettingsPath(role)}
            aria-label="Open profile settings"
            className="shrink-0"
          >
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                width={36}
                height={36}
                className="size-9 rounded-xl border border-white/15 object-cover"
              />
            ) : (
              <span className="grid size-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-xs font-bold text-white/80">
                {initials(user?.name)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile / tablet drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard navigation"
            onClick={() => setMobileOpenPath(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          />
          <aside
            id="mobile-dashboard-sidebar"
            className="absolute inset-y-0 left-0 w-[min(19rem,88vw)] overflow-y-auto border-r border-white/10 bg-[#08090b] p-3 animate-in slide-in-from-left duration-300"
          >
            <div className="mb-2 flex items-center justify-between px-1.5 pt-1">
              <p className="text-xs font-bold tracking-[0.18em] text-white/40">
                PIZZAHUB
              </p>
              <button
                type="button"
                onClick={() => setMobileOpenPath(null)}
                aria-label="Close dashboard navigation"
                className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:text-white"
              >
                <X aria-hidden="true" size={15} />
              </button>
            </div>
            <SidebarPanel
              {...panelProps}
              onNavigate={() => setMobileOpenPath(null)}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 px-4 pb-8 pt-6 lg:block xl:w-72">
        <div className="sticky top-24">
          <SidebarPanel {...panelProps} />
        </div>
      </aside>
    </>
  );
}
