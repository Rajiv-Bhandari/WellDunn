"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { projects, projectStatusEnum } from "@/db/schema";
import { auth } from "../../../auth";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(projectStatusEnum.enumValues).default("todo"),
});

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const userId = await requireUserId();

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    status: formData.get("status") || "todo",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.insert(projects).values({
    userId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    status: parsed.data.status,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProjectStatusAction(
  projectId: string,
  status: (typeof projectStatusEnum.enumValues)[number],
) {
  const userId = await requireUserId();

  await db
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  revalidatePath("/dashboard");
}

export async function deleteProjectAction(projectId: string) {
  const userId = await requireUserId();

  await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  revalidatePath("/dashboard");
}
