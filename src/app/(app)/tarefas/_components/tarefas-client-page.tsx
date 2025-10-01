'use client'

import { useSearchParams } from 'next/navigation';
import { KanbanBoard } from "./_components/kanban-board";
import { PrefeituraSelector } from "@/components/layout/prefeitura-selector";

// Tipos de dados para as props
type UserContext = {
  type: 'municipal' | 'consultor' | 'admin';
  prefeituraId?: string | null;
  prefeituras?: { id: string; nome: string }[];
};
type Task = any; // Simplificado para o exemplo
type Usuario = any;
type Orgao = any;

interface TarefasClientPageProps {
  userContext: UserContext | null;
  initialTasks: Task[];
  usuarios: Usuario[];
  filterableOrgaos: Orgao[];
}

export function TarefasClientPage({
  userContext,
  initialTasks,
  usuarios,
  filterableOrgaos,
}: TarefasClientPageProps) {
  const searchParams = useSearchParams();

  if (!userContext) {
    return <div className="p-6">Erro ao carregar o contexto do usuário.</div>;
  }

  const { type } = userContext;
  let prefeituraId: string | null = null;
  const prefeiturasDisponiveis = userContext.prefeituras || [];

  if (type === 'municipal') {
    prefeituraId = userContext.prefeituraId || null;
  } else if (type === 'consultor' || type === 'admin') {
    const prefeituraIdParam = searchParams.get('prefeitura_id');
    if (prefeituraIdParam === 'ceigep') {
      prefeituraId = null;
    } else if (prefeituraIdParam) {
      prefeituraId = prefeituraIdParam;
    } else {
      // Padrão: Tarefas CEIGEP se nenhuma prefeitura for selecionada
      prefeituraId = null;
    }
  }

  // Se for consultor/admin e NENHUMA prefeitura estiver selecionada (nem mesmo 'ceigep' via URL)
  // E a visualização padrão for a primeira vez (sem searchParams)
  // Mostra a tela de seleção.
  if ((type === 'consultor' || type === 'admin') && !searchParams.get('prefeitura_id')) {
     // No novo plano, exibimos o quadro CEIGEP por padrão, então esta tela não é mais necessária.
     // A lógica agora é controlada pelo `prefeituraId` padrão (null).
  }

  if (prefeituraId === null && type === 'municipal') {
    return <div className="p-6">Você não está vinculado a nenhuma prefeitura.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <KanbanBoard
        initialTasks={initialTasks}
        usuarios={usuarios}
        prefeituraId={prefeituraId}
        filterableOrgaos={filterableOrgaos}
        prefeiturasDisponiveis={prefeiturasDisponiveis}
        userType={type}
      />
    </div>
  );
}
