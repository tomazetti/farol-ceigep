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
import { useTransition } from "react"

const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
})

type SecretariaFormValues = z.infer<typeof formSchema>

interface SecretariaFormProps {
  onSubmit: (values: SecretariaFormValues) => Promise<void>
  defaultValues?: Partial<SecretariaFormValues>
}

export function SecretariaForm({ onSubmit, defaultValues }: SecretariaFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<SecretariaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || { nome: "" },
  })

  const handleSubmit = (values: SecretariaFormValues) => {
    startTransition(async () => {
      await onSubmit(values)
      form.reset()
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
              <FormLabel>Nome da Secretaria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Secretaria de Educação" {...field} />
              </FormControl>
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
