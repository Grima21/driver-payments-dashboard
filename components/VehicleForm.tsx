"use client";
import { useState, FormEvent, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";

interface VehicleFormProps {
  vehicleToEdit?: any; // Los datos del carro (si estamos editando)
  vehicleToDelete?: any; // Los datos del carro (si estamos eliminando)
  onClose: () => void; // La función para cerrar el modal
}

export default function VehicleForm({
  vehicleToEdit,
  vehicleToDelete,
  onClose,
}: VehicleFormProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorForm, setErrorForm] = useState("");

  // 1. EL CAMBIO PRINCIPAL: Borramos los 7 useState separados y creamos uno solo que tiene todo el molde.
  const [vehicleData, setVehicleData] = useState({
    make_model: "",
    year: "",
    license_plate: "",
    insurance_due_date: "",
    plate_due_date: "",
    maintenance_note: "",
    maintenance_date: "",
    color: "",
    status: "",
  });

  useEffect(() => {
    if (vehicleToEdit) {
      setVehicleData(vehicleToEdit);
      setEditingId(vehicleToEdit.id);
    }
    if (vehicleToDelete) {
      setVehicleData(vehicleToDelete);
      setEditingId(vehicleToDelete.id);
    }
  }, [vehicleToEdit, vehicleToDelete]);

  // 2. LA FUNCIÓN INTELIGENTE: Esta función lee el 'name' del input y actualiza esa parte específica del estado.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Se recomienda poner esto al inicio

    // 3. VALIDACIÓN MÁS CORTA: Revisamos dinámicamente si algún campo del objeto está vacío
    const isFormIncomplete = Object.values(vehicleData).some(
      (value) => value === "",
    );

    if (isFormIncomplete) {
      setErrorForm("Please complete all fields");
      return;
    }

    setErrorForm(""); // Limpiar errores previos

    try {
      const supabase = createClient();

      if (editingId) {
        const { error } = await supabase
          .from("vehicle")
          .update(vehicleData) // Pasamos el estado directo
          .eq("id", editingId);

        if (error) {
          console.error(error.message);
          return;
        }
      } else {
        const { error } = await supabase.from("vehicle").insert([vehicleData]);

        if (error) {
          console.log(error.message);
          return;
        }
      }

      onClose();
    } catch (error) {
      console.log("Error al insertar", error);
    }
  }

  async function handleDelete(id: number) {
    if (!editingId) return;
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este vehículo?",
    );
    if (!confirmDelete) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("vehicle")
        .delete()
        .eq("id", editingId);
      if (error) {
        console.error(error.message);
        return;
      }
      onClose();
    } catch (error) {
      console.log("Error al eliminar", error);
    }
  }
  function handleIsOpen() {
    setIsOpen((prev) => !prev);
  }

  const vehicleFormFields = [
    // Primera fila (Mitad y mitad)
    // --- SUBTÍTULO 1 ---
    {
      name: "heading_datos", // Nombre único para la key
      label: "DATOS DEL VEHÍCULO",
      type: "heading", // Este type es la clave
      colSpan: "col-span-2", // Queremos que el título abarque todo el ancho
    },
    {
      name: "license_plate",
      label: "Placa",
      type: "text",
      colSpan: "col-span-1",
    },
    { name: "year", label: "Año", type: "number", colSpan: "col-span-1" },

    // Segunda fila (Mitad y mitad)
    {
      name: "make_model",
      label: "Marca y Modelo",
      type: "text",
      colSpan: "col-span-1",
    },
    {
      name: "insurance_due_date",
      label: "Vencimiento Póliza",
      type: "date",
      colSpan: "col-span-1",
    },
    {
      name: "color",
      label: "Color",
      type: "text",
      colSpan: "col-span-1",
    },
    {
      name: "status",
      label: "Estado",
      type: "text",
      colSpan: "col-span-1",
    },

    // Fila final (Abarca TODO el espacio)
    // --- SUBTÍTULO 2 ---
    {
      name: "heading_docs",
      label: "DOCUMENTOS Y VENCIMIENTOS",
      type: "heading",
      colSpan: "col-span-2",
    },

    {
      name: "plate_due_date",
      label: "Vencimiento Placa",
      type: "date",
      colSpan: "col-span-2",
    },
    {
      name: "maintenance_date",
      label: "Fecha Mantenimiento",
      type: "date",
      colSpan: "col-span-2",
    },

    {
      name: "maintenance_note",
      label: "Observaciones",
      type: "text",
      colSpan: "col-span-2",
    },
  ];

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-2xl rounded-4xl border border-white/5 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 ">
            {vehicleFormFields.map((field) => {
              // Si el tipo es heading, pintamos un subtítulo <h2>
              if (field.type === "heading") {
                return (
                  <h2
                    key={field.name}
                    className={`text-lg font-bold text-white mt-4 mb-2 uppercase tracking-wider border-b border-neutral-800 pb-1 ${field.colSpan}`}
                  >
                    {field.label}
                  </h2>
                );
              }

              return (
                <div
                  key={field.name}
                  className={`flex flex-col ${field.colSpan}`}
                >
                  <label className="text-sm text-gray-400 mb-1">
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={
                      vehicleData[field.name as keyof typeof vehicleData] || ""
                    }
                    onChange={handleInputChange}
                    className="w-full rounded-3xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              );
            })}

            {errorForm && (
              <p className="text-red-500 col-span-2">{errorForm}</p>
            )}

            {/* El botón también abarca las 2 columnas */}
            <div className="col-span-2 flex justify-between items-center p-8 gap-4">
              {editingId && (
                <button
                  type="button"
                  onClick={() => handleDelete(editingId!)}
                  className="bg-[#ef4444] border border-[#7f1d1d]  text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex justify-center transition-colors hover:bg-[#b91c1c] hover:border-[#7f1d1d] hover:text-white"
                >
                  Eliminar
                </button>
              )}
              <div className="flex gap-4">
                <button
                  type="button"
                  className="bg-[#3f3f46] text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex justify-center transition-colors hover:bg-[#2d2d30] hover:border-[#4b4b4b] hover:text-white"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md  cursor-pointer text-sm font-medium flex justify-center transition-colors hover:bg-blue-700"
                >
                  {editingId ? "Guardar Cambios" : "Agregar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
