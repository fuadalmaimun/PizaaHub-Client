import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Pizza } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

const heroImage =
  "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1600&q=85";

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex flex-1 bg-[#070809] px-3 py-3 text-white sm:px-5 sm:py-5">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#090a0b] shadow-[0_24px_100px_rgba(0,0,0,0.55)]">
        <div className="grid flex-1 md:grid-cols-[1.02fr_0.98fr]">
          <section className="relative flex min-h-[380px] flex-col justify-between overflow-hidden px-6 py-6 sm:px-9 sm:py-8 md:min-h-0 lg:px-10">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 52vw"
              unoptimized
              className="object-cover object-center opacity-75"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.12)_37%,rgba(0,0,0,0.88)_100%),linear-gradient(90deg,rgba(0,0,0,0.45),transparent_85%)]"
            />
            <div
              aria-hidden="true"
              className="absolute -left-20 top-24 h-56 w-56 rounded-full bg-emerald-600/25 blur-[90px]"
            />

            <Link
              href="/"
              className="relative z-10 inline-flex w-fit items-center gap-2 text-lg font-extrabold tracking-tight"
            >
              <Pizza aria-hidden="true" className="text-amber-400" size={29} />
              <span>
                Pizza<span className="text-emerald-400">Hub.</span>
              </span>
            </Link>

            <div className="relative z-10 mt-16 max-w-lg md:mb-12 md:mt-0">
              <p className="mb-2 text-xs font-bold tracking-[0.18em] text-emerald-400 sm:text-sm">
                TASTE THE DIFFERENCE
              </p>
              <h2
                className="text-4xl leading-[1.05] text-white sm:text-5xl"
                style={{ fontFamily: "var(--font-chewy)" }}
              >
                Every Slice
                <br />
                Tells a Story.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
                Fresh ingredients, amazing flavors and happiness delivered
                straight to your door.
              </p>
              <span
                aria-hidden="true"
                className="mt-5 block h-1 w-24 -rotate-2 rounded-full bg-emerald-500"
              />
            </div>
          </section>

          <section className="flex items-center justify-center border-t border-white/10 px-4 py-8 sm:px-8 md:border-l md:border-t-0 lg:px-12">
            <div className="w-full max-w-[440px] rounded-2xl border border-white/15 bg-white/2.5 px-5 py-6 shadow-xl shadow-black/20 sm:px-7 sm:py-8">
              {children}
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}
