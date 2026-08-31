export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Skeleton para las tarjetas de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 bg-slate-800/60 rounded-xl border border-slate-700/40"
          />
        ))}
      </div>

      {/* Skeleton para el área del gráfico o tabla */}
      <div className="h-72 bg-slate-800/60 rounded-xl border border-slate-700/40" />
    </div>
  );
}
