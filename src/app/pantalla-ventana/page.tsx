"use client";

import { useEffect, useState } from "react";

export default function PantallaVentanaPage() {
  const [gestionActual, setGestionActual] = useState<string | null>(null);
  const [enEspera, setEnEspera] = useState<string[]>([]);

  // 🔹 Ajustes dinámicos
  const [ajustes, setAjustes] = useState({
    tituloSize: 2.5,
    esperaScale: 1,
    numeroSize: 10,
    velocidadFrase: 1,
    velocidadNumero: 1,
  });

  useEffect(() => {
    const canal = new BroadcastChannel("pantalla-channel");

    canal.onmessage = async (event) => {
      const data = event.data;

      if (data.tipo === "llamar") {
        setGestionActual(data.id);
        reproducirFrase(data.id);
      }

      if (data.tipo === "actualizar-lista") {
        setEnEspera(data.lista || []);
      }

      if (data.tipo === "ajustes") {
        setAjustes(data.ajustes);
      }

      if (data.tipo === "cerrar") {
        window.close();
      }
    };

    return () => canal.close();
  }, []);

  // 🔊 Reproducir frase con retardos
const reproducirFrase = async (id: string) => {
  const synth = window.speechSynthesis;
  const vozRaw = localStorage.getItem("turnix_config_voz");
  const vozConfig = vozRaw ? JSON.parse(vozRaw) : { nombre: "", pitch: 1, rate: 1 };
  const voice = synth.getVoices().find((v) => v.name === vozConfig.nombre) || synth.getVoices()[0];

  const decir = (texto: string, delay: number) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        const utter = new SpeechSynthesisUtterance(texto);
        utter.voice = voice;
        utter.pitch = vozConfig.pitch || 1;
        utter.rate = vozConfig.rate || 1;
        utter.lang = utter.voice?.lang || "es-ES";
        synth.speak(utter);
        resolve();
      }, delay);
    });

  await decir("Siguiente", ajustes.velocidadFrase * 1000);
  await decir("Gestión", ajustes.velocidadFrase * 1000);
  await decir("Número", ajustes.velocidadFrase * 1000);

  const chars = id.split("");
  for (let i = 0; i < chars.length; i++) {
    await decir(chars[i], ajustes.velocidadNumero * 1000);
  }
};
  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col">
      {/* Título */}
      <div className="p-6 text-center border-b border-gray-700">
        <h1
          className="font-bold text-blue-400 drop-shadow-[0_0_15px_#00f]"
          style={{ fontSize: `${ajustes.tituloSize}rem` }}
        >
          Siguiente Gestión
        </h1>
      </div>

      {/* Número actual */}
      <div className="flex-1 flex items-center justify-center">
        <h2
          className="font-extrabold text-white drop-shadow-[0_0_25px_#00f]"
          style={{ fontSize: `${ajustes.numeroSize}rem` }}
        >
          {gestionActual || "--"}
        </h2>
      </div>

      {/* Lista de En espera */}
      <div
        className="absolute left-6 top-32 origin-top-left"
        style={{ transform: `scale(${ajustes.esperaScale})` }}
      >
        <div className="bg-neutral-900/80 border border-blue-500 shadow-[0_0_12px_#00f] rounded-lg p-4 w-48">
          <h3 className="text-lg font-bold text-blue-300 mb-2">En espera</h3>
          {enEspera.length === 0 && (
            <p className="text-gray-400 italic">Sin gestiones</p>
          )}
          <ul className="space-y-1">
            {enEspera.map((id) => (
              <li
                key={id}
                className={`p-2 text-center font-semibold border rounded shadow-[0_0_6px_#00f] ${
                  id === gestionActual
                    ? "bg-blue-600 text-white border-blue-400"
                    : "text-white border-blue-500"
                }`}
              >
                {id}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
