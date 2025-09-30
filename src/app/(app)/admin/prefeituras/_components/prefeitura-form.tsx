'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState, useTransition } from "react"
import { getUfs, getMunicipiosByUf } from "../queries"

const formSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  municipio_id: z.string().uuid("Selecione um município válido."),
})

type PrefeituraFormValues = z.infer<typeof formSchema>

interface PrefeituraFormProps {
  onSubmit: (values: PrefeituraFormValues) => Promise<void>
  defaultValues?: Partial<PrefeituraFormValues>
}

type Uf = {
  uf_sigla: string | null
  uf_nome: string
}

type Municipio = {
  id: string
  nome: string
}

export function PrefeituraForm({ onSubmit, defaultValues }: PrefeituraFormProps) {
  const [isPending, startTransition] = useTransition()
  const [ufs, setUfs] = useState<Uf[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [selectedUf, setSelectedUf] = useState<string | null>(null)
  const [isLoadingUfs, setIsLoadingUfs] = useState(true)
  const [isLoadingMunicipios, setIsLoadingMunicipios] = useState(false)

  const form = useForm<PrefeituraFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || { nome: "", municipio_id: "" },
  })

  useEffect(() => {
    const fetchUfs = async () => {
      setIsLoadingUfs(true)
      const ufsData = await getUfs()
      setUfs(ufsData)
      setIsLoadingUfs(false)
    }
    fetchUfs()
  }, [])

  useEffect(() => {
    const fetchMunicipios = async () => {
      if (selectedUf) {
        setIsLoadingMunicipios(true)
        setMunicipios([]) // Limpa a lista de municípios ao trocar de UF
        form.resetField('municipio_id') // Reseta o campo do formulário
        const municipiosData = await getMunicipiosByUf(selectedUf)
        setMunicipios(municipiosData)
        setIsLoadingMunicipios(false)
      }
    }
    fetchMunicipios()
  }, [selectedUf, form])


  const handleSubmit = (values: PrefeituraFormValues) => {
    startTransition(async () => {
      await onSubmit(values)
      form.reset()
      setSelectedUf(null)
      setMunicipios([])
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Prefeitura</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Prefeitura Municipal de..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4">
          <FormItem className="w-24">
            <FormLabel>UF</FormLabel>
            <Select
              onValueChange={(value) => setSelectedUf(value)}
              disabled={isLoadingUfs}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingUfs ? "..." : "UF"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ufs.filter(uf => uf.uf_sigla).map((uf) => (
                  <SelectItem key={uf.uf_sigla} value={uf.uf_sigla!}>
                    {uf.uf_sigla}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="municipio_id"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Município</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedUf || isLoadingMunicipios}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingMunicipios
                          ? "Carregando..."
                          : !selectedUf
                            ? "Selecione uma UF"
                            : "Selecione um município"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {municipios.map((municipio) => (
                      <SelectItem key={municipio.id} value={municipio.id}>
                        {municipio.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  )
}
