"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const metadata = {
  title: "TurnixPro",
  description: "Gestión de Turnos - TurnixPro",
};

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const esPantalla = pathname.startsWith("/pantalla-ventana");

  if (esPantalla) {
    // ⚙️ Pantalla de llamadas: sin header ni padding
    return <>{children}</>;
  }

  const tabs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/nuevo-registro", label: "Nuevo Registro" },
    { href: "/archivo", label: "Archivo" },
    { href: "/pantalla", label: "Pantalla" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white px-8 py-6">
      {/* 🔹 Encabezado */}
      <header className="flex items-center justify-between mb-8 border-b border-blue-800/40 pb-3">
        <h1 className="text-2xl font-bold glow drop-shadow-[0_0_15px_#007bff]">
          ALCALDIA DE EL CONGO
        </h1>

        {/* 🔹 Navegación */}
        <nav className="flex space-x-4 text-sm">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`navbar-link ${
                pathname === tab.href ? "navbar-link-active" : ""
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* 🔹 Contenido principal */}
      <main className="fade-in">{children}</main>

      {/* 🔹 Footer */}
      <footer className="mt-10 text-center text-sm text-gray-400">
        <span className="glow">RJGA Dev</span>
      </footer>
    </div>
  );
}
