import type { AuthConfig } from "convex/server";

// Set CLERK_JWT_ISSUER_DOMAIN in the Convex dashboard (Settings → Environment Variables).
// It's the "Frontend API URL" of your Clerk app, e.g. https://your-app.clerk.accounts.dev
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
