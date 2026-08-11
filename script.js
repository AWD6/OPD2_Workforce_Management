const DEFAULT_STAFF = { nurse: 7, pn: 2, hp: 2 };
const DAY_NAMES = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
const DAY_SHORT = ["จ", "อ", "พ", "พฤ", "ศ"];
const STORAGE = {
  staff: "careplan-staff-v2",
  weeks: "careplan-weeks-v2",
  records: "careplan-records-v2"
};

let staff = readStorage(STORAGE.staff, DEFAULT_STAFF);
let selectedWeek = getMonday(new Date());
let currentPlans = loadWeek(selectedWeek);
let lastCalculated = false;
let toastTimer;

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonday(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1));
  return copy;
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function toThaiDate(date, includeYear = true) {
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${date.getDate()} ${months[date.getMonth()]}${includeYear ? ` ${String(date.getFullYear() + 543).slice(-2)}` : ""}`;
}

function toWeekValue(date) {
  const thursday = addDays(getMonday(date), 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const week = 1 + Math.round((thursday - getMonday(firstThursday)) / 604800000);
  return `${thursday.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function mondayFromWeekValue(value) {
  if (!value) return getMonday(new Date());
  const [yearText, weekText] = value.split("-W");
  const year = Number(yearText);
  const week = Number(weekText);
  const jan4 = new Date(year, 0, 4);
  const monday = getMonday(jan4);
  return addDays(monday, (week - 1) * 7);
}

function weekLabel(monday) {
  const friday = addDays(monday, 4);
  return monday.getMonth() === friday.getMonth()
    ? `${monday.getDate()}–${friday.getDate()} ${toThaiDate(friday, false).split(" ")[1]} ${friday.getFullYear() + 543}`
    : `${toThaiDate(monday)} – ${toThaiDate(friday)}`;
}

function makeDefaultPlans(monday) {
  const defaults = [
    { scheduled: 100, walkIn: 15, outside: 5 },
    { scheduled: 80, walkIn: 5, outside: 5 },
    { scheduled: 240, walkIn: 50, outside: 10 },
    { scheduled: 240, walkIn: 50, outside: 10 },
    { scheduled: 15, walkIn: 5, outside: 5 }
  ];
  return DAY_NAMES.map((label, index) => ({
    key: ["mon", "tue", "wed", "thu", "fri"][index],
    label,
    date: addDays(monday, index).toISOString(),
    holiday: false,
    ...defaults[index],
    allocation: { leaveNurse: 0, leavePn: 0, leaveHp: 0 }
  }));
}

function normalizePlan(plan, index, monday) {
  const legacy = plan.allocation || {};
  const normalized = {
    ...makeDefaultPlans(monday)[index],
    ...plan,
    date: plan.date || addDays(monday, index).toISOString(),
    allocation: {
      leaveNurse: clampNumber(legacy.leaveNurse),
      leavePn: clampNumber(legacy.leavePn),
      leaveHp: clampNumber(legacy.leaveHp)
    }
  };
  return normalized;
}

function loadWeek(monday) {
  const saved = readStorage(STORAGE.weeks, {});
  return (saved[dateKey(monday)] || makeDefaultPlans(monday)).map((plan, index) => normalizePlan(plan, index, monday));
}

function saveCurrentWeek() {
  const allWeeks = readStorage(STORAGE.weeks, {});
  allWeeks[dateKey(selectedWeek)] = currentPlans;
  writeStorage(STORAGE.weeks, allWeeks);
}

function clampNumber(value, min = 0) {
  return Math.max(min, Number.isFinite(Number(value)) ? Number(value) : 0);
}

function totalStaff() {
  return staff.nurse + staff.pn + staff.hp;
}

function demand(plan) {
  return plan.scheduled + plan.walkIn + plan.outside;
}

function calculateProduct(plan) {
  if (plan.holiday) return null;
  const a = plan.allocation;
  const availableStaff = Math.max(totalStaff() - a.leaveNurse - a.leavePn - a.leaveHp, 0);
  const availableHours = availableStaff * 7;
  return Math.round((demand(plan) / Math.max(availableHours, 1)) * 100);
}

function statusOf(product) {
  if (product === null || product === undefined) return "neutral";
  if (product > 115) return "high";
  if (product < 85) return "low";
  return "healthy";
}

function statusLabel(status) {
  return {
    neutral: "ยังไม่คำนวณ",
    healthy: "บุคลากรเหมาะสมกับงาน",
    low: "บุคลากรมากกว่างาน",
    high: "งานมากกว่าบุคลากร"
  }[status];
}

function inputHtml(id, value) {
  return `<input class="number-input" id="${id}" type="number" min="0" value="${value}" aria-label="จำนวน" />`;
}

function render() {
  document.getElementById("weekLabel").textContent = isCurrentWeek(selectedWeek) ? "สัปดาห์ปัจจุบัน" : weekLabel(selectedWeek);
  document.getElementById("weekInput").value = toWeekValue(selectedWeek);
  document.getElementById("staffNurse").value = staff.nurse;
  document.getElementById("staffPn").value = staff.pn;
  document.getElementById("staffHp").value = staff.hp;
  document.getElementById("staffTotal").textContent = totalStaff();
  document.getElementById("totalStaff").textContent = totalStaff();
  renderPlanningRows();
  renderStaffingRows();
  renderMetrics();
  renderRecords();
}

function renderPlanningRows() {
  const container = document.getElementById("planningRows");
  container.innerHTML = currentPlans.map((plan, index) => {
    const total = demand(plan);
    const product = calculateProduct(plan);
    const status = lastCalculated ? statusOf(product) : "neutral";
    return `<div class="table-row planning-row planning-columns ${plan.holiday ? "is-holiday" : ""}">
      <div class="day-cell"><span class="day-initial">${DAY_SHORT[index]}</span><span><b class="day-name">${plan.label}</b><small class="day-date">${toThaiDate(new Date(plan.date))}</small></span></div>
      <div>${inputHtml(`scheduled-${plan.key}`, plan.scheduled)}</div>
      <div>${inputHtml(`walkin-${plan.key}`, plan.walkIn)}</div>
      <div>${inputHtml(`outside-${plan.key}`, plan.outside)}</div>
      <div class="total-cell">${plan.holiday ? "—" : total}<span>${plan.holiday ? "" : "ราย"}</span></div>
      <div><button class="holiday-button ${plan.holiday ? "is-set" : ""}" data-holiday="${plan.key}">${plan.holiday ? closeIcon() + " วันหยุด" : calendarIcon() + " ตั้งเป็นวันหยุด"}</button><div class="day-status status-${status}" style="margin-top:5px">${statusLabel(status)}</div></div>
    </div>`;
  }).join("");

  currentPlans.forEach((plan) => {
    ["scheduled", "walkIn", "outside"].forEach((field) => {
      const id = `${field === "walkIn" ? "walkin" : field}-${plan.key}`;
      const input = document.getElementById(id);
      input.addEventListener("change", (event) => {
        plan[field] = clampNumber(event.target.value);
        lastCalculated = false;
        saveCurrentWeek();
        render();
      });
    });
  });
  container.querySelectorAll("[data-holiday]").forEach((button) => button.addEventListener("click", () => {
    const plan = currentPlans.find((item) => item.key === button.dataset.holiday);
    plan.holiday = !plan.holiday;
    lastCalculated = false;
    saveCurrentWeek();
    render();
  }));
}

function renderStaffingRows() {
  const container = document.getElementById("staffingRows");
  container.innerHTML = currentPlans.map((plan, index) => {
     const a = plan.allocation;
     const availableStaff = Math.max(totalStaff() - a.leaveNurse - a.leavePn - a.leaveHp, 0);
    return `<div class="table-row staffing-row staffing-columns ${plan.holiday ? "is-holiday" : ""}">
      <div class="day-cell"><span class="day-initial">${DAY_SHORT[index]}</span><span><b class="day-name">${plan.label}</b><small class="day-date">${toThaiDate(new Date(plan.date))}</small></span></div>
      <div>${inputHtml(`leave-nurse-${plan.key}`, a.leaveNurse)}</div>
      <div>${inputHtml(`leave-pn-${plan.key}`, a.leavePn)}</div>
      <div>${inputHtml(`leave-hp-${plan.key}`, a.leaveHp)}</div>
       <div class="ready-staff">${plan.holiday ? "—" : `${availableStaff} คน`}</div>
       <div class="hours-summary">${plan.holiday ? "—" : availableStaff * 7}<small>${plan.holiday ? "" : "ชม."}</small></div>
    </div>`;
  }).join("");
  currentPlans.forEach((plan) => {
    const fields = ["leaveNurse", "leavePn", "leaveHp"];
    fields.forEach((field) => {
      const input = document.getElementById(`${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}-${plan.key}`);
      input.addEventListener("change", (event) => {
        plan.allocation[field] = clampNumber(event.target.value);
        lastCalculated = false;
        saveCurrentWeek();
        render();
      });
    });
  });
}

function renderMetrics() {
  const active = currentPlans.filter((plan) => !plan.holiday);
  const totalDemand = active.reduce((sum, plan) => sum + demand(plan), 0);
  const products = lastCalculated ? active.map(calculateProduct).filter((value) => value !== null) : [];
  const average = products.length ? Math.round(products.reduce((sum, value) => sum + value, 0) / products.length) : null;
  document.getElementById("totalDemand").textContent = totalDemand.toLocaleString("th-TH");
  document.getElementById("demandDetail").textContent = `${active.length} วันทำการ · รวมทุกช่องทาง`;
  document.getElementById("plannedDays").textContent = `${active.length} / 5`;
  document.getElementById("holidayDetail").textContent = `${currentPlans.length - active.length} วันหยุดที่ไม่นำมาคำนวณ`;
  document.getElementById("averageProduct").textContent = average === null ? "—" : `${average}%`;
  document.getElementById("averageDetail").textContent = average === null ? "กดคำนวณเพื่อดูภาพรวม" : statusLabel(statusOf(average));
  const breakdown = document.getElementById("staffBreakdown");
  breakdown.innerHTML = ["nurse", "pn", "hp"].map((role) => {
    const label = role === "nurse" ? "Nurse" : role.toUpperCase();
    const leave = currentPlans.reduce((sum, plan) => sum + plan.allocation[`leave${role === "nurse" ? "Nurse" : role === "pn" ? "Pn" : "Hp"}`], 0);
     return `<div><span>${label} · ลา ${leave} คน</span><b>ประจำ ${staff[role]} คน</b></div>`;
  }).join("");
  const high = active.filter((plan) => statusOf(calculateProduct(plan)) === "high");
  const alertBox = document.getElementById("alertBox");
  alertBox.hidden = !lastCalculated || high.length === 0;
   document.getElementById("alertText").textContent = `มี ${high.length} วันที่งานมากกว่าบุคลากร ควรตรวจสอบก่อนยืนยันตาราง`;
}

function renderRecords() {
  const records = readStorage(STORAGE.records, []);
  const container = document.getElementById("recordsList");
  if (!records.length) {
    container.innerHTML = `<div class="empty-records">ยังไม่มีข้อมูลบันทึก กด “บันทึกสัปดาห์นี้” เพื่อเก็บสถิติการจัดสรรกำลังคน</div>`;
    return;
  }
  container.innerHTML = records.map((record, index) => {
    const recordStaff = record.staff || { nurse: staff.nurse, pn: staff.pn, hp: staff.hp, total: totalStaff() };
    return `<div class="record-item">
    <div class="record-week"><strong>${record.week}</strong><span>บันทึกเมื่อ ${record.savedAt}</span></div>
     <div class="record-summary">เจ้าหน้าที่ ${recordStaff.total} คน (Nurse ${recordStaff.nurse} · PN ${recordStaff.pn} · HP ${recordStaff.hp})<br />รวมลา ${record.leave || 0} คน · ประเมินจากเวลาพร้อมทำงาน 7 ชั่วโมงต่อคน</div>
    <div class="record-metric"><strong>${record.average === null ? "—" : `${record.average}%`}</strong><span>${record.status}</span></div>
    <button class="delete-record" data-delete-record="${index}" aria-label="ลบข้อมูลบันทึก">${trashIcon()}</button>
     ${record.plans?.length ? `<details class="record-details"><summary>ดูรายละเอียดความพร้อมรายวัน</summary>${recordDetailsHtml(record)}</details>` : ""}
  </div>`;
  }).join("");
  container.querySelectorAll("[data-delete-record]").forEach((button) => button.addEventListener("click", () => {
    const next = records.filter((_, index) => index !== Number(button.dataset.deleteRecord));
    writeStorage(STORAGE.records, next);
    renderRecords();
    showToast("ลบข้อมูลบันทึกแล้ว");
  }));
}

function recordDetailsHtml(record) {
  const recordStaff = record.staff || { nurse: staff.nurse, pn: staff.pn, hp: staff.hp };
   return `<div class="record-detail-table"><table><thead><tr><th>วัน / วันที่</th><th>ผู้รับบริการ</th><th>ความพร้อม</th><th>บุคลากรประจำ</th><th>ลา Nurse / PN / HP</th><th>บุคลากรพร้อม</th><th>เวลาพร้อม</th></tr></thead><tbody>${record.plans.map((plan) => {
    const a = plan.allocation;
     const availableStaff = Math.max(recordStaff.total - a.leaveNurse - a.leavePn - a.leaveHp, 0);
     return `<tr><td><strong>${plan.label}</strong> · ${toThaiDate(new Date(plan.date))}</td><td>${plan.holiday ? "วันหยุด" : demand(plan)} ราย</td><td>${plan.product === null ? "—" : `${plan.product}% · ${statusLabel(statusOf(plan.product))}`}</td><td>${recordStaff.nurse} / ${recordStaff.pn} / ${recordStaff.hp}</td><td>${a.leaveNurse} / ${a.leavePn} / ${a.leaveHp} คน</td><td>${plan.holiday ? "—" : `${availableStaff} คน`}</td><td>${plan.holiday ? "—" : `${availableStaff * 7} ชม.`}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function saveRecord() {
  const active = currentPlans.filter((plan) => !plan.holiday);
  const products = active.map(calculateProduct).filter((value) => value !== null);
  const average = products.length ? Math.round(products.reduce((sum, value) => sum + value, 0) / products.length) : null;
  const leave = currentPlans.reduce((sum, plan) => sum + plan.allocation.leaveNurse + plan.allocation.leavePn + plan.allocation.leaveHp, 0);
  const record = {
    week: weekLabel(selectedWeek),
    savedAt: new Date().toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }),
     leave, average,
     status: average === null ? "ยังไม่คำนวณ" : statusLabel(statusOf(average)),
    staff: { ...staff, total: totalStaff() },
     plans: currentPlans.map((plan) => ({ ...plan, allocation: { ...plan.allocation }, product: calculateProduct(plan) }))
  };
  const records = readStorage(STORAGE.records, []);
  writeStorage(STORAGE.records, [record, ...records].slice(0, 30));
  renderRecords();
  showToast("บันทึกสถิติสัปดาห์นี้แล้ว");
}

function calculateAndShow() {
  lastCalculated = true;
  saveCurrentWeek();
  render();
  openReport();
}

function openReport() {
  const active = currentPlans.filter((plan) => !plan.holiday);
  const products = active.map((plan) => ({ plan, product: calculateProduct(plan) }));
  const average = products.length ? Math.round(products.reduce((sum, item) => sum + item.product, 0) / products.length) : 0;
  const alerts = products.filter((item) => statusOf(item.product) === "high");
  const healthy = products.filter((item) => statusOf(item.product) === "healthy");
  const low = products.filter((item) => statusOf(item.product) === "low");
  document.getElementById("reportAverage").textContent = `${average}%`;
  document.getElementById("reportHealthy").textContent = `${healthy.length} วัน`;
  document.getElementById("reportAlerts").textContent = `${products.length - healthy.length} วัน`;
  document.getElementById("reportSummary").textContent = alerts.length
    ? `พบ ${alerts.length} วันที่งานมากกว่าบุคลากร และ ${low.length} วันที่บุคลากรมากกว่างาน ควรตรวจสอบแผนก่อนเปิดคลินิก`
    : low.length
      ? `พบ ${low.length} วันที่บุคลากรมากกว่างาน ส่วนวันที่เหลือบุคลากรเหมาะสมกับงาน`
      : "ทุกวันที่เปิดทำการมีบุคลากรเหมาะสมกับงานตามข้อมูลที่กรอก";
  document.getElementById("reportList").innerHTML = products.map(({ plan, product }) => `<div class="report-row is-${statusOf(product)}"><span>${plan.label} · ${toThaiDate(new Date(plan.date))}</span><span>${product}% · ${statusLabel(statusOf(product))}</span></div>`).join("");
  document.getElementById("reportModal").hidden = false;
}

function setWeek(monday) {
  saveCurrentWeek();
  selectedWeek = getMonday(monday);
  currentPlans = loadWeek(selectedWeek);
  lastCalculated = false;
  render();
}

function isCurrentWeek(monday) {
  return dateKey(monday) === dateKey(getMonday(new Date()));
}

function updateClock() {
  document.getElementById("liveClock").textContent = new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function resetWeek() {
  currentPlans = makeDefaultPlans(selectedWeek);
  lastCalculated = false;
  saveCurrentWeek();
  render();
  showToast("คืนค่าข้อมูลสัปดาห์นี้แล้ว");
}

function resetAll() {
  staff = { ...DEFAULT_STAFF };
  localStorage.removeItem(STORAGE.weeks);
  localStorage.removeItem(STORAGE.records);
  currentPlans = makeDefaultPlans(selectedWeek);
  lastCalculated = false;
  writeStorage(STORAGE.staff, staff);
  render();
  showToast("คืนค่าข้อมูลทั้งหมดเป็นค่าเริ่มต้นแล้ว");
}

function closeIcon() { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>`; }
function calendarIcon() { return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>`; }
function trashIcon() { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3m-9 0 1 14h10l1-14"/></svg>`; }

document.querySelectorAll("[data-scroll]").forEach((button) => button.addEventListener("click", () => {
  document.getElementById(button.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("is-active"));
  button.classList.add("is-active");
}));

document.getElementById("weekButton").addEventListener("click", () => {
  const picker = document.getElementById("weekPicker");
  const button = document.getElementById("weekButton");
  picker.hidden = !picker.hidden;
  button.setAttribute("aria-expanded", String(!picker.hidden));
  if (!picker.hidden) {
    const input = document.getElementById("weekInput");
    input.focus();
    if (typeof input.showPicker === "function") {
      try { input.showPicker(); } catch { /* native picker may already be open */ }
    }
  }
});
document.getElementById("weekInput").addEventListener("change", (event) => {
  setWeek(mondayFromWeekValue(event.target.value));
  document.getElementById("weekPicker").hidden = true;
  document.getElementById("weekButton").setAttribute("aria-expanded", "false");
});
document.getElementById("previousWeek").addEventListener("click", () => setWeek(addDays(selectedWeek, -7)));
document.getElementById("nextWeek").addEventListener("click", () => setWeek(addDays(selectedWeek, 7)));
document.addEventListener("click", (event) => {
  const wrap = document.querySelector(".week-picker-wrap");
  if (!wrap.contains(event.target)) {
    document.getElementById("weekPicker").hidden = true;
    document.getElementById("weekButton").setAttribute("aria-expanded", "false");
  }
});

["staffNurse", "staffPn", "staffHp"].forEach((id) => document.getElementById(id).addEventListener("change", (event) => {
  staff[id === "staffNurse" ? "nurse" : id === "staffPn" ? "pn" : "hp"] = clampNumber(event.target.value);
  writeStorage(STORAGE.staff, staff);
  lastCalculated = false;
  render();
}));
document.getElementById("calculateButton").addEventListener("click", calculateAndShow);
document.getElementById("saveRecord").addEventListener("click", saveRecord);
document.getElementById("resetWeek").addEventListener("click", resetWeek);
document.getElementById("resetAll").addEventListener("click", resetAll);
document.getElementById("viewReport").addEventListener("click", openReport);
document.getElementById("closeModal").addEventListener("click", () => { document.getElementById("reportModal").hidden = true; });
document.getElementById("dismissReport").addEventListener("click", () => { document.getElementById("reportModal").hidden = true; });
document.getElementById("reportModal").addEventListener("click", (event) => { if (event.target.id === "reportModal") event.currentTarget.hidden = true; });
updateClock();
setInterval(updateClock, 30000);
render();