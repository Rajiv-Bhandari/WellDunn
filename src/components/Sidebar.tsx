"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import type { Project } from "@/db/schema";

export function Sidebar({
  projects,
  userLabel,
}: {
  projects: Project[];
  userLabel: string;
}) {
  const params = useParams<{ projectId?: string }>();
  const activeId = params?.projectId;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      <div className="border-b px-4 py-4">
        <h1 className="text-lg font-bold">WellDunn</h1>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {userLabel}
        </p>
      </div>

      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Projects
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs"
          onClick={() => setDialogOpen(true)}
        >
          + New
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
        {projects.length === 0 ? (
          <p className="px-2 py-4 text-xs text-muted-foreground">
            No projects yet. Click <strong>+ New</strong> to create one.
          </p>
        ) : (
          <ul className="space-y-1">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/${p.id}`}
                  className={cn(
                    "block truncate rounded-md px-3 py-2 text-sm transition-colors",
                    activeId === p.id
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100",
                  )}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </aside>
  );
}
