import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about KEYRA, trusted identity, or getting started? Reach out and we will point you in the right direction.",
};

export default function ContactPage() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-keyra-ink">
              We’re here to help
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-keyra-muted">
              Questions about KEYRA, trusted identity, or getting started?
              Share a few details and we will point you in the right direction.
            </p>
          </div>
        </FadeIn>

        <FadeIn className="mt-12 rounded-3xl border border-keyra-border/20 bg-keyra-surface p-8 text-left sm:p-10">
          <form className="space-y-6" action="#" method="post">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-keyra-ink"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-keyra-border/20 bg-keyra-surface px-4 py-3 text-sm text-keyra-ink outline-none transition placeholder:text-keyra-muted/70 focus:border-keyra-accent focus:ring-2 focus:ring-keyra-accent/20"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-keyra-ink"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-keyra-border/20 bg-keyra-surface px-4 py-3 text-sm text-keyra-ink outline-none transition placeholder:text-keyra-muted/70 focus:border-keyra-accent focus:ring-2 focus:ring-keyra-accent/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-keyra-ink"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-keyra-border/20 bg-keyra-surface px-4 py-3 text-sm text-keyra-ink outline-none transition placeholder:text-keyra-muted/70 focus:border-keyra-accent focus:ring-2 focus:ring-keyra-accent/20"
                  placeholder="+353 ..."
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-keyra-ink"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-keyra-border/20 bg-keyra-surface px-4 py-3 text-sm text-keyra-ink outline-none transition focus:border-keyra-accent focus:ring-2 focus:ring-keyra-accent/20"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  <option value="general">General question</option>
                  <option value="getting-started">Getting started</option>
                  <option value="waitlist">Join waitlist</option>
                  <option value="partnership">Partnership or integration</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-keyra-ink"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full resize-y rounded-xl border border-keyra-border/20 bg-keyra-surface px-4 py-3 text-sm text-keyra-ink outline-none transition placeholder:text-keyra-muted/70 focus:border-keyra-accent focus:ring-2 focus:ring-keyra-accent/20"
                  placeholder="Tell us how we can help..."
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-keyra-border/20 pt-5">
              <p className="text-xs text-keyra-muted">
                Prefer email? Contact{" "}
                <a
                  href="mailto:hello@keyra.ie"
                  className="font-medium text-keyra-accent underline-offset-4 hover:underline"
                >
                  hello@keyra.ie
                </a>
              </p>
              <button
                type="submit"
                className="inline-flex rounded-full bg-keyra-accent px-6 py-3 text-sm font-semibold text-keyra-surface transition hover:bg-keyra-muted"
              >
                Send message
              </button>
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
