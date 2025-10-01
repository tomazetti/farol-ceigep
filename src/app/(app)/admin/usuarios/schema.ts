import { z } from "zod"

export const usuarioFormSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("Email inválido."),
  cpf: z.string().length(14, "CPF incompleto."), // 11 dígitos + 3 caracteres de formatação
  tipo: z.enum(['admin', 'consultor', 'municipal'], {
    errorMap: () => ({ message: "Selecione um tipo de usuário." }),
  }),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
})

export const usuarioEditSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("Email inválido."),
  cpf: z.string().length(14, "CPF incompleto.").or(z.literal('')),
  tipo: z.enum(['admin', 'consultor', 'municipal']),
  ativo: z.enum(['true', 'false']),
})
