import { getConsultores } from "./queries";
import { getUsuarios } from "../usuarios/queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ConsultorDialog } from "./_components/consultor-dialog";

export default async function ConsultoresPage() {
  const consultores = await getConsultores();
  const usuarios = await getUsuarios();

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Consultores</h1>
        <ConsultorDialog usuarios={usuarios}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Consultor
          </Button>
        </ConsultorDialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[64px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultores.length > 0 ? (
                consultores.map((consultor) => (
                  <TableRow key={consultor.id}>
                    <TableCell className="font-medium pl-6">{consultor.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{consultor.email}</TableCell>
                    <TableCell>{consultor.ativo ? "Ativo" : "Inativo"}</TableCell>
                    <TableCell className="pr-6">
                      <Button asChild variant="outline" size="icon">
                        <Link href={`/admin/consultores/${consultor.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Nenhum consultor encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
