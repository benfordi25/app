// ---------- DATE + REPORT ID ----------
function ukDate() {
  return new Date().toLocaleDateString("en-GB"); // dd/mm/yyyy
}

// Creates a NEW ID every time you save
function createReportId() {
  // CR-DDMMYYYY-HHMMSS-XXXXX (UK date + time + random)
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");

  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CR-${dd}${mm}${yyyy}-${hh}${mi}${ss}-${rand}`;
}

// ---------- SIGNATURE ----------
const canvas = document.getElementById("signature");
const ctx = canvas.getContext("2d");
let drawing = false;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  // Reset any existing scaling to avoid double-scaling after rotate/resize
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function getPoint(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function start(e) {
  e.preventDefault?.();
  drawing = true;
  ctx.beginPath();
  const p = getPoint(e);
  ctx.moveTo(p.x, p.y);
}

function move(e) {
  if (!drawing) return;
  e.preventDefault?.();
  const p = getPoint(e);

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";

  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

function end(e) {
  if (!drawing) return;
  e.preventDefault?.();
  drawing = false;
  saveSignature();
}

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", end);
canvas.addEventListener("mouseleave", end);

canvas.addEventListener("touchstart", start, { passive: false });
canvas.addEventListener("touchmove", move, { passive: false });
canvas.addEventListener("touchend", end, { passive: false });

// Store signature as image
function saveSignature() {
  localStorage.setItem("fps_signature", canvas.toDataURL("image/png"));
}

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.removeItem("fps_signature");
}

// Expose for inline button
window.clearSignature = clearSignature;

// ---------- FORM SAVE / LOAD ----------
const reportMetaEl = document.getElementById("reportMeta");
const propertyEl = document.getElementById("property");
const agentEl = document.getElementById("agent");
const dateEl = document.getElementById("date");
const notesEl = document.getElementById("notes");

dateEl.value = ukDate();

function saveReport() {
  const id = createReportId();           // NEW each save
  reportMetaEl.innerText = `Report ID: ${id}`;

  const data = {
    reportId: id,
    property: propertyEl.value || "",
    agent: agentEl.value || "",
    date: dateEl.value || ukDate(),
    notes: notesEl.value || "",
    signature: localStorage.getItem("fps_signature") || ""
  };

  // Save "current report"
  localStorage.setItem("fps_report", JSON.stringify(data));

  alert(`Saved ✅\n${id}`);
}

// Expose for inline button
window.saveReport = saveReport;

(function load() {
  const raw = localStorage.getItem("fps_report");
  if (!raw) {
    reportMetaEl.innerText = "Report ID: —";
    return;
  }

  try {
    const d = JSON.parse(raw);
    reportMetaEl.innerText = `Report ID: ${d.reportId || "—"}`;

    propertyEl.value = d.property || "";
    agentEl.value = d.agent || "";
    dateEl.value = d.date || ukDate();
    notesEl.value = d.notes || "";

    // Load signature image back onto canvas
    if (d.signature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
      };
      img.src = d.signature;
      localStorage.setItem("fps_signature", d.signature);
    }
  } catch {
    reportMetaEl.innerText = "Report ID: —";
  }
})();
