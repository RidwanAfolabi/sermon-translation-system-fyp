(function() {
  const statusBox = document.getElementById("status-box");
  const subtitleBox = document.getElementById("subtitle-box");
  const spokenBox = document.getElementById("spoken-box");
  const similarityBox = document.getElementById("similarity-box");
  const matchedMalay = document.getElementById("matched-malay");
  const matchedEnglish = document.getElementById("matched-english");
  const historyList = document.getElementById("history-list");
  const form = document.getElementById("connect-form");
  const sermonInput = document.getElementById("sermon-id");
  const disconnectBtn = document.getElementById("disconnect-btn");

  let ws = null;

  function setStatus(msg) {
    statusBox.textContent = msg;
  }

  function addHistory(spoken, score, matched) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="spoken">${escapeHtml(spoken)}</span>
      <span class="score">${matched ? "✅" : "❌"} ${score.toFixed(3)}</span>
    `;
    historyList.prepend(li);
    while (historyList.children.length > 40) {
      historyList.lastChild.remove();
    }
  }

  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  function connect(sermonId) {
    if (ws) {
      ws.close();
    }
    setStatus("Connecting...");
    ws = new WebSocket(`ws://127.0.0.1:8000/live/stream?sermon_id=${sermonId}`);

    ws.onopen = () => {
      setStatus(`Connected (sermon ${sermonId})`);
    };

    ws.onclose = () => {
      setStatus("Disconnected.");
    };

    ws.onerror = (e) => {
      setStatus("WebSocket error.");
      console.error("WS error", e);
    };

    ws.onmessage = (ev) => {
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch {
        return;
      }
      // initial handshake payload
      if (data.status === "started") {
        setStatus(`Live started: ${data.segments_loaded} segments loaded.`);
        return;
      }
      if (!data.spoken) return;

      // Raw spoken
      spokenBox.textContent = data.spoken;

      // Similarity + candidate
      similarityBox.textContent = `Similarity score: ${data.score.toFixed(3)} ${data.matched ? "(matched)" : "(no match)"}`;

      // Matched segment details
      if (data.matched && data.segment) {
        matchedMalay.textContent = `Matched Malay (#${data.segment.order}): ${data.segment.malay_text}`;
        // english_text only if backend adds it; fallback blank
        if (data.segment.english_text) {
          matchedEnglish.textContent = `Matched English: ${data.segment.english_text}`;
        } else {
          matchedEnglish.textContent = "";
        }
        subtitleBox.textContent = data.segment.english_text || data.segment.malay_text;
        subtitleBox.className = "subtitle-box matched";
      } else {
        matchedMalay.textContent = "";
        matchedEnglish.textContent = "";
        subtitleBox.textContent = data.spoken;
        subtitleBox.className = "subtitle-box unmatched";
      }

      addHistory(data.spoken, data.score, data.matched);
    };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = sermonInput.value.trim();
    if (!id) return;
    connect(id);
  });

  disconnectBtn.addEventListener("click", () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  });

  // Optional: auto-connect if sermon_id provided in URL ?sermon=2
  const params = new URLSearchParams(window.location.search);
  const autoId = params.get("sermon");
  if (autoId) {
    sermonInput.value = autoId;
    connect(autoId);
  }
})();
