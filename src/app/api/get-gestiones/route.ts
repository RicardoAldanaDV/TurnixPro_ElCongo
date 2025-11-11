import { NextResponse } from "next/server";
import getGoogleSheetsClient from "@/lib/googleSheets";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const isElectron = !!(process && (process as any).versions?.electron);
const basePath = isElectron ? (process as any).resourcesPath : process.cwd();
const envPath = path.join(basePath, "env/.env.local");
if (fs.existsSync(envPath)) dotenv.config({ path: envPath }); else dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID as string;
const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    const range = `${SHEET_NAME}!A:L`;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range });

    const rows = res.data.values ?? [];
    if (rows.length <= 1) {
      return NextResponse.json({ pendientes: [], porLlamar: [], resueltos: [] });
    }

    const header = rows[0].map((h: any) => String(h).trim());
    const data = rows.slice(1).map(r => {
      const obj: any = {};
      header.forEach((h: string, i: number) => (obj[h] = (r[i] ?? "").toString().trim()));
      obj.Estado =
        obj.Estado === "Por Llamar"
          ? "Por Llamar"
          : obj.Estado === "Resuelto"
          ? "Resuelto"
          : "Pendiente";
      return obj;
    });

    const pendientes = data.filter((d: any) => d.Estado === "Pendiente");
    const porLlamar = data.filter((d: any) => d.Estado === "Por Llamar");
    const resueltos = data.filter((d: any) => d.Estado === "Resuelto");

    return NextResponse.json({ pendientes, porLlamar, resueltos });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
