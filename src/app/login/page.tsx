import Link from "next/link";
import { KanbanSquare, ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { AuthBackground } from "@/components/AuthBackground";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-12">
      <AuthBackground />

      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back home
      </Link>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md">
              <KanbanSquare className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">WellDunn</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Sign in to your WellDunn account.
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          By signing in you agree to use WellDunn responsibly.
        </p>
      </div>
    </main>
  );
}
