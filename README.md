# 🏛️ TurnixPro — Alcaldía Municipal de El Congo

**TurnixPro El Congo** es un sistema profesional de gestión de turnos y registros ciudadanos, desarrollado con **Next.js, TypeScript, TailwindCSS, Google Sheets API y Electron**.  
Este software permite digitalizar y organizar la atención ciudadana en la **Alcaldía Municipal de El Congo (Santa Ana, El Salvador)**, ofreciendo un flujo de trabajo en tiempo real entre recepción, secretaria y pantalla de visualización.

---

## 📘 Descripción General

TurnixPro fue diseñado para reemplazar los procesos manuales de gestión de turnos con una herramienta moderna, rápida y confiable.  
La aplicación sincroniza los datos con **Google Sheets**, lo que permite almacenar y consultar los registros desde la nube, facilitando el trabajo colaborativo entre varias computadoras.

La versión **TurnixPro El Congo** es una implementación específica para la Alcaldía de El Congo, derivada de la versión anterior utilizada en la Alcaldía de Coatepeque, adaptada con su propio branding, hoja de datos y credenciales independientes.

---

## ⚙️ Tecnologías Principales

| Área              | Tecnología                                        |
| ----------------- | ------------------------------------------------- |
| **Frontend**      | Next.js (App Router) + TypeScript + TailwindCSS   |
| **Backend**       | Google Sheets API (v4)                            |
| **UI Components** | Shadcn/UI + Radix + Custom Styles                 |
| **Base de Datos** | Google Sheets (estructura dinámica por hoja)      |
| **Desktop App**   | Electron Builder (para generar instaladores .exe) |

---

## 🧭 Flujo General del Sistema

### 1. **Oficina 1 (Recepción)**

- Ingreso de nuevas gestiones ciudadanas (con nombre, fecha de nacimiento, comentarios, etc.)
- Generación automática del número de gestión (ID: A001, A002, etc.)
- Registro guardado automáticamente en Google Sheets.

### 2. **Oficina 2 (Secretaría)**

- Visualiza las gestiones pendientes.
- Puede cambiar el estado a **“Por Llamar”** o **“Resuelto”**.
- Envía el número actual a la pantalla principal.

### 3. **Pantalla**

- Muestra en grande el número de gestión que está siendo llamada.
- Reproduce voz (“Siguiente gestión número X”) y puede configurarse en pantalla completa.

### 4. **Base de Datos / Archivo**

- Permite filtrar, buscar y visualizar todas las gestiones.
- Exporta un backup en formato **Excel (.xlsx)**.
- Botón de limpieza para eliminar gestiones resueltas.

---

## 🧾 Estructura de la Hoja de Datos (Google Sheets)

Cada registro se guarda en una fila dentro de la hoja configurada (`Sheet2`), con las siguientes columnas obligatorias:

| Columna         | Descripción                               |
| --------------- | ----------------------------------------- |
| ID              | Código de gestión (A001, A002, etc.)      |
| Nombres         | Nombre de la persona atendida             |
| Apellidos       | Apellido de la persona                    |
| Genero          | Masculino / Femenino                      |
| FechaNacimiento | Fecha en formato dd/mm/aaaa               |
| NombrePadre     | Nombre del padre                          |
| NombreMadre     | Nombre de la madre                        |
| LugarNacimiento | Ciudad o municipio                        |
| Comentarios     | Observaciones adicionales                 |
| Estado          | Pendiente / Por Llamar / Resuelto         |
| FechaRegistro   | Fecha y hora en que se ingresó la gestión |
| FechaResolucion | Fecha en que se marcó como resuelta       |

---

## 📦 Instalación y Ejecución

### 🔹 1. Clonar el repositorio

```bash
git clone https://github.com/RicardoAldanaDV/TurnixPro_ElCongo.git
cd TurnixPro_ElCongo
🔹 2. Instalar dependencias
bash
Copiar código
npm install
🔹 3. Ejecutar en modo desarrollo
bash
Copiar código
npm run dev
Accede a la app en http://localhost:3000

🔹 4. Compilar para producción
bash
Copiar código
npm run build
npm run start
🔹 5. Generar instalador (.exe)
bash
Copiar código
npm run build:electron
Esto genera el instalador de escritorio listo para distribución.

💻 Manual de Usuario
🔸 Recepcionista (Oficina 1)
Abrir la aplicación y seleccionar la opción “Nuevo Registro”.

Llenar los campos requeridos: nombre, apellidos, género, fecha, comentarios, etc.

Presionar el botón “Guardar Gestión”.

Automáticamente se asignará un ID (por ejemplo, A001).

Los datos se enviarán al Google Sheets en la hoja Sheet2.

🔸 Secretaria (Oficina 2)
Abrir el Dashboard desde su computadora.

Verá una lista de gestiones Pendientes.

Puede hacer clic en una gestión y cambiar su estado a:

Por Llamar: Aparecerá en la pantalla principal.

Resuelto: Se moverá automáticamente al historial.

El sistema sincroniza el cambio en tiempo real con Google Sheets.

🔸 Encargado de Pantalla
Abrir la pestaña “Pantalla” o ejecutar el módulo pantalla desde Electron.

Pulsar el botón “Abrir Pantalla” (o “Maximizar”).

Al cambiar una gestión a Por Llamar, se mostrará automáticamente el número en grande con el texto “Siguiente Gestión”.

Puede activar el audio para que la voz anuncie el número.

🔸 Administrador
Desde la pestaña Archivo, puede:

Exportar un Backup Excel de todas las gestiones.

Filtrar por fecha o nombre.

Limpiar las gestiones resueltas.

Puede revisar los archivos generados en la carpeta /backup/ o descargarlos manualmente.

🧠 Estructura del Proyecto
pgsql
Copiar código
TurnixPro_ElCongo/
 ├─ src/
 │  ├─ app/
 │  │   ├─ api/
 │  │   │   ├─ add-gestion/
 │  │   │   ├─ update-gestion/
 │  │   │   ├─ get-gestiones/
 │  │   │   ├─ get-historial/
 │  │   │   ├─ backup-excel/
 │  │   │   ├─ clear-historial/
 │  │   ├─ dashboard/
 │  │   ├─ nuevo-registro/
 │  │   ├─ archivo/
 │  │   ├─ pantalla/
 │  │   ├─ pantalla-ventana/
 │  ├─ components/
 │  ├─ lib/
 │  ├─ styles/
 │  │   └─ globals.css
 ├─ public/
 │  ├─ logo_elcongo.png
 │  ├─ icon_elcongo.ico
 ├─ env/.env.local
 ├─ package.json
 ├─ README.md
🎨 Estilo visual
Tema: Modo oscuro (fondo gris oscuro #050505, acento azul neón #008ffaa)

Botones: Azules con hover dinámico

Tarjetas: Sombras brillantes y bordes redondeados

Tipografía: Inter, sans-serif

Diseño responsivo compatible con pantallas HD y monitores de recepción

📚 Créditos
TurnixPro El Congo es parte del ecosistema Turnix, desarrollado para la digitalización municipal de El Salvador.
Optimizado para la Alcaldía Municipal de El Congo, adaptado por su desarrollador principal:

👨‍💻 Author
RJGA Dev
Desarrollador e Ingeniero en Desarrollo de Software
Universidad de El Salvador – Facultad Multidisciplinaria de Occidente
📍 Santa Ana, El Salvador
📧 ricardojosealdana24@gmail.com
🌐 GitHub: RicardoAldanaDV
```
