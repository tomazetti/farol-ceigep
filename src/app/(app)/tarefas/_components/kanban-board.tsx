'use client'

import dynamic from 'next/dynamic'

const KanbanView = dynamic(() => import('./kanban-view').then(mod => mod.KanbanView), {
  ssr: false,
  loading: () => <p>Carregando quadro...</p>,
})

export const KanbanBoard = KanbanView
