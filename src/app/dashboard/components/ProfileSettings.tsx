"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  Crown,
  Loader2,
  ShieldCheck,
  Store,
  Trash2,
  User,
  type LucideIcon,
} from "lucide-react";

import { toast } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/dashboard";

type DashboardRole = "customer" | "vendor" | "admin";

type RoleInfo = {
  label: string;
  workspace: string;
  description: string;
  summary: string;
  icon: LucideIcon;
};

const ROLE_INFO: Record<DashboardRole, RoleInfo> = {
  customer: {
    label: "Customer",
    workspace: "CUSTOMER WORKSPACE",
    description: "Manage your personal details and profile image.",
    summary: "You order fresh pizza from local vendors.",
    icon: User,
  },
  vendor: {
    label: "Vendor",
    workspace: "VENDOR WORKSPACE",
    description:
      "Manage your personal details, business name and profile image.",
    summary: "You sell your restaurant's pizza on PizzaHub.",
    icon: Store,
  },
  admin: {
    label: "Admin",
    workspace: "ADMIN WORKSPACE",
    description: "Manage your admin account details and profile image.",
    summary: "You manage users, menu items and platform activity.",
    icon: ShieldCheck,
  },
};

type ProfileUser = {
  name: string;
  email: string;
  image?: string | null;
  businessName?: string | null;
  subscriptionPlan?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function initials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return letters || "?";
}

function ProfileStatus({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <main className="grid min-h-[60svh] place-items-center bg-[#08090b] px-5 text-white">
      <p
        role={error ? "alert" : "status"}
        className={`text-center text-sm ${error ? "text-red-200" : "text-white/60"}`}
      >
        {children}
      </p>
    </main>
  );
}

function ProfileForm({
  user,
  role,
}: {
  user: ProfileUser;
  role: DashboardRole;
}) {
  const info = ROLE_INFO[role];
  const RoleIcon = info.icon;

  const [name, setName] = useState(user.name ?? "");
  const [businessName, setBusinessName] = useState(user.businessName ?? "");
  const [imageUrl, setImageUrl] = useState(user.image ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isPremium =
    role === "vendor" && user.subscriptionPlan === "premium";

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Allow choosing the same file again later.
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
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

      setImageUrl(payload.url);
      toast.success("Photo uploaded. Click Save Changes to apply it.");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not upload the photo.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter your full name.");
      return;
    }

    const trimmedBusinessName = businessName.trim();
    if (role === "vendor" && !trimmedBusinessName) {
      toast.error("Please enter your business name.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await authClient.updateUser({
        name: trimmedName,
        image: imageUrl.trim() ? imageUrl.trim() : null,
        ...(role === "vendor" ? { businessName: trimmedBusinessName } : {}),
      });

      if (error) {
        toast.error(error.message ?? "Could not update your profile.");
        return;
      }

      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* Account summary */}
      <aside className="h-fit rounded-2xl border border-white/10 bg-[#111315] p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Profile"
                className="size-24 rounded-full border border-white/15 object-cover"
              />
            ) : (
              <span className="flex size-24 items-center justify-center rounded-full border border-white/15 bg-white/5 text-2xl font-bold text-emerald-300">
                {initials(name || user.name)}
              </span>
            )}
          </div>

          <p className="mt-4 text-lg font-bold">{name.trim() || user.name}</p>
          <p className="mt-1 break-all text-sm text-white/50">{user.email}</p>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <RoleIcon aria-hidden="true" size={14} />
            {info.label}
          </span>
        </div>

        <p className="mt-5 border-t border-white/10 pt-4 text-sm text-white/55">
          {info.summary}
        </p>

        {role === "vendor" && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Crown
                aria-hidden="true"
                size={16}
                className={isPremium ? "text-amber-400" : "text-white/40"}
              />
              {isPremium ? "Premium plan" : "Free plan"}
            </span>
            <Link
              href="/dashboard/vendor/subscription"
              className="text-xs font-semibold text-emerald-400 underline underline-offset-4"
            >
              Manage
            </Link>
          </div>
        )}
      </aside>

      {/* Edit form */}
      <section className="rounded-2xl border border-white/10 bg-[#111315] p-6">
        <h2 className="text-lg font-bold">Account details</h2>
        <p className="mt-1 text-sm text-white/50">
          Your role is fixed and cannot be changed from here.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          {/* Profile image */}
          <div>
            <p className="text-sm font-semibold text-white/70">Profile image</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label
                htmlFor="profile-image"
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 ${
                  isUploading || isSaving
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
              >
                {isUploading ? (
                  <Loader2 aria-hidden="true" size={16} className="animate-spin" />
                ) : (
                  <Camera aria-hidden="true" size={16} />
                )}
                {isUploading ? "Uploading..." : "Change photo"}
              </label>
              <input
                id="profile-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                disabled={isUploading || isSaving}
                className="sr-only"
              />

              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  disabled={isUploading || isSaving}
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-red-300 transition hover:text-red-200 disabled:opacity-50"
                >
                  <Trash2 aria-hidden="true" size={15} />
                  Remove
                </button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-white/40">
              JPG, PNG, WebP or GIF. Maximum 5 MB.
            </p>
          </div>

          {/* Full name */}
          <div>
            <label
              htmlFor="profile-name"
              className="text-sm font-semibold text-white/70"
            >
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#0b0d0f] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-400/50 focus:outline-none"
            />
          </div>

          {/* Business name (vendor only) */}
          {role === "vendor" && (
            <div>
              <label
                htmlFor="profile-business"
                className="text-sm font-semibold text-white/70"
              >
                Business name
              </label>
              <input
                id="profile-business"
                type="text"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="Your restaurant name"
                autoComplete="organization"
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#0b0d0f] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-400/50 focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-white/40">
                This name is shown to customers on your menu items.
              </p>
            </div>
          )}

          {/* Email (read only) */}
          <div>
            <label
              htmlFor="profile-email"
              className="text-sm font-semibold text-white/70"
            >
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              readOnly
              className="mt-2 w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-white/50"
            />
            <p className="mt-1.5 text-xs text-white/40">
              Your email is used for sign-in and cannot be changed here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 aria-hidden="true" size={16} className="animate-spin" />
              ) : (
                <Check aria-hidden="true" size={16} />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            {isUploading && (
              <span role="status" className="text-sm text-white/50">
                Uploading photo...
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

export default function ProfileSettings({ role }: { role: DashboardRole }) {
  const router = useRouter();
  const { data: sessionData, isPending } = authClient.useSession();
  const user = sessionData?.user;
  const userRole: string | undefined = user?.role;
  const info = ROLE_INFO[role];
  const RoleIcon = info.icon;

  // Users must not open another role's profile page.
  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace("/sign-in");
    } else if (userRole !== role) {
      router.replace(dashboardPath(userRole));
    }
  }, [isPending, role, router, user, userRole]);

  if (isPending || !user || userRole !== role) {
    return (
      <ProfileStatus>
        {isPending ? "Checking your account..." : "Redirecting..."}
      </ProfileStatus>
    );
  }

  if (user.isBlocked) {
    return (
      <ProfileStatus error>
        Your account is blocked and cannot access this page.
      </ProfileStatus>
    );
  }

  return (
    <main className="min-h-[70svh] bg-[#08090b] px-5 pb-16 pt-10 text-white sm:px-8 sm:pb-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-emerald-400">
            {info.workspace}
          </p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <RoleIcon aria-hidden="true" size={28} className="text-white/40" />
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-white/55">{info.description}</p>
        </div>

        <ProfileForm key={user.id} user={user} role={role} />
      </div>
    </main>
  );
}
