import { z } from "zod"

export const vinculoFormSchema = z.object({
  usuario_id: z.string().uuid("ID de usuário inválido"),
  orgao_id: z.string().uuid("ID de órgão inválido").optional(),
})
