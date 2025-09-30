'use client'

import { useEffect, useState, useTransition, use } from "react"
import { notFound } from "next/navigation"
import { getPrefeituraById } from "../queries"
import { updatePrefeitura, deletePrefeitura } from "../actions"
import { getSecretariasByPrefeituraId } from "../../secretarias/queries"
import { SecretariaActions } from "../../secretarias/_components/secretaria-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { PrefeituraForm } from "../_components/prefeitura-form"

type PrefeituraData = Awaited<ReturnType<typeof getPrefeituraById>>
type SecretariasData = Awaited<ReturnType<typeof getSecretariasByPrefeituraId>>

interface PrefeituraPageProps {
  params: {
    id: string
  }
}

export default function PrefeituraPage({ params: paramsProp }: PrefeituraPageProps) {
  const params = use(paramsProp)
  const { id } = params

  const [prefeitura, setPrefeitura] = useState<PrefeituraData>(null)
  const [secretarias, setSecretarias] = useState<SecretariasData>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const [prefeituraData, secretariasData] = await Promise.all([
        getPrefeituraById(id),
        getSecretariasByPrefeituraId(id)
      ])
      
      if (!prefeituraData) {
        notFound()
      } else {
        setPrefeitura(prefeituraData)
        setSecretarias(secretariasData)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [id])

  const handleUpdateSubmit = async (values: { nome: string; municipio_id: string }) => {
    if (!prefeitura) return

    const result = await updatePrefeitura(prefeitura.id, values)
    if (!result.error) {
      const updatedData = await getPrefeituraById(id)
      setPrefeitura(updatedData)
      setIsEditDialogOpen(false)
      alert("Prefeitura atualizada com sucesso!")
    } else {
      alert(result.error)
    }
  }

  const handleDelete = () => {
    startTransition(async () => {
      if (!prefeitura) return
      const result = await deletePrefeitura(prefeitura.id)
      if (result?.error) {
        alert(result.error)
      }
    })
  }

  if (isLoading || !prefeitura) {
    return <div className="p-6">Carregando...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-fg-strong mb-6">
        Detalhes da Prefeitura
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{prefeitura.nome}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Município:</strong> {prefeitura.municipios?.nome || "N/A"}
          </p>
          <p>
            <strong>UF:</strong> {prefeitura.municipios?.uf_sigla || "N/A"}
          </p>
          <p className="text-sm text-fg-muted pt-4">
            Cadastrada em: {new Date(prefeitura.created_at).toLocaleDateString('pt-BR')}
          </p>
          <div className="flex justify-end space-x-2 pt-6">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilePenLine className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Prefeitura</DialogTitle>
                </DialogHeader>
                <PrefeituraForm
                  onSubmit={handleUpdateSubmit}
                  defaultValues={{
                    nome: prefeitura.nome,
                    municipio_id: prefeitura.municipio_id || "",
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
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente a
                    prefeitura e todos os seus dados associados.
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
        </CardContent>
      </Card>

      <SecretariaActions prefeituraId={prefeitura.id} secretarias={secretarias} />
    </div>
  )
}
