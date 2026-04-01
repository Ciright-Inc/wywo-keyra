import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about KERYA? We are here to help.",
};

export default function ContactPage() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="text-center">
            <h1 className="text-[36px] font-semibold tracking-tight text-kerya-text sm:text-[44px]">
              We’re here to help
            </h1>
            <p className="mt-6 text-[16px] leading-relaxed text-kerya-text-2 sm:text-[18px]">
              Questions about KERYA or getting started?
              Share a few details and we will point you in the right direction.
            </p>
          </div>
        </FadeIn>

        <FadeIn className="kerya-card mt-12 text-left sm:p-10">
          <form className="space-y-6" action="#" method="post">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  id="name"
                  name="name"
                  label="Name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <Input
                  id="phone"
                  name="phone"
                  label="Phone number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+353 ..."
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-kerya-text"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue=""
                  className="h-12 w-full rounded-[var(--k-radius-card)] border border-kerya-border bg-kerya-surface px-4 text-[16px] text-kerya-text outline-none transition focus-visible:kerya-focus"
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
                  className="mb-2 block text-sm font-medium text-kerya-text"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full resize-y rounded-[var(--k-radius-card)] border border-kerya-border bg-kerya-surface px-4 py-3 text-[16px] text-kerya-text outline-none transition placeholder:text-kerya-text-2 focus-visible:kerya-focus"
                  placeholder="Tell us how we can help..."
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kerya-border pt-5">
              <p className="text-xs text-kerya-text-2">
                Prefer email? Contact{" "}
                <a
                  href="mailto:hello@keyra.ie"
                  className="font-medium text-kerya-accent underline-offset-4 hover:underline"
                >
                  hello@keyra.ie
                </a>
              </p>
              <Button type="submit">
                Send message
              </Button>
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
