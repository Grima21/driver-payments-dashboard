"use client";

import { useState, useEffect, FormEvent, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pen,
  Trash,
  Phone,
  UserPlus,
  UserRoundCheck,
  CircleAlert,
  Car,
} from "lucide-react";

interface Driver {
  id: number;
  name: string;
  phone: string;
  vehicle?: string | null;
  vehicle_unit?: string | null;
  daily_rate?: number | null;
  status: string;
}

export default function Driverform() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [formError, setFormError] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");
  async function fetchDrivers() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("drivers").select("*");

      if (error) {
        setFormError(error.message);
        return;
      }

      setDrivers(data ?? []);
    } catch (error) {
      setFormError("Something went wrong");
    }
  }

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const supabase = createClient();
    e.preventDefault();

    if (!name || !phone || !unitNumber || !dailyRate || !vehicle || !status) {
      setFormError("Please complete all fields");
      return;
    }

    try {
      let data;
      let error;

      const existingDriver = drivers.find(
        (driver) =>
          driver.name.trim().toLowerCase() === name.trim().toLowerCase(),
      );

      if (existingDriver && !editingId) {
        setFormError("A driver with this name already exists.");
        return;
      } else if (editingId) {
        ({ data, error } = await supabase
          .from("drivers")
          .update({
            name,
            phone,
            vehicle_unit: unitNumber,
            daily_rate: Number(dailyRate),
            vehicle,
            status,
          })
          .eq("id", editingId));
      } else {
        ({ data, error } = await supabase.from("drivers").insert([
          {
            name,
            phone,
            vehicle_unit: unitNumber,
            daily_rate: Number(dailyRate),
            vehicle,
            status,
          },
        ]));
      }

      if (error) {
        setFormError(error.message);
        return;
      }

      fetchDrivers();
      setName("");
      setPhone("");
      setDailyRate("");
      setUnitNumber("");
      setVehicle("");
      setFormError("");
      setEditingId(null);
      setStatus("");
    } catch (error) {
      setFormError("Something went wrong");
    }
  }

  const deleteDriver = async (id: number) => {
    const supabase = createClient();
    const { error } = await supabase.from("drivers").delete().eq("id", id);

    if (error) {
      console.log("Error eliminando", error.message);
      return;
    }
    fetchDrivers();
  };

  function handleEdit(driver: Driver) {
    setEditingId(driver.id);
    setName(driver.name);
    setPhone(driver.phone);
    setVehicle(driver.vehicle ?? "");
    setUnitNumber(driver.vehicle_unit ?? "");
    setDailyRate(String(driver.daily_rate ?? ""));
    setStatus(driver.status);
    setIsOpen(true);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setName("");
    setPhone("");
    setVehicle("");
    setUnitNumber("");
    setDailyRate("");
    setIsOpen(false);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPhone("");
    setVehicle("");
    setUnitNumber("");
    setDailyRate("");
    setStatus("");
  }

  function handleIsOpen() {
    setIsOpen((prev) => !prev);
  }
  return (
    <div className="w-full min-h-screen  bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] py-12">
      <div className="w-full max-w-375 mx-auto mt-10 md:mt-16 mb-8 ">
        <h1 className="text-3xl font-bold text-white  mb-2 md:text-4xl ">
          Gestion de Conductores
        </h1>
        <p className="text-[#8f8f8f] mt-2">
          Administra los conductores registrados.
        </p>

        {/* EStadistica de conductores*/}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div className="bg-[#041b18] p-10 rounded-xl border border-green-900">
            <div className="flex gap-4 item-center">
              <UserRoundCheck className="text-white" />
              <h2 className="text-lg font-semibold text-gray-400">
                Total conductores
              </h2>
            </div>
            <p className="text-3xl font-bold text-[#00d091] mt-5">
              {drivers.length}
            </p>
          </div>

          <div className="bg-[#0f1216] p-10 rounded-xl border border-gray-900">
            <h2 className="text-lg font-semibold text-gray-400">
              Conductores activos
            </h2>
            <p className="text-3xl font-bold text-white mt-5">
              {drivers.length}
            </p>
          </div>

          <div className="bg-[#0f1216] p-10 rounded-xl border border-gray-900">
            <h2 className="text-lg font-semibold text-gray-400">
              Conductores Inactivos
            </h2>
            <p className="text-3xl font-bold text-white mt-5">
              {drivers.filter((d) => d.status === "inactivo").length}
            </p>
          </div>
        </div>
        <div className="flex justify-end p-8">
          <button
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-blue-400 transition duration-300 ease-in-out"
          >
            <UserPlus /> Agregar Conductor
          </button>
        </div>

        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={handleIsOpen}
          >
            <div
              className="w-full max-w-2xl rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">
                {editingId ? "Edit Driver Details" : "Register a New Driver"}
              </h2>
              <form noValidate onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <input
                    className="w-full rounded-3xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Phone
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="text"
                    id="phone"
                    placeholder="+507 653-1245"
                    className="w-full rounded-3xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Unit number
                  </label>
                  <input
                    type="text"
                    id="unitNumber"
                    placeholder="AK221"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    className="w-full rounded-3xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Daily rate
                  </label>
                  <input
                    type="number"
                    id="dailyRate"
                    placeholder="$25"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    className="w-full rounded-3xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Vehicle
                  </label>
                  <input
                    type="text"
                    id="vehicle"
                    placeholder="Toyota Yaris"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full rounded-3xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Status
                  </label>

                  <select
                    className="w-full rounded-3xl border border-slate-700/70 bg-input-custom text-white px-4 py-3  outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Selecciona un estado</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                {formError && (
                  <p className="rounded-3xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-3xl bg-sky-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-300 cursor-pointer"
                >
                  {editingId ? "Update Driver" : "Register Driver"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full rounded-3xl bg-sky-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-300 cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>
        )}
        <div className="rounded-xl  overflow-hidden overflow-x-auto scrollbar-thin border-[#1e2d45] bg-[#111827]">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #1e2d45",
                  background: "#0f1c30",
                }}
              >
                {[
                  "Conductor",
                  "Teléfono",
                  "Vehículo",
                  "Placa",
                  "Estado",
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
              {drivers.map((driver, i) => (
                <tr
                  key={driver.id}
                  style={{
                    borderBottom: "1px solid #1a2540",
                    background: i % 2 === 0 ? "#111827" : "#0f1c2e",
                  }}
                >
                  {/* Conductor */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "#1e3a5f", color: "#60a5fa" }}
                      >
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: "#e2e8f0" }}
                      >
                        {driver.name}
                      </span>
                    </div>
                  </td>

                  {/* Teléfono */}
                  <td className="px-5 py-3" style={{ color: "#94a3b8" }}>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {driver.phone}
                    </span>
                  </td>

                  {/* Vehículo */}
                  <td className="px-5 py-3" style={{ color: "#cbd5e1" }}>
                    {driver.vehicle}
                  </td>

                  {/* Placa */}
                  <td className="px-5 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                      style={{ background: "#1e2d45", color: "#93c5fd" }}
                    >
                      {driver.vehicle_unit}
                    </span>
                  </td>

                  {/* Estado — ajusta driver.status al campo real que uses */}
                  <td className="px-5 py-3">
                    <span
                      className="px-3.5 py-0.5 rounded-xl text-xs font-medium"
                      style={{
                        background:
                          driver.status === "activo" ? "#0a2518" : "#2d1a1a",
                        color:
                          driver.status === "activo" ? "#10b981" : "#ef4444",
                        border: `1px solid ${driver.status === "activo" ? "#166534" : "#7f1d1d"}`,
                      }}
                    >
                      {driver.status}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded transition-colors hover:bg-white/10"
                        style={{ color: "#60a5fa" }}
                        title="Editar"
                        onClick={() => handleEdit(driver)}
                      >
                        <Pen className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded transition-colors hover:bg-white/10"
                        style={{ color: "#ef4444" }}
                        title="Eliminar"
                        onClick={() => deleteDriver(driver.id)}
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {drivers.length === 0 && (
            <div className="py-16 text-center" style={{ color: "#4b6080" }}>
              <p>No hay conductores registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
