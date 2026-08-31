"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-6 bg-slate-900/50 rounded-xl border border-slate-800">
      <h2 className="text-xl font-semibold text-slate-100 mb-2">
        Ocurrió un problema al sincronizar los datos
      </h2>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">
        No pudimos obtener la información más reciente de la flota.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium text-sm rounded-lg transition-colors"
      >
        Reintentar conexión
      </button>
    </div>
  );
}
