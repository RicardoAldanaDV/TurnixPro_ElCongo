const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");

const isDev = !!process.env.ELECTRON_START_URL; // true en electron-dev

// ---------------------------
// Utilidades internas
// ---------------------------
function resolvePreload() {
  const p1 = path.join(__dirname, "preload.js");
  const p2 = path.join(__dirname, "perload.js");
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return null;
}

function getLogPath() {
  try {
    const userData = app.getPath("userData");
    return path.join(userData, "turnixpro-debug.log");
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

// ---------------------------
// Manejo de errores globales
// ---------------------------
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

// ---------------------------
// Cargar .env.local
// ---------------------------
function loadEnvLocal() {
  try {
    const candidates = [
      path.join(__dirname, "..", ".env.local"),
      path.join(process.cwd(), ".env.local"),
      path.join(__dirname, "..", "..", ".env.local"),
    ];

    let envPath = null;
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        envPath = p;
        break;
      }
    }

    if (!envPath) {
      writeLog(".env.local no encontrado en ubicaciones esperadas");
      return;
    }

    const raw = fs.readFileSync(envPath, "utf8");
    const lines = raw.split(/\r?\n/);
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIndex = line.indexOf("=");
      if (eqIndex === -1) continue;
      let key = line.substring(0, eqIndex).trim();
      let val = line.substring(eqIndex + 1).trim();

      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.substring(1, val.length - 1);
      }

      if (val.includes("\\n")) {
        val = val.replace(/\\n/g, "\n");
      }

      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }

    writeLog(".env.local cargado desde: " + envPath);
  } catch (err) {
    writeLog("Error cargando .env.local: " + String(err));
  }
}

// ---------------------------
// Servidor Next embebido
// ---------------------------
async function startEmbeddedNextServer(preferredPort = 3000) {
  try {
    const next = require("next");
    const nextApp = next({ dev: false, dir: path.join(__dirname, "..") });
    const handle = nextApp.getRequestHandler();

    await nextApp.prepare();

    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    return await new Promise((resolve, reject) => {
      server
        .listen(preferredPort, () => {
          const port = server.address().port;
          writeLog(`Next embebido escuchando en puerto ${port}`);
          resolve(port);
        })
        .on("error", (err) => {
          writeLog(
            `Puerto ${preferredPort} ocupado, intentando puerto aleatorio: ${String(err)}`
          );
          server
            .listen(0, () => {
              const port = server.address().port;
              writeLog(`Next embebido escuchando en puerto ${port} (aleatorio)`);
              resolve(port);
            })
            .on("error", (err2) => {
              writeLog("No se pudo iniciar servidor Next embebido: " + String(err2));
              reject(err2);
            });
        });
    });
  } catch (err) {
    writeLog("Error iniciando Next embebido: " + String(err));
    throw err;
  }
}

// ---------------------------
// Crear ventana principal
// ---------------------------
async function createWindow() {
  const preloadPath = resolvePreload();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    icon: path.join(__dirname, "../public/icono.ico"),
    webPreferences: {
      preload: preloadPath ? preloadPath : undefined,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const logPath = getLogPath();
  writeLog("App arrancando. Log inicializado en: " + logPath);

  win.once("ready-to-show", () => {
    win.show();
  });

  if (isDev) {
    const url = process.env.ELECTRON_START_URL || "http://localhost:3000";
    writeLog("Modo DEV: cargando " + url);
    await win.loadURL(url);
    return;
  }

  // PRODUCCIÓN
  try {
    writeLog("Producción: arrancando Next embebido...");
    const port = await startEmbeddedNextServer(3000);
    const url = `http://localhost:${port}`;
    writeLog("Producción: cargando " + url);
    await win.loadURL(url);
    return;
  } catch (err) {
    const txt = "Error arrancando Next embebido: " + String(err);
    console.error(txt);
    writeLog(txt);
  }

  // fallback: intentar cargar out/index.html o error.html
  const outIndex = path.join(__dirname, "../out/index.html");
  if (fs.existsSync(outIndex)) {
    try {
      writeLog("Cargando out/index.html -> " + outIndex);
      await win.loadFile(outIndex);
      return;
    } catch (e) {
      const txt = "Error cargando out/index.html: " + String(e);
      console.error(txt);
      writeLog(txt);
    }
  }

  const errorHtml = path.join(__dirname, "error.html");
  if (fs.existsSync(errorHtml)) {
    await win.loadFile(errorHtml);
  } else {
    await win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(`
      <h2 style="font-family:sans-serif">Aplicación empaquetada sin contenido</h2>
      <p>Genera el build con <code>npm run build:next</code> y vuelve a empaquetar.</p>
    `)
    );
  }
}

// ---------------------------
// Inicialización de la app
// ---------------------------
loadEnvLocal();

app.whenReady().then(() => {
  try {
    protocol.registerSchemesAsPrivileged([
      {
        scheme: "app",
        privileges: { standard: true, secure: true, supportFetchAPI: true },
      },
    ]);
  } catch (e) {}

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
