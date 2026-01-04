const $ = (id) => document.getElementById(id);
const state = { before: [], after: [] };

// --- UI helpers ---
function clearThumbs(el) { el.innerHTML = ""; }

function appendThumbs(files, arr, thumbsEl) {
  [...files].forEach((f) => {
    arr.push(f);
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = URL.createObjectURL(f);
    thumbsEl.appendChild(img);
  });
}

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function nl2br(s="") { return esc(s).replace(/\n/g, "<br>"); }

// --- Picker wiring (gallery + camera) ---
beforeGallery.onclick = () => beforePick.click();
beforeCamera.onclick  = () => beforeCam.click();
afterGallery.onclick  = () => afterPick.click();
afterCamera.onclick   = () => afterCam.click();

beforePick.onchange = (e) => appendThumbs(e.target.files, state.before, beforeThumbs);
beforeCam.onchange  = (e) => appendThumbs(e.target.files, state.before, beforeThumbs);
afterPick.onchange  = (e) => appendThumbs(e.target.files, state.after, afterThumbs);
afterCam.onchange   = (e) => appendThumbs(e.target.files, state.after, afterThumbs);

// --- Convert images to embedded data URLs (so they appear in PDF) ---
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function filesToDataURLs(files, limit = 6) {
  const out = [];
  for (const f of files.slice(0, limit)) {
    out.push(await fileToDataURL(f));
  }
  return out;
}

function photoGridHTML(dataUrls) {
  if (!dataUrls.length) return `<div class="empty">No photos added</div>`;
  return dataUrls.map(src => `<div class="ph"><img src="${src}"></div>`).join("");
}

// --- Clear ---
clearBtn.onclick = () => {
  ["agent","address","ref","date","works","attachments"].forEach(id => $(id).value = "");
  beforeTick.checked = false;
  afterTick.checked = false;

  state.before.length = 0;
  state.after.length = 0;

  beforePick.value = ""; beforeCam.value = "";
  afterPick.value  = ""; afterCam.value  = "";

  clearThumbs(beforeThumbs);
  clearThumbs(afterThumbs);
};

// --- Generate PDF (print window) ---
pdfBtn.onclick = async () => {
  // Convert photos to embedded base64 so they show in PDF
  const beforeImgs = await filesToDataURLs(state.before, 6);
  const afterImgs  = await filesToDataURLs(state.after, 6);

  const w = window.open("", "_blank");
  if (!w) {
    alert("Popup blocked. Please allow popups for this site, then try again.");
    return;
  }

  const reportHtml = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Completion Report</title>
<style>
  :root { --brand:#0b4aa2; --border:#cfd7e6; --muted:#5b667a; }
  body{font-family:Arial,Helvetica,sans-serif;margin:22px;color:#111}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
  .hdr .name{font-size:18px;font-weight:800;margin:0}
  .hdr .sub{margin:4px 0 0;color:var(--muted);font-size:12px}
  .pill{border:1px solid var(--border);padding:8px 10px;border-radius:10px;font-size:12px;color:#111}
  .section{border:1px solid var(--border);border-radius:12px;padding:12px;margin:12px 0}
  .stitle{font-size:12px;font-weight:800;color:#111;margin:0 0 10px;text-transform:uppercase;letter-spacing:.5px}
  table{width:100%;border-collapse:collapse}
  td{border:1px solid var(--border);padding:10px;vertical-align:top}
  td .lbl{font-size:11px;color:var(--muted);margin-bottom:4px}
  td .val{font-size:13px;font-weight:700;min-height:18px}
  .ticks{display:flex;gap:18px;flex-wrap:wrap}
  .tick{font-size:13px;font-weight:800}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .ph{border:1px solid var(--border);border-radius:10px;overflow:hidden;height:150px}
  .ph img{width:100%;height:100%;object-fit:cover}
  .empty{font-size:12px;color:var(--muted)}
  .foot{margin-top:10px;color:var(--muted);font-size:11px}
  @media print { .noprint{display:none} }
</style>
</head>
<body>

<div class="hdr">
  <div>
    <p class="name">FORD PROPERTY SERVICES</p>
    <p class="sub">Property Maintenance – Completion Report</p>
  </div>
  <div class="pill"><b>Date:</b> ${esc(date.value || "")}</div>
</div>

<div class="section">
  <p class="stitle">Job Details</p>
  <table>
    <tr>
      <td>
        <div class="lbl">Letting Agent</div>
        <div class="val">${esc(agent.value) || "&nbsp;"}</div>
      </td>
      <td>
        <div class="lbl">Job Reference</div>
        <div class="val">${esc(ref.value) || "&nbsp;"}</div>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <div class="lbl">Property Address</div>
        <div class="val">${esc(address.value) || "&nbsp;"}</div>
      </td>
    </tr>
  </table>
</div>

<div class="section">
  <p class="stitle">Photo Evidence</p>
  <div class="ticks">
    <div class="tick">Before photos taken: ${beforeTick.checked ? "✔" : "✘"}</div>
    <div class="tick">After photos taken: ${afterTick.checked ? "✔" : "✘"}</div>
  </div>
</div>

<div class="section">
  <p class="stitle">Works Carried Out</p>
  <table>
    <tr>
      <td>
        <div class="val" style="font-weight:600">${nl2br(works.value) || "&nbsp;"}</div>
      </td>
    </tr>
  </table>
</div>

<div class="section">
  <p class="stitle">Before Photos (up to 6)</p>
  <div class="grid">${photoGridHTML(beforeImgs)}</div>
</div>

<div class="section">
  <p class="stitle">After Photos (up to 6)</p>
  <div class="grid">${photoGridHTML(afterImgs)}</div>
</div>

<div class="section">
  <p class="stitle">Extra Attachments</p>
  <table>
    <tr>
      <td>
        <div class="lbl">Photo / Video files attached to email</div>
        <div class="val" style="font-weight:600">${nl2br(attachments.value) || "&nbsp;"}</div>
      </td>
    </tr>
  </table>
</div>

<div class="section">
  <p class="stitle">Sign Off</p>
  <table>
    <tr>
      <td>
        <div class="lbl">Completed By</div>
        <div class="val">Ford Property Services</div>
      </td>
      <td>
        <div class="lbl">Signature / Date</div>
        <div class="val">&nbsp;</div>
      </td>
    </tr>
  </table>
</div>

<div class="foot noprint">
  Tip: Android will open Print. Choose <b>Save as PDF</b>, then share the saved file to your letting agent.
</div>

</body>
</html>`;

  w.document.open();
  w.document.write(reportHtml);
  w.document.close();

  // Give images time to render before print
  setTimeout(() => w.print(), 900);
};
