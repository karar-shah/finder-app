/**
 * Theme Manager for handling modern UI theme configurations
 */
class ThemeManager {
  constructor() {
    this.colorThemes = {
      default: {
        primaryColor: "#3629B7",
        primaryHover: "#2d1f98",
        primaryLight: "#4a3dd6",
      },
      blue: {
        primaryColor: "#0ea5e9",
        primaryHover: "#0284c7",
        primaryLight: "#38bdf8",
      },
      green: {
        primaryColor: "#10b981",
        primaryHover: "#059669",
        primaryLight: "#34d399",
      },
      orange: {
        primaryColor: "#f97316",
        primaryHover: "#ea580c",
        primaryLight: "#fb923c",
      },
      pink: {
        primaryColor: "#ec4899",
        primaryHover: "#db2777",
        primaryLight: "#f472b6",
      },
    };

    this.theme = {
      primaryColor: "#3629B7",
      primaryHover: "#2d1f98",
      primaryLight: "#4a3dd6",
      transitions: "all 0.15s ease",
      animations: {
        fadeIn: "fadeIn 0.3s ease-in",
        slideUp: "slideUp 0.3s ease-out",
        bounce: "bounce 0.6s ease-in-out infinite alternate",
      },
    };

    // Load saved theme from localStorage
    this.loadSavedTheme();
  }

  /**
   * Apply theme configurations
   */
  applyTheme() {
    const root = document.documentElement;

    // Apply CSS custom properties
    Object.entries(this.theme).forEach(([key, value]) => {
      if (typeof value === "string") {
        root.style.setProperty(`--${this.camelToKebab(key)}`, value);
      }
    });
  }

  /**
   * Convert camelCase to kebab-case
   */
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  }

  /**
   * Add modern animations to elements
   */
  addAnimations() {
    // Add staggered animations to list items
    document.querySelectorAll(".slide-up").forEach((el, index) => {
      el.style.setProperty("--animation-order", index);
      el.style.animationDelay = `${index * 0.1}s`;
    });

    // Add hover effects to cards
    document.querySelectorAll(".modern-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-2px)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });
    });
  }

  /**
   * Initialize theme
   */
  init() {
    this.applyTheme();

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.addAnimations();
        this.setupThemeSwitcher();
      });
    } else {
      this.addAnimations();
      this.setupThemeSwitcher();
    }
  }

  /**
   * Get current theme colors
   */
  getTheme() {
    return this.theme;
  }

  /**
   * Update theme colors (for future dark mode support)
   */
  updateTheme(newTheme) {
    this.theme = { ...this.theme, ...newTheme };
    this.applyTheme();
  }

  /**
   * Switch to a predefined theme
   */
  switchTheme(themeValue) {
    // Parse theme value (e.g., "default-light" or "blue-dark")
    const parts = themeValue.split("-");
    const colorName = parts[0]; // "default", "blue", etc.
    const mode = parts[1]; // "light" or "dark"

    // Apply color theme
    if (this.colorThemes[colorName]) {
      const selectedTheme = this.colorThemes[colorName];
      this.updateTheme(selectedTheme);
    }

    // Apply light or dark mode
    if (mode === "dark") {
      document.documentElement.classList.add("dark-theme");
      this.applyDarkMode();
    } else {
      document.documentElement.classList.remove("dark-theme");
      this.applyLightMode();
    }

    // Save to localStorage
    localStorage.setItem("selectedTheme", themeValue);
  }

  /**
   * Load saved theme from localStorage
   */
  loadSavedTheme() {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      this.switchTheme(savedTheme);
    } else {
      // Default to purple light
      this.switchTheme("default-light");
    }
  }

  /**
   * Apply light mode styles
   */
  applyLightMode() {
    const root = document.documentElement;
    root.style.setProperty("--background", "#ffffff");
    root.style.setProperty("--background-light", "#f9fafb");
    root.style.setProperty("--background-dark", "#f3f4f6");
    root.style.setProperty("--text-primary", "#1f2937");
    root.style.setProperty("--text-secondary", "#6b7280");
    root.style.setProperty("--text-muted", "#9ca3af");
    root.style.setProperty("--border-color", "#e5e7eb");
    root.style.setProperty("--border-light", "#f3f4f6");
  }

  /**
   * Apply dark mode specific styles
   */
  applyDarkMode() {
    const root = document.documentElement;
    root.style.setProperty("--background", "#1f2937");
    root.style.setProperty("--background-light", "#111827");
    root.style.setProperty("--background-dark", "#374151");
    root.style.setProperty("--text-primary", "#f9fafb");
    root.style.setProperty("--text-secondary", "#d1d5db");
    root.style.setProperty("--text-muted", "#9ca3af");
    root.style.setProperty("--border-color", "#374151");
    root.style.setProperty("--border-light", "#4b5563");
  }

  /**
   * Setup theme switcher event listener
   */
  setupThemeSwitcher() {
    const themeSelect = document.getElementById("theme-select");

    if (themeSelect) {
      // Set initial value
      const savedTheme =
        localStorage.getItem("selectedTheme") || "default-light";
      themeSelect.value = savedTheme;

      // Listen for changes
      themeSelect.addEventListener("change", (e) => {
        this.switchTheme(e.target.value);
      });
    }
  }
}

// Make ThemeManager available globally
window.ThemeManager = ThemeManager;

// Auto-initialize theme
document.addEventListener("DOMContentLoaded", () => {
  const themeManager = new ThemeManager();
  themeManager.init();
});
