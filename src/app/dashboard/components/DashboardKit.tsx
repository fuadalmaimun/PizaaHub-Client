import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Crown,
  Mail,
  RefreshCw,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/**
 * Shared building blocks for the three dashboards. Keeping the palette,
 * spacing and card styles in one place makes every workspace look and behave
 * the same, and keeps the dashboards responsive on mobile and tablet.
 */

export type DashboardAccent =
  | "emerald"
  | "amber"
  | "sky"
  | "violet"
  | "orange"
  | "rose"
  | "teal";

/** Chart-friendly hex values that match the dashboard accents. */
export const CHART_COLORS: Record<DashboardAccent, string> = {
  emerald: "#10b981",
  amber: "#f59e0b",
  sky: "#38bdf8",
  violet: "#a78bfa",
  orange: "#fb923c",
  rose: "#fb7185",
  teal: "#2dd4bf",
};

type AccentClasses = {
  chip: string;
  bar: string;
  glow: string;
  text: string;
  ring: string;
};

const ACCENTS: Record<DashboardAccent, AccentClasses> = {
  emerald: {
    chip: "bg-emerald-500/12 text-emerald-300",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
    glow: "bg-emerald-500/15",
    text: "text-emerald-300",
    ring: "hover:border-emerald-400/30",
  },
  amber: {
    chip: "bg-amber-500/12 text-amber-300",
    bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
    glow: "bg-amber-500/15",
    text: "text-amber-300",
    ring: "hover:border-amber-400/30",
  },
  sky: {
    chip: "bg-sky-500/12 text-sky-300",
    bar: "bg-gradient-to-r from-sky-500 to-cyan-400",
    glow: "bg-sky-500/15",
    text: "text-sky-300",
    ring: "hover:border-sky-400/30",
  },
  violet: {
    chip: "bg-violet-500/12 text-violet-300",
    bar: "bg-gradient-to-r from-violet-500 to-fuchsia-400",
    glow: "bg-violet-500/15",
    text: "text-violet-300",
    ring: "hover:border-violet-400/30",
  },
  orange: {
    chip: "bg-orange-500/12 text-orange-300",
    bar: "bg-gradient-to-r from-orange-500 to-amber-400",
    glow: "bg-orange-500/15",
    text: "text-orange-300",
    ring: "hover:border-orange-400/30",
  },
  rose: {
    chip: "bg-rose-500/12 text-rose-300",
    bar: "bg-gradient-to-r from-rose-500 to-pink-400",
    glow: "bg-rose-500/15",
    text: "text-rose-300",
    ring: "hover:border-rose-400/30",
  },
  teal: {
    chip: "bg-teal-500/12 text-teal-300",
    bar: "bg-gradient-to-r from-teal-500 to-emerald-400",
    glow: "bg-teal-500/15",
    text: "text-teal-300",
    ring: "hover:border-teal-400/30",
  },
};

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function DashboardPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`min-h-[70svh] bg-[#08090b] px-4 pb-16 pt-6 text-white sm:px-6 sm:pb-20 sm:pt-8 lg:px-10 lg:pt-10 ${className}`}
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-6 sm:space-y-8">
        {children}
      </div>
    </main>
  );
}

export function DashboardHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:pb-7">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-emerald-400">
          <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
          {eyebrow}
        </p>
        <h1 className="mt-2.5 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
          {description}
        </p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}

export function DashboardStatus({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <main className="grid min-h-[60svh] place-items-center bg-[#08090b] px-5 text-white">
      <p
        role={error ? "alert" : "status"}
        className={`max-w-md text-center text-sm ${
          error ? "text-red-200" : "text-white/60"
        }`}
      >
        {children}
      </p>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "emerald",
  href,
  footer,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: DashboardAccent;
  href?: string;
  footer?: ReactNode;
}) {
  const tone = ACCENTS[accent];

  const body = (
    <>
      <div
        className={`pointer-events-none absolute -right-8 -top-10 size-28 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${tone.glow} opacity-60`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <span
          className={`inline-flex size-10 items-center justify-center rounded-xl ${tone.chip}`}
        >
          <Icon aria-hidden="true" size={18} />
        </span>
        {href && (
          <ArrowUpRight
            aria-hidden="true"
            size={16}
            className="mt-1 text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/60"
          />
        )}
      </div>

      <p className="relative mt-4 text-[13px] font-medium text-white/55">
        {label}
      </p>
      <p className="relative mt-1 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      {hint && (
        <p className="relative mt-2 text-xs leading-5 text-white/40">{hint}</p>
      )}
      {footer && <div className="relative mt-4">{footer}</div>}
    </>
  );

  const className = `group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-24px_rgba(16,185,129,0.55)] sm:p-5 ${tone.ring}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f11] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] ${className}`}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-tight text-white sm:text-[15px]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs leading-5 text-white/45">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "p-4 sm:p-5" : ""}>{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "emerald",
  icon: Icon,
}: {
  children: ReactNode;
  tone?: DashboardAccent | "neutral";
  icon?: LucideIcon;
}) {
  const className =
    tone === "neutral"
      ? "border-white/12 bg-white/5 text-white/65"
      : `border-transparent ${ACCENTS[tone].chip}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${className}`}
    >
      {Icon && <Icon aria-hidden="true" size={12} />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

function initials(name?: string | null) {
  const letters = (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return letters || "?";
}

function formatJoined(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function ProfileCard({
  name,
  email,
  image,
  role,
  plan,
  businessName,
  createdAt,
  editHref,
  extra,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "customer" | "vendor" | "admin";
  plan?: string | null;
  businessName?: string | null;
  createdAt?: string | null;
  editHref: string;
  extra?: ReactNode;
}) {
  const isPremium = plan === "premium";

  return (
    <Panel
      title="Your profile"
      description="Account details used across PizzaHub."
      action={
        <Link
          href={editHref}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-emerald-400/40 hover:text-emerald-300"
        >
          Edit profile
          <ArrowUpRight aria-hidden="true" size={13} />
        </Link>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              width={64}
              height={64}
              className="size-16 rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-lg font-bold text-emerald-300">
              {initials(name)}
            </span>
          )}
          <span
            className={`absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-[#0d0f11] ${
              role === "admin"
                ? "bg-amber-400 text-black"
                : role === "vendor"
                  ? "bg-sky-400 text-black"
                  : "bg-emerald-400 text-black"
            }`}
            title={`${role} account`}
          >
            {role === "vendor" ? (
              <Store aria-hidden="true" size={12} />
            ) : role === "admin" ? (
              <Crown aria-hidden="true" size={12} />
            ) : (
              <UserRound aria-hidden="true" size={12} />
            )}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-white">
            {name || "PizzaHub user"}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/45">
            <Mail aria-hidden="true" size={12} className="shrink-0" />
            {email || "No email on file"}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge
              tone={
                role === "admin" ? "amber" : role === "vendor" ? "sky" : "emerald"
              }
            >
              {role}
            </Badge>
            {role === "vendor" && (
              <Badge tone={isPremium ? "amber" : "neutral"} icon={Crown}>
                {isPremium ? "Premium plan" : "Free plan"}
              </Badge>
            )}
            {businessName && <Badge tone="neutral">{businessName}</Badge>}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-white/35">Member since</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-white/70">
            <CalendarDays aria-hidden="true" size={13} />
            {formatJoined(createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-white/35">Account status</dt>
          <dd className="mt-1 text-emerald-300">Active</dd>
        </div>
      </dl>

      {extra && <div className="mt-4">{extra}</div>}
    </Panel>
  );
}

export function UsageMeter({
  label,
  used,
  limit,
  hint,
  unlimited = false,
}: {
  label: string;
  used: number;
  limit: number;
  hint?: string;
  unlimited?: boolean;
}) {
  const percent = unlimited
    ? Math.min(100, used * 8)
    : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium text-white/55">{label}</p>
        <p className="text-xs font-semibold text-white/80">
          {unlimited ? `${used} / Unlimited` : `${used} of ${limit}`}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            unlimited
              ? "bg-gradient-to-r from-amber-400 to-yellow-300"
              : percent >= 100
                ? "bg-gradient-to-r from-rose-500 to-orange-400"
                : "bg-gradient-to-r from-emerald-500 to-teal-400"
          }`}
          style={{ width: `${Math.max(percent, used > 0 ? 8 : 0)}%` }}
        />
      </div>
      {hint && <p className="mt-2 text-[11px] leading-5 text-white/40">{hint}</p>}
    </div>
  );
}

export function QuickLink({
  href,
  icon: Icon,
  title,
  description,
  accent = "emerald",
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: DashboardAccent;
}) {
  const tone = ACCENTS[accent];

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05] ${tone.ring}`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone.chip}`}
      >
        <Icon aria-hidden="true" size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-white/45">
          {description}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        size={16}
        className="shrink-0 text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-300"
      />
    </Link>
  );
}

export function DashboardSkeleton({
  cards = 4,
  charts = 2,
}: {
  cards?: number;
  charts?: number;
}) {
  return (
    <div role="status" className="space-y-6 sm:space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: charts }, (_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
          />
        ))}
      </div>
      <span className="sr-only">Loading dashboard data...</span>
    </div>
  );
}

export function RefreshButton({
  onClick,
  busy = false,
  label = "Refresh",
}: {
  onClick: () => void;
  busy?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-white/75 transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
    >
      <RefreshCw
        aria-hidden="true"
        size={15}
        className={busy ? "animate-spin" : ""}
      />
      {label}
    </button>
  );
}

export function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-semibold underline underline-offset-4"
        >
          Retry
        </button>
      )}
    </div>
  );
}
