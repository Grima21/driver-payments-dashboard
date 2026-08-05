"use client";
import { ChevronRight, ChevronLeft } from "lucide-react";
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
  note: string | null;
}

export default function PaymentPage() {
  const [payment, setPayment] = useState<Payment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkedCells, setCheckedCells] = useState<Record<string, boolean>>({});
  const [cellNotes, setCellNotes] = useState<Record<string, string>>({});
  const [currentDate, setCurrentDate] = useState(() => new Date());

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

  // Función para procesar el pago de un conductor
  async function handleCellPayment(driver: Driver, date: string) {
    // Verificar si el pago ya ha sido procesado para hoy
    try {
      setLoading(true);
      // Obtener el ID del conductor seleccionado
      const driverId = driver.id;
      const noteValue = (cellNotes[cellKey(driverId, date)] ?? "").trim();

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
        const existingPayment = data[0];
        const { error: updateError } = await supabase
          .from("payments")
          .update({ note: noteValue || null })
          .eq("id", existingPayment.id);

        if (updateError) {
          console.log("Error updating payment note", updateError.message);
          return;
        }

        setMessage("Pago y nota actualizados correctamente.");
        setMessageType("success");
        fetchPayment();
        return;
      }

      // Si no hay pago registrado para hoy, insertar el nuevo pago
      const { error } = await supabase.from("payments").insert({
        payment_date: date,
        amount: driver.daily_rate,
        driver_id: driverId,
        note: noteValue || null,
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
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateList: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDay = day.toString().padStart(2, "0");
    const formattedMonthNum = (month + 1).toString().padStart(2, "0");
    dateList.push(`${year}-${formattedMonthNum}-${formattedDay}`);
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

  const handleCellClick = (
    e: React.MouseEvent<HTMLTableCellElement>,
    driver: Driver,
    date: string,
  ) => {
    if ((e.target as HTMLElement).closest("input, textarea, button")) {
      return;
    }

    handleCellPayment(driver, date);
  };

  const handleCellNoteChange = (
    driverId: string,
    date: string,
    value: string,
  ) => {
    const key = cellKey(driverId, date);
    setCellNotes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCellNoteBlur = async (
    driverId: string,
    date: string,
    value: string,
  ) => {
    const key = cellKey(driverId, date);
    const noteValue = value.trim();
    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("payments")
      .select("id")
      .eq("driver_id", driverId)
      .eq("payment_date", date);

    if (fetchError) {
      console.log("Error fetching payment", fetchError.message);
      return;
    }

    if (data.length === 0) {
      return;
    }

    const { error: updateError } = await supabase
      .from("payments")
      .update({ note: noteValue || null })
      .eq("id", data[0].id);

    if (updateError) {
      console.log("Error updating payment note", updateError.message);
      return;
    }

    fetchPayment();
  };

  // Sumar únicamente los pagos pertenecientes al mes y año que se está visualizando
  const totalPaid = payment
    .filter((p) => {
      const paymentDateObj = new Date(p.payment_date + "T00:00:00");
      return (
        paymentDateObj.getMonth() === currentDate.getMonth() &&
        paymentDateObj.getFullYear() === currentDate.getFullYear()
      );
    })
    .reduce((total, p) => total + p.amount, 0);

  //Pagos realizados hoy
  const today = new Date().toISOString().split("T")[0];
  const paymentsToday = payment.filter((p) => p.payment_date === today).length;

  // Total pagado hoy
  const totalPaidToday = payment
    .filter((p) => p.payment_date === today)
    .reduce((total, p) => total + p.amount, 0);

  //funcion para controlar el cambio de meses.
  //avanzar un mes
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
  const formattedMonthHeader = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  const displayMonthHeader =
    formattedMonthHeader.charAt(0).toUpperCase() +
    formattedMonthHeader.slice(1);
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
            <Link
              className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg border border-gray-600 cursor-pointer hover:bg-blue-400 transition duration-300 ease-in-out"
              href={"/dashboard/driver"}
            >
              Gestionar Conductores
            </Link>
          </div>
        </div>

        {/* Tabla de pagos */}
        <div
          className="w-full mt-4 rounded-xl overflow-x-auto scrollbar-thin"
          style={{ border: "1px solid #1e2d45" }}
        >
          <table className="min-w-full border-collapse ">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #1e2d45",
                  background: "#0f1c30",
                }}
              >
                <th
                  className="min-w-[220px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#94a3b8" }}
                >
                  Fecha
                </th>
                {drivers.map((driver) => (
                  <th
                    key={driver.id}
                    className="min-w-[90px] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#94a3b8" }}
                  >
                    {driver.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dateList.map((dates, i) => (
                <tr
                  key={dates}
                  style={{
                    borderBottom: "1px solid #1a2540",
                    background: i % 2 === 0 ? "#111827" : "#0f1c2e",
                  }}
                >
                  <td
                    className="px-5 py-2.5 text-xs font-semibold tracking-wider"
                    style={{ color: "#cbd5e1" }}
                  >
                    {formatDate(dates)}
                  </td>
                  {drivers.map((driver) => {
                    const paymentForCell = payment.find(
                      (p) =>
                        p.driver_id === driver.id && p.payment_date === dates,
                    );
                    const isPaid = Boolean(paymentForCell);
                    const cellInputKey = cellKey(driver.id, dates);

                    return (
                      <td
                        key={driver.id}
                        onClick={(e) => handleCellClick(e, driver, dates)}
                        className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer transition duration-300 ease-in-out"
                        style={{
                          color: isPaid ? "#10b981" : "#ef4444",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLTableCellElement
                          ).style.background = isPaid ? "#0a2518" : "#2d1a1a";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLTableCellElement
                          ).style.background = "transparent";
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>{isPaid ? "✔" : "✘"}</span>
                          <input
                            type="text"
                            value={
                              cellNotes[cellInputKey] ??
                              paymentForCell?.note ??
                              ""
                            }
                            onChange={(e) =>
                              handleCellNoteChange(
                                driver.id,
                                dates,
                                e.target.value,
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            onBlur={(e) =>
                              handleCellNoteBlur(
                                driver.id,
                                dates,
                                e.target.value,
                              )
                            }
                            className="w-46 rounded bg-transparent px-1 py-0.5 text-[14px] text-slate-200 outline-none focus:border-cyan-400"
                            placeholder="nota"
                          />
                        </div>
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
