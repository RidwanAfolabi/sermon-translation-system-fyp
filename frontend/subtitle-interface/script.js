// frontend/subtitle-interface/script.js
(() => {
  // ----------------------------------
  // DOM elements
  // ----------------------------------
  const statusBox = document.getElementById("status-box");
  const stackContainer = document.getElementById("stack-container");
  const spokenBox = document.getElementById("spoken-box");
  const matchedMalay = document.getElementById("matched-malay");
  const matchedEnglish = document.getElementById("matched-english");
  const historyList = document.getElementById("history-list");

  const dbgScore = document.getElementById("dbg-score");
  const dbgMatched = document.getElementById("dbg-matched");
  const dbgWindow = document.getElementById("dbg-window");
  const dbgBuffer = document.getElementById("dbg-buffer");
  const dbgCandidate = document.getElementById("dbg-candidate");

  const form = document.getElementById("connect-form");
  const sermonInput = document.getElementById("sermon-id");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const clearStackBtn = document.getElementById("clear-stack-btn");
  const openDisplayBtn = document.getElementById("open-display-btn");

  // ----------------------------------
  // BROADCAST CHANNEL (NEW)
  // ----------------------------------
  const bc = new BroadcastChannel("khutbah_subtitles");

  // ----------------------------------
  // WebSocket backend target
  // ----------------------------------
  const WS_BASE = "ws://127.0.0.1:8000/live/stream?sermon_id=";

  let ws = null;
  let stack = [];
  const STACK_MAX = 6;
  const FADE_OLDEST_AFTER = 4;
  const HISTORY_MAX = 120;

  const setStatus = msg => statusBox && (statusBox.textContent = msg);

  const escapeHtml = s =>
    (s || "").replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));

  // ----------------------------------
  // Stacked subtitles rendering
  // ----------------------------------
  function renderStack() {
    stackContainer.innerHTML = "";
    stack.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "stack-line matched";
      div.dataset.order = item.order || "";
      div.innerHTML = escapeHtml(item.text);

      if (idx < Math.max(0, stack.length - FADE_OLDEST_AFTER)) {
        div.classList.add("fade");
      }

      stackContainer.appendChild(div);
      setTimeout(() => div.classList.add("show"), 25);
    });
  }

  function pushToStack(text, segment) {
    if (!text) return;
    if (stack.length && stack[stack.length - 1].text === text) return;

    stack.push({
      text,
      id: segment?.segment_id || null,
      order: segment?.order || null,
      ts: Date.now()
    });

    while (stack.length > STACK_MAX) stack.shift();
    renderStack();
  }

  function clearStack() {
    stack = [];
    stackContainer.innerHTML = "";
  }

  // ----------------------------------
  // History logging
  // ----------------------------------
  function addHistoryLine(spoken, score, matched) {
    const li = document.createElement("li");
    if (!matched) li.classList.add("unmatched");

    const l = document.createElement("div");
    l.className = "spoken";
    l.textContent = spoken;

    const r = document.createElement("div");
    r.className = "score";
    r.textContent = `${matched ? "✅" : "❌"} ${Number(score).toFixed(3)}`;

    li.appendChild(l);
    li.appendChild(r);
    historyList.prepend(li);
    while (historyList.children.length > HISTORY_MAX)
      historyList.lastChild.remove();
  }

  // ----------------------------------
  // WebSocket message handler
  // ----------------------------------
  function handlePayload(data) {
    if (!data) return;

    if (data.status === "started") {
      setStatus(`Live started — ${data.segments_loaded} segments loaded.`);
      return;
    }

    if (data.type === "batch_reset") {
      clearStack();
      return;
    }

    const spoken = data.spoken || "";
    const score = data.score ?? 0;
    const matched = !!data.matched;
    const seg = data.segment || null;

    spokenBox.textContent = spoken || "—";

    dbgScore.textContent = Number(score).toFixed(3);
    dbgMatched.textContent = matched ? "yes" : "no";
    dbgWindow.textContent = data.used_window_size ?? "—";
    dbgBuffer.textContent = data.buffer_chunks ?? "—";
    dbgCandidate.textContent = data.candidate
      ? `${data.candidate.segment_id || "-"} / ${data.candidate.order || "-"}`
      : "—";

    if (matched && seg) {
      const line =
        seg.english_text?.trim() ||
        seg.malay_text?.trim() ||
        "";

      pushToStack(line, seg);

      // ----------------------------------
      // NEW: Broadcast to full display
      // ----------------------------------
      bc.postMessage({
        text: line,
        order: seg.order
      });

      matchedMalay.textContent = `#${seg.order} ${seg.malay_text || ""}`;
      matchedEnglish.textContent = seg.english_text ? `EN: ${seg.english_text}` : "";
      setStatus(`Matched segment #${seg.order}`);
    } else {
      matchedMalay.textContent = "";
      matchedEnglish.textContent = "";
    }

    addHistoryLine(spoken, score, matched);
  }

  // ----------------------------------
  // Connect WebSocket
  // ----------------------------------
  function connect(sermonId) {
    if (!sermonId) return;

    if (ws) ws.close();

    setStatus("Connecting...");
    ws = new WebSocket(WS_BASE + encodeURIComponent(sermonId));

    ws.onopen = () => setStatus(`Connected to sermon ${sermonId}`);
    ws.onclose = () => setStatus("Disconnected.");
    ws.onerror = () => setStatus("WebSocket error.");

    ws.onmessage = ev => {
      let data;
      try { data = JSON.parse(ev.data); }
      catch { return; }
      handlePayload(data);
    };
  }

  // ----------------------------------
  // UI events
  // ----------------------------------
  form.addEventListener("submit", e => {
    e.preventDefault();
    const id = sermonInput.value.trim();
    if (!id) return;
    connect(id);
  });

  disconnectBtn.addEventListener("click", () => {
    if (ws) ws.close();
    setStatus("Disconnected.");
  });

  clearStackBtn.addEventListener("click", () => {
    clearStack();
    setStatus("Stack cleared.");
  });

  // ----------------------------------
  // OPEN FULL DISPLAY — no WS, no ?id needed
  // ----------------------------------
  openDisplayBtn.addEventListener("click", () => {
    const url = `${window.location.origin}/display.html`;
    window.open(url, "_blank");
  });

  // Auto-connect from ?sermon=
  const params = new URLSearchParams(window.location.search);
  const autoId = params.get("sermon");
  if (autoId) {
    sermonInput.value = autoId;
    connect(autoId);
  }
})();
