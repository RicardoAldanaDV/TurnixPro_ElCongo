"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

interface Gestion {
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
  HoraCreacion?: string; // ✅ nuevo campo
}

interface GestionModalProps {
  gestion: Gestion;
  onMover?: () => void;     // Pendiente -> Por Llamar
  onLlamar?: () => void;    // Llamar en pantalla
  onResuelto?: () => void;  // Por Llamar -> Resuelto
}

export default function GestionModal({ gestion, onMover, onLlamar, onResuelto }: GestionModalProps) {
  const [editando, setEditando] = useState(false);

  return (
    <Dialog.Root>
      {/* Tarjeta clickable */}
     <Dialog.Trigger asChild>
  <div
    className="p-3 mb-2 rounded-md border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] 
               cursor-pointer transition-all duration-300 
               hover:scale-105 hover:shadow-[0_0_20px_#22d3ee]"
  >
    <p className="font-bold text-white">{gestion.ID}</p>
    <p className="text-sm text-gray-400">
      {gestion.Nombres} {gestion.Apellidos}
    </p>
    <p className="text-xs text-gray-500 italic">
      🕒 {gestion.HoraCreacion || "—"}
    </p>
  </div>
</Dialog.Trigger>

      {/* Modal */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content
  className="fixed top-1/2 left-1/2 w-[500px] max-h-[90vh] overflow-y-auto 
             -translate-x-1/2 -translate-y-1/2 
             bg-neutral-900 text-white p-6 rounded-lg 
             border-2 border-cyan-400 shadow-[0_0_20px_#22d3ee] 
             rounded-xl transition-all duration-300 
             animate-fade-in"
>

          <Dialog.Title className="text-lg font-bold mb-4">
            Gestión {gestion.ID}
          </Dialog.Title>

          {/* Datos */}
          <div className="space-y-2 text-sm">
            <p><span className="font-bold">Nombres:</span> {gestion.Nombres}</p>
            <p><span className="font-bold">Apellidos:</span> {gestion.Apellidos}</p>
            <p><span className="font-bold">Género:</span> {gestion.Genero}</p>
            <p><span className="font-bold">Fecha de Nacimiento:</span> {gestion.FechaNacimiento}</p>
            <p><span className="font-bold">Padre:</span> {gestion.NombrePadre}</p>
            <p><span className="font-bold">Madre:</span> {gestion.NombreMadre}</p>
            <p><span className="font-bold">Lugar de Nacimiento:</span> {gestion.LugarNacimiento}</p>
            {gestion.HoraCreacion && (
              <p><span className="font-bold">Hora de creación:</span> {gestion.HoraCreacion}</p>
            )}
            {gestion.Comentarios && (
              <p><span className="font-bold">Comentarios:</span> {gestion.Comentarios}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700">
                Cerrar
              </button>
            </Dialog.Close>

            {gestion.Estado === "Pendiente" && (
              <>
                <button
                  onClick={() => setEditando(!editando)}
                  className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700"
                >
                  {editando ? "Guardando edición..." : "Editar"}
                </button>
                {onMover && (
                  <Dialog.Close asChild>
                    <button
                      onClick={onMover}
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                    >
                      Mover a Por Llamar
                    </button>
                  </Dialog.Close>
                )}
              </>
            )}

            {gestion.Estado === "Por Llamar" && (
              <>
                {onLlamar && (
                  <button
                    onClick={onLlamar}
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-700"
                  >
                    Llamar
                  </button>
                )}
                {onResuelto && (
                  <Dialog.Close asChild>
                    <button
                      onClick={onResuelto}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                    >
                      Resuelto
                    </button>
                  </Dialog.Close>
                )}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
