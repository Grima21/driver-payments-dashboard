import {
  User2,
  AlertTriangle,
  HandCoins,
  TrendingUp,
  ChevronRight,
  Clock,
  LayoutDashboardIcon,
  CreditCard,
  Users,
  Car,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { WeeklyPaymentChart } from "@/components/WeeklyPaymentsChart";

interface DebtRecord {
  total_amount: number;
  remaining_amount: number;
  driver: {
    id: string;
    name: string;
  } | null;
}

interface RecentPayment {
  id: string;
  amount: number;
  payment_date: string;
  driver: {
    id: string;
    name: string;
  } | null;
}

interface DocumentAlert {
  id: string;
  title: string;
  vehicleInfo: string;
  days: number;
  isExpired: boolean;
}

export default async function Dashboard() {
  const supabase = await createClient();
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const todayStr = now.toISOString().split("T")[0];

  const [
    { data: monthlyPayments },
    { data: recentPaymentsData },
    { data: drivers },
    { data: debtsData },
    { data: vehicleData },
  ] = await Promise.all([
    supabase
      .from("payments")
      .select(`amount, payment_date`)
      .gte("payment_date", startOfMonth),
    supabase
      .from("payments")
      .select(`id, amount, payment_date, driver:drivers(id, name)`)
      .order("payment_date", { ascending: false })
      .limit(5),

    supabase.from("drivers").select("id, name"),
    supabase.from("debts").select(`total_amount,
      remaining_amount,
      driver:drivers(id, name)`),
    supabase
      .from("vehicle")
      .select(
        "id, insurance_due_date, plate_due_date, maintenance_date, make_model, license_plate",
      ),
  ]);
  const debts = (debtsData as unknown as DebtRecord[]) || [];
  const recentPayments =
    (recentPaymentsData as unknown as RecentPayment[]) || [];
  const totalDriver = drivers?.length;

  const totalRecaudado =
    monthlyPayments?.reduce((acc, p) => acc + (p.amount || 0), 0) ?? 0;
  const payments = monthlyPayments || [];
  const totalToday = payments
    .filter((p) => p.payment_date && p.payment_date.startsWith(todayStr))
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const totalDebt =
    debts?.reduce((acc, d) => acc + (d.total_amount || 0), 0) ?? 0;

  const vehicles = vehicleData || [];
  const today = new Date();
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const totalAlerts = vehicles.reduce((acc, v) => {
    let count = 0;

    // Evalúa Seguro
    if (v.insurance_due_date) {
      const insDate = new Date(v.insurance_due_date);
      if (insDate <= next30Days) count++;
    }

    // Evalúa Mantenimiento
    if (v.maintenance_date) {
      const maintDate = new Date(v.maintenance_date);
      if (maintDate <= next30Days) count++;
    }

    return acc + count;
  }, 0);

  // 3. Moldear los datos para que tengan los 7 días con su total
  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Genera la estructura vacía para los últimos 7 días
  const last7DaysMap = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateFormatted = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayName = i === 6 ? "Hoy" : daysOfWeek[d.getDay()];

    return {
      dateStr: dateFormatted,
      day: dayName,
      total: 0,
    };
  });

  // Suma los amount por fecha
  payments.forEach((p) => {
    if (!p.payment_date) return;
    const paymentDate = new Date(p.payment_date).toISOString().split("T")[0];
    const targetDay = last7DaysMap.find((d) => d.dateStr === paymentDate);

    if (targetDay) {
      targetDay.total += Number(p.amount || 0);
    }
  });
  const weeklyData = last7DaysMap.map(({ day, total }) => ({ day, total }));

  //Obtener los vehiculos desde supabase
  const vehicle = vehicleData || [];
  const alerts: DocumentAlert[] = [];

  // 2. Mapeamos cada vehículo y desplegamos sus fechas
  vehicles.forEach((v) => {
    const docs = [
      { title: "Póliza de seguro", date: v.insurance_due_date },
      { title: "Placa / Marchamo", date: v.plate_due_date },
      { title: "Revisión técnica", date: v.maintenance_date },
    ];

    docs.forEach((doc) => {
      if (!doc.date) return;

      const dueDate = new Date(doc.date);
      // Diferencia en días enteros
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Solo mostramos alertas si faltan 30 días o menos, o si ya venció
      if (diffDays <= 30) {
        alerts.push({
          id: `${v.id}-${doc.title}`,
          title: doc.title,
          vehicleInfo: `${v.license_plate || "S/P"} · ${v.make_model || ""}`,
          days: diffDays,
          isExpired: diffDays < 0,
        });
      }
    });
  });

  const menuItems = [
    {
      label: "Pagos",
      href: "/dashboard/payment",
      icon: CreditCard,
      description: "Registro diario de pagos por conductor",
      color: "text-[#3B82F6]",
      bgColor: "bg-[#1E3A5F]",
      hoverBg: "hover:bg-[#1E3A5F]",
    },
    {
      label: "Conductores",
      href: "/dashboard/driver",
      icon: Users,
      description: "Gestiona los conductores de tu flota",
      color: "text-[#A78BFA]",
      bgColor: "bg-[#2E1B5E]",
      hoverBg: "hover:bg-[#2E1B5E]",
    },
    {
      label: "Vehiculos",
      href: "/dashboard/vehicle",
      icon: Car,
      description: "Flota, documentos y vencimientos",
      color: "text-[#10b981]",
      bgColor: "bg-[#0A2518]",
      hoverBg: "hover:bg-[#0A2518]",
    },
    {
      label: "Mantenimiento",
      href: "/dashboard/maintenance",
      icon: Wrench,
      description: "Historial de servicios y reparaciones",
      color: "text-[#FBBF24]",
      bgColor: "bg-[#1f1500]",
      hoverBg: "hover:bg-[#1f1500]",
    },
    {
      label: "Deuda",
      href: "/dashboard/debts",
      icon: HandCoins,
      description: "Arreglos de pagos y seguimientos de abonos",
      color: "text-[#F97316]",
      bgColor: "bg-[#2D1A0A]",
      hoverBg: "hover:bg-[#2D1A0A]",
    },
  ];
  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),linear-gradient(180deg,#081122_0%,#0f172a_100%)]">
      <div className="w-full max-w-375 mx-auto mt-10 md:mt-16 mb-8 ">
        <h1 className="text-3xl font-bold text-white  mb-2 md:text-4xl ">
          Gestion de Pagos
        </h1>
        <p className="text-[#8f8f8f] mt-2">
          Control diario de pagos y conductores.
        </p>

        {/* EStadistica de la tabla */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[#041b18] p-8 rounded-xl border border-green-900">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-400">
                Recaudado del mes
              </h2>
              <TrendingUp className="text-[#00d091] " />
            </div>
            <p className="text-3xl font-bold text-[#00d091] mt-5">
              {" "}
              ${totalRecaudado}
            </p>
          </div>

          <div className="bg-[#0f1216] p-8 rounded-xl border border-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-400">
                Conductores activos
              </h2>

              <User2 className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white mt-5">{totalDriver}</p>
          </div>

          <div className="bg-[#2d1a1a] p-8 rounded-xl border border-[#7f1d1d]">
            <div className="flex item-center justify-between">
              <h2 className="text-lg font-semibold text-gray-400">
                Alerta de documentos
              </h2>
              <AlertTriangle className="text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white mt-5">{totalAlerts}</p>
          </div>

          <div className="bg-[#1f1500]   border-[#78350f]  p-8 rounded-xl border ">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-400">
                Deudas activas
              </h2>
              <HandCoins className="text-[#fbbf24]" />
            </div>
            <p className="text-3xl font-bold text-white mt-5">${totalDebt}</p>
          </div>
        </div>

        <WeeklyPaymentChart data={weeklyData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-10 items-start ">
          {/* card de alerta documentos */}
          <div className="bg-[#141E30] border border-[#1E2D45] rounded-xl p-6 lg:row-span-2 h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                Alertas de documentos
              </h3>
              <button className="text-xs text-blue-400 hover:underline">
                Ver todos &gt;
              </button>
            </div>

            <div className="space-y-3 ">
              {alerts.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  Todos los documentos están al día.
                </p>
              ) : (
                alerts.slice(0, 8).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border ${
                      alert.isExpired
                        ? "border-red-500/50 "
                        : "border-amber-500/30 "
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {alert.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {alert.vehicleInfo}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        alert.isExpired
                          ? "bg-red-500/30 text-red-400 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}
                    >
                      {alert.isExpired
                        ? `Vencido ${Math.abs(alert.days)}d`
                        : `En ${alert.days}d`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card de deudas activas.*/}
          <div className="bg-custom-dark p-5 rounded-xl border border-[#262634]">
            <div className="flex justify-between item-center">
              <h2 className="text-white font-semibold text-sm">
                Deudas Activas
              </h2>
              <a
                href="/dashboard/deb"
                className="flex gap-2 items-center text-[#3b82f6] cursor-pointer text-xs"
              >
                Ver todas
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            <div>
              {debts.map((d) => (
                <div
                  className="bg-[#0f1c2e] py-3 px-4 rounded-lg mt-2"
                  key={d.driver?.name}
                >
                  <div className="flex items-center gap-4 ">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "#1e3a5f", color: "#60a5fa" }}
                    >
                      {d.driver?.name.charAt(0).toUpperCase()}
                    </div>
                    <h2>{d.driver?.name}</h2>
                    <div className="ml-auto flex flex-col justify-end gap-2">
                      <span className="text-[#ef4444] text-sm font-bold">
                        ${d.remaining_amount} restante
                      </span>
                      <span className="flex gap-2 items-center text-xs font-medium text-[#4b6080]">
                        <Clock className="w-3 h-3" />
                        ~12 días
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#1a2332] rounded-full h-2 overflow-hidden  mt-2">
                    <div className="bg-emerald-500 h-full transition-all duration-500 ease-out"></div>
                  </div>
                  <div>
                    <p className="text-[#4b6080] text-xs mt-1">
                      $50 de $165 pagados (30%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card de ultimos pagos*/}
          <div className="bg-custom-dark p-5 rounded-xl border border-[#262634]">
            <div className="flex justify-between item-center mb-4">
              <h2 className="text-white font-semibold text-sm">
                últimos pagos
              </h2>
              <a
                href="/dashboard/debts"
                className="flex gap-2 items-center text-[#3b82f6] cursor-pointer text-xs"
              >
                Ver todas
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            {recentPayments.map((r) => (
              <div
                className="flex justify-between bg-[#0f1c2e] p-4 rounded-lg mb-2"
                key={r.id}
              >
                <div className="flex gap-2 items-center">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "#1e3a5f", color: "#60a5fa" }}
                  >
                    {r.driver?.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-sm text-white ">{r.driver?.name}</h2>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[#4B6080] text-xs">
                    {r.payment_date}
                  </span>
                  <p className="text-xs font-semibold text-[#00d091]">
                    {" "}
                    +${r.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="w-full grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          {menuItems.map((m) => (
            <button
              key={m.href}
              type="button"
              className={`bg-[#141E30] text-lef rounded-xl   p-4 border border-[#1E2D45] ${m.hoverBg} transition ease-in `}
            >
              <Link href={m.href} className="  flex flex-col gap-2 ">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center  ${m.bgColor}`}
                >
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <h2 className="text-left text-sm font-semibold">{m.label}</h2>
                <p className="text-left text-xs leading-snug text-[#4B6080]">
                  {m.description}
                </p>
              </Link>
            </button>
          ))}
        </footer>
      </div>
    </div>
  );
}
