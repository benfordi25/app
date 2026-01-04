(() => {
  // ----- SETTINGS -----
  const COMPANY_NAME = "Ford Property Services";
  const LOGO_PATH = "assets/logo.png"; // must match your repo path exactly

  // ----- ELEMENTS -----
  const companyNameEl = document.getElementById("companyName");
  const logoEl = document.getElementById("companyLogo");
  const todayUkEl = document.getElementById("todayUk");
  const reportIdEl = document.getElementById("reportId");

  const propertyAddressEl = document.getElementById("propertyAddress");
  const agentNameEl = document.getElementById("agentName");
  const reportDateEl = document.getElementById("reportDate");
  const notesEl = document.getElementById("notes");

  const saveBtn = document.getElementById("saveBtn");
  const generateBtn = document.getElementById("generateBtn");

  // ----- HELPERS -----
  function ukDate(d = new Date()) {
    // dd/mm/yyyy
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function getOrCreateReportId() {
    // Stable ID saved in localStorage (does NOT change each time)
    // Format: CR-YYYYMMDD-XXXXXX
    const key = "fps_condition_report_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const id = `CR-${y}${m}${day}-${rand}`;

    localStorage.setItem(key, id);
    return id;
  }

  function saveForm() {
    const data = {
      propertyAddress: propertyAddressEl.value.trim(),
      agentName: agentNameEl.value.trim(),
      reportDate: reportDateEl.value.trim(),
      notes: notesEl.value.trim(),
    };
    localStorage.setItem("fps_condition_report_form", JSON.stringify(data));
    alert("Saved ✅");
  }

  function loadForm() {
    const raw = localStorage.getItem("fps_condition_report_form");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      propertyAddressEl.value = data.propertyAddress || "";
      agentNameEl.value = data.agentName || "";
      reportDateEl.value = data.reportDate || "";
      notesEl.value = data.notes || "";
    } catch {}
  }

  // ----- INIT -----
  companyNameEl.textContent = COMPANY_NAME;

  // Force logo src (and lightly bust cache if needed)
  logoEl.src = `${LOGO_PATH}?v=${Date.now()}`;

  const today = ukDate(new Date());
  todayUkEl.textContent = `Date: ${today}`;

  reportDateEl.value = today;

  const rid = getOrCreateReportId();
  reportIdEl.textContent = `Report ID: ${rid}`;

  loadForm();

  // ----- EVENTS -----
  saveBtn.addEventListener("click", saveForm);

  generateBtn.addEventListener("click", () => {
    alert("PDF generation is the next step — once your logo shows correctly, we’ll wire the PDF to include it.");
  });
})();
