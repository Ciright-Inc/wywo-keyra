import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  return (
    <div className="bg-keyra-bg px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-[520px]">
        <h1 className="text-[36px] font-bold tracking-tight text-keyra-primary sm:text-[44px]">
          Create your account
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
          Set up Keyra once. Feel protected every day.
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
              <Link href="/onboarding/verify" className="block">
                <Button className="w-full">Continue</Button>
              </Link>
              <p className="mt-3 text-center text-[14px] text-keyra-text-2">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-keyra-primary underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-keyra-primary underline">
                  Privacy
                </Link>
                .
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

