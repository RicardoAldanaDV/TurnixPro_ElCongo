import { NextResponse } from "next/server";
import getGoogleSheetsClient from "@/lib/googleSheets";
import * as XLSX from "xlsx";
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

export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`,
    });

    const rows = res.data.values || [];
    if (rows.length <= 1) {
      return NextResponse.json({ error: "No hay gestiones para exportar" }, { status: 400 });
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gestiones");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="backup_turnix_${Date.now()}.xlsx"`,
      },
    });
  } catch (err: any) {
    console.error("Error creando backup:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
