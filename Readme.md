# 🌐 Bubble Dashboard — Custom New Tab Extension

A **beautiful, physics-smooth, customizable New Tab dashboard** with draggable glass bubbles, Google search, live clock, dark mode persistence, and intuitive delete interactions — built to feel **premium and fluid**.

> Designed as a **Chrome New Tab extension** with smooth animations and thoughtful UX.

---

## ✨ Features

* **Glassmorphism Bubbles**
  Elegant frosted-glass bubbles with hover depth and smooth animations.

* **Quick Access Shortcuts**
  One-click access to your favorite websites.

* **Add Unlimited Bubbles**
  Create custom bubbles with your own name + URL.

* **Shift-to-Drag Interaction (No Accidental Clicks)**

  * Hold **Shift + Drag** to reposition bubbles
  * Normal click always opens the link
  * No misfires, no frustration

* **Smooth Physics-Based Dragging**

  * Eased movement (no jitter)
  * Momentum-style motion
  * Feels natural and premium
  * Never leaves the screen bounds

* **Trash Bin Delete (Drag to Corner)**

  * Trash bin appears only while dragging
  * Delete **only when dragged deep into corner**
  * Drag out to cancel safely

* **Persistent Layout**

  * Bubble positions saved automatically
  * Deleted bubbles stay deleted
  * Layout restored on every new tab

* **Google Search (Same Tab)**
  Fast Google search directly in the current tab.

* **Live Clock**
  Clean 12-hour real-time clock at the center.

* **Dark Mode (Persistent)**

  * Toggle light/dark mode
  * Choice is remembered across tabs & sessions

* **Smooth Custom Cursor**
  GSAP-powered cursor motion with graceful fallback.

---

## 🎮 Controls

| Action                          | Behavior                |
| ------------------------------- | ----------------------- |
| **Click bubble**                | Open link               |
| **Shift + Drag bubble**         | Move bubble             |
| **Drag to bottom-right corner** | Delete bubble           |
| **Drag away from trash**        | Cancel delete           |
| **+ Add Bubble**                | Create new shortcut     |
| **Dark Mode toggle**            | Switch theme (persists) |

---

## 🚀 Install as Chrome Extension (Recommended)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/DheerajNair123/Hellocustomnewtab.git
```

### 2️⃣ Open Chrome Extensions

* Go to `chrome://extensions`
* Enable **Developer mode** (top-right)

### 3️⃣ Load Extension

* Click **Load unpacked**
* Select the project folder

🎉 Done!
Every new tab now opens **Bubble Dashboard**.

---

## 🧩 Project Structure

```
├── index.html        # New Tab UI
├── style.css         # Glass UI + dark mode styles
├── script.js         # Drag physics, storage, logic
├── icon.png          # Extension icon
├── manifest.json     # Chrome extension config
```

---

## 🛠️ Technologies Used

* **HTML5** – Structure
* **CSS3** – Glassmorphism, transitions, dark mode
* **JavaScript (ES6+)** – Drag physics, state handling
* **GSAP** – Smooth cursor animation
* **localStorage** – Persistent layout & theme

---

## 🧪 UX Design Principles Used

* No accidental actions (Shift-to-drag)
* Forgiving delete (drag-in only)
* Motion follows intention
* No UI appears unless needed
* Everything reversible until release

---

## 📝 Default Bubbles

* YouTube
* LMArena
* Gmail
* GitHub
* WhatsApp Web
* Telegram Web
* ChatGPT

(All fully removable and customizable)

---

## 🐛 Known Notes

* First load randomizes bubble positions automatically
* Works best on desktop Chrome (New Tab override)

---

## 💡 Future Enhancements

* [ ] Edit bubble (rename / change URL)
* [ ] Import / export layouts
* [ ] Background picker (gradient / image)
* [ ] Keyboard shortcuts
* [ ] Idle floating animation
* [ ] Sync across devices (Chrome storage)

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🧠 Share feedback
* 🚀 Suggest ideas

---

**Built with care & obsession for UX**
— *Dheeraj Nair* 💙


Just say the word.
