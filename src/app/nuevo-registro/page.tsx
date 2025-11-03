"use client";

import { useState } from "react";

export default function NuevoRegistroPage() {
  const [formData, setFormData] = useState({
    Nombres: "",
    Apellidos: "",
    Genero: "",
    FechaNacimiento: "",
    NombrePadre: "",
    NombreMadre: "",
    LugarNacimiento: "",
    Comentarios: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Función para generar el siguiente ID en secuencia
  const generarSiguienteID = async (): Promise<string> => {
    try {
      const res = await fetch("/api/get-gestiones");
      const data = await res.json();
      const todas = data.data || [];

      if (todas.length === 0) return "A001";

      // Extraer todos los IDs válidos (ej. A001, A002, ...)
      const ids = todas
        .map((g: any) => g.ID)
        .filter((id: string) => /^[A-Z]\d{3}$/.test(id));

      if (ids.length === 0) return "A001";

      // Buscar el último ID usado (según letra y número)
      ids.sort((a: string, b: string) => {
        const letraA = a[0].charCodeAt(0);
        const letraB = b[0].charCodeAt(0);
        const numA = parseInt(a.slice(1));
        const numB = parseInt(b.slice(1));
        return letraA === letraB ? numA - numB : letraA - letraB;
      });

      const ultimoID = ids[ids.length - 1];
      let letra = ultimoID[0];
      let numero = parseInt(ultimoID.slice(1)) + 1;

      // Si se pasa de 999, cambiar de letra
      if (numero > 999) {
        numero = 1;
        letra = String.fromCharCode(letra.charCodeAt(0) + 1);
        if (letra > "Z") letra = "A";
      }

      const nuevoID = `${letra}${numero.toString().padStart(3, "0")}`;

      // Validar que no exista en la hoja (por si hay huecos)
      const ocupado = ids.includes(nuevoID);
      if (ocupado) {
        // Buscar el siguiente disponible
        let i = numero + 1;
        let siguiente = nuevoID;
        while (ids.includes(siguiente)) {
          i++;
          if (i > 999) {
            i = 1;
            letra = String.fromCharCode(letra.charCodeAt(0) + 1);
            if (letra > "Z") letra = "A";
          }
          siguiente = `${letra}${i.toString().padStart(3, "0")}`;
        }
        return siguiente;
      }

      return nuevoID;
    } catch (error) {
      console.error("Error generando ID secuencial:", error);
      return "A001";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const nuevoID = await generarSiguienteID();
      console.log("[TurnixPro] Nuevo ID generado:", nuevoID);

      const res = await fetch("/api/add-gestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ID: nuevoID,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar el registro");

      const data = await res.json();
      console.log("[TurnixPro] Gestión guardada:", data);

      setMessage(`✅ Registro guardado con éxito (ID: ${nuevoID})`);
      setFormData({
        Nombres: "",
        Apellidos: "",
        Genero: "",
        FechaNacimiento: "",
        NombrePadre: "",
        NombreMadre: "",
        LugarNacimiento: "",
        Comentarios: "",
      });
    } catch (error: any) {
      console.error(error);
      setMessage("❌ Error al guardar el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-neutral-900 text-white">
      <h1 className="text-2xl font-bold mb-6">Nuevo Registro de Gestión</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-800 p-6 rounded-lg shadow-lg border border-neutral-700"
      >
        {/* Campos del formulario */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nombres</label>
          <input
            type="text"
            name="Nombres"
            value={formData.Nombres}
            onChange={handleChange}
            className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Apellidos</label>
          <input
            type="text"
            name="Apellidos"
            value={formData.Apellidos}
            onChange={handleChange}
            className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Género</label>
          <select
            name="Genero"
            value={formData.Genero}
            onChange={handleChange}
            className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            name="FechaNacimiento"
            value={formData.FechaNacimiento}
            onChange={handleChange}
            className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Nombre del padre
          </label>
          <input
            type="text"
            name="NombrePadre"
            value={formData.NombrePadre}
            onChange={handleChange}
            className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Nombre de la madre
          </label>
          <input
            type="text"
            name="NombreMadre"
            value={formData.NombreMadre}
            onChange={handleChange}
            className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-300 mb-1">
            Lugar de nacimiento
          </label>
          <input
            type="text"
            name="LugarNacimiento"
            value={formData.LugarNacimiento}
            onChange={handleChange}
            className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Comentarios</label>
          <textarea
            name="Comentarios"
            value={formData.Comentarios}
            onChange={handleChange}
            className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-semibold shadow-md"
        >
          {loading ? "Guardando..." : "Guardar Registro"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm ${
            message.startsWith("✅") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
