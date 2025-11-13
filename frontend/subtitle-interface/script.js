// frontend/subtitle-interface/script.js

// ---------- CONFIGURATION ----------
const SERVER_URL = "ws://127.0.0.1:8000/live/stream?sermon_id=2"; 
// ↑ Adjust sermon_id to match the one you uploaded + translated

// ---------- UI ELEMENTS ----------
const subtitleBox = document.getElementById("subtitle-box");
const statusBox = document.getElementById("status-box");

// ---------- STATE ----------
let activeBatch = []; // stores currently visible lines (max 5)

// ---------- FUNCTIONS ----------
function renderSubtitles() {
  subtitleBox.innerHTML = activeBatch
    .map(line => `<div class="subtitle-line">${line}</div>`)
    .join("");
  subtitleBox.style.opacity = 1;
}

function showSubtitle(text) {
  activeBatch.push(text);

  // If more than 5 lines, clear and start a new batch
  if (activeBatch.length > 5) {
    subtitleBox.style.opacity = 0; // fade-out before reset
    setTimeout(() => {
      activeBatch = [text];
      renderSubtitles();
    }, 300);
  } else {
    renderSubtitles();
  }
}

function updateStatus(message) {
  statusBox.innerText = message;
}

// ---------- WEBSOCKET CONNECTION ----------
const ws = new WebSocket(SERVER_URL);

ws.onopen = () => {
  console.log("✅ Connected to live subtitle stream");
  updateStatus("Connected. Waiting for sermon subtitles...");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.status === "completed") {
    updateStatus("🕌 Khutbah concluded. Jazakallah khair.");
    subtitleBox.innerHTML = "";
  } else if (data.english_text) {
    showSubtitle(data.english_text);
  }
};

ws.onerror = (error) => {
  console.error("❌ WebSocket error:", error);
  updateStatus("Connection error. Please check the backend.");
};

ws.onclose = () => {
  console.log("🔌 Disconnected from subtitle stream.");
  updateStatus("Disconnected from stream.");
};
