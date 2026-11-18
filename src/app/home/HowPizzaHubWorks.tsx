
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Search,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Find Your Favorite",
    description:
      "Explore approved pizzas and local vendors to discover your next favorite meal.",
  },
  {
    icon: ShoppingBag,
    number: "02",
    title: "Place Your Order",
    description:
      "Choose your favorite pizza, provide delivery details, and place your order easily.",
  },
  {
    icon: Bike,
    number: "03",
    title: "Enjoy Your Pizza",
    description:
      "Your vendor prepares your order. Get ready to enjoy something delicious!",
  },
];

export default function HowPizzaHubWorks() {
  return (
    <section className="overflow-hidden bg-[#f4ece1] px-5 py-20 text-[#30251f] dark:bg-[#111315] dark:text-white sm:px-8 lg:px-12">

      <div className="mx-auto max-w-375">

        {/* Section Heading */}
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">

          <div className="max-w-2xl animate-fade-up">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              FROM CRAVING TO FIRST BITE
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              How PizzaHub{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                Works
              </span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#66574d] dark:text-white/60 sm:text-base">
              Delicious pizza is just a few simple steps away.
              Discover, order, and enjoy your favorite pizza
              from trusted local vendors.
            </p>
          </div>

          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-xl"
          >
            Browse the Menu
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Steps */}
        <div className="relative grid gap-6 md:grid-cols-3">

          {steps.map(({ icon: Icon, number, title, description }, index) => (
            <article
              key={number}
              style={{ animationDelay: `${index * 180}ms` }}
              className="group relative animate-fade-up rounded-3xl border border-[#30251f]/10 bg-[#fffaf2] p-7 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-900/10 dark:border-white/10 dark:bg-white/[0.04] sm:p-8"
            >

              {/* Card Top */}
              <div className="mb-8 flex items-center justify-between">

                <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                  <Icon size={27} strokeWidth={1.8} />
                </div>

                <span className="text-5xl font-black tracking-tighter text-[#30251f]/10 transition-colors duration-300 group-hover:text-emerald-600/30 dark:text-white/10 dark:group-hover:text-emerald-400/30">
                  {number}
                </span>
              </div>

              {/* Card Content */}
              <h3 className="mb-3 text-xl font-bold transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                {title}
              </h3>

              <p className="text-sm leading-7 text-[#66574d] dark:text-white/55">
                {description}
              </p>

              {/* Bottom Indicator */}
              <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-emerald-700 opacity-70 transition-all duration-300 group-hover:gap-3 group-hover:opacity-100 dark:text-emerald-400">
                <CheckCircle2 size={15} />
                <span>Simple & Easy</span>
              </div>

              {/* Decorative Circle */}
              <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-emerald-500/5 transition-transform duration-500 group-hover:scale-150" />

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}
