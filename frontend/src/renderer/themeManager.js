/**
 * Theme Manager for handling modern UI theme configurations
 */
class ThemeManager {
  constructor() {
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
      });
    } else {
      this.addAnimations();
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
}

// Make ThemeManager available globally
window.ThemeManager = ThemeManager;

// Auto-initialize theme
document.addEventListener("DOMContentLoaded", () => {
  const themeManager = new ThemeManager();
  themeManager.init();
});
