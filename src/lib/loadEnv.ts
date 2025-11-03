import dotenv from "dotenv";
import path from "path";
import fs from "fs";

export function loadEnvVariables() {
  // Buscar el .env.local dentro del ejecutable o del entorno de desarrollo
  const possiblePaths = [
    path.join(process.cwd(), ".env.local"),
    path.join((process as any).resourcesPath || "", "env", ".env.local"),
    path.join(process.cwd(), "resources", "env", ".env.local"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      console.log("[TurnixPro] Variables cargadas desde:", p);
      return;
    }
  }

  console.warn("[TurnixPro] ⚠️ No se encontró archivo .env.local en ninguna ruta conocida.");
}
