'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import { consultorFormSchema } from "../schema";
import { UserPicker } from "@/app/(app)/tarefas/_components/user-picker"; // Reutilizando o UserPicker

type Usuario = { id: string; nome: string };

interface ConsultorFormProps {
  onSubmit: (values: z.infer<typeof consultorFormSchema>) => void;
  defaultValues?: Partial<z.infer<typeof consultorFormSchema>>;
  usuarios: Usuario[];
}

export function ConsultorForm({ onSubmit, defaultValues, usuarios }: ConsultorFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!defaultValues;

  const form = useForm<z.infer<typeof consultorFormSchema>>({
    resolver: zodResolver(consultorFormSchema),
    defaultValues: defaultValues || {
      nome: "",
      email: "",
      usuario_id: undefined,
    },
  });

  const handleSubmit = (values: z.infer<typeof consultorFormSchema>) => {
    startTransition(() => {
      onSubmit(values);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do consultor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usuario_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vincular Usuário (Opcional)</FormLabel>
              <FormControl>
                <UserPicker
                  users={usuarios}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder="Selecione um usuário para vincular..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Criar Consultor")}
        </Button>
      </form>
    </Form>
  );
}
