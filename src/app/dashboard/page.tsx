import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { auth } from "../../../auth";
import { KanbanBoard } from "@/components/KanbanBoard";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.createdAt));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">WellDunn</h1>
            <p className="text-sm text-muted-foreground">
              {session.user.name || session.user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NewProjectDialog />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {userProjects.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-white p-12 text-center">
            <h2 className="text-lg font-semibold">No projects yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first project to get started.
            </p>
            <div className="mt-4 inline-block">
              <NewProjectDialog />
            </div>
          </div>
        ) : (
          <KanbanBoard projects={userProjects} />
        )}
      </main>
    </div>
  );
}
