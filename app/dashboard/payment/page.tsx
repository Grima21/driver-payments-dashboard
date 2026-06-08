"use client";
import { MoveLeft, MoveRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Driver {
  id: string;
  name: string;
  daily_rate: number;
}

interface Payment {
  id: string;
  driver_id: string;
  payment_date: string;
  amount: number;
}

export default function PaymentPage() {
  const [payment, setPayment] = useState<Payment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkedCells, setCheckedCells] = useState<Record<string, boolean>>({});

  async function fetchDriver() {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, name, daily_rate");
      if (error) {
        console.log("Error fetching drivers", error.message);
        return;
      }
      setDrivers(data);
    } catch (error) {
      console.log("Error fetching drivers", error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDriver();
    fetchPayment();
  }, []);

  useEffect(() => {
    if (message.length > 0) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Función para obtener los pagos de la base de datos
  async function fetchPayment() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("payments").select("*");

      if (error) {
        console.log("ERRRO DANGER ERROR", error.message);
        return;
      }
      setPayment(data);
    } catch (error) {
      console.log("Error fetching payment", error);
    }
  }
  // Función para procesar el pago de un conductor
  async function handleCellPayment(driver: Driver, date: string) {
    // Verificar si el pago ya ha sido procesado para hoy
    try {
      setLoading(true);
      // Obtener el ID del conductor seleccionado
      const driverId = driver.id;

      // Verificar si ya existe un pago para el conductor en la fecha de hoy
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("payments")
        .select("*")
        .eq("driver_id", driverId)
        .eq("payment_date", date);

      if (fetchError) {
        console.log("Error fetching payment", fetchError.message);
        return;
      }

      if (data.length > 0) {
        setMessage("El pago de hoy ya ha sido procesado para este conductor.");
        setMessageType("error");
        return;
      }
      // Si no hay pago registrado para hoy, insertar el nuevo pago
      // Reuse the existing supabase client created above
      const { error } = await supabase.from("payments").insert({
        payment_date: date,
        amount: driver.daily_rate,
        driver_id: driverId,
      });

      if (error) {
        console.log("Error fetching payment", error.message);

        return;
      }
      setMessage("Pago procesado exitosamente.");
      setMessageType("success");
      handleCellCheck(driver.id, date);
      fetchPayment();
    } catch (error) {
      console.log("Error fetching payment", error);
    } finally {
      setLoading(false);
    }
  }

  // Función para obtener el nombre del conductor a partir de su ID
  function getDriverName(driverId: string) {
    const driver = drivers.find((d) => d.id === driverId);
    return driver ? driver.name : "Unknown Driver;";
  }
  // Función para eliminar un pago
  const deletePayment = async (paymenId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", paymenId);

      if (error) {
        console.log("Error deleting payment", error.message);
        return;
      }
      setMessage("Pago eliminado exitosamente.");
      setMessageType("success");
      fetchPayment();
    } catch (error) {
      console.log("Error deleting payment", error);
    }
  };

  // Generar fechas para la tabla de pagos
  const daysInMonth = new Date(2026, 6, 0).getDate();
  const date = [];
  for (let day = 1; day <= daysInMonth; day++) {
    date.push(`2026-06-${day.toString().padStart(2, "0")}`);
  }
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const formatted = new Date(dateString + "T00:00:00").toLocaleDateString(
      "es-ES",
      options,
    );
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };
  const cellKey = (driverId: string, date: string) => `${driverId}-${date}`;
  const handleCellCheck = (driverId: string, date: string) => {
    const key = cellKey(driverId, date);
    setCheckedCells((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  //SUMAR EL TOTAL PAGADO EN EL MES
  const totalPaid = payment.reduce((total, p) => total + p.amount, 0);

  //Pagos realizados hoy
  const today = new Date().toISOString().split("T")[0];
  const paymentsToday = payment.filter((p) => p.payment_date === today).length;

  // Total pagado hoy
  const totalPaidToday = payment
    .filter((p) => p.payment_date === today)
    .reduce((total, p) => total + p.amount, 0);
  return (
    <div className="w-full h-full p-4 md:p-8 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),linear-gradient(180deg,#081122_0%,#0f172a_100%)]">
      <div className="w-full max-w-375 mx-auto mt-10 md:mt-16 mb-8 ">
        <h1 className="text-3xl font-bold text-white  mb-2 md:text-4xl ">
          Gestion de Pagos
        </h1>
        <p className="text-[#8f8f8f] mt-2">
          Control diario de pagos y conductores.
        </p>

        {/* EStadistica de la tabla */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          <div className="bg-[#041b18] p-12 rounded-xl border border-green-900">
            <h2 className="text-lg font-semibold text-gray-400">
              Total pagado del Mes
            </h2>
            <p className="text-3xl font-bold text-[#00d091] mt-5">
              {totalPaid}
            </p>
          </div>

          <div className="bg-[#0f1216] p-12 rounded-xl border border-gray-900">
            <h2 className="text-lg font-semibold text-gray-400">
              Pagos realizados Hoy
            </h2>
            <p className="text-3xl font-bold text-white mt-5">
              {paymentsToday}
            </p>
          </div>

          <div className="bg-[#0f1216] p-12 rounded-xl border border-gray-900">
            <h2 className="text-lg font-semibold text-gray-400">
              Total Pagado Hoy
            </h2>
            <p className="text-3xl font-bold text-white mt-5">
              {totalPaidToday}
            </p>
          </div>

          <div className="bg-[#0f1216]  p-12 rounded-xl border border-gray-900">
            <h2 className="text-lg font-semibold text-gray-400">
              Conductores Activos
            </h2>
            <p className="text-3xl font-bold text-white mt-5">4</p>
          </div>
        </div>

        {/*Tabla de pagos*/}
        <div className="w-full mt-4 bg-[#0f1216] rounded-xl p-6 border border-gray-900 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center mb-4 md:mb-0">
            <button className="bg-black text-white px-2 py-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-neutral-800 transition duration-300 ease-in-out">
              {" "}
              <MoveLeft />{" "}
            </button>
            <h2>Mayo 2026</h2>
            <button className="bg-black text-white px-2 py-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-neutral-800 transition duration-300 ease-in-out">
              {" "}
              <MoveRight />{" "}
            </button>
          </div>
          <div>
            <Link
              className="bg-blue-500 text-white px-4 py-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-blue-600 transition duration-300 ease-in-out"
              href={"/dashboard/driver"}
            >
              Gestionar Conductores
            </Link>
          </div>
        </div>

        {/*Tabla de pagos*/}
        <div className="w-full mt-4 rounded-xl border border-slate-700 bg-neutral-900 p-4 shadow-inner overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="min-w-[220px] border border-slate-700 bg-neutral-900 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Fecha
                </th>
                {drivers.map((driver) => (
                  <th
                    key={driver.id}
                    className="min-w-[90px] border border-slate-700 bg-neutral-900 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    {driver.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {date.map((dates) => (
                <tr key={dates}>
                  <td className="border border-slate-700 px-4 py-3 bg-neutral-900 text-slate-100 text-left text-xs font-semibold  tracking-wider ">
                    {formatDate(dates)}
                  </td>
                  {drivers.map((driver) => {
                    const isPaid = payment.some(
                      (p) =>
                        p.driver_id === driver.id && p.payment_date === dates,
                    );

                    return (
                      <td
                        key={driver.id}
                        onClick={() => handleCellPayment(driver, dates)}
                        className={`border border-slate-700 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer transition duration-300 ease-in-out
              
        ${
          isPaid
            ? "text-green-500 hover:bg-[#1e683d]"
            : "text-red-600 hover:bg-slate-800"
        }
      `}
                      >
                        {isPaid ? "✔" : "X"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
