import type { Metadata } from "next";
import { Chewy, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";
import Footer from "./home/Footer";
import Navbar from "./home/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const chewy = Chewy({
  variable: "--font-chewy",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "PizzaHub — Pizza Ordering & Delivery Platform",
  description:
    "Order hot & fresh pizza from local pizza shops, or sell your own pizza on PizzaHub.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${chewy.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-[#08090b]">
        <ThemeProvider>
          <div className="sticky top-0 z-50 mx-auto w-full max-w-375 px-5 pt-4 sm:px-8 lg:px-12">
            <Navbar />
          </div>
          <div className="flex-1">{children}</div>
          <Toaster position="bottom-right" richColors />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
