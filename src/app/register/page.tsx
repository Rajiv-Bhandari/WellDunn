import Link from "next/link";
import { KanbanSquare, ArrowLeft } from "lucide-react";
import { RegisterForm } from "@/components/RegisterForm";
import { AuthBackground } from "@/components/AuthBackground";

export default function RegisterPage() {
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
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Start managing projects in seconds.
            </p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Free to use. No credit card required.
        </p>
      </div>
    </main>
  );
}
