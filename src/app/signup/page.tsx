import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { NEW_TAB_LINK } from "@/lib/newTabLink";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  return (
    <div className="bg-keyra-bg px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-[520px]">
        <h1 className="text-3xl font-bold tracking-tight text-keyra-primary sm:text-[36px] lg:text-[44px]">
          Protect your identity
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
          <span className="text-keyra-primary">Be Protected Online.</span> Start
          with a simple step.
        </p>

        <Card className="mt-10 p-7">
          <form className="space-y-5">
            <Input id="name" label="Name" placeholder="Your name" required />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />

            <div className="pt-2">
              <ButtonLink href="/onboarding/verify" className="block w-full">
                Continue
              </ButtonLink>
              <p className="mt-3 text-center text-[13px] leading-relaxed text-keyra-text-2">
                By continuing, you agree to the{" "}
                <Link href="/terms" {...NEW_TAB_LINK} className="text-keyra-text-2 underline underline-offset-2 hover:text-keyra-primary">
                  Keyra Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" {...NEW_TAB_LINK} className="text-keyra-text-2 underline underline-offset-2 hover:text-keyra-primary">
                  Privacy Principles
                </Link>
                , and acknowledge that trusted digital systems require informed participation
                and shared responsibility.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

