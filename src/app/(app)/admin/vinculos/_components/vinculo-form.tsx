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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useTransition } from "react"
import { vinculoFormSchema } from "../schema"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

type UsuarioDisponivel = {
  id: string
  nome: string
}

type Orgao = {
  id: string
  nome: string
}

interface VinculoFormProps {
  usuariosDisponiveis: UsuarioDisponivel[]
  orgaos: Orgao[]
  onSubmit: (values: z.infer<typeof vinculoFormSchema>) => Promise<void>
  defaultValues?: Partial<z.infer<typeof vinculoFormSchema>>
}

export function VinculoForm({ usuariosDisponiveis, orgaos, onSubmit, defaultValues }: VinculoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = React.useState(false)

  const form = useForm<z.infer<typeof vinculoFormSchema>>({
    resolver: zodResolver(vinculoFormSchema),
    defaultValues,
  })

  const handleSubmit = (values: z.infer<typeof vinculoFormSchema>) => {
    const submissionValues = {
      ...values,
      orgao_id: values.orgao_id === 'none' ? undefined : values.orgao_id,
    }
    startTransition(() => {
      onSubmit(submissionValues)
    })
  }

  const isEditing = !!defaultValues

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="usuario_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Usuário</FormLabel>
              <Popover open={open} onOpenChange={setOpen} modal={false}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={isEditing}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? (usuariosDisponiveis.find(
                            (user) => user.id === field.value
                          )?.nome || defaultValues?.usuario_id)
                        : "Selecione um usuário"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar usuário..." />
                    <CommandList>
                      <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                      <CommandGroup>
                        {usuariosDisponiveis.map((user) => (
                          <CommandItem
                            value={user.nome}
                            key={user.id}
                            onSelect={() => {
                              form.setValue("usuario_id", user.id)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                user.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {user.nome}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orgao_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Órgão (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {orgaos.map((orgao) => (
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
          {isPending ? (isEditing ? "Salvando..." : "Vinculando...") : (isEditing ? "Salvar Alterações" : "Vincular Usuário")}
        </Button>
      </form>
    </Form>
  )
}