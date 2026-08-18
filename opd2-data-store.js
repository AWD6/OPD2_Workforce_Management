(() => {
  const STORAGE_KEYS = [
    "careplan-staff-v2",
    "careplan-weeks-v2",
    "careplan-records-v2",
    "careplan-schedules-v1",
    "careplan-monthly-codes-v1",
    "careplan-assignment-template-v1",
    "careplan-assignment-templates-v2",
    "careplan-assignment-template-seeded-weeks-v1"
  ];
  const API_URL = String(window.OPD2_SHEETS_API_URL || "").trim().replace(/\/+$/, "");
  const API_BASE = String(window.OPD2_API_BASE || "").replace(/\/+$/, "");
  const POLL_MS = 3500;
  const cache = {};
  let serverAvailable = false;
  let cloudMode = Boolean(API_URL);
  let editorEnabled = false;
  let editorCode = "";
  let remoteRevision = "";
  let writeQueue = Promise.resolve();
  let remoteRefreshTimer = 0;
  let pollTimer = 0;

  window.__OPD2_STORAGE_MODE__ = cloudMode ? "sheets-pending" : "local-fallback";

  function apiUrl(path) {
    return `${API_BASE}${path}`;
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (window.OPD2_API_KEY) headers.set("X-OPD2-API-Key", window.OPD2_API_KEY);
    if (options.body !== undefined) headers.set("Content-Type", "application/json");
    const response = await fetch(apiUrl(path), { ...options, headers });
    if (!response.ok) throw new Error(`API ${response.status}: ${await response.text()}`);
    return response.json();
  }

  function readLegacySnapshot() {
    const snapshot = {};
    STORAGE_KEYS.forEach((key) => {
      try {
        const value = window.localStorage.getItem(key);
        if (value !== null) snapshot[key] = JSON.parse(value);
      } catch (error) {
        console.warn(`[OPD2] ข้ามข้อมูล local ที่อ่านไม่ได้: ${key}`, error);
      }
    });
    return snapshot;
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function replaceCache(data) {
    Object.keys(cache).forEach((key) => delete cache[key]);
    if (!data || typeof data !== "object") return;
    Object.entries(data).forEach(([key, value]) => {
      if (STORAGE_KEYS.includes(key)) cache[key] = value;
    });
  }

  function editorCodeFromUrl() {
    const currentUrl = new URL(window.location.href);
    const queryCode = currentUrl.searchParams.get("edit") || "";
    if (queryCode) {
      try { window.sessionStorage.setItem("opd2-editor-code", queryCode); } catch { /* ignore */ }
      currentUrl.searchParams.delete("edit");
      window.history.replaceState({}, document.title, `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      return queryCode;
    }
    try { return window.sessionStorage.getItem("opd2-editor-code") || ""; } catch { return ""; }
  }

  function jsonpRead(action = "read", code = "") {
    if (!API_URL) return Promise.reject(new Error("Google Sheets API URL is not configured"));
    return new Promise((resolve, reject) => {
      const callbackName = `__opd2_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const params = new URLSearchParams({ action, callback: callbackName, _: String(Date.now()) });
      if (code) params.set("editorCode", code);
      let finished = false;
      const timer = window.setTimeout(() => finish(new Error("Google Sheets read timeout")), 12000);
      const finish = (error, data) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        delete window[callbackName];
        script.remove();
        if (error) reject(error); else resolve(data);
      };
      window[callbackName] = (data) => {
        if (!data || data.ok === false) finish(new Error(data?.error || "Google Sheets request failed"));
        else finish(null, data);
      };
      script.onerror = () => finish(new Error("Google Sheets JSONP request failed"));
      script.src = `${API_URL}?${params.toString()}`;
      document.head.appendChild(script);
    });
  }

  function submitWrite(action, key, value) {
    if (!API_URL) return Promise.reject(new Error("Google Sheets API URL is not configured"));
    return new Promise((resolve) => {
      const frameName = `opd2_write_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const iframe = document.createElement("iframe");
      iframe.name = frameName;
      iframe.style.display = "none";
      const form = document.createElement("form");
      form.method = "POST";
      form.action = API_URL;
      form.target = frameName;
      form.style.display = "none";
      const fields = {
        action,
        key: key || "",
        valueJson: value === undefined ? "" : JSON.stringify(value),
        editorCode
      };
      Object.entries(fields).forEach(([name, fieldValue]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = fieldValue;
        form.appendChild(input);
      });
      document.body.append(iframe, form);
      form.submit();
      window.setTimeout(() => { iframe.remove(); form.remove(); resolve({ ok: true }); }, 1200);
    });
  }

  function scheduleRemoteRefresh() {
    if (remoteRefreshTimer) return;
    remoteRefreshTimer = window.setTimeout(async () => {
      remoteRefreshTimer = 0;
      try {
        const response = await jsonpRead("read");
        if (response.revision && response.revision === remoteRevision) return;
        remoteRevision = response.revision || String(Date.now());
        replaceCache(response.data || {});
        window.dispatchEvent(new CustomEvent("opd2:remote-update"));
      } catch (error) {
        console.warn("[OPD2] โหลดการเปลี่ยนแปลงจาก Google Sheets ไม่สำเร็จ", error);
      }
    }, 80);
  }

  async function pollRemote() {
    if (!cloudMode || document.hidden) return;
    try {
      const response = await jsonpRead("read");
      serverAvailable = true;
      if (response.revision && response.revision !== remoteRevision) {
        remoteRevision = response.revision;
        replaceCache(response.data || {});
        window.dispatchEvent(new CustomEvent("opd2:remote-update"));
      }
      window.__OPD2_STORAGE_MODE__ = "google-sheets";
    } catch (error) {
      console.warn("[OPD2] Google Sheets polling failed", error);
    }
  }

  function startPolling() {
    if (pollTimer || !API_URL) return;
    pollTimer = window.setInterval(() => pollRemote(), POLL_MS);
  }

  async function bootstrap() {
    editorCode = editorCodeFromUrl();
    try {
      if (API_URL) {
        const response = await jsonpRead("read");
        cloudMode = true;
        serverAvailable = true;
        remoteRevision = response.revision || "";
        replaceCache(response.data || {});
        if (editorCode) {
          try {
            const verification = await jsonpRead("verify", editorCode);
            editorEnabled = verification.ok === true;
          } catch (error) {
            console.warn("[OPD2] รหัสแก้ไขไม่ถูกต้อง", error);
            editorEnabled = false;
          }
        }
        if (!Object.keys(cache).length && editorEnabled) {
          const legacy = readLegacySnapshot();
          if (Object.keys(legacy).length) {
            replaceCache(legacy);
            writeQueue = writeQueue.then(() => submitWrite("bulk", "", legacy));
          }
        }
        window.__OPD2_STORAGE_MODE__ = "google-sheets";
        startPolling();
        return;
      }

      if (API_BASE) {
        const response = await request("/api/state");
        replaceCache(response.data || {});
        serverAvailable = true;
        editorEnabled = true;
        window.__OPD2_STORAGE_MODE__ = "central-api";
        return;
      }

      replaceCache(readLegacySnapshot());
      window.__OPD2_STORAGE_MODE__ = "local-fallback";
    } catch (error) {
      console.warn("[OPD2] ฐานข้อมูลกลางยังเชื่อมต่อไม่ได้", error);
      if (API_URL) {
        cloudMode = true;
        serverAvailable = false;
        editorEnabled = false;
        window.__OPD2_STORAGE_MODE__ = "sheets-unavailable";
        startPolling();
        return;
      }
      replaceCache(readLegacySnapshot());
      window.__OPD2_STORAGE_MODE__ = "local-fallback";
    }
  }

  function read(key, fallback) {
    return hasOwn(cache, key) ? cache[key] : fallback;
  }

  function persistLocalFallback(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.warn(`[OPD2] บันทึกข้อมูลสำรองไม่สำเร็จ: ${key}`, error); }
  }

  function write(key, value) {
    if (cloudMode && !editorEnabled) return false;
    cache[key] = value;
    if (cloudMode) {
      writeQueue = writeQueue.then(() => submitWrite("write", key, value)).catch((error) => console.error(`[OPD2] บันทึก Google Sheets ไม่สำเร็จ: ${key}`, error));
      return true;
    }
    if (serverAvailable && API_BASE) {
      writeQueue = writeQueue.then(async () => {
        try {
          const response = await request(`/api/state/${encodeURIComponent(key)}`, { method: "PUT", body: JSON.stringify({ value }) });
          if (hasOwn(response, "value")) cache[key] = response.value;
        } catch (error) {
          console.error(`[OPD2] บันทึกฐานข้อมูลกลางไม่สำเร็จ: ${key}`, error);
          persistLocalFallback(key, value);
        }
      });
      return true;
    }
    persistLocalFallback(key, value);
    return true;
  }

  function remove(key) {
    if (cloudMode && !editorEnabled) return false;
    delete cache[key];
    if (cloudMode) {
      writeQueue = writeQueue.then(() => submitWrite("delete", key, null)).catch((error) => console.error(`[OPD2] ลบข้อมูลจาก Google Sheets ไม่สำเร็จ: ${key}`, error));
      return true;
    }
    if (serverAvailable && API_BASE) {
      writeQueue = writeQueue.then(async () => {
        try { await request(`/api/state/${encodeURIComponent(key)}`, { method: "DELETE" }); }
        catch (error) { console.error(`[OPD2] ลบข้อมูลจากฐานข้อมูลกลางไม่สำเร็จ: ${key}`, error); }
      });
      return true;
    }
    try { window.localStorage.removeItem(key); } catch { /* ignore fallback cleanup errors */ }
    return true;
  }

  async function refresh() {
    if (cloudMode) {
      const response = await jsonpRead("read");
      remoteRevision = response.revision || String(Date.now());
      replaceCache(response.data || {});
      window.dispatchEvent(new CustomEvent("opd2:remote-update"));
      return { ...cache };
    }
    if (!serverAvailable || !API_BASE) return { ...cache };
    const response = await request("/api/state");
    replaceCache(response.data || {});
    window.dispatchEvent(new CustomEvent("opd2:remote-update"));
    return { ...cache };
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && (serverAvailable || cloudMode)) refresh().catch((error) => console.warn("[OPD2] refresh failed", error));
  });

  window.__OPD2_STORE__ = {
    read,
    write,
    remove,
    refresh,
    readSnapshot: () => ({ ...cache }),
    whenIdle: () => writeQueue,
    isCentral: () => serverAvailable,
    canEdit: () => editorEnabled,
    isCloud: () => cloudMode
  };
  window.__OPD2_DATA_READY__ = bootstrap();
})();
