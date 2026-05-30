"use client";
import { supabase } from "@/lib/supabase";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type FormErrors = {
  email?: string;
  password?: string;
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<FormErrors>({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const route = useRouter();

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

    setIsLoading(false);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return setAuthError(error.message);
      } else {
        // Aquí puedes redirigir al usuario o mostrar un mensaje de éxito
        console.log("User registered successfully:", data);
        setSuccessMessage("User registered sucessfully");
      }
      setTimeout(() => {
        route.push("/login");
      }, 2000);
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again later.");
    }
  }

  return (
    <div className="max-w-375 h-auto mx-auto py-10 ">
      <div className="flex flex-col justify-center items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">Create Account</h1>
        <p className="text-lg text-gray-500">
          Please enter your credentials to create an account.
        </p>
      </div>

      <div className="w-125 h-auto py-5 border-2 border-[#27272a] rounded-lg flex flex-col gap-6 px-5 justify-center  mx-auto">
        <div>
          <h2 className="text-xl font-bold mb-2">Sign Up</h2>
          <p className="text-md text-gray-500 mb-2">
            Choose your preferred sign up method
          </p>
          <div className="flex gap-4">
            <button className="bg-[#18181b]  w-full h-9 text-md text-white rounded-lg cursor-pointer hover:bg-[#27272a]">
              Email
            </button>
            <button className="w-full bg-[#18181b] h-9  text-md text-white rounded-lg cursor-pointer hover:bg-[#27272a] ">
              {" "}
              Google
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <div className="border-t border-gray-500 grow"></div>
          <span className="mx-4 text-gray-500">Or continue with</span>
          <div className="border-t border-gray-500 grow"></div>
        </div>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col">
          <label className="text-md mb-2" htmlFor="email">
            Email
          </label>

          <input
            className="w-full border-2 border-neutral-800 rounded-lg p-2 mb-4 bg-[#18181b] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            id="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error.email && <p className="text-red-500 mt-1">{error.email}</p>}
          <label htmlFor="password" className="text-md mb-2">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            placeholder="************"
            className="w-full border-2 border-neutral-800 rounded-lg p-2 mb-4 bg-[#18181b] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full mt-4 bg-white text-black py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            Continue
          </button>
          <p className="text-red-500 mt-2 min-h-5">{error.password}</p>
          {authError && <p className="text-red-500 mt-2">{authError}</p>}
          {successMessage && (
            <p className="text-green-500 mt-2">{successMessage}</p>
          )}
        </form>
        <p className="text-center text-md text-gray-500">
          Don`t have an account?{" "}
          <a
            href="/login"
            className="text-gray-500 underline hover:text-gray-300"
          >
            Sign in
          </a>
        </p>
      </div>
      <p className="text-center text-sm text-gray-500 mt-8">
        By clicking continue, you agree to our
        <a className="text-gray-500 underline hover:text-gray-300" href="#">
          {" "}
          Terms of service{" "}
        </a>
        and
        <a className="text-gray-500 underline hover:text-gray-300 " href="#">
          {" "}
          Privacy Policy.
        </a>
      </p>
    </div>
  );
}
