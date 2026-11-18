"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Mail,
  UserRound,
  UsersRound,
} from "lucide-react";

import AuthLayout from "../AuthLayout";
import { authClient } from "@/lib/auth-client";
import GoogleIcon from "@/components/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SignupRole = "customer" | "vendor";

/** Min 6 chars, at least one uppercase and one lowercase letter. */
function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  return null;
}

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [role, setRole] = useState<SignupRole>("customer");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("oauthError") === "google") {
      toast.error("Google sign up was cancelled or failed. Please try again.");
      router.replace("/sign-up");
    }
  }, [router]);

  const passwordHint = useMemo(() => {
    if (!password) return null;
    return [
      { label: "6+ characters", ok: password.length >= 6 },
      { label: "1 uppercase letter", ok: /[A-Z]/.test(password) },
      { label: "1 lowercase letter", ok: /[a-z]/.test(password) },
    ];
  }, [password]);

  function handleImageChange(file: File | null) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setProfileImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function validate(): boolean {
    const nextErrors: typeof errors = {};
    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 3) {
      nextErrors.fullName = "Full name must be at least 3 characters.";
    }
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      nextErrors.password = passwordError;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isGoogleSubmitting) return;
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (profileImage) {
        const uploadData = new FormData();
        uploadData.set("image", profileImage);

        const uploadResponse = await fetch("/api/images/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult: unknown = await uploadResponse.json();
        if (!uploadResponse.ok) {
          const message =
            typeof uploadResult === "object" &&
            uploadResult !== null &&
            "error" in uploadResult &&
            typeof uploadResult.error === "string"
              ? uploadResult.error
              : "Profile image upload failed.";
          toast.error(message);
          return;
        }
        if (
          typeof uploadResult !== "object" ||
          uploadResult === null ||
          !("url" in uploadResult) ||
          typeof uploadResult.url !== "string"
        ) {
          throw new Error("Image upload did not return a valid image URL.");
        }
        imageUrl = uploadResult.url;
      }

      const { error } = await authClient.signUp.email(
        {
          name: fullName.trim(),
          email: email.trim(),
          password,
          callbackURL: "/",
          ...(imageUrl ? { image: imageUrl } : {}),
        },
        { body: { role } },
      );

      if (error) {
        toast.error(error.message ?? "Signup failed. Please try again.");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    if (isSubmitting || isGoogleSubmitting) return;
    setIsGoogleSubmitting(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth/callback",
        newUserCallbackURL: "/auth/callback",
        errorCallbackURL: "/sign-up?oauthError=google",
      });

      if (error) {
        toast.error(error.message ?? "Google sign up failed. Please try again.");
        setIsGoogleSubmitting(false);
      }
    } catch {
      toast.error("Google sign up failed. Please try again.");
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-5">
        <p className="mb-1 text-xs font-bold tracking-[0.16em] text-emerald-400">
          JOIN PIZZAHUB
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Create Account
        </h1>
        <p className="mt-2 text-sm leading-5 text-white/60">
          Join PizzaHub and discover your favorite flavors.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="fullName" className="sr-only">
              Full name
            </label>
            <div className="relative">
              <UserRound
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45"
                size={16}
              />
              <Input
                id="fullName"
                placeholder="Full Name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                aria-invalid={!!errors.fullName}
                className="h-9 border-white/15 bg-white/2.5 pl-10 text-sm text-white placeholder:text-white/45 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
              />
            </div>
            {errors.fullName && (
              <p role="alert" className="mt-1 text-xs text-red-400">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="sr-only">
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
                className="h-9 border-white/15 bg-white/2.5 pl-10 text-sm text-white placeholder:text-white/45 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={!!errors.password}
                className="h-9 border-white/15 bg-white/2.5 pl-10 pr-11 text-sm text-white placeholder:text-white/45 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
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
            {errors.password ? (
              <p role="alert" className="mt-1 text-xs text-red-400">
                {errors.password}
              </p>
            ) : passwordHint ? (
              <p className="mt-1 flex flex-wrap gap-x-2 text-[10px] text-white/50">
                {passwordHint.map((rule) => (
                  <span
                    key={rule.label}
                    className={rule.ok ? "text-emerald-400" : undefined}
                  >
                    {rule.ok ? "✓" : "•"} {rule.label}
                  </span>
                ))}
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-white/50">
                Minimum 6 characters, uppercase and lowercase.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="sr-only">
              Account type
            </label>
            <div className="relative">
              <UsersRound
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45"
                size={16}
              />
              <select
                id="role"
                value={role}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === "customer" || value === "vendor") {
                    setRole(value);
                  }
                }}
                className="h-9 w-full appearance-none rounded-lg border border-white/15 bg-[#fffaf2] pl-10 pr-9 text-sm text-[#30251f] outline-none transition focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/30 dark:bg-[#101112] dark:text-white"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/45"
              >
                ▾
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="profileImage"
              className="mb-1.5 flex items-center gap-2 text-xs font-medium text-white/75"
            >
              <ImagePlus aria-hidden="true" size={15} />
              Profile Image <span className="text-white/45">(Optional)</span>
            </label>
            <div className="flex items-center gap-2">
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="size-9 shrink-0 rounded-full border border-white/20 object-cover"
                />
              )}
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleImageChange(event.target.files?.[0] ?? null)
                }
                className="h-9 cursor-pointer border-white/15 bg-white/2.5 p-1 text-xs text-white/65 file:mr-2 file:h-6 file:rounded-md file:border-0 file:bg-white/10 file:px-2 file:text-xs file:text-white hover:file:bg-white/15"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || isGoogleSubmitting}
            className="mt-1 h-10 w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

        </div>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-white/45">
        <span className="h-px flex-1 bg-white/15" />
        OR
        <span className="h-px flex-1 bg-white/15" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting || isGoogleSubmitting}
        onClick={handleGoogleSignUp}
        className="h-10 w-full border-white/15 bg-white/5 font-semibold text-[#30251f] hover:bg-white/10 dark:text-white"
      >
        {isGoogleSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        {isGoogleSubmitting ? "Connecting to Google..." : "Continue with Google"}
      </Button>

      <p className="mt-2 text-center text-xs text-white/50">
        Google accounts are created as customer accounts.
      </p>

      <p className="pt-3 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-emerald-400 hover:text-emerald-300"
        >
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
