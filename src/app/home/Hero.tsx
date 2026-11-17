"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const pizzas = [
  {
    name: "Italian Classic",
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200",
  },
  {
    name: "Cheese Burst",
    image:
      "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=1200",
  },
  {
    name: "Pepperoni Pizza",
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200",
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_46%,rgba(54,63,77,0.44),transparent_43%),linear-gradient(110deg,#050505_0%,#08090c_56%,#11151c_100%)]"
      />

      <main className="relative mx-auto flex min-h-[calc(100svh-8rem)] max-w-375 flex-col px-5 pb-6 pt-10 sm:px-8 md:pb-32 md:pt-0 lg:px-12">
        <div className="relative z-10 mt-6 max-w-135 md:mt-12">
          <h1
            className="max-w-130 text-[clamp(3rem,4.2vw,4rem)] leading-[0.98] tracking-[0.005em]"
            style={{ fontFamily: "var(--font-chewy)" }}
          >
            Pizza Paradise
            <br />
            Your Favorite Pies
            <br />
            Delivered Hot
          </h1>

          <p className="mt-5 max-w-110 text-[13px] leading-[1.4] text-white/75 sm:text-sm">
            Craving pizza tonight? Choose from our signature pizzas or build
            your own with fresh toppings and sauces. Whether it&apos;s a cheesy
            classic or something adventurous, we&apos;ve got the perfect pie.
            Quick, easy, and always delicious. Order now!
          </p>

          <div className="mt-6 flex items-center gap-5">
            <Link
              href="/menu"
              className="rounded-lg bg-emerald-600 px-7 py-3 text-sm font-semibold shadow-[0_0_18px_rgba(5,150,105,0.3)] transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              Order Now
            </Link>
            <Link
              href="/menu"
              className="text-sm font-medium text-emerald-500 transition hover:text-emerald-300"
            >
              View Menu
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-8 h-65 w-full max-w-97.5 md:absolute md:right-[-2%] md:top-[3%] md:mt-0 md:h-[88%] md:w-[65%] md:max-w-205">
          <Image
            src={pizzas[activePizza].image}
            alt={pizzas[activePizza].name}
            fill
            sizes="(max-width: 768px) 100vw, 65vw"
            unoptimized
            className="object-cover object-center mix-blend-screen opacity-95 mask-[radial-gradient(ellipse_at_60%_48%,black_45%,transparent_78%)]"
          />
        </div>

        <div className="relative z-20 mt-auto flex items-center gap-3 md:absolute md:bottom-6 md:left-8 md:right-8 md:mt-0 lg:left-12 lg:right-12">
          <div
            aria-label="Choose a featured pizza"
            className="flex min-w-0 flex-1 gap-3 overflow-x-auto py-1"
          >
            {pizzas.map((pizza, index) => (
              <button
                key={pizza.name}
                type="button"
                aria-label={`Show ${pizza.name}`}
                aria-pressed={activePizza === index}
                onClick={() => setActivePizza(index)}
                className={`h-17 w-17 shrink-0 overflow-hidden rounded-lg border transition sm:h-19 sm:w-19 md:h-22.5 md:w-22.5 ${
                  activePizza === index
                    ? "border-emerald-500 opacity-100"
                    : "border-white/45 opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={pizza.image}
                  alt=""
                  width={200}
                  height={200}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={showPreviousPizza}
              aria-label="Previous pizza"
              className="rounded-full p-2 text-white/65 transition hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <ArrowLeft aria-hidden="true" size={19} />
            </button>
            <button
              type="button"
              onClick={showNextPizza}
              aria-label="Next pizza"
              className="rounded-full p-2 text-white/65 transition hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <ArrowRight aria-hidden="true" size={19} />
            </button>
          </div>
        </div>
      </main>
    </section>
  );
}
