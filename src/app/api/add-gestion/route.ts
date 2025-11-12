import { NextResponse } from "next/server";
import getGoogleSheetsClient from "@/lib/googleSheets";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { getNextIdRobusto, idExiste } from "@/lib/nextId";

const isElectron = !!(process && (process as any).versions?.electron);
const basePath = isElectron ? (process as any).resourcesPath : process.cwd();
const envPath = path.join(basePath, "env/.env.local");
if (fs.existsSync(envPath)) dotenv.config({ path: envPath }); else dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID as string;
const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🕓 Fecha local legible
    const now = new Date();
    const nowFormatted = now.toLocaleString("es-SV", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/El_Salvador",
    });

    // Estado normalizado
    const Estado =
      body.Estado === "Por Llamar"
        ? "Por Llamar"
        : body.Estado === "Resuelto"
        ? "Resuelto"
        : "Pendiente";

    // Datos base
    const fila = {
      Nombres: String(body.Nombres ?? "").trim(),
      Apellidos: String(body.Apellidos ?? "").trim(),
      Genero: String(body.Genero ?? "").trim(),
      FechaNacimiento: String(body.FechaNacimiento ?? "").trim(),
      NombrePadre: String(body.NombrePadre ?? "").trim(),
      NombreMadre: String(body.NombreMadre ?? "").trim(),
      LugarNacimiento: String(body.LugarNacimiento ?? "").trim(),
      Comentarios: String(body.Comentarios ?? "").trim(),
      Estado,
      FechaRegistro: nowFormatted,
      FechaResolucion: Estado === "Resuelto" ? nowFormatted : "",
    };

    const sheets = await getGoogleSheetsClient();

    let intento = 0;
    let asignado = "";

    // 🔁 Hasta 3 intentos para evitar colisiones
    while (intento < 3) {
      intento++;
      const nextId = await getNextIdRobusto(sheets, SPREADSHEET_ID, SHEET_NAME);

      if (await idExiste(sheets, SPREADSHEET_ID, SHEET_NAME, nextId)) {
        await new Promise(r => setTimeout(r, 150));
        continue;
      }

      const rowValues = [
        nextId,
        fila.Nombres,
        fila.Apellidos,
        fila.Genero,
        fila.FechaNacimiento,
        fila.NombrePadre,
        fila.NombreMadre,
        fila.LugarNacimiento,
        fila.Comentarios,
        fila.Estado,
        fila.FechaRegistro,
        fila.FechaResolucion,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:L`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [rowValues] },
      });

      // 🔍 Verifica si realmente se escribió
      if (await idExiste(sheets, SPREADSHEET_ID, SHEET_NAME, nextId)) {
        asignado = nextId;
        break;
      }

      await new Promise(r => setTimeout(r, 200));
    }

    if (!asignado) {
      return NextResponse.json(
        { ok: false, error: "No fue posible asignar un ID único tras 3 intentos." },
        { status: 409 }
      );
    }

    // ✅ Devuelve el ID correcto al frontend
    return NextResponse.json({ ok: true, id: asignado });
  } catch (err: any) {
    console.error("🔥 [TurnixPro] Error interno al guardar gestión:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
