"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  vehicle_unit?: string | null;
  date: string;
  created_at: string;
}

const categories = [
  "Mantenimiento",
  "Reparacion",
  "Combustible",
  "Seguro",
  "Documentacion",
  "Otros",
];

export default function ExpensesPage() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [vehicleUnit, setVehicleUnit] = useState("");
  const [date, setDate] = useState("");
  const [formError, setFormError] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  async function fetchExpenses() {
    if (!supabase) {
      setExpenses([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        setFormError(error.message);
        return;
      }

      setExpenses(data ?? []);
    } catch (error) {
      setFormError("Something went wrong");
    }
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!description || !amount || !category || !date) {
      setFormError("Por favor completa todos los campos requeridos");
      return;
    }

    if (!supabase) {
      setFormError("Base de datos no conectada");
      return;
    }

    try {
      let error;

      if (editingId) {
        ({ error } = await supabase
          .from("expenses")
          .update({
            description,
            amount: Number(amount),
            category,
            vehicle_unit: vehicleUnit || null,
            date,
          })
          .eq("id", editingId));
      } else {
        ({ error } = await supabase.from("expenses").insert([
          {
            description,
            amount: Number(amount),
            category,
            vehicle_unit: vehicleUnit || null,
            date,
          },
        ]));
      }

      if (error) {
        setFormError(error.message);
        return;
      }

      fetchExpenses();
      resetForm();
    } catch (error) {
      setFormError("Something went wrong");
    }
  }

  const deleteExpense = async (id: number) => {
    if (!supabase) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      console.log("Error eliminando", error.message);
      return;
    }
    fetchExpenses();
  };

  function handleEdit(expense: Expense) {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setVehicleUnit(expense.vehicle_unit ?? "");
    setDate(expense.date);
  }

  function resetForm() {
    setEditingId(null);
    setDescription("");
    setAmount("");
    setCategory("");
    setVehicleUnit("");
    setDate("");
    setFormError("");
  }

  const filteredExpenses =
    filterCategory === "all"
      ? expenses
      : expenses.filter((exp) => exp.category === filterCategory);

  const totalExpenses = filteredExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getCategoryColor(cat: string) {
    const colors: Record<string, string> = {
      Mantenimiento: "bg-blue-500/20 text-blue-300",
      Reparacion: "bg-orange-500/20 text-orange-300",
      Combustible: "bg-green-500/20 text-green-300",
      Seguro: "bg-purple-500/20 text-purple-300",
      Documentacion: "bg-yellow-500/20 text-yellow-300",
      Otros: "bg-slate-500/20 text-slate-300",
    };
    return colors[cat] || colors["Otros"];
  }

  return (
    <div className="w-full min-h-screen pt-16 lg:pt-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] py-12">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-300 shadow-sm shadow-sky-500/20">
            Gastos de Vehiculos
          </p>
          <h1 className="mt-6 text-2xl md:text-4xl font-bold text-white">
            {editingId ? "Editar Gasto" : "Registrar Nuevo Gasto"}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-gray-300 text-base sm:text-lg">
            Registra mantenimientos, reparaciones y otros gastos de los
            vehiculos.
          </p>
        </div>

        {/* Summary Card */}
        <div className="mb-8 rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider">
                Total Gastos
              </p>
              <p className="text-3xl font-bold text-white">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Filtrar:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl border border-slate-700/70 bg-slate-950/80 px-4 py-2 text-white outline-none transition focus:border-sky-400"
              >
                <option value="all">Todas las categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          {/* Form */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {editingId ? "Editar Gasto" : "Nuevo Gasto"}
            </h2>
            <form noValidate onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Descripcion *
                </label>
                <input
                  className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  type="text"
                  placeholder="Cambio de aceite, suspension, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Monto *
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="250"
                  className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="">Seleccionar categoria</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Unidad del Vehiculo
                </label>
                <input
                  type="text"
                  placeholder="AK221 (opcional)"
                  value={vehicleUnit}
                  onChange={(e) => setVehicleUnit(e.target.value)}
                  className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
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
                {editingId ? "Actualizar Gasto" : "Registrar Gasto"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-3xl border border-slate-700 px-6 py-3 text-base font-semibold text-slate-300 transition hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </form>
          </div>

          {/* Expenses List */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Gastos Registrados
                </h2>
                <p className="text-sm text-gray-400">
                  Historial de gastos de vehiculos.
                </p>
              </div>
              <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                {filteredExpenses.length} total
              </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredExpenses.length === 0 ? (
                <div className="rounded-3xl border border-slate-700/70 bg-slate-950/80 p-6 text-center text-sm text-slate-400">
                  No hay gastos registrados. Agrega el primer gasto usando el
                  formulario.
                </div>
              ) : (
                filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-[28px] border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.7)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-white">
                          {expense.description}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {formatDate(expense.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-sky-400">
                          ${expense.amount.toLocaleString()}
                        </p>
                        <span
                          className={`inline-block mt-1 rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(expense.category)}`}
                        >
                          {expense.category}
                        </span>
                      </div>
                    </div>

                    {expense.vehicle_unit && (
                      <div className="mt-3">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                          Unidad: {expense.vehicle_unit}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(expense)}
                        className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-500/20 cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteExpense(expense.id)}
                        className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 cursor-pointer"
                      >
                        Eliminar
                      </button>
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
