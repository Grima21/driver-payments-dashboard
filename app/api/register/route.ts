import { supabase } from "@/lib/client";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, role } = body;

  // validación
  if (!email || !password) {
    return Response.json(
      { success: false, message: "Missing fields" },
      { status: 400 },
    );
  }

  //Select para verificar si el usuario ya existe

  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existingUserError) {
    return Response.json(
      { success: false, message: existingUserError.message },
      { status: 500 },
    );
  }

  if (existingUser) {
    return Response.json(
      { success: false, message: "User already exists" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // insertar en la DB
  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword }]);

  // manejo de error
  if (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }

  // éxito
  return Response.json({
    success: true,
    message: "User registered successfully",
    data,
  });
}
