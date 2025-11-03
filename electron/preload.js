const { contextBridge } = require("electron");
const fs = require("fs");
const path = require("path");
const os = require("os");

const settingsPath = path.join(
  os.homedir(),
  "AppData",
  "Roaming",
  "TurnixPro",
  "settings.json"
);

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const raw = fs.readFileSync(settingsPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error cargando ajustes:", err);
  }

  // valores por defecto
  return {
    tituloSize: 2.4,
    esperaScale: 1,
    numeroSize: 10,
    velocidadFrase: 1,
    velocidadNumero: 1,
  };
}

function saveSettings(settings) {
  try {
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.error("Error guardando ajustes:", err);
    return false;
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  loadSettings: () => loadSettings(),
  saveSettings: (settings) => saveSettings(settings),
});
