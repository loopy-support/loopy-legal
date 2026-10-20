(() => {
  'use strict';

  const root = document.documentElement;
  const panel = document.getElementById('accessibility');
  if (!panel) return;

  const storageKey = 'loopy-reading-preferences';
  const textSize = document.getElementById('text-size');
  const highContrast = document.getElementById('high-contrast');
  const underlineLinks = document.getElementById('underline-links');
  const reduceMotion = document.getElementById('reduce-motion');
  const status = document.getElementById('preferences-status');
  const defaults = {
    textSize: '100',
    highContrast: false,
    underlineLinks: false,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
  let preferences = { ...defaults };

  // Reading controls still work when browser privacy settings block storage.
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === 'object') {
      if (['100', '125', '150', '175', '200'].includes(saved.textSize)) {
        preferences.textSize = saved.textSize;
      }
      for (const key of ['highContrast', 'underlineLinks', 'reduceMotion']) {
        if (typeof saved[key] === 'boolean') preferences[key] = saved[key];
      }
    }
  } catch (_) {
    // Use the defaults if storage is unavailable or contains invalid JSON.
  }

  function applyPreferences() {
    root.dataset.textSize = preferences.textSize;
    root.style.setProperty('--reading-scale', Number(preferences.textSize) / 100);
    root.dataset.highContrast = String(preferences.highContrast);
    root.dataset.underlineLinks = String(preferences.underlineLinks);
    root.dataset.reduceMotion = String(preferences.reduceMotion);
    textSize.value = preferences.textSize;
    highContrast.checked = preferences.highContrast;
    underlineLinks.checked = preferences.underlineLinks;
    reduceMotion.checked = preferences.reduceMotion;
  }

  panel.addEventListener('change', () => {
    preferences = {
      textSize: textSize.value,
      highContrast: highContrast.checked,
      underlineLinks: underlineLinks.checked,
      reduceMotion: reduceMotion.checked
    };
    applyPreferences();
    status.textContent = '';
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (_) {
      // The current page remains usable without persistent storage.
    }
  });

  document.getElementById('reset-preferences').addEventListener('click', () => {
    preferences = { ...defaults };
    applyPreferences();
    try {
      localStorage.removeItem(storageKey);
    } catch (_) {
      // Reset the current page even if storage is unavailable.
    }
    status.textContent = root.lang === 'en'
      ? 'Reading preferences reset.'
      : 'Preferencias de lectura restablecidas.';
  });

  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.open) {
      panel.open = false;
      panel.querySelector('summary').focus();
    }
  });

  applyPreferences();
  panel.hidden = false;
})();
