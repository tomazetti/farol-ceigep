import { z } from "zod";

export const consultorFormSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
  usuario_id: z.string().uuid("Selecione um usuário.").optional().nullable(),
});
