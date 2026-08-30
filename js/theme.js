// Career Pilot Unified Theme Manager (Light / Focus / Dark mode toggle & persistence)
const ThemeManager = (() => {
  const THEME_KEY_1 = "careerPilotTheme";
  const THEME_KEY_2 = "careerpilot_theme";
  const DEFAULT_THEME = "cloud";

  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY_1) || localStorage.getItem(THEME_KEY_2) || DEFAULT_THEME;
  }

  function applyTheme(theme) {
    if (!theme) theme = DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY_1, theme);
    localStorage.setItem(THEME_KEY_2, theme);
    
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', (theme === 'midnight' || theme === 'dark' || theme === 'obsidian') ? '#0E1428' : theme === 'pulse' ? '#F1F3F9' : '#F7F8FC');
    }

    updateToggleButtons(theme);
    updatePopoverActive(theme);
    
    // Dispatch custom event for any listening charts or canvas components
    window.dispatchEvent(new CustomEvent("careerpilot:themechange", { detail: { theme } }));
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || getSavedTheme();
    const nextTheme = (current === "midnight" || current === "dark" || current === "obsidian") ? "cloud" : "midnight";
    applyTheme(nextTheme);
    return nextTheme;
  }

  function updateToggleButtons(theme) {
    const isDark = (theme === "midnight" || theme === "dark" || theme === "obsidian");
    document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
      btn.setAttribute("aria-checked", isDark ? "true" : "false");
      const label = btn.querySelector(".theme-toggle-label");
      if (label) label.textContent = isDark ? "Light Mode" : "Dark Mode";
      const sun = btn.querySelector(".theme-icon-sun");
      const moon = btn.querySelector(".theme-icon-moon");
      if (sun && moon) {
        sun.style.display = isDark ? "inline-flex" : "none";
        moon.style.display = isDark ? "none" : "inline-flex";
      }
    });
  }

  function updatePopoverActive(theme) {
    document.querySelectorAll("[data-theme-choice]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.themeChoice === theme);
    });
  }

  function init() {
    const saved = getSavedTheme();
    applyTheme(saved);

    // Bind popovers if present on the page
    const themeButton = document.getElementById("themeButton");
    const themePopover = document.getElementById("themePopover");

    if (themeButton && themePopover) {
      themeButton.addEventListener("click", (e) => {
        e.stopPropagation();
        themePopover.classList.toggle("open");
      });
      themePopover.querySelectorAll("[data-theme-choice]").forEach(btn => {
        btn.addEventListener("click", () => {
          applyTheme(btn.dataset.themeChoice);
          themePopover.classList.remove("open");
        });
      });
      document.addEventListener("click", (e) => {
        if (!themePopover.contains(e.target) && e.target !== themeButton) {
          themePopover.classList.remove("open");
        }
      });
    }
  }

  return { init, toggleTheme, applyTheme, getSavedTheme, setTheme: applyTheme };
})();

// Global convenience shortcuts
function toggleTheme() {
  return ThemeManager.toggleTheme();
}

function setTheme(theme) {
  return ThemeManager.applyTheme(theme);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ThemeManager.init);
} else {
  ThemeManager.init();
}
