import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getUsuarios } from "./queries";
import { UsuarioActions } from "./_components/usuario-actions";

export default async function UsuariosPage() {
  const usuarios = await getUsuarios();

  return (
    <div className="p-6">
      <UsuarioActions usuarios={usuarios} />
    </div>
  );
}
