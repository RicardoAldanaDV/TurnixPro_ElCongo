import { supabaseAdmin } from "./supabaseAdmin";

export async function getAllGestiones() {
  const { data, error } = await supabaseAdmin
    .from("gestiones")
    .select("*");

  if (error) throw error;
  return data;

  
}

export type Gestion = {
  id: number;
  estado: "pendiente" | "porLlamar" | "resuelto";
  // agregá aquí las demás columnas que tenga la tabla
  nombres?: string;
  apellidos?: string;
};
