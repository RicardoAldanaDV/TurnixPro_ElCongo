// src/lib/nextId.ts
import { sheets_v4 } from "googleapis";

const ID_RE = /^[A-Z]\d{3}$/;

function idToIndex(id: string): number {
  const letter = id[0];
  const num = parseInt(id.slice(1), 10);
  const letterIdx = letter.charCodeAt(0) - 65;
  return letterIdx * 999 + (num - 1);
}

function indexToId(index: number): string {
  const letterIdx = Math.floor(index / 999);
  const num = (index % 999) + 1;
  const letter = String.fromCharCode(65 + letterIdx);
  return `${letter}${num.toString().padStart(3, "0")}`;
}

export async function getNextIdRobusto(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string
): Promise<string> {
  const range = `${sheetName}!A:A`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const rows = (res.data.values ?? []).flat().map(v => String(v).trim());
  const ids = rows.filter(v => ID_RE.test(v));

  if (ids.length === 0) return "A001";

  const maxIndex = Math.max(...ids.map(idToIndex));
  const nextIndex = maxIndex + 1;

  if (nextIndex > idToIndex("Z999")) {
    throw new Error("Se alcanzó Z999. Se requiere backup y reinicio de numeración.");
  }

  return indexToId(nextIndex);
}

export async function idExiste(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string,
  id: string
): Promise<boolean> {
  const range = `${sheetName}!A:A`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = (res.data.values ?? []).flat().map(v => String(v).trim());
  return rows.some(v => v === id);
}
