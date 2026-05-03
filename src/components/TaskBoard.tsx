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
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
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

const STATUSES = COLUMNS.map((c) => c.id) as TaskStatus[];

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
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const tasksByStatus = (status: TaskStatus) =>
    tasksState
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  const findContainer = (id: string): TaskStatus | null => {
    if (STATUSES.includes(id as TaskStatus)) return id as TaskStatus;
    const task = tasksState.find((t) => t.id === id);
    return task?.status ?? null;
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setTasksState((prev) => {
      const activeTask = prev.find((t) => t.id === active.id);
      if (!activeTask) return prev;

      const updated = prev.map((t) =>
        t.id === active.id ? { ...t, status: overContainer } : t,
      );

      return updated;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);
    if (!activeContainer || !overContainer) return;

    let newOrderedTasks: Task[] = [];

    setTasksState((prev) => {
      const inSource = prev.filter((t) => t.status === activeContainer);
      const inTarget =
        activeContainer === overContainer
          ? inSource
          : prev.filter((t) => t.status === overContainer);

      if (activeContainer === overContainer) {
        const oldIndex = inSource.findIndex((t) => t.id === active.id);
        const newIndex =
          over.id === overContainer
            ? inSource.length - 1
            : inSource.findIndex((t) => t.id === over.id);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
          newOrderedTasks = prev;
          return prev;
        }

        const reorderedColumn = arrayMove(inSource, oldIndex, newIndex).map(
          (t, i) => ({ ...t, position: i }),
        );

        const others = prev.filter((t) => t.status !== activeContainer);
        const next = [...others, ...reorderedColumn];
        newOrderedTasks = next;
        return next;
      }

      const movedTask = prev.find((t) => t.id === active.id);
      if (!movedTask) {
        newOrderedTasks = prev;
        return prev;
      }

      const newSource = inSource
        .filter((t) => t.id !== active.id)
        .map((t, i) => ({ ...t, position: i }));

      const overIndex =
        over.id === overContainer
          ? inTarget.length
          : inTarget.findIndex((t) => t.id === over.id);

      const newTarget = [...inTarget.filter((t) => t.id !== active.id)];
      newTarget.splice(overIndex >= 0 ? overIndex : newTarget.length, 0, {
        ...movedTask,
        status: overContainer,
      });
      const reTarget = newTarget.map((t, i) => ({ ...t, position: i }));

      const untouched = prev.filter(
        (t) => t.status !== activeContainer && t.status !== overContainer,
      );

      const next = [...untouched, ...newSource, ...reTarget];
      newOrderedTasks = next;
      return next;
    });

    if (newOrderedTasks.length === 0) return;

    const updates: TaskMoveUpdate[] = newOrderedTasks.map((t) => ({
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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
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
                <div className="flex min-h-[60px] flex-col gap-2">
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
                </div>
              </SortableContext>
            </Column>
          );
        })}
      </div>

      <DragOverlay>
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
    <div className="flex flex-col gap-3" ref={setNodeRef}>
      <div
        className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold ${tone}`}
      >
        <span>{label}</span>
      </div>
      <div
        className={`rounded-md p-1 transition-colors ${
          isOver ? "bg-slate-200/60" : ""
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: "task" } });

  const style = {
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
      className={`cursor-grab bg-white active:cursor-grabbing ${
        dragging ? "shadow-lg ring-2 ring-slate-300" : ""
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
