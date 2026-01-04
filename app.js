const $ = (id) => document.getElementById(id);

const state = { before: [], after: [] };

function addThumbs(files, arr, box) {
  [...files].forEach((f) => {
    arr.push(f);
    const img = document.createElement("img");
    img.src = URL.createObjectURL(f);
    box.appendChild(img);
  });
}

// BEFORE
beforeGallery.onclick = () => beforePick.click();
beforeCamera.onclick = () => beforeCam.click();
beforePick.onchange = (e) => addThumbs(e.target.files, state.before, beforeThumbs);
beforeCam.onchange  = (e) => addThumbs(e.target.files, state.before, beforeThumbs);

// AFTER
afterGallery.onclick = () => afterPick.click();
afterCamera.onclick = () => afterCam.click();
afterPick.onchange = (e) => addThumbs(e.target.files, state.after, afterThumbs);
afterCam.onchange  = (e) => addThumbs(e.target.files, state.after, afterThumbs);

function esc(s="") {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function fileToDataURL(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });
}

async function filesToDataURLs(files, limit = 6) {
  const slice = files.slice(0, limit);
  const urls = [];
  for (const f of slice) urls.push(await fileToDataURL(f));
  return urls;
}

function photosGridHTML(dataUrls) {
  if (!dataUrls.length) return `<div class="empty">No photos added</div>`;
  return dataUrls.map(src => `<img src="${src}" />`).join("");
}

pdfBtn.onclick = async () => {
  // Convert selected photos to embedded data URLs so they appear in PDF
  const beforeImgs = await filesToDataURLs(state.before, 6);
  const afterImgs  = await filesToDataURLs(state.after, 6);

  const win = window.open("", "_blank");
  if (!win) {
    alert("Popup blocked. Please allow popups for this site then try again.");
    return;
  }

  const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Completion Report</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;margin:20px;color:#111}
  h1{margin:0 0 6px;font-size:18px}
  .sub{margin:0 0 14px;font-size:12px;color:#333}
  .box{border:1px solid #999;border-radius:10px;padding:12px;margin:12px 0}
  .row{display:flex;gap:12px;flex-wrap:wrap}
  .field{flex:1;min-width:220px}
  .label{font-size:11px;color:#444;margin-bottom:4px}
  .val{font-size:13px;font-weight:700;min-height:18px}
  .tick{font-size:13px;font-weight:700}
  .photos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .photos img{width:100%;height:140px;object-fit:cover;border:1px solid #ccc;border-radius:8px}
  .empty{font-size:12px;color:#666}
  @media print { .noprint{display:none} }
</style>
</head>
<body>
  <h1>FORD PROPERTY SERVICES</h1>
  <div class="sub">Property Maintenance – Completion Report</div>

  <div class="box">
    <div class="row">
      <div class="field"><div class="label">Letting Agent</div><div class="val">${esc(agent.value)}</div></div>
      <div class="field"><div class="label">Job Reference</div><div class="val">${esc(ref.value)}</div></div>
    </div>
    <div class="row">
      <div class="field"><div class="label">Property Address</div><div class="val">${esc(address.value)}</div></div>
      <div class="field"><div class="label">Date Completed</div><div class="val">${esc(date.value)}</div></div>
    </div>
  </div>

  <div class="box">
    <div class="label">Photo Evidence</div>
    <div class="row">
      <div class="field"><div class="tick">Before photos taken: ${beforeTick.checked ? "✔" : "✘"}</div></div>
      <div class="field"><div class="tick">After photos taken: ${afterTick.checked ? "✔" : "✘"}</div></div>
    </div>
  </div>

  <div class="box">
    <div class="label">Works Carried Out</div>
    <div class="val" style="font-weight:600">${esc(works.value).replace(/\\n/g,"<br>")}</div>
  </div>

  <div class="box">
    <div class="label">Before Photos (up to 6)</div>
    <div class="photos">${photosGridHTML(beforeImgs)}</div>
  </div>

  <div class="box">
    <div class="label">After Photos (up to 6)</div>
    <div class="photos">${photosGridHTML(afterImgs)}</div>
  </div>

  <div class="box">
    <div class="label">Extra Photo / Video Attachments (file names)</div>
    <div class="val" style="font-weight:600">${esc(attachments.value).replace(/\\n/g,"<br>")}</div>
  </div>

  <div class="box">
    <div class="row">
      <div class="field"><div class="label">Completed By</div><div class="val">Ford Property Services</div></div>
      <div class="field"><div class="label">Signature / Date</div><div class="val">&nbsp;</div></div>
    </div>
  </div>

  <div class="noprint" style="margin-top:10px;color:#666;font-size:11px">
    Tip: Android will open Print. Choose <b>Save as PDF</b>, then share the saved PDF.
  </div>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();

  // Give images a moment to load before printing
  setTimeout(() => win.print(), 700);
};
