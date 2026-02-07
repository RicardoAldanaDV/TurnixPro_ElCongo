import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type GestionFrontend = {
  ID: string; // en la app será el TOKEN
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
    ID: String(g.token ?? ""), // ✅ ahora ID = token
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
    // ✅ trae token e id por si ocupas debug, pero para UI usaremos token
    const { data, error } = await supabaseAdmin
      .from("gestiones")
      .select("id, token, nombres, apellidos, genero, fecha_nacimiento, nombre_padre, nombre_madre, lugar_nacimiento, comentarios, estado, fecha_registro, fecha_resolucion")
      .order("token", { ascending: true });

    if (error) throw error;

    const pendientes: GestionFrontend[] = [];
    const porLlamar: GestionFrontend[] = [];
    const resueltos: GestionFrontend[] = [];

    for (const g of data ?? []) {
      const mapped = mapGestion(g);
      const estado = String(mapped.Estado ?? "").trim().toLowerCase().replace(/[\s_]+/g, "");

      if (estado === "pendiente") pendientes.push(mapped);
      else if (estado === "porllamar") porLlamar.push(mapped);
      else if (estado === "resuelto") resueltos.push(mapped);
    }

    return NextResponse.json({
      pendientes,
      porLlamar,
      resueltos,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[TurnixPro] ❌ Error get-gestiones:", message);

    return NextResponse.json(
      { error: "Error al obtener gestiones" },
      { status: 500 }
    );
  }
}
