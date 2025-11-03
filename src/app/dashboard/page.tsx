"use client";

import { useEffect, useState } from "react";
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
  HoraCreacion: string;
};

export default function DashboardPage() {
  const [pendientes, setPendientes] = useState<Gestion[]>([]);
  const [porLlamar, setPorLlamar] = useState<Gestion[]>([]);
  const [gestionSeleccionada, setGestionSeleccionada] = useState<Gestion | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGestiones = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/get-gestiones");
      const data = await res.json();

      const todas: Gestion[] = data.data || [];
      const pendientesFiltradas = todas.filter(
        (g) => g.Estado?.toLowerCase() === "pendiente"
      );
      const porLlamarFiltradas = todas.filter(
        (g) => g.Estado?.toLowerCase() === "por llamar"
      );

      setPendientes(pendientesFiltradas);
      setPorLlamar(porLlamarFiltradas);

      //  Actualizar lista en la pantalla
      const canal = new BroadcastChannel("pantalla-channel");
      canal.postMessage({
        tipo: "actualizar-lista",
        lista: porLlamarFiltradas.map((g) => g.ID),
      });
    } catch (error) {
      console.error("Error al obtener gestiones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGestiones();
    const interval = setInterval(fetchGestiones, 3000);
    return () => clearInterval(interval);
  }, []);

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    try {
      console.log("[TurnixPro]  Actualizando estado:", { ID: id, nuevoEstado });

      const res = await fetch("/api/update-gestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        //  CORREGIDO: enviar 'ID' igual que en Sheets
        body: JSON.stringify({ ID: id, nuevoEstado }),
      });

      const data = await res.json();
      console.log("[TurnixPro]  Respuesta update:", data);

      if (!res.ok || !data.success) {
        alert("⚠️ Error al actualizar: " + (data.error || "Respuesta inválida"));
        return;
      }

      await fetchGestiones();
      setGestionSeleccionada(null);
    } catch (error) {
      console.error("❌ Error al actualizar estado:", error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-neutral-900 text-white relative">
      {/* Spinner pequeño */}
      {loading && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 text-blue-400 text-sm opacity-80">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          <span>Actualizando...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pendientes */}
        <div className="bg-neutral-900 border border-blue-500 shadow-[0_0_15px_#00f] rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3 text-blue-400">
            Pendientes ({pendientes.length})
          </h2>
          {pendientes.length === 0 && (
            <p className="text-blue-300 italic">No hay gestiones pendientes</p>
          )}
          {pendientes.map((g) => (
            <div
              key={g.ID}
              className="cursor-pointer border border-blue-500 rounded p-3 mb-2 hover:bg-blue-900/30 transition shadow-[0_0_6px_#00f]"
              onClick={() => setGestionSeleccionada(g)}
            >
              <p className="text-white font-bold">{g.ID}</p>
              <p className="text-gray-300">
                {g.Nombres} {g.Apellidos}
              </p>
              <p className="text-xs text-gray-400 italic">
                🕒 {g.HoraCreacion || "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Por Llamar */}
        <div className="bg-neutral-900 border border-blue-500 shadow-[0_0_15px_#00f] rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3 text-blue-400">
            Por Llamar ({porLlamar.length})
          </h2>
          {porLlamar.length === 0 && (
            <p className="text-blue-300 italic">No hay gestiones por llamar</p>
          )}
          {porLlamar.map((g) => (
            <div
              key={g.ID}
              className="cursor-pointer border border-blue-500 rounded p-3 mb-2 hover:bg-blue-900/30 transition shadow-[0_0_6px_#00f]"
              onClick={() => setGestionSeleccionada(g)}
            >
              <p className="text-white font-bold">{g.ID}</p>
              <p className="text-gray-300">
                {g.Nombres} {g.Apellidos}
              </p>
              <p className="text-xs text-gray-400 italic">
                🕒 {g.HoraCreacion || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalles */}
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
                <p><b>Fecha Resolución:</b> {gestionSeleccionada.FechaResolucion || "—"}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <Dialog.Close asChild>
                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">
                  Cerrar
                </button>
              </Dialog.Close>

              {/* Acciones */}
              {gestionSeleccionada?.Estado.toLowerCase() === "pendiente" && (
                <button
                  onClick={() => {
                    console.log("[TurnixPro] 🧩 gestión seleccionada:", gestionSeleccionada);
                    if (!gestionSeleccionada?.ID || gestionSeleccionada.ID.trim() === "") {
                      alert("⚠️ Esta gestión no tiene un ID válido.");
                      return;
                    }
                    actualizarEstado(gestionSeleccionada.ID, "Por Llamar");
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white"
                >
                  Pasar a Por Llamar
                </button>
              )}

              {gestionSeleccionada?.Estado.toLowerCase() === "por llamar" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const canal = new BroadcastChannel("pantalla-channel");
                      canal.postMessage({ tipo: "llamar", id: gestionSeleccionada.ID });
                      canal.postMessage({
                        tipo: "actualizar-lista",
                        lista: porLlamar.map((g) => g.ID),
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                  >
                    Llamar
                  </button>

                  <button
                    onClick={() => actualizarEstado(gestionSeleccionada.ID, "Resuelto")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                  >
                    Resuelto
                  </button>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="fixed bottom-2 left-2 text-xs text-blue-500 opacity-40 select-none pointer-events-none">
        RJGADev
      </div>
    </div>
  );
}
