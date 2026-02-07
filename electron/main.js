// ===========================
// Imports (CommonJS ONLY)
// ===========================
const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const dotenv = require("dotenv");

// ===========================
// Flags
// ===========================
const isDev = !!process.env.ELECTRON_START_URL;

// ===========================
// Cargar variables de entorno
// ===========================
function loadEnv() {
  try {
    // 1️⃣ Producción (cuando está empaquetado)
    const prodEnvPath = path.join(process.resourcesPath, "env", ".env.local");

    if (fs.existsSync(prodEnvPath)) {
      dotenv.config({ path: prodEnvPath });
      writeLog("ENV cargado desde resourcesPath: " + prodEnvPath);
      return;
    }

    // 2️⃣ Desarrollo / fallback
    const candidates = [
      path.join(__dirname, "..", ".env.local"),
      path.join(process.cwd(), ".env.local"),
      path.join(__dirname, "..", "..", ".env.local"),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        writeLog("ENV cargado desde: " + p);
        return;
      }
    }

    writeLog("⚠️ .env.local no encontrado");
  } catch (err) {
    writeLog("❌ Error cargando ENV: " + String(err));
  }
}

// ===========================
// Logs
// ===========================
function getLogPath() {
  try {
    return path.join(app.getPath("userData"), "turnixpro-debug.log");
  } catch {
    return path.join(__dirname, "turnixpro-debug.log");
  }
}

function writeLog(msg) {
  try {
    const p = getLogPath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.appendFileSync(p, `${new Date().toISOString()} ${msg}\n`);
  } catch {}
}

// ===========================
// Manejo global de errores
// ===========================
process.on("uncaughtException", (err) => {
  const text = `uncaughtException: ${err?.stack ?? err}`;
  console.error(text);
  writeLog(text);
});

process.on("unhandledRejection", (reason) => {
  const text = `unhandledRejection: ${String(reason)}`;
  console.error(text);
  writeLog(text);
});

// ===========================
// Preload resolver
// ===========================
function resolvePreload() {
  const p1 = path.join(__dirname, "preload.js");
  const p2 = path.join(__dirname, "perload.js"); // typo legacy
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return null;
}

// ===========================
// Next.js embebido
// ===========================
async function startEmbeddedNextServer(preferredPort = 3000) {
  const next = require("next");
  const nextApp = next({
    dev: false,
    dir: path.join(__dirname, ".."),
  });

  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  const server = http.createServer((req, res) => handle(req, res));

  return new Promise((resolve, reject) => {
    server
      .listen(preferredPort, () => {
        const port = server.address().port;
        writeLog(`Next embebido en puerto ${port}`);
        resolve(port);
      })
      .on("error", () => {
        server
          .listen(0, () => {
            const port = server.address().port;
            writeLog(`Next embebido en puerto aleatorio ${port}`);
            resolve(port);
          })
          .on("error", reject);
      });
  });
}

// ===========================
// Ventana principal
// ===========================
async function createWindow() {
  const preloadPath = resolvePreload();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    icon: path.join(__dirname, "../public/icono.ico"),
    webPreferences: {
      preload: preloadPath ?? undefined,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once("ready-to-show", () => win.show());

  writeLog("App iniciando");

  // ---------------------------
  // DEV
  // ---------------------------
  if (isDev) {
    const url = process.env.ELECTRON_START_URL || "http://localhost:3000";
    writeLog("Modo DEV → " + url);
    await win.loadURL(url);
    return;
  }

  // ---------------------------
  // PRODUCCIÓN
  // ---------------------------
  try {
    writeLog("Iniciando Next embebido...");
    const port = await startEmbeddedNextServer(3000);
    const url = `http://localhost:${port}`;
    writeLog("Cargando → " + url);
    await win.loadURL(url);
    return;
  } catch (err) {
    writeLog("❌ Error Next embebido: " + String(err));
  }

  // ---------------------------
  // Fallback estático
  // ---------------------------
  const outIndex = path.join(__dirname, "../out/index.html");
  if (fs.existsSync(outIndex)) {
    await win.loadFile(outIndex);
    return;
  }

  await win.loadURL(
    "data:text/html;charset=utf-8," +
      encodeURIComponent(`
        <h2>Error de empaquetado</h2>
        <p>No se encontró build de Next.</p>
      `)
  );
}

// ===========================
// App lifecycle
// ===========================
app.whenReady().then(() => {
  loadEnv();

  try {
    protocol.registerSchemesAsPrivileged([
      {
        scheme: "app",
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: true,
        },
      },
    ]);
  } catch {}

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
