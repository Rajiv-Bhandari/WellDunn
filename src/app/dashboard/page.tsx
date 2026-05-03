import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { auth } from "../../../auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [firstProject] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(asc(projects.createdAt))
    .limit(1);

  if (firstProject) {
    redirect(`/dashboard/${firstProject.id}`);
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-lg border border-dashed bg-white p-12 text-center">
        <h2 className="text-lg font-semibold">No projects yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the sidebar to create your first project.
        </p>
      </div>
    </div>
  );
}
