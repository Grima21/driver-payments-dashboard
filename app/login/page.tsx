"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { loginConServidor } from "./action";
import { Car, CreditCard, Wrench, HandCoins } from "lucide-react";

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<FormErrors>({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (email === "") {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (password === "") {
      newErrors.password = "Please enter your password";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setError(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    setAuthError("");

    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const resultado = await loginConServidor(email, password);

      if (!resultado.succes) {
        setAuthError(resultado.error || "Authentication failded");
      }
      console.log("Login successfully:", resultado.data);
      setTimeout(() => {
        router.push("/dashboard/payment");
      }, 2000);
      setSuccessMessage("Login Successfully");
    } catch (error) {
      setAuthError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  const FEACTURES = [
    {
      label: "Registro diario de pagos por conductor",
      icon: CreditCard,
    },
    {
      label: "Control de flota y vencimiento de documentos",
      icon: Car,
    },
    {
      label: "Historial de mantenimiento por vehiculo",
      icon: Wrench,
    },
    {
      label: "Gestion de deudas y plan de abonos",
      icon: HandCoins,
    },
  ];

  return (
    <div
      className="w-full min-h-screen mx-auto py-10 md:px-4"
      style={{
        background:
          "radial-gradient(circle at left top, rgba(56, 189, 248, 0.15), transparent 50%), linear-gradient(rgb(8, 17, 34) 0%, rgb(15, 23, 42) 100%)",
      }}
    >
      <header className="w-full max-w-7xl mx-auto flex items-center gap-4 px-4">
        <div className="w-9 h-9 bg-[#3b82f6] rounded-lg flex justify-center items-center border border-[#3f3f47] text-white">
          <Car className="w-5 h-5" />
        </div>
        <h2 className=" text-lg font-bold text-center">Driver Payment</h2>
      </header>

      <main className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-16 px-4 mt-20">
        <div className="flex-1">
          <h1 className="max-w-[325px] text-white leading-tight font-bold text-4xl mb-4">
            Gestiona tu flota de taxis facilmente
          </h1>
          <p className="text-[#6b8aaa] mb-10 text-base">
            Control de pagos, conductores, vehiculos y mantenimiento en un solo
            lugar.
          </p>
          <div>
            {FEACTURES.map(({ label, icon: Icon }, index) => (
              <div className="flex items-center gap-4 mb-4" key={index}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3b82f626] border border-[#3b82f640] text-[#60a5fa]">
                  <Icon size={20} />
                </div>
                <span className="text-[#94a3b8] text-sm ">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className=" w-full max-w-125 h-auto py-5 rounded-lg flex flex-col gap-6 px-5 justify-center  mx-auto">
          <div>
            <h2 className="text-lg lg:text-2xl font-bold mb-2">Bienvenido</h2>
            <p className="text-base md:text-md text-gray-500 mb-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="flex flex-col">
            <label
              className="text-[#94a3b8] font-medium text-xs mb-2"
              htmlFor="email"
            >
              Correo electronico
            </label>
            <input
              className="w-full border bg-custom-dark border-[#1e2d45] rounded-lg px-4 py-2 mb-4  text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="email"
              id="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error.email && (
              <p className="text-red-500 mb-1.5">{error.email}</p>
            )}
            <label htmlFor="password" className="text-base md:text-md mb-2">
              Contraseña
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              placeholder="************"
              className="w-full border bg-custom-dark border-[#1e2d45] rounded-lg px-4 py-2 mb-4  text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="w-full mt-4 bg-[#3b82f6] text-white py-2 px-4 rounded-lg hover:bg-[#2c65c0] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition ease-in"
            >
              Continue
            </button>
            <p className="text-red-500  min-h-5 mt-4">{error.password}</p>
            {authError && <p className="text-red-500 mt-4">{authError}</p>}
            {successMessage && (
              <p className="text-green-500">{successMessage}</p>
            )}
          </form>
          <div className="flex items-center">
            <div className="border-t border-[#1e2d45] grow"></div>
            <span className="text-xs mx-4 text-[#3a5070]">
              Or continue with
            </span>
            <div className="border-t border-[#1e2d45] grow"></div>
          </div>

          <button className=" flex items-center gap-2 justify-center font-medium text-sm w-full py-2.5 px-4 rounded-lg border border-[#1e2d45] text-[#cbd5e1] cursor-pointer hover:bg-[#18274a] transition ease-in">
            <img className="w-5 h-5" src="/google(1).svg" alt="logo Google" />
            Google
          </button>
          <p className="text-center text-base md:text-md text-gray-500">
            ¿No tienes cuenta?{" "}
            <a
              href="/register"
              className="text-blue-400 text-sm hover:text-blue-600"
            >
              Registrate
            </a>
          </p>
        </div>
      </main>
      <footer className="w-full max-w-7xl mx-auto px-4 mt-16 text-sm text-[#64748b]">
        <span>© 2025 Driver Payment. Todos los derechos reservados.</span>
      </footer>
    </div>
  );
}
