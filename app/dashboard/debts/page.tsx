"use client";
import {
  TrendingDown,
  DollarSign,
  CircleCheck,
  Users,
  X,
  Plus,
  CalendarClock,
  History,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
interface Driver {
  id: string;
  name: string;
}
interface Debt {
  id: string;
  total_amount: number;
  remaining_amount: number;
  status: "pending" | "paid";
  description: string;
  daily_amount: number;
  date: string;
  drivers?: {
    name: string;
  };
  debt_payment?: DebtPayment[];
}
interface DebtPayment {
  id: string;
  created_at: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  note: string;
}

interface DebtCardProps {
  debt: Debt;
  onRefresh: () => Promise<void>;
}

interface AddPaymentModalProps {
  debt: Debt;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

interface HistorialPaymentProps {
  debt: Debt;
  isOpen: boolean;
  onClose: () => void;
}
const supabase = createClient();
export default function DebtPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [debts, setDebts] = useState<Debt[]>([]);

  const fetchDebts = useCallback(async () => {
    const { data, error } = await supabase
      .from("debts")
      .select(`*, drivers(id,name), debt_payment(id,amount, payment_date)`);

    if (error) {
      console.error("Error al cargar deudas:", error);
      return;
    }

    setDebts(data ?? []);
  }, []);

  useEffect(() => {
    async function loadInitialDebts() {
      const { data, error } = await supabase
        .from("debts")
        .select(`*, drivers(id,name), debt_payment(id,amount, payment_date)`);

      if (error) {
        console.error("Error al cargar deudas:", error);
        return;
      }

      setDebts(data ?? []);
    }

    void loadInitialDebts();
  }, []);

  const totalDeudores = debts.length;
  const totalOriginalDebt = debts.reduce(
    (sum, debt) => +Number(debt.total_amount),
    0,
  );

  const totalCollected = debts.reduce((sum, debt) => {
    const debtPaymentsSum =
      debt.debt_payment?.reduce(
        (pSum, payment) => pSum + Number(payment.amount),
        0,
      ) || 0;
    return sum + debtPaymentsSum;
  }, 0);

  const totalPending = totalOriginalDebt - totalCollected;

  return (
    <div className="w-full h-full p-4 md:p-8 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),linear-gradient(180deg,#081122_0%,#0f172a_100%)]">
      <div className="w-full  max-w-375 min-h-screen mx-auto mt-10 md:mt-16 mb-8 ">
        <h1 className="text-3xl font-bold text-white  mb-2 md:text-4xl ">
          Gestion de Deudas
        </h1>
        <p className="text-[#8f8f8f] mt-2">
          Arreglos de pago y seguimiento de abonos por conductor.
        </p>

        {/* EStadistica de la tabla */}
        <div className=" grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          <div className="bg-[#2d1a1a] p-12 rounded-xl border border-[#7f1d1d] flex flex-col justify-center">
            <div className="flex gap-4 items-center">
              <TrendingDown className="text-red-400" />

              <h2 className="text-lg font-semibold text-gray-400">
                Saldo Total por Cobrar
              </h2>
            </div>
            <p className="text-3xl font-bold text-red-400 mt-5">
              {totalPending.toFixed(0)}
            </p>
          </div>

          <div className="bg-[#0f1216] p-12 rounded-xl border border-gray-900 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <DollarSign className="text-[#60a5fa]" />

              <h2 className="text-lg font-semibold text-gray-400">
                Deuda Original Activa
              </h2>
            </div>
            <p className="text-3xl font-bold text-white mt-5">
              ${totalOriginalDebt.toFixed(2)}
            </p>
          </div>

          <div className="bg-[#041b18] p-8 rounded-xl border border-green-900 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <CircleCheck className="text-[#00d091]" />

              <h2 className="text-lg font-semibold text-gray-400">
                Total Recaudado
              </h2>
            </div>
            <p className="text-3xl font-bold text-[#00d091] mt-5">
              ${totalCollected.toFixed(2)}
            </p>
          </div>

          <div className="bg-[#0f1216]  p-12 rounded-xl border border-gray-900 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <Users className="text-[#60a5fa]" />
              <h2 className="text-lg font-semibold text-gray-400">
                Conductores con deuda
              </h2>
            </div>
            <p className="text-3xl font-bold text-white mt-5">
              {totalDeudores}
            </p>
          </div>
        </div>
        <div className="mt-10 flex justify-end items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-blue-400 transition duration-300 ease-in-out"
          >
            <Plus size={20} />
            Nueva deuda
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-4">
          {debts.map((d) => (
            <DebtCard key={d.id} debt={d} onRefresh={fetchDebts} />
          ))}
        </div>
        <CreateDebModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={async () => {
            await fetchDebts();
            setIsOpen(false);
          }}
        />
      </div>
    </div>
  );
}

function CreateDebModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverId, setDriverId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [dailyAmount, setDaily_amount] = useState("");
  const [date, setDate] = useState("");
  const [debt, setDebt] = useState("");
  const supabase = createClient();

  async function fetchDebts() {
    const { data, error } = await supabase.from("debts").select("*");

    if (!error && data) {
      setDebt("data");
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    async function fetchDriver() {
      const { data, error } = await supabase.from("drivers").select("id, name");

      if (!error && data) {
        setDrivers(data);
      }
    }

    void fetchDriver();
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const { error } = await supabase.from("debts").insert([
      {
        driver_id: driverId,
        total_amount: Number(totalAmount),
        status: "Activa",
        description: description,
        remaining_amount: Number(totalAmount),
        daily_amount: Number(dailyAmount),
        date: date,
      },
    ]);
    if (error) {
      setFormError(`Error al guardar ${error.message}`);
    } else {
      setDriverId("");
      setTotalAmount("");
      setDescription("");
      onSuccess();
      onClose();
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-4xl border border-white/5 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-400"
        >
          <X />
        </button>
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold ">Nueva deuda</h2>
          <div className="w-full mt-4 flex flex-col gap-2">
            <label htmlFor="">Conductor</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              name="driver"
              className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">--Selecciona un condcutor--</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="">Concepto/Motivo</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              type="text"
              name=""
              placeholder="Ej: Atraso acumulado de Junio"
            />
          </div>
          <div className="w-full flex items-center gap-4 mt-4">
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor="">Monto total($)</label>
              <input
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                type="number"
                placeholder="$200"
                className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor="">Abono diario($)</label>
              <input
                value={dailyAmount}
                onChange={(e) => setDaily_amount(e.target.value)}
                type="number"
                placeholder="$20"
                className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="">Fecha de inicio</label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <div className="flex gap-4 justify-end mt-6">
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

function DebtCard({ debt, onRefresh }: DebtCardProps) {
  async function handleDelete() {
    const confirmed = window.confirm(
      `Estas seguro que desea eliminar la deuda de ${debt.drivers?.name}?`,
    );
    if (!confirmed) return;
    const supabase = createClient();

    const { error } = await supabase.from("debts").delete().eq("id", debt.id);

    if (error) {
      console.log("Error al eliminar la deuda:", error);
      alert("Hubo un error al eliminar la deuda");
    } else {
      await onRefresh();
    }
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const totalPaid =
    debt.debt_payment?.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    ) || 0;
  const remaining = debt.total_amount - totalPaid;
  const rawPercentage =
    debt.total_amount > 0 ? (totalPaid / debt.total_amount) * 100 : 0;
  const percentage = Math.min(Math.max(rawPercentage, 0), 100);

  const lastPayment =
    debt.debt_payment && debt.debt_payment.length > 0
      ? debt.debt_payment[debt.debt_payment.length - 1]
      : null;

  return (
    <div className="">
      <div className=" w-full p-5 relative bg-custom-dark border border-[#1e2d45] rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-[#1e3a5f] flex items-center justify-center ">
            <span className=" text-[#60a5fa] font-bold">
              {debt.drivers?.name.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-[#e2e8f0] text-sm font-semibold">
              {debt.drivers?.name}
            </h2>
            <p className="text-[#6b8aaa] text-xs">{debt.description}</p>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span className="font-semibold bg-[#2d1a0a] text-[#f97316] border-[#7c3412] px-2 py-2 rounded-xl first-letter:uppercase ">
            {debt.status}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4 mt-8">
          <div className="bg-[#0f1c2e] rounded-xl py-4 flex flex-col items-center">
            <h3 className="text-[#4b6080] font-semibold">Deuda total</h3>
            <span className="font-bold text-white">${debt.total_amount}</span>
          </div>

          <div className="bg-[#0f1c2e] rounded-xl  py-4 flex flex-col items-center">
            <h3 className="text-[#4b6080] font-semibold">Pagado</h3>
            <span className="text-[#00d091] font-bold">
              ${debt.remaining_amount}
            </span>
          </div>

          <div className="bg-[#0f1c2e] rounded-xl py-4 flex flex-col items-center">
            <h3 className="text-[#4b6080] font-semibold">Saldo Restante</h3>
            <span className="font-bold text-red-400">
              ${debt.remaining_amount}
            </span>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-[#4b6080] font-semibold">
              Progreso de pago
            </span>
            <span className="text-white font-semibold">
              {percentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-[#1a2332] rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
        <div className="p-2 mt-4 w-full bg-[#0f1c2e] rounded-xl flex justify-between items-center">
          <div className="flex gap-4">
            <CalendarClock size={18} />
            <p className="text-[#94a3b8] text-sm">
              Abono diario: <span className="font-bold text-white">$5</span>
            </p>
          </div>
          <div className="flex flex-col ">
            <span className="text-sm text-amber-400 flex justify-end">
              ~14 días
            </span>
            <span className="text-sm text-[#4b6080]">Est. 29 Ago 2026</span>
          </div>
        </div>
        <div className="flex justify-between mt-4 ">
          <span className="text-[#4b6080] text-sm">{debt.date}</span>
          <span className="text-[#4b6080] text-sm">
            {lastPayment?.payment_date || "No hay abonos un."}
          </span>
        </div>
        <div className="mt-4 flex gap-4 border-t border-[#1e2d45] p-2">
          <button
            onClick={() => setIsOpen(true)}
            className=" w-full  flex gap-2 items-center justify-center text-xs bg-[#3b82f6] text-white font-semibold px-4 py-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-[#3878de] transition duration-300 ease-in-out"
          >
            {" "}
            <Plus size={16} /> Registrar abono
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="py-2 px-10 bg-[#1e2d45] text-xs flex items-center justify-center gap-2 rounded-lg text-[#94a3b8] cursor-pointer hover:bg-[#1b293e]"
          >
            <History size={16} />
            Historial
          </button>
          <button className="py-1.5 px-3 rounded-lg bg-[#0a2518] border border-[#166534] text-[#00d091]">
            <CircleCheck size={16} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-1.5 px-3 rounded-lg bg-[#0a2518] border border-[#7f1d1d] text-[#ef4444]"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <AddPaymentModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={async () => {
            setIsOpen(false);
            await onRefresh();
          }}
          debt={debt}
        />

        <HistorialPayment
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          debt={debt}
        />
      </div>
    </div>
  );
}

function AddPaymentModal({
  debt,
  onClose,
  isOpen,
  onSuccess,
}: AddPaymentModalProps) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");

  const supabase = createClient();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("debt_payment").insert([
      {
        debt_id: debt.id,
        amount: Number(amount),
        payment_date: date,
        note: note,
      },
    ]);
    if (error) {
      setFormError("Error al enviar los datos");
      console.log(error);
    } else {
      setAmount("");
      setDate("");
      setNote("");
      await onSuccess();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-4xl border border-white/5 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-400"
        >
          <X />
        </button>
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-gray-400">
            Registrar abono
          </h2>
          <div className="flex gap-4 mb-4 text-[#716f6f] text-sm">
            <p>{debt.drivers?.name}</p>
            <span>Saldo: {debt.total_amount}</span>
          </div>
          <div className="flex flex-col gap-2 mb-4 justify-center">
            <label htmlFor="">Fecha del abono</label>
            <input
              className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
            />
          </div>
          <div className="flex flex-col gap-2 mb-4 justify-center">
            <label htmlFor="">Monto ($)</label>
            <input
              className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$10"
              type="number"
            />
          </div>
          <div className="flex flex-col gap-2 mb-4 justify-center">
            <label htmlFor="">Nota (opcional)</label>
            <input
              className="w-full rounded-xl border border-slate-700/70 bg-input-custom px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              type="text"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="bg-[#3f3f46] text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex justify-center transition-colors hover:bg-[#2d2d30] hover:border-[#4b4b4b]"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex justify-center transition-colors hover:bg-blue-700"
              type="submit"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistorialPayment({ debt, isOpen, onClose }: HistorialPaymentProps) {
  const [debtsPayment, setDebtsPayment] = useState<DebtPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen || debt?.id) {
      async function fetchDebtPayment() {
        setLoading(true);
        const { data, error } = await supabase
          .from("debt_payment")
          .select("*")
          .eq("debt_id", debt.id)
          .order("payment_date", { ascending: false });

        if (error) {
          console.error("Error al obtener los pagos", error);
        }
        if (data) setDebtsPayment(data);
        setLoading(false);
      }

      fetchDebtPayment();
    }
  }, [isOpen, debt?.id]);

  if (!isOpen) return null;

  // Calculamos los totales
  const totalPaid = debtsPayment.reduce(
    (acc, payment) => acc + Number(payment.amount),
    0,
  );
  const remainingAmount = debt.total_amount - totalPaid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end  bg-black/60 p-8">
      <div className="relative w-full max-w-112.5 min-h-screen rounded-4xl border border-white/5 bg-[#0f1c2e] p-12 shadow-2xl backdrop-blur-xl text-white">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-400"
        >
          <X />
        </button>

        {/* Encabezado */}
        <div className="flex gap-4 items-start border-b border-[#1e2d45] mb-4">
          <div className="bg-[#1e3a5f] rounded-full w-10 h-10 flex items-center justify-center">
            <span className="font-bold text-sm text-[#60a5fa]">
              {debt.drivers?.name.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-1 flex-col items-start">
            <h2 className="text-xs  text-[#4b6080] font-bold uppercase tracking-wider">
              {debt.drivers?.name}
            </h2>
            <p className="text-base font-semibold mb-4">{debt.description}</p>
          </div>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-3 items-center justify-center gap-3 mb-6">
          <div className="flex flex-col items-center justify-center gap-1 px-3 py-2 bg-custom-dark rounded-xl border border-white/5">
            <h3 className="text-xs text-slate-400">Deuda</h3>
            <span className="font-bold text-white">${debt.total_amount}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 px-3 py-2 bg-custom-dark rounded-xl border border-white/5">
            <h3 className="text-xs text-slate-400">Pagado</h3>
            <span className="font-bold text-[#00d091]">${totalPaid}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 px-3 py-2 bg-custom-dark rounded-xl border border-white/5">
            <h3 className="text-xs text-slate-400">Restante</h3>
            <span className="font-bold text-red-400">${remainingAmount}</span>
          </div>
        </div>

        {/* Lista del Historial de Pagos */}
        <h4 className="text-sm font-semibold mb-2 text-slate-300">
          Historial de abonos
        </h4>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-xs text-slate-500 py-2">Cargando pagos...</p>
          ) : debtsPayment.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              No hay abonos registrados aún.
            </p>
          ) : (
            debtsPayment.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-custom-dark rounded-xl border border-white/5"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-emerald-400">
                    +${payment.amount}
                  </span>
                  {payment.note && (
                    <span className="text-xs text-slate-400">
                      {payment.note}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {payment.payment_date}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
