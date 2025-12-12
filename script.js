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
// Drag Handler - FIXED
// ===============================
function attachDragHandlers(el) {
  let startX, startY, offsetX, offsetY;
  let moved = false;
  let pointerDownTime = 0;
  el._isPicked = false;
  el._justDragged = false; // NEW: flag to track if we just dragged

  el.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    
    // If clicking on the link with Shift, don't interfere
    if (e.shiftKey) return;

    // Check if we're clicking directly on the link element
    const clickedLink = e.target.closest('.bubble-link');
    if (clickedLink && !e.shiftKey) {
      // Let the click handler deal with it
      return;
    }

    pointerDownTime = Date.now();
    startX = e.clientX;
    startY = e.clientY;

    const r = el.getBoundingClientRect();
    offsetX = startX - r.left;
    offsetY = startY - r.top;

    moved = false;
    el._justDragged = false; // Reset flag
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
        el._justDragged = true; // Mark that we just finished dragging
        
        // Clear the flag after a short delay
        setTimeout(() => {
          el._justDragged = false;
        }, 100);
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
// Click Handler - Simple & Reliable
// ===============================
function attachClickHandlers(container) {
  const link = container.querySelector(".bubble-link");
  if (!link) return;

  link.addEventListener("click", function (e) {
    // If we just finished dragging, ignore this click
    if (container._justDragged) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    if (e.shiftKey) {
      // Shift + Click = Pick mode (drag without needing to start from edge)
      startPick(container, e.clientX, e.clientY);
    } else {
      // Normal click = Open link
      window.location.href = link.href;
    }
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