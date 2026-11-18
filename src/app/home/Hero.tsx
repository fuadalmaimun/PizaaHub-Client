"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Flame, Sparkles } from "lucide-react";

const pizzas = [
  {
    name: "Italian Classic",
    image:
      "https://media.istockphoto.com/id/1442417585/photo/person-getting-a-piece-of-cheesy-pepperoni-pizza.jpg?s=612x612&w=0&k=20&c=k60TjxKIOIxJpd4F4yLMVjsniB4W1BpEV4Mi_nb4uJU=",
  },
  {
    name: "Cheese Burst",
    image:
      "https://www.teka.com/en-om/wp-content/uploads/sites/134/2021/09/Fast-food-pizza.jpg",
  },
  {
    name: "Pepperoni Pizza",
    image:
      "https://www.popuppizzalv.com/wp-content/uploads/shutterstock_849049121.jpg",
  },
  {
    name: "Margherita",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200",
  },
  {
    name: "Veggie Delight",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200",
  },
  {
    name: "Supreme Pizza",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
  },
];

export default function Hero() {
  const [activePizza, setActivePizza] = useState(0);

  const showPreviousPizza = () => {
    setActivePizza((current) => (current - 1 + pizzas.length) % pizzas.length);
  };

  const showNextPizza = () => {
    setActivePizza((current) => (current + 1) % pizzas.length);
  };

  return (
    <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-[#08090b] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(5,150,105,0.18),transparent_45%),linear-gradient(110deg,#050505_0%,#08090c_55%,#11151c_100%)]" />

      <div className="pointer-events-none absolute -right-40 top-10 size-120 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute -left-40 bottom-0 size-100 rounded-full bg-orange-500/5 blur-[100px]" />

      {/* Main Content */}
      <main className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-375 flex-col px-5 pb-6 pt-10 sm:px-8 md:pb-32 md:pt-0 lg:px-12">
        {/* Text Content */}
        <div className="relative z-10 mt-6 max-w-145 animate-fade-up md:mt-16 lg:mt-24">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-400 backdrop-blur-md">
            <Sparkles size={14} />
            FRESHLY BAKED, ALWAYS DELICIOUS
          </div>

          {/* Heading */}
          <h1
            className="max-w-140 text-[clamp(3rem,5.5vw,5.5rem)] font-bold leading-[0.98] tracking-tight"
            style={{ fontFamily: "var(--font-chewy)" }}
          >
            Pizza Paradise
            <br />
            Your Favorite Pies
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-yellow-300 bg-clip-text text-transparent">
              Delivered Hot.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-115 text-sm leading-7 text-white/65 sm:text-base">
            Craving pizza tonight? Discover delicious pizzas from trusted local
            vendors. From cheesy classics to exciting new flavors, find your
            perfect slice and enjoy every bite.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-7 py-4 text-sm font-bold text-white shadow-[0_8px_30px_rgba(5,150,105,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-[0_12px_35px_rgba(5,150,105,0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              Order Now
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/menu"
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-semibold text-white/85 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/50 hover:bg-white/10 hover:text-emerald-300"
            >
              Explore Menu
            </Link>
          </div>

          {/* Small Highlight */}
          <div className="mt-9 flex items-center gap-3 text-xs font-medium text-white/55">
            <Flame size={17} className="text-orange-400" />
            Discover delicious pizzas from local vendors
          </div>
        </div>

        {/* Featured Pizza Image */}
        <div
          key={activePizza}
          className="relative mx-auto mt-8 h-65 w-full max-w-105 animate-fade-up md:absolute md:right-[-2%] md:top-[3%] md:mt-0 md:h-[85%] md:w-[65%] md:max-w-205"
        >
          <div className="absolute inset-5 rounded-full bg-emerald-500/15 blur-[90px]" />

          <Image
            src={pizzas[activePizza].image}
            alt={pizzas[activePizza].name}
            fill
            sizes="(max-width: 768px) 100vw, 65vw"
            unoptimized
            priority
            className="relative z-10 object-cover object-center mix-blend-screen opacity-95 transition-transform duration-700 hover:scale-105 [mask-image:radial-gradient(ellipse_at_60%_48%,black_45%,transparent_78%)]"
          />

          {/* Floating Pizza Label */}
          <div className="absolute bottom-8 right-3 z-20 rounded-2xl border border-white/10 bg-black/50 px-5 py-3 shadow-xl backdrop-blur-xl sm:right-8">
            <p className="text-[10px] font-semibold tracking-widest text-emerald-400">
              FEATURED PIZZA
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              {pizzas[activePizza].name}
            </p>
          </div>
        </div>

        {/* Bottom Slider */}
        <div className="relative z-20 mt-auto flex items-center gap-3 pt-8 md:absolute md:bottom-7 md:left-8 md:right-8 md:mt-0 md:pt-0 lg:left-12 lg:right-12">
          {/* Pizza Thumbnails */}
          <div
            aria-label="Choose a featured pizza"
            className="flex min-w-0 flex-1 gap-3 overflow-x-auto py-2"
          >
            {pizzas.map((pizza, index) => (
              <button
                key={pizza.name}
                type="button"
                aria-label={`Show ${pizza.name}`}
                aria-pressed={activePizza === index}
                onClick={() => setActivePizza(index)}
                className={`group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 sm:h-19 sm:w-19 md:h-22 md:w-22 ${
                  activePizza === index
                    ? "scale-105 border-emerald-400 opacity-100 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    : "border-white/15 opacity-60 hover:scale-105 hover:border-white/50 hover:opacity-100"
                }`}
              >
                <Image
                  src={pizza.image}
                  alt=""
                  width={200}
                  height={200}
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {activePizza === index && (
                  <div className="absolute inset-0 bg-emerald-500/10" />
                )}
              </button>
            ))}
          </div>

          {/* Slider Controls */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={showPreviousPizza}
              aria-label="Previous pizza"
              className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-600 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <ArrowLeft size={19} />
            </button>

            <button
              type="button"
              onClick={showNextPizza}
              aria-label="Next pizza"
              className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-600 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
      </main>
    </section>
  );
}
