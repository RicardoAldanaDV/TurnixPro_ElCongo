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
      // 🚀 Enviar datos al backend; el ID se genera en /api/add-gestion
      const res = await fetch("/api/add-gestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al guardar el registro");

      const data = await res.json();
      console.log("[TurnixPro] Gestión guardada:", data);

      // ✅ Mensaje correcto con el ID real asignado
      if (data?.id) {
        setMessage(`✅ Registro guardado con éxito (ID: ${data.id})`);
      } else {
        setMessage("✅ Registro guardado con éxito");
      }

      // 🧹 Limpiar formulario
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
