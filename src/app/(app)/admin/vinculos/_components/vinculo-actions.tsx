'use client'

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlusCircle, FilePenLine, Trash2 } from "lucide-react"
import { VinculoForm } from "./vinculo-form"
import { vincularUsuario, desvincularUsuario, updateVinculo } from "../actions"
import { vinculoFormSchema } from "../schema"
import { z } from "zod"

type UsuarioVinculado = {
  id: string
  orgao_id: string | null
  usuarios: {
    id: string
    nome: string
    email: string
  } | null
  orgaos: {
    nome: string
  } | null
}

type UsuarioDisponivel = {
  id: string
  nome: string
}

type Orgao = {
  id: string
  nome: string
}

interface VinculoActionsProps {
  prefeituraId: string
  usuariosVinculados: UsuarioVinculado[]
  usuariosDisponiveis: UsuarioDisponivel[]
  orgaos: Orgao[]
  onDataChange: () => void
}

export function VinculoActions({ prefeituraId, usuariosVinculados, usuariosDisponiveis, orgaos, onDataChange }: VinculoActionsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedVinculo, setSelectedVinculo] = useState<UsuarioVinculado | null>(null)

  const handleAddSubmit = async (values: z.infer<typeof vinculoFormSchema>) => {
    const result = await vincularUsuario(prefeituraId, values)
    if (result.error) {
      alert(result.error)
    } else {
      onDataChange()
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateSubmit = async (values: z.infer<typeof vinculoFormSchema>) => {
    if (!selectedVinculo) return
    const result = await updateVinculo(selectedVinculo.id, prefeituraId, values)
    if (result.error) {
      alert(result.error)
    } else {
      alert("Vínculo atualizado com sucesso!")
      onDataChange()
      setIsEditDialogOpen(false)
      setSelectedVinculo(null)
    }
  }

  const handleDelete = async (vinculoId: string) => {
    const result = await desvincularUsuario(vinculoId, prefeituraId)
    if (result.error) {
      alert(result.error)
    } else {
      onDataChange()
    }
  }

  const allUsersForForm = [
    ...usuariosDisponiveis,
    ...usuariosVinculados
      .filter(v => v.usuarios)
      .map(v => ({ id: v.usuarios!.id, nome: v.usuarios!.nome }))
  ]
  const uniqueUsersForForm = Array.from(new Map(allUsersForForm.map(u => [u.id, u])).values());


  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usuários Vinculados</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={usuariosDisponiveis.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Vincular Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vincular Novo Usuário</DialogTitle>
            </DialogHeader>
            <VinculoForm
              usuariosDisponiveis={usuariosDisponiveis}
              orgaos={orgaos}
              onSubmit={handleAddSubmit}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {usuariosVinculados.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosVinculados.map((vinculo) => (
                <TableRow key={vinculo.id}>
                  <TableCell>{vinculo.usuarios?.nome}</TableCell>
                  <TableCell>{vinculo.usuarios?.email}</TableCell>
                  <TableCell>{vinculo.orgaos?.nome || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog open={isEditDialogOpen && selectedVinculo?.id === vinculo.id} onOpenChange={(isOpen) => {
                      if (!isOpen) setSelectedVinculo(null);
                      setIsEditDialogOpen(isOpen);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setSelectedVinculo(vinculo)}>
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Vínculo</DialogTitle>
                        </DialogHeader>
                        <VinculoForm
                          usuariosDisponiveis={uniqueUsersForForm}
                          orgaos={orgaos}
                          onSubmit={handleUpdateSubmit}
                          defaultValues={{
                            usuario_id: vinculo.usuarios?.id,
                            orgao_id: vinculo.orgao_id || "",
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja desvincular o usuário "{vinculo.usuarios?.nome}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(vinculo.id)}>
                            Desvincular
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Nenhum usuário vinculado a esta prefeitura.
          </p>
        )}
      </CardContent>
    </Card>
  )
}