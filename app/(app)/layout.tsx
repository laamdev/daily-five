import { AppShell } from "@/components/app-shell";

// Everything under here renders client-side once Clerk + Convex have loaded,
// so there is nothing for Next.js to prerender or validate for instant navigation.
export const instant = false;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
