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
import { useTransition } from "react";
import { UserPicker } from "@/app/(app)/tarefas/_components/user-picker"; // Reutilizando o UserPicker

const vincularConsultorSchema = z.object({
  consultor_id: z.string().uuid("Selecione um consultor."),
});

type Consultor = { id: string; nome: string };

interface VincularConsultorFormProps {
  onSubmit: (values: z.infer<typeof vincularConsultorSchema>) => void;
  consultoresDisponiveis: Consultor[];
}

export function VincularConsultorForm({ onSubmit, consultoresDisponiveis }: VincularConsultorFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof vincularConsultorSchema>>({
    resolver: zodResolver(vincularConsultorSchema),
  });

  const handleSubmit = (values: z.infer<typeof vincularConsultorSchema>) => {
    startTransition(() => {
      onSubmit(values);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="consultor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consultor</FormLabel>
              <FormControl>
                <UserPicker
                  users={consultoresDisponiveis}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder="Selecione um consultor..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Vinculando..." : "Vincular Consultor"}
        </Button>
      </form>
    </Form>
  );
}
