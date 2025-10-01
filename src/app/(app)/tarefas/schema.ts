import { z } from "zod";

export const taskFormSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  descricao: z.string().optional(),
  responsavel_id: z.string().uuid("Selecione um responsável."),
});
