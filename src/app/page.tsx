import Link from "next/link";
import { redirect } from "next/navigation";
import {
  KanbanSquare,
  Lock,
  Zap,
  GripVertical,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "../../auth";
import { LandingKanban } from "@/components/LandingKanban";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
              <KanbanSquare className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight">WellDunn</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-100 via-violet-100 to-rose-100 opacity-60 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Built for makers who ship
            </div>

            <h1
              className="mt-6 animate-fade-in-up text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl"
              style={{ animationDelay: "100ms" }}
            >
              Move work
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500 bg-clip-text text-transparent">
                at the speed of thought.
              </span>
            </h1>

            <p
              className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-slate-600"
              style={{ animationDelay: "200ms" }}
            >
              A clean, fast project workspace with drag-and-drop kanban. Track
              every task from{" "}
              <span className="font-semibold text-slate-900">To Do</span> to{" "}
              <span className="font-semibold text-slate-900">Done</span> — your
              projects, your board, no clutter.
            </p>

            <div
              className="mt-8 flex animate-fade-in-up items-center justify-center gap-3"
              style={{ animationDelay: "300ms" }}
            >
              <Button asChild size="lg" className="group">
                <Link href="/register">
                  Get started — it&apos;s free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Animated kanban preview */}
          <div
            className="mt-16 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <LandingKanban />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200/60 bg-slate-50/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Focused tools for individuals and small teams who want to ship
              without the bloat.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Feature
              icon={<GripVertical className="h-5 w-5" />}
              title="Drag & drop kanban"
              description="Move tasks across To Do, Working On, Completed, and Cancelled — keyboard accessible too."
              tone="from-indigo-500 to-violet-500"
            />
            <Feature
              icon={<Lock className="h-5 w-5" />}
              title="Private by default"
              description="Each user sees only their projects. JWT sessions and per-row auth checks on every action."
              tone="from-rose-500 to-orange-500"
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Built for speed"
              description="Server actions, optimistic UI, edge-deployed on Vercel + Neon. Loads in milliseconds."
              tone="from-emerald-500 to-teal-500"
            />
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t border-slate-200/60 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Ready to get organized?
          </h2>
          <p className="mt-3 text-slate-600">
            Create your first project in under 30 seconds.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href="/register">
                Start now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} WellDunn</p>
          <p className="text-xs">
            Built with Next.js · Drizzle · Neon · Auth.js
          </p>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: string;
}) {
  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-white shadow-sm`}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}
