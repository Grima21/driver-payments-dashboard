"use client";

import VehicleForm from "@/components/VehicleForm";
import VehicleDetail from "@/components/VehicleDetail";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Car,
  Plus,
  Pencil,
  Eye,
} from "lucide-react";

type Vehicle = {
  id: number;
  make_model: string;
  year: string;
  license_plate: string;
  insurance_due_date: string;
  plate_due_date: string;
  maintenance_note: string;
  maintenance_date: string;
  color: string;
  status: string;
};

// ── Helpers de fechas ──────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const diff =
    new Date(iso + "T00:00:00").getTime() -
    new Date(new Date().toDateString()).getTime();
  return Math.round(diff / 86400000);
}

function formatDateDisplay(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d} ${MONTH_NAMES[parseInt(m ?? "1") - 1] ?? ""} ${y}`;
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
  vigente: {
    bg: "#0a2518",
    color: "#10b981",
    border: "#166534",
    label: "Vigente",
  },
  proximo: {
    bg: "#1f1500",
    color: "#fbbf24",
    border: "#78350f",
    label: "Próximo a vencer",
  },
  vencido: {
    bg: "#2d1a1a",
    color: "#ef4444",
    border: "#7f1d1d",
    label: "Vencido",
  },
};

function vehicleAlertLevel(v: Vehicle): DocStatus {
  const statuses = [
    docStatus(v.insurance_due_date),
    docStatus(v.plate_due_date),
    docStatus(v.maintenance_date),
  ];
  if (statuses.includes("vencido")) return "vencido";
  if (statuses.includes("proximo")) return "proximo";
  return "vigente";
}

// ── Componente DocBadge ────────────────────────────────────────────────────

function DocBadge({ status, date }: { status: DocStatus; date: string }) {
  if (!date)
    return (
      <span className="text-xs" style={{ color: "#3a5070" }}>
        —
      </span>
    );

  const days = daysUntil(date);
  const s = STATUS_STYLES[status];
  const label =
    days === null
      ? "—"
      : days < 0
        ? `Vencido hace ${Math.abs(days)}d`
        : days === 0
          ? "Hoy"
          : days <= 30
            ? `En ${days}d`
            : formatDateDisplay(date);

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {status === "vencido" && <AlertTriangle className="w-2.5 h-2.5" />}
      {status === "proximo" && <Clock className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function VehiclePage() {
  const [vehicle, setVehicle] = useState<Vehicle[]>([]);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  async function fetchVehicle() {
    const supabase = createClient();
    const { data, error } = await supabase.from("vehicle").select("*");
    if (error) {
      console.error("Error al traer los datos", error.message);
    } else {
      setVehicle(data ?? []);
    }
  }
  useEffect(() => {
    fetchVehicle();
  }, []);

  const activos = vehicle.filter((v) => v.status === "Activo").length;
  const conAlertas = vehicle.filter(
    (v) => vehicleAlertLevel(v) !== "vigente",
  ).length;

  return (
    <div className="w-full h-full min-h-screen p-4 md:p-8 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),linear-gradient(180deg,#081122_0%,#0f172a_100%)]">
      {/* <VehicleDetail /> */}

      <div className="w-full max-w-375 mx-auto mt-10 md:mt-16 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 md:text-4xl">
          Gestion de Vehiculos
        </h1>
        <p className="text-[#8f8f8f] mt-2">
          Control y seguimiento de vehiculos.
        </p>

        {/* Estadísticas */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-[#0f1216] p-8 rounded-xl border border-gray-900">
            <h2 className="text-lg font-semibold text-gray-400">
              Total de Vehiculos
            </h2>
            <p className="text-3xl font-bold text-white mt-5">
              {vehicle.length}
            </p>
          </div>

          <div className="bg-[#041b18] p-8 rounded-xl border border-green-900">
            <h2 className="text-lg font-semibold text-[#00d091]">Activos</h2>
            <p className="text-3xl font-bold text-white mt-5">{activos}</p>
          </div>

          <div className="bg-[#2d1a1a] p-8 rounded-xl border border-[#7f1d1d]">
            <h2 className="text-lg font-semibold text-neutral-500">
              Con alerta de Documentos
            </h2>
            <p className="text-3xl font-bold text-red-400 mt-5">{conAlertas}</p>
          </div>
        </div>
        <div className="flex justify-end p-8">
          <button
            onClick={() => {
              setVehicleToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-blue-400 transition duration-300 ease-in-out"
          >
            <Plus /> Agregar Vehiculo
          </button>
        </div>

        {/* Tabla */}
        <div
          className="rounded-xl overflow-hidden border overflow-x-auto scrollbar-thin"
          style={{ borderColor: "#1e2d45", background: "#111827" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #1e2d45",
                  background: "#0f1c30",
                }}
              >
                {[
                  "Placa",
                  "Vehiculo",
                  "Estado",
                  "Poliza",
                  "Placa Fecha",
                  "Revision Tecnica",
                  "Documentos",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 font-semibold tracking-wider text-xs"
                    style={{ color: "#94a3b8" }}
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicle.map((v, i) => {
                const alert = vehicleAlertLevel(v);
                const isActivo = v.status === "Activo";

                return (
                  <tr
                    key={v.id}
                    style={{
                      borderBottom: "1px solid #1a2540",
                      background: i % 2 === 0 ? "#111827" : "#0f1c2e",
                    }}
                  >
                    {/* Placa */}
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                        style={{ background: "#1e2d45", color: "#93c5fd" }}
                      >
                        {v.license_plate}
                      </span>
                    </td>

                    {/* Vehículo */}
                    <td className="px-5 py-3">
                      <div className="flex items-center  gap-2">
                        <Car
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: "#60a5fa" }}
                        />
                        <div className="flex flex-col">
                          <span
                            className="font-medium"
                            style={{ color: "#e2e8f0" }}
                          >
                            {v.make_model}
                          </span>
                          <span
                            className="ml-1.5 text-xs"
                            style={{ color: "#4b6080" }}
                          >
                            {v.year} · {v.color}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: isActivo ? "#0a2518" : "#2d1a1a",
                          color: isActivo ? "#10b981" : "#ef4444",
                          border: `1px solid ${isActivo ? "#166534" : "#7f1d1d"}`,
                        }}
                      >
                        {v.status}
                      </span>
                    </td>

                    {/* Póliza */}
                    <td className="px-5 py-3">
                      <DocBadge
                        status={docStatus(v.insurance_due_date)}
                        date={v.insurance_due_date}
                      />
                    </td>

                    {/* Placa fecha */}
                    <td className="px-5 py-3">
                      <DocBadge
                        status={docStatus(v.plate_due_date)}
                        date={v.plate_due_date}
                      />
                    </td>

                    {/* Revisión técnica */}
                    <td className="px-5 py-3">
                      <DocBadge
                        status={docStatus(v.maintenance_date)}
                        date={v.maintenance_date}
                      />
                    </td>

                    {/* Alerta general */}
                    <td className="px-5 py-3">
                      {alert !== "vigente" ? (
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle
                            className="w-3.5 h-3.5"
                            style={{
                              color:
                                alert === "vencido" ? "#ef4444" : "#fbbf24",
                            }}
                          />
                          <span
                            className="text-xs"
                            style={{
                              color:
                                alert === "vencido" ? "#ef4444" : "#fbbf24",
                            }}
                          >
                            {alert === "vencido" ? "Vencido" : "Próximo"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle
                            className="w-3.5 h-3.5"
                            style={{ color: "#10b981" }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: "#10b981" }}
                          >
                            Al día
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right flex gap-2 justify-center items-center">
                      <button
                        onClick={() => {
                          setSelectedVehicle(v);
                        }}
                      >
                        <div className="px-1 py-1 rounded-lg  hover:bg-[#3f3f46] transition duration-300 ease-in-out">
                          <Eye
                            size={14}
                            className="text-[#a78bfa] cursor-pointer"
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setVehicleToEdit(v);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="px-1 py-1 rounded-lg  hover:bg-[#3f3f46] transition duration-300 ease-in-out">
                          <Pencil
                            size={14}
                            className="text-[#60a5fa] cursor-pointer"
                          />
                        </div>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {vehicle.length === 0 && (
            <div className="py-16 text-center" style={{ color: "#4b6080" }}>
              <Car className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No hay vehículos registrados</p>
            </div>
          )}
        </div>
        {isModalOpen && (
          <VehicleForm
            vehicleToEdit={vehicleToEdit}
            onClose={() => {
              setIsModalOpen(false);
              fetchVehicle();
            }}
          />
        )}
        {selectedVehicle && (
          <VehicleDetail
            vehicle={selectedVehicle}
            onClose={() => {
              setSelectedVehicle(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
