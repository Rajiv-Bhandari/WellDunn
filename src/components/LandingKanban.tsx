import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

const COLUMNS = [
  {
    label: "To Do",
    icon: <Circle className="h-3.5 w-3.5" />,
    tone: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    tasks: ["Wireframe homepage", "Plan launch checklist"],
  },
  {
    label: "Working On",
    icon: <Loader2 className="h-3.5 w-3.5" />,
    tone: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    tasks: ["API integration", "Onboarding flow"],
  },
  {
    label: "Completed",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    tone: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    tasks: ["Setup CI/CD", "Database schema", "Auth flow"],
  },
  {
    label: "Cancelled",
    icon: <XCircle className="h-3.5 w-3.5" />,
    tone: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    tasks: ["Old proposal"],
  },
];

export function LandingKanban() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute -inset-x-8 -inset-y-4 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white opacity-80 blur-xl" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-2xl shadow-slate-900/5 backdrop-blur sm:p-6">
        {/* Faux window chrome */}
        <div className="mb-4 flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 text-xs text-slate-400">
            welldunn.app/dashboard
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLUMNS.map((col, colIdx) => (
            <div key={col.label} className="flex flex-col gap-2">
              <div
                className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold ${col.tone}`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                  {col.label}
                </span>
                <span className="text-[10px] opacity-60">
                  {col.tasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {col.tasks.map((title, taskIdx) => (
                  <MiniTask
                    key={title}
                    title={title}
                    delay={colIdx * 200 + taskIdx * 80}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* The "traveling" card — absolutely positioned, animates across columns */}
          <div className="pointer-events-none absolute left-0 top-9 hidden w-[calc(25%-9px)] sm:block">
            <div className="animate-card-travel">
              <div className="rounded-lg border-2 border-indigo-300 bg-white p-2.5 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-200/50">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                  <div className="flex-1">
                    <p className="text-xs font-medium leading-snug text-slate-900">
                      User research notes
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      moving…
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniTask({ title, delay }: { title: string; delay: number }) {
  return (
    <div
      className="animate-card-fade-in rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <p className="text-xs font-medium leading-snug text-slate-800">{title}</p>
      <div className="mt-1.5 flex items-center gap-1">
        <div className="h-1 w-8 rounded-full bg-slate-100" />
        <div className="h-1 w-4 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}
