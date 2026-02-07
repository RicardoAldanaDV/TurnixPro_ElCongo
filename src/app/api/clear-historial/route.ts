import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE() {
  try {
    console.log("[TurnixPro] 🧹 Iniciando limpieza de gestiones resueltas");

    const { data, error, count } = await supabaseAdmin
      .from("gestiones")
      .delete({ count: "exact" })
      .eq("estado", "resuelto");

    if (error) {
      console.error("[TurnixPro] ❌ Error limpiando historial:", error.message);
      return NextResponse.json(
        { error: "Error al limpiar gestiones resueltas" },
        { status: 500 }
      );
    }

    console.log(`[TurnixPro] ✅ ${count} gestiones resueltas eliminadas`);

    return NextResponse.json({
      ok: true,
      eliminadas: count ?? 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[TurnixPro] ❌ Excepción clear-historial:", message);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
