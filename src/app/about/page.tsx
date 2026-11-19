
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  ChefHat,
  Clock,
  Heart,
  Leaf,
  Pizza,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Utensils,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description:
      "We believe every great pizza starts with fresh ingredients and carefully selected flavors.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Every order represents our passion for delicious food and a better dining experience.",
  },
  {
    icon: Zap,
    title: "Easy Ordering",
    description:
      "Discover your favorite pizzas, place orders, and enjoy a smooth ordering experience.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Experience",
    description:
      "We focus on providing a convenient and reliable platform for customers and vendors.",
  },
];

const steps = [
  {
    number: "01",
    icon: Utensils,
    title: "Explore the Menu",
    description:
      "Discover a variety of delicious pizzas, sides, and your favorite food items.",
  },
  {
    number: "02",
    icon: ShoppingBag,
    title: "Place Your Order",
    description:
      "Choose your favorite items, add them to your cart, and order with ease.",
  },
  {
    number: "03",
    icon: Truck,
    title: "Enjoy Your Food",
    description:
      "Sit back, relax, and enjoy a delicious meal with PizzaHub.",
  },
];

const highlights = [
  { value: "Easy", label: "Online Ordering" },
  { value: "Fresh", label: "Food Experience" },
  { value: "Simple", label: "User Experience" },
];

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">

      {/* Hero Section */}
      <section className="relative px-5 py-20 md:py-28">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#ffbd00]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#e50916]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e50916]/20 bg-[#e50916]/5 px-4 py-2 text-sm font-semibold text-[#e50916] dark:border-[#ffbd00]/20 dark:bg-[#ffbd00]/10 dark:text-[#ffbd00]">
              <Sparkles size={15} />
              Discover Our Story
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Good Food.
              <br />
              Great Moments.
              <br />
              <span className="text-[#e50916] dark:text-[#ffbd00]">
                That's PizzaHub.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
              We bring pizza lovers and passionate food vendors together
              through a simple and enjoyable online ordering experience.
              Discover delicious food and make every meal special with PizzaHub.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-[#e50916] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#e50916]/20 transition hover:-translate-y-1 hover:bg-[#b80d18] dark:bg-[#ffbd00] dark:text-[#e50916] dark:hover:bg-[#ffd766]"
              >
                Explore Menu
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 font-semibold transition hover:border-[#e50916] hover:text-[#e50916] dark:hover:border-[#ffbd00] dark:hover:text-[#ffbd00]"
              >
                Contact Us
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-7">
              {highlights.map((item) => (
                <div key={item.label}>
                  <h3 className="text-xl font-extrabold text-[#e50916] dark:text-[#ffbd00] md:text-2xl">
                    {item.value}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-5 rounded-full bg-[#ffbd00]/30 blur-3xl" />

            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[3rem] border border-[#e50916]/10 bg-[#e50916] shadow-2xl dark:border-[#ffbd00]/10">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border border-white/10" />

              <div className="relative flex flex-col items-center">
                <div className="flex h-48 w-48 items-center justify-center rounded-full border-8 border-[#ffbd00]/20 bg-[#ffbd00] shadow-2xl sm:h-60 sm:w-60">
                  <Pizza
                    size={115}
                    strokeWidth={1.3}
                    className="text-[#e50916] sm:h-36 sm:w-36"
                  />
                </div>

                <h2 className="mt-8 text-3xl font-extrabold tracking-wide text-white sm:text-4xl">
                  PizzaHub
                </h2>

                <p className="mt-2 text-sm tracking-[0.3em] text-[#ffbd00]">
                  TASTE THE DIFFERENCE
                </p>
              </div>

              <div className="absolute left-5 top-8 rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-lg backdrop-blur-md">
                <ChefHat size={27} />
              </div>

              <div className="absolute bottom-8 right-5 rounded-2xl border border-white/10 bg-white/10 p-3 text-[#ffbd00] shadow-lg backdrop-blur-md">
                <Heart size={27} />
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl sm:-left-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffbd00]/30 text-[#e50916] dark:text-[#ffbd00]">
                <Star size={23} />
              </div>
              <div>
                <p className="text-sm font-bold">Made for Pizza Lovers</p>
                <p className="text-xs text-muted-foreground">
                  Every bite matters
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="border-y border-border bg-muted/30 px-5 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#e50916] p-8 text-white shadow-xl sm:p-12">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#ffbd00]/10 blur-2xl" />

              <div className="relative">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ffbd00]">
                  Our Philosophy
                </span>

                <h2 className="mt-7 text-3xl font-extrabold leading-snug sm:text-4xl">
                  Bringing People Together, One Pizza at a Time.
                </h2>

                <div className="my-8 h-1 w-20 rounded-full bg-[#ffbd00]" />

                <p className="max-w-md leading-8 text-white/75">
                  Great food has the power to create memorable moments.
                  We want to make discovering and ordering your favorite
                  food easier for everyone.
                </p>

                <div className="mt-10 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffbd00] text-[#e50916]">
                    <Pizza size={25} />
                  </div>
                  <div>
                    <p className="font-bold">The PizzaHub Team</p>
                    <p className="text-sm text-white/60">
                      Passion for great food
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#e50916] dark:text-[#ffbd00]">
              Who We Are
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              More Than Just an Online Pizza Ordering Platform.
            </h2>

            <p className="mt-6 leading-8 text-muted-foreground">
              PizzaHub is an online pizza ordering platform designed
              to connect customers with food vendors. We make it easy
              to discover different menu items, explore food options,
              and place orders from one convenient platform.
            </p>

            <p className="mt-5 leading-8 text-muted-foreground">
              Whether you love classic pizzas or enjoy trying something
              new, PizzaHub gives you a simple way to explore your
              favorites and enjoy a better food ordering experience.
            </p>

            <div className="mt-9 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e50916]/10 text-[#e50916] dark:bg-[#ffbd00]/10 dark:text-[#ffbd00]">
                <Users size={25} />
              </div>
              <div>
                <h3 className="font-bold">A Connected Food Community</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bringing customers and food vendors together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-5 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#e50916] dark:text-[#ffbd00]">
              What Drives Us
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Our Mission & Vision
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Everything we do is focused on creating a better
              experience for food lovers and vendors.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="group rounded-3xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:shadow-xl sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e50916] text-[#ffbd00]">
                <Heart size={28} />
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-widest text-[#e50916] dark:text-[#ffbd00]">
                Our Mission
              </p>

              <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                Making Every Order Simple and Special.
              </h3>

              <p className="mt-5 leading-8 text-muted-foreground">
                Our mission is to make online food ordering simple,
                accessible, and enjoyable while helping food vendors
                showcase their products to more customers.
              </p>
            </div>

            <div className="group rounded-3xl border border-[#e50916]/20 bg-[#e50916] p-8 text-white shadow-xl transition hover:-translate-y-1 sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffbd00] text-[#e50916]">
                <Award size={28} />
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-widest text-[#ffbd00]">
                Our Vision
              </p>

              <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                A Better Food Experience for Everyone.
              </h3>

              <p className="mt-5 leading-8 text-white/70">
                We envision a connected food community where
                customers can discover great food and vendors
                can grow their businesses through a modern platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="border-y border-border bg-muted/30 px-5 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#e50916] dark:text-[#ffbd00]">
              The PizzaHub Difference
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Why Choose PizzaHub?
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              We combine convenience, quality, and simplicity
              to create an enjoyable food ordering experience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-border bg-card p-7 transition duration-300 hover:-translate-y-2 hover:border-[#e50916]/40 hover:shadow-xl dark:hover:border-[#ffbd00]/40"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e50916] text-[#ffbd00] transition group-hover:scale-110">
                  <feature.icon size={27} />
                </div>

                <h3 className="mt-7 text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>

                <div className="mt-6 h-1 w-10 rounded-full bg-[#ffbd00] transition-all group-hover:w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-5 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#e50916] dark:text-[#ffbd00]">
              Simple & Convenient
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              How PizzaHub Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Your favorite food is just a few simple steps away.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#e50916] text-[#ffbd00] shadow-lg shadow-[#e50916]/20 transition hover:-translate-y-2">
                  <step.icon size={38} />

                  <span className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border-4 border-background bg-[#ffbd00] text-xs font-extrabold text-[#e50916]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-muted-foreground">
                  {step.description}
                </p>

                {index !== 2 && (
                  <ArrowRight className="absolute -right-5 top-9 hidden text-[#e50916]/30 dark:text-[#ffbd00]/30 md:block" size={28} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-20 md:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#e50916] px-6 py-16 text-center text-white sm:px-12 md:py-24">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border-[40px] border-white/5" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffbd00] text-[#e50916]">
              <Pizza size={34} />
            </div>

            <h2 className="mt-8 text-3xl font-extrabold sm:text-5xl">
              Your Next Favorite Pizza
              <span className="block text-[#ffbd00]">
                Is Waiting for You!
              </span>
            </h2>

            <p className="mt-6 leading-8 text-white/70">
              Explore our menu, discover delicious options, and
              make your next meal memorable with PizzaHub.
            </p>

            <Link
              href="/menu"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#ffbd00] px-8 py-4 font-bold text-[#e50916] transition hover:-translate-y-1 hover:bg-white"
            >
              Order Your Favorite Pizza
              <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
