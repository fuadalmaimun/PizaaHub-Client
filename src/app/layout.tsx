import type { Metadata } from "next";
import { Chewy, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

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
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
