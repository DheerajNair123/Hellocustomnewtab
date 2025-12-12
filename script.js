// == Bubble dashboard script (fixed & improved) ==

var main = document.querySelector("#main") || document.body;
var cursor = document.querySelector("#cursor");

// --- Cursor follow (GSAP if available, fallback simple) ---
if (typeof gsap !== 'undefined' && cursor) {
  main.addEventListener("mousemove", (e) => {
    gsap.to(cursor, {
      x: e.pageX,
      y: e.pageY,
      duration: 0.6,
      ease: "power.inOut"
    });
  });
} else if (cursor) {
  main.addEventListener("mousemove", (e) => {
    cursor.style.left = e.pageX + "px";
    cursor.style.top = e.pageY + "px";
  });
}

// --- Clock (shows hours:minutes AM/PM) ---
function updateClock() {
  const timeElement = document.getElementById("time");
  if (!timeElement) return;
  const date = new Date();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12; hours = hours ? hours : 12;
  const time = `${hours}:${minutes}`;
  timeElement.textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

// --- Search handling ---
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(googleSearchUrl, '_blank');
      }
    }
  });
}

function redirectToGoogle() {
  const inp = document.getElementById('search-input');
  if (!inp) return alert('Search input not found.');
  const searchQuery = inp.value.trim();
  if (searchQuery) {
    const googleSearchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(searchQuery);
    window.open(googleSearchUrl, '_blank');
  } else {
    alert('Please enter a search term.');
  }
}

// --- Bubbles: add, drag, persist ---
const STORAGE_KEY = 'bubbles_v1';
const addButton = document.getElementById('add-bubble');

function generateId() { return 'circle_' + Date.now() + '_' + Math.floor(Math.random()*1000); }

function loadBubblesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Failed to parse bubbles from storage', e);
    return null;
  }
}

function saveBubblesToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save bubbles to storage', e);
  }
}

function getExistingBubblesFromDOM() {
  const nodes = Array.from(document.querySelectorAll('.circle'));
  const out = nodes.map(node => {
    // ensure node has an id (so we can update by id later)
    if (!node.id) node.id = generateId();
    const rect = node.getBoundingClientRect();
    // prefer inline style left/top if present; fall back to computed rect
    const left = node.style.left ? node.style.left : Math.round(rect.left) + 'px';
    const top = node.style.top ? node.style.top : Math.round(rect.top) + 'px';
    const name = node.innerText.trim() || (node.querySelector('span')?.innerText) || 'link';
    const href = node.getAttribute('href') || '#';
    return { id: node.id, name, href, left, top };
  });
  return out;
}

function clearExistingBubbleElements() {
  document.querySelectorAll('.circle').forEach(n => n.remove());
}

function attachDragHandlers(el) {
  // Suggestion: in your CSS include `.circle { touch-action: none; user-select: none; }`
  let startX = 0, startY = 0, offsetX = 0, offsetY = 0, moved = false;
  el._suppressClickUntil = 0;
  el._isPicked = false;
  el._pickPointerMove = null;

  el.addEventListener('pointerdown', function(e) {
    // only primary button / single touch
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    startX = e.clientX; startY = e.clientY;
    const rect = el.getBoundingClientRect();
    offsetX = startX - rect.left; offsetY = startY - rect.top;
    moved = false;
    el.setPointerCapture?.(e.pointerId);

    function onPointerMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const distSq = dx*dx + dy*dy;
      if (!moved && distSq > 36) { // > ~6px
        moved = true;
      }
      if (moved) {
        const x = Math.round(ev.clientX - offsetX);
        const y = Math.round(ev.clientY - offsetY);
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      }
    }

    function onPointerUp(ev) {
      try { el.releasePointerCapture?.(ev.pointerId); } catch(_) {}
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      if (moved) {
        // short suppression window so the immediate click after placement doesn't navigate
        el._suppressClickUntil = Date.now() + 300; // 300ms
        updateBubblePositionInStorage(el.id, el.style.left, el.style.top);
      }
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  });

  // click handler
  el.addEventListener('click', function(e) {
    const now = Date.now();
    if (el._suppressClickUntil && now < el._suppressClickUntil) {
      e.preventDefault(); e.stopImmediatePropagation();
      el._suppressClickUntil = 0;
      return;
    }
    if (el._isPicked) {
      e.preventDefault(); e.stopImmediatePropagation();
      stopPick(el);
      el._suppressClickUntil = Date.now() + 300;
      return;
    }
    // else allow default navigation behavior
  });

  // dblclick to enter pick/place mode
  el.addEventListener('dblclick', function(e) {
    e.preventDefault(); e.stopImmediatePropagation();
    startPick(el, e.clientX, e.clientY);
  });
}

function startPick(el, clientX, clientY) {
  el._isPicked = true;
  const rect = el.getBoundingClientRect();
  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;
  el._pickPointerMove = function(ev) {
    const x = Math.round(ev.clientX - offsetX);
    const y = Math.round(ev.clientY - offsetY);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  };
  // listen to pointermove so it works on touch too
  document.addEventListener('pointermove', el._pickPointerMove);
  el.classList.add('dragging');
}

function stopPick(el) {
  if (!el._isPicked) return;
  el._isPicked = false;
  if (el._pickPointerMove) {
    document.removeEventListener('pointermove', el._pickPointerMove);
    el._pickPointerMove = null;
  }
  el.classList.remove('dragging');
  updateBubblePositionInStorage(el.id, el.style.left, el.style.top);
}

function updateBubblePositionInStorage(id, left, top) {
  if (!id) return;
  const list = loadBubblesFromStorage() || [];
  const idx = list.findIndex(x => x.id === id);
  const cleanLeft = left && left.toString().endsWith('px') ? left : (parseInt(left) + 'px');
  const cleanTop = top && top.toString().endsWith('px') ? top : (parseInt(top) + 'px');
  if (idx !== -1) {
    list[idx].left = cleanLeft;
    list[idx].top = cleanTop;
    saveBubblesToStorage(list);
  } else {
    // if not found, add it (keeps storage in sync)
    list.push({ id, name: document.getElementById(id)?.innerText?.trim() || 'link', href: document.getElementById(id)?.getAttribute('href') || '#', left: cleanLeft, top: cleanTop });
    saveBubblesToStorage(list);
  }
}

function createBubbleElement(b) {
  const a = document.createElement('a');
  a.className = 'circle';
  a.id = b.id;
  a.href = b.href || '#';
  a.target = '_blank';
  const span = document.createElement('span');
  span.textContent = b.name || 'link';
  a.appendChild(span);
  a.style.left = b.left || '100px';
  a.style.top = b.top || '100px';
  a.style.position = 'absolute';
  // suggested CSS: a.circle { position:absolute; width:150px; height:150px; display:flex; align-items:center; justify-content:center; }
  attachDragHandlers(a);
  document.body.appendChild(a);
  return a;
}

function renderBubbles(list) {
  clearExistingBubbleElements();
  list.forEach(b => createBubbleElement(b));
}

function addBubble() {
  const name = prompt('Bubble name (label):', 'New');
  if (name === null) return; // cancelled
  const href = prompt('Bubble URL (include https://):', 'https://');
  if (href === null) return;
  const w = 180, h = 180;
  const leftPx = Math.round(window.innerWidth/2 - w/2) + 'px';
  const topPx = Math.round(window.innerHeight/2 - h/2) + 'px';
  const id = generateId();
  const b = { id: id, name: name || 'New', href: href || '#', left: leftPx, top: topPx };
  const list = loadBubblesFromStorage() || [];
  list.push(b);
  saveBubblesToStorage(list);
  createBubbleElement(b);
}

if (addButton) addButton.addEventListener('click', addBubble);

// Initialize bubbles
let bubbles = loadBubblesFromStorage();
if (!bubbles) {
  const captured = getExistingBubblesFromDOM();
  saveBubblesToStorage(captured);
  bubbles = captured;
  // Ensure DOM nodes have handlers (they already have ids)
  document.querySelectorAll('.circle').forEach(n => attachDragHandlers(n));
} else {
  renderBubbles(bubbles);
}
