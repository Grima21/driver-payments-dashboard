"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/dist/client/components/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: "Pagos",
      href: "payment",
      icon: CreditCard,
    },
    {
      label: "Conductores",
      href: "driver",
      icon: Users,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          fixed left-4 top-4 z-50 lg:hidden
          rounded-lg bg-slate-800 p-2 text-white"
      >
        {" "}
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden"></div>
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Header/logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex items-center gap-2">
            <div className="flex w-9 h-9 items-center justify-center rounded-lg bg-sky-500 p-2">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white">Driver Payment</h1>
          </div>
        </div>

        {/*Navigation*/}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-200 hover:bg-slate-800"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={20} className="text-slate-300" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 p-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-lg text-sm fond-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 px-3 py-2"
          >
            <LogOut size={20} />
            Cerrar sesion
          </Link>
        </div>
      </aside>
    </>
  );
}
