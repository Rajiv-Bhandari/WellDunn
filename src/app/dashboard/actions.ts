"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { projects, tasks, taskStatusEnum } from "@/db/schema";
import { auth } from "../../../auth";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}

async function assertProjectOwnership(projectId: string, userId: string) {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (!project) {
    throw new Error("Project not found");
  }
}

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
});

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  newProjectId?: string;
};

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const userId = await requireUserId();

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const [created] = await db
    .insert(projects)
    .values({
      userId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
    })
    .returning({ id: projects.id });

  revalidatePath("/dashboard", "layout");
  return { newProjectId: created.id };
}

export async function deleteProjectAction(projectId: string) {
  const userId = await requireUserId();

  await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

const taskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(taskStatusEnum.enumValues).default("todo"),
});

export type TaskFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
  ts?: number;
};

export async function createTaskAction(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const userId = await requireUserId();

  const parsed = taskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description") || null,
    status: formData.get("status") || "todo",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await assertProjectOwnership(parsed.data.projectId, userId);

  await db
    .update(tasks)
    .set({ position: sql`${tasks.position} + 1` })
    .where(
      and(
        eq(tasks.projectId, parsed.data.projectId),
        eq(tasks.status, parsed.data.status),
      ),
    );

  await db.insert(tasks).values({
    projectId: parsed.data.projectId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    status: parsed.data.status,
    position: 0,
  });

  revalidatePath(`/dashboard/${parsed.data.projectId}`);
  return { success: true, ts: Date.now() };
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  const userId = await requireUserId();
  await assertProjectOwnership(projectId, userId);

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));

  revalidatePath(`/dashboard/${projectId}`);
}

export type TaskMoveUpdate = {
  id: string;
  status: (typeof taskStatusEnum.enumValues)[number];
  position: number;
};

export async function reorderTasksAction(
  projectId: string,
  updates: TaskMoveUpdate[],
) {
  const userId = await requireUserId();
  await assertProjectOwnership(projectId, userId);

  for (const u of updates) {
    await db
      .update(tasks)
      .set({ status: u.status, position: u.position, updatedAt: new Date() })
      .where(and(eq(tasks.id, u.id), eq(tasks.projectId, projectId)));
  }

  revalidatePath(`/dashboard/${projectId}`);
}
