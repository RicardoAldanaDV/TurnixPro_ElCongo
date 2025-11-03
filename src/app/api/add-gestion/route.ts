import { NextResponse } from "next/server";
import getGoogleSheetsClient from "@/lib/googleSheets";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// 🔧 Cargar .env en todos los entornos (Electron o desarrollo)
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ID = body.ID || body.id;
    const {
      Nombres,
      Apellidos,
      Genero,
      FechaNacimiento,
      NombrePadre,
      NombreMadre,
      LugarNacimiento,
      Comentarios,
    } = body;

    if (!ID || !Nombres) {
      console.warn("[TurnixPro ElCongo] ⚠️ Faltan datos:", body);
      return NextResponse.json({ success: false, error: "Faltan datos" }, { status: 400 });
    }

    // 📆 Fecha local (El Salvador)
    const ahora = new Date();
    const fechaRegistro = ahora.toLocaleString("es-SV", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/El_Salvador",
    });

    const fila = [
      ID || "",
      Nombres || "",
      Apellidos || "",
      Genero || "",
      FechaNacimiento || "",
      NombrePadre || "",
      NombreMadre || "",
      LugarNacimiento || "",
      Comentarios || "",
      "Pendiente",
      fechaRegistro,
      "",
    ];

    const sheets = await getGoogleSheetsClient();

    console.log(`[TurnixPro ElCongo] 📦 Insertando en hoja: ${SHEET_NAME}`);

    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:L1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [fila] },
    });

    const actualizadas = appendRes.data.updates?.updatedCells || 0;
    if (actualizadas === 0) {
      console.warn("[TurnixPro ElCongo] ⚠️ Google Sheets no insertó ninguna celda.");
    }

    return NextResponse.json({
      success: true,
      message: "Gestión guardada correctamente",
      id: ID,
      fechaRegistro,
      detalles: appendRes.data,
    });
  } catch (err: any) {
    console.error("❌ Error general al guardar gestión:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
