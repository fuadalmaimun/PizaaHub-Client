import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, Pizza, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found — PizzaHub",
  description:
    "This slice is missing. The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-[#fffaf2] px-5 py-20 text-[#30251f] dark:bg-[#08090b] dark:text-white sm:px-8 lg:px-12">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 top-0 size-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-80 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-375 flex-col items-center py-10 text-center sm:py-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-600/5 px-4 py-2 text-xs font-bold tracking-widest text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/5 dark:text-emerald-400">
          <Pizza aria-hidden="true" size={14} />
          ERROR 404
        </span>

        <p
          className="mt-8 text-[clamp(5rem,18vw,11rem)] font-bold leading-none tracking-tight text-emerald-600/15 dark:text-emerald-400/15"
          style={{ fontFamily: "var(--font-chewy)" }}
          aria-hidden="true"
        >
          404
        </p>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          This Slice Is{" "}
          <span className="text-emerald-600 dark:text-emerald-400">Missing</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-7 text-[#66574d] dark:text-white/60 sm:text-base">
          The page you are looking for was moved, removed or never existed.
          Let&apos;s get you back to something delicious.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-7 py-4 text-sm font-bold text-white shadow-[0_8px_30px_rgba(5,150,105,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-[0_12px_35px_rgba(5,150,105,0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
          >
            <Home aria-hidden="true" size={17} />
            Back to Home
          </Link>

          <Link
            href="/menu"
            className="group inline-flex items-center gap-3 rounded-xl border border-[#30251f]/15 bg-white px-7 py-4 text-sm font-semibold text-[#30251f] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/15 dark:bg-white/5 dark:text-white/85 dark:hover:border-emerald-400/50 dark:hover:bg-white/10 dark:hover:text-emerald-300"
          >
            <Search aria-hidden="true" size={17} />
            Browse Menu
            <ArrowRight
              aria-hidden="true"
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="mt-14 w-full max-w-2xl rounded-3xl border border-[#30251f]/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-7">
          <h2 className="text-lg font-bold">Looking for something else?</h2>
          <p className="mt-2 text-sm leading-7 text-[#66574d] dark:text-white/55">
            These pages are a good place to start.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-full border border-[#30251f]/10 bg-[#fffaf2] px-4 py-2 text-xs font-semibold text-[#30251f] transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:border-emerald-400/40 dark:hover:text-emerald-300"
            >
              Full Menu
            </Link>
            <Link
              href="/dashboard/customer"
              className="rounded-full border border-[#30251f]/10 bg-[#fffaf2] px-4 py-2 text-xs font-semibold text-[#30251f] transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:border-emerald-400/40 dark:hover:text-emerald-300"
            >
              My Orders
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-[#30251f]/10 bg-[#fffaf2] px-4 py-2 text-xs font-semibold text-[#30251f] transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:border-emerald-400/40 dark:hover:text-emerald-300"
            >
              Sign In
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Go back to the home page
        </Link>
      </div>
    </section>
  );
}
