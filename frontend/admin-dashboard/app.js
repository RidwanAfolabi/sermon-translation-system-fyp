const BASE = "http://127.0.0.1:8000";

const els = {
  status: document.getElementById("status"),
  uploadForm: document.getElementById("uploadForm"),
  title: document.getElementById("title"),
  speaker: document.getElementById("speaker"),
  file: document.getElementById("file"),
  autoSeg: document.getElementById("auto_segment"),
  sermonSelect: document.getElementById("sermonSelect"),
  refreshSermons: document.getElementById("refreshSermons"),
  loadSermon: document.getElementById("loadSermon"),
  segmentNow: document.getElementById("segmentNow"),
  segStrategy: document.getElementById("segStrategy"),
  modelProvider: document.getElementById("modelProvider"),
  modelName: document.getElementById("modelName"),
  translateStart: document.getElementById("translateStart"),
  segmentsBody: document.getElementById("segmentsBody"),
  deleteSermon: document.getElementById("deleteSermon"),
  exportCsv: document.getElementById("exportCsv"),
  exportTxt: document.getElementById("exportTxt"),
  exportPdf: document.getElementById("exportPdf"),
};

function setStatus(msg) {
  els.status.textContent = msg;
}

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${t}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

async function loadSermons() {
  setStatus("Loading sermons...");
  const data = await api("/sermon/list");
  els.sermonSelect.innerHTML = "";
  data.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.sermon_id;
    opt.textContent = `#${s.sermon_id} — ${s.title} ${s.speaker ? `(${s.speaker})` : ""}`;
    els.sermonSelect.appendChild(opt);
  });
  setStatus(`Loaded ${data.length} sermons.`);
}

function renderSegments(segments) {
  els.segmentsBody.innerHTML = "";
  segments.forEach((seg) => {
    const tr = document.createElement("tr");

    // Order
    const tdNo = document.createElement("td");
    tdNo.textContent = seg.segment_order;
    tr.appendChild(tdNo);

    // Malay editable
    const tdMalay = document.createElement("td");
    const malayArea = document.createElement("textarea");
    malayArea.value = seg.malay_text || "";
    malayArea.rows = 2;
    malayArea.style.width = "100%";
    tdMalay.appendChild(malayArea);
    tr.appendChild(tdMalay);

    // English editable
    const tdEng = document.createElement("td");
    const engArea = document.createElement("textarea");
    engArea.value = seg.english_text || "";
    engArea.rows = 2;
    engArea.style.width = "100%";
    tdEng.appendChild(engArea);
    tr.appendChild(tdEng);

    // Confidence
    const tdConf = document.createElement("td");
    tdConf.textContent = seg.confidence != null ? seg.confidence.toFixed(3) : "";
    tr.appendChild(tdConf);

    // Vetted
    const tdVetted = document.createElement("td");
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = !!seg.vetted;
    tdVetted.appendChild(chk);
    tr.appendChild(tdVetted);

    // Save
    const tdSave = document.createElement("td");
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.onclick = async () => {
      try {
        setStatus(`Saving segment #${seg.segment_order}...`);
        await api(`/sermon/segment/${seg.segment_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            malay_text: malayArea.value,
            english_text: engArea.value,
            vetted: chk.checked,
          }),
        });
        setStatus(`Saved segment #${seg.segment_order}.`);
      } catch (e) {
        console.error(e);
        setStatus(`Save failed: ${e.message}`);
      }
    };
    tdSave.appendChild(saveBtn);
    tr.appendChild(tdSave);

    // Retranslate
    const tdRetr = document.createElement("td");
    const rtBtn = document.createElement("button");
    rtBtn.textContent = "↻";
    rtBtn.title = "Retranslate from Malay";
    rtBtn.onclick = async () => {
      try {
        setStatus(`Retranslating #${seg.segment_order}...`);
        const resp = await api(`/sermon/segment/${seg.segment_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            malay_text: malayArea.value,
            retranslate: true,
          }),
        });
        engArea.value = resp.english_text || "";
        tdConf.textContent = resp.confidence != null ? resp.confidence.toFixed(3) : "";
        setStatus(`Retranslated segment #${seg.segment_order}.`);
      } catch (e) {
        console.error(e);
        setStatus(`Retranslate failed: ${e.message}`);
      }
    };
    tdRetr.appendChild(rtBtn);
    tr.appendChild(tdRetr);

    els.segmentsBody.appendChild(tr);
  });
}

async function loadSegments() {
  const id = els.sermonSelect.value;
  if (!id) return;
  setStatus(`Loading segments for sermon ${id}...`);
  const data = await api(`/sermon/${id}/segments`);
  renderSegments(data);
  setStatus(`Loaded ${data.length} segments.`);
}

els.uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const fd = new FormData();
    fd.append("title", els.title.value);
    fd.append("speaker", els.speaker.value);
    fd.append("file", els.file.files[0]);
    fd.append("auto_segment", els.autoSeg.checked ? "true" : "false");
    setStatus("Uploading...");
    const res = await api("/sermon/upload", { method: "POST", body: fd });
    setStatus(`Uploaded. Sermon #${res.sermon_id}, status: ${res.status}`);
    await loadSermons();
  } catch (e) {
    console.error(e);
    setStatus(`Upload failed: ${e.message}`);
  }
});

els.refreshSermons.addEventListener("click", loadSermons);
els.loadSermon.addEventListener("click", loadSegments);

els.segmentNow.addEventListener("click", async () => {
  const id = els.sermonSelect.value;
  if (!id) return;
  const strategy = els.segStrategy.value; // auto|sentence|paragraph
  try {
    setStatus(`Segmenting sermon ${id} with strategy=${strategy}...`);
    await api(`/sermon/${id}/segment-now?strategy=${encodeURIComponent(strategy)}`, {
      method: "POST",
    });
    await loadSegments();
    setStatus("Segmentation done.");
  } catch (e) {
    console.error(e);
    setStatus(`Segmentation failed: ${e.message}`);
  }
});

els.translateStart.addEventListener("click", async () => {
  const id = els.sermonSelect.value;
  if (!id) return;
  const provider = els.modelProvider.value;
  const modelName = els.modelName.value.trim();
  try {
    setStatus(`Translating sermon ${id} via ${provider}...`);
    await api(`/sermon/${id}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model_name: modelName || null }),
    });
    await loadSegments();
    setStatus("Translation completed.");
  } catch (e) {
    console.error(e);
    setStatus(`Translation failed: ${e.message}`);
  }
});

// Translate missing button (already OK)
const translateMissingBtn = document.getElementById("translateMissing");
translateMissingBtn.addEventListener("click", async () => {
  const id = els.sermonSelect.value;
  if (!id) return;
  try {
    setStatus(`Translating missing English for sermon ${id}...`);
    await api(`/sermon/${id}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "marian", only_empty: true }),
    });
    await loadSegments();
    setStatus("Missing segments translated.");
  } catch (e) {
    console.error(e);
    setStatus(`Failed: ${e.message}`);
  }
});

// FIX: use els.deleteSermon not deleteBtn
els.deleteSermon.addEventListener("click", async () => {
  const id = els.sermonSelect.value;
  if (!id) return;
  if (!confirm(`Delete sermon #${id}? This cannot be undone.`)) return;
  try {
    setStatus("Deleting...");
    await api(`/sermon/${id}`, { method: "DELETE" });
    await loadSermons();
    els.segmentsBody.innerHTML = "";
    setStatus("Deleted.");
  } catch (e) {
    console.error(e);
    setStatus("Delete failed: " + e.message);
  }
});

function download(format) {
  const id = els.sermonSelect.value;
  if (!id) return;
  const url = `${BASE}/sermon/${id}/export?format=${format}`;
  setStatus(`Exporting ${format.toUpperCase()}...`);
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error("Export failed");
      return r.blob();
    })
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `sermon_${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatus(`Downloaded ${format.toUpperCase()}.`);
    })
    .catch(e => {
      console.error(e);
      setStatus(e.message);
    });
}

// FIX: use els.export* references
els.exportCsv.addEventListener("click", () => download("csv"));
els.exportTxt.addEventListener("click", () => download("txt"));
els.exportPdf.addEventListener("click", () => download("pdf"));

// init
loadSermons().catch((e) => setStatus(`Init failed: ${e.message}`));