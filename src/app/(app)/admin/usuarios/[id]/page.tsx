'use client'

import { useEffect, useState, useTransition, use } from "react"
import { notFound } from "next/navigation"
import { getUsuarioById } from "../queries"
import { updateUsuario, deleteUsuario } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { FilePenLine, Trash2 } from "lucide-react"
import { UsuarioEditForm } from "../_components/usuario-edit-form"
import { z } from "zod"
import { usuarioEditSchema } from "../schema"

type UsuarioData = Awaited<ReturnType<typeof getUsuarioById>>

interface UsuarioPageProps {
  params: any
}

export default function UsuarioPage({ params: paramsProp }: UsuarioPageProps) {
  const params = use(paramsProp) as { id: string }
  const { id } = params

  const [usuario, setUsuario] = useState<UsuarioData>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const data = await getUsuarioById(id)
      if (!data) {
        notFound()
      } else {
        setUsuario(data)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [id])

  const handleUpdateSubmit = async (values: z.infer<typeof usuarioEditSchema>) => {
    if (!usuario) return

    const result = await updateUsuario(usuario.id, values)
    if (!result.error) {
      const updatedData = await getUsuarioById(id)
      setUsuario(updatedData)
      setIsEditDialogOpen(false)
      alert("Usuário atualizado com sucesso!")
    } else {
      alert(result.error)
    }
  }

  const handleDelete = () => {
    startTransition(async () => {
      if (!usuario) return
      const result = await deleteUsuario(usuario.id)
      if (result?.error) {
        alert(result.error)
      }
    })
  }

  if (isLoading || !usuario) {
    return <div className="p-6">Carregando...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-fg-strong mb-6">
        Detalhes do Usuário
      </h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{usuario.nome}</CardTitle>
          <div className="space-x-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilePenLine className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Usuário</DialogTitle>
                </DialogHeader>
                <UsuarioEditForm
                  onSubmit={handleUpdateSubmit}
                  defaultValues={{
                    nome: usuario.nome,
                    email: usuario.email,
                    cpf: '', // CPF fica vazio por segurança
                    tipo: usuario.tipo,
                    ativo: String(usuario.ativo),
                  }}
                />
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o
                    usuário e todos os seus dados associados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                    {isPending ? "Excluindo..." : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Email:</strong> {usuario.email}
          </p>
          <p>
            <strong>Tipo:</strong> {usuario.tipo}
          </p>
          <div>
            <strong>Status:</strong>{" "}
            <Badge variant={usuario.ativo ? "default" : "destructive"}>
              {usuario.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <p className="text-sm text-fg-muted pt-4">
            Cadastrado em: {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
