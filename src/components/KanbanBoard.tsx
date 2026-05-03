"use client";

import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateProjectStatusAction,
  deleteProjectAction,
} from "@/app/dashboard/actions";
import type { Project, ProjectStatus } from "@/db/schema";

const COLUMNS: { id: ProjectStatus; label: string; tone: string }[] = [
  { id: "todo", label: "To Do", tone: "bg-slate-100 text-slate-700" },
  {
    id: "in_progress",
    label: "Working On",
    tone: "bg-blue-100 text-blue-700",
  },
  { id: "completed", label: "Completed", tone: "bg-green-100 text-green-700" },
  {
    id: "cancelled",
    label: "Cancelled",
    tone: "bg-red-100 text-red-700",
  },
];

export function KanbanBoard({ projects }: { projects: Project[] }) {
  const grouped = COLUMNS.map((col) => ({
    ...col,
    items: projects.filter((p) => p.status === col.id),
  }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {grouped.map((col) => (
        <div key={col.id} className="flex flex-col gap-3">
          <div
            className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold ${col.tone}`}
          >
            <span>{col.label}</span>
            <span className="rounded bg-white/60 px-2 py-0.5 text-xs">
              {col.items.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {col.items.length === 0 ? (
              <div className="rounded-md border border-dashed bg-white/40 p-4 text-center text-xs text-muted-foreground">
                Empty
              </div>
            ) : (
              col.items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [pending, startTransition] = useTransition();

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      await updateProjectStatusAction(project.id, status as ProjectStatus);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${project.title}"?`)) return;
    startTransition(async () => {
      await deleteProjectAction(project.id);
    });
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{project.title}</CardTitle>
        {project.description && (
          <CardDescription className="line-clamp-3 text-xs">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2 pt-0">
        <Select
          value={project.status}
          onValueChange={handleStatusChange}
          disabled={pending}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLUMNS.map((col) => (
              <SelectItem key={col.id} value={col.id} className="text-xs">
                {col.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={pending}
        >
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}
