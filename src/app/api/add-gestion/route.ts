import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function normalizarEstado(estado: any): string {
  // Acepta "porLlamar", "Por Llamar", "porllamar", etc.
  const e = String(estado ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "") // quita espacios
    .replace(/_/g, "");  // quita underscores

  if (e === "porllamar") return "porllamar";
  if (e === "resuelto") return "resuelto";
  return "pendiente";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const estado = normalizarEstado(body.Estado);

    const payload = {
      p_nombres: String(body.Nombres ?? "").trim(),
      p_apellidos: String(body.Apellidos ?? "").trim(),
      p_genero: String(body.Genero ?? "").trim(),
      p_fecha_nacimiento: body.FechaNacimiento || null,
      p_nombre_padre: String(body.NombrePadre ?? "").trim(),
      p_nombre_madre: String(body.NombreMadre ?? "").trim(),
      p_lugar_nacimiento: String(body.LugarNacimiento ?? "").trim(),
      p_comentarios: String(body.Comentarios ?? "").trim(),
      p_estado: estado,
    };

    const { data, error } = await supabaseAdmin.rpc(
      "crear_gestion_con_token",
      payload
    );

    if (error) {
      console.error("❌ Error RPC crear_gestion_con_token:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // RPC normalmente devuelve array con 1 elemento
    const row = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      ok: true,
      id: row?.id,       // ID real de BD (autoincrement, puede subir infinito)
      token: row?.token, // ID reutilizable para tu app/UI
    });
  } catch (err: any) {
    console.error("🔥 Error interno add-gestion:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
