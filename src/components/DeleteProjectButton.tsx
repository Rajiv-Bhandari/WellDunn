"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteProjectAction } from "@/app/dashboard/actions";

export function DeleteProjectButton({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            `Delete project "${projectTitle}"? This will delete all its tasks.`,
          )
        ) {
          return;
        }
        startTransition(async () => {
          await deleteProjectAction(projectId);
        });
      }}
    >
      {pending ? "Deleting…" : "Delete project"}
    </Button>
  );
}
