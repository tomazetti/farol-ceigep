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
import { SecretariaForm } from "./secretaria-form"
import { addSecretaria, updateSecretaria, deleteSecretaria } from "../actions"

type Secretaria = {
  id: string
  nome: string
  prefeitura_id: string
  created_at: string
}

interface SecretariaActionsProps {
  prefeituraId: string
  secretarias: Secretaria[]
}

export function SecretariaActions({ prefeituraId, secretarias: initialSecretarias }: SecretariaActionsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSecretaria, setSelectedSecretaria] = useState<Secretaria | null>(null)

  const handleAddSubmit = async (values: { nome: string }) => {
    const result = await addSecretaria(prefeituraId, values)
    if (!result.error) {
      setIsAddDialogOpen(false)
      alert("Secretaria adicionada com sucesso!")
    } else {
      alert(result.error)
    }
  }

  const handleUpdateSubmit = async (values: { nome: string }) => {
    if (!selectedSecretaria) return
    const result = await updateSecretaria(selectedSecretaria.id, prefeituraId, values)
    if (!result.error) {
      setIsEditDialogOpen(false)
      setSelectedSecretaria(null)
      alert("Secretaria atualizada com sucesso!")
    } else {
      alert(result.error)
    }
  }

  const handleDelete = async (secretariaId: string) => {
    const result = await deleteSecretaria(secretariaId, prefeituraId)
    if (result.error) {
      alert(result.error)
    } else {
      alert("Secretaria excluída com sucesso!")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Secretarias</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Secretaria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Secretaria</DialogTitle>
            </DialogHeader>
            <SecretariaForm onSubmit={handleAddSubmit} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {initialSecretarias.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSecretarias.map((secretaria) => (
                <TableRow key={secretaria.id}>
                  <TableCell>{secretaria.nome}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog open={isEditDialogOpen && selectedSecretaria?.id === secretaria.id} onOpenChange={(isOpen) => {
                      if (!isOpen) setSelectedSecretaria(null);
                      setIsEditDialogOpen(isOpen);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setSelectedSecretaria(secretaria)}>
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Secretaria</DialogTitle>
                        </DialogHeader>
                        <SecretariaForm onSubmit={handleUpdateSubmit} defaultValues={{ nome: secretaria.nome }} />
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
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            {`Tem certeza que deseja excluir a secretaria '${secretaria.nome}'? Esta ação não pode ser desfeita.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(secretaria.id)}>
                            Excluir
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
          <p className="text-fg-muted text-center py-4">
            Nenhuma secretaria cadastrada para esta prefeitura.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
