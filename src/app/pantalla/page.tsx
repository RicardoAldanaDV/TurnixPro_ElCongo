"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Ajustes = {
  tituloSize: number;
  esperaScale: number;
  numeroSize: number;
  velocidadFrase: number;
  velocidadNumero: number;
};

type VozConfig = {
  nombre: string;
  pitch: number;
  rate: number;
};

const STORAGE_KEY = "turnix_ajustes_pantalla";
const VOZ_KEY = "turnix_config_voz";

export default function PantallaPage() {
  const canalRef = useRef<BroadcastChannel | null>(null);
  const [pantallaAbierta, setPantallaAbierta] = useState<Window | null>(null);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  // ajustes de pantalla
  const [ajustes, setAjustes] = useState<Ajustes>({
    tituloSize: 2.4,
    esperaScale: 1,
    numeroSize: 10,
    velocidadFrase: 1,
    velocidadNumero: 1,
  });

  // configuración de voz
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [vozConfig, setVozConfig] = useState<VozConfig>({
    nombre: "",
    pitch: 1,
    rate: 1,
  });

  // cargar ajustes guardados
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAjustes((a) => ({ ...a, ...JSON.parse(raw) }));

      const vozRaw = localStorage.getItem(VOZ_KEY);
      if (vozRaw) setVozConfig(JSON.parse(vozRaw));
    } catch {}
  }, []);

  // cargar voces disponibles
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (!vozConfig.nombre && v.length > 0) {
        setVozConfig((prev) => ({ ...prev, nombre: v[0].name }));
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // canal de comunicación con pantalla-ventana
  useEffect(() => {
    const canal = new BroadcastChannel("pantalla-channel");
    canalRef.current = canal;
    canal.postMessage({ tipo: "ajustes", ajustes, vozConfig });
    return () => canal.close();
  }, []);

  useEffect(() => {
    canalRef.current?.postMessage({ tipo: "ajustes", ajustes, vozConfig });
  }, [ajustes, vozConfig]);

  const abrirPantalla = () => {
    if (!pantallaAbierta || pantallaAbierta.closed) {
      const win = window.open("/pantalla-ventana", "Pantalla", "width=1000,height=700");
      setPantallaAbierta(win);
      setTimeout(() => canalRef.current?.postMessage({ tipo: "ajustes", ajustes, vozConfig }), 300);
    } else {
      pantallaAbierta.focus();
    }
  };

  const cerrarPantalla = () => {
    canalRef.current?.postMessage({ tipo: "cerrar" });
    setPantallaAbierta(null);
  };

  const maximizarPantalla = async () => {
    if (pantallaAbierta && !pantallaAbierta.closed) {
      pantallaAbierta.focus();
      try {
        await pantallaAbierta.document.documentElement.requestFullscreen();
      } catch {}
    }
  };

  const guardarAjustes = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ajustes));
    canalRef.current?.postMessage({ tipo: "ajustes", ajustes, vozConfig });
    alert("✅ Ajustes guardados");
  };

  const reproducirPrueba = () => {
    const utter = new SpeechSynthesisUtterance("Este es un audio de prueba");
    utter.pitch = vozConfig.pitch;
    utter.rate = vozConfig.rate;
    const v = voices.find((vv) => vv.name === vozConfig.nombre);
    if (v) utter.voice = v;
    window.speechSynthesis.speak(utter);
  };

  const guardarVoz = () => {
    localStorage.setItem(VOZ_KEY, JSON.stringify(vozConfig));
    canalRef.current?.postMessage({ tipo: "ajustes", ajustes, vozConfig });
    alert("✅ Configuración de voz guardada");
  };

  return (
    <div className="min-h-screen p-6 bg-neutral-900 text-white relative">
      <h1 className="text-2xl font-bold mb-6 text-center">Pantalla de Llamadas</h1>

      {/* botones principales */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button onClick={abrirPantalla} className="bg-green-600 hover:bg-green-700">
          Abrir Pantalla
        </Button>
        <Button onClick={maximizarPantalla} className="bg-blue-600 hover:bg-blue-700">
          Maximizar
        </Button>
        <Button onClick={cerrarPantalla} className="bg-red-600 hover:bg-red-700">
          Cerrar Pantalla
        </Button>
        <Button onClick={guardarAjustes} className="bg-purple-600 hover:bg-purple-700">
          Guardar Ajustes
        </Button>
        <Button onClick={() => setShowVoiceMenu(true)} className="bg-yellow-600 hover:bg-yellow-700">
          🎙 Tipo de voz
        </Button>
      </div>

      {/* sliders */}
      <div className="mx-auto max-w-3xl rounded-lg border border-blue-500 shadow-[0_0_15px_#00f] bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold text-blue-400 mb-6 text-center">⚙️ Ajustes de Pantalla</h2>

        <div className="space-y-8">
          {/* tamaño título */}
          <div>
            <label className="block mb-2 text-sm text-blue-300">Tamaño del título</label>
            <input
              type="range"
              min={1}
              max={10}
              step={0.1}
              value={ajustes.tituloSize}
              onChange={(e) => setAjustes((a) => ({ ...a, tituloSize: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
            <div className="text-xs mt-1 text-blue-300">{ajustes.tituloSize} rem</div>
          </div>

          {/* lista espera */}
          <div>
            <label className="block mb-2 text-sm text-blue-300">Escala lista en espera</label>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.05}
              value={ajustes.esperaScale}
              onChange={(e) => setAjustes((a) => ({ ...a, esperaScale: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
            <div className="text-xs mt-1 text-blue-300">{ajustes.esperaScale.toFixed(2)}x</div>
          </div>

          {/* tamaño número */}
          <div>
            <label className="block mb-2 text-sm text-blue-300">Tamaño número</label>
            <input
              type="range"
              min={6}
              max={22}
              step={0.1}
              value={ajustes.numeroSize}
              onChange={(e) => setAjustes((a) => ({ ...a, numeroSize: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
            <div className="text-xs mt-1 text-blue-300">{ajustes.numeroSize} rem</div>
          </div>

          {/* velocidad frase */}
          <div>
            <label className="block mb-2 text-sm text-blue-300">Velocidad frase (segundos entre palabras)</label>
            <input
              type="range"
              min={0.2}
              max={2}
              step={0.1}
              value={ajustes.velocidadFrase}
              onChange={(e) => setAjustes((a) => ({ ...a, velocidadFrase: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
            <div className="text-xs mt-1 text-blue-300">{ajustes.velocidadFrase}s</div>
          </div>

          {/* velocidad número */}
          <div>
            <label className="block mb-2 text-sm text-blue-300">Velocidad número (segundos entre dígitos)</label>
            <input
              type="range"
              min={0.2}
              max={2}
              step={0.1}
              value={ajustes.velocidadNumero}
              onChange={(e) => setAjustes((a) => ({ ...a, velocidadNumero: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
            <div className="text-xs mt-1 text-blue-300">{ajustes.velocidadNumero}s</div>
          </div>
        </div>
      </div>

      {/* ventana de configuración de voz */}
      {showVoiceMenu && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 border border-blue-500 shadow-[0_0_20px_#00f] rounded-xl p-6 w-[400px] text-white z-50">
          <h2 className="text-lg font-bold text-blue-400 mb-4 text-center">Configuración de Voz</h2>

          <div className="mb-4">
            <label className="block mb-2 text-sm text-blue-300">Tipo de voz:</label>
            <select
              value={vozConfig.nombre}
              onChange={(e) => setVozConfig((v) => ({ ...v, nombre: e.target.value }))}
              className="w-full bg-neutral-800 border border-blue-500 rounded-md p-2 text-white"
            >
              {voices.map((v, i) => (
                <option key={i} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm text-blue-300">Tono: {vozConfig.pitch.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={vozConfig.pitch}
              onChange={(e) => setVozConfig((v) => ({ ...v, pitch: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-blue-300">Velocidad: {vozConfig.rate.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={vozConfig.rate}
              onChange={(e) => setVozConfig((v) => ({ ...v, rate: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="flex justify-between mt-5">
            <Button onClick={reproducirPrueba} className="bg-green-600 hover:bg-green-700">
              ▶ Reproducir
            </Button>
            <Button onClick={guardarVoz} className="bg-purple-600 hover:bg-purple-700">
              💾 Guardar
            </Button>
            <Button onClick={() => setShowVoiceMenu(false)} className="bg-red-600 hover:bg-red-700">
              ✖ Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
