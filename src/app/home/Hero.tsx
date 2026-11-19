import Image from "next/image";
import Link from "next/link";
import { Caveat, Titan_One } from "next/font/google";
import { ArrowRight } from "lucide-react";

const scriptFont = Caveat({
  variable: "--font-hero-script",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const displayFont = Titan_One({
  variable: "--font-hero-display",
  subsets: ["latin"],
  weight: "400",
});

/* Custom Logo SVG matching the dripping cheese pizza slice in the design */
function PizzaHubLogo() {
  return (
    <svg
      viewBox="0 0 110 100"
      className="h-14 w-16 shrink-0 sm:h-16 sm:w-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red Outer Crust */}
      <path
        d="M12 58C10 30 35 8 68 12C90 15 104 32 106 54C107 58 103 61 99 60L94 58C92 38 78 24 60 22C38 20 22 36 22 56L16 61C13 62 12 60 12 58Z"
        fill="#E50916"
      />
      {/* Yellow Cheese Base with Drips */}
      <path
        d="M24 55C24 38 39 25 58 26C75 27 89 40 91 57L76 62C74 62 73 65 73 68V74C73 77 69 77 69 74V67C69 65 67 64 65 65L56 68C54 69 53 71 53 74V84C53 88 47 88 47 84V73C47 71 45 70 43 71L38 73C36 74 35 76 35 79V82C35 85 30 85 30 82V74C30 71 28 70 26 71L21 73C18 74 16 71 18 68L24 55Z"
        fill="#FFB900"
      />
      {/* Slice Cut Lines */}
      <path
        d="M58 26L46 69M58 26L72 63"
        stroke="#080808"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Pepperoni Toppings */}
      <circle cx="44" cy="45" r="5" fill="#E50916" />
      <circle cx="62" cy="42" r="4.5" fill="#E50916" />
      <circle cx="77" cy="49" r="4.5" fill="#E50916" />
      <circle cx="33" cy="58" r="3.5" fill="#E50916" />
      <circle cx="57" cy="56" r="3.5" fill="#E50916" />
    </svg>
  );
}

/* Custom Icons matching the bottom 3 features */
function ScooterIcon() {
  return (
    <svg viewBox="0 0 64 52" className="h-10 w-12 shrink-0 sm:h-11 sm:w-14" fill="none">
      {/* Delivery Box */}
      <rect x="8" y="10" width="16" height="14" rx="2" stroke="#FFB900" strokeWidth="2.8" />
      <path d="M12 15H20" stroke="#FFB900" strokeWidth="2.5" strokeLinecap="round" />
      {/* Scooter Body */}
      <path
        d="M10 28H28L34 16H42M38 16L46 34M12 36H48C50 36 52 34 52 32C52 28 48 26 44 26H35"
        stroke="#FFB900"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <circle cx="17" cy="39" r="6.5" stroke="#FFB900" strokeWidth="2.8" fill="#080808" />
      <circle cx="46" cy="39" r="6.5" stroke="#FFB900" strokeWidth="2.8" fill="#080808" />
      {/* Speed Lines */}
      <path d="M2 20H6M4 32H8" stroke="#FFB900" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function QualityBadgeIcon() {
  return (
    <svg viewBox="0 0 56 56" className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" fill="none">
      {/* Scalloped Rosette */}
      <path
        d="M28 6L33.5 9.5L40 9L43 15L49 18L48.5 24.5L52 30L48.5 35.5L49 42L43 45L40 51L33.5 50.5L28 54L22.5 50.5L16 51L13 45L7 42L7.5 35.5L4 30L7.5 24.5L7 18L13 15L16 9L22.5 9.5L28 6Z"
        stroke="#FFB900"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Inner Star */}
      <path
        d="M28 19L30.8 24.8L37.2 25.7L32.6 30.2L33.7 36.5L28 33.5L22.3 36.5L23.4 30.2L18.8 25.7L25.2 24.8L28 19Z"
        stroke="#FFB900"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Ribbons */}
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
    <svg viewBox="0 0 52 52" className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" fill="none">
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
    <section
      data-theme="hero"
      className={`${scriptFont.variable} ${displayFont.variable} relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-[#070707] text-white`}
    >

      {/* Dark Textured Vignette & Warm Glow behind Pizza */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_58%,rgba(255,110,15,0.22),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/90 to-transparent lg:via-[#070707]/75" />

      {/* Right Side Full-Bleed Pizza Visual */}
      <div className="relative mx-auto mt-4 h-[340px] w-full sm:h-[440px] lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-full lg:w-[64%]">
        <Image
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=90"
          alt="Delicious cheesy pepperoni pizza"
          fill
          preload
          sizes="(max-width: 1024px) 100vw, 64vw"
          className="object-cover object-center lg:object-right"
        />
        {/* Smooth blend mask into left black background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-[#070707]/60 lg:bg-gradient-to-r lg:from-[#070707] lg:via-[#070707]/35 lg:to-transparent" />

        {/* White Comic Splash Doodles near Cheese Pull (Right side) */}
        <svg
          viewBox="0 0 60 60"
          className="pointer-events-none absolute right-[4%] top-[44%] hidden h-12 w-12 text-white lg:block"
          fill="currentColor"
        >
          <path d="M12 22C24 14 38 12 44 16C48 19 30 24 12 22Z" />
          <path d="M14 31C28 29 44 31 48 36C50 40 30 37 14 31Z" />
          <path d="M12 40C22 44 34 50 36 54C37 57 22 49 12 40Z" />
        </svg>
      </div>

      {/* Main Content Wrapper */}
      <main className="relative z-20 mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1540px] flex-col justify-between px-6 pb-8 pt-6 sm:px-10 lg:px-14 lg:pb-10 lg:pt-8">
        {/* TOP BAR: Logo (Left) & Slogan (Right) */}
        <div className="flex items-start justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <PizzaHubLogo />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold leading-none tracking-tight sm:text-[42px]">
                <span className="text-white">Pizza </span>
                <span className="text-[#ed101b]">Hub</span>
              </h2>
              <p className="mt-1 text-sm font-medium tracking-wide text-white/90 sm:text-[17px]">
                Taste The Happiness
              </p>
              {/* Curved Red Swoosh under "Happiness" */}
              <svg
                viewBox="0 0 140 16"
                className="ml-20 mt-0.5 h-3 w-28 sm:ml-24 sm:w-32"
                fill="none"
              >
                <path
                  d="M2 10C45 2 95 2 138 11C95 7 45 7 2 10Z"
                  fill="#ed101b"
                />
              </svg>
            </div>
          </Link>

          {/* Top-Right Hand-Lettered Slogan */}
          <div className="hidden -rotate-6 text-right sm:block lg:mr-14 lg:mt-1">
            <p className="font-script-brush text-4xl font-bold leading-[0.85] text-white lg:text-[46px]">
              Good Food
            </p>
            <p className="font-script-brush mt-0.5 text-4xl font-bold leading-[0.85] text-[#ffb900] lg:text-[48px]">
              Good Mood
            </p>
            {/* Curved Yellow Underline */}
            <svg
              viewBox="0 0 180 20"
              className="ml-auto mt-1 h-3.5 w-36 lg:w-44"
              fill="none"
            >
              <path
                d="M4 16C55 3 125 2 176 9C125 6 55 8 4 16Z"
                fill="#ffb900"
              />
            </svg>
          </div>
        </div>

        {/* CENTER HERO TYPOGRAPHY & CTA */}
        <div className="my-auto py-8 lg:max-w-[650px] lg:py-4">
          <div className="relative inline-block">
            {/* Yellow Doodle Drops Left of "Pizza" */}
            <svg
              viewBox="0 0 60 80"
              className="pointer-events-none absolute -left-8 top-10 hidden h-16 w-12 text-[#ffb900] sm:block lg:-left-11 lg:top-14 lg:h-20 lg:w-14"
              fill="currentColor"
            >
              <path d="M44 26C36 16 28 8 33 4C38 1 46 14 44 26Z" />
              <path d="M36 42C22 36 8 32 10 26C12 20 26 30 36 42Z" />
              <path d="M36 58C24 62 12 68 10 62C8 56 22 54 36 58Z" />
            </svg>

            {/* "Delicious" Brush Script */}
            <p
              className="font-script-brush relative z-20 ml-12 -mb-6 text-5xl font-bold tracking-wide text-white sm:ml-20 sm:-mb-8 sm:text-7xl lg:ml-24 lg:-mb-10 lg:text-[88px]"
              style={{
                textShadow:
                  "0 4px 14px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)",
              }}
            >
              Delicious
            </p>

            {/* Giant Chunky "Pizza" */}
            <h1
              className="font-pizza-heavy relative z-10 -rotate-3 text-[5.2rem] leading-[0.92] tracking-tight text-[#ffb900] sm:text-[7.5rem] lg:text-[9.8rem]"
              style={{
                textShadow: "4px 6px 0px rgba(0,0,0,0.65)",
              }}
            >
              Pizza
            </h1>

            {/* Curved Yellow Swoosh under "Pizza" */}
            <svg
              viewBox="0 0 340 26"
              className="ml-16 -mt-1 h-5 w-64 sm:ml-24 sm:w-80 lg:ml-28 lg:w-[360px]"
              fill="none"
            >
              <path
                d="M4 21C105 3 230 2 336 13C230 8 105 11 4 21Z"
                fill="#ffb900"
              />
            </svg>

            {/* "Makes Everything Better!" */}
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 pl-2 sm:pl-4">
              <span className="font-script-brush text-4xl font-semibold text-white sm:text-5xl lg:text-[56px]">
                Makes Everything
              </span>
              <div className="inline-flex flex-col">
                <span className="font-script-brush text-4xl font-bold text-[#ed101b] sm:text-5xl lg:text-[58px]">
                  Better!
                </span>
                {/* Red Underline under "Better!" */}
                <svg
                  viewBox="0 0 150 16"
                  className="-mt-1 h-3 w-28 sm:w-36"
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

          {/* Order Now Pill Button */}
          <div className="mt-7 pl-4 sm:mt-8 sm:pl-10">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-4 rounded-full bg-[#e50916] py-2.5 pl-8 pr-2.5 text-lg font-bold text-white shadow-[0_10px_30px_rgba(229,9,22,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff1624] sm:py-3 sm:pl-9 sm:pr-3 sm:text-[22px]"
            >
              <span>Order Now</span>
              <span className="flex size-9 items-center justify-center rounded-full bg-white text-[#e50916] transition-transform duration-300 group-hover:translate-x-1 sm:size-10">
                <ArrowRight size={22} strokeWidth={3} />
              </span>
            </Link>
          </div>
        </div>

        {/* BOTTOM FEATURES BAR */}
        <div className="relative z-20 flex flex-wrap items-center gap-y-4 pt-2 sm:pl-4">
          {/* Feature 1 */}
          <div className="flex items-center gap-3 pr-5 sm:pr-7">
            <ScooterIcon />
            <p className="text-sm font-bold leading-tight text-white sm:text-[17px]">
              Fast
              <br />
              Delivery
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3 border-l-2 border-[#ffb900] px-5 sm:px-7">
            <QualityBadgeIcon />
            <p className="text-sm font-bold leading-tight text-white sm:text-[17px]">
              Best
              <br />
              Quality
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3 border-l-2 border-[#ffb900] pl-5 sm:pl-7">
            <HappySmileIcon />
            <p className="text-sm font-bold leading-tight text-white sm:text-[17px]">
              Happy
              <br />
              Customers
            </p>
          </div>
        </div>
      </main>

      {/* Bottom-Left Red Curved Corner Shape */}
      <svg
        viewBox="0 0 260 120"
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-16 w-36 sm:h-24 sm:w-56"
        fill="none"
      >
        <path d="M0 0C55 68 155 104 260 120H0V0Z" fill="#e50916" />
      </svg>
    </section>
  );
}