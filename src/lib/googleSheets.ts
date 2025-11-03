import { google, sheets_v4 } from "googleapis";
import path from "path";
import fs from "fs";

// 🔹 Variable global para mantener la instancia
let sheets: sheets_v4.Sheets | null = null;

export default async function getGoogleSheetsClient(): Promise<sheets_v4.Sheets> {
  if (sheets) return sheets;

  try {
    // 📍 Detectar si está corriendo en modo Electron (.exe) o en desarrollo
    const isElectron = !!(process && process.versions && process.versions.electron);
    const basePath = isElectron ? (process as any).resourcesPath : process.cwd();

    // 📄 Ruta al archivo de credenciales del servicio
    const credentialsPath = path.join(basePath, "credentials", "service-account.json");

    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`❌ No se encontró el archivo de credenciales: ${credentialsPath}`);
    }

    // 🧩 Leer y parsear el JSON
    const raw = fs.readFileSync(credentialsPath, "utf8");
    const parsed = JSON.parse(raw);

    const clientEmail =
      parsed.client_email || parsed.clientEmail || parsed.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey =
      parsed.private_key || parsed.privateKey || parsed.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      throw new Error("❌ Faltan campos en el archivo service-account.json");
    }

    // 🔐 Corregir saltos de línea
    const fixedKey = privateKey.replace(/\\n/g, "\n");

    // 🔑 Crear autenticación JWT
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: fixedKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // 🚀 Crear cliente de Google Sheets
    sheets = google.sheets({ version: "v4", auth });

    console.log("[TurnixPro] ✅ Cliente de Google Sheets inicializado correctamente");
    console.log("[TurnixPro] Cuenta de servicio usada:", clientEmail);
    return sheets;
  } catch (error: any) {
    console.error("❌ Error al inicializar Google Sheets:", error.message);
    throw error;
  }
}
