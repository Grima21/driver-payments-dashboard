// Borré importaciones que no estabas usando (como useMaintenance y VehicleDetail)
import { useState } from "react";
import { X } from "lucide-react";

export default function MaintenanceForm({
  onClose,
  onSave,
}: {
  onClose: () => void; // 1. Agregamos el tipado para onClose
  onSave: (data: any) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = {
      title: title,
      cost: Number(cost),
      vehicle_id: Number(vehicleId),
      description: description,
      date: date,
      type: type,
    };
    console.log("Datos listos para Supabase:", formData);

    try {
      await onSave(formData);
      alert("Mantenimiento guardado con éxito!");
      onClose(); // 2. ¡Buena práctica! Cerramos el modal automáticamente si todo salió bien
    } catch (error) {
      alert("Hubo un error al guardar");
      console.error("Detalle del error:", error);
    }

    // 3. Borré el onSave duplicado que tenías aquí abajo
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-4xl border border-white/5 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        {/* 4. Le agregamos onClick={onClose} y type="button" a la X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold text-white mt-4 mb-2 uppercase tracking-wider border-b border-neutral-800 pb-1">
            Agregar Mantenimiento
          </h2>

          {/* 5. FALTABA EL TÍTULO: Lo agregué aquí */}
          <div className="w-full mb-4">
            <label className="mb-2 text-sm text-gray-400">
              Título del trabajo
            </label>
            <input
              className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              type="text"
              placeholder="Ej: Cambio de aceite"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="w-full">
              <label className="mb-2 text-sm text-gray-400">Fecha</label>
              <input
                className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)} // ¡Agregado!
              />
            </div>
            <div className="w-full">
              <label className="mb-2 text-sm text-gray-400">Vehículo</label>
              <select
                className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)} // ¡Agregado!
              >
                <option value="">Selecciona un auto...</option>
                <option value="15">Hyundai Accent</option>
                <option value="18">Hyundai Accent</option>
                {/* Nota: Los values aquí idealmente serán los IDs de Supabase */}
                <option value="16">Kia Picanto</option>
                <option value="17">Hyundai i10</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="w-full">
              <label className="mb-2 text-sm text-gray-400">
                Tipo de mantenimiento
              </label>
              <select
                className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                value={type}
                onChange={(e) => setType(e.target.value)} // ¡Agregado!
              >
                <option value="">Selecciona el tipo...</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </div>
            <div className="w-full">
              <label className="mb-2 text-sm text-gray-400">Costo ($)</label>
              <input
                className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)} // ¡Agregado!
              />
            </div>
          </div>

          <label className="mb-2 text-sm text-gray-400">Descripción</label>
          <input
            className="w-full rounded-xl py-4 border border-slate-700/70 bg-input-custom px-4 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)} // ¡Agregado!
          />

          <div className="flex justify-end gap-4 mt-6">
            {/* 6. Le pusimos type="button" y onClick={onClose} */}
            <button
              type="button"
              onClick={onClose}
              className="bg-[#3f3f46] text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex justify-center transition-colors hover:bg-[#2d2d30] hover:border-[#4b4b4b]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex justify-center transition-colors hover:bg-blue-700"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
