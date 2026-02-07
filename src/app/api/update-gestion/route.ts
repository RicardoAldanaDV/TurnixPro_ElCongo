import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normalizarEstado(estado: string): "pendiente" | "porllamar" | "resuelto" {
  const e = String(estado ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, ""); // quita espacios y underscores

  if (e === "pendiente") return "pendiente";
  if (e === "porllamar") return "porllamar";
  if (e === "resuelto") return "resuelto";
  return "pendiente";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ ahora el identificador real de la app será token,
    // pero aceptamos varios nombres para compatibilidad:
    const rawToken =
      body.token ?? body.Token ?? body.ID ?? body.id ?? body.ID_;

    const rawEstado = body.nuevoEstado ?? body.estado ?? body.Estado;

    if (rawToken === undefined || rawEstado === undefined) {
      console.warn("[TurnixPro] ❌ Faltan parámetros:", body);
      return NextResponse.json(
        { success: false, error: "Faltan parámetros (token/ID o nuevoEstado)" },
        { status: 400 }
      );
    }

    const token = Number(rawToken);
    if (!Number.isFinite(token) || token <= 0) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 400 }
      );
    }

    const estado = normalizarEstado(String(rawEstado));

    const updateData: any = { estado };

    if (estado === "resuelto") {
      updateData.fecha_resolucion = new Date().toISOString();
    } else {
      updateData.fecha_resolucion = null;
    }

    const { error } = await supabaseAdmin
      .from("gestiones")
      .update(updateData)
      .eq("token", token);

    if (error) {
      console.error("[TurnixPro] ❌ Error actualizando estado:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[TurnixPro] ❌ Excepción update-gestion:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
