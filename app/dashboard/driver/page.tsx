"use client";

import { useState, useEffect, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Driver {
  id: number;
  name: string;
  phone: string;
  vehicle_unit?: string | null;
  daily_rate?: number | null;
}

export default function Driverform() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [formError, setFormError] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
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

    if (!name || !phone || !unitNumber || !dailyRate) {
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
          })
          .eq("id", editingId));
      } else {
        ({ data, error } = await supabase.from("drivers").insert([
          {
            name,
            phone,
            vehicle_unit: unitNumber,
            daily_rate: Number(dailyRate),
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
      setFormError("");
      setEditingId(null);
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
    setUnitNumber(driver.vehicle_unit ?? "");
    setDailyRate(String(driver.daily_rate ?? ""));
  }

  function handleCancelEdit() {
    setEditingId(null);
    setName("");
    setPhone("");
    setUnitNumber("");
    setDailyRate("");
  }
  return (
    <div className="w-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] py-12">
      <div className="w-full  max-w-7xl mx-auto px-6">
        <Link
          href={"/dashboard/payment"}
          className="flex items-center justify-center gap-2 text-sky-300 mb-4 text-xs  md:text-sm cursor-pointer hover:text-sky-500"
        >
          <ArrowLeft /> Return to the payment table
        </Link>
        <div className="text-center mb-10">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-300 shadow-sm shadow-sky-500/20">
            Driver Dashboard
          </p>
          <h1 className="mt-6 text-2xl md:text-4xl font-bold text-white">
            {editingId ? "Edit Driver Details" : "Register a New Driver"}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-gray-300 text-base sm:text-lg">
            Add driver details and see all registered drivers in a clean, modern
            layout.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {editingId ? "Edit Driver Details" : "Register a New Driver"}
            </h2>
            <form noValidate onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
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
                  className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
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
                  className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
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
                  className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
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

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Registered Drivers
                </h2>
                <p className="text-sm text-gray-400">
                  Quick overview of all active entries.
                </p>
              </div>
              <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                {drivers.length} total
              </span>
            </div>

            <div className="space-y-4">
              {drivers.length === 0 ? (
                <div className="rounded-3xl border border-slate-700/70 bg-slate-950/80 p-6 text-center text-sm text-slate-400">
                  No drivers registered yet. Fill the form to add the first one.
                </div>
              ) : (
                drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="rounded-[28px] border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.7)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xl font-semibold text-white">
                          {driver.name}
                        </p>
                        <p className="text-sm text-slate-400">{driver.phone}</p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {driver.vehicle_unit ?? "No unit"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                        <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                          Unit
                        </span>
                        {driver.vehicle_unit || "N/A"}
                      </div>
                      <div className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                        <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                          Daily rate
                        </span>
                        ${driver.daily_rate ?? "N/A"}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(driver)}
                        className="rounded-full bg-green-500/10 px-4 py-2 text-sm semibold text-green-300 transition hover:bg-green-500/20 cursor-pointer"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDriver(driver.id)}
                        className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 cursor-pointer"
                      >
                        Delete
                      </button>
                      <button></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
