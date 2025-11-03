import { NextResponse } from "next/server";
import getGoogleSheetsClient from "@/lib/googleSheets";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// 🔧 Cargar entorno correctamente
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

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();

    console.log(`[TurnixPro ElCongo] 📖 Leyendo datos desde: ${SHEET_NAME}`);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`,
    });

    const rows = res.data.values || [];
    if (rows.length <= 1) {
      console.warn("[TurnixPro ElCongo] 📄 No hay registros en la hoja.");
      return NextResponse.json({ data: [] });
    }

    const headers = rows[0];
    const gestiones = rows.slice(1).map((row: string[]) => {
      const obj: Record<string, string> = {};
      headers.forEach((h: string, i: number) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });

    return NextResponse.json({ data: gestiones });
  } catch (err: any) {
    console.error("❌ Error leyendo gestiones:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
