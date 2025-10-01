'use client'

import { useEffect, useState, useTransition } from "react";
import { notFound } from "next/navigation";
import { getConsultorById } from "../queries";
import { updateConsultor, deleteConsultor } from "../actions";
import { getUsuarios } from "../../usuarios/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FilePenLine, Trash2 } from "lucide-react";
import { ConsultorForm } from "../_components/consultor-form";

type ConsultorData = Awaited<ReturnType<typeof getConsultorById>>;
type UsuariosData = Awaited<ReturnType<typeof getUsuarios>>;

export default function ConsultorPage({ params }: { params: { id: string } }) {
  const [consultor, setConsultor] = useState<ConsultorData>(null);
  const [usuarios, setUsuarios] = useState<UsuariosData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [consultorData, usuariosData] = await Promise.all([
        getConsultorById(params.id),
        getUsuarios(),
      ]);
      
      if (!consultorData) {
        notFound();
      } else {
        setConsultor(consultorData);
        setUsuarios(usuariosData);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [params.id]);

  const handleUpdateSubmit = async (values: any) => {
    if (!consultor) return;
    const result = await updateConsultor(consultor.id, values);
    if (!result.error) {
      const updatedData = await getConsultorById(params.id);
      setConsultor(updatedData);
      setIsEditDialogOpen(false);
      alert("Consultor atualizado com sucesso!");
    } else {
      alert(result.error);
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      if (!consultor) return;
      const result = await deleteConsultor(consultor.id);
      if (result?.error) {
        alert(result.error);
      } else {
        // Idealmente, redirecionar para a lista
        alert("Consultor excluído com sucesso!");
      }
    });
  };

  if (isLoading || !consultor) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Detalhes do Consultor</h1>
      <Card>
        <CardHeader>
          <CardTitle>{consultor.nome}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Email:</strong> {consultor.email}</p>
          <p><strong>Usuário Vinculado:</strong> {consultor.usuario?.nome || "Nenhum"}</p>
          <p><strong>Status:</strong> {consultor.ativo ? "Ativo" : "Inativo"}</p>
          <div className="flex justify-end space-x-2 pt-6">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FilePenLine className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Consultor</DialogTitle>
                </DialogHeader>
                <ConsultorForm
                  onSubmit={handleUpdateSubmit}
                  defaultValues={consultor}
                  usuarios={usuarios}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o consultor.
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

      {/* Seção de Vínculos com Prefeituras será adicionada aqui */}
    </div>
  );
}
