const API = "http://127.0.0.1:8000";
const statusEl = document.getElementById("status");
const uploadForm = document.getElementById("uploadForm");
const sermonSelect = document.getElementById("sermonSelect");
const refreshBtn = document.getElementById("refreshSermons");
const loadBtn = document.getElementById("loadSermon");
const segmentNowBtn = document.getElementById("segmentNow");
const translateBtn = document.getElementById("translateStart");
const modelProvider = document.getElementById("modelProvider");
const modelName = document.getElementById("modelName");
const tbody = document.getElementById("segmentsBody");

function setStatus(msg) { statusEl.textContent = msg; }

async function listSermons() {
  setStatus("Loading sermons...");
  const res = await fetch(`${API}/sermon/list`);
  const data = await res.json();
  sermonSelect.innerHTML = "";
  (data.sermons || []).forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.sermon_id;
    opt.textContent = `#${s.sermon_id} · ${s.title} · ${s.status}`;
    sermonSelect.appendChild(opt);
  });
  setStatus("Ready");
}

async function loadSermon() {
  const id = sermonSelect.value;
  if (!id) return;
  setStatus(`Loading sermon ${id}...`);
  const res = await fetch(`${API}/sermon/${id}`);
  const data = await res.json();
  renderSegments(data.segments || []);
  setStatus(`Loaded sermon ${id}`);
}

function renderSegments(rows) {
  tbody.innerHTML = "";
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge">${r.order}</span></td>
      <td>${escapeHtml(r.malay_text || "")}</td>
      <td><textarea class="eng-edit" data-id="${r.segment_id}">${r.english_text || ""}</textarea></td>
      <td>${r.confidence_score != null ? r.confidence_score.toFixed(2) : "-"}</td>
      <td><input type="checkbox" class="vet-check" data-id="${r.segment_id}" ${r.is_vetted ? "checked": ""} /></td>
      <td><button class="save-btn" data-id="${r.segment_id}">Save</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const eng = tbody.querySelector(`.eng-edit[data-id="${id}"]`).value.trim();
      const vetted = tbody.querySelector(`.vet-check[data-id="${id}"]`).checked;
      await saveVet(id, eng, vetted);
    });
  });
}

async function saveVet(segment_id, english_text, is_vetted) {
  setStatus(`Saving segment ${segment_id}...`);
  // Save text + vetted
  const fd = new FormData();
  fd.append("segment_id", segment_id);
  fd.append("english_text", english_text);
  fd.append("reviewer", "admin"); // replace with real auth later
  const res = await fetch(`${API}/translation/vet_segment`, { method: "POST", body: fd });
  if (!res.ok) {
    setStatus("Error saving segment");
    return;
  }
  // If unchecked vetted, just saved text; DB route sets is_vetted True—keep simple for demo
  setStatus("Saved");
}

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const speaker = document.getElementById("speaker").value.trim();
  const file = document.getElementById("file").files[0];
  const autoSeg = document.getElementById("auto_segment").checked;

  const fd = new FormData();
  fd.append("title", title);
  fd.append("speaker", speaker);
  fd.append("file", file);
  fd.append("auto_segment", autoSeg ? "true" : "false");

  setStatus("Uploading...");
  const res = await fetch(`${API}/sermon/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) {
    setStatus(`Upload failed: ${data.detail || res.status}`);
    return;
  }
  setStatus(`Uploaded sermon ${data.sermon_id}. Inserted segments: ${data.inserted_segments}`);
  await listSermons();
});

refreshBtn.addEventListener("click", listSermons);
loadBtn.addEventListener("click", loadSermon);

segmentNowBtn.addEventListener("click", async () => {
  const id = sermonSelect.value;
  if (!id) return;
  setStatus(`Segmenting sermon ${id}...`);
  const fd = new FormData();
  fd.append("sermon_id", id);
  const res = await fetch(`${API}/sermon/segment`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) {
    setStatus(`Segment failed: ${data.detail || res.status}`);
    return;
  }
  setStatus(`Segmented: ${data.inserted_segments} segments.`);
  await loadSermon();
});

translateBtn.addEventListener("click", async () => {
  const id = sermonSelect.value;
  if (!id) return;
  setStatus(`Translating sermon ${id}...`);
  const fd = new FormData();
  fd.append("sermon_id", id);
  if (modelProvider.value) fd.append("model_provider", modelProvider.value);
  if (modelName.value) fd.append("model_name", modelName.value);
  const res = await fetch(`${API}/translation/translate_start`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) {
    setStatus(`Translate failed: ${data.detail || res.status}`);
    return;
  }
  setStatus(`Translated ${data.translated_count} segments.`);
  await loadSermon();
});

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

listSermons();