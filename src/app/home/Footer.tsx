
import Link from "next/link";

import {
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Heart,
  Pizza,
  Clock,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "Our Menu", href: "/menu" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const serviceLinks = [
  { name: "Order Pizza", href: "/menu" },
  { name: "Become a Vendor", href: "/sign-up" },
  { name: "My Account", href: "/sign-in" },
  { name: "Help & Support", href: "/contact" },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: FaFacebookF,
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: FaInstagram,
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: FaYoutube,
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#08090b] text-white">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative mx-auto max-w-375 px-5 sm:px-8 lg:px-12">
        {/* Main Footer */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:py-20">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <Pizza size={24} />
              </span>

              <span className="text-3xl font-extrabold tracking-tight">
                Pizza<span className="text-emerald-500">Hub.</span>
              </span>
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-7 text-white/50">
              Freshly baked happiness, delivered hot to your door.
              Discover amazing flavors and support your favorite
              local pizza makers with PizzaHub.
            </p>

            {/* Social Links */}
            <div className="mt-7 flex items-center gap-3">
              {socialLinks.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-emerald-600 hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-7 text-base font-bold">
              Explore
            </h3>

            <div className="flex flex-col gap-4">
              {exploreLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-2 text-sm text-white/50 transition-colors duration-300 hover:text-emerald-400"
                >
                  <ArrowRight
                    size={14}
                    className="-ml-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-7 text-base font-bold">
              Our Services
            </h3>

            <div className="flex flex-col gap-4">
              {serviceLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-2 text-sm text-white/50 transition-colors duration-300 hover:text-emerald-400"
                >
                  <ArrowRight
                    size={14}
                    className="-ml-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-7 text-base font-bold">
              Get In Touch
            </h3>

            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <MapPin
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <p className="text-sm leading-6 text-white/50">
                  Dhaka, Bangladesh
                </p>
              </div>

              <a
                href="mailto:support@pizzahub.com"
                className="flex items-center gap-3 text-sm text-white/50 transition-colors hover:text-emerald-400"
              >
                <Mail
                  size={19}
                  className="shrink-0 text-emerald-400"
                />
                support@pizzahub.com
              </a>

              <a
                href="tel:+8801234567890"
                className="flex items-center gap-3 text-sm text-white/50 transition-colors hover:text-emerald-400"
              >
                <Phone
                  size={19}
                  className="shrink-0 text-emerald-400"
                />
                +880 1234-567890
              </a>

              <div className="flex items-center gap-3 text-sm text-white/50">
                <Clock
                  size={19}
                  className="shrink-0 text-emerald-400"
                />
                Always ready for your cravings
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mb-12 flex flex-col justify-between gap-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/70 via-[#10251e] to-[#111a17] p-7 sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-emerald-400">
              YOUR NEXT FAVORITE SLICE
            </p>

            <h3 className="mt-2 text-xl font-bold sm:text-2xl">
              Hungry? Let's fix that!
            </h3>

            <p className="mt-2 text-sm text-white/50">
              Explore delicious pizzas and find your perfect match.
            </p>
          </div>

          <Link
            href="/menu"
            className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-xl"
          >
            Explore Menu

            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Copyright */}
        <div className="flex flex-col justify-between gap-4 border-t border-white/10 py-7 text-center text-xs text-white/40 sm:flex-row sm:items-center sm:text-left">
          <p>
            © {new Date().getFullYear()} PizzaHub. All rights reserved.
          </p>

          <p className="inline-flex items-center justify-center gap-1.5">
            Made with
            <Heart
              size={13}
              className="fill-red-500 text-red-500"
            />
            for pizza lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
