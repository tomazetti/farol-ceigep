'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useTransition } from "react";
import { MaskedInput } from "@/components/ui/masked-input";
import { createHash } from 'crypto';
import { createBrowserClientClient } from "@/lib/supabase/utils";
import { signup } from "./actions";

// Função de validação de CPF (algoritmo do módulo 11)
const validateCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const digits = cpf.split('').map(Number);
  const validator = (n: number) => digits.slice(0, n).reduce((sum, digit, index) => sum + digit * (n + 1 - index), 0) % 11;
  const rest = (n: number) => (n < 2) ? 0 : 11 - n;
  return rest(validator(9)) === digits[9] && rest(validator(10)) === digits[10];
};

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [formResult, setFormResult] = useState<{ success: boolean; message: string } | null>(null);
  const supabase = createBrowserClientClient();

  const handleCpfBlur = async () => {
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (!cleanedCpf) {
      setCpfError(null);
      return;
    }

    if (!validateCPF(cleanedCpf)) {
      setCpfError("CPF inválido.");
      return;
    }

    const cpfHash = createHash('sha256').update(cleanedCpf).digest('hex');
    const { data, error } = await supabase.rpc('cpf_exists', { p_cpf_hash: cpfHash });

    if (error) {
      console.error("Erro ao verificar CPF:", error);
      setCpfError("Erro ao verificar CPF. Tente novamente.");
    } else if (data) {
      setCpfError("CPF já cadastrado.");
    } else {
      setCpfError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await signup(formData);
      setFormResult(result);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm text-center mb-8">
        <h1 className="text-2xl font-bold text-fg-strong">Farol</h1>
      </div>
      <Card className="w-full max-w-sm shadow-s2">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-fg-strong">
            {formResult?.success ? "Cadastro Realizado!" : "Cadastro"}
          </CardTitle>
          <CardDescription className="text-fg-muted">
            {formResult?.success 
              ? "Siga as instruções enviadas para o seu e-mail." 
              : "Crie sua conta para acessar a plataforma"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formResult?.success ? (
            <div className="text-center">
              <p className="mb-4 text-fg">{formResult.message}</p>
              <Button asChild className="h-11">
                <Link href="/login">Ir para o Login</Link>
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" name="nome" placeholder="Seu Nome" required className="h-11" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <MaskedInput
                    mask="000.000.000-00"
                    value={cpf}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onAccept={(value: any) => setCpf(String(value))}
                    onBlur={handleCpfBlur}
                    id="cpf"
                    name="cpf"
                    placeholder="000.000.000-00"
                    required
                    className="h-11"
                  />
                  {cpfError && <p className="text-sm font-medium text-destructive">{cpfError}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="h-11"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" required className="h-11" />
                </div>
                {formResult && !formResult.success && (
                  <p className="text-sm font-medium text-destructive">
                    {formResult.message}
                  </p>
                )}
                <Button type="submit" className="w-full h-11" disabled={isPending || !!cpfError}>
                  {isPending ? "Cadastrando..." : "Criar conta"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                <span className="text-fg-muted">Já tem uma conta?</span>{" "}
                <Link href="/login" className="underline text-fg-strong font-semibold">
                  Entrar
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}