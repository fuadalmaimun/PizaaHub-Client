"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* Custom Logo SVG matching the dripping cheese pizza slice */
function PizzaHubLogo() {
  return (
    <svg
      viewBox="0 0 110 100"
      className="h-11 w-12 shrink-0 sm:h-14 sm:w-16 lg:h-16 lg:w-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 58C10 30 35 8 68 12C90 15 104 32 106 54C107 58 103 61 99 60L94 58C92 38 78 24 60 22C38 20 22 36 22 56L16 61C13 62 12 60 12 58Z"
        fill="#E50916"
      />
      <path
        d="M24 55C24 38 39 25 58 26C75 27 89 40 91 57L76 62C74 62 73 65 73 68V74C73 77 69 77 69 74V67C69 65 67 64 65 65L56 68C54 69 53 71 53 74V84C53 88 47 88 47 84V73C47 71 45 70 43 71L38 73C36 74 35 76 35 79V82C35 85 30 85 30 82V74C30 71 28 70 26 71L21 73C18 74 16 71 18 68L24 55Z"
        fill="#FFB900"
      />
      <path
        d="M58 26L46 69M58 26L72 63"
        stroke="#080808"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="44" cy="45" r="5" fill="#E50916" />
      <circle cx="62" cy="42" r="4.5" fill="#E50916" />
      <circle cx="77" cy="49" r="4.5" fill="#E50916" />
      <circle cx="33" cy="58" r="3.5" fill="#E50916" />
      <circle cx="57" cy="56" r="3.5" fill="#E50916" />
    </svg>
  );
}

/* Custom Feature Icons */
function ScooterIcon() {
  return (
    <svg viewBox="0 0 64 52" className="h-8 w-10 shrink-0 sm:h-10 sm:w-12" fill="none">
      <rect x="8" y="10" width="16" height="14" rx="2" stroke="#FFB900" strokeWidth="2.8" />
      <path d="M12 15H20" stroke="#FFB900" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M10 28H28L34 16H42M38 16L46 34M12 36H48C50 36 52 34 52 32C52 28 48 26 44 26H35"
        stroke="#FFB900"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="39" r="6.5" stroke="#FFB900" strokeWidth="2.8" fill="#080808" />
      <circle cx="46" cy="39" r="6.5" stroke="#FFB900" strokeWidth="2.8" fill="#080808" />
      <path d="M2 20H6M4 32H8" stroke="#FFB900" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function QualityBadgeIcon() {
  return (
    <svg viewBox="0 0 56 56" className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" fill="none">
      <path
        d="M28 6L33.5 9.5L40 9L43 15L49 18L48.5 24.5L52 30L48.5 35.5L49 42L43 45L40 51L33.5 50.5L28 54L22.5 50.5L16 51L13 45L7 42L7.5 35.5L4 30L7.5 24.5L7 18L13 15L16 9L22.5 9.5L28 6Z"
        stroke="#FFB900"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M28 19L30.8 24.8L37.2 25.7L32.6 30.2L33.7 36.5L28 33.5L22.3 36.5L23.4 30.2L18.8 25.7L25.2 24.8L28 19Z"
        stroke="#FFB900"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M21 49L18 55L24 52M35 49L38 55L32 52"
        stroke="#FFB900"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HappySmileIcon() {
  return (
    <svg viewBox="0 0 52 52" className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" fill="none">
      <circle cx="26" cy="26" r="21" stroke="#FFB900" strokeWidth="2.8" />
      <circle cx="19" cy="21" r="2.5" fill="#FFB900" />
      <circle cx="33" cy="21" r="2.5" fill="#FFB900" />
      <path
        d="M16 29C18.5 35.5 33.5 35.5 36 29"
        stroke="#FFB900"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] w-full flex-col justify-between overflow-x-clip bg-[#070707] text-white select-none lg:min-h-[calc(100svh-4rem)]">
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Titan+One&display=swap');
        .font-script-brush { font-family: 'Caveat', cursive; }
        .font-pizza-heavy { font-family: 'Titan One', Impact, sans-serif; }
      `}</style>

      {/* Ambient Glow & Gradient Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_55%,rgba(255,110,15,0.22),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#070707] via-[#070707]/85 to-transparent lg:block" />

      {/* Desktop Full-Bleed Right Pizza Visual */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] lg:block">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=90"
          alt="Delicious cheesy pepperoni pizza"
          className="h-full w-full object-cover object-right"
        />
        {/* Smooth Blending Masks */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-[#070707]/50" />

        {/* White Splash Doodles (Desktop) */}
        <svg
          viewBox="0 0 60 60"
          className="absolute right-[4%] top-[44%] h-12 w-12 text-white"
          fill="currentColor"
        >
          <path d="M12 22C24 14 38 12 44 16C48 19 30 24 12 22Z" />
          <path d="M14 31C28 29 44 31 48 36C50 40 30 37 14 31Z" />
          <path d="M12 40C22 44 34 50 36 54C37 57 22 49 12 40Z" />
        </svg>
      </div>

      {/* Main Responsive Container */}
      <main className="relative z-20 mx-auto flex w-full max-w-[1540px] flex-1 flex-col justify-between px-4 pb-8 pt-5 sm:px-8 sm:pt-7 lg:px-14 lg:pb-10 lg:pt-8">
        {/* 1. HEADER: Brand Logo + Top-Right Slogan */}
        <header className="flex w-full items-center justify-between gap-2">
          <Link href="/" className="group flex items-center gap-2.5 sm:gap-3">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <PizzaHubLogo />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold leading-none tracking-tight sm:text-3xl lg:text-[40px]">
                <span className="text-white">Pizza </span>
                <span className="text-[#ed101b]">Hub</span>
              </h2>
              <p className="mt-1 text-xs font-medium tracking-wide text-white/90 sm:text-sm lg:text-[17px]">
                Taste The Happiness
              </p>
              <svg
                viewBox="0 0 140 16"
                className="ml-14 mt-0.5 h-2.5 w-20 sm:ml-20 sm:h-3 sm:w-28 lg:ml-24 lg:w-32"
                fill="none"
              >
                <path
                  d="M2 10C45 2 95 2 138 11C95 7 45 7 2 10Z"
                  fill="#ed101b"
                />
              </svg>
            </div>
          </Link>

          {/* Slogan (Scales smoothly on mobile & desktop without colliding) */}
          <div className="-rotate-6 text-right lg:mr-12">
            <p className="font-script-brush text-2xl font-bold leading-[0.85] text-white sm:text-3xl lg:text-[46px]">
              Good Food
            </p>
            <p className="font-script-brush mt-0.5 text-2xl font-bold leading-[0.85] text-[#ffb900] sm:text-3xl lg:text-[48px]">
              Good Mood
            </p>
            <svg
              viewBox="0 0 180 20"
              className="ml-auto mt-0.5 h-2.5 w-24 sm:h-3 sm:w-32 lg:mt-1 lg:h-3.5 lg:w-44"
              fill="none"
            >
              <path
                d="M4 16C55 3 125 2 176 9C125 6 55 8 4 16Z"
                fill="#ffb900"
              />
            </svg>
          </div>
        </header>

        {/* 2. CENTER HERO CONTENT */}
        <div className="my-auto flex flex-col items-center py-6 text-center lg:max-w-[650px] lg:items-start lg:py-4 lg:text-left">
          {/* Fluid Typography Wrapper */}
          <div className="relative inline-flex flex-col items-center lg:items-start">
            {/* Yellow Doodle Drops Left of "Pizza" */}
            <svg
              viewBox="0 0 60 80"
              className="pointer-events-none absolute -left-7 top-6 h-12 w-9 text-[#ffb900] sm:-left-10 sm:top-10 sm:h-16 sm:w-12 lg:-left-11 lg:top-14 lg:h-20 lg:w-14"
              fill="currentColor"
            >
              <path d="M44 26C36 16 28 8 33 4C38 1 46 14 44 26Z" />
              <path d="M36 42C22 36 8 32 10 26C12 20 26 30 36 42Z" />
              <path d="M36 58C24 62 12 68 10 62C8 56 22 54 36 58Z" />
            </svg>

            {/* "Delicious" Fluid Script */}
            <p
              className="font-script-brush relative z-20 -mb-4 text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-none tracking-wide text-white sm:-mb-6 lg:ml-24 lg:-mb-9"
              style={{
                textShadow:
                  "0 4px 14px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)",
              }}
            >
              Delicious
            </p>

            {/* "Pizza" Fluid Heavy Display */}
            <h1
              className="font-pizza-heavy relative z-10 -rotate-3 text-[clamp(4.25rem,14vw,9.8rem)] leading-[0.92] tracking-tight text-[#ffb900]"
              style={{
                textShadow: "4px 6px 0px rgba(0,0,0,0.65)",
              }}
            >
              Pizza
            </h1>

            {/* Curved Yellow Swoosh under "Pizza" */}
            <svg
              viewBox="0 0 340 26"
              className="-mt-1 h-4 w-[clamp(13rem,45vw,22.5rem)] sm:h-5 lg:ml-28"
              fill="none"
            >
              <path
                d="M4 21C105 3 230 2 336 13C230 8 105 11 4 21Z"
                fill="#ffb900"
              />
            </svg>

            {/* "Makes Everything Better!" */}
            <div className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2.5 lg:justify-start lg:pl-4">
              <span className="font-script-brush text-[clamp(2rem,5.2vw,3.5rem)] font-semibold leading-tight text-white">
                Makes Everything
              </span>
              <div className="inline-flex flex-col items-center lg:items-start">
                <span className="font-script-brush text-[clamp(2.1rem,5.4vw,3.65rem)] font-bold leading-tight text-[#ed101b]">
                  Better!
                </span>
                <svg
                  viewBox="0 0 150 16"
                  className="-mt-1 h-2.5 w-24 sm:h-3 sm:w-32 lg:w-36"
                  fill="none"
                >
                  <path
                    d="M2 12C48 3 102 2 148 8C102 6 48 8 2 12Z"
                    fill="#ed101b"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Order Now CTA Button */}
          <div className="mt-6 sm:mt-8 lg:pl-10">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-3 rounded-full bg-[#e50916] py-2.5 pl-6 pr-2.5 text-base font-bold text-white shadow-[0_10px_30px_rgba(229,9,22,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff1624] sm:gap-4 sm:py-3 sm:pl-9 sm:pr-3 sm:text-[22px]"
            >
              <span>Order Now</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#e50916] transition-transform duration-300 group-hover:translate-x-1 sm:size-10">
                <ArrowRight size={20} strokeWidth={3} />
              </span>
            </Link>
          </div>

          {/* Mobile & Tablet Pizza Showcase (Prevents overlap on screens < 1024px) */}
          <div className="relative mt-8 h-[240px] w-full max-w-[540px] overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(255,100,0,0.18)] sm:h-[320px] lg:hidden">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=90"
              alt="Delicious cheesy pepperoni pizza"
              className="h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070707]/80 via-transparent to-transparent" />
          </div>
        </div>

        {/* 3. BOTTOM FEATURES BAR (Responsive 3-Column Grid on Mobile, Flex Row on Desktop) */}
        <footer className="relative z-20 mt-4 grid w-full grid-cols-3 divide-x-2 divide-[#ffb900] pt-2 sm:max-w-[560px] lg:mt-0 lg:flex lg:max-w-none lg:items-center lg:divide-x-0 lg:pl-4">
          {/* Feature 1 */}
          <div className="flex flex-col items-center justify-center gap-1.5 px-2 text-center sm:flex-row sm:justify-start sm:gap-3 sm:px-0 sm:pr-6 sm:text-left lg:pr-7">
            <ScooterIcon />
            <p className="text-xs font-bold leading-tight text-white sm:text-base lg:text-[17px]">
              Fast
              <br />
              Delivery
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center justify-center gap-1.5 px-2 text-center sm:flex-row sm:justify-start sm:gap-3 sm:px-6 sm:text-left lg:border-l-2 lg:border-[#ffb900] lg:px-7">
            <QualityBadgeIcon />
            <p className="text-xs font-bold leading-tight text-white sm:text-base lg:text-[17px]">
              Best
              <br />
              Quality
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center justify-center gap-1.5 px-2 text-center sm:flex-row sm:justify-start sm:gap-3 sm:px-0 sm:pl-6 sm:text-left lg:border-l-2 lg:border-[#ffb900] lg:pl-7">
            <HappySmileIcon />
            <p className="text-xs font-bold leading-tight text-white sm:text-base lg:text-[17px]">
              Happy
              <br />
              Customers
            </p>
          </div>
        </footer>
      </main>

      {/* Bottom-Left Red Curved Corner Shape */}
      <svg
        viewBox="0 0 260 120"
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-12 w-24 sm:h-16 sm:w-36 lg:h-24 lg:w-56"
        fill="none"
      >
        <path d="M0 0C55 68 155 104 260 120H0V0Z" fill="#e50916" />
      </svg>
    </section>
  );
}