import { HeartHandshake, MapPin, ShieldCheck, Star } from "lucide-react";

const benefits = [
  {
    icon: MapPin,
    title: "Discover local favorites",
    description:
      "Find nearby pizza makers and explore menus created for your neighborhood.",
  },
  {
    icon: HeartHandshake,
    title: "Support local businesses",
    description:
      "Every order helps independent restaurants connect with more pizza lovers.",
  },
  {
    icon: ShieldCheck,
    title: "Simple, clear ordering",
    description:
      "Choose your pizza, share delivery details, and send your order directly to the vendor.",
  },
  {
    icon: Star,
    title: "Choose with confidence",
    description:
      "Browse customer ratings and reviews to find a pizza worth coming back for.",
  },
];

export default function WhyChoosePizzaHub() {
  return (
    <section className="bg-[#fffaf2] px-5 py-16 text-[#30251f] dark:bg-[#08090b] dark:text-white sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-375">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            GOOD FOOD, GOOD NEIGHBORS
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose PizzaHub?
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#66574d] dark:text-white/60 sm:text-base">
            Great pizza is closer than you think. PizzaHub brings local
            restaurants and hungry neighbors together.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#30251f]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-6"
            >
              <span className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                <Icon aria-hidden="true" size={21} />
              </span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#66574d] dark:text-white/55">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
