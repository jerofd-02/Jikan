// themeSelector.js

const STORAGE_KEY = 'app-theme';

/**
 * Applies a theme to the document and saves it to localStorage.
 * @param {string} theme - 'dark' | 'light' | 'ocean' | 'vulcan'
 */
function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'dark') {
        // Dark is the default (:root), so remove the attribute
        root.removeAttribute('data-theme');
    } else {
        root.setAttribute('data-theme', theme);
    }

    localStorage.setItem(STORAGE_KEY, theme);
    updateActiveButton(theme);
}

/**
 * Marks the matching theme button as active and removes the class from the rest.
 */
function updateActiveButton(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

/**
 * Reads the saved theme from localStorage and applies it immediately
 * (called as soon as the script loads, before paint, to avoid flash).
 */
function loadSavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
    applyTheme(saved);
}

// Apply saved theme ASAP to prevent flash of unstyled content
loadSavedTheme();

// Wire up buttons once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Re-sync button states (DOM wasn't ready during loadSavedTheme)
    updateActiveButton(localStorage.getItem(STORAGE_KEY) || 'dark');

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyTheme(btn.dataset.theme);
        });
    });
});