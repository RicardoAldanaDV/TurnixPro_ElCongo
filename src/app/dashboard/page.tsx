"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

function formatearFechaHora(value?: string | null) {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("es-SV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "America/El_Salvador",
  }).format(d);
}


function formatearSoloFecha(value?: string | null) {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("es-SV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/El_Salvador",
  }).format(d);
}


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

// Normaliza cualquier objeto (Supabase o GoogleSheets-style) a tu tipo Gestion
function normalizarGestion(raw: any): Gestion {
  const ID = raw?.ID ?? raw?.id ?? raw?.Id ?? raw?.ID_ ?? "";
  const Estado = raw?.Estado ?? raw?.estado ?? raw?.ESTADO ?? "";
  const FechaRegistro =
    raw?.FechaRegistro ?? raw?.fecha_registro ?? raw?.fechaRegistro ?? "";
  const FechaResolucion =
    raw?.FechaResolucion ?? raw?.fecha_resolucion ?? raw?.fechaResolucion ?? "";

  return {
    ID: String(ID ?? "").trim(),
    Nombres: String(raw?.Nombres ?? raw?.nombres ?? "").trim(),
    Apellidos: String(raw?.Apellidos ?? raw?.apellidos ?? "").trim(),
    Genero: String(raw?.Genero ?? raw?.genero ?? "").trim(),
    FechaNacimiento: String(raw?.FechaNacimiento ?? raw?.fecha_nacimiento ?? raw?.fechaNacimiento ?? "").trim(),
    NombrePadre: String(raw?.NombrePadre ?? raw?.nombre_padre ?? raw?.nombrePadre ?? "").trim(),
    NombreMadre: String(raw?.NombreMadre ?? raw?.nombre_madre ?? raw?.nombreMadre ?? "").trim(),
    LugarNacimiento: String(raw?.LugarNacimiento ?? raw?.lugar_nacimiento ?? raw?.lugarNacimiento ?? "").trim(),
    Comentarios: String(raw?.Comentarios ?? raw?.comentarios ?? "").trim(),
    Estado: String(Estado ?? "").trim(),
    FechaRegistro: String(FechaRegistro ?? "").trim(),
    FechaResolucion: String(FechaResolucion ?? "").trim(),
  };
}

function normalizarEstadoKey(estado: string): "pendiente" | "porllamar" | "resuelto" {
  const e = String(estado ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, ""); // quita espacios y underscores

  if (e === "pendiente") return "pendiente";
  if (e === "porllamar") return "porllamar";
  if (e === "resuelto") return "resuelto";
  return "pendiente";
}

export default function DashboardPage() {
  const [pendientes, setPendientes] = useState<Gestion[]>([]);
  const [porLlamar, setPorLlamar] = useState<Gestion[]>([]);
  const [resueltos, setResueltos] = useState<Gestion[]>([]);
  const [gestionSeleccionada, setGestionSeleccionada] = useState<Gestion | null>(null);

  const seleccion = gestionSeleccionada;

  const estadoSeleccion = useMemo(() => {
    return normalizarEstadoKey(seleccion?.Estado ?? "");
  }, [seleccion?.Estado]);

  const limpiar = (arr: any[]): Gestion[] => {
    return (arr ?? [])
      .map(normalizarGestion)
      .filter((g) => g.ID && g.ID.trim() !== "");
  };

  // Obtener gestiones desde la API
  const fetchGestiones = async () => {
    try {
      const res = await fetch("/api/get-gestiones", { cache: "no-store" });
      const data = await res.json();

      const pendientesList = limpiar(data?.pendientes || []);
      const porLlamarList = limpiar(data?.porLlamar || []);
      const resueltosList = limpiar(data?.resueltos || []);

      setPendientes(pendientesList);
      setPorLlamar(porLlamarList);
      setResueltos(resueltosList);

      //  Enviar lista a la pantalla (cerrando canal para no dejar fugas)
      const canal = new BroadcastChannel("pantalla-channel");
      canal.postMessage({
        tipo: "actualizar-lista",
        lista: porLlamarList.map((g) => g.ID),
      });
      canal.close();
    } catch (error) {
      console.error("❌ Error al obtener gestiones:", error);
    }
  };

  //  Actualización automática cada 3 segundos
  useEffect(() => {
    fetchGestiones();
    const interval = setInterval(fetchGestiones, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  Cambiar estado de una gestión
  const actualizarEstado = async (id: string, nuevoEstado: "porLlamar" | "resuelto") => {
    try {
      const ID = String(id ?? "").trim();
      if (!ID) {
        alert("⚠️ ID inválido");
        return;
      }

      console.log("[TurnixPro] Cambiando estado:", { ID, nuevoEstado });

      const res = await fetch("/api/update-gestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // mandamos ambas claves por compatibilidad (ID y id)
        body: JSON.stringify({ ID, id: ID, nuevoEstado }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        alert("⚠️ Error al actualizar estado: " + (data?.error || "Respuesta inválida"));
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🟦 Pendientes */}
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
              <p className="text-xs text-gray-400 italic">🕒 {formatearFechaHora(g.FechaRegistro) || "—"}</p>
            </div>
          ))}
        </div>

        {/* 🟨 Por Llamar */}
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
              <p className="text-xs text-gray-400 italic">🕒 {formatearFechaHora(g.FechaRegistro) || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🪟 Modal de detalles */}
      <Dialog.Root open={!!gestionSeleccionada} onOpenChange={() => setGestionSeleccionada(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[500px] max-h-[80vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 bg-neutral-900 border border-blue-500 shadow-[0_0_20px_#00f] p-6 rounded-lg text-white">
            <Dialog.Title className="text-lg font-bold text-blue-400 mb-4">
              📌 Detalles de la Gestión
            </Dialog.Title>

            {seleccion && (
              <div className="space-y-2">
                <p><b>ID:</b> {seleccion.ID}</p>
                <p><b>Nombres:</b> {seleccion.Nombres}</p>
                <p><b>Apellidos:</b> {seleccion.Apellidos}</p>
                <p><b>Género:</b> {seleccion.Genero}</p>
                <p><b>Fecha de Nacimiento:</b> {formatearSoloFecha(seleccion.FechaNacimiento)}</p>
                <p><b>Nombre del Padre:</b> {seleccion.NombrePadre}</p>
                <p><b>Nombre de la Madre:</b> {seleccion.NombreMadre}</p>
                <p><b>Lugar de Nacimiento:</b> {seleccion.LugarNacimiento}</p>

                <p className="font-bold">Comentarios:</p>
                <div className="max-h-32 overflow-y-auto p-2 bg-neutral-800 rounded border border-blue-500 text-sm">
                  {seleccion.Comentarios || "Sin comentarios"}
                </div>

                <p><b>Fecha Registro:</b> {formatearFechaHora(seleccion.FechaRegistro)}</p>
                <p><b>Fecha Resolución:</b> {formatearFechaHora(seleccion.FechaResolucion) || "—"}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <Dialog.Close asChild>
                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">
                  Cerrar
                </button>
              </Dialog.Close>

              {/* pendiente -> porLlamar */}
              {seleccion && estadoSeleccion === "pendiente" && (
                <button
                  onClick={() => actualizarEstado(seleccion.ID, "porLlamar")}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white"
                >
                  Pasar a Por Llamar
                </button>
              )}

              {/* porLlamar -> resuelto */}
              {seleccion && estadoSeleccion === "porllamar" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const canal = new BroadcastChannel("pantalla-channel");
                      canal.postMessage({ tipo: "llamar", id: seleccion.ID });
                      canal.postMessage({
                        tipo: "actualizar-lista",
                        lista: porLlamar.map((g) => g.ID),
                      });
                      canal.close();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                  >
                    Llamar
                  </button>

                  <button
                    onClick={() => actualizarEstado(seleccion.ID, "resuelto")}
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
