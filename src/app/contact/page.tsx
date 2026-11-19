
"use client";

import { useState } from "react";
import Link from "next/link";

const contactInfo = [
  {
    title: "Email Us",
    value: "hello@pizzahub.com",
    description: "Send us an email anytime.",
    href: "mailto:hello@pizzahub.com",
  },
  {
    title: "Call Us",
    value: "+880 1234-567890",
    description: "We're happy to hear from you.",
    href: "tel:+8801234567890",
  },
  {
    title: "Our Location",
    value: "Dhaka, Bangladesh",
    description: "Serving pizza lovers everywhere.",
    href: "https://www.google.com/maps/search/?api=1&query=Dhaka+Bangladesh",
  },
  {
    title: "Working Hours",
    value: "Every Day",
    description: "We're here whenever you need us.",
    href: null,
  },
];

const faqs = [
  {
    question: "How can I place an order?",
    answer:
      "Explore our menu, choose your favorite items, add them to your cart, and complete the checkout process.",
  },
  {
    question: "How can I become a vendor?",
    answer:
      "You can create a vendor account through our registration process and start managing your menu after approval, if required.",
  },
  {
    question: "Can I pay online?",
    answer:
      "Yes! PizzaHub supports online payments through Stripe for a convenient checkout experience.",
  },
  {
    question: "How can I get help with my order?",
    answer:
      "Contact our support team through email or phone and share your order details for assistance.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );

    window.location.href = `mailto:hello@pizzahub.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="overflow-hidden bg-background text-foreground">

      {/* Hero Section */}
      <section className="relative px-5 py-24 md:py-32">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#DDF477]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#173D32]/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full border border-[#173D32]/20 bg-[#173D32]/5 px-5 py-2 text-sm font-semibold text-[#173D32] dark:border-[#DDF477]/20 dark:bg-[#DDF477]/10 dark:text-[#DDF477]">
            We'd Love to Hear From You
          </span>

          <h1 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-7xl">
            Let's Start a
            <span className="block text-[#173D32] dark:text-[#DDF477]">
              Conversation.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
            Have a question, suggestion, or need help with your order?
            Our team is here to help. Get in touch and let's make
            your PizzaHub experience even better.
          </p>

          <Link
            href="/menu"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#173D32] px-8 py-4 font-semibold text-white transition hover:-translate-y-1 hover:bg-[#245b4b] dark:bg-[#DDF477] dark:text-[#173D32] dark:hover:bg-[#eaff9c]"
          >
            Explore Our Menu
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Contact Information */}
      <section className="border-y border-border bg-muted/30 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#173D32] dark:text-[#DDF477]">
              Contact Information
            </span>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Reach Out to Us
            </h2>

            <p className="mt-4 text-muted-foreground">
              Choose your preferred way to connect with PizzaHub.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((item, index) => (
              <div
                key={item.title}
                className="group rounded-3xl border border-border bg-card p-7 transition duration-300 hover:-translate-y-2 hover:border-[#173D32]/40 hover:shadow-xl dark:hover:border-[#DDF477]/40"
              >
                <span className="text-sm font-bold text-[#173D32]/50 dark:text-[#DDF477]/50">
                  0{index + 1}
                </span>

                <div className="my-5 h-1 w-12 rounded-full bg-[#DDF477] transition-all group-hover:w-20" />

                <h3 className="text-xl font-bold">{item.title}</h3>

                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("https") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="mt-3 block break-words font-semibold text-[#173D32] hover:underline dark:text-[#DDF477]"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-3 font-semibold text-[#173D32] dark:text-[#DDF477]">
                    {item.value}
                  </p>
                )}

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-2">

          <div className="lg:sticky lg:top-28">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#173D32] dark:text-[#DDF477]">
              Get In Touch
            </span>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">
              Have Something
              <span className="block text-[#173D32] dark:text-[#DDF477]">
                On Your Mind?
              </span>
            </h2>

            <p className="mt-7 max-w-lg text-base leading-8 text-muted-foreground">
              Whether you need assistance, want to share feedback,
              or have a business inquiry, we'd love to hear from you.
              Send us a message and we'll be happy to help.
            </p>

            <div className="mt-12 rounded-3xl bg-[#173D32] p-8 text-white sm:p-10">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#DDF477]">
                We're Here for You
              </span>

              <h3 className="mt-5 text-3xl font-extrabold">
                Your Experience Matters.
              </h3>

              <p className="mt-5 leading-8 text-white/70">
                Your feedback helps us improve. Let us know how
                we can make your next order better.
              </p>

              <a
                href="mailto:hello@pizzahub.com"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-[#DDF477] hover:underline"
              >
                Email Our Team <span>↗</span>
              </a>
            </div>

            <div className="mt-10">
              <p className="mb-5 font-bold">Follow Our Journey</p>

              <div className="flex flex-wrap gap-3">
                {["Facebook", "Instagram", "Twitter"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition hover:border-[#173D32] hover:bg-[#173D32] hover:text-white dark:hover:border-[#DDF477] dark:hover:bg-[#DDF477] dark:hover:text-[#173D32]"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10">
            <h3 className="text-2xl font-extrabold">
              Send Us a Message
            </h3>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Fill out the form below to get in touch with our team.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Your Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-border bg-background px-4 py-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-[#173D32] focus:ring-2 focus:ring-[#173D32]/10 dark:focus:border-[#DDF477]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-[#173D32] focus:ring-2 focus:ring-[#173D32]/10 dark:focus:border-[#DDF477]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  className="w-full rounded-xl border border-border bg-background px-4 py-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-[#173D32] focus:ring-2 focus:ring-[#173D32]/10 dark:focus:border-[#DDF477]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Your Message
                </label>

                <textarea
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-[#173D32] focus:ring-2 focus:ring-[#173D32]/10 dark:focus:border-[#DDF477]"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#173D32] px-6 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-[#245b4b] dark:bg-[#DDF477] dark:text-[#173D32] dark:hover:bg-[#eaff9c]"
              >
                Send Message
                <span>→</span>
              </button>

              <p className="text-center text-xs leading-6 text-muted-foreground">
                Your message will open in your default email application.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border bg-muted/30 px-5 py-20 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#173D32] dark:text-[#DDF477]">
              Common Questions
            </span>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-4 text-muted-foreground">
              Find answers to some common questions about PizzaHub.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-5 p-6 text-left font-bold transition hover:text-[#173D32] dark:hover:text-[#DDF477]"
                >
                  {faq.question}

                  <span
                    className={`text-xl transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  >
                    ↓
                  </span>
                </button>

                {openFaq === index && (
                  <div className="border-t border-border px-6 py-5 text-sm leading-7 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#173D32] px-6 py-16 text-center text-white sm:px-12 md:py-24">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border-[40px] border-white/5" />

          <div className="relative mx-auto max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-[#DDF477]">
              Your Pizza Journey Starts Here
            </span>

            <h2 className="mt-7 text-3xl font-extrabold sm:text-5xl">
              Good Times Start
              <span className="block text-[#DDF477]">
                with Great Pizza!
              </span>
            </h2>

            <p className="mt-6 leading-8 text-white/70">
              Explore our menu, discover delicious options,
              and make your next meal memorable with PizzaHub.
            </p>

            <Link
              href="/menu"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#DDF477] px-8 py-4 font-bold text-[#173D32] transition hover:-translate-y-1 hover:bg-white"
            >
              Explore Menu <span>→</span>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
