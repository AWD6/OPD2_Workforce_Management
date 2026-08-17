import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";
const DB_PATH = process.env.OPD2_DB_PATH || join(__dirname, "data", "opd2.sqlite");
const API_KEY = String(process.env.OPD2_API_KEY || "");
const ALLOWED_ORIGIN = String(process.env.OPD2_ALLOWED_ORIGIN || "*");
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const STATIC_ROOT = __dirname;
const ALLOWED_KEYS = new Set([
  "careplan-staff-v2",
  "careplan-weeks-v2",
  "careplan-records-v2",
  "careplan-schedules-v1",
  "careplan-monthly-codes-v1",
  "careplan-assignment-template-v1",
  "careplan-assignment-templates-v2",
  "careplan-assignment-template-seeded-weeks-v1"
]);

mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS app_state (
    storage_key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

function stateCount() {
  return Number(db.prepare("SELECT COUNT(*) AS count FROM app_state").get().count);
}

function readStateRows() {
  return db.prepare("SELECT storage_key, value_json FROM app_state ORDER BY storage_key").all();
}

function readOneState(key) {
  return db.prepare("SELECT value_json FROM app_state WHERE storage_key = ?").get(key);
}

function writeStateRow(key, valueJson) {
  return db.prepare(`
    INSERT INTO app_state (storage_key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(storage_key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at
  `).run(key, valueJson, Date.now());
}

function deleteStateRow(key) {
  return db.prepare("DELETE FROM app_state WHERE storage_key = ?").run(key);
}

function jsonResponse(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, X-OPD2-API-Key",
    "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
    Vary: "Origin"
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, text, contentType = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    Vary: "Origin"
  });
  response.end(text);
}

function isAuthorized(request) {
  return !API_KEY || request.headers["x-opd2-api-key"] === API_KEY;
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        reject(new Error("payload-too-large"));
        request.destroy();
        return;
      }
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("invalid-json"));
      }
    });
    request.on("error", reject);
  });
}

function isValidKey(key) {
  return ALLOWED_KEYS.has(key);
}

function readState() {
  const data = {};
  for (const row of readStateRows()) {
    try {
      data[row.storage_key] = JSON.parse(row.value_json);
    } catch {
      // Ignore a corrupted row instead of making the whole app unavailable.
    }
  }
  return data;
}

function saveState(key, value) {
  writeStateRow(key, JSON.stringify(value));
}

function safePath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0]);
  const candidate = normalize(join(STATIC_ROOT, pathname === "/" ? "index.html" : pathname));
  return candidate.startsWith(STATIC_ROOT) ? candidate : null;
}

function contentType(path) {
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".json": "application/json; charset=utf-8",
    ".ico": "image/x-icon"
  }[extname(path).toLowerCase()] || "application/octet-stream";
}

function serveStatic(request, response) {
  const filePath = safePath(request.url || "/");
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    const fallback = join(STATIC_ROOT, "index.html");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(readFileSync(fallback));
    return;
  }
  response.writeHead(200, {
    "Content-Type": contentType(filePath),
    "Cache-Control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=86400"
  });
  response.end(readFileSync(filePath));
}

async function handleApi(request, response) {
  if (!isAuthorized(request)) {
    jsonResponse(response, 401, { error: "Unauthorized" });
    return;
  }

  const pathname = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`).pathname;
  if (request.method === "GET" && pathname === "/api/health") {
    jsonResponse(response, 200, { ok: true, database: "sqlite", stateCount: stateCount() });
    return;
  }
  if (request.method === "GET" && pathname === "/api/state") {
    jsonResponse(response, 200, { data: readState() });
    return;
  }
  if (request.method === "POST" && pathname === "/api/state/bulk") {
    if (stateCount() > 0) {
      jsonResponse(response, 409, { error: "Central database already contains data" });
      return;
    }
    const body = await readJsonBody(request);
    const data = body?.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : null;
    if (!data) {
      jsonResponse(response, 400, { error: "data must be an object" });
      return;
    }
    for (const [key, value] of Object.entries(data)) {
      if (isValidKey(key)) saveState(key, value);
    }
    jsonResponse(response, 200, { data: readState(), migrated: true });
    return;
  }

  const keyPrefix = "/api/state/";
  if (!pathname.startsWith(keyPrefix)) {
    jsonResponse(response, 404, { error: "Not found" });
    return;
  }
  const key = decodeURIComponent(pathname.slice(keyPrefix.length));
  if (!isValidKey(key)) {
    jsonResponse(response, 400, { error: "Unsupported state key" });
    return;
  }

  if (request.method === "PUT") {
    const body = await readJsonBody(request);
    if (!Object.prototype.hasOwnProperty.call(body, "value")) {
      jsonResponse(response, 400, { error: "value is required" });
      return;
    }
    saveState(key, body.value);
    jsonResponse(response, 200, { key, value: body.value });
    return;
  }
  if (request.method === "DELETE") {
    deleteStateRow(key);
    jsonResponse(response, 200, { key, deleted: true });
    return;
  }
  jsonResponse(response, 405, { error: "Method not allowed" });
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Headers": "Content-Type, X-OPD2-API-Key",
        "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
        Vary: "Origin"
      });
      response.end();
      return;
    }
    if ((request.url || "").startsWith("/api/")) {
      await handleApi(request, response);
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      sendText(response, 405, "Method not allowed");
      return;
    }
    serveStatic(request, response);
  } catch (error) {
    console.error("[OPD2] Request failed", error);
    const status = error?.message === "payload-too-large" ? 413 : error?.message === "invalid-json" ? 400 : 500;
    jsonResponse(response, status, { error: status === 500 ? "Internal server error" : error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[OPD2] Workforce Management running at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  console.log(`[OPD2] Central database: ${DB_PATH}`);
  if (API_KEY) console.log("[OPD2] API key protection is enabled");
});
