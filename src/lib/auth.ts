
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI!);

const db = client.db(process.env.DB_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
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
