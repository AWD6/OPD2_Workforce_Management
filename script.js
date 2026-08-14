const DEFAULT_STAFF = { nurse: 7, pn: 2, hp: 2 };
const DAY_NAMES = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
const DAY_SHORT = ["จ", "อ", "พ", "พฤ", "ศ"];
const STORAGE = {
  staff: "careplan-staff-v2",
  weeks: "careplan-weeks-v2",
  records: "careplan-records-v2",
  schedules: "careplan-schedules-v1",
  monthlyCodes: "careplan-monthly-codes-v1"
};

const DEFAULT_ASSIGNMENT_STAFF = [
  { name: "มณีวรรณ", role: "HN", task: "ช่วยทั่วไป", time: "07:50–16:00", location: "", fire: "C1", cpr: "A" },
  { name: "ธิติสุดา", role: "Incharge", task: "คัดกรอง", time: "07:50–09:30", location: "", fire: "C2", cpr: "P1" },
  { name: "ปฏิพล", role: "RN", task: "คัดกรอง / นัด / แนะนำ Admit", time: "07:50–16:00", location: "ปภ. 2 พบแพทย์", fire: "C2", cpr: "P6" },
  { name: "ชยาภรณ์", role: "RN", task: "คัดกรอง / Treatment", time: "07:50–16:00", location: "", fire: "C2", cpr: "P3" },
  { name: "นาถฤดี", role: "RN", task: "Treatment / ช่วยทั่วไป", time: "07:50–16:00", location: "", fire: "C2", cpr: "P2" },
  { name: "วรารัตน์", role: "RN", task: "คัดกรอง / นัด / แนะนำ", time: "07:50–16:00", location: "ปภ. 2 ห้อง Cysto", fire: "C2", cpr: "P4" },
  { name: "จีรนันท์", role: "RN", task: "คัดกรอง / นัด / แนะนำ", time: "07:50–16:00", location: "ปภ. 2 คัดกรอง", fire: "C2", cpr: "P4" },
  { name: "อภิชาติ", role: "PN", task: "Treatment / ช่วยทั่วไป", time: "07:50–16:00", location: "", fire: "C3", cpr: "P5, P6" },
  { name: "รังรักษ์", role: "PN", task: "Float OPD 21 / ช่วยทั่วไป", time: "07:50–16:00", location: "ปภ. 1 ห้อง Cysto", fire: "C3", cpr: "P5, P6" },
  { name: "บุบผารัตน์", role: "HP", task: "เรียกพบแพทย์ / ช่วยทั่วไป", time: "07:45–13:00", location: "ปภ. 1 พบแพทย์", fire: "C3", cpr: "P5" },
  { name: "พิสมัย", role: "HP", task: "เรียกพบแพทย์ / ช่วยทั่วไป", time: "07:45–13:00", location: "ปภ. 1 คัดกรอง", fire: "C3", cpr: "P5" }
];
const BREAK_OPTIONS = ["11.00", "12.00", "12.30", "13.00"];
const ACTIVITY_OPTIONS = ["ปฏิบัติงาน", "VAC = ลา", "ประชุม/อบรม", "Float ออก", "เก็บชั่วโมง"];
const TRAINING_HOURS = ["1", "2", "3", "4", "5", "6", "7"];
const FLOAT_PERIODS = ["08.00 - 12.00 น.", "12.00 - 16.00 น.", "08.00 - 16.00 น."];
const FLOAT_NET_HOURS = { "08.00 - 12.00 น.": 4, "12.00 - 16.00 น.": 4, "08.00 - 16.00 น.": 7 };
const WORKDAY_TIMES = { 1: "07.50 - 16.00 น.", 2: "07.50 - 16.00 น.", 3: "07.45 - 16.00 น.", 4: "07.45 - 16.00 น.", 5: "07.50 - 16.00 น." };
const COLLECT_WORK_HOURS = 4;
const COLLECT_DEDUCTION_HOURS = 3;
function netFloatHours(period) { return FLOAT_NET_HOURS[period] || 4; }
function workTimeForDate(dateText) { const day = new Date(`${dateText}T00:00:00`).getDay(); return WORKDAY_TIMES[day] || WORKDAY_TIMES[1]; }
function isAutoWorkTime(value) { const text = String(value || "").trim(); return !text || /^(07[:.]45|07[:.]50)\s*[–-]\s*(13[:.]00|16[:.]00)(?:\s*น\.)?$/.test(text) || /^(07[:.]50)\s*[–-]\s*09[:.]30$/.test(text); }
function isMondayDate(dateText) { return new Date(`${dateText}T00:00:00`).getDay() === 1; }
function assignmentRowClass(person) { return person.activity === "VAC = ลา" ? "is-leave" : person.activity === "ประชุม/อบรม" ? "is-training" : person.activity === "เก็บชั่วโมง" ? "is-collect" : person.activity === "Float ออก" ? "is-float" : ""; }
function taskIsFloat(task) { return /float/i.test(String(task || "")); }
const LOCATION_OPTIONS = ["-", "ปภ.1 คัดกรอง", "ปภ.1 พบแพทย์", "ปภ.1 ห้อง Cysto", "ปภ.2 คัดกรอง", "ปภ.2 พบแพทย์", "ปภ.2 ห้อง Cysto"];
const FIRE_CODE_OPTIONS = ["C1 สื่อสาร/ประสานงาน", "C2 เคลื่อนย้าย", "C3 ดับเพลิง"];
const CPR_CODE_OPTIONS = ["A ตามแพทย์/ประสานงาน", "P1 ควบคุมสั่งการ", "P2 AED/Defibrillator", "P3 สารน้ำ/ยา/เจาะเลือด", "P4 บันทึก CPR", "P5 ทางเดินหายใจ", "P6 chest compression"];
const TASK_OPTIONS = ["ช่วยทั่วไป", "คัดกรอง", "นัด/แนะนำ", "นัดแนะนำ/Admit", "Treatment", "Cysto", "ช่วย Cysto", "เรียกพบแพทย์", "Float OPD 3", "Float OPD 10", "Float OPD 21", "Float OR Minor", "อื่นๆ"];
function normalizeTaskName(task) {
  const value = String(task || "").trim();
  if (["นัด/แนะนำ Admit", "นัด / แนะนำ Admit", "นัดแนะนำ / Admit"].includes(value)) return "นัดแนะนำ/Admit";
  return value;
}
function normalizeCodeValues(value, options) {
  const source = Array.isArray(value) ? value : String(value || "").split(/\s*(?:·|,|\|)\s*/).filter(Boolean);
  return [...new Set(source.map((item) => { const token = String(item || "").trim(); return options.find((option) => option === token || option.startsWith(token)) || null; }).filter(Boolean))];
}
function syncPersonCodeState(person, field, options) {
  const key = `${field}Codes`;
  const source = Array.isArray(person[key]) ? person[key] : (person[`${field}Label`] || person[field]);
  const values = normalizeCodeValues(source, options);
  person[key] = values;
  person[`${field}Label`] = values.join(" · ");
  person[field] = values.map((value) => value.split(" ")[0]).join(", ");
  return values;
}
function codeToggleHtml(index, field, options, selectedValues) {
  return options.map((option) => `<button type="button" class="code-toggle ${selectedValues.includes(option) ? "is-active" : ""}" data-code-toggle="${index}" data-code-type="${field}" data-code-value="${escapeHtml(option)}" title="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("");
}
let assignmentDate = dateKey(new Date());
let assignmentStaff = readStorage(STORAGE.schedules, {});
let monthlyCodes = readStorage(STORAGE.monthlyCodes, {});
let currentAssignments = loadAssignments(assignmentDate);

function monthKey(dateText) { return String(dateText || assignmentDate).slice(0, 7); }
function cloneDefaultAssignments() { return DEFAULT_ASSIGNMENT_STAFF.map((person) => ({ ...person, time: WORKDAY_TIMES[1], location: "-", status: "ปฏิบัติงาน", activity: "ปฏิบัติงาน", activityValue: "", break: "12.00", arrival: "", note: "", taskOverride: false, activities: [{ task: normalizeTaskName(person.task), time: WORKDAY_TIMES[1] }] })); }
function loadAssignments(dateText) {
  const saved = assignmentStaff[dateText];
  const defaults = cloneDefaultAssignments();
  const result = saved?.length ? saved.map((item, index) => ({ ...defaults[index], ...item, activities: (item.activities?.length ? item.activities : [{ task: item.task || defaults[index].task, time: item.time || defaults[index].time }]).map((activity) => ({ ...activity, task: normalizeTaskName(activity.task) })) })) : defaults;
  if (saved?.length) result.forEach((person, index) => { if (!saved[index]?.locationLocked) person.location = "-"; });
  const defaultTime = workTimeForDate(dateText);
  result.forEach((person) => {
    syncPersonCodeState(person, "fire", FIRE_CODE_OPTIONS);
    syncPersonCodeState(person, "cpr", CPR_CODE_OPTIONS);
    if (person.name === "มณีวรรณ") { person.cprCodes = ["A ตามแพทย์/ประสานงาน"]; syncPersonCodeState(person, "cpr", CPR_CODE_OPTIONS); }
    if (!person.timeLocked && isAutoWorkTime(person.time)) person.time = defaultTime;
    person.activities = (person.activities || []).map((activity) => (!activity.timeLocked && isAutoWorkTime(activity.time)) ? { ...activity, time: defaultTime } : activity);
  });
  return result;
}
function roleKeyForAssignment(person) { return person.role === "PN" ? "pn" : person.role === "HP" ? "hp" : "nurse"; }
function roleLabel(role) { return { nurse: "Nurse", pn: "PN", hp: "HP" }[role] || role.toUpperCase(); }
function roleSuffix(role) { return role === "nurse" ? "Nurse" : role === "pn" ? "Pn" : "Hp"; }
function syncAssignmentsToWorkforce() {
  const plan = currentPlans.find((item) => dateKey(new Date(item.date)) === assignmentDate);
  if (!plan || plan.holiday) return;
  const allocation = { leaveNurse: 0, leavePn: 0, leaveHp: 0, trainingHours: 0, floatHours: 0, collectHours: 0, collectWorkHours: 0 };
  const roleActivity = { nurse: { training: 0, float: 0, collect: 0 }, pn: { training: 0, float: 0, collect: 0 }, hp: { training: 0, float: 0, collect: 0 } };
  currentAssignments.forEach((person) => {
    const role = roleKeyForAssignment(person);
    const activity = person.activity || "ปฏิบัติงาน";
    const suffix = roleSuffix(role);
    if (activity === "VAC = ลา") allocation[`leave${suffix}`] += 1;
    if (activity === "ประชุม/อบรม") { const hours = Number(person.activityValue) || 1; allocation.trainingHours += hours; roleActivity[role].training += hours; }
    if (activity === "Float ออก") { const hours = netFloatHours(person.activityValue); allocation.floatHours += hours; roleActivity[role].float += hours; }
    if (activity === "เก็บชั่วโมง") { allocation.collectHours += COLLECT_DEDUCTION_HOURS; allocation.collectWorkHours += COLLECT_WORK_HOURS; roleActivity[role].collect += COLLECT_WORK_HOURS; }
  });
  plan.allocation = allocation;
  plan.roleActivity = roleActivity;
  saveCurrentWeek();
}
function weekAssignmentDates() { return currentPlans.map((plan) => dateKey(new Date(plan.date))); }
function saveAssignments() { assignmentStaff[assignmentDate] = currentAssignments; writeStorage(STORAGE.schedules, assignmentStaff); }
function syncMondayTaskDefaults() {
  if (!currentPlans?.length) return;
  const mondayKey = dateKey(new Date(currentPlans[0].date));
  const mondayAssignments = loadAssignments(mondayKey);
  currentPlans.slice(1).forEach((plan) => {
    const targetKey = dateKey(new Date(plan.date));
    const targetAssignments = loadAssignments(targetKey);
    let changed = false;
    mondayAssignments.forEach((source, index) => {
      const target = targetAssignments[index];
      if (!target || target.taskOverride === true) return;
      target.activities = (source.activities || []).map((activity) => ({ ...activity, time: workTimeForDate(targetKey), timeLocked: false }));
      target.task = source.task;
      changed = true;
    });
    if (changed) assignmentStaff[targetKey] = targetAssignments;
  });
  writeStorage(STORAGE.schedules, assignmentStaff);
}
function syncAllAssignmentsToWorkforce() {
  const previousDate = assignmentDate;
  saveAssignments();
  currentPlans.forEach((plan) => {
    if (plan.holiday) return;
    assignmentDate = dateKey(new Date(plan.date));
    currentAssignments = loadAssignments(assignmentDate);
    syncAssignmentsToWorkforce();
  });
  assignmentDate = previousDate;
  currentAssignments = loadAssignments(assignmentDate);
}
function getMonthlyCodes() { return monthlyCodes[monthKey(assignmentDate)] || { fire: "C2", cpr: "P1" }; }
function saveMonthlyCodes() { monthlyCodes[monthKey(assignmentDate)] = { fire: document.getElementById("monthlyFireCode").value.trim() || "C2", cpr: document.getElementById("monthlyCprCode").value.trim() || "P1" }; writeStorage(STORAGE.monthlyCodes, monthlyCodes); }
function dateThaiLong(dateText) { const date = new Date(`${dateText}T00:00:00`); const days = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"]; const months = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]; return `วัน${days[date.getDay()]}ที่ ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`; }
function thaiMonthName(date) { return ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"][date.getMonth()]; }
function thaiPdfFilename(monday) {
  const start = getMonday(monday);
  const end = addDays(start, 4);
  const startYear = start.getFullYear() + 543;
  const endYear = end.getFullYear() + 543;
  const sameMonth = start.getMonth() === end.getMonth() && startYear === endYear;
  const dateRange = sameMonth
    ? `${start.getDate()} - ${end.getDate()} ${thaiMonthName(end)} ${endYear}`
    : `${start.getDate()} ${thaiMonthName(start)} ${startYear} - ${end.getDate()} ${thaiMonthName(end)} ${endYear}`;
  return `ตารางจ่ายงาน OPD 2 ประจำวันที่ ${dateRange}.pdf`;
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", "\"":"&quot;" }[char])); }

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
    allocation: { leaveNurse: 0, leavePn: 0, leaveHp: 0, trainingHours: 0, floatHours: 0, collectHours: 0, collectWorkHours: 0 },
    roleActivity: {
      nurse: { training: 0, float: 0, collect: 0 },
      pn: { training: 0, float: 0, collect: 0 },
      hp: { training: 0, float: 0, collect: 0 }
    }
  }));
}

function normalizePlan(plan, index, monday) {
  const legacy = plan.allocation || {};
  const roleActivity = plan.roleActivity || {};
  const normalized = {
    ...makeDefaultPlans(monday)[index],
    ...plan,
    date: plan.date || addDays(monday, index).toISOString(),
    allocation: {
      leaveNurse: clampNumber(legacy.leaveNurse) + clampNumber(legacy.leaveHn),
      leavePn: clampNumber(legacy.leavePn),
      leaveHp: clampNumber(legacy.leaveHp),
      trainingHours: clampNumber(legacy.trainingHours ?? legacy.trainingPeople),
      floatHours: clampNumber(legacy.floatHours),
      collectHours: clampNumber(legacy.collectHours ?? legacy.collectPeople ?? legacy.floatPeople),
      collectWorkHours: clampNumber(legacy.collectWorkHours ?? legacy.collectHours)
    },
    roleActivity: {
      nurse: { training: clampNumber(roleActivity.nurse?.training) + clampNumber(roleActivity.hn?.training), float: clampNumber(roleActivity.nurse?.float) + clampNumber(roleActivity.hn?.float), collect: clampNumber(roleActivity.nurse?.collect) + clampNumber(roleActivity.hn?.collect) },
      pn: { training: clampNumber(roleActivity.pn?.training), float: clampNumber(roleActivity.pn?.float), collect: clampNumber(roleActivity.pn?.collect) },
      hp: { training: clampNumber(roleActivity.hp?.training), float: clampNumber(roleActivity.hp?.float), collect: clampNumber(roleActivity.hp?.collect) }
    }
  };
  syncActivityTotals(normalized);
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

function activityTotals(plan) {
  return ["training", "float", "collect"].reduce((totals, activity) => {
    totals[activity] = ["nurse", "pn", "hp"].reduce((sum, role) => sum + clampNumber(plan.roleActivity?.[role]?.[activity]), 0);
    return totals;
  }, { training: 0, float: 0, collect: 0 });
}

function syncActivityTotals(plan) {
  return {
    training: plan.allocation.trainingHours || 0,
    float: plan.allocation.floatHours || 0,
    collect: plan.allocation.collectWorkHours ?? plan.allocation.collectHours ?? 0
  };
}

function calculateProduct(plan) {
  if (plan.holiday) return null;
  const a = plan.allocation;
  const baseCapacityHours = totalStaff() * 7;
  const leaveHours = (a.leaveNurse + a.leavePn + a.leaveHp) * 7;
  const removedHours = leaveHours + a.trainingHours + a.floatHours + a.collectHours;
  return Math.round((demand(plan) / Math.max(baseCapacityHours - removedHours, 1)) * 100);
}

function statusOf(product) {
  if (product === null || product === undefined) return "neutral";
  if (product > 115) return "high";
  if (product < 85) return "low";
  return "healthy";
}

function statusLabel(status) {
  return { neutral: "ยังไม่คำนวณ", healthy: "บุคลากรเหมาะสมกับงาน", low: "บุคลากรมากกว่างาน", high: "งานมากกว่าบุคลากร" }[status];
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
  renderAssignments();
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

function staffingRoleCell(role, plan) {
  const values = plan.roleActivity?.[role] || { training: 0, float: 0, collect: 0 };
  const leave = plan.allocation?.[`leave${roleSuffix(role)}`] || 0;
  return `<div class="allocation-role-cell role-${role}"><strong>${roleLabel(role)}</strong><span><em>ลา</em><b>${leave}<small> คน</small></b></span><span><em>อ/ป</em><b>${values.training}<small> ชม.</small></b></span><span><em>Float</em><b>${values.float}<small> ชม.</small></b></span><span><em>เก็บ</em><b>${values.collect}<small> ชม.</small></b></span></div>`;
}
function renderStaffingRows() {
  const container = document.getElementById("staffingRows");
  container.innerHTML = currentPlans.map((plan, index) => `<div class="table-row staffing-row staffing-columns ${plan.holiday ? "is-holiday" : ""}">
    <div class="day-cell"><span class="day-initial">${DAY_SHORT[index]}</span><span><b class="day-name">${plan.label}</b><small class="day-date">${toThaiDate(new Date(plan.date))}</small></span></div>
    ${["nurse", "pn", "hp"].map((role) => staffingRoleCell(role, plan)).join("")}
  </div>`).join("");
}

function assignmentSelect(id, options, value) { return `<select id="${id}">${options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option || "—")}</option>`).join("")}</select>`; }
function renderAssignments() {
  const dayButtons = document.getElementById("assignmentDayButtons");
  if (!dayButtons) return;
  document.getElementById("assignmentWeekLabel").textContent = weekLabel(selectedWeek);
  dayButtons.innerHTML = currentPlans.map((plan) => { const key = dateKey(new Date(plan.date)); return `<button type="button" class="assignment-day-button ${key === assignmentDate ? "is-active" : ""} ${plan.holiday ? "is-holiday" : ""}" data-assignment-date="${key}"><b>${plan.label}</b><small>${toThaiDate(new Date(plan.date), false)}</small></button>`; }).join("");
  dayButtons.querySelectorAll("[data-assignment-date]").forEach((button) => button.addEventListener("click", () => { saveAssignments(); assignmentDate = button.dataset.assignmentDate; currentAssignments = loadAssignments(assignmentDate); renderAssignments(); }));
  const codes = getMonthlyCodes();
  document.getElementById("monthlyFireCode").value = codes.fire;
  document.getElementById("monthlyCprCode").value = codes.cpr;
  const plan = currentPlans.find((item) => dateKey(new Date(item.date)) === assignmentDate);
  document.getElementById("dailyForecast").value = plan ? demand(plan) : "";
  document.getElementById("scheduleNote").value = currentAssignments[0]?.scheduleNote || "";
  document.getElementById("assignmentRows").innerHTML = currentAssignments.map((person, index) => `<div class="assignment-row ${assignmentRowClass(person)}">
    <div class="assignment-person"><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.role)}</small></div>
    <div class="activity-cell"><span class="work-status">ปฏิบัติงาน</span><div class="activity-buttons">${ACTIVITY_OPTIONS.slice(1).map((option) => `<button type="button" class="activity-button ${person.activity === option ? "is-active" : ""}" data-activity="${index}" data-value="${escapeHtml(option)}">${escapeHtml(option.split(" = ")[0])}</button>`).join("")}</div>${person.activity === "ประชุม/อบรม" ? assignmentSelect(`activity-value-${index}`, TRAINING_HOURS, person.activityValue || "1") + `<small>ชม.</small>` : person.activity === "Float ออก" ? assignmentSelect(`activity-value-${index}`, FLOAT_PERIODS, person.activityValue || FLOAT_PERIODS[0]) : ""}</div>
    <div>${assignmentSelect(`break-${index}`, BREAK_OPTIONS, person.break)}</div>
    <div class="tasks-cell">${person.activities.map((activity, taskIndex) => { const hasCustomTask = !TASK_OPTIONS.includes(activity.task) || activity.task === "อื่นๆ"; const floatClass = taskIsFloat(activity.task) ? "float-task" : ""; return `<div class="task-line ${hasCustomTask ? "has-custom-task" : ""} ${floatClass}"><span class="task-number">${taskIndex + 1}.</span>${assignmentSelect(`task-${index}-${taskIndex}`, TASK_OPTIONS, TASK_OPTIONS.includes(activity.task) ? activity.task : "อื่นๆ")}${hasCustomTask ? `<input id="custom-task-${index}-${taskIndex}" value="${escapeHtml(TASK_OPTIONS.includes(activity.task) ? "" : activity.task)}" placeholder="กรอกหน้าที่อื่นๆ" />` : ""}<input id="time-${index}-${taskIndex}" value="${escapeHtml(activity.time)}" aria-label="เวลาหน้าที่" placeholder="เวลา" />${taskIndex > 0 ? `<button type="button" class="remove-task-button" data-remove-task="${index}" data-task-index="${taskIndex}" aria-label="ลบหน้าที่">ลบ</button>` : ""}</div>`; }).join("")}<button type="button" class="add-task-button" data-add-task="${index}">+ เพิ่มหน้าที่</button></div>
    <div class="location-buttons">${LOCATION_OPTIONS.map((location) => `<button type="button" class="location-button ${person.location === location ? "is-active" : ""}" data-location="${index}" data-value="${escapeHtml(location)}">${escapeHtml(location)}</button>`).join("")}</div>
    <div class="code-cell"><div class="code-group"><small>อัคคีภัย</small><div class="code-toggle-list">${codeToggleHtml(index, "fire", FIRE_CODE_OPTIONS, person.fireCodes || [])}</div></div><div class="code-group"><small>CPR</small><div class="code-toggle-list">${codeToggleHtml(index, "cpr", CPR_CODE_OPTIONS, person.cprCodes || [])}</div></div></div>
    <div><input id="arrival-${index}" value="${escapeHtml(person.arrival)}" placeholder="เวลา / เซ็นชื่อ" /><input id="note-${index}" value="${escapeHtml(person.note)}" placeholder="หมายเหตุ" /></div>
  </div>`).join("");
  currentAssignments.forEach((person, index) => {
    document.querySelectorAll(`[data-activity="${index}"]`).forEach((button) => button.addEventListener("click", () => { person.activity = button.dataset.value; person.activityValue = person.activity === "ประชุม/อบรม" ? "1" : person.activity === "Float ออก" ? FLOAT_PERIODS[0] : ""; syncAssignmentsToWorkforce(); saveAssignments(); render(); }));
    ["break", "activity-value"].forEach((field) => document.getElementById(`${field}-${index}`)?.addEventListener("change", (event) => { person[field === "activity-value" ? "activityValue" : field] = event.target.value; syncAssignmentsToWorkforce(); saveAssignments(); render(); }));
    document.querySelectorAll(`[data-location="${index}"]`).forEach((button) => button.addEventListener("click", () => { person.location = button.dataset.value; person.locationLocked = true; saveAssignments(); renderAssignments(); }));
    document.querySelector(`[data-add-task="${index}"]`)?.addEventListener("click", () => { person.activities.push({ task: "อื่นๆ", time: "", timeLocked: true }); person.taskOverride = !isMondayDate(assignmentDate); saveAssignments(); if (isMondayDate(assignmentDate)) syncMondayTaskDefaults(); renderAssignments(); });
    document.querySelectorAll(`[data-remove-task="${index}"]`).forEach((button) => button.addEventListener("click", () => { const taskIndex = Number(button.dataset.taskIndex); if (taskIndex <= 0 || taskIndex >= person.activities.length) return; person.activities.splice(taskIndex, 1); person.taskOverride = !isMondayDate(assignmentDate); saveAssignments(); if (isMondayDate(assignmentDate)) syncMondayTaskDefaults(); renderAssignments(); }));
    person.activities.forEach((activity, taskIndex) => {
      document.getElementById(`task-${index}-${taskIndex}`)?.addEventListener("change", (event) => { activity.task = event.target.value === "อื่นๆ" ? "อื่นๆ" : event.target.value; person.taskOverride = !isMondayDate(assignmentDate); saveAssignments(); if (isMondayDate(assignmentDate)) syncMondayTaskDefaults(); renderAssignments(); });
      document.getElementById(`custom-task-${index}-${taskIndex}`)?.addEventListener("change", (event) => { activity.task = event.target.value; person.taskOverride = !isMondayDate(assignmentDate); saveAssignments(); if (isMondayDate(assignmentDate)) syncMondayTaskDefaults(); renderAssignments(); });
      document.getElementById(`time-${index}-${taskIndex}`)?.addEventListener("change", (event) => { activity.time = event.target.value; activity.timeLocked = true; saveAssignments(); });
    });
    document.querySelectorAll(`[data-code-toggle="${index}"]`).forEach((button) => button.addEventListener("click", () => { const field = button.dataset.codeType; const key = `${field}Codes`; const options = field === "fire" ? FIRE_CODE_OPTIONS : CPR_CODE_OPTIONS; const values = Array.isArray(person[key]) ? [...person[key]] : normalizeCodeValues(person[`${field}Label`] || person[field], options); const value = button.dataset.codeValue; const nextValues = values.includes(value) ? values.filter((item) => item !== value) : [...values, value]; person[key] = nextValues; syncPersonCodeState(person, field, options); saveAssignments(); renderAssignments(); }));
    ["arrival", "note"].forEach((field) => document.getElementById(`${field}-${index}`)?.addEventListener("change", (event) => { person[field] = event.target.value; saveAssignments(); }));
  });
}
function formatActivity(person) { const label = person.activity || "ปฏิบัติงาน"; return label === "ประชุม/อบรม" ? `${label} ${person.activityValue || 1} ชม.` : label === "Float ออก" ? `${label} ${person.activityValue || "08.00 - 12.00 น."} · สุทธิ ${netFloatHours(person.activityValue)} ชม.` : label === "เก็บชั่วโมง" ? `${label} เลิกเที่ยง · สุทธิ 4 ชม.` : label; }
function taskText(person) { return person.activities.map((activity, index) => `${index + 1}. ${activity.task}${activity.time ? ` (${activity.time})` : ""}`).join("<br>"); }
function printCodeLegendHtml() { return `<div class="print-code-legend"><strong>คำอธิบาย Code และสถานที่</strong><span><b>Code อัคคีภัย</b> C1 สื่อสาร/ประสานงาน · C2 เคลื่อนย้าย · C3 ดับเพลิง</span><span><b>Code CPR</b> A ตามแพทย์/ประสานงาน · P1 ควบคุมสั่งการ · P2 AED/Defibrillator · P3 สารน้ำ/ยา/เจาะเลือด · P4 บันทึก CPR · P5 ทางเดินหายใจ · P6 chest compression</span><span><b>A ตามแพทย์/ประสานงาน:</b> OPD 110 โทร 34605 · OPD 10 โทร 35750–35760 · RR team โทร 38799 · ER โทร 36333 · เปล/เคลื่อนย้าย โทร 35692–35693</span></div>`; }
function weeklyDayHtml(plan, assignments) {
  const leaveCount = assignments.filter((person) => person.activity === "VAC = ลา").length;
  const specialCount = assignments.filter((person) => person.activity !== "ปฏิบัติงาน" && person.activity !== "VAC = ลา").length;
  const rows = assignments.map((person) => { const isLeave = person.activity === "VAC = ลา"; return `<tr class="${isLeave ? "leave-row" : ""}"><td>${isLeave ? "VACATION" : `<b>${escapeHtml(person.name)}</b><br><small>${escapeHtml(person.role)}</small>`}</td><td><span class="status-pill">${escapeHtml(formatActivity(person))}</span><br>พัก ${escapeHtml(person.break)} น.</td><td>${isLeave ? "ตัดออกจากกำลังคน" : taskText(person)}</td><td>${isLeave ? "—" : escapeHtml(person.location || "-")}</td><td>${escapeHtml(person.fireLabel || person.fire || "—")}<br>${escapeHtml(person.cprLabel || person.cpr || "—")}</td><td>${escapeHtml(person.arrival || "")}${person.note ? `<br>${escapeHtml(person.note)}` : ""}</td></tr>`; }).join("");
  const product = calculateProduct(plan);
  const a = plan.allocation;
  const roleSummary = ["nurse", "pn", "hp"].map((role) => { const values = plan.roleActivity?.[role] || { training: 0, float: 0, collect: 0 }; return `<span><b>${roleLabel(role)}</b> ลา ${a[`leave${roleSuffix(role)}`] || 0} · อ/ป ${values.training} · Float ${values.float} · เก็บ ${values.collect} ชม.</span>`; }).join("");
  return `<section class="print-day"><div class="print-day-head"><div><h2>${plan.label} · ${toThaiDate(new Date(plan.date))}</h2><p>ตารางจ่ายงานบุคลากรประจำวัน · ข้อมูลจาก Workforce Management</p></div><div class="print-day-kpis"><span><b>${demand(plan)}</b>ผู้ป่วยคาดการณ์</span><span><b>${product === null ? "—" : `${product}%`}</b>Product</span><span><b>${leaveCount}</b>ลา</span><span><b>${specialCount}</b>กิจกรรม</span></div></div><div class="print-workforce-summary">${roleSummary}</div><table><thead><tr><th>ชื่อ / ตำแหน่ง</th><th>กิจกรรม / พัก</th><th>หน้าที่ / เวลา</th><th>ปภ.1/2</th><th>Code อัคคีภัย / CPR</th><th>เวลามา / เซ็นชื่อ / หมายเหตุ</th></tr></thead><tbody>${rows}</tbody></table>${printCodeLegendHtml()}</section>`;
}
function buildWeeklyPrintSchedule() {
  saveAssignments();
  const activePlans = currentPlans.filter((plan) => !plan.holiday);
  const note = document.getElementById("scheduleNote").value || "—";
  const days = activePlans.map((plan) => weeklyDayHtml(plan, loadAssignments(dateKey(new Date(plan.date))))).join("");
  const totalForecast = activePlans.reduce((sum, plan) => sum + demand(plan), 0);
  return `<div id="printSchedule" class="print-schedule weekly-print"><div class="print-cover"><div><h1>ตารางจ่ายงานรายสัปดาห์</h1><p>${weekLabel(selectedWeek)} · OPD 2 Workforce Management</p><p>จ่ายงานรายบุคคล → เชื่อมกำลังคน → ตรวจสอบ Product</p></div><div class="print-kpis"><div class="print-kpi"><b>${activePlans.length}</b><span>วันทำการ</span></div><div class="print-kpi"><b>${totalForecast}</b><span>ผู้ป่วยคาดการณ์</span></div><div class="print-kpi"><b>${totalStaff()}</b><span>บุคลากร</span></div></div></div><div class="print-meta"><b>หมายเหตุส่วนกลาง:</b> ${escapeHtml(note)} &nbsp; | &nbsp; <b>Code รายเดือน:</b> ${escapeHtml(getMonthlyCodes().fire)} / ${escapeHtml(getMonthlyCodes().cpr)}</div>${days}<div class="print-notes"><div class="print-note"><b>คำอธิบาย Code</b><br>อัคคีภัย: C1 สื่อสาร/ประสานงาน · C2 เคลื่อนย้าย · C3 ดับเพลิง<br>CPR: P1 ควบคุมสั่งการ · P2 AED/Defibrillator · P3 สารน้ำ/ยา/เจาะเลือด · P4 บันทึก CPR · P5 ทางเดินหายใจ · P6 chest compression</div><div class="print-footer"><b>เบอร์ติดต่อสำคัญ</b><br>OPD 110: 34605 · OPD 10: 35750–35760 · RR team: 38799<br>ER: 36333 · เปล/เคลื่อนย้าย: 35692–35693</div></div></div>`;
}
async function generateSchedulePdf() {
  saveMonthlyCodes();
  saveAssignments();
  const PdfConstructor = window.jspdf?.jsPDF;
  if (typeof html2canvas !== "function" || typeof PdfConstructor !== "function") { showToast("ไม่พบส่วนสร้าง PDF กรุณาตรวจสอบไฟล์ PDF ในโปรเจกต์"); return; }
  const activePlans = currentPlans.filter((plan) => !plan.holiday);
  if (!activePlans.length) { showToast("สัปดาห์นี้ไม่มีวันทำการให้สร้าง PDF"); return; }
  const filename = thaiPdfFilename(selectedWeek);
  const pdf = new PdfConstructor({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  const margin = 7;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2;
  const exportHost = document.createElement("div");
  exportHost.className = "download-pdf-host";
  Object.assign(exportHost.style, { position: "absolute", left: "0", top: `${window.scrollY}px`, width: "190mm", background: "#fff", zIndex: "9999", visibility: "visible", opacity: "1" });
  document.body.appendChild(exportHost);
  showToast("กำลังสร้างไฟล์ PDF A4 และดาวน์โหลดลงเครื่อง…");
  try {
    for (let index = 0; index < activePlans.length; index += 1) {
      const plan = activePlans[index];
      if (index > 0) pdf.addPage("a4", "portrait");
      exportHost.innerHTML = `<div class="print-schedule weekly-print download-pdf"><div class="print-cover"><div><h1>ตารางจ่ายงานรายสัปดาห์</h1><p>${weekLabel(selectedWeek)} · OPD 2 Workforce Management</p></div><div class="print-kpis"><div class="print-kpi"><b>${activePlans.length}</b><span>วันทำการ</span></div><div class="print-kpi"><b>${totalStaff()}</b><span>บุคลากร</span></div></div></div>${weeklyDayHtml(plan, loadAssignments(dateKey(new Date(plan.date))))}</div>`;
      const report = exportHost.firstElementChild;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const canvas = await html2canvas(report, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff", logging: false, width: report.scrollWidth, windowWidth: report.scrollWidth });
      const image = canvas.toDataURL("image/jpeg", 0.96);
      const usableHeight = pageHeight - margin * 2;
      const scale = Math.min(contentWidth / canvas.width, usableHeight / canvas.height);
      const imageWidth = canvas.width * scale;
      const imageHeight = canvas.height * scale;
      pdf.addImage(image, "JPEG", margin + (contentWidth - imageWidth) / 2, margin, imageWidth, imageHeight, undefined, "FAST");
    }
    pdf.save(filename);
    showToast("ดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว");
  } catch (error) {
    console.error(error);
    showToast("สร้าง PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
  } finally {
    exportHost.remove();
  }
}
function setupAssignmentEvents() {
  if (!document.getElementById("assignmentDayButtons")) return;
  ["monthlyFireCode", "monthlyCprCode"].forEach((id) => document.getElementById(id).addEventListener("change", () => { saveMonthlyCodes(); renderAssignments(); }));
  document.getElementById("dailyForecast").addEventListener("change", (event) => { const plan = currentPlans.find((item) => dateKey(new Date(item.date)) === assignmentDate); if (plan) { plan.scheduled = clampNumber(event.target.value); saveCurrentWeek(); render(); } });
  document.getElementById("scheduleNote").addEventListener("change", (event) => { currentAssignments.forEach((person) => { person.scheduleNote = event.target.value; }); saveAssignments(); });
  document.getElementById("applyDefaultAssignments").addEventListener("click", () => { currentAssignments = loadAssignments(assignmentDate); syncAssignmentsToWorkforce(); saveAssignments(); render(); showToast("ใช้ค่าเริ่มต้นหน้าที่แล้ว"); });
  document.getElementById("generatePdfButton").addEventListener("click", generateSchedulePdf);
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
  document.getElementById("averageDetail").textContent = average === null ? "กดคำนวณเพื่อดูภาพรวม" : average > 115 ? "มีวันที่ต้องตรวจสอบ" : "แผนอยู่ในเกณฑ์ปลอดภัย";
  const breakdown = document.getElementById("staffBreakdown");
  breakdown.innerHTML = ["nurse", "pn", "hp"].map((role) => {
    const label = roleLabel(role);
    const leave = currentPlans.reduce((sum, plan) => sum + (plan.allocation[`leave${roleSuffix(role)}`] || 0), 0);
    const values = currentPlans.reduce((totals, plan) => {
      const item = plan.roleActivity?.[role] || { training: 0, float: 0, collect: 0 };
      totals.training += item.training; totals.float += item.float; totals.collect += item.collect;
      return totals;
    }, { training: 0, float: 0, collect: 0 });
    return `<div><span>${label} · ลา ${leave} คน</span><b>อ/ป ${values.training} · Float ${values.float} · เก็บ ${values.collect} ชม.</b></div>`;
  }).join("");
  const high = active.filter((plan) => statusOf(calculateProduct(plan)) === "high");
  const alertBox = document.getElementById("alertBox");
  alertBox.hidden = !lastCalculated || high.length === 0;
  document.getElementById("alertText").textContent = `มี ${high.length} วันที่ภาระงานสูงกว่าความพร้อมของทีม ควรตรวจสอบก่อนยืนยันแผน`;
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
    const legacyTraining = record.trainingHours ?? record.trainingPeople ?? 0;
    const legacyFloat = record.floatHours ?? record.floatPeople ?? 0;
    const legacyCollect = record.collectHours ?? record.floatPeople ?? 0;
    return `<div class="record-item">
    <div class="record-week"><strong>${record.week}</strong><span>บันทึกเมื่อ ${record.savedAt}</span></div>
    <div class="record-summary">เจ้าหน้าที่ ${recordStaff.total} คน (Nurse ${recordStaff.nurse} · PN ${recordStaff.pn} · HP ${recordStaff.hp})<br />ลา ${record.leave || 0} คน · อบรม/ประชุม ${legacyTraining} ชม. · Float ${legacyFloat} ชม. · เก็บชั่วโมง ${legacyCollect} ชม.</div>
    <div class="record-metric"><strong>${record.average === null ? "—" : `${record.average}%`}</strong><span>${record.status}</span></div>
    <button class="delete-record" data-delete-record="${index}" aria-label="ลบข้อมูลบันทึก">${trashIcon()}</button>
    ${record.plans?.length ? `<details class="record-details"><summary>ดูรายละเอียด Product ผู้รับบริการ และการจัดสรรรายวัน</summary>${recordDetailsHtml(record)}</details>` : ""}
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
  return `<div class="record-detail-table"><table><thead><tr><th>วัน / วันที่</th><th>ผู้รับบริการ</th><th>Product</th><th>บุคลากรประจำ</th><th>ลา Nurse / PN / HP</th><th>อบรม/ประชุม</th><th>Float ออก</th><th>เก็บชั่วโมง</th><th>กิจกรรมแยกตำแหน่ง</th></tr></thead><tbody>${record.plans.map((plan) => {
    const a = plan.allocation;
    const roleText = ["nurse", "pn", "hp"].map((role) => {
      const label = roleLabel(role);
      const values = plan.roleActivity?.[role] || { training: 0, float: 0, collect: 0 };
      return `${label}: อ/ป ${values.training} · Float ${values.float} · เก็บ ${values.collect} ชม.`;
    }).join("<br />");
    return `<tr><td><strong>${plan.label}</strong> · ${toThaiDate(new Date(plan.date))}</td><td>${plan.holiday ? "วันหยุด" : demand(plan)} ราย</td><td>${plan.product === null ? "—" : `${plan.product}%`}</td><td>${recordStaff.nurse} / ${recordStaff.pn} / ${recordStaff.hp}</td><td>${a.leaveNurse} / ${a.leavePn} / ${a.leaveHp} คน</td><td>${a.trainingHours || 0} ชม.</td><td>${a.floatHours || 0} ชม.</td><td>${a.collectWorkHours ?? a.collectHours ?? 0} ชม.</td><td>${roleText}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function saveRecord() {
  const active = currentPlans.filter((plan) => !plan.holiday);
  const products = active.map(calculateProduct).filter((value) => value !== null);
  const average = products.length ? Math.round(products.reduce((sum, value) => sum + value, 0) / products.length) : null;
  const leave = currentPlans.reduce((sum, plan) => sum + plan.allocation.leaveNurse + plan.allocation.leavePn + plan.allocation.leaveHp, 0);
  const trainingHours = currentPlans.reduce((sum, plan) => sum + syncActivityTotals(plan).training, 0);
  const floatHours = currentPlans.reduce((sum, plan) => sum + syncActivityTotals(plan).float, 0);
  const collectHours = currentPlans.reduce((sum, plan) => sum + (plan.allocation.collectWorkHours ?? plan.allocation.collectHours ?? 0), 0);
  const record = {
    week: weekLabel(selectedWeek),
    savedAt: new Date().toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }),
    leave, trainingHours, floatHours, collectHours, average,
    status: average === null ? "ยังไม่คำนวณ" : average > 115 ? "ต้องเฝ้าระวัง" : average < 85 ? "กำลังคนเหลือ" : "เหมาะสม",
    staff: { ...staff, total: totalStaff() },
    plans: currentPlans.map((plan) => ({ ...plan, allocation: { ...plan.allocation }, roleActivity: JSON.parse(JSON.stringify(plan.roleActivity)), product: calculateProduct(plan) }))
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
  document.getElementById("reportAverage").textContent = `${average}%`;
  document.getElementById("reportHealthy").textContent = `${healthy.length} วัน`;
  document.getElementById("reportAlerts").textContent = `${products.length - healthy.length} วัน`;
  document.getElementById("reportSummary").textContent = alerts.length ? `พบ ${alerts.length} วันที่ภาระงานสูงกว่าความพร้อมของทีม แนะนำตรวจสอบจำนวนคนลาและกิจกรรมที่ดึงคนออกจากงานประจำ` : "ทุกวันที่เปิดทำการมีความพร้อมอยู่ในช่วงที่เหมาะสมสำหรับการปฏิบัติงาน";
  document.getElementById("reportList").innerHTML = products.map(({ plan, product }) => `<div class="report-row is-${statusOf(product)}"><span>${plan.label} · ${toThaiDate(new Date(plan.date))}</span><span>${product}% · ${statusLabel(statusOf(product))}</span></div>`).join("");
  document.getElementById("reportModal").hidden = false;
}

function setWeek(monday) {
  saveCurrentWeek();
  saveAssignments();
  selectedWeek = getMonday(monday);
  currentPlans = loadWeek(selectedWeek);
  syncMondayTaskDefaults();
  const validDates = currentPlans.map((plan) => dateKey(new Date(plan.date)));
  if (!validDates.includes(assignmentDate)) assignmentDate = validDates[0];
  currentAssignments = loadAssignments(assignmentDate);
  syncAllAssignmentsToWorkforce();
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
setupAssignmentEvents();
syncMondayTaskDefaults();
syncAllAssignmentsToWorkforce();
render();
