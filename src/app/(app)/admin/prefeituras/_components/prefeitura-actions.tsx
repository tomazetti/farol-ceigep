'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { PrefeituraForm } from "./prefeitura-form"
import { addPrefeitura } from "../actions"

// Tipo atualizado para refletir o join com municipios
type Prefeitura = {
  id: string
  nome: string
  created_at: string
  municipios: {
    nome: string
    uf_sigla: string
  } | null
}

interface PrefeituraActionsProps {
  prefeituras: Prefeitura[]
}

export function PrefeituraActions({ prefeituras }: PrefeituraActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  // A função agora recebe os valores diretamente do formulário
  const handleAddSubmit = async (values: { nome: string; municipio_id: string }) => {
    const result = await addPrefeitura(values)
    if (!result.error) {
      setIsDialogOpen(false)
      // Idealmente, usar um toast para sucesso
      alert("Prefeitura adicionada com sucesso!")
    } else {
      // Tratar erro, talvez com um toast
      alert(result.error)
    }
  }

  const handleRowClick = (id: string) => {
    router.push(`/admin/prefeituras/${id}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-fg-strong">
          Gerenciar Prefeituras
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Prefeitura
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Prefeitura</DialogTitle>
            </DialogHeader>
            <PrefeituraForm onSubmit={handleAddSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-s1 border border-border-brand">
        {prefeituras.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Município</TableHead>
                <TableHead>UF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prefeituras.map((prefeitura) => (
                <TableRow
                  key={prefeitura.id}
                  onClick={() => handleRowClick(prefeitura.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>{prefeitura.nome}</TableCell>
                  <TableCell>{prefeitura.municipios?.nome || 'N/A'}</TableCell>
                  <TableCell>{prefeitura.municipios?.uf_sigla || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-fg-muted text-center">
            Nenhuma prefeitura cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  )
}
