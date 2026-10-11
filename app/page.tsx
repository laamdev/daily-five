import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CategoryDot } from "@/components/category-dot";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

// Signed-in visitors are redirected to /today by proxy.ts.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-16">
      <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        For two
      </p>
      <h1 className="mt-3 font-serif text-6xl leading-none tracking-tight sm:text-7xl">
        Daily <span className="italic">Five</span>
      </h1>
      <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted-foreground">
        Five small things, every day. Move, connect, think, tend your home and
        grow — then write a few lines about it.
      </p>

      <ul className="mt-10 space-y-3">
        {CATEGORIES.map((c) => (
          <li key={c.id} className="flex items-center gap-3 text-sm">
            <CategoryDot category={c.id} />
            <span className="w-20 font-medium">{c.label}</span>
            <span className="text-muted-foreground">{c.ideas[0]}</span>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex gap-3">
        <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
          Get started
        </Link>
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11 px-6")}
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
