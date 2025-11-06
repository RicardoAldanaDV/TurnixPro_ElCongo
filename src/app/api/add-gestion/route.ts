import { NextResponse } from "next/server";
import getGoogleSheetsClient from "@/lib/googleSheets";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

//  Cargar variables de entorno (.env)
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

//  Genera el siguiente ID con soporte de prefijo A→B→...→Z
function generarNuevoId(ultimoId: string): string {
  const letra = ultimoId.charAt(0);
  const numero = parseInt(ultimoId.slice(1)) || 0;

  if (numero < 999) {
    // Incrementa normalmente
    const siguienteNum = numero + 1;
    return `${letra}${siguienteNum.toString().padStart(3, "0")}`;
  } else {
    // Si llega a 999, pasa a la siguiente letra
    const siguienteLetra = String.fromCharCode(letra.charCodeAt(0) + 1);
    return `${siguienteLetra}001`;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    if (!Nombres) {
      console.warn("[TurnixPro ElCongo] ⚠️ Faltan datos:", body);
      return NextResponse.json(
        { success: false, error: "Faltan datos" },
        { status: 400 }
      );
    }

    const sheets = await getGoogleSheetsClient();

    //  Leer todos los IDs actuales en la hoja
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:A`,
    });

    const ids = (readRes.data.values || []).map((row) => row[0]).filter(Boolean);

    //  Si no hay IDs válidos (hoja vacía o recién limpiada), reiniciar desde A001
    let ultimo = "A000";

    if (ids.length > 0) {
      //  Filtrar IDs válidos tipo A001, B015, etc.
      const validos = ids
        .map((id) => id.toString().trim().toUpperCase())
        .filter((id) => /^[A-Z]\d{3}$/.test(id));

      if (validos.length > 0) {
        //  Calcular el ID más alto real, aunque haya huecos o desorden
        const maxId = validos.reduce((max, current) => {
          const letraMax = max.charCodeAt(0);
          const letraCur = current.charCodeAt(0);

          if (letraCur > letraMax) return current;
          if (letraCur < letraMax) return max;

          const numMax = parseInt(max.slice(1));
          const numCur = parseInt(current.slice(1));
          return numCur > numMax ? current : max;
        });

        ultimo = maxId;
      }
    }

    const siguienteID = generarNuevoId(ultimo);
    console.log(`[TurnixPro ElCongo] 🧩 Último ID: ${ultimo} → Nuevo: ${siguienteID}`);

    //  Si se alcanza Z999, ejecutar backup + limpieza automática
    if (siguienteID === "Z999") {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL ||
          (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000");

        await fetch(`${baseUrl}/api/backup-excel`);
        await fetch(`${baseUrl}/api/clear-historial`);
        console.log("🧹 Backup y limpieza automáticos ejecutados al llegar a Z999");
      } catch (err) {
        console.error("⚠️ Error al ejecutar backup automático:", err);
      }
    }

    //  Fecha local de registro (zona horaria El Salvador)
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
      siguienteID,
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

    // Insertar la nueva fila
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
      id: siguienteID,
      fechaRegistro,
      detalles: appendRes.data,
    });
  } catch (err: any) {
    console.error("❌ Error general al guardar gestión:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
