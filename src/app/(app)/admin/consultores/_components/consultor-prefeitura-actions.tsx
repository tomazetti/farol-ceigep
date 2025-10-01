'use client'

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { VincularConsultorForm } from "./vincular-consultor-form";
import { vincularConsultorAPrefeitura, desvincularConsultorDePrefeitura } from "../actions";

type Consultor = {
  id: string;
  nome: string;
  email: string;
};

interface ConsultorPrefeituraActionsProps {
  prefeituraId: string;
  consultoresVinculados: Consultor[];
  consultoresDisponiveis: Consultor[];
  onDataChange: () => void;
}

export function ConsultorPrefeituraActions({
  prefeituraId,
  consultoresVinculados,
  consultoresDisponiveis,
  onDataChange,
}: ConsultorPrefeituraActionsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddSubmit = async (values: { consultor_id: string }) => {
    startTransition(async () => {
      const result = await vincularConsultorAPrefeitura(values.consultor_id, prefeituraId);
      if (result.error) {
        alert(result.error);
      } else {
        onDataChange();
        setIsAddDialogOpen(false);
      }
    });
  };

  const handleDelete = async (consultorId: string) => {
    startTransition(async () => {
      const result = await desvincularConsultorDePrefeitura(consultorId, prefeituraId);
      if (result.error) {
        alert(result.error);
      } else {
        onDataChange();
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Consultores Vinculados</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={consultoresDisponiveis.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Vincular Consultor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vincular Novo Consultor</DialogTitle>
            </DialogHeader>
            <VincularConsultorForm
              consultoresDisponiveis={consultoresDisponiveis}
              onSubmit={handleAddSubmit}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {consultoresVinculados.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultoresVinculados.map((consultor) => (
                <TableRow key={consultor.id}>
                  <TableCell>{consultor.nome}</TableCell>
                  <TableCell>{consultor.email}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja desvincular o consultor "{consultor.nome}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(consultor.id)}>
                            Desvincular
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Nenhum consultor vinculado a esta prefeitura.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
