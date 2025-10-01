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
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { UsuarioForm } from "./usuario-form"
import { addUsuario } from "../actions"
import { z } from "zod"
import { usuarioFormSchema } from "../actions"

type Usuario = {
  id: string
  nome: string
  email: string
  tipo: string
  ativo: boolean
}

interface UsuarioActionsProps {
  usuarios: Usuario[]
}

export function UsuarioActions({ usuarios }: UsuarioActionsProps) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleRowClick = (id: string) => {
    router.push(`/admin/usuarios/${id}`)
  }

  const handleAddSubmit = async (values: z.infer<typeof usuarioFormSchema>) => {
    const result = await addUsuario(values)
    if (result.error) {
      alert(result.error)
    } else {
      alert("Usuário adicionado com sucesso!")
      setIsAddDialogOpen(false)
      router.refresh() // Atualiza os dados da página
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-fg-strong">
          Gerenciar Usuários
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            </DialogHeader>
            <UsuarioForm onSubmit={handleAddSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-s1 border border-border-brand">
        {usuarios.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow
                  key={usuario.id}
                  onClick={() => handleRowClick(usuario.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={usuario.ativo ? "default" : "destructive"}>
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-fg-muted text-center">
            Nenhum usuário cadastrado ainda.
          </p>
        )}
      </div>
    </div>
  )
}
