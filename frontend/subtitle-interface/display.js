// frontend/subtitle-interface/display.js
(() => {
  const container = document.getElementById("stack-container");
  const STACK_MAX = 6;
  const FADE_AFTER = 3;

  let stack = [];

  // CORRECTED escape() mapping
  function escape(s) {
    return (s || "").replace(/[&<>"']/g, c => (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c]
    ));
  }

  function render() {
    container.innerHTML = "";
    stack.forEach((line, idx) => {
      const div = document.createElement("div");
      div.className = "line show";

      if (idx < Math.max(0, stack.length - FADE_AFTER)) {
        div.classList.add("fade");
      }

      div.innerHTML = escape(line);
      container.appendChild(div);
    });
  }

  function pushLine(text) {
    if (!text) return;
    if (stack.length && stack[stack.length - 1] === text) return;

    stack.push(text);

    while (stack.length > STACK_MAX) {
      stack.shift();
    }

    render();
  }

  // -------------------------------------
  // LISTEN FOR BROADCASTED SUBTITLES
  // -------------------------------------
  const bc = new BroadcastChannel("khutbah_subtitles");

  bc.onmessage = ev => {
    const msg = ev.data;
    if (msg?.text) pushLine(msg.text);
  };
})();
