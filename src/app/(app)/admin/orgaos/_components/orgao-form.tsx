'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { useTransition } from "react"

const orgaoFormSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  orgao_superior_id: z.string().uuid().optional(),
})

type Orgao = {
  id: string
  nome: string
}

interface OrgaoFormProps {
  onSubmit: (values: z.infer<typeof orgaoFormSchema>) => Promise<void>
  defaultValues?: Partial<z.infer<typeof orgaoFormSchema>>
  orgaos: Orgao[]
  currentOrgaoId?: string
}

export function OrgaoForm({ onSubmit, defaultValues, orgaos, currentOrgaoId }: OrgaoFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof orgaoFormSchema>>({
    resolver: zodResolver(orgaoFormSchema),
    defaultValues: defaultValues || {
      nome: "",
      orgao_superior_id: undefined,
    },
  })

  const handleSubmit = (values: z.infer<typeof orgaoFormSchema>) => {
    const submissionValues = {
      ...values,
      orgao_superior_id: values.orgao_superior_id === 'none' ? undefined : values.orgao_superior_id,
    }
    startTransition(() => {
      onSubmit(submissionValues)
    })
  }

  const filteredOrgaos = orgaos.filter(o => o.id !== currentOrgaoId)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Órgão</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Secretaria de Educação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orgao_superior_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Órgão Superior (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'none'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {filteredOrgaos.map((orgao) => (
                    <SelectItem key={orgao.id} value={orgao.id}>
                      {orgao.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  )
}
