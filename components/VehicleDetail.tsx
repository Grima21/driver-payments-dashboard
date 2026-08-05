import { X, Car, ShieldCheck, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Vehicle = {
  id: string | number;
  make_model: string;
  license_plate: string;
  year: string;
  color: string;
  status: string;
  insurance_due_date: string;
  plate_due_date: string;
  maintenance_date: string;
  maintenance_note: string;
};

interface VehicleDetailProps {
  vehicle: Vehicle[];
  onClose: () => void;
}

// 1. AQUI PONEMOS TODA LA LÓGICA DE LAS FECHAS Y COLORES (Fuera del componente principal)
function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const diff =
    new Date(iso + "T00:00:00").getTime() -
    new Date(new Date().toDateString()).getTime();
  return Math.round(diff / 86400000);
}

type DocStatus = "vigente" | "proximo" | "vencido";

function docStatus(iso: string): DocStatus {
  if (!iso) return "vigente";
  const days = daysUntil(iso);
  if (days === null) return "vigente";
  if (days < 0) return "vencido";
  if (days <= 30) return "proximo";
  return "vigente";
}

const STATUS_STYLES: Record<
  DocStatus,
  { bg: string; color: string; border: string; label: string }
> = {
  // Ajusté los colores para que coincidan exactamente con tu diseño
  vigente: {
    bg: "#0a2518",
    color: "#10b981",
    border: "#166534",
    label: "Vigente",
  },
  proximo: {
    bg: "#1f1500",
    color: "#fbbf24",
    border: "#fbbf24",
    label: "Próximo a Vencer",
  },
  vencido: {
    bg: "#2d1a1a",
    color: "#ef4444",
    border: "#7f1d1d",
    label: "Vencido",
  },
};

function getSubtitleText(date: string) {
  if (!date) return "Sin fecha";
  const days = daysUntil(date);
  if (days === null) return "";
  if (days < 0) return `Vencido hace ${Math.abs(days)} días`;
  if (days === 0) return "Vence hoy";
  return `En ${days} días`;
}

// 2. CREAMOS UNA FILA REUTILIZABLE CON TUS ESTILOS EXACTOS
function DocumentRow({ title, date }: { title: string; date: string }) {
  const status = docStatus(date);
  const styles = STATUS_STYLES[status];
  const subtitleText = getSubtitleText(date);

  return (
    <div className="flex justify-between gap-4 mt-2 border-b border-neutral-700/50 pb-2">
      <div className="flex items-center gap-4">
        <ShieldCheck className="text-blue-400" />
        <div className="flex flex-col">
          <span className="text-white text-md">{title}</span>
          <span className="text-[#4b6080] text-sm">
            {date} · {subtitleText}
          </span>
        </div>
      </div>
      <span
        className="flex items-center text-xs rounded-xl font-semibold px-2 py-2 border"
        style={{
          backgroundColor: styles.bg,
          color: styles.color,
          borderColor: styles.border,
        }}
      >
        {styles.label}
      </span>
    </div>
  );
}

// 3. TU COMPONENTE PRINCIPAL
export default function VehicleDetail({
  vehicle,
  onClose,
}: VehicleDetailProps) {
  if (!vehicle) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#0f1c2e] rounded-lg shadow-lg w-full max-w-xl m-auto p-8 relative flex flex-col justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-white">
          Detalles del Vehículo
        </h2>

        <div key={vehicle.id}>
          <div className="flex items-center gap-4 mb-6 border-b border-neutral-700/50 pb-4">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-800 text-white">
              <Car className="text-blue-400" size={30} />
            </span>
            <div>
              <p className="text-lg font-semibold">{vehicle.make_model}</p>
              <p className="text-sm text-gray-400">
                {vehicle.year} {vehicle.color}
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col justify-center">
            <h3 className="uppercase text-[#4b6080] font-semibold tracking-wider">
              Datos Generales
            </h3>
            <div className="flex justify-between gap-4 mt-2 mb-2 border-b border-neutral-700/50 pb-1">
              <span className="text-[#4b6080] text-md">Placa</span>
              <span className="bg-[#1e2d45] text-[#93c5fd] px-2 py-2 rounded-md text-xs font-semibold">
                {vehicle.license_plate}
              </span>
            </div>
            <div className="flex justify-between gap-4 mt-2 mb-2 border-b border-neutral-700/50 pb-1">
              <span className="text-[#4b6080]">Conductor</span>
              <span className="text-sm tracking-widest text-white">Javier</span>
            </div>
            <div className="flex justify-between gap-4 mt-2 mb-2 border-b border-neutral-700/50 pb-1">
              <span className="text-[#4b6080]">Estado</span>
              <span
                className={`text-sm tracking-widest ${vehicle.status === "Activo" ? "text-green-500" : "text-red-500"}`}
              >
                {vehicle.status}
              </span>
            </div>
          </div>

          <div>
            <h3 className="uppercase text-[#4b6080] font-semibold mt-4 mb-4 tracking-wider">
              Documentos y Vencimientos
            </h3>

            {/* 4. AQUÍ REEMPLAZAMOS TODO EL HTML REPETIDO POR EL MINICOMPONENTE */}
            <div>
              <DocumentRow
                title="Póliza de seguro"
                date={vehicle.insurance_due_date}
              />
              <DocumentRow title="Placa" date={vehicle.plate_due_date} />
              <DocumentRow
                title="Revisión técnica"
                date={vehicle.maintenance_date}
              />
            </div>
          </div>

          <div>
            <h3 className="uppercase text-[#4b6080] font-semibold mt-4 mb-4 tracking-wider">
              Observaciones
            </h3>
            <div className="flex justify-center items-center text-[#9ca3af] text-md border border-[#1e2d45] bg-[#141e30] rounded-md p-6">
              <p>{vehicle.maintenance_note}</p>
            </div>
          </div>
        </div>

        <button className="p-4 mt-8 rounded-xl bg-blue-500 text-white text-md font-semibold flex items-center justify-center gap-4 hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
          <Pencil size={18} />
          Editar Vehiculo
        </button>
      </div>
    </div>
  );
}
