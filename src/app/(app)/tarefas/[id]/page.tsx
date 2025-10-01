import { getTaskDetailsById } from "../queries";
import { getUsuariosVinculados } from "../../admin/vinculos/queries";
import { notFound } from "next/navigation";
import { TaskDetails } from "../_components/task-details";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// TODO: Substituir pela lógica real de obtenção da prefeitura do usuário
async function getActivePrefeituraId() {
  return 'f8784d4b-d2e5-4cb6-bd2f-aea32550f335';
}

export default async function TaskDetailsPage({ params }: { params: { id: string } }) {
  const task = await getTaskDetailsById(params.id);
  
  if (!task) {
    notFound();
  }

  // Precisamos da lista de usuários para o TaskDialog (editor)
  const prefeituraId = await getActivePrefeituraId();
  const usuariosVinculados = await getUsuariosVinculados(prefeituraId);
  const usuarios = usuariosVinculados.map(v => v.usuarios).filter(Boolean) as { id: string; nome: string }[];

  return (
    <TaskDetails
      task={task}
      usuarios={usuarios}
      prefeituraId={prefeituraId}
    />
  );
}

