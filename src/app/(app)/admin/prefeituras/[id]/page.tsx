'use client'

import { useEffect, useState, useTransition, use } from "react"
import { notFound } from "next/navigation"
import { getPrefeituraById } from "../queries"
import { updatePrefeitura, deletePrefeitura } from "../actions"
import { getOrgaosByPrefeituraId } from "../../orgaos/queries"
import { OrgaoActions } from "../../orgaos/_components/orgao-actions"
import { getUsuariosVinculados, getUsuariosDisponiveis } from "../../vinculos/queries"
import { VinculoActions } from "../../vinculos/_components/vinculo-actions"
import { getConsultoresVinculados, getConsultoresDisponiveis } from "../../consultores/queries"
import { ConsultorPrefeituraActions } from "../../consultores/_components/consultor-prefeitura-actions"
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
type OrgaosData = Awaited<ReturnType<typeof getOrgaosByPrefeituraId>>
type UsuariosVinculadosData = Awaited<ReturnType<typeof getUsuariosVinculados>>
type UsuariosDisponiveisData = Awaited<ReturnType<typeof getUsuariosDisponiveis>>
type ConsultoresVinculadosData = Awaited<ReturnType<typeof getConsultoresVinculados>>
type ConsultoresDisponiveisData = Awaited<ReturnType<typeof getConsultoresDisponiveis>>

interface PrefeituraPageProps {
  params: any
}

export default function PrefeituraPage({ params: paramsProp }: PrefeituraPageProps) {
  const params = use(paramsProp) as { id: string }
  const { id } = params

  const [prefeitura, setPrefeitura] = useState<PrefeituraData>(null)
  const [orgaos, setOrgaos] = useState<OrgaosData>([])
  const [usuariosVinculados, setUsuariosVinculados] = useState<UsuariosVinculadosData>([])
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<UsuariosDisponiveisData>([])
  const [consultoresVinculados, setConsultoresVinculados] = useState<ConsultoresVinculadosData>([])
  const [consultoresDisponiveis, setConsultoresDisponiveis] = useState<ConsultoresDisponiveisData>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const fetchData = async () => {
    const [
      orgaosData,
      usuariosVinculadosData,
      consultoresVinculadosData,
      consultoresDisponiveisData,
    ] = await Promise.all([
      getOrgaosByPrefeituraId(id),
      getUsuariosVinculados(id),
      getConsultoresVinculados(id),
      getConsultoresDisponiveis(id),
    ])
    setOrgaos(orgaosData)
    setUsuariosVinculados(usuariosVinculadosData)
    setConsultoresVinculados(consultoresVinculadosData)
    setConsultoresDisponiveis(consultoresDisponiveisData)
  }

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true)
      const [
        prefeituraData,
        orgaosData,
        usuariosVinculadosData,
        usuariosDisponiveisData,
        consultoresVinculadosData,
        consultoresDisponiveisData,
      ] = await Promise.all([
        getPrefeituraById(id),
        getOrgaosByPrefeituraId(id),
        getUsuariosVinculados(id),
        getUsuariosDisponiveis(),
        getConsultoresVinculados(id),
        getConsultoresDisponiveis(id),
      ])
      
      if (!prefeituraData) {
        notFound()
      } else {
        setPrefeitura(prefeituraData)
        setOrgaos(orgaosData)
        setUsuariosVinculados(usuariosVinculadosData)
        setUsuariosDisponiveis(usuariosDisponiveisData)
        setConsultoresVinculados(consultoresVinculadosData)
        setConsultoresDisponiveis(consultoresDisponiveisData)
      }
      setIsLoading(false)
    }
    fetchInitialData()
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
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
          <p className="text-sm text-muted-foreground pt-4">
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

      <OrgaoActions 
        prefeituraId={prefeitura.id} 
        orgaos={orgaos}
        onDataChange={fetchData}
      />

      <VinculoActions
        prefeituraId={prefeitura.id}
        usuariosVinculados={usuariosVinculados}
        usuariosDisponiveis={usuariosDisponiveis}
        orgaos={orgaos}
        onDataChange={fetchData}
      />

      <ConsultorPrefeituraActions
        prefeituraId={prefeitura.id}
        consultoresVinculados={consultoresVinculados}
        consultoresDisponiveis={consultoresDisponiveis}
        onDataChange={fetchData}
      />
    </div>
  )
}