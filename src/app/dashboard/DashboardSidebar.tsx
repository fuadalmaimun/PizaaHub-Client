"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  CreditCard,
  Heart,
  LayoutDashboard,
  Menu,
  Pizza,
  Plus,
  Settings,
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
    profile,
  ];
}

function SidebarPanel({
  role,
  pathname,
  items,
  onNavigate,
}: {
  role: DashboardRole;
  pathname: string;
  items: SidebarItem[];
  onNavigate?: () => void;
}) {
  const overviewHref = dashboardPath(role);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111315] p-4 shadow-xl shadow-black/10">
      <div className="border-b border-white/10 px-2 pb-4">
        <p className="text-xs font-bold tracking-[0.16em] text-emerald-400">
          PIZZAHUB
        </p>
        <h2 className="mt-2 text-base font-semibold text-white">
          {roleTitles[role]}
        </h2>
      </div>
      <nav aria-label="Dashboard navigation" className="mt-3 space-y-1">
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon aria-hidden="true" size={17} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const user = session?.user;
  const role =
    user && isDashboardRole(user.role) ? user.role : undefined;
  const isMobileOpen = mobileOpenPath === pathname;

  if (isPending || !role || user?.isBlocked) return null;

  const items = getSidebarItems(role);

  return (
    <>
      <div className="px-5 pt-4 sm:px-8 lg:hidden">
        <button
          type="button"
          aria-expanded={isMobileOpen}
          aria-controls="mobile-dashboard-sidebar"
          onClick={() =>
            setMobileOpenPath(isMobileOpen ? null : pathname)
          }
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#111315] px-3 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/5"
        >
          {isMobileOpen ? (
            <X aria-hidden="true" size={17} />
          ) : (
            <Menu aria-hidden="true" size={17} />
          )}
          Dashboard menu
        </button>
      </div>

      {isMobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close dashboard navigation"
            onClick={() => setMobileOpenPath(null)}
            className="fixed inset-x-0 bottom-0 top-24 z-40 bg-black/70 lg:hidden"
          />
          <aside
            id="mobile-dashboard-sidebar"
            className="fixed bottom-0 left-0 top-24 z-50 w-[min(18rem,85vw)] overflow-y-auto px-4 pb-6 pt-3 lg:hidden"
          >
            <SidebarPanel
              role={role}
              pathname={pathname}
              items={items}
              onNavigate={() => setMobileOpenPath(null)}
            />
          </aside>
        </>
      )}

      <aside className="hidden w-64 shrink-0 px-4 pb-8 pt-6 lg:block">
        <div className="sticky top-28">
          <SidebarPanel role={role} pathname={pathname} items={items} />
        </div>
      </aside>
    </>
  );
}
