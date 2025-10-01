'use client'

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConsultorForm } from "./consultor-form";
import { createConsultor } from "../actions";

type Usuario = { id: string; nome: string };

interface ConsultorDialogProps {
  usuarios: Usuario[];
  children: React.ReactNode;
}

export function ConsultorDialog({ usuarios, children }: ConsultorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (values: any) => {
    startTransition(async () => {
      const result = await createConsultor(values);
      if (result.error) {
        alert(result.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Consultor</DialogTitle>
        </DialogHeader>
        <ConsultorForm usuarios={usuarios} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
