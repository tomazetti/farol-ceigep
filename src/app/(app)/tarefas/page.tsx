import { getMyTasks } from "./queries";
import { KanbanBoard } from "./_components/kanban-board";
import { getCurrentUserContext } from "../admin/vinculos/queries";
import { getAssignableUsers } from "../admin/usuarios/queries";

export default async function TarefasPage() {
  const tasks = await getMyTasks();
  const assignableUsers = await getAssignableUsers();

  // A lógica de contexto ainda é necessária para o TaskDialog saber
  // a qual prefeitura uma nova tarefa deve ser associada.
  const userContext = await getCurrentUserContext();
  
  return (
    <KanbanBoard
      initialTasks={tasks}
      usuarios={assignableUsers}
      prefeituraId={userContext?.type === 'municipal' ? userContext.prefeituraId : null}
    />
  );
}
