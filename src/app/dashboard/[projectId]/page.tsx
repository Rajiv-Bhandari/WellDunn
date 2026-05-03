import { notFound, redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { auth } from "../../../../auth";
import { TaskBoard } from "@/components/TaskBoard";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { DeleteProjectButton } from "@/components/DeleteProjectButton";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.id, projectId), eq(projects.userId, session.user.id)),
    )
    .limit(1);

  if (!project) {
    notFound();
  }

  const projectTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.position), asc(tasks.createdAt));

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <NewTaskDialog projectId={project.id} />
          <DeleteProjectButton
            projectId={project.id}
            projectTitle={project.title}
          />
        </div>
      </div>

      <TaskBoard projectId={project.id} initialTasks={projectTasks} />
    </div>
  );
}
