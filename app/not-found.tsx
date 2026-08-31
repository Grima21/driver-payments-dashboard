import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-slate-950">
      <h1 className="text-6xl font-bold text-amber-500 mb-2">404</h1>
      <p className="text-slate-300 text-base mb-6">
        La vista o el recurso que buscas no existe.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm rounded-lg border border-slate-700 transition-colors"
      >
        Volver al Panel Principal
      </Link>
    </div>
  );
}
