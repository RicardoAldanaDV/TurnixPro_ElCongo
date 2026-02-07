import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function toCSV(data: any[]) {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);

  const rows = data.map(row =>
    headers.map(h => {
      const value = row[h];
      if (value === null || value === undefined) return "";
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("gestiones")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const csv = toCSV(data ?? []);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=backup_gestiones.csv",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[TurnixPro] Error backup-excel:", message);

    return NextResponse.json(
      { error: "Error generando backup" },
      { status: 500 }
    );
  }
}
