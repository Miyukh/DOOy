(function () {
  var config = window.kisskhThemeSelector || {};
  var presets = Array.isArray(config.presets) ? config.presets : [];
  var dropdown = null;
  var overlay = null;
  var modal = null;
  var root = document.documentElement;
  var presetMap = {};
  var storageKey = typeof config.storageKey === "string" && config.storageKey ? config.storageKey : "kisskh-theme-preset";
  var legacyKeys = Array.isArray(config.legacyStorageKeys) ? config.legacyStorageKeys : [];
  var aliases = config.presetAliases && typeof config.presetAliases === "object" ? config.presetAliases : {};
  var toggles = [];

  if (!presets.length) {
    return;
  }

  function normalizeSlug(slug) {
    slug = typeof slug === "string" ? slug : "";
    return aliases[slug] || slug;
  }

  presets.forEach(function (preset) {
    if (preset && preset.slug) {
      presetMap[preset.slug] = preset;
    }
  });

  var defaultSlug = normalizeSlug(config.defaultPreset);
  if (!presetMap[defaultSlug]) {
    defaultSlug = presets[0].slug;
  }

  function setBodyClass(slug) {
    if (!document.body) {
      return;
    }

    presets.forEach(function (preset) {
      if (preset && preset.body_class) {
        document.body.classList.remove(preset.body_class);
      }
    });

    if (presetMap[slug] && presetMap[slug].body_class) {
      document.body.classList.add(presetMap[slug].body_class);
    }
  }

  function updateMetaThemeColor(color) {
    if (!color || !document.head) {
      return;
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", color);
  }

  function refreshSelectorElements() {
    dropdown = document.getElementById("kisskh-theme-selector-dropdown");
    overlay = document.getElementById("kisskh-theme-selector-overlay");
    modal = document.getElementById("kisskh-theme-selector-modal");
  }

  function setMobileModalState(isOpen) {
    if (!document.body) {
      return;
    }

    document.body.classList.toggle("kisskh-theme-modal-open", !!isOpen);
  }

  function readStoredPreset() {
    var stored = "";

    try {
      stored = window.localStorage.getItem(storageKey) || "";

      if (!stored && legacyKeys.length) {
        legacyKeys.some(function (key) {
          var value = window.localStorage.getItem(key) || "";
          if (value) {
            stored = value;
            return true;
          }

          return false;
        });
      }
    } catch (error) {
      stored = "";
    }

    return normalizeSlug(stored);
  }

  function writeStoredPreset(slug) {
    try {
      window.localStorage.setItem(storageKey, slug);
      legacyKeys.forEach(function (key) {
        window.localStorage.setItem(key, slug);
      });
    } catch (error) {
      return;
    }
  }

  function closeDesktopMenu() {
    refreshSelectorElements();

    if (dropdown) {
      dropdown.hidden = true;
    }

    if (overlay) {
      overlay.hidden = true;
    }

    toggles.forEach(function (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function closeMobileMenu() {
    refreshSelectorElements();

    if (modal) {
      modal.hidden = true;
    }

    setMobileModalState(false);

    toggles.forEach(function (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function closeMenus() {
    closeDesktopMenu();
    closeMobileMenu();
  }

  function positionDropdown(toggle) {
    refreshSelectorElements();

    if (!dropdown || !toggle) {
      return;
    }

    var rect = toggle.getBoundingClientRect();
    var top = rect.bottom + 10;
    var left = rect.right - dropdown.offsetWidth;

    if (left < 12) {
      left = 12;
    }

    if (left + dropdown.offsetWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - dropdown.offsetWidth - 12);
    }

    dropdown.style.top = top + "px";
    dropdown.style.left = left + "px";
  }

  function openDesktopMenu(toggle) {
    closeMenus();
    refreshSelectorElements();

    if (!dropdown || !overlay) {
      return;
    }

    dropdown.hidden = false;
    overlay.hidden = false;
    positionDropdown(toggle);
    toggle.setAttribute("aria-expanded", "true");
  }

  function openMobileMenu(toggle) {
    closeMenus();
    refreshSelectorElements();

    if (!modal) {
      return;
    }

    modal.hidden = false;
    setMobileModalState(true);
    toggle.setAttribute("aria-expanded", "true");
  }

  function applyPreset(slug) {
    slug = normalizeSlug(slug);

    var preset = presetMap[slug] || presetMap[defaultSlug];
    if (!preset) {
      return defaultSlug;
    }

    var vars = preset.vars || {};
    Object.keys(vars).forEach(function (key) {
      root.style.setProperty(key, vars[key]);
    });

    if (preset.mode) {
      root.style.setProperty("color-scheme", preset.mode);
    }

    root.setAttribute("data-kisskh-active-theme", preset.slug);
    updateMetaThemeColor(vars["--kisskh-theme-color-meta"] || vars["--kisskh-navbar-bg"] || "");
    setBodyClass(preset.slug);

    return preset.slug;
  }

  function updateControls(selectedSlug) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-kisskh-theme-option]"), function (button) {
      var isSelected = button.getAttribute("data-kisskh-theme-option") === selectedSlug;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-checked", isSelected ? "true" : "false");
    });
  }

  function onToggleClick(event) {
    event.preventDefault();

    var toggle = event.currentTarget;

    if (window.innerWidth <= 1130) {
      if (modal && !modal.hidden) {
        closeMenus();
      } else {
        openMobileMenu(toggle);
      }

      return;
    }

    if (dropdown && !dropdown.hidden) {
      closeMenus();
    } else {
      openDesktopMenu(toggle);
    }
  }

  function bindThemeToggles() {
    toggles = Array.prototype.slice.call(document.querySelectorAll("[data-kisskh-theme-toggle]"));
    toggles.forEach(function (toggle) {
      if (toggle.getAttribute("data-kisskh-theme-bound") === "1") {
        return;
      }

      toggle.setAttribute("data-kisskh-theme-bound", "1");
      toggle.addEventListener("click", onToggleClick);
    });
  }

  function bindThemeOptions() {
    refreshSelectorElements();

    Array.prototype.forEach.call(document.querySelectorAll("[data-kisskh-theme-option]"), function (button) {
      if (button.getAttribute("data-kisskh-theme-bound") === "1") {
        return;
      }

      button.setAttribute("data-kisskh-theme-bound", "1");
      button.addEventListener("click", function () {
        currentPreset = applyPreset(button.getAttribute("data-kisskh-theme-option"));
        writeStoredPreset(currentPreset);
        updateControls(currentPreset);
        closeMenus();
      });
    });
  }

  function bindCloseControls() {
    refreshSelectorElements();

    if (overlay) {
      overlay.addEventListener("click", closeMenus);
    }

    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeMenus();
        }
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-kisskh-theme-close]"), function (button) {
      button.addEventListener("click", closeMenus);
    });
  }

  var currentPreset = applyPreset(readStoredPreset() || defaultSlug);

  function init() {
    refreshSelectorElements();
    bindThemeToggles();
    bindThemeOptions();
    bindCloseControls();
    updateControls(currentPreset);
    setBodyClass(currentPreset);
  }

  document.addEventListener("click", function (event) {
    refreshSelectorElements();

    var withinToggle = event.target.closest("[data-kisskh-theme-toggle]");
    var withinDropdown = dropdown && dropdown.contains(event.target);
    var withinModal = modal && modal.contains(event.target);

    if (!withinToggle && !withinDropdown && !withinModal) {
      closeMenus();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenus();
    }
  });

  window.addEventListener("resize", function () {
    closeMenus();
  });

  window.addEventListener("storage", function (event) {
    var watchedKeys = [storageKey].concat(legacyKeys);

    if (watchedKeys.indexOf(event.key) === -1) {
      return;
    }

    currentPreset = applyPreset(readStoredPreset() || defaultSlug);
    updateControls(currentPreset);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
