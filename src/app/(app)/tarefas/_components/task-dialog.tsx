'use client'

import React, { useTransition, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { taskFormSchema } from "../schema";
import { UserPicker } from "./user-picker";
import { createTask, updateTask } from "../actions";

type Usuario = { id: string; nome: string };
type Task = any;

interface TaskDialogProps {
  usuarios: Usuario[];
  prefeituraId: string | null;
  task?: Task;
  onTaskCreated: () => void;
  onTaskUpdated: () => void;
  children: React.ReactNode;
}

export function TaskDialog({
  usuarios,
  prefeituraId,
  task,
  onTaskCreated,
  onTaskUpdated,
  children,
}: TaskDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!task;

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      titulo: task?.titulo || "",
      descricao: task?.descricao || "",
      responsavel_id: task?.responsavel_id || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        titulo: task?.titulo || "",
        descricao: task?.descricao || "",
        responsavel_id: task?.responsavel_id || "",
      });
    }
  }, [isOpen, task, form]);

  const handleSubmit = (values: z.infer<typeof taskFormSchema>) => {
    startTransition(async () => {
      let result;
      if (isEditing) {
        result = await updateTask(task.id, values);
      } else {
        if (!prefeituraId) {
          alert("Selecione uma prefeitura para criar uma tarefa.");
          return;
        }
        result = await createTask(prefeituraId, values);
      }

      if (result.error) {
        alert(result.error);
      } else {
        if (isEditing) onTaskUpdated();
        else onTaskCreated();
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Tarefa" : "Criar Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes da tarefa..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsavel_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl>
                    <UserPicker
                      users={usuarios}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Criar Tarefa")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
