const $ = id => document.getElementById(id);
const state = { before: [], after: [] };

function addThumbs(files, arr, box){
  [...files].forEach(f => {
    arr.push(f);
    const img = document.createElement("img");
    img.src = URL.createObjectURL(f);
    box.appendChild(img);
  });
}

// BEFORE
beforeGallery.onclick = () => beforePick.click();
beforeCamera.onclick = () => beforeCam.click();
beforePick.onchange = e => addThumbs(e.target.files, state.before, beforeThumbs);
beforeCam.onchange  = e => addThumbs(e.target.files, state.before, beforeThumbs);

// AFTER
afterGallery.onclick = () => afterPick.click();
afterCamera.onclick = () => afterCam.click();
afterPick.onchange = e => addThumbs(e.target.files, state.after, afterThumbs);
afterCam.onchange  = e => addThumbs(e.target.files, state.after, afterThumbs);

pdfBtn.onclick = () => {
  const win = window.open("");
  win.document.write(`
  <h1>FORD PROPERTY SERVICES</h1>
  <p><b>Letting Agent:</b> ${agent.value}</p>
  <p><b>Address:</b> ${address.value}</p>
  <p><b>Job Ref:</b> ${ref.value}</p>
  <p><b>Date:</b> ${date.value}</p>
  <p><b>Before photos:</b> ${beforeTick.checked ? "Yes" : "No"}</p>
  <p><b>After photos:</b> ${afterTick.checked ? "Yes" : "No"}</p>
  <p><b>Works:</b><br>${works.value.replace(/\n/g,"<br>")}</p>
  <p><b>Attachments:</b><br>${attachments.value.replace(/\n/g,"<br>")}</p>
  `);
  setTimeout(()=>win.print(),400);
};
