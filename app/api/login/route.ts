import { supabase } from "@/lib/client";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    console.log("ENTRÓ AL ENDPOINT");

    const body = await request.json();
    console.log("BODY:", body);

    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, message: "Missing fields" },
        { status: 400 },
      );
    }

    console.log("ANTES DE SUPABASE");

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    console.log("DESPUÉS DE SUPABASE");
    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      return Response.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, data.password);

    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: "Invalid password" },
        { status: 401 },
      );
    }

    return Response.json({
      success: true,
      message: "Login successful",
    });
  } catch (err) {
    console.log("🔥 FATAL ERROR:", err);

    return Response.json(
      { success: false, message: "Server crashed" },
      { status: 500 },
    );
  }
}
