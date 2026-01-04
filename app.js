// Ford Property Services – Completion Report App
// Simple PDF export using the browser print-to-PDF (most reliable on Android)

const $ = (id) => document.getElementById(id);

const state = { before: [], after: [] };

function readFiles(input, targetArr, thumbsEl) {
  const files = Array.from(input.files || []);
  targetArr.length = 0;
  thumbsEl.innerHTML = "";
  files.forEach((f) => {
    targetArr.push(f);
    const img = document.createElement("img");
    img.alt = f.name;
    img.loading = "lazy";
    img.src = URL.createObjectURL(f);
    thumbsEl.appendChild(img);
  });
}

function escapeHtml(s="") {
  return s.replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

function formatDate(d) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch { return d; }
}

function buildReportHtml() {
  const agent = escapeHtml($("agent").value.trim());
  const address = escapeHtml($("address").value.trim());
  const ref = escapeHtml($("ref").value.trim());
  const date = escapeHtml(formatDate($("date").value));
  const works = escapeHtml($("works").value.trim()).replace(/\n/g, "<br>");
  const attachments = escapeHtml($("attachments").value.trim()).replace(/\n/g, "<br>");
  const beforeTick = $("beforeTick").checked ? "✔" : "✘";
  const afterTick = $("afterTick").checked ? "✔" : "✘";

  const imgToDataUrlPromises = (files) =>
    files.slice(0, 6).map((file) => new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(file);
    }));

  return Promise.all([
    Promise.all(imgToDataUrlPromises(state.before)),
    Promise.all(imgToDataUrlPromises(state.after)),
  ]).then(([beforeImgs, afterImgs]) => {
    const imgGrid = (arr) => arr.map(src => `<img src="${src}" />`).join("");

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Completion Report</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;margin:20px;color:#111}
  h1{margin:0 0 4px;font-size:18px}
  .sub{margin:0 0 14px;color:#333;font-size:12px}
  .box{border:1px solid #999;border-radius:10px;padding:12px;margin:12px 0}
  .row{display:flex;gap:12px;flex-wrap:wrap}
  .field{flex:1;min-width:220px}
  .label{font-size:11px;color:#444;margin-bottom:4px}
  .val{font-size:13px;font-weight:700;min-height:18px}
  .tick{font-size:13px;font-weight:700}
  .photos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .photos img{width:100%;height:140px;object-fit:cover;border:1px solid #ccc;border-radius:8px}
  @media print { .noprint{display:none} }
</style>
</head>
<body>
  <h1>FORD PROPERTY SERVICES</h1>
  <p class="sub">Property Maintenance – Completion Report</p>

  <div class="box">
    <div class="row">
      <div class="field"><div class="label">Letting Agent</div><div class="val">${agent || "&nbsp;"}</div></div>
      <div class="field"><div class="label">Job Reference</div><div class="val">${ref || "&nbsp;"}</div></div>
    </div>
    <div class="row">
      <div class="field"><div class="label">Property Address</div><div class="val">${address || "&nbsp;"}</div></div>
      <div class="field"><div class="label">Date Completed</div><div class="val">${date || "&nbsp;"}</div></div>
    </div>
  </div>

  <div class="box">
    <div class="label">Photo Evidence</div>
    <div class="row">
      <div class="field"><div class="tick">Before photos taken: ${beforeTick}</div></div>
      <div class="field"><div class="tick">After photos taken: ${afterTick}</div></div>
    </div>
  </div>

  <div class="box">
    <div class="label">Works Carried Out</div>
    <div class="val" style="font-weight:600">${works || "&nbsp;"}</div>
  </div>

  <div class="box">
    <div class="label">Before Photos (up to 6)</div>
    <div class="photos">${imgGrid(beforeImgs) || "<div class='val'>&nbsp;</div>"}</div>
  </div>

  <div class="box">
    <div class="label">After Photos (up to 6)</div>
    <div class="photos">${imgGrid(afterImgs) || "<div class='val'>&nbsp;</div>"}</div>
  </div>

  <div class="box">
    <div class="label">Extra Photo / Video Attachments (file names)</div>
    <div class="val" style="font-weight:600">${attachments || "&nbsp;"}</div>
  </div>

  <div class="box">
    <div class="row">
      <div class="field"><div class="label">Completed By</div><div class="val">Ford Property Services</div></div>
      <div class="field"><div class="label">Signature / Date</div><div class="val">&nbsp;</div></div>
    </div>
  </div>

  <div class="noprint" style="margin-top:10px;color:#666;font-size:11px">
    Tip: use your phone's Share button after saving the PDF.
  </div>
</body>
</html>`;
  });
}

$("beforePhotos").addEventListener("change", (e) => readFiles(e.target, state.before, $("beforeThumbs")));
$("afterPhotos").addEventListener("change", (e) => readFiles(e.target, state.after, $("afterThumbs")));

$("clearBtn").addEventListener("click", () => {
  ["agent","address","ref","date","works","attachments"].forEach(id => $(id).value = "");
  $("beforeTick").checked = false;
  $("afterTick").checked = false;
  $("beforePhotos").value = "";
  $("afterPhotos").value = "";
  $("beforeThumbs").innerHTML = "";
  $("afterThumbs").innerHTML = "";
  state.before = []; state.after = [];
});

$("pdfBtn").addEventListener("click", async () => {
  const html = await buildReportHtml();
  const w = window.open("", "_blank");
  if (!w) {
    alert("Popup blocked. Please allow popups for this site, then try again.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  // Give the page a moment to render images
  setTimeout(() => w.print(), 350);
});

// PWA service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
