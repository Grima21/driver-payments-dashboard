"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
    console.log("SUBMIT EJECUTADO");
    const supabase = createClient();
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      const user = await supabase.auth.getUser();
      console.log("USER", user);
      if (error) {
        setAuthError(error.message);
        return;
      }
      console.log("Login successfully:", data);
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

  return (
    <div className=" w-full max-w-7xl h-full mx-auto py-10 mt-10 md:px-4  ">
      <div className="flex flex-col justify-center items-center gap-4 mb-8 text-center">
        <h1 className=" text-2xl md:text-3xl lg:text-4xl  font-bold text-center">
          Welcome Back
        </h1>
        <p className="text-base md:text-lg text-gray-500">
          Please enter your credentials to access your account.
        </p>
      </div>

      <div className=" w-full max-w-125 h-auto py-5 border-2 border-[#27272a] rounded-lg flex flex-col gap-6 px-5 justify-center  mx-auto">
        <div>
          <h2 className="text-lg md:text-xl font-bold mb-2">Sign In</h2>
          <p className="text-base md:text-md text-gray-500 mb-2">
            Choose your preferred sign in method
          </p>
          <div className="flex  gap-4">
            <button className="bg-[#18181b]  w-full h-9 text-base md:text-md text-white rounded-lg cursor-pointer hover:bg-[#27272a]">
              Email
            </button>
            <button className="w-full bg-[#18181b] h-9  text-base md:text-md text-white rounded-lg cursor-pointer hover:bg-[#27272a] ">
              {" "}
              Google
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <div className="border-t border-gray-500 grow"></div>
          <span className="text-base md:text-md mx-4 text-gray-500">
            Or continue with
          </span>
          <div className="border-t border-gray-500 grow"></div>
        </div>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col">
          <label className="text-base md:text-md mb-2" htmlFor="email">
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
          {error.email && <p className="text-red-500 mb-1.5">{error.email}</p>}
          <label htmlFor="password" className="text-base md:text-md mb-2">
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
          <p className="text-red-500  min-h-5 mt-4">{error.password}</p>
          {authError && <p className="text-red-500 mt-4">{authError}</p>}
          {successMessage && <p className="text-green-500">{successMessage}</p>}
        </form>
        <p className="text-center text-base md:text-md text-gray-500">
          Don`t have an account?{" "}
          <a
            href="/register"
            className="text-gray-500 underline hover:text-gray-300"
          >
            Sign up
          </a>
        </p>
      </div>
      <p className="text-center text-sm text-gray-500 mt-4">
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
