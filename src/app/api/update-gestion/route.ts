import { NextResponse } from "next/server";
import getGoogleSheetsClient from "@/lib/googleSheets";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Detectar entorno (Electron o desarrollo)
const isElectron = !!(process && process.versions && process.versions.electron);
const basePath = isElectron ? (process as any).resourcesPath : process.cwd();
const envPath = path.join(basePath, "env/.env.local");

// Cargar variables de entorno
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID as string;
const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || body.ID;
    const nuevoEstado = body.nuevoEstado || body.NuevoEstado;

    if (!id || !nuevoEstado) {
      console.warn("[TurnixPro ElCongo] ❌ Falta id o nuevoEstado:", body);
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();

    console.log(`[TurnixPro ElCongo] 🔎 Buscando ID ${id} en hoja: ${SHEET_NAME}`);

    // Leer la columna A (IDs)
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = readRes.data.values || [];
    let rowIndex = -1;

    rows.forEach((row, i) => {
      if (row[0] === id) rowIndex = i;
    });

    if (rowIndex === -1) {
      console.warn(`[TurnixPro ElCongo] ⚠️ ID ${id} no encontrado en ${SHEET_NAME}`);
      return NextResponse.json({ error: "ID no encontrado" }, { status: 404 });
    }

    const updates: any[] = [];

    // 🔹 Actualizar Estado (columna J)
    updates.push({
      range: `${SHEET_NAME}!J${rowIndex + 1}`,
      values: [[nuevoEstado]],
    });

    // 🔹 Si es "Resuelto", agregar fecha en columna L
    if (nuevoEstado === "Resuelto") {
      const fecha = new Date().toLocaleString("es-SV", {
        timeZone: "America/El_Salvador",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      updates.push({
        range: `${SHEET_NAME}!L${rowIndex + 1}`,
        values: [[fecha]],
      });
    }

    const result = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updates,
      },
    });

    const logPath = path.join(basePath, "update_log.txt");
    fs.appendFileSync(
      logPath,
      `[${new Date().toISOString()}] ID ${id} → Estado cambiado a "${nuevoEstado}"\n`
    );

    console.log(`[TurnixPro ElCongo] ✅ ${id} → Estado actualizado a "${nuevoEstado}"`);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("❌ Error actualizando gestión:", error);
    const logPath = path.join(basePath, "error_log.txt");
    fs.appendFileSync(
      logPath,
      `[${new Date().toISOString()}] ${error.stack || error.message}\n`
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
