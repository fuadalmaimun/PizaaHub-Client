"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";

import AuthLayout from "../AuthLayout";
import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(dashboardPath(session.user.role));
    }
  }, [isPending, session, router]);

  function validate(): boolean {
    const nextErrors: typeof errors = {};
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Password is required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message ?? "Sign in failed. Please try again.");
        return;
      }

      toast.success("Signed in successfully!");
      router.push(dashboardPath(data?.user?.role));
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold tracking-[0.16em] text-emerald-400">
          WELCOME BACK!
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Sign In
        </h1>
        <p className="mt-2 text-sm leading-5 text-white/60">
          Sign in to continue your delicious journey with PizzaHub.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="email"
              className="sr-only"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45"
                size={16}
              />
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={!!errors.email}
                className="h-10 border-white/15 bg-white/2.5 pl-10 text-sm text-white placeholder:text-white/45 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
              />
            </div>
            {errors.email && (
              <p role="alert" className="mt-1 text-xs text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <LockKeyhole
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45"
                size={16}
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={!!errors.password}
                className="h-10 border-white/15 bg-white/2.5 pl-10 pr-11 text-sm text-white placeholder:text-white/45 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-white/50 transition hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p role="alert" className="mt-1 text-xs text-red-400">
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="mt-2 h-10 w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          <p className="pt-1 text-center text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
