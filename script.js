// == Bubble dashboard script ==
const trashBin = document.getElementById("trash-bin");

var main = document.querySelector("#main") || document.body;
var cursor = document.querySelector("#cursor");

// ===============================
// Cursor movement
// ===============================
if (typeof gsap !== "undefined" && cursor) {
  main.addEventListener("mousemove", (e) => {
    gsap.to(cursor, {
      x: e.pageX,
      y: e.pageY,
      duration: 0.6,
      ease: "power.inOut",
    });
  });
} else if (cursor) {
  main.addEventListener("mousemove", (e) => {
    cursor.style.left = e.pageX + "px";
    cursor.style.top = e.pageY + "px";
  });
}

// ===============================
// Clock
// ===============================
function updateClock() {
  const timeElement = document.getElementById("time");
  if (!timeElement) return;

  const date = new Date();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  hours = hours % 12 || 12;

  timeElement.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// ===============================
// Google Search
// ===============================
const searchInput = document.getElementById("search-input");

if (searchInput) {
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") redirectToGoogle();
  });
}

function redirectToGoogle() {
  const value = searchInput.value.trim();
  if (value) window.open(`https://www.google.com/search?q=${encodeURIComponent(value)}`, "_blank");
}

// ===============================
// LocalStorage helpers
// ===============================
const STORAGE_KEY = "bubbles_v1";

function generateId() {
  return "bubble_" + Date.now() + "_" + Math.floor(Math.random() * 99999);
}

function loadBubbles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBubbles(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function deleteBubbleFromStorage(id) {
  saveBubbles(loadBubbles().filter((b) => b.id !== id));
}

// ===============================
// Drag Handler (NO click logic here)
// ===============================
function attachDragHandlers(el) {
  let startX, startY, offsetX, offsetY;
  let moved = false;
  el._isPicked = false;

  el.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;

    startX = e.clientX;
    startY = e.clientY;

    const r = el.getBoundingClientRect();
    offsetX = startX - r.left;
    offsetY = startY - r.top;

    moved = false;
    el.setPointerCapture(e.pointerId);

    function move(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (!moved && dx * dx + dy * dy > 36) moved = true;

      if (moved) {
        const x = ev.clientX - offsetX;
        const y = ev.clientY - offsetY;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        // Trash visual
        const elRect = el.getBoundingClientRect();
        const binRect = trashBin.getBoundingClientRect();
        const hitRect = document.getElementById("trash-hit").getBoundingClientRect();

        const nearTrash =
          elRect.right > binRect.left && elRect.bottom > binRect.top;

        const deepOverlap =
          elRect.right > hitRect.left && elRect.bottom > hitRect.top;

        trashBin.classList.toggle("active", nearTrash);
        trashBin.style.background = deepOverlap ? "#ff2222" : "red";
        trashBin.style.color = deepOverlap ? "white" : "#b3e7ff";
      }
    }

    function up(ev) {
      el.releasePointerCapture(e.pointerId);

      trashBin.classList.remove("active");

      const elRect = el.getBoundingClientRect();
      const hitRect = document.getElementById("trash-hit").getBoundingClientRect();

      if (elRect.right > hitRect.left && elRect.bottom > hitRect.top) {
        deleteBubbleFromStorage(el.id);
        el.remove();
        cleanup();
        return;
      }

      if (moved) {
        saveBubblePosition(el);
      }

      cleanup();
    }

    function cleanup() {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  });
}

// ===============================
// Click & Double-click Handler (ONLY on link)
// ===============================
function attachClickHandlers(container) {
  const link = container.querySelector(".bubble-link");
  if (!link) return;

  let clickTimer = null;

  link.addEventListener("click", function (e) {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      return;
    }

    clickTimer = setTimeout(() => {
      clickTimer = null;
      window.open(link.href, "_blank");
    }, 180);
  });

  link.addEventListener("dblclick", function (e) {
    e.preventDefault();
    clearTimeout(clickTimer);
    clickTimer = null;

    const rect = container.getBoundingClientRect();
    startPick(container, e.clientX, e.clientY);
  });
}

// ===============================
// Pick Mode
// ===============================
function startPick(el, cx, cy) {
  el._isPicked = true;

  const rect = el.getBoundingClientRect();
  const offsetX = cx - rect.left;
  const offsetY = cy - rect.top;

  function move(ev) {
    el.style.left = ev.clientX - offsetX + "px";
    el.style.top = ev.clientY - offsetY + "px";
  }

  function up() {
    el._isPicked = false;
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);

    saveBubblePosition(el);
  }

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
}

// ===============================
// Save bubble position
// ===============================
function saveBubblePosition(el) {
  const list = loadBubbles();
  const idx = list.findIndex((b) => b.id === el.id);
  if (idx >= 0) {
    list[idx].left = el.style.left;
    list[idx].top = el.style.top;
    saveBubbles(list);
  }
}

// ===============================
// Create bubble
// ===============================
function createBubbleElement(b) {
  const div = document.createElement("div");
  div.className = "circle";
  div.id = b.id;
  div.style.left = b.left;
  div.style.top = b.top;

  const link = document.createElement("a");
  link.className = "bubble-link";
  link.href = b.href;
  link.target = "_blank";

  const span = document.createElement("span");
  span.textContent = b.name;

  link.appendChild(span);
  div.appendChild(link);

  attachDragHandlers(div);
  attachClickHandlers(div);

  document.body.appendChild(div);
}

// ===============================
// Render
// ===============================
function renderBubbles(list) {
  document.querySelectorAll(".circle").forEach((n) => n.remove());
  list.forEach((b) => createBubbleElement(b));
}

// ===============================
// Add bubble
// ===============================
document.getElementById("add-bubble").onclick = function () {
  const name = prompt("Bubble Name:");
  if (!name) return;

  const href = prompt("Bubble URL (https://...)");
  if (!href) return;

  const id = generateId();
  const bubble = {
    id,
    name,
    href,
    left: `${window.innerWidth / 2 - 100}px`,
    top: `${window.innerHeight / 2 - 100}px`,
  };

  const list = loadBubbles();
  list.push(bubble);
  saveBubbles(list);

  createBubbleElement(bubble);
};

// ===============================
// Init
// ===============================
let bubbles = loadBubbles();

// First load: import default HTML bubbles
if (!bubbles.length) {
  bubbles = Array.from(document.querySelectorAll(".circle")).map((n) => ({
    id: n.id || generateId(),
    name: n.innerText.trim(),
    href: n.getAttribute("href"),
    left: n.style.left || n.getBoundingClientRect().left + "px",
    top: n.style.top || n.getBoundingClientRect().top + "px",
  }));
  saveBubbles(bubbles);
}

renderBubbles(bubbles);
