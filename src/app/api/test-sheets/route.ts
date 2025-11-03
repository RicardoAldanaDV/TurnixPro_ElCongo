import { NextResponse } from "next/server";
import  getGoogleSheetsClient  from "@/lib/googleSheets";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Determinar la ruta base según el entorno (Electron o desarrollo)
const isElectron = !!(process && process.versions && process.versions.electron);
const basePath = isElectron ? (process as any).resourcesPath : process.cwd();

// Construir la ruta del .env.local
const envPath = path.join(basePath, "env/.env.local");


// 2️⃣ Si existe, cargarlo; si no, usar el .env local (modo desarrollo)
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// 3️⃣ (Opcional) Log para depurar si es necesario
console.log("[TurnixPro] Variables cargadas desde:", fs.existsSync(envPath) ? envPath : ".env.local")

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID as string;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1:K10", // 👈 ajusta si cambias nombre de la hoja
    });

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
