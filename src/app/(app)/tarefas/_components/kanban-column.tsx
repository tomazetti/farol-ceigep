'use client'

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from "./kanban-card"
import { useMemo } from 'react';

type Task = {
  id: string
  titulo: string
  status: string
  responsavel: { id: string; nome: string } | null
  orgao: { id: string; nome: string } | null
}

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const tasksIds = useMemo(() => tasks.map(task => task.id), [tasks]);

  return (
    <SortableContext id={id} items={tasksIds} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="flex-1 p-4 bg-muted/50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-foreground">{title}</h2>
        <div className="space-y-4">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Nenhuma tarefa nesta coluna.
            </div>
          )}
        </div>
      </div>
    </SortableContext>
  )
}
