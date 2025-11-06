import { NextResponse } from "next/server";
import getGoogleSheetsClient from "@/lib/googleSheets";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const isElectron = !!(process && process.versions && process.versions.electron);
const basePath = isElectron ? (process as any).resourcesPath : process.cwd();
const envPath = path.join(basePath, "env/.env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID as string;
const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

// Ordena por letra y número (A001..A999, B001..)
function ordenarPorId(a: string, b: string) {
  const la = a?.charCodeAt(0) ?? 0;
  const lb = b?.charCodeAt(0) ?? 0;
  if (la !== lb) return la - lb;
  const na = parseInt(a?.slice(1) ?? "0") || 0;
  const nb = parseInt(b?.slice(1) ?? "0") || 0;
  return na - nb;
}

export async function POST() {
  try {
    const sheets = await getGoogleSheetsClient();

    // Leemos todas las columnas usadas (A:L)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`,
    });

    const rows = res.data.values || [];
    if (rows.length <= 1) {
      // Solo encabezado o vacío
      return NextResponse.json({ success: true, message: "Nada que limpiar" });
    }

    const headers = rows[0];

    // Filtrar:
    // 1) Dejar encabezado
    // 2) Mantener solo filas cuyo estado != 'resuelto'
    // 3) Quitar filas totalmente vacías
    const cuerpo = rows.slice(1).filter((row) => {
      const estado = (row[9]?.toString() ?? "").trim().toLowerCase(); // Columna J (índice 9)
      const id = (row[0]?.toString() ?? "").trim();
      const filaVacia = row.every(
        (c) => (c === undefined || c === null || `${c}`.trim() === "")
      );
      if (filaVacia) return false;
      // Mantener todo lo que NO sea resuelto
      return estado !== "resuelto";
    });

    // (Opcional) Mantener orden por ID para que la hoja quede prolija
    cuerpo.sort((a, b) => ordenarPorId(`${a[0] ?? ""}`, `${b[0] ?? ""}`));

    // Reescribimos de forma compacta para que no queden rangos “fantasma”
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`,
    });

    const nuevas = [headers, ...cuerpo];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: nuevas },
    });

    // Para verificación: cuál es el mayor ID que quedó
    const idsRestantes = cuerpo
      .map((r) => (r[0]?.toString() ?? "").trim())
      .filter(Boolean)
      .sort(ordenarPorId);
    const ultimoIdRestante = idsRestantes[idsRestantes.length - 1] || "—";

    return NextResponse.json({
      success: true,
      removed: rows.length - nuevas.length, // aprox. filas eliminadas
      lastRemainingId: ultimoIdRestante,    // útil para chequear correlatividad: siguiente será este+1
    });
  } catch (err: any) {
    console.error("Error limpiando historial:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
