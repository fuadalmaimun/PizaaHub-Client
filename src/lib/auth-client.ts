
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    // Infer user additional fields (role, isBlocked, ...) from src/lib/auth.ts
    inferAdditionalFields<typeof auth>(),
  ],
});
