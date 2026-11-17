"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Pizza,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { dashboardPath, profileSettingsPath } from "@/lib/dashboard";

const publicNavigation = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
];

const roleNavigation: Record<string, Array<{ label: string; href: string }>> = {
  customer: [{ label: "My Orders", href: "/dashboard/customer/orders" }],
  vendor: [
    { label: "My Menu", href: "/dashboard/vendor/menu-items" },
    { label: "Orders", href: "/dashboard/vendor/orders" },
  ],
  admin: [
    { label: "Manage Users", href: "/dashboard/admin/users" },
    { label: "Manage Menu", href: "/dashboard/admin/menu-items" },
    { label: "Transactions", href: "/dashboard/admin/transactions" },
  ],
};

type ProfileMenuProps = {
  name: string;
  image?: string | null;
  dashboardHref: string;
  profileHref: string;
  isOpen: boolean;
  isSigningOut: boolean;
  compact?: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignOut: () => void;
};

function ProfileMenu({
  name,
  image,
  dashboardHref,
  profileHref,
  isOpen,
  isSigningOut,
  compact = false,
  onToggle,
  onClose,
  onSignOut,
}: ProfileMenuProps) {
  return (
    <div className={`relative ${compact ? "w-full" : ""}`}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Profile menu for ${name}`}
        onClick={onToggle}
        className={`flex items-center gap-2 rounded-full border border-white/10 bg-white/5 text-sm text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-emerald-400 ${
          compact ? "w-full rounded-lg px-3 py-2.5" : "max-w-48 py-1 pl-1 pr-3"
        }`}
      >
        <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-emerald-500/20">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="32px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <UserRound
              aria-hidden="true"
              className="absolute inset-0 m-auto text-emerald-300"
              size={17}
            />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{name}</span>
        <ChevronDown
          aria-hidden="true"
          size={15}
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Profile options"
          className={`z-50 rounded-xl border border-white/10 bg-[#15171b] p-2 shadow-xl shadow-black/30 ${
            compact
              ? "mt-2"
              : "absolute right-0 top-full mt-2 w-60"
          }`}
        >
          <div className="border-b border-white/10 px-3 py-2">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-white/45">Your PizzaHub account</p>
          </div>
          <Link
            href={dashboardHref}
            role="menuitem"
            onClick={onClose}
            className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
          >
            <LayoutDashboard aria-hidden="true" size={16} />
            Dashboard
          </Link>
          <Link
            href={profileHref}
            role="menuitem"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
          >
            <Settings aria-hidden="true" size={16} />
            Profile Settings
          </Link>
          <div className="my-1 border-t border-white/10" />
          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-60"
          >
            <LogOut aria-hidden="true" size={16} />
            {isSigningOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const roleLinks = user ? roleNavigation[user.role] ?? [] : [];

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isProfileOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsProfileOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  function closeMenus() {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message ?? "Could not log out. Please try again.");
        return;
      }

      closeMenus();
      toast.success("Logged out successfully.");
      router.refresh();
    } catch {
      toast.error("Could not log out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  function renderNavigation(isMobile = false) {
    const links = user
      ? [...publicNavigation, ...roleLinks]
      : publicNavigation;

    return links.map((item) => {
      const isActive =
        item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

      return (
        <Link
          key={item.label}
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          onClick={isMobile ? closeMenus : undefined}
          className={`rounded-lg text-sm transition ${
            isMobile ? "px-3 py-3" : "px-1 py-2"
          } ${
            isActive
              ? "text-emerald-400"
              : "text-white/75 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      );
    });
  }

  return (
    <header ref={headerRef} className="relative">
      <nav
        aria-label="Main navigation"
        className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur-xl sm:px-5"
      >
        <Link
          href="/"
          aria-label="PizzaHub home"
          className="flex shrink-0 items-center gap-2 text-sm font-black tracking-tight text-white"
        >
          <Pizza aria-hidden="true" className="text-emerald-500" size={23} />
          <span>
            Pizza<span className="text-emerald-400">Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-5 lg:flex xl:gap-7">
          {renderNavigation()}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isPending ? (
            <span
              aria-label="Loading account"
              className="size-8 animate-pulse rounded-full bg-white/10"
            />
          ) : user ? (
            <ProfileMenu
              name={user.name || user.email}
              image={user.image}
              dashboardHref={dashboardPath(user.role)}
              profileHref={profileSettingsPath(user.role)}
              isOpen={isProfileOpen}
              isSigningOut={isSigningOut}
              onToggle={() => setIsProfileOpen((open) => !open)}
              onClose={closeMenus}
              onSignOut={handleSignOut}
            />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            setIsMenuOpen((open) => !open);
            setIsProfileOpen(false);
          }}
          className="rounded-lg p-2 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-emerald-400 lg:hidden"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" size={20} />
          ) : (
            <Menu aria-hidden="true" size={20} />
          )}
        </button>
      </nav>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full z-40 mt-2 rounded-xl border border-white/10 bg-[#15171b]/95 p-3 shadow-xl backdrop-blur-xl lg:hidden"
        >
          <div className="flex flex-col">
            {renderNavigation(true)}
            {isPending ? (
              <span className="mx-3 mt-2 h-10 animate-pulse rounded-lg bg-white/10" />
            ) : user ? (
              <ProfileMenu
                name={user.name || user.email}
                image={user.image}
                dashboardHref={dashboardPath(user.role)}
                profileHref={profileSettingsPath(user.role)}
                isOpen={isProfileOpen}
                isSigningOut={isSigningOut}
                compact
                onToggle={() => setIsProfileOpen((open) => !open)}
                onClose={closeMenus}
                onSignOut={handleSignOut}
              />
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/sign-in"
                  onClick={closeMenus}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <LogIn aria-hidden="true" size={16} />
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={closeMenus}
                  className="rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
