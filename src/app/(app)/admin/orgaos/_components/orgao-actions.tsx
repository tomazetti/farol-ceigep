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
import { OrgaoForm } from "./orgao-form"
import { addOrgao, updateOrgao, deleteOrgao } from "../actions"

type Orgao = {
  id: string
  nome: string
  prefeitura_id: string
  created_at: string
  orgao_superior_id: string | null
  orgaos: {
    nome: string
  } | null
}

interface OrgaoActionsProps {
  prefeituraId: string
  orgaos: Orgao[]
  onDataChange: () => void
}

export function OrgaoActions({ prefeituraId, orgaos: initialOrgaos, onDataChange }: OrgaoActionsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOrgao, setSelectedOrgao] = useState<Orgao | null>(null)

  const handleAddSubmit = async (values: { nome: string, orgao_superior_id?: string }) => {
    const result = await addOrgao(prefeituraId, values)
    if (!result.error) {
      onDataChange()
      setIsAddDialogOpen(false)
    } else {
      alert(result.error)
    }
  }

  const handleUpdateSubmit = async (values: { nome: string, orgao_superior_id?: string }) => {
    if (!selectedOrgao) return
    const result = await updateOrgao(selectedOrgao.id, prefeituraId, values)
    if (!result.error) {
      onDataChange()
      setIsEditDialogOpen(false)
      setSelectedOrgao(null)
    } else {
      alert(result.error)
    }
  }

  const handleDelete = async (orgaoId: string) => {
    const result = await deleteOrgao(orgaoId, prefeituraId)
    if (result.error) {
      alert(result.error)
    } else {
      onDataChange()
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Órgãos</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Órgão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Órgão</DialogTitle>
            </DialogHeader>
            <OrgaoForm 
              onSubmit={handleAddSubmit} 
              orgaos={initialOrgaos} 
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {initialOrgaos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Órgão Superior</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialOrgaos.map((orgao) => (
                <TableRow key={orgao.id}>
                  <TableCell>{orgao.nome}</TableCell>
                  <TableCell>{orgao.orgaos?.nome || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog open={isEditDialogOpen && selectedOrgao?.id === orgao.id} onOpenChange={(isOpen) => {
                      if (!isOpen) setSelectedOrgao(null);
                      setIsEditDialogOpen(isOpen);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setSelectedOrgao(orgao)}>
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Órgão</DialogTitle>
                        </DialogHeader>
                        <OrgaoForm 
                          onSubmit={handleUpdateSubmit} 
                          defaultValues={{ nome: orgao.nome, orgao_superior_id: orgao.orgao_superior_id || undefined }} 
                          orgaos={initialOrgaos}
                          currentOrgaoId={orgao.id}
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
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            {`Tem certeza que deseja excluir o órgão '${orgao.nome}'? Esta ação não pode ser desfeita.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(orgao.id)}>
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
          <p className="text-muted-foreground text-center py-4">
            Nenhum órgão cadastrado para esta prefeitura.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
