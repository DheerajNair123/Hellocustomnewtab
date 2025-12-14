// == Bubble dashboard script ==
// Smooth cursor follow (robust, works with or without GSAP)
document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  if (!cursor) return; // nothing to do

  // Ensure cursor is centered on coordinates (CSS fallback)
  // If you already have this in CSS, it's ok — no harm repeating here
  cursor.style.position = 'fixed';
  cursor.style.left = '0px';
  cursor.style.top = '0px';
  cursor.style.transform = 'translate(-50%, -50%)';
  cursor.style.pointerEvents = 'none';
  cursor.style.zIndex = '10000';

  // Handler uses clientX/clientY so it's relative to viewport
  function rawMove(e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }

  // If GSAP present, use it for smooth motion; otherwise fallback
  if (window.gsap && typeof gsap.to === 'function') {
    // small duration gives smooth trail; tune duration for feel
    window.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.14,
        ease: 'power3.out',
        overwrite: true
      });
    });
    // also update immediately on touch/mouse enter so it doesn't jump
    window.addEventListener('mouseenter', (e) => {
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
    });
  } else {
    // simple reliable fallback
    window.addEventListener('mousemove', rawMove);
    window.addEventListener('mouseenter', rawMove);
  }
});

// ===============================
// Create Trash Bin
// ===============================
function createTrashBin() {
  const trashBin = document.createElement("div");
  trashBin.id = "trash-bin";
  trashBin.innerHTML = '🗑️<div id="trash-hit"></div>';
  document.body.appendChild(trashBin);
  return trashBin;
}

const trashBin = createTrashBin();

// var main = document.querySelector("#main") || document.body;
// var cursor = document.querySelector("#cursor");

// // ===============================
// // Cursor movement
// // ===============================
// if (typeof gsap !== "undefined" && cursor) {
//   main.addEventListener("mousemove", (e) => {
//     gsap.to(cursor, {
//       x: e.pageX,
//       y: e.pageY,
//       duration: 0.6,
//       ease: "power.inOut",
//     });
//   });
// } else if (cursor) {
//   main.addEventListener("mousemove", (e) => {
//     cursor.style.left = e.pageX + "px";
//     cursor.style.top = e.pageY + "px";
//   });
// }

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
  if (!value) return;

  window.location.href =
    `https://www.google.com/search?q=${encodeURIComponent(value)}`;
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
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ===============================
// Drag Handler - FIXED
// ===============================
const DRAG_EASE = 0.18;     // lower = smoother, higher = snappier
const BUBBLE_SIZE = 250;   // your circle size
const EDGE_PADDING = 8;    // small gap from screen edges
function attachDragHandlers(el) {
  let startX, startY, offsetX, offsetY;
  let dragging = false;

  // current rendered position
  let currentX = parseFloat(el.style.left);
  let currentY = parseFloat(el.style.top);

  // target position (where pointer wants it to go)
  let targetX = currentX;
  let targetY = currentY;

  let rafId = null;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function animate() {
    // smooth interpolation
    currentX += (targetX - currentX) * DRAG_EASE;
    currentY += (targetY - currentY) * DRAG_EASE;

//     // ===============================
// // Soft collision avoidance
// // ===============================
// const bubbles = document.querySelectorAll(".circle");

// bubbles.forEach(other => {
//   if (other === el) return;

//   const r1 = {
//     left: currentX,
//     top: currentY,
//     right: currentX + BUBBLE_SIZE,
//     bottom: currentY + BUBBLE_SIZE
//   };

//   const r2 = other.getBoundingClientRect();

//   if (rectsOverlap(r1, r2)) {
//     const cx1 = r1.left + BUBBLE_SIZE / 2;
//     const cy1 = r1.top + BUBBLE_SIZE / 2;
//     const cx2 = r2.left + BUBBLE_SIZE / 2;
//     const cy2 = r2.top + BUBBLE_SIZE / 2;

//     const dx = cx1 - cx2;
//     const dy = cy1 - cy2;

//     const dist = Math.sqrt(dx * dx + dy * dy) || 1;
//     const push = 1.6; // ⭐ smooth strength (tune 1–2)

//     currentX += (dx / dist) * push;
//     currentY += (dy / dist) * push;
//   }
// });

// ===============================
// Hard collision resolution (no overlap)
// ===============================
const bubbles = document.querySelectorAll(".circle");

bubbles.forEach(other => {
  if (other === el) return;

  const r1 = {
    left: currentX,
    top: currentY,
    right: currentX + BUBBLE_SIZE,
    bottom: currentY + BUBBLE_SIZE
  };

  const r2 = other.getBoundingClientRect();

  if (rectsOverlap(r1, r2)) {
    const cx1 = r1.left + BUBBLE_SIZE / 2;
    const cy1 = r1.top + BUBBLE_SIZE / 2;
    const cx2 = r2.left + BUBBLE_SIZE / 2;
    const cy2 = r2.top + BUBBLE_SIZE / 2;

    const dx = cx1 - cx2;
    const dy = cy1 - cy2;

    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const minDist = BUBBLE_SIZE;
    const overlap = minDist - dist;

    if (overlap > 0) {
      const nx = dx / dist;
      const ny = dy / dist;

      // push OUT by overlap (scaled for smoothness)
      currentX += nx * overlap * 0.6;
      currentY += ny * overlap * 0.6;
    }
  }
});

    el.style.left = currentX + "px";
    el.style.top = currentY + "px";
    
    // Trash detection (uses current rendered position)
    const elRect = el.getBoundingClientRect();
    const binRect = trashBin.getBoundingClientRect();
    const hitRect = document.getElementById("trash-hit").getBoundingClientRect();

    const nearTrash =
      elRect.right > binRect.left &&
      elRect.bottom > binRect.top;

    const deepOverlap =
      elRect.right > hitRect.left &&
      elRect.bottom > hitRect.top;

    trashBin.classList.toggle("active", nearTrash);
    trashBin.style.background = deepOverlap ? "#ff2222" : "red";
    trashBin.style.color = deepOverlap ? "white" : "#b3e7ff";

    if (dragging) {
      rafId = requestAnimationFrame(animate);
    }
  }

  el.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (!e.shiftKey) return; // Shift-only drag

    e.preventDefault();

    const rect = el.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;

    offsetX = startX - rect.left;
    offsetY = startY - rect.top;

    currentX = rect.left;
    currentY = rect.top;
    targetX = currentX;
    targetY = currentY;

    dragging = true;
    el.classList.add("dragging");
    el.setPointerCapture(e.pointerId);

    rafId = requestAnimationFrame(animate);

    function move(ev) {
      const rawX = ev.clientX - offsetX;
      const rawY = ev.clientY - offsetY;

      // viewport bounds
      const maxX = window.innerWidth - BUBBLE_SIZE - EDGE_PADDING;
      const maxY = window.innerHeight - BUBBLE_SIZE - EDGE_PADDING;

      targetX = clamp(rawX, EDGE_PADDING, maxX);
      targetY = clamp(rawY, EDGE_PADDING, maxY);
    }

    function up() {
      dragging = false;
      el.classList.remove("dragging");
      trashBin.classList.remove("active");

      cancelAnimationFrame(rafId);

      const elRect = el.getBoundingClientRect();
      const hitRect = document.getElementById("trash-hit").getBoundingClientRect();

      // delete if dropped deep inside trash
      if (
        elRect.right > hitRect.left &&
        elRect.bottom > hitRect.top
      ) {
        deleteBubbleFromStorage(el.id);
        el.remove();
      } else {
        // snap to final smooth position
        el.style.left = targetX + "px";
        el.style.top = targetY + "px";
        saveBubblePosition(el);
         // 🧲 auto-arrange neighbors
        autoArrange(el);
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

function autoArrange(sourceBubble) {
  const bubbles = document.querySelectorAll(".circle");

  bubbles.forEach(other => {
    if (other === sourceBubble) return;

    const r1 = sourceBubble.getBoundingClientRect();
    const r2 = other.getBoundingClientRect();

    if (!rectsOverlap(r1, r2)) return;

    const cx1 = r1.left + BUBBLE_SIZE / 2;
    const cy1 = r1.top + BUBBLE_SIZE / 2;
    const cx2 = r2.left + BUBBLE_SIZE / 2;
    const cy2 = r2.top + BUBBLE_SIZE / 2;

    const dx = cx2 - cx1;
    const dy = cy2 - cy1;

    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const overlap = BUBBLE_SIZE - dist;

    if (overlap <= 0) return;

    const push = overlap * 1.5;

    let nx = dx / dist;
    let ny = dy / dist;

    let targetX = r2.left + nx * push;
    let targetY = r2.top + ny * push;

    // keep inside screen
    targetX = clamp(
      targetX,
      EDGE_PADDING,
      window.innerWidth - BUBBLE_SIZE - EDGE_PADDING
    );
    targetY = clamp(
      targetY,
      EDGE_PADDING,
      window.innerHeight - BUBBLE_SIZE - EDGE_PADDING
    );

    // smooth motion
    if (window.gsap) {
      gsap.to(other, {
        left: targetX,
        top: targetY,
        duration: 0.35,
        ease: "power3.out",
      });
    } else {
      other.style.left = targetX + "px";
      other.style.top = targetY + "px";
    }

    saveBubblePosition(other);
  });
}


// ===============================
// Click Handler - Simple & Reliable
// ===============================
function attachClickHandlers(container) {
  const link = container.querySelector(".bubble-link");

  link.addEventListener("click", (e) => {
    if (e.shiftKey) {
      // Shift-click is for dragging, never open link
      e.preventDefault();
      return;
    }

    // Normal click → open
    window.location.href = link.href;
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
    const x = ev.clientX - offsetX;
    const y = ev.clientY - offsetY;

    el.style.left = x + "px";
    el.style.top = y + "px";

    // ===============================
    // TRASH BIN LOGIC FOR PICK MODE
    // ===============================
    const elRect = el.getBoundingClientRect();
    const binRect = trashBin.getBoundingClientRect();
    const hitRect = document.getElementById("trash-hit").getBoundingClientRect();

    const nearTrash =
      elRect.right > binRect.left && elRect.bottom > binRect.top;

    const deepOverlap =
      elRect.right > hitRect.left && elRect.bottom > hitRect.top;

    // Show bin if near
    trashBin.classList.toggle("active", nearTrash);

    trashBin.style.background = deepOverlap ? "#ff2222" : "red";
    trashBin.style.color = deepOverlap ? "white" : "#b3e7ff";
  }

  function up(ev) {
    el._isPicked = false;

    // ===============================
    // CHECK DELETE ON DROP
    // ===============================
    const elRect = el.getBoundingClientRect();
    const hitRect = document.getElementById("trash-hit").getBoundingClientRect();

    const droppedInside =
      elRect.right > hitRect.left && elRect.bottom > hitRect.top;

    trashBin.classList.remove("active");

    if (droppedInside) {
      deleteBubbleFromStorage(el.id);
      el.remove();
      cleanup();
      return;
    }

    saveBubblePosition(el);
    cleanup();
  }

  function cleanup() {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
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
  // link.target = "_blank";
  // randomize float delay so bubbles don't sync
  div.style.animationDelay = `${Math.random() * 4}s`;

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

function getRandomPosition() {
  const bubbleSize = 250; // circle diameter
  const padding = 60; // keep away from edges

  const x = Math.random() * (window.innerWidth - bubbleSize - padding * 2) + padding;
  const y = Math.random() * (window.innerHeight - bubbleSize - padding * 2) + padding;

  return { left: `${x}px`, top: `${y}px` };
}
// ===============================
// UX polish: Shift = drag mode
// ===============================
document.addEventListener("keydown", (e) => {
  if (e.key === "Shift") {
    document.body.classList.add("drag-mode");
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Shift") {
    document.body.classList.remove("drag-mode");
  }
});


// ===============================
// Init
// ===============================
let bubbles = loadBubbles();

// First load: import default HTML bubbles
// First load: import default HTML bubbles with RANDOM positions
if (!bubbles.length) {
  bubbles = Array.from(document.querySelectorAll(".circle")).map((n) => {
    const randomPos = getRandomPosition();

    return {
      id: n.id || generateId(),
      name: n.innerText.trim(),
      href: n.getAttribute("href"),
      left: randomPos.left,
      top: randomPos.top,
    };
  });

  saveBubbles(bubbles);
}


renderBubbles(bubbles);
// ===============================
// Dark mode persistence (FIXED)
// ===============================
// ===============================
// Dark mode persistence (CLICK + REFRESH FIXED)
// ===============================
(function initDarkMode() {
  const darkToggle = document.getElementById("dark-mode-toggle");
  const DARK_KEY = "dark_mode_enabled";

  if (!darkToggle) return;

  // 1️⃣ Read stored state
  let isDark = localStorage.getItem(DARK_KEY) === "true";

  // 2️⃣ Apply immediately
  document.body.classList.toggle("dark-theme", isDark);
  darkToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

  // 3️⃣ Click → toggle LIVE
  darkToggle.addEventListener("click", () => {
    isDark = !isDark;

    document.body.classList.toggle("dark-theme", isDark);
    localStorage.setItem(DARK_KEY, isDark);

    darkToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
})();

function rectsOverlap(a, b) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}
