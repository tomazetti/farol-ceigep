'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FilePenLine } from "lucide-react";
import { TaskDialog } from "./task-dialog";
import { useRouter } from "next/navigation";

// Tipos de dados (devem corresponder aos tipos da query)
type TaskDetailsData = {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  created_at: string;
  responsavel: { id: string; nome: string; } | null;
  criador: { id: string; nome: string; } | null;
  observadores: { usuario: { id: string; nome: string; }; }[];
  historico: { id: string; de_status: string | null; para_status: string; created_at: string; alterado_por_usuario: { nome: string; } | null; }[];
};
type Usuario = { id: string; nome: string };

interface TaskDetailsProps {
  task: TaskDetailsData;
  usuarios: Usuario[];
  prefeituraId: string;
}

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  a_fazer: "secondary",
  fazendo: "default",
  feito: "outline",
};

export function TaskDetails({ task, usuarios, prefeituraId }: TaskDetailsProps) {
  const router = useRouter();
  const formatStatus = (status: string) => status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleTaskUpdated = () => {
    router.refresh();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalhes da Tarefa</h1>
        <TaskDialog
          usuarios={usuarios}
          prefeituraId={prefeituraId}
          task={task}
          onTaskCreated={() => {}} // Não aplicável aqui
          onTaskUpdated={handleTaskUpdated}
        >
          <Button variant="outline">
            <FilePenLine className="mr-2 h-4 w-4" />
            Editar Tarefa
          </Button>
        </TaskDialog>
      </div>

      {/* O resto do JSX é o mesmo da página anterior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{task.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {task.descricao || "Nenhuma descrição fornecida."}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">Status</span>
              <Badge variant={statusVariantMap[task.status] || "default"}>
                {formatStatus(task.status)}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Responsável</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{task.responsavel?.nome?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{task.responsavel?.nome}</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Criado por</span>
              <span>{task.criador?.nome}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Criado em</span>
              <span className="text-muted-foreground">
                {new Date(task.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Observadores</CardTitle>
        </CardHeader>
        <CardContent>
          {task.observadores && task.observadores.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {task.observadores.map(obs => (
                <div key={obs.usuario.id} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{obs.usuario.nome?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{obs.usuario.nome}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum observador nesta tarefa.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>De</TableHead>
                <TableHead>Para</TableHead>
                <TableHead>Alterado por</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {task.historico && task.historico.length > 0 ? (
                task.historico.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatStatus(entry.de_status || 'Início')}</TableCell>
                    <TableCell>{formatStatus(entry.para_status)}</TableCell>
                    <TableCell>{entry.alterado_por_usuario?.nome}</TableCell>
                    <TableCell>{new Date(entry.created_at).toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhuma mudança de status registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
