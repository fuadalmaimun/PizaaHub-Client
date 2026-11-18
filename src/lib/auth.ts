import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI!);

const db = client.db(process.env.DB_NAME);
const authBaseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.BETTER_AUTH_URL;

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  baseURL: authBaseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins:
    process.env.NODE_ENV === "development"
      ? ["http://localhost:3000"]
      : undefined,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: ["vendor", "customer"],
        required: true,
        defaultValue: "customer",
        input: true,
      },
      isBlocked: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
      subscriptionPlan: {
        type: "string",
        required: true,
        defaultValue: "free",
        input: false,
      },
    },
  },
});
