"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
export async function loginConServidor(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { data, error } = await (
    await supabase
  ).auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { succes: false, error: error.message };
  }
  return { succes: true, data };
}

export async function cerrarSesion() {
  const supabase = createClient();

  await (await supabase).auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("sb-ixnlvofaqqslvkpqlrhv-auth-token");

  redirect("/login");
}
