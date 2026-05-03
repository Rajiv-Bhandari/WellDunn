"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTaskAction,
  type TaskFormState,
} from "@/app/dashboard/actions";

const initialState: TaskFormState = {};

export function NewTaskDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("todo");
  const [state, formAction, pending] = useActionState(
    createTaskAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setStatus("todo");
      setOpen(false);
    }
  }, [state.ts, state.success]);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        + Add Task
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">New task</h2>

            <form ref={formRef} action={formAction} className="mt-4 space-y-4">
              <input type="hidden" name="projectId" value={projectId} />

              <div className="space-y-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  name="title"
                  placeholder="Design the homepage"
                  required
                />
                {state.fieldErrors?.title && (
                  <p className="text-xs text-destructive">
                    {state.fieldErrors.title[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description (optional)</Label>
                <Textarea
                  id="task-description"
                  name="description"
                  placeholder="Details..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">Working On</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="status" value={status} />
              </div>

              {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating…" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
