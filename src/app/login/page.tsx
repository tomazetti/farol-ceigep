'use client'

import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { login } from "./actions";

function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [formResult, setFormResult] = useState<{ success: boolean; message: string } | null>(null);
  const [urlMessage, setUrlMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setUrlMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUrlMessage(null); // Limpa a mensagem da URL ao tentar novamente
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      if (result.success) {
        router.push('/painel');
      } else {
        setFormResult(result);
      }
    });
  };

  const errorMessage = urlMessage || (formResult && !formResult.success ? formResult.message : null);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Login</CardTitle>
        <CardDescription>
          Entre com seu email para acessar o painel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Senha</Label>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          {errorMessage && (
            <p className="text-sm font-medium text-destructive">
              {errorMessage}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Entrando..." : "Login"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Não tem uma conta?</span>{" "}
          <Link href="/cadastro" className="underline font-semibold">
            Cadastre-se
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm text-center mb-8">
        <h1 className="text-2xl font-bold">Farol CEIGEP</h1>
      </div>
      <Suspense fallback={<div>Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
