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
  const API_BASE = String(window.OPD2_API_BASE || "").replace(/\/+$/, "");
  const cache = {};
  let serverAvailable = false;
  let writeQueue = Promise.resolve();

  function apiUrl(path) {
    return `${API_BASE}${path}`;
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (window.OPD2_API_KEY) headers.set("X-OPD2-API-Key", window.OPD2_API_KEY);
    if (options.body !== undefined) headers.set("Content-Type", "application/json");
    const response = await fetch(apiUrl(path), { ...options, headers });
    if (!response.ok) {
      throw new Error(`API ${response.status}: ${await response.text()}`);
    }
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

  async function bootstrap() {
    try {
      const response = await request("/api/state");
      let data = response.data && typeof response.data === "object" ? response.data : {};

      // Import existing device data only when the central database is still empty.
      if (Object.keys(data).length === 0) {
        const legacy = readLegacySnapshot();
        if (Object.keys(legacy).length > 0) {
          const migrated = await request("/api/state/bulk", {
            method: "POST",
            body: JSON.stringify({ data: legacy })
          });
          data = migrated.data && typeof migrated.data === "object" ? migrated.data : legacy;
        }
      }

      replaceCache(data);
      serverAvailable = true;
      window.__OPD2_STORAGE_MODE__ = "central";
    } catch (error) {
      // The central database remains the normal path. This fallback keeps the UI usable
      // during a temporary network outage and is also what makes legacy data migration safe.
      console.warn("[OPD2] ฐานข้อมูลกลางยังเชื่อมต่อไม่ได้ ใช้ข้อมูลสำรองชั่วคราว", error);
      replaceCache(readLegacySnapshot());
      window.__OPD2_STORAGE_MODE__ = "local-fallback";
    }
  }

  function read(key, fallback) {
    return hasOwn(cache, key) ? cache[key] : fallback;
  }

  function persistLocalFallback(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[OPD2] บันทึกข้อมูลสำรองไม่สำเร็จ: ${key}`, error);
    }
  }

  function write(key, value) {
    cache[key] = value;
    if (!serverAvailable) {
      persistLocalFallback(key, value);
      return;
    }

    writeQueue = writeQueue.then(async () => {
      try {
        const response = await request(`/api/state/${encodeURIComponent(key)}`, {
          method: "PUT",
          body: JSON.stringify({ value })
        });
        if (hasOwn(response, "value")) cache[key] = response.value;
      } catch (error) {
        console.error(`[OPD2] บันทึกฐานข้อมูลกลางไม่สำเร็จ: ${key}`, error);
        persistLocalFallback(key, value);
      }
    });
  }

  function remove(key) {
    delete cache[key];
    if (!serverAvailable) {
      try { window.localStorage.removeItem(key); } catch { /* ignore fallback cleanup errors */ }
      return;
    }

    writeQueue = writeQueue.then(async () => {
      try {
        await request(`/api/state/${encodeURIComponent(key)}`, { method: "DELETE" });
      } catch (error) {
        console.error(`[OPD2] ลบข้อมูลจากฐานข้อมูลกลางไม่สำเร็จ: ${key}`, error);
      }
    });
  }

  async function refresh() {
    if (!serverAvailable) return readSnapshot();
    const response = await request("/api/state");
    replaceCache(response.data || {});
    return readSnapshot();
  }

  function readSnapshot() {
    return { ...cache };
  }

  window.__OPD2_STORE__ = {
    read,
    write,
    remove,
    refresh,
    readSnapshot,
    whenIdle: () => writeQueue,
    isCentral: () => serverAvailable
  };
  window.__OPD2_DATA_READY__ = bootstrap();
})();
