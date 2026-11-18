
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      data-theme-lock="dark"
      className="border-t border-white/10 bg-[#080808] text-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-3xl font-bold">
              Pizza<span className="text-emerald-500">Hub.</span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-gray-400">
              Freshly baked happiness, delivered hot to your door.
              Experience the taste of perfection with PizzaHub.
            </p>

            <div className="mt-6 flex gap-3">
              {["Facebook", "Instagram", "YouTube"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="rounded-full border border-white/15 px-3 py-2 text-xs text-gray-300 transition hover:border-emerald-500 hover:text-emerald-500"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-semibold">Explore</h3>

            <div className="flex flex-col gap-4 text-sm text-gray-400">
              <Link href="/" className="hover:text-emerald-500">Home</Link>
              <Link href="/menu" className="hover:text-emerald-500">Our Menu</Link>
              <Link href="/about" className="hover:text-emerald-500">About Us</Link>
              <Link href="/contact" className="hover:text-emerald-500">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-semibold">Our Services</h3>

            <div className="flex flex-col gap-4 text-sm text-gray-400">
              <Link href="/menu" className="hover:text-emerald-500">Order Pizza</Link>
              <Link href="/sign-up" className="hover:text-emerald-500">Become a Vendor</Link>
              <Link href="/sign-in" className="hover:text-emerald-500">My Account</Link>
              <Link href="/contact" className="hover:text-emerald-500">Help & Support</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-semibold">Get in Touch</h3>

            <div className="space-y-4 text-sm text-gray-400">
              <p>Dhaka, Bangladesh</p>
              <p>support@pizzahub.com</p>
              <p>+880 1234-567890</p>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">
                We are ready to serve you!
              </p>

              <Link
                href="/menu"
                className="inline-block rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold transition hover:bg-emerald-500"
              >
                Explore Menu →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-sm text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} PizzaHub. All rights reserved.</p>

          <p>
            Made with <span className="text-red-500">♥</span> for pizza lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
