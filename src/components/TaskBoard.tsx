"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  reorderTasksAction,
  deleteTaskAction,
  type TaskMoveUpdate,
} from "@/app/dashboard/actions";
import type { Task, TaskStatus } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const COLUMNS: { id: TaskStatus; label: string; tone: string }[] = [
  { id: "todo", label: "To Do", tone: "bg-slate-100 text-slate-700" },
  {
    id: "in_progress",
    label: "Working On",
    tone: "bg-blue-100 text-blue-700",
  },
  { id: "completed", label: "Completed", tone: "bg-green-100 text-green-700" },
  { id: "cancelled", label: "Cancelled", tone: "bg-red-100 text-red-700" },
];

const STATUSES: TaskStatus[] = COLUMNS.map((c) => c.id);
const isStatus = (id: string): id is TaskStatus =>
  (STATUSES as string[]).includes(id);

export function TaskBoard({
  projectId,
  initialTasks,
}: {
  projectId: string;
  initialTasks: Task[];
}) {
  const [tasksState, setTasksState] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!activeId) setTasksState(initialTasks);
  }, [initialTasks, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const tasksByStatus = (status: TaskStatus) =>
    tasksState
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasksState.find((t) => t.id === activeId);
    if (!activeTask) return;

    const targetStatus: TaskStatus | undefined = isStatus(overId)
      ? overId
      : tasksState.find((t) => t.id === overId)?.status;
    if (!targetStatus) return;

    if (activeId === overId && activeTask.status === targetStatus) return;

    const without = tasksState.filter((t) => t.id !== activeId);
    const updatedActive: Task = { ...activeTask, status: targetStatus };

    let insertIdx: number;
    if (isStatus(overId)) {
      // dropped on column body — append to end of that column
      const lastIndexInTarget = without.reduce(
        (acc, t, i) => (t.status === targetStatus ? i : acc),
        -1,
      );
      insertIdx = lastIndexInTarget === -1 ? without.length : lastIndexInTarget + 1;
    } else {
      // dropped on a task — insert at that task's position
      insertIdx = without.findIndex((t) => t.id === overId);
      if (insertIdx === -1) insertIdx = without.length;
    }

    const merged = [...without];
    merged.splice(insertIdx, 0, updatedActive);

    const positionCounters: Record<TaskStatus, number> = {
      todo: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    const final = merged.map((t) => ({
      ...t,
      position: positionCounters[t.status]++,
    }));

    setTasksState(final);

    const updates: TaskMoveUpdate[] = final.map((t) => ({
      id: t.id,
      status: t.status,
      position: t.position,
    }));

    startTransition(async () => {
      await reorderTasksAction(projectId, updates);
    });
  }

  const activeTask = activeId
    ? tasksState.find((t) => t.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasksByStatus(col.id);
          return (
            <Column key={col.id} id={col.id} label={col.label} tone={col.tone}>
              <SortableContext
                items={items.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.length === 0 ? (
                  <div className="rounded-md border border-dashed bg-white/40 p-4 text-center text-xs text-muted-foreground">
                    Drop tasks here
                  </div>
                ) : (
                  items.map((t) => (
                    <SortableTaskCard
                      key={t.id}
                      task={t}
                      projectId={projectId}
                    />
                  ))
                )}
              </SortableContext>
            </Column>
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <TaskCard task={activeTask} projectId={projectId} dragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  id,
  label,
  tone,
  children,
}: {
  id: TaskStatus;
  label: string;
  tone: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "column" },
  });

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold ${tone}`}
      >
        <span>{label}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-col gap-2 rounded-md p-1 transition-colors ${
          isOver ? "bg-slate-200/60 ring-2 ring-slate-300" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SortableTaskCard({
  task,
  projectId,
}: {
  task: Task;
  projectId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task" } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} projectId={projectId} />
    </div>
  );
}

function TaskCard({
  task,
  projectId,
  dragging,
}: {
  task: Task;
  projectId: string;
  dragging?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete task "${task.title}"?`)) return;
    startTransition(async () => {
      await deleteTaskAction(task.id, projectId);
    });
  };

  return (
    <Card
      className={`cursor-grab select-none bg-white active:cursor-grabbing ${
        dragging ? "shadow-lg ring-2 ring-slate-400" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm leading-snug">{task.title}</CardTitle>
        {task.description && (
          <p className="line-clamp-3 text-xs text-muted-foreground">
            {task.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex justify-end pt-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={pending}
        >
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}
