import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type GestionFrontend = {
  ID: string; // token
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

function mapGestion(g: any): GestionFrontend {
  return {
    ID: String(g.token ?? ""), // ✅ token
    Nombres: g.nombres ?? "",
    Apellidos: g.apellidos ?? "",
    Genero: g.genero ?? "",
    FechaNacimiento: g.fecha_nacimiento ?? "",
    NombrePadre: g.nombre_padre ?? "",
    NombreMadre: g.nombre_madre ?? "",
    LugarNacimiento: g.lugar_nacimiento ?? "",
    Comentarios: g.comentarios ?? "",
    Estado: g.estado ?? "",
    FechaRegistro: g.fecha_registro ?? "",
    FechaResolucion: g.fecha_resolucion ?? "",
  };
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("gestiones")
      .select("id, token, nombres, apellidos, genero, fecha_nacimiento, nombre_padre, nombre_madre, lugar_nacimiento, comentarios, estado, fecha_registro, fecha_resolucion")
      .eq("estado", "resuelto")
      .order("token", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: (data ?? []).map(mapGestion) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[TurnixPro] Error leyendo historial:", message);
    return NextResponse.json({ error: "Error leyendo historial" }, { status: 500 });
  }
}
