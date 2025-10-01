'use client'

import React, { useState, useMemo, useTransition } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useRouter } from 'next/navigation';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { TaskDialog } from './task-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { updateTaskStatus } from '../actions';

type Task = any;
type Usuario = { id: string; nome: string };

interface KanbanViewProps {
  initialTasks: Task[];
  usuarios: Usuario[];
  prefeituraId: string | null;
}

const statusMap = {
  a_fazer: 'A Fazer',
  fazendo: 'Fazendo',
  feito: 'Feito',
};

export function KanbanView({
  initialTasks,
  usuarios,
  prefeituraId,
}: KanbanViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = useMemo(() => {
    const tasksByStatus = { a_fazer: [] as Task[], fazendo: [] as Task[], feito: [] as Task[] };
    tasks.forEach(task => {
      if (task.status in tasksByStatus) {
        tasksByStatus[task.status as keyof typeof tasksByStatus].push(task);
      }
    });
    return Object.entries(tasksByStatus).map(([status, tasks]) => ({
      id: status,
      title: statusMap[status as keyof typeof statusMap],
      tasks,
    }));
  }, [tasks]);

  const tasksIds = useMemo(() => tasks.map(task => task.id), [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumnId = over.id as string;

    if (activeTask && activeTask.status !== overColumnId) {
      startTransition(async () => {
        await updateTaskStatus(active.id as string, activeTask.status, overColumnId);
        router.refresh(); // Simples refresh para revalidar
      });
    }
  };

  const refreshData = () => {
    router.refresh();
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
          <TaskDialog
            usuarios={usuarios}
            prefeituraId={prefeituraId}
            onTaskCreated={refreshData}
            onTaskUpdated={refreshData}
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </TaskDialog>
        </div>
        <div className="flex-1 flex gap-6 items-start relative">
          <SortableContext items={tasksIds}>
            {columns.map(col => (
              <KanbanColumn key={col.id} id={col.id} title={col.title} tasks={col.tasks} />
            ))}
          </SortableContext>
        </div>
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
