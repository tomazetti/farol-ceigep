'use client'

import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type Task = {
  id: string
  titulo: string
  responsavel: { id: string; nome: string } | null
  orgao: { id: string; nome: string } | null
}

interface KanbanCardProps {
  task: Task
}

export function KanbanCard({ task }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const responsibleInitial = task.responsavel?.nome.charAt(0).toUpperCase() || "?"

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/tarefas/${task.id}`} className="block">
        <Card className="mb-4 hover:shadow-md transition-shadow">
          <CardHeader className="p-4">
            <CardTitle className="text-base">{task.titulo}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              {/* O campo orgao foi removido, mas o Badge pode ser usado para outra coisa no futuro */}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{responsibleInitial}</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
