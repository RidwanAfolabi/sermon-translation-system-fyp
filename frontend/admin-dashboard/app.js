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

    const tdNo = document.createElement("td");
    tdNo.textContent = seg.segment_order;
    tr.appendChild(tdNo);

    const tdMalay = document.createElement("td");
    tdMalay.textContent = seg.malay_text || "";
    tr.appendChild(tdMalay);

    const tdEng = document.createElement("td");
    const input = document.createElement("textarea");
    input.value = seg.english_text || "";
    input.rows = 2;
    input.style.width = "100%";
    tdEng.appendChild(input);
    tr.appendChild(tdEng);

    const tdConf = document.createElement("td");
    tdConf.textContent = seg.confidence != null ? seg.confidence.toFixed(3) : "";
    tr.appendChild(tdConf);

    const tdVetted = document.createElement("td");
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = !!seg.vetted;
    tdVetted.appendChild(chk);
    tr.appendChild(tdVetted);

    const tdSave = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Save";
    btn.onclick = async () => {
      try {
        setStatus(`Saving segment #${seg.segment_order}...`);
        await api(`/sermon/segment/${seg.segment_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            english_text: input.value,
            vetted: chk.checked,
          }),
        });
        setStatus(`Saved segment #${seg.segment_order}.`);
      } catch (e) {
        console.error(e);
        setStatus(`Save failed: ${e.message}`);
      }
    };
    tdSave.appendChild(btn);
    tr.appendChild(tdSave);

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

// init
loadSermons().catch((e) => setStatus(`Init failed: ${e.message}`));