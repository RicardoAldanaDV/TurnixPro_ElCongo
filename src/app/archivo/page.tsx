"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import * as Dialog from "@radix-ui/react-dialog";

type Gestion = {
  ID: string;
  Nombres: string;
  Apellidos: string;
  Genero: string;
  FechaNacimiento: string;
  NombrePadre: string;
  NombreMadre: string;
  LugarNacimiento: string;
  Comentarios: string;
  Estado: string;
  FechaRegistro: string;
  FechaResolucion: string;
};

export default function ArchivoPage() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [gestionSeleccionada, setGestionSeleccionada] = useState<Gestion | null>(null);

  useEffect(() => {
    const fetchGestiones = async () => {
      const res = await fetch("/api/get-historial");
      const data = await res.json();
      setGestiones(data.data || []);
    };
    fetchGestiones();
  }, []);

  const filtradas = gestiones.filter(
    (g) =>
      g.ID.toLowerCase().includes(busqueda.toLowerCase()) ||
      g.Nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      g.Apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      g.FechaResolucion.toLowerCase().includes(busqueda.toLowerCase())
  );

    const hacerBackup = async () => {
    try {
      const res = await fetch("/api/backup-excel");
      if (!res.ok) throw new Error("Error al generar backup");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // 🔹 Crear enlace visible temporal (para evitar bloqueos del sandbox)
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_turnix_${Date.now()}.xlsx`;
      a.style.display = "none";
      document.body.appendChild(a);

      // 🔹 Simular clic real
      a.click();

      // 🔹 Limpieza
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 1000);

      // 🔹 Notificación visual
      const msg = document.createElement("div");
      msg.textContent = "✅ Backup descargado correctamente";
      msg.style.position = "fixed";
      msg.style.bottom = "20px";
      msg.style.right = "20px";
      msg.style.background = "#15803d";
      msg.style.color = "white";
      msg.style.padding = "12px 18px";
      msg.style.borderRadius = "8px";
      msg.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
      msg.style.fontWeight = "bold";
      msg.style.zIndex = "9999";
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    } catch (error) {
      console.error("Error al crear backup:", error);
      const msg = document.createElement("div");
      msg.textContent = "❌ Error al crear el backup.";
      msg.style.position = "fixed";
      msg.style.bottom = "20px";
      msg.style.right = "20px";
      msg.style.background = "#b91c1c";
      msg.style.color = "white";
      msg.style.padding = "12px 18px";
      msg.style.borderRadius = "8px";
      msg.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
      msg.style.fontWeight = "bold";
      msg.style.zIndex = "9999";
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    }
  };

   const limpiarArchivo = async () => {
    if (confirm("⚠️ ¿Estás seguro de limpiar todas las gestiones resueltas?")) {
      try {
        const res = await fetch("/api/clear-historial", { method: "POST" });
        if (res.ok) {
          // ✅ Mensaje verde flotante
          const msg = document.createElement("div");
          msg.textContent = "✅ Archivo limpiado correctamente";
          msg.style.position = "fixed";
          msg.style.bottom = "20px";
          msg.style.right = "20px";
          msg.style.background = "#15803d";
          msg.style.color = "white";
          msg.style.padding = "12px 18px";
          msg.style.borderRadius = "8px";
          msg.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
          msg.style.fontWeight = "bold";
          msg.style.zIndex = "9999";
          document.body.appendChild(msg);
          setTimeout(() => msg.remove(), 3000);

          window.location.reload();
        } else {
          // ❌ Mensaje rojo flotante
          const msg = document.createElement("div");
          msg.textContent = "❌ Error al limpiar el archivo";
          msg.style.position = "fixed";
          msg.style.bottom = "20px";
          msg.style.right = "20px";
          msg.style.background = "#b91c1c";
          msg.style.color = "white";
          msg.style.padding = "12px 18px";
          msg.style.borderRadius = "8px";
          msg.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
          msg.style.fontWeight = "bold";
          msg.style.zIndex = "9999";
          document.body.appendChild(msg);
          setTimeout(() => msg.remove(), 3000);
        }
      } catch (error) {
        console.error("Error limpiando el archivo:", error);
        alert("❌ No se pudo limpiar el archivo.");
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-neutral-900 text-white">
      <Card className="bg-neutral-900 border border-blue-500 shadow-[0_0_15px_#00f]">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl font-semibold text-blue-400 flex items-center gap-2">
            📂 Archivo de Gestiones Resueltas
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={hacerBackup}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_8px_#00f]"
            >
              Descargar Backup
            </Button>
            <Button
              onClick={limpiarArchivo}
              className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_12px_#f00] animate-pulse"
            >
              Limpiar Archivo
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Buscador */}
          <div className="mb-4">
            <Input
              placeholder="Buscar por nombre, ID o fecha..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-neutral-800 border border-blue-500 text-white placeholder-blue-300 shadow-[0_0_6px_#00f]"
            />
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-blue-500 shadow-[0_0_12px_#00f]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-900/40 text-blue-300">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Nombres</th>
                  <th className="p-3 text-left">Apellidos</th>
                  <th className="p-3 text-left">Fecha Resolución</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center p-4 text-blue-400 italic"
                    >
                      No hay gestiones resueltas
                    </td>
                  </tr>
                )}
                {filtradas.map((g) => (
                  <tr
                    key={g.ID}
                    className="cursor-pointer border-t border-blue-800 hover:bg-blue-900/30 transition"
                    onClick={() => setGestionSeleccionada(g)}
                  >
                    <td className="p-3 font-bold text-white">{g.ID}</td>
                    <td className="p-3 text-gray-200">{g.Nombres}</td>
                    <td className="p-3 text-gray-200">{g.Apellidos}</td>
                    <td className="p-3 text-blue-300">{g.FechaResolucion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de solo lectura */}
      <Dialog.Root open={!!gestionSeleccionada} onOpenChange={() => setGestionSeleccionada(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[500px] max-h-[80vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 bg-neutral-900 border border-blue-500 shadow-[0_0_20px_#00f] p-6 rounded-lg text-white">
            <Dialog.Title className="text-lg font-bold text-blue-400 mb-4">
              📌 Detalles de la Gestión
            </Dialog.Title>
            {gestionSeleccionada && (
              <div className="space-y-2">
                <p><b>ID:</b> {gestionSeleccionada.ID}</p>
                <p><b>Nombres:</b> {gestionSeleccionada.Nombres}</p>
                <p><b>Apellidos:</b> {gestionSeleccionada.Apellidos}</p>
                <p><b>Género:</b> {gestionSeleccionada.Genero}</p>
                <p><b>Fecha de Nacimiento:</b> {gestionSeleccionada.FechaNacimiento}</p>
                <p><b>Nombre del Padre:</b> {gestionSeleccionada.NombrePadre}</p>
                <p><b>Nombre de la Madre:</b> {gestionSeleccionada.NombreMadre}</p>
                <p><b>Lugar de Nacimiento:</b> {gestionSeleccionada.LugarNacimiento}</p>

                <p className="font-bold">Comentarios:</p>
                <div className="max-h-32 overflow-y-auto p-2 bg-neutral-800 rounded border border-blue-500 text-sm">
                  {gestionSeleccionada.Comentarios || "Sin comentarios"}
                </div>

                <p><b>Fecha Registro:</b> {gestionSeleccionada.FechaRegistro}</p>
                <p><b>Fecha Resolución:</b> {gestionSeleccionada.FechaResolucion}</p>
              </div>
            )}
            <div className="flex justify-between items-center mt-6">
              <Dialog.Close asChild>
                <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                  Cerrar
                </Button>
              </Dialog.Close>
              <span className="text-green-400 font-bold text-sm">
                ✅ Gestión Resuelta
              </span>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
