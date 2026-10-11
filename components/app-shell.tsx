"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated, useMutation } from "convex/react";
import { Award, CalendarDays, CircleCheck, Heart } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/components/convex-client-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/today", label: "Today", icon: CircleCheck, match: ["/today", "/day"] },
  { href: "/history", label: "History", icon: CalendarDays, match: ["/history"] },
  { href: "/badges", label: "Badges", icon: Award, match: ["/badges"] },
  { href: "/us", label: "Us", icon: Heart, match: ["/us"] },
];

function useActive() {
  const pathname = usePathname();
  return (match: string[]) => match.some((m) => pathname.startsWith(m));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
          <Link href="/today" className="font-serif text-2xl tracking-tight">
            Daily <span className="italic">Five</span>
          </Link>
          <Suspense fallback={<div />}>
            <DesktopNav />
          </Suspense>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pt-6 pb-32 sm:pb-20">
        {isConvexConfigured ? (
          <>
            <AuthLoading>
              <PageSkeleton />
            </AuthLoading>
            <Unauthenticated>
              <Notice title="Can't reach your data">
                You&apos;re signed in, but the database didn&apos;t accept the session. Check that the Clerk
                Convex integration is active and <code>CLERK_JWT_ISSUER_DOMAIN</code> is set in
                Convex (see the README).
              </Notice>
            </Unauthenticated>
            <Authenticated>
              <EnsureUser>
                <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
              </EnsureUser>
            </Authenticated>
          </>
        ) : (
          <Notice title="Almost there">
            <code>NEXT_PUBLIC_CONVEX_URL</code> isn&apos;t set. Run <code>npx convex dev</code> to
            create your database, then restart the dev server.
          </Notice>
        )}
      </main>

      <Suspense>
        <BottomNav />
      </Suspense>
    </div>
  );
}

function DesktopNav() {
  const isActive = useActive();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm transition-colors",
            isActive(item.match)
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function BottomNav() {
  const isActive = useActive();
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-md sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 pt-2">
        {NAV.map((item) => {
          const active = isActive(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 text-[11px] transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Makes sure a `users` row exists for the Clerk identity before rendering pages. */
function EnsureUser({ children }: { children: React.ReactNode }) {
  const store = useMutation(api.users.store);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    store().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  return ready ? <>{children}</> : <PageSkeleton />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-foreground">
        {children}
      </p>
    </div>
  );
}
