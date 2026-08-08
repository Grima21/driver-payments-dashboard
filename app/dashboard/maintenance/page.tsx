"use client";
import { useMaintenance } from "@/hook/useMaintenance";
import MaintenanceForm from "@/components/MaintenanceForm"; // Tu componente aparte
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Car,
  Trash2,
  DollarSign,
  Wrench,
} from "lucide-react";
export default function MaintenancePage() {
  // 1. El director pide los instrumentos al Hook
  const { addMaintenance } = useMaintenance();

  const { maintenances, deleteMaintenance } = useMaintenance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const formattedMonthHeader = currentDate.toLocaleDateString("es-Es", {
    month: "long",
    year: "numeric",
  });

  const displayMonthHeader =
    formattedMonthHeader.charAt(0).toUpperCase() +
    formattedMonthHeader.slice(1);

  const selectedMonthMaintenances = maintenances.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      recordDate.getMonth() === currentDate.getMonth() &&
      recordDate.getFullYear() === currentDate.getFullYear()
    );
  });
  console.log("1. TODOS LOS DATOS:", maintenances);
  console.log("2. DATOS DE ESTE MES:", selectedMonthMaintenances);

  const selectedMonthCount = selectedMonthMaintenances.length;
  const currentMonthTotalCost = selectedMonthMaintenances.reduce(
    (total, record) => total + record.cost,
    0,
  );
  const typeStyles: Record<string, string> = {
    preventivo: "bg-[#0a2518] text-[#10b981] border-[#166534]",
    emergencia: "bg-[#2d1a0a] text-[#f97316] border-[#7c3412]",
    correctivo: "bg-[#1e2d0a] text-[#84cc16] border-[#3d6e00]",
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = window.confirm(
      "¿Estas seguro que deseas eliminar este mantenimiento?",
    );

    if (confirmed) {
      try {
        await deleteMaintenance(id);
      } catch (err) {
        alert("Ocurrio un error al intentar eliminar el registro.");
      }
    }
  };
  return (
    <div className="w-full h-full min-h-screen p-4 md:p-8 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),linear-gradient(180deg,#081122_0%,#0f172a_100%)]">
      {/* <VehicleDetail /> */}

      <div className="w-full max-w-375 mx-auto mt-10 md:mt-16 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 md:text-4xl">
          Gestion de Mantenimientos
        </h1>
        <p className="text-[#8f8f8f] mt-2">
          Control y seguimiento de mantenimientos.
        </p>

        {/* Estadísticas */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-[#1f1500]  p-8 rounded-xl border border-[#78350f]">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#fbbf24]" />
              <h2 className="text-lg font-semibold text-[#94a3b8]">
                Gastos del mes
              </h2>
            </div>
            <p className="text-3xl font-bold text-[#fbbf24] mt-5">
              ${currentMonthTotalCost}
            </p>
          </div>

          <div className=" gap-2 bg-custom-dark p-8 rounded-xl border border-gray-900">
            <div className="flex items-center gap-2">
              <Car className="text-[#60a5fa] w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-400">
                Vehiculos con servicios
              </h2>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mt-5">4</p>
            </div>
          </div>

          <div className="bg-custom-dark p-8 rounded-xl border border-gray-900">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#60a5fa]" />
              <h2 className="text-lg font-semibold text-neutral-500">
                Mantenimientos del mes
              </h2>
            </div>
            <p className="text-3xl font-bold text-white mt-5">
              {selectedMonthCount}
            </p>
          </div>
        </div>

        <div className="w-full mt-4 p-6  flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center mb-4 md:mb-0">
            <button
              onClick={handlePrevMonth}
              className=" text-white px-2 py-2 rounded-xl border border-neutral-600 cursor-pointer hover:bg-neutral-800 transition duration-300 ease-in-out"
            >
              {" "}
              <ChevronLeft />{" "}
            </button>
            <h2>{displayMonthHeader}</h2>
            <button
              onClick={handleNextMonth}
              className=" text-white px-2 py-2 rounded-xl border border-neutral-600 cursor-pointer hover:bg-neutral-800 transition duration-300 ease-in-out"
            >
              {" "}
              <ChevronRight />{" "}
            </button>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-blue-400 transition duration-300 ease-in-out"
            >
              <Wrench size={20} /> Agregar mantenimiento
            </button>
          </div>
        </div>

        <div className="rounded-xl  overflow-hidden overflow-x-auto scrollbar-thin border-[#1e2d45] bg-[#111827]">
          <table className="w-full text-sm capitalize">
            <thead>
              <tr className="border-b border-[#1e2d45] bg-[#0f1c30]">
                {[
                  "Fecha",
                  "Vehiculo",
                  "Placa",
                  "Tipo",
                  "Descripcion",
                  "Costo",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 font-semibold tracking-wider text-xs text-[#94a3b8]"
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedMonthMaintenances.map((record, i) => (
                <tr
                  key={record.id}
                  style={{
                    borderBottom: "1px solid #1a2540",
                    background: i % 2 === 0 ? "#111827" : "#0f1c2e",
                  }}
                >
                  <td className="px-5 py-3">
                    <span className="font-medium text-[#cbd5e1] ">
                      {record.date}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 items-center">
                      <Car className="w-4 h-4 shrink-0 text-[#60a5fa]" />
                      <span className=" font-medium  ">
                        {record.vehicle?.make_model}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded font-mono text-sm  font-semibold bg-[#1e2d45] text-[#60a5fa]">
                      {record.vehicle?.license_plate}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-3 py-1 rounded-lg font-bold  ${typeStyles[record.type]}`}
                    >
                      {record.type}
                    </span>
                  </td>
                  <td className="px-5 py-3  max-w-45">
                    <span className="text-[#94a3b8]">{record.description}</span>
                  </td>
                  <td className="px-5 py-3 ">
                    <span className="font-bold text-white ">
                      ${record.cost}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="cursor-pointer text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4.5 h-4.5 " />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <MaintenanceForm
            onSave={addMaintenance}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
