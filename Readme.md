# Custom New Tab Page

A beautiful, customizable browser new tab page with draggable bubbles, Google search, and a live clock.

<!-- ![Preview](preview.png) -->

## ✨ Features

- **Quick Access Bubbles**: Seven customizable link bubbles with hover effects
- **Add Custom Bubbles**: Create unlimited new bubbles with custom names and URLs
- **Drag & Rearrange**: Move bubbles around with click-drag or double-click-to-pick mode
- **Persistent Storage**: Your bubble positions and custom bubbles are saved in localStorage
- **Google Search**: Quick search box with Enter key and button support
- **Live Clock**: Real-time 12-hour format clock display
- **Dark Mode**: Toggle between light and dark themes (persists across sessions)
- **Custom Cursor**: Smooth animated cursor with GSAP animation
- **Responsive Design**: Adapts to different screen sizes

## 🎮 Controls

- **Single-click** a bubble → Opens the link
- **Double-click** a bubble → Enters move mode (bubble follows cursor)
- **Click-and-drag** → Move bubble immediately
- **Click to place** when in move mode → Saves position
- **+ Add Bubble** button → Create new custom bubbles

## 🚀 Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/DheerajNair123/Hellocustomnewtab.git
   ```

2. Open `index.html` in your browser, or set it as your custom new tab page using a browser extension like:
   - [New Tab Redirect](https://chrome.google.com/webstore/detail/new-tab-redirect) (Chrome)
   - [Custom New Tab Page](https://addons.mozilla.org/en-US/firefox/addon/custom-new-tab-page/) (Firefox)


## 🎨 Customization

### Add Default Bubbles
Edit the HTML in `index.html` to add more default circles:

```html
<a href="https://example.com" class="circle" id="circle8">
  <span>Example</span>
</a>
```

### Change Bubble Styles
Modify `style.css` to customize colors, sizes, and hover effects:

```css
#circle1 {
  background-color: #your-color;
  width: 250px;
  height: 250px;
}
```

### Adjust Dark Mode Colors
Update the `.dark-theme` selectors in `style.css` to match your preferences.

## 🛠️ Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Interactivity and logic
- **GSAP** - Smooth cursor animations
- **localStorage** - Data persistence

## 📝 Default Bubbles

1. YouTube
2. LMArena AI
3. Gmail
4. GitHub
5. WhatsApp Web
6. Telegram Web
7. ChatGPT

## 🐛 Known Issues

- Folder name `assests/` is misspelled (should be `assets/`)
- First-time users need to refresh after adding their first custom bubble for full functionality

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 💡 Future Enhancements

- [ ] Context menu for edit/delete bubbles
- [ ] Import/export bubble configurations
- [ ] Weather widget
- [ ] Background customization
- [ ] Keyboard shortcuts (1-7 keys for quick access)
- [ ] Pomodoro timer
- [ ] Voice search support

---

Made with ❤️ | Star ⭐ this repo if you find it useful!
