
import {
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Star,
  ArrowUpRight,
} from "lucide-react";

const benefits = [
  {
    icon: MapPin,
    number: "01",
    title: "Discover Local Favorites",
    description:
      "Find nearby pizza makers and explore menus filled with delicious options from your neighborhood.",
  },
  {
    icon: HeartHandshake,
    number: "02",
    title: "Support Local Businesses",
    description:
      "Every order helps independent restaurants grow and connect with more pizza lovers.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Simple & Secure Ordering",
    description:
      "Choose your favorite pizza, share delivery details, and send your order directly to the vendor.",
  },
  {
    icon: Star,
    number: "04",
    title: "Choose With Confidence",
    description:
      "Explore customer ratings and honest reviews to discover pizzas worth coming back for.",
  },
];

export default function WhyChoosePizzaHub() {
  return (
    <section className="relative overflow-hidden bg-[#fffaf2] px-5 py-20 text-[#30251f] dark:bg-[#08090b] dark:text-white sm:px-8 lg:px-12">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 top-20 size-80 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-80 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-375">

        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center animate-fade-up">

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-600/5 px-4 py-2 text-xs font-bold tracking-widest text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-400">
            GOOD FOOD, GOOD NEIGHBORS
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Why Choose{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              PizzaHub?
            </span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#66574d] dark:text-white/60 sm:text-base">
            Great pizza is closer than you think. We bring local
            restaurants and hungry neighbors together for a
            better food experience.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {benefits.map(({ icon: Icon, number, title, description }, index) => (
            <article
              key={number}
              style={{ animationDelay: `${index * 150}ms` }}
              className="group relative overflow-hidden animate-fade-up rounded-3xl border border-[#30251f]/10 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-white/10 dark:bg-white/[0.035] sm:p-7"
            >

              {/* Card Number */}
              <div className="mb-7 flex items-center justify-between">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 dark:bg-emerald-400/10 dark:text-emerald-400">
                  <Icon size={25} strokeWidth={1.8} />
                </div>

                <span className="text-4xl font-black text-[#30251f]/10 transition-colors duration-300 group-hover:text-emerald-600/30 dark:text-white/10 dark:group-hover:text-emerald-400/30">
                  {number}
                </span>
              </div>

              {/* Card Content */}
              <h3 className="text-lg font-bold leading-snug transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#66574d] dark:text-white/55">
                {description}
              </p>

              {/* Bottom Decoration */}
              <div className="mt-7 flex items-center justify-between border-t border-[#30251f]/10 pt-5 dark:border-white/10">
                <span className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-400">
                  WHY PIZZAHUB
                </span>

                <span className="flex size-8 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-emerald-600 group-hover:text-white dark:text-emerald-400">
                  <ArrowUpRight size={17} />
                </span>
              </div>

              {/* Hover Decoration */}
              <div className="pointer-events-none absolute -bottom-12 -right-12 size-32 rounded-full bg-emerald-500/5 transition-transform duration-500 group-hover:scale-150" />

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}
