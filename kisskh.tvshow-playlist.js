(function () {
  "use strict";

  function parseBoolean(value, fallbackValue) {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value !== 0;
    }
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
      if (value === "1" || value === "true" || value === "yes" || value === "on") {
        return true;
      }
      if (value === "0" || value === "false" || value === "no" || value === "off") {
        return false;
      }
    }
    return !!fallbackValue;
  }

  function parseJson(node) {
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent || "{}");
    } catch (error) {
      return null;
    }
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    var controller;
    var timer;

    timeoutMs = toPositiveInt(timeoutMs, 20000);
    options = Object.assign({}, options || {});

    if (typeof window.AbortController !== "function") {
      return fetch(url, options);
    }

    controller = new window.AbortController();
    options.signal = controller.signal;
    timer = window.setTimeout(function () {
      controller.abort();
    }, timeoutMs);

    return fetch(url, options).finally(function () {
      window.clearTimeout(timer);
    });
  }

  function createNode(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (typeof text === "string") {
      node.textContent = text;
    }
    return node;
  }

  var SERVER_ARROW_RIGHT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon-arrow-right" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0l-4 4m4-4l-4-4"></path></svg>';
  var SERVER_ARROW_LEFT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon-arrow-left" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4l4 4"></path></svg>';
  var PLAYER_LOADING_BUFFER_SVG_STYLE_1 =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="jw-icon jw-svg-icon-buffer" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity="0.5"/><path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"/></svg>';
  var PLAYER_LOADING_BUFFER_SVG_STYLE_2 =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" class="jw-icon jw-svg-icon-buffer" aria-hidden="true" focusable="false"><defs><linearGradient id="a"><stop offset="0%" stop-color="#09194d00"/><stop offset="100%" stop-color="#09194d00"/></linearGradient><linearGradient id="b"><stop offset="0%" stop-color="#09194D"/><stop offset="100%" stop-color="#09194d00"/></linearGradient><linearGradient id="c" gradientTransform="rotate(90)"><stop offset="0%" stop-color="#062794"/><stop offset="100%" stop-color="#09194D"/></linearGradient><linearGradient id="d"><stop offset="0%" stop-color="#062794"/><stop offset="100%" stop-color="#095AE5"/></linearGradient><linearGradient id="e" gradientTransform="rotate(45)"><stop offset="0%" stop-color="#095AE5"/><stop offset="100%" stop-color="#0FFFFF"/></linearGradient><linearGradient id="g" gradientTransform="rotate(90)"><stop offset="0%" stop-color="#0FFFFF"/><stop offset="100%" stop-color="#FFF"/></linearGradient><linearGradient id="f" gradientTransform="rotate(90)"><stop offset="0%" stop-color="#f6ffff"/><stop offset="100%" stop-color="#FFF"/></linearGradient></defs><g stroke="currentColor" stroke-width="16" stroke-linecap="round"><path stroke="url(#a)" d="M184 100a84 84 0 0 1-58 80"/><path stroke="url(#b)" d="M126 180a84 84 0 0 1-94-31" stroke-dasharray="106"><animate attributeName="strokeDashoffset" keyTimes="0; 0.4; 0.5; 0.6; 1" values="106; 106; 212; 106; 106" dur="2.6s" repeatCount="indefinite"/></path><path stroke="url(#c)" d="M32 149a84 84 0 0 1 0-98" stroke-dasharray="105"><animate attributeName="strokeDashoffset" keyTimes="0; 0.3; 0.4; 0.6; 0.7; 1" values="105; 105; 210; 210; 105; 105" dur="2.6s" repeatCount="indefinite"/></path><path stroke="url(#d)" d="M32 51a84 84 0 0 1 94-31" stroke-dasharray="106"><animate attributeName="strokeDashoffset" keyTimes="0; 0.2; 0.3; 0.7; 0.8; 1" values="106; 106; 212; 212; 106; 106" dur="2.6s" repeatCount="indefinite"/></path><path stroke="url(#e)" d="M126 20a84 84 0 0 1 54 54" stroke-dasharray="80"><animate attributeName="strokeDashoffset" keyTimes="0; 0.1; 0.2; 0.8; 0.9; 1" values="80; 80; 160; 160; 80; 80" dur="2.6s" repeatCount="indefinite"/></path><path stroke="url(#f)" d="M184 97a84 84 0 0 1 0 2"/><path stroke="url(#g)" d="M180 74a84 84 0 0 1 4 26" stroke-dasharray="25"><animate attributeName="strokeDashoffset" keyTimes="0; 0.1; 0.9; 1" values="35; 50; 50; 35" dur="2.6s" repeatCount="indefinite"/></path></g></svg>';
  var DEFAULT_JW_LIBRARY_URLS = [
    "https://content.jwplatform.com/libraries/IDzF9Zmk.js"
  ];
  var jwLibraryPromise = null;
  var subtitleTrackBlobCache = {};
  var subtitleTrackPromiseCache = {};

  function createMaterialIcon(name, extraClass) {
    var node = createNode("span", "material-icons" + (extraClass ? " " + extraClass : ""), String(name || ""));
    node.setAttribute("aria-hidden", "true");
    return node;
  }

  function createFaIcon(className, extraClass) {
    var node = createNode("i", className + (extraClass ? " " + extraClass : ""));
    node.setAttribute("aria-hidden", "true");
    return node;
  }

  function toPositiveInt(value, fallbackValue) {
    var parsed = parseInt(value, 10);
    if (isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    return fallbackValue;
  }

  function normalizeStringList(list) {
    if (!Array.isArray(list)) {
      return [];
    }
    return list
      .map(function (item) {
        return String(item || "").trim();
      })
      .filter(Boolean);
  }

  function resolvePlaylistSettings() {
    var raw =
      window.kisskhTvPlaylist && window.kisskhTvPlaylist.settings
        ? window.kisskhTvPlaylist.settings
        : {};
    var rawTrackAccess =
      raw && raw.trackAccess && typeof raw.trackAccess === "object" ? raw.trackAccess : {};

    var settings = {
      playerContainer:
        raw && raw.playerContainer != null ? String(raw.playerContainer || "").trim() : "",
      playerId: raw && raw.playerId != null ? String(raw.playerId || "").trim() : "kisskh",
      jwPageUrl: raw && raw.jwPageUrl != null ? String(raw.jwPageUrl || "").trim() : "",
      jwKey: raw && raw.jwKey != null ? String(raw.jwKey || "").trim() : "",
      jwLibraryUrls: normalizeStringList(
        raw && Array.isArray(raw.jwLibraryUrls) ? raw.jwLibraryUrls : DEFAULT_JW_LIBRARY_URLS
      ),
      useJw: parseBoolean(raw && raw.useJw, true),
      LoadingStyle: raw && String(raw.LoadingStyle || "").trim() === "1" ? "1" : "2",
      trackAccess: {
        scope: String(rawTrackAccess.scope || "").trim().toLowerCase(),
        postId: toPositiveInt(rawTrackAccess.postId, 0),
        mode: normalizeSubtitleEncryptionMode(rawTrackAccess.mode || ""),
        key: String(rawTrackAccess.k || rawTrackAccess.key || "").trim(),
        iv: String(rawTrackAccess.v || rawTrackAccess.iv || "").trim(),
        proxyUrl:
          rawTrackAccess.proxyUrl != null
            ? String(rawTrackAccess.proxyUrl || "").trim()
            : ""
      },
      bloggerAPI: {
        blogId: normalizeStringList(
          raw && raw.bloggerAPI && Array.isArray(raw.bloggerAPI.blogId) ? raw.bloggerAPI.blogId : []
        )
      },
      apiJson: {
        jsonurl: normalizeStringList(
          raw && raw.apiJson && Array.isArray(raw.apiJson.jsonurl) ? raw.apiJson.jsonurl : []
        )
      }
    };

    window.videoPlayerSettings = Object.assign({}, window.videoPlayerSettings || {}, settings);
    window.VideoPlayerSettings = window.VideoPlayerSettings || window.videoPlayerSettings;
    window.PlaylistConfig = window.PlaylistConfig || window.videoPlayerSettings;
    return settings;
  }

  function getSubtitleAccessConfig() {
    var settings = resolvePlaylistSettings();
    return settings && settings.trackAccess ? settings.trackAccess : {};
  }

  function shouldUseSubtitleAccess(sourceUrl, accessConfig) {
    var src = String(sourceUrl || "").trim();
    var access = accessConfig || getSubtitleAccessConfig();

    if (!src || !access || !access.mode || !access.key || !access.iv) {
      return false;
    }

    if (access.scope === "txt") {
      return /\.txt(?:[?#]|$)/i.test(src);
    }

    return isSubtitleFileUrl(src);
  }

  function buildSubtitleProxyUrl(sourceUrl, accessConfig) {
    var access = accessConfig || getSubtitleAccessConfig();
    var url;

    if (!shouldUseSubtitleAccess(sourceUrl, access)) {
      return String(sourceUrl || "").trim();
    }

    try {
      url = new URL(access.proxyUrl, window.location.href);
      url.searchParams.set("kisskh_subtitle_proxy", "1");
      url.searchParams.set("post", String(access.postId || ""));
      url.searchParams.set("_", String(Date.now()));
      return url.toString();
    } catch (error) {
      return String(sourceUrl || "").trim();
    }
  }

  function getActionIconName(key, active) {
    switch (key) {
      case "favorite":
        return active ? "favorite" : "favorite_border";
      case "share":
        return "share";
      case "report":
        return "error_outline";
      default:
        return "play_arrow";
    }
  }

  function normalizeHttpUrl(url) {
    var value = String(url || "").trim();
    var resolved;

    if (!value) {
      return "";
    }
    if (/^\/\//.test(value)) {
      value = window.location.protocol + value;
    }

    try {
      resolved = new URL(value, window.location.href);
    } catch (error) {
      return "";
    }

    if (!/^https?:$/i.test(resolved.protocol)) {
      return "";
    }
    return resolved.href;
  }

  function loadExternalScript(url) {
    var existing;
    var scripts;
    var index;

    url = normalizeHttpUrl(url);
    if (!url) {
      return Promise.reject(new Error("Missing script URL"));
    }

    existing =
      document.querySelector('script[data-kisskh-player-src="' + url + '"]') ||
      document.querySelector('script[src="' + url + '"]');

    if (!existing) {
      scripts = document.getElementsByTagName("script");
      for (index = 0; index < scripts.length; index += 1) {
        if (normalizeHttpUrl(scripts[index].getAttribute("src")) === url) {
          existing = scripts[index];
          break;
        }
      }
    }

    if (existing) {
      if (existing.getAttribute("data-loaded") === "1" || typeof window.jwplayer === "function") {
        return Promise.resolve();
      }
      return new Promise(function (resolve, reject) {
        existing.addEventListener("load", function () {
          existing.setAttribute("data-loaded", "1");
          resolve();
        });
        existing.addEventListener("error", function () {
          reject(new Error("Failed to load script: " + url));
        });
      });
    }

    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.setAttribute("data-kisskh-player-src", url);
      script.onload = function () {
        script.setAttribute("data-loaded", "1");
        resolve();
      };
      script.onerror = function () {
        reject(new Error("Failed to load script: " + url));
      };
      document.head.appendChild(script);
    });
  }

  function ensureJwLibrary(settings) {
    var urls = normalizeStringList(
      settings && Array.isArray(settings.jwLibraryUrls) ? settings.jwLibraryUrls : DEFAULT_JW_LIBRARY_URLS
    );

    if (typeof window.jwplayer === "function") {
      return Promise.resolve();
    }

    if (jwLibraryPromise) {
      return jwLibraryPromise;
    }

    if (!urls.length) {
      urls = DEFAULT_JW_LIBRARY_URLS.slice();
    }

    function tryUrl(index) {
      if (index >= urls.length) {
        return Promise.reject(new Error("JW Player library unavailable"));
      }

      return loadExternalScript(urls[index])
        .then(function () {
          if (typeof window.jwplayer !== "function") {
            throw new Error("jwplayer not available after script load");
          }
        })
        .catch(function () {
          return tryUrl(index + 1);
        });
    }

    jwLibraryPromise = tryUrl(0).catch(function (error) {
      jwLibraryPromise = null;
      throw error;
    });

    return jwLibraryPromise;
  }

  function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = String(html || "");
    return div.textContent || div.innerText || "";
  }

  function extractIframeSrcFromHtml(html) {
    var wrapper = document.createElement("div");
    var iframe;

    try {
      wrapper.innerHTML = String(html || "");
    } catch (error) {
      return "";
    }

    iframe = wrapper.querySelector("iframe[src]");
    return iframe ? normalizeHttpUrl(iframe.getAttribute("src")) : "";
  }

  function extractMediaUrlFromHtml(html) {
    var match = String(html || "").match(
      /https?:\/\/[^\s"'<>]+(?:\.m3u8|\.mp4|\.mpd|\.m4v|\.mov|\.webm)(?:\?[^\s"'<>]*)?(?:#[^\s"'<>]*)?/i
    );

    return match && match[0] ? normalizeHttpUrl(match[0]) : "";
  }

  function getUrlPath(url) {
    try {
      return new URL(String(url || ""), window.location.href).pathname.toLowerCase();
    } catch (error) {
      return "";
    }
  }

  function getNativeVideoMimeType(url) {
    var path = getUrlPath(url);

    if (/\.(mp4|m4v|mov)$/i.test(path)) {
      return "video/mp4";
    }
    if (/\.webm$/i.test(path)) {
      return "video/webm";
    }
    if (/\.ogv$/i.test(path)) {
      return "video/ogg";
    }

    return "";
  }

  function isNativeVideoUrl(url) {
    return !!getNativeVideoMimeType(url);
  }

  function extractPosterFromHtml(html) {
    var source = String(html || "");
    var patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<img[^>]+data-src=["']([^"']+)["']/i,
      /<img[^>]+src=["']([^"']+)["']/i
    ];
    var match;
    var i;

    for (i = 0; i < patterns.length; i += 1) {
      match = source.match(patterns[i]);
      if (match && match[1]) {
        match = normalizeHttpUrl(match[1]);
        if (match) {
          return match;
        }
      }
    }

    match = source.match(/https?:\/\/[^\s"'<>]+(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]+)?/i);
    return match && match[0] ? match[0].trim() : "";
  }

  function extractPoster(rawText) {
    var source = String(rawText || "");
    var match = source.match(/<img[^>]+src="([^"]+)"/i);
    var poster = "";
    if (match && match[1]) {
      poster = normalizeHttpUrl(match[1]) || String(match[1] || "").trim();
    }
    return {
      poster: poster || extractPosterFromHtml(source),
      textWithoutImg: source.replace(/<img[^>]*>/gi, " ")
    };
  }

  function normalizePostText(rawText) {
    return String(rawText || "")
      .replace(/\r\n?/g, "\n")
      .replace(/&#123;|&lbrace;|&#x7b;/gi, "{")
      .replace(/&#125;|&rbrace;|&#x7d;/gi, "}")
      .replace(/(^|[\s;])(nextserver|nexserver)(?=$|[\s;])/gi, "$1{nextServer}")
      .replace(/(^|[\s;])embed(?=$|[\s;])/gi, "$1{embed}")
      .replace(/\{\s*\{nextserver\}\s*\}/gi, "{nextServer}")
      .replace(/\{\s*\{nexserver\}\s*\}/gi, "{nextServer}")
      .replace(/\{\s*\{embed\}\s*\}/gi, "{embed}")
      .replace(/\{nexServer\}/gi, "{nextServer}");
  }

  function detectType(text) {
    text = String(text || "");
    if (/\|/.test(text) || /\.(vtt|srt|txt)(\?|$)/i.test(text) || /\.(m3u8|mp4|mpd)(\?|$)/i.test(text)) {
      return "jw";
    }
    return "embed";
  }

  function isHiddenEpisodeMarker(value) {
    return /^\s*\*/.test(String(value || ""));
  }

  function stripHiddenMarker(value) {
    return String(value || "").replace(/^\s*\*\s*/, "").trim();
  }

  function isSubtitleFileUrl(url) {
    return /\.(vtt|srt|txt)(?:[?#]|$)/i.test(String(url || "").trim());
  }

  function unique(list) {
    var seen = {};
    return (Array.isArray(list) ? list : []).filter(function (item) {
      if (!item || seen[item]) {
        return false;
      }
      seen[item] = true;
      return true;
    });
  }

  function inferSubtitleFormat(value, fallbackValue) {
    var source = String(value || "").trim().toLowerCase();
    if (source === "vtt" || source === "webvtt" || /\.vtt(?:[?#]|$)/i.test(source)) {
      return "vtt";
    }
    if (source === "srt" || source === "txt" || /\.(srt|txt)(?:[?#]|$)/i.test(source)) {
      return "srt";
    }
    return fallbackValue || "vtt";
  }

  function normalizeSubtitleEncryptionMode(value) {
    var mode = String(value || "").trim().toLowerCase();
    if (mode === "aes-128-cbc-base64" || mode === "aes-128-cbc-base64-lines") {
      return mode;
    }
    return "";
  }

  function normalizeLineBreaks(text) {
    return String(text || "")
      .replace(/^\uFEFF/, "")
      .replace(/\r\n?/g, "\n");
  }

  function isSubtitleSequenceLine(line) {
    return /^\d+$/.test(String(line || "").trim());
  }

  function isSubtitleTimingLine(line) {
    return /\d{2}:\d{2}:\d{2}[,.]\d{2,3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{2,3}/.test(
      String(line || "")
    );
  }

  function isProbablyBase64CiphertextLine(line) {
    var value = String(line || "").trim();
    return value.length >= 16 && value.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(value);
  }

  function decodeBinaryBase64(value) {
    var binary;
    var bytes;
    var index;

    try {
      binary = window.atob(String(value || "").trim());
    } catch (error) {
      throw new Error("Invalid Base64 ciphertext");
    }

    bytes = new Uint8Array(binary.length);
    for (index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  function decodeSubtitleSecretBytes(value, label) {
    var raw = String(value || "");
    var trimmed = raw.trim();
    var bytes;
    var index;

    if (trimmed.length === 16) {
      bytes = new TextEncoder().encode(trimmed);
    } else if (/^[A-Fa-f0-9]{32}$/.test(trimmed)) {
      bytes = new Uint8Array(16);
      for (index = 0; index < 32; index += 2) {
        bytes[index / 2] = parseInt(trimmed.slice(index, index + 2), 16);
      }
    } else if (/^[A-Za-z0-9+/=]+$/.test(trimmed)) {
      bytes = decodeBinaryBase64(trimmed);
    } else {
      bytes = new TextEncoder().encode(raw);
    }

    if (!bytes || bytes.length !== 16) {
      throw new Error(label + " must resolve to exactly 16 bytes");
    }

    return bytes;
  }

  function decryptAesCbcBase64Text(ciphertext, keyValue, ivValue) {
    var subtle = window.crypto && window.crypto.subtle;
    var keyBytes;
    var ivBytes;
    var cipherBytes;

    if (
      !subtle ||
      typeof window.TextEncoder !== "function" ||
      typeof window.TextDecoder !== "function"
    ) {
      return Promise.reject(new Error("Web Crypto API is not available"));
    }

    keyBytes = decodeSubtitleSecretBytes(keyValue, "Subtitle AES key");
    ivBytes = decodeSubtitleSecretBytes(ivValue, "Subtitle AES IV");
    cipherBytes = decodeBinaryBase64(ciphertext);

    return subtle
      .importKey("raw", keyBytes, { name: "AES-CBC" }, false, ["decrypt"])
      .then(function (cryptoKey) {
        return subtle.decrypt({ name: "AES-CBC", iv: ivBytes }, cryptoKey, cipherBytes);
      })
      .then(function (plainBuffer) {
        return new TextDecoder("utf-8").decode(plainBuffer);
      });
  }

  function decryptStructuredSubtitleText(text, keyValue, ivValue) {
    var lines = normalizeLineBreaks(text).split("\n");
    var decryptedCount = 0;

    return Promise.all(
      lines.map(function (line) {
        var trimmed = String(line || "").trim();
        if (
          !trimmed ||
          isSubtitleSequenceLine(trimmed) ||
          isSubtitleTimingLine(trimmed) ||
          !isProbablyBase64CiphertextLine(trimmed)
        ) {
          return Promise.resolve(line);
        }
        return decryptAesCbcBase64Text(trimmed, keyValue, ivValue).then(function (plain) {
          decryptedCount += 1;
          return plain;
        });
      })
    ).then(function (outputLines) {
      if (!decryptedCount) {
        throw new Error("No encrypted subtitle lines were detected");
      }
      return outputLines.join("\n");
    });
  }

  function looksLikePlainSubtitleText(text) {
    var normalized = normalizeLineBreaks(text);
    var lines;

    if (!normalized) {
      return false;
    }
    if (/^\s*WEBVTT\b/i.test(normalized)) {
      return true;
    }
    if (isSubtitleTimingLine(normalized)) {
      return true;
    }

    lines = normalized.split("\n");
    return lines.some(function (line) {
      return isSubtitleTimingLine(line);
    });
  }

  function canDecryptEncryptedSubtitleText() {
    return (
      typeof window.atob === "function" &&
      typeof window.TextEncoder === "function" &&
      typeof window.TextDecoder === "function" &&
      !!(window.crypto && window.crypto.subtle)
    );
  }

  function decryptEncryptedSubtitleText(subtitleText, track) {
    var preferredMode = normalizeSubtitleEncryptionMode(track && track.encryption);
    var key = track && track.key ? track.key : "";
    var iv = track && track.iv ? track.iv : "";
    var attempt;

    function tryWholeFile() {
      return decryptAesCbcBase64Text(subtitleText, key, iv);
    }

    function tryLineMode() {
      return decryptStructuredSubtitleText(subtitleText, key, iv);
    }

    if (!track || !track.encrypted) {
      return Promise.resolve(subtitleText);
    }

    if (preferredMode === "aes-128-cbc-base64-lines") {
      attempt = tryLineMode().catch(function () {
        return tryWholeFile();
      });
    } else if (preferredMode === "aes-128-cbc-base64") {
      attempt = tryWholeFile().catch(function () {
        return tryLineMode();
      });
    } else {
      attempt = tryWholeFile().catch(function () {
        return tryLineMode();
      });
    }

    return attempt.catch(function () {
      if (looksLikePlainSubtitleText(subtitleText)) {
        return subtitleText;
      }
      throw new Error("Subtitle decryption failed");
    });
  }

  function convertSubtitleTextToVtt(text, formatHint) {
    var normalized = normalizeLineBreaks(text);

    if (/^\s*WEBVTT\b/i.test(normalized)) {
      return normalized;
    }

    if (inferSubtitleFormat(formatHint, "vtt") !== "vtt") {
      normalized = normalized.replace(
        /(\d{2}:\d{2}:\d{2}),(\d{2,3})\s*-->\s*(\d{2}:\d{2}:\d{2}),(\d{2,3})/g,
        "$1.$2 --> $3.$4"
      );
    }

    return "WEBVTT\n\n" + normalized.replace(/^\n+/, "");
  }

  function getTrackCacheSignature(track) {
    return [
      track && (track.fetchUrl || track.src || track.file || ""),
      track && (track.fetchBody || ""),
      track && (track.proxyFetchUrl || ""),
      track && (track.proxyFetchBody || ""),
      track && (track.originalSrc || ""),
      track && (track.encryption || ""),
      track && (track.key || ""),
      track && (track.iv || ""),
      track && (track.format || "")
    ].join("::");
  }

  function canCreateSubtitleBlobUrl() {
    return !!(
      window.URL &&
      typeof window.URL.createObjectURL === "function" &&
      typeof window.Blob === "function"
    );
  }

  function createSubtitleBlobUrl(vttText, track) {
    var blobOptions = {
      type: track && track.encrypted ? "application/octet-stream" : "text/vtt"
    };

    return URL.createObjectURL(new Blob([vttText], blobOptions));
  }

  function releaseSubtitleBlobUrl(blobUrl) {
    if (!blobUrl || !window.URL || typeof window.URL.revokeObjectURL !== "function") {
      return;
    }
    try {
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {}
  }

  function purgeCachedSubtitleBlobUrls(blobUrls) {
    var urls = Array.isArray(blobUrls) ? blobUrls : [blobUrls];
    var signature;

    urls.forEach(function (blobUrl) {
      if (!blobUrl) {
        return;
      }
      for (signature in subtitleTrackBlobCache) {
        if (
          Object.prototype.hasOwnProperty.call(subtitleTrackBlobCache, signature) &&
          subtitleTrackBlobCache[signature] === blobUrl
        ) {
          delete subtitleTrackBlobCache[signature];
          delete subtitleTrackPromiseCache[signature];
        }
      }
      releaseSubtitleBlobUrl(blobUrl);
    });
  }

  function fetchSubtitleText(track) {
    var fetchUrl = String((track && (track.fetchUrl || track.src || track.file)) || "").trim();
    var options = {
      method: track && track.fetchBody ? "POST" : "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache"
      }
    };

    if (!fetchUrl) {
      return Promise.reject(new Error("Missing subtitle URL"));
    }

    if (track && track.fetchBody) {
      options.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
      options.body = track.fetchBody;
    }

    return fetchWithTimeout(fetchUrl, options, 18000).then(function (response) {
      if (!response.ok) {
        throw new Error("Subtitle request failed with status " + response.status);
      }
      return response.text();
    });
  }

  function resolveSubtitleTrackSource(track) {
    var signature;
    var needsPreparation;

    if (!track || (!track.src && !track.file && !track.fetchUrl)) {
      return Promise.resolve(null);
    }

    needsPreparation =
      !!track.encrypted ||
      inferSubtitleFormat(track.format || track.fetchUrl || track.src || track.file, "vtt") !== "vtt";

    if (!needsPreparation) {
      return Promise.resolve(track);
    }

    if (!canCreateSubtitleBlobUrl()) {
      return Promise.resolve(null);
    }

    if (track.encrypted && !canDecryptEncryptedSubtitleText() && !track.proxyFetchUrl) {
      return Promise.resolve(null);
    }

    signature = getTrackCacheSignature(track);
    if (subtitleTrackBlobCache[signature]) {
      return Promise.resolve(
        Object.assign({}, track, {
          src: subtitleTrackBlobCache[signature],
          file: subtitleTrackBlobCache[signature]
        })
      );
    }

    if (!subtitleTrackPromiseCache[signature]) {
      subtitleTrackPromiseCache[signature] = fetchSubtitleText(track)
        .then(function (subtitleText) {
          if (track.encrypted && !canDecryptEncryptedSubtitleText()) {
            throw new Error("Encrypted subtitles are not supported in this browser");
          }
          return decryptEncryptedSubtitleText(subtitleText, track);
        })
        .then(function (subtitleText) {
          var vttText = convertSubtitleTextToVtt(
            subtitleText,
            track.format || track.fetchUrl || track.src || track.file
          );
          var blobUrl = createSubtitleBlobUrl(vttText, track);
          subtitleTrackBlobCache[signature] = blobUrl;
          return blobUrl;
        })
        .catch(function (error) {
          var proxyTrack;

          if (!track.encrypted || !track.proxyFetchUrl) {
            throw error;
          }

          proxyTrack = Object.assign({}, track, {
            fetchUrl: track.proxyFetchUrl,
            fetchBody: track.proxyFetchBody || "",
            src: track.proxyFetchUrl,
            file: track.proxyFetchUrl,
            encrypted: false,
            encryption: "",
            key: "",
            iv: "",
            format: "vtt"
          });

          return fetchSubtitleText(proxyTrack).then(function (subtitleText) {
            var vttText = convertSubtitleTextToVtt(subtitleText, "vtt");
            var blobUrl = createSubtitleBlobUrl(vttText, track);
            subtitleTrackBlobCache[signature] = blobUrl;
            return blobUrl;
          });
        })
        .catch(function (error) {
          delete subtitleTrackPromiseCache[signature];
          throw error;
        });
    }

    return subtitleTrackPromiseCache[signature]
      .then(function (blobUrl) {
        return Object.assign({}, track, {
          src: blobUrl,
          file: blobUrl
        });
      })
      .catch(function () {
        return null;
      });
  }

  function resolveSubtitleTrackList(tracks) {
    if (!Array.isArray(tracks) || !tracks.length) {
      return Promise.resolve([]);
    }

    return Promise.all(
      tracks.map(function (track) {
        return resolveSubtitleTrackSource(track);
      })
    ).then(function (resolvedTracks) {
      return resolvedTracks.filter(Boolean);
    });
  }

  function detectSubtitleCodeFromUrl(url) {
    var source = String(url || "").toLowerCase();
    var langs = ["ar", "de", "en", "es", "fr", "hi", "id", "ja", "jp", "km", "ko", "kr", "ms", "pt", "th", "tl", "vi", "zh", "cn"];
    var i;
    var match;
    for (i = 0; i < langs.length; i += 1) {
      if (new RegExp("(?:\\.|-|_|/)" + langs[i] + "\\.(?:vtt|srt|txt)(?:[?#]|$)", "i").test(source)) {
        return langs[i];
      }
    }
    match = source.match(/[?&](?:lang|srclang)=([a-z]{2})/i);
    return match && match[1] ? match[1].toLowerCase() : "";
  }

  function guessSubtitleCodeFromLabel(label) {
    var value = String(label || "").trim().toLowerCase();
    var aliases = {
      arabic: "ar",
      chinese: "zh",
      english: "en",
      filipino: "tl",
      french: "fr",
      german: "de",
      hindi: "hi",
      indonesian: "id",
      japanese: "ja",
      khmer: "km",
      korean: "ko",
      malay: "ms",
      portuguese: "pt",
      spanish: "es",
      thai: "th",
      vietnamese: "vi"
    };

    return aliases[value] || "";
  }

  function parseSubtitleLabelList(rawLabels) {
    return String(rawLabels || "")
      .split(",")
      .map(function (label) {
        return String(label || "").trim();
      })
      .filter(Boolean);
  }

  function buildTracksFromSubtitleUrls(subtitleUrls, subtitleLabels) {
    var labels = Array.isArray(subtitleLabels) ? subtitleLabels : [];
    var tracks = unique(
      (Array.isArray(subtitleUrls) ? subtitleUrls : [])
        .map(function (url) {
          return normalizeHttpUrl(url);
        })
        .filter(function (url) {
          return !!url && isSubtitleFileUrl(url);
        })
    ).map(function (url, index) {
      var detectedCode = detectSubtitleCodeFromUrl(url);
      var displayLabel = String(labels[index] || "").trim();
      var languageCode = detectedCode || guessSubtitleCodeFromLabel(displayLabel) || "en";

      if (!displayLabel) {
        displayLabel = detectedCode.toUpperCase();
      }

        return {
          kind: "subtitles",
          label: displayLabel,
          srclang: languageCode,
          src: url,
          isDefault: false
        };
    });

    applyPreferredSubtitleDefault(tracks);
    return tracks;
  }

  function applyPreferredSubtitleDefault(tracks) {
    var list = Array.isArray(tracks) ? tracks : [];
    var defaultIndex = -1;

    list.forEach(function (track) {
      if (track) {
        track.default = false;
        track.isDefault = false;
      }
    });

    defaultIndex = list.findIndex(function (track) {
      return (
        track &&
        String(track.srclang || "")
          .trim()
          .toLowerCase() === "en"
      );
    });

    if (defaultIndex < 0) {
      defaultIndex = list.findIndex(function (track) {
        return (
          track &&
          String(track.srclang || "")
            .trim()
            .toLowerCase() === "km"
        );
      });
    }

    if (defaultIndex < 0 && list.length) {
      defaultIndex = 0;
    }

    if (defaultIndex >= 0 && list[defaultIndex]) {
      list[defaultIndex].default = true;
      list[defaultIndex].isDefault = true;
    }

    return list;
  }

  function normalizeTrackList(tracks) {
    var accessConfig = getSubtitleAccessConfig();
    var normalized = (Array.isArray(tracks) ? tracks : [])
      .map(function (track, index) {
        var source = normalizeHttpUrl(
          typeof track === "string" ? track : track && (track.src || track.file || track.url || track.vtt)
        );
        var fetchUrl;
        var fetchBody = "";
        var accessEncrypted;
        var encryption;
        var key;
        var iv;
        var proxyFetchUrl = "";
        var proxyFetchBody = "";
        var language = String(
          (track && (track.srclang || track.lang || track.language)) || ""
        )
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        var label = String((track && track.label) || "").trim();
        var kind = String((track && track.kind) || "subtitles")
          .trim()
          .toLowerCase();

        if (!source) {
          return null;
        }

        if (!language) {
          language = detectSubtitleCodeFromUrl(source);
        }

        if (!label) {
          label = language ? language.toUpperCase() : "Subtitle " + (index + 1);
        }

        if (!/^(subtitles|captions|chapters|metadata)$/i.test(kind)) {
          kind = "subtitles";
        }

        accessEncrypted = shouldUseSubtitleAccess(source, accessConfig);
        encryption = normalizeSubtitleEncryptionMode(
          (track && (track.encryption || track.enc)) ||
          (accessEncrypted ? accessConfig.mode : "") ||
          (track && track.encrypted ? "aes-128-cbc-base64" : "")
        );
        key = String(
          (track && (track.key || track.secretKey)) ||
          (accessEncrypted ? accessConfig.key : "") ||
          ""
        ).trim();
        iv = String(
          (track && (track.iv || track.secretIv)) ||
          (accessEncrypted ? accessConfig.iv : "") ||
          ""
        ).trim();

        if (accessEncrypted && accessConfig.proxyUrl && accessConfig.postId) {
          proxyFetchUrl = buildSubtitleProxyUrl(source, accessConfig);
          if (proxyFetchUrl !== source) {
            proxyFetchBody = new URLSearchParams({
              kisskh_subtitle_proxy: "1",
              post: String(accessConfig.postId || ""),
              src: source
            }).toString();
          }
        }

        fetchUrl = accessEncrypted ? source : buildSubtitleProxyUrl(source, accessConfig);

        if (!accessEncrypted && fetchUrl !== source) {
          fetchBody = new URLSearchParams({
            kisskh_subtitle_proxy: "1",
            post: String(accessConfig.postId || ""),
            src: source
          }).toString();
        }

        return {
          kind: kind,
          label: label,
          srclang: language || "en",
          src: fetchUrl,
          file: fetchUrl,
          fetchUrl: fetchUrl,
          fetchBody: fetchBody,
          proxyFetchUrl: proxyFetchUrl,
          proxyFetchBody: proxyFetchBody,
          originalSrc: source,
          format: inferSubtitleFormat(source, "vtt"),
          encrypted: !!(encryption && key && iv),
          encryption: encryption,
          key: key,
          iv: iv,
          default: !!(track && (track.default || track.isDefault))
        };
      })
      .filter(Boolean);

    applyPreferredSubtitleDefault(normalized);
    return normalized;
  }

  function pickFirstValidUrl() {
    var index;
    var value;

    for (index = 0; index < arguments.length; index += 1) {
      value = normalizeHttpUrl(arguments[index]);
      if (value) {
        return value;
      }
    }

    return "";
  }

  function parseEmbed(text) {
    var cleaned = String(text || "").replace(/\{embed\}|\{nextServer\}/gi, "\n");
    var episodes = [];
    cleaned.split(/[;\n]+/).forEach(function (token) {
      var raw = String(token || "").trim();
      var hidden;
      var clean;
      if (!raw) {
        return;
      }
      hidden = isHiddenEpisodeMarker(raw);
      clean = normalizeHttpUrl(stripHiddenMarker(raw).replace(/[;,]+$/, "").trim());
      if (!clean || isSubtitleFileUrl(clean)) {
        return;
      }
      episodes.push({
        url: clean,
        hidden: hidden
      });
    });
    return episodes;
  }

  function parseJw(text) {
    var cleaned = String(text || "").replace(/\{embed\}|\{nextServer\}/gi, "\n");
    var blocks = cleaned
      .split(";")
      .map(function (block) {
        return String(block || "").trim();
      })
      .filter(Boolean);
    var episodes = [];

    blocks.forEach(function (block) {
      var video = "";
      var hidden = false;
      var headerMatch = block.match(/(^|\n)\s*([^|\n]+)\|([^|]*)\|/i);
      var allUrls;
      var media;
      var subtitles;
      var subtitleLabels = [];

      if (headerMatch && headerMatch[2]) {
        hidden = isHiddenEpisodeMarker(headerMatch[2]);
        video = normalizeHttpUrl(stripHiddenMarker(headerMatch[2]));
        subtitleLabels = parseSubtitleLabelList(headerMatch[3]);
      }

      if (!video) {
        hidden = isHiddenEpisodeMarker(block);
        allUrls = block.match(/https?:\/\/[^\s"'<>]+/gi) || [];
        media = allUrls.find(function (url) {
          return /\.(m3u8|mp4|mpd|m4v|mov|webm)(\?|$)/i.test(url);
        });
        if (!media) {
          media = allUrls.find(function (url) {
            return !isSubtitleFileUrl(url) && !/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
          });
        }
        video = normalizeHttpUrl(media);
      }

      if (!video) {
        return;
      }

      subtitles =
        block.match(/https?:\/\/[^\s"'<>]+\.(?:vtt|srt|txt)(?:\?[^\s"'<>]+)?(?:#[^\s"'<>]+)?/gi) || [];

      episodes.push({
        video: video,
        tracks: buildTracksFromSubtitleUrls(subtitles, subtitleLabels),
        hidden: hidden
      });
    });

    return episodes;
  }

  function buildServerItems(type, episodes) {
    var list = Array.isArray(episodes) ? episodes : [];
    var items = [];

    if (type === "embed") {
      list.forEach(function (episode, index) {
        var src = "";
        var hidden = false;
        if (typeof episode === "string") {
          hidden = isHiddenEpisodeMarker(episode);
          src = normalizeHttpUrl(stripHiddenMarker(episode));
        } else if (episode && typeof episode === "object") {
          hidden = !!episode.hidden || isHiddenEpisodeMarker(episode.url || episode.file || episode.src);
          src = normalizeHttpUrl(stripHiddenMarker(episode.url || episode.file || episode.src || ""));
        }
        if (!src) {
          return;
        }
        items.push({
          type: "iframe",
          title: "Episode " + (index + 1),
          url: src,
          hidden: hidden,
          tracks: []
        });
      });
      return items;
    }

    list.forEach(function (episode, index) {
      var file = normalizeHttpUrl(
        stripHiddenMarker((episode && (episode.video || episode.file || episode.url || episode.src)) || "")
      );
      var hidden = !!(episode && episode.hidden) || isHiddenEpisodeMarker(file);
      if (!file) {
        return;
      }
      items.push({
        type: "video",
        title: "Episode " + (index + 1),
        file: file,
        hidden: hidden,
        tracks: Array.isArray(episode && episode.tracks) ? episode.tracks : []
      });
    });

    return items;
  }

  function buildServerObject(type, episodes) {
    var serverType = type === "embed" ? "embed" : "jw";
    var list = Array.isArray(episodes) ? episodes : [];
    return {
      type: serverType,
      episodes: list,
      items: buildServerItems(serverType, list)
    };
  }

  function parsePost(rawText) {
    var extracted = extractPoster(rawText);
    var textSource = extracted.textWithoutImg || "";
    var textFromHtml = stripHtml(textSource);
    var normalized = normalizePostText(textFromHtml || textSource);
    var servers = [];
    var forcedMarker = /\{embed\}\s*\{nextServer\}/i.exec(normalized);
    var splitMarker = /\{nextServer\}/i.exec(normalized);
    var left;
    var right;
    var singleType;

    if (forcedMarker) {
      left = normalized.slice(0, forcedMarker.index);
      right = normalized.slice(forcedMarker.index + forcedMarker[0].length);
      servers.push({ type: "embed", episodes: parseEmbed(left) });
      servers.push({ type: "jw", episodes: parseJw(right) });
    } else if (splitMarker) {
      left = normalized.slice(0, splitMarker.index);
      right = normalized.slice(splitMarker.index + splitMarker[0].length);
      servers.push({
        type: detectType(left),
        episodes: detectType(left) === "jw" ? parseJw(left) : parseEmbed(left)
      });
      servers.push({
        type: detectType(right),
        episodes: detectType(right) === "jw" ? parseJw(right) : parseEmbed(right)
      });
    } else {
      singleType = detectType(normalized);
      servers.push({
        type: singleType,
        episodes: singleType === "jw" ? parseJw(normalized) : parseEmbed(normalized)
      });
    }

    servers = servers.filter(function (server) {
      return server && Array.isArray(server.episodes) && server.episodes.length > 0;
    });

    return {
      poster: extracted.poster || "",
      servers: servers
    };
  }

  function parseBloggerServerData(html) {
    var parsed = parsePost(html || "");
    var servers = (parsed.servers || [])
      .map(function (server) {
        return buildServerObject(server.type, server.episodes);
      })
      .filter(function (server) {
        return Array.isArray(server.items) && server.items.length > 0;
      });

    return {
      poster: parsed.poster || "",
      servers: servers
    };
  }

  function fetchLegacySource(postId, sourceIndex, contentType) {
    var config = window.dtAjax || {};
    var body;
    var normalizedType = String(contentType || "tvshows").trim().toLowerCase();
    var requestUrl;

    if (normalizedType !== "movie") {
      normalizedType = "tvshows";
    }

    if (config.play_method === "wp_json" && config.player_api) {
      requestUrl = new URL(
        String(config.player_api).replace(/\/+$/, "") + "/" + postId + "/" + normalizedType + "/" + sourceIndex,
        window.location.href
      );
      requestUrl.searchParams.set("_", String(Date.now()));
      return fetchWithTimeout(requestUrl.toString(), {
        credentials: "same-origin",
        cache: "no-store"
      }, 20000).then(function (response) {
        if (!response.ok) {
          throw new Error("Player request failed");
        }
        return response.json();
      });
    }

    body = new URLSearchParams();
    body.append("action", "doo_player_ajax");
    body.append("post", String(postId));
    body.append("nume", String(sourceIndex));
    body.append("type", normalizedType);

    return fetchWithTimeout((config && config.url) || "/wp-admin/admin-ajax.php", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: body.toString()
    }, 20000).then(function (response) {
      if (!response.ok) {
        throw new Error("Player request failed");
      }
      return response.json();
    });
  }

  function fetchRealtimePlaylistPayload(postId, mediaType) {
    var config = window.kisskhTvPlaylist || {};
    var ajaxUrl = String(
      config.ajaxUrl || (window.dtAjax && window.dtAjax.url) || "/wp-admin/admin-ajax.php"
    );
    var body = new URLSearchParams();
    var url = new URL(ajaxUrl, window.location.href);

    url.searchParams.set("_", String(Date.now()));
    body.append("action", String(config.realtimeAction || "kisskh_realtime_playlist"));
    body.append("post", String(postId || ""));
    body.append("type", String(mediaType || ""));

    return fetchWithTimeout(url.toString(), {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cache-Control": "no-cache"
      },
      body: body.toString()
    }, 25000)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Fresh playlist request failed");
        }
        return response.json();
      })
      .then(function (response) {
        if (response && response.success && response.data) {
          return response.data;
        }
        throw new Error("Fresh playlist response is empty");
      });
  }

  function PlaylistWidget(root) {
    this.root = root;
    this.payload = parseJson(root.querySelector(".kisskh-playlist-data")) || {};
    this.labels = window.kisskhTvPlaylist || {};
    this.settings = resolvePlaylistSettings();
    this.mediaType = String(
      root.getAttribute("data-media-type") || this.payload.mediaType || "tvshow"
    )
      .trim()
      .toLowerCase();
    this.postId = toPositiveInt(
      root.getAttribute("data-post-id") || (this.payload.show && this.payload.show.id),
      0
    );
    this.show = this.payload.show || {};
    this.meta = this.payload.meta || {};
    this.actions = this.payload.actions || {};
    this.descriptionHtml = String(this.payload.descriptionHtml || "").trim();
    this.playerContext = this.payload.playerContext || {};
    this.playerData = this.payload.playerData || {};
    this.legacySources = Array.isArray(this.payload.sources) ? this.payload.sources : [];
    this.trailerUrl = normalizeHttpUrl(this.payload.trailerUrl || "");
    this.apiPosterUrl = pickFirstValidUrl(
      this.payload.playerPoster,
      root.getAttribute("data-player-poster"),
      this.playerData.poster
    );
    this.posterUrl = pickFirstValidUrl(
      this.apiPosterUrl,
      root.getAttribute("data-poster"),
      this.show.poster,
      this.show.defaultPoster,
      root.getAttribute("data-backdrop"),
      this.show.backdrop
    );
    this.linkUrl = String(this.show.permalink || window.location.href);
    this.servers = [];
    this.currentServerIndex = 0;
    this.currentItemIndex = -1;
    this.favoriteConfig =
      this.actions && this.actions.favorite && typeof this.actions.favorite === "object"
        ? this.actions.favorite
        : {};
    this.favoriteEnabled = parseBoolean(this.favoriteConfig.enabled, true);
    this.favoriteActive = parseBoolean(this.favoriteConfig.active, false);
    this.shareModalNode = null;
    this.shareButton = null;
    this.shareStatusTimer = 0;
    this.handleShareModalKeydownBound = this.handleShareModalKeydown.bind(this);
    this.handleWindowResizeBound = this.handleWindowResize.bind(this);
    this.bigPlayButton = null;
    this.jwPlayer = null;
    this.jwRenderToken = 0;
    this.playRequestToken = 0;
    this.activeSubtitleBlobUrls = [];
    this.videoLoaderNode = null;
    this.loaderMode = "playlist";
    this.loadingStyle = String(this.settings.LoadingStyle || "2") === "1" ? "1" : "2";
    this.loadingSvg =
      this.loadingStyle === "2"
        ? PLAYER_LOADING_BUFFER_SVG_STYLE_2
        : PLAYER_LOADING_BUFFER_SVG_STYLE_1;
    this.loadingVisible = false;
    this.loadingStartedAt = 0;
    this.loadingHideTimer = 0;
  }

  PlaylistWidget.prototype.applyPayloadData = function (payload) {
    payload = payload && typeof payload === "object" ? payload : this.payload || {};
    this.payload = payload;
    this.show = payload.show || {};
    this.meta = payload.meta || {};
    this.actions = payload.actions || {};
    this.descriptionHtml = String(payload.descriptionHtml || "").trim();
    this.playerContext = payload.playerContext || {};
    this.playerData = payload.playerData || {};
    this.legacySources = Array.isArray(payload.sources) ? payload.sources : [];
    this.trailerUrl = normalizeHttpUrl(payload.trailerUrl || "");
    this.apiPosterUrl = pickFirstValidUrl(
      payload.playerPoster,
      this.root.getAttribute("data-player-poster"),
      this.playerData.poster
    );
    this.posterUrl = pickFirstValidUrl(
      this.apiPosterUrl,
      this.root.getAttribute("data-poster"),
      this.show.poster,
      this.show.defaultPoster,
      this.root.getAttribute("data-backdrop"),
      this.show.backdrop
    );
    this.linkUrl = String(this.show.permalink || window.location.href);
    this.favoriteConfig =
      this.actions && this.actions.favorite && typeof this.actions.favorite === "object"
        ? this.actions.favorite
        : {};
    this.favoriteEnabled = parseBoolean(this.favoriteConfig.enabled, true);
    this.favoriteActive = parseBoolean(this.favoriteConfig.active, false);
  };

  PlaylistWidget.prototype.refreshRealtimePayload = function () {
    if (!this.postId) {
      return Promise.resolve(false);
    }

    return fetchRealtimePlaylistPayload(this.postId, this.isMovieMode() ? "movie" : "tvshows")
      .then(
        function (payload) {
          return this.updateFromFreshPayload(payload);
        }.bind(this)
      );
  };

  PlaylistWidget.prototype.updateFromFreshPayload = function (payload) {
    var built;
    var server;
    var wasShowingPoster = !this.posterNode || !this.posterNode.classList.contains("is-hidden");
    var wasPlayingItem = !!(this.posterNode && this.posterNode.classList.contains("is-hidden") && this.currentItemIndex >= 0);
    var activeItemSignature = wasPlayingItem ? this.getPlayableItemSignature(this.getCurrentItem()) : "";
    var refreshedItem;
    var refreshedItemSignature;

    if (!payload || typeof payload !== "object") {
      return false;
    }

    this.applyPayloadData(payload);
    built = this.buildStructuredData();
    if (!built || !Array.isArray(built.servers) || !built.servers.length) {
      return false;
    }

    this.servers = built.servers;
    this.posterUrl = pickFirstValidUrl(
      this.apiPosterUrl,
      built.poster,
      this.root.getAttribute("data-poster"),
      this.show.poster,
      this.show.defaultPoster,
      this.root.getAttribute("data-backdrop"),
      this.show.backdrop
    );

    if (this.currentServerIndex < 0 || this.currentServerIndex >= this.servers.length) {
      this.currentServerIndex = 0;
    }

    server = this.getCurrentServer();
    if (
      this.currentItemIndex >= 0 &&
      (!server || !Array.isArray(server.items) || this.currentItemIndex >= server.items.length)
    ) {
      this.currentItemIndex = -1;
    }

    if (!this.listNode || !this.serverSwitchNode || !this.posterNode) {
      this.render();
      this.root.setAttribute("data-kisskh-fresh-player-data", "1");
      return true;
    }

    this.root.setAttribute("data-kisskh-fresh-player-data", "1");
    if (this.titleNode) {
      this.titleNode.textContent = this.show.title || "";
    }
    if (this.metaNode) {
      this.renderMeta();
    }
    if (this.serverSwitchNode) {
      this.renderServerSwitch();
    }
    if (this.listNode) {
      this.renderList();
    }
    if (wasShowingPoster && this.posterNode) {
      this.updatePosterState(this.getCurrentItem());
    }
    if (wasPlayingItem) {
      refreshedItem = this.getCurrentItem();
      refreshedItemSignature = this.getPlayableItemSignature(refreshedItem);
      if (refreshedItem && refreshedItemSignature && refreshedItemSignature !== activeItemSignature) {
        this.playIndex(this.currentItemIndex, true);
        return true;
      }
    }
    this.syncPaneLayout();
    return true;
  };

  PlaylistWidget.prototype.hasInlinePlayerData = function () {
    return !!(
      this.playerData &&
      typeof this.playerData.html === "string" &&
      this.playerData.html.trim()
    );
  };

  PlaylistWidget.prototype.needsInitialRealtimePayload = function () {
    var playerPostId = String(this.playerContext && this.playerContext.playerPostId || "").trim();

    if (!this.postId || this.hasInlinePlayerData()) {
      return false;
    }

    return !!(playerPostId || this.legacySources.length);
  };

  PlaylistWidget.prototype.renderDataLoadingState = function () {
    this.root.classList.add("is-playlist-data-loading");
    this.servers = [];
    this.currentItemIndex = -1;
    this.buildShell();
    this.renderServerSwitch();
    this.renderListLoadingState();
    this.updatePosterState();
    if (this.posterNode) {
      this.posterNode.classList.remove("is-playable");
      this.posterNode.setAttribute("aria-disabled", "true");
    }
  };

  PlaylistWidget.prototype.clearDataLoadingState = function () {
    this.root.classList.remove("is-playlist-data-loading");
  };

  PlaylistWidget.prototype.getPlayableItemSignature = function (item) {
    var tracks;

    if (!item || typeof item !== "object") {
      return "";
    }

    tracks = Array.isArray(item.tracks)
      ? item.tracks.map(function (track) {
        return [
          track && (track.file || track.src || track.fetchUrl || ""),
          track && (track.label || track.kind || track.srclang || track.language || ""),
          track && (track.format || "")
        ].join("::");
      })
      : [];

    return [
      item.type || "",
      item.file || "",
      item.url || "",
      item.legacySourceIndex || "",
      tracks.join("||")
    ].join("|");
  };

  PlaylistWidget.prototype.isMovieMode = function () {
    return this.mediaType === "movie" || this.mediaType === "movies";
  };

  PlaylistWidget.prototype.getRatingValue = function () {
    var value = String(this.meta && this.meta.ratingValue != null ? this.meta.ratingValue : "").trim();
    var numericValue;
    numericValue = parseFloat(value);

    if (!isFinite(numericValue)) {
      return value;
    }

    if (Math.abs(numericValue - Math.round(numericValue)) < 0.001) {
      return String(Math.round(numericValue));
    }

    return String(Math.round(numericValue * 10) / 10);
  };

  PlaylistWidget.prototype.trackShareCount = function () {
    var body;

    if (!this.postId || !window.dtAjax || !dtAjax.url || !window.fetch) {
      return Promise.resolve();
    }

    body = new URLSearchParams();
    body.append("action", "dt_social_count");
    body.append("id", String(this.postId));

    return fetch(dtAjax.url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: body.toString()
    }).catch(function () {
      return null;
    });
  };

  PlaylistWidget.prototype.openLoginPrompt = function () {
    var loginBox = document.querySelector(".login_box");
    var trigger = document.querySelector(".clicklogin");

    if (loginBox) {
      loginBox.style.display = "block";
      return;
    }

    if (trigger) {
      trigger.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
    }
  };

  PlaylistWidget.prototype.syncFavoriteButton = function (button, iconNode) {
    var labelNode;

    if (!button || !iconNode) {
      return;
    }

    button.classList.toggle("active", !!this.favoriteActive);
    button.setAttribute("aria-pressed", this.favoriteActive ? "true" : "false");
    iconNode.innerHTML = "";
    iconNode.appendChild(
      createMaterialIcon(getActionIconName("favorite", this.favoriteActive), "playlist-action-glyph")
    );

    labelNode = button.querySelector(".playlist-action-label");
    if (labelNode) {
      labelNode.textContent = this.labels.favorite || "Favorite";
    }
  };

  PlaylistWidget.prototype.toggleFavorite = function (button, iconNode) {
    var body;
    var self = this;

    if (!this.favoriteEnabled) {
      return Promise.resolve(false);
    }

    if (!parseBoolean(this.favoriteConfig.loggedIn, false)) {
      this.openLoginPrompt();
      return Promise.resolve(false);
    }

    if (!this.postId || !window.dtAjax || !dtAjax.url || !window.fetch || !this.favoriteConfig.nonce) {
      return Promise.resolve(false);
    }

    if (button) {
      button.disabled = true;
      button.classList.add("is-disabled");
    }

    body = new URLSearchParams();
    body.append("action", "dt_process_list");
    body.append("post_id", String(this.postId));
    body.append("nonce", String(this.favoriteConfig.nonce));

    return fetchWithTimeout(dtAjax.url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: body.toString()
    }, 20000)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Favorite request failed");
        }
        return response.text();
      })
      .then(function () {
        self.favoriteActive = !self.favoriteActive;
        self.favoriteConfig.active = self.favoriteActive;
        self.syncFavoriteButton(button, iconNode);
        return true;
      })
      .catch(function () {
        return false;
      })
      .finally(function () {
        if (button) {
          button.disabled = false;
          button.classList.remove("is-disabled");
        }
      });
  };

  PlaylistWidget.prototype.setShareStatus = function (message) {
    var statusNode = this.shareModalNode
      ? this.shareModalNode.querySelector(".kisskh-share-status")
      : null;

    if (!statusNode) {
      return;
    }

    window.clearTimeout(this.shareStatusTimer);
    statusNode.textContent = message || "";
    statusNode.classList.toggle("is-visible", !!message);

    if (message) {
      this.shareStatusTimer = window.setTimeout(function () {
        statusNode.textContent = "";
        statusNode.classList.remove("is-visible");
      }, 2200);
    }
  };

  PlaylistWidget.prototype.openShareWindow = function (url, name) {
    var features = "toolbar=0,status=0,width=650,height=450";

    if (!url) {
      return;
    }

    this.trackShareCount();
    window.open(url, name || "share", features);
  };

  PlaylistWidget.prototype.copyShareLink = function () {
    var self = this;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(this.linkUrl)
        .then(function () {
          self.trackShareCount();
          self.setShareStatus("Link copied");
        })
        .catch(function () {
          self.setShareStatus("Unable to copy link");
        });
      return;
    }

    this.setShareStatus("Copy is not supported on this device");
  };

  PlaylistWidget.prototype.shareMore = function () {
    var self = this;

    if (navigator.share) {
      navigator
        .share({
          title: this.show.title || "",
          url: this.linkUrl
        })
        .then(function () {
          self.trackShareCount();
        })
        .catch(function () {});
      return;
    }

    this.copyShareLink();
  };

  PlaylistWidget.prototype.getTemplateBackgroundColor = function () {
    var candidates = [
      this.root.closest(".content.full_width_layout"),
      this.root.closest("#single"),
      document.querySelector("#single .content.full_width_layout"),
      document.querySelector("#single"),
      document.body
    ];
    var index;
    var style;
    var color;

    for (index = 0; index < candidates.length; index += 1) {
      if (!candidates[index] || !window.getComputedStyle) {
        continue;
      }

      style = window.getComputedStyle(candidates[index]);
      color = String(style.backgroundColor || "").trim();
      if (color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)") {
        return color;
      }
    }

    return "#171c1f";
  };

  PlaylistWidget.prototype.getShareTargets = function () {
    var url = encodeURIComponent(this.linkUrl);
    var title = encodeURIComponent(this.show.title || "");
    var shareText = encodeURIComponent((this.show.title || "") + " - " + this.linkUrl);
    var image = encodeURIComponent(this.posterUrl || this.apiPosterUrl || "");

    return {
      primary: [
        {
          key: "copy",
          label: "Copy Link",
          iconClass: "fas fa-link",
          toneClass: "is-copy",
          action: this.copyShareLink.bind(this)
        },
        {
          key: "more",
          label: "More",
          iconClass: "fas fa-ellipsis-h",
          toneClass: "is-more",
          action: this.shareMore.bind(this)
        }
      ],
      services: [
        {
          key: "facebook",
          label: "Facebook",
          iconClass: "fab fa-facebook-f",
          toneClass: "is-facebook",
          action: this.openShareWindow.bind(
            this,
            "https://facebook.com/sharer.php?u=" + url,
            "facebook"
          )
        },
        {
          key: "messenger",
          label: "Messenger",
          iconClass: "fab fa-facebook-messenger",
          toneClass: "is-messenger",
          action: function () {
            this.trackShareCount();
            window.location.href = "fb-messenger://share/?link=" + url;
          }.bind(this)
        },
        {
          key: "twitter",
          label: "Twitter",
          iconClass: "fab fa-twitter",
          toneClass: "is-twitter",
          action: this.openShareWindow.bind(
            this,
            "https://twitter.com/intent/tweet?text=" + title + "&url=" + url,
            "twitter"
          )
        },
        {
          key: "reddit",
          label: "Reddit",
          iconClass: "fab fa-reddit-alien",
          toneClass: "is-reddit",
          action: this.openShareWindow.bind(
            this,
            "https://reddit.com/submit?url=" + url + "&title=" + title,
            "reddit"
          )
        },
        {
          key: "pinterest",
          label: "Pinterest",
          iconClass: "fab fa-pinterest-p",
          toneClass: "is-pinterest",
          action: this.openShareWindow.bind(
            this,
            "https://pinterest.com/pin/create/button/?url=" + url + "&media=" + image + "&description=" + title,
            "pinterest"
          )
        },
        {
          key: "telegram",
          label: "Telegram",
          iconClass: "fab fa-telegram-plane",
          toneClass: "is-telegram",
          action: this.openShareWindow.bind(
            this,
            "https://t.me/share/url?url=" + url + "&text=" + title,
            "telegram"
          )
        },
        {
          key: "sms",
          label: "SMS",
          iconClass: "fas fa-sms",
          toneClass: "is-sms",
          action: function () {
            this.trackShareCount();
            window.location.href = "sms:?body=" + shareText;
          }.bind(this)
        },
        {
          key: "email",
          label: "Email",
          iconClass: "fas fa-envelope",
          toneClass: "is-email",
          action: function () {
            this.trackShareCount();
            window.location.href = "mailto:?subject=" + title + "&body=" + shareText;
          }.bind(this)
        },
        {
          key: "line",
          label: "Line",
          iconClass: "fab fa-line",
          toneClass: "is-line",
          action: this.openShareWindow.bind(
            this,
            "https://social-plugins.line.me/lineit/share?url=" + url,
            "line"
          )
        },
        {
          key: "whatsapp",
          label: "WhatsApp",
          iconClass: "fab fa-whatsapp",
          toneClass: "is-whatsapp",
          action: function () {
            this.trackShareCount();
            window.location.href = "https://wa.me/?text=" + shareText;
          }.bind(this)
        }
      ]
    };
  };

  PlaylistWidget.prototype.handleShareModalKeydown = function (event) {
    if (event.key === "Escape") {
      this.closeShareModal();
    }
  };

  PlaylistWidget.prototype.closeShareModal = function () {
    if (!this.shareModalNode) {
      return;
    }

    this.shareModalNode.classList.remove("is-open");
    this.shareModalNode.setAttribute("aria-hidden", "true");
    document.body.classList.remove("kisskh-share-open");
    document.removeEventListener("keydown", this.handleShareModalKeydownBound);
    if (this.shareButton) {
      this.shareButton.classList.remove("active");
    }
  };

  PlaylistWidget.prototype.ensureShareModal = function () {
    var self = this;
    var modal;
    var dialog;
    var header;
    var closeButton;
    var statusNode;
    var serviceGrid;
    var shareTargets;
    var allTargets;

    if (this.shareModalNode) {
      return this.shareModalNode;
    }

    shareTargets = this.getShareTargets();
    modal = createNode("div", "kisskh-share-modal");
    modal.setAttribute("aria-hidden", "true");
    dialog = createNode("div", "kisskh-share-panel");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", this.labels.share || "Share");
    dialog.style.backgroundColor = this.getTemplateBackgroundColor();

    header = createNode("div", "kisskh-share-header");
    header.appendChild(createNode("h4", "kisskh-share-title", this.labels.share || "Share"));
    closeButton = createNode("button", "kisskh-share-close");
    closeButton.type = "button";
    closeButton.appendChild(createMaterialIcon("close"));
    closeButton.addEventListener("click", function () {
      self.closeShareModal();
    });
    header.appendChild(closeButton);

    statusNode = createNode("div", "kisskh-share-status", "");

    serviceGrid = createNode("div", "kisskh-share-grid");
    allTargets = shareTargets.primary.concat(shareTargets.services);
    allTargets.forEach(function (target) {
      var button = createNode("button", "kisskh-share-item " + target.toneClass);
      var iconWrap = createNode("span", "kisskh-share-icon");
      button.type = "button";
      iconWrap.appendChild(createFaIcon(target.iconClass));
      button.appendChild(iconWrap);
      button.appendChild(createNode("span", "kisskh-share-item-label", target.label));
      button.addEventListener("click", function () {
        target.action();
      });
      serviceGrid.appendChild(button);
    });

    dialog.appendChild(header);
    dialog.appendChild(statusNode);
    dialog.appendChild(serviceGrid);

    modal.appendChild(dialog);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        self.closeShareModal();
      }
    });

    document.body.appendChild(modal);
    this.shareModalNode = modal;
    return modal;
  };

  PlaylistWidget.prototype.openShareModal = function () {
    var modal = this.ensureShareModal();

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("kisskh-share-open");
    document.addEventListener("keydown", this.handleShareModalKeydownBound);
    if (this.shareButton) {
      this.shareButton.classList.add("active");
    }
  };

  PlaylistWidget.prototype.buildStructuredData = function () {
    var parsed = { poster: "", servers: [] };
    var self = this;

    if (this.playerData && typeof this.playerData.html === "string" && this.playerData.html.trim()) {
      parsed = parseBloggerServerData(this.playerData.html);
    }

    if (Array.isArray(parsed.servers) && parsed.servers.length) {
      parsed.servers = parsed.servers.map(function (server, serverIndex) {
        var sourceMeta = self.legacySources[serverIndex] || {};
        server.label = sourceMeta.label || (self.labels.source || "Source") + " " + (serverIndex + 1);
        server.server = sourceMeta.server || (server.type === "embed" ? "Embed" : "Blogger");
        server.items = server.items.map(function (item, itemIndex) {
          item.number = itemIndex + 1;
          item.label = self.isMovieMode()
            ? sourceMeta.label || item.title || (self.labels.source || "Source") + " " + item.number
            : item.title || "Episode " + item.number;
          item.serverLabel = server.label;
          item.hasCc = Array.isArray(item.tracks) && item.tracks.length > 0;
          return item;
        });
        return server;
      });
      return parsed;
    }

    if (this.legacySources.length) {
      return {
        poster: "",
        servers: [
          {
            label: this.labels.videoSources || "Video Sources",
            server: this.labels.server || "Server",
            type: "legacy",
            items: this.legacySources.map(function (source, index) {
              return {
                type: "legacy",
                title: source.label || (self.labels.source || "Source") + " " + source.index,
                label: source.label || (self.labels.source || "Source") + " " + source.index,
                legacySourceIndex: source.index,
                number: index + 1,
                hidden: false,
                hasCc: false,
                serverLabel: source.server || ""
              };
            })
          }
        ]
      };
    }

    return parsed;
  };

  PlaylistWidget.prototype.render = function () {
    var built = this.buildStructuredData();
    var hasVisualFallback;
    this.servers = Array.isArray(built.servers) ? built.servers : [];
    this.posterUrl = pickFirstValidUrl(
      this.apiPosterUrl,
      built.poster,
      this.root.getAttribute("data-poster"),
      this.show.poster,
      this.show.defaultPoster,
      this.root.getAttribute("data-backdrop"),
      this.show.backdrop
    );
    hasVisualFallback = !!this.posterUrl;

    if (!this.postId || (!this.servers.length && !this.trailerUrl && !hasVisualFallback)) {
      this.root.innerHTML =
        '<div class="kisskh-playlist-empty">' +
        (this.labels.noSources || "This TV show does not have any video sources yet") +
        "</div>";
      return;
    }

    this.buildShell();
    window.addEventListener("resize", this.handleWindowResizeBound, { passive: true });
    this.applyInitialSelection();
  };

  PlaylistWidget.prototype.init = function () {
    var self = this;

    if (this.needsInitialRealtimePayload()) {
      this.renderDataLoadingState();
      fetchRealtimePlaylistPayload(this.postId, this.isMovieMode() ? "movie" : "tvshows")
        .then(function (payload) {
          self.applyPayloadData(payload);
          self.root.setAttribute("data-kisskh-fresh-player-data", "1");
          return true;
        })
        .catch(function () {
          return false;
        })
        .then(function () {
          self.clearDataLoadingState();
          self.render();
        });
      return;
    }

    this.render();

    this.refreshRealtimePayload()
      .catch(function () {
        return false;
      });
  };

  PlaylistWidget.prototype.buildShell = function () {
    var self = this;
    var card = createNode("div", "playlist-card");
    var body = createNode("div", "playlist-body");
    var playerPane = createNode("div", "playlist-player-pane");
    var listPane = createNode("aside", "playlist-list-pane");
    var actions = createNode("div", "playlist-actions");
    var actionsConfig = [
      { key: "favorite", label: this.labels.favorite || "Favorite" },
      { key: "share", label: this.labels.share || "Share" },
      { key: "rating", label: this.labels.rating || "Rating" },
      { key: "report", label: this.labels.report || "Report" }
    ];

    this.root.innerHTML = "";
    this.root.classList.add("playlist-root");
    this.root.classList.remove("loading-style-1", "loading-style-2");
    this.root.classList.add("loading-style-" + this.loadingStyle);

    this.posterNode = createNode("div", "playlist-poster");
    this.setPoster(this.posterUrl);
    this.posterNode.setAttribute("role", "button");
    this.posterNode.setAttribute("tabindex", "0");
    this.posterNode.setAttribute("aria-label", this.labels.play || "Play");
    this.posterNode.addEventListener("click", function () {
      self.playCurrentSelection();
    });
    this.posterNode.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        self.playCurrentSelection();
      }
    });

    this.playerPaneNode = playerPane;
    this.frameHost = createNode("div", "kisskh-playlist-frame-host");
    this.frameHost.style.display = "none";
    this.loadingNode = createNode("div", "loader-circle-container video-loading loading-overlay invisible");
    this.loadingNode.setAttribute("aria-label", this.labels.loading || "Loading player");
    this.loadingNode.setAttribute("aria-hidden", "true");
    this.loadingNode.style.display = "none";
    this.videoLoaderNode = createNode("span", "loader-circle playlist-loader-circle");
    this.videoLoaderNode.style.display = "none";
    this.videoLoaderNode.innerHTML = this.loadingSvg;
    this.loadingNode.innerHTML = "";
    this.loadingNode.appendChild(this.videoLoaderNode);
    playerPane.appendChild(this.posterNode);
    playerPane.appendChild(this.frameHost);
    playerPane.appendChild(this.loadingNode);

    this.titleNode = createNode("h3", "playlist-list-title", this.show.title || "");
    this.metaNode = createNode("div", "playlist-list-meta", "");
    this.renderMeta();

    actionsConfig.forEach(function (config) {
      var button = document.createElement(config.key === "rating" ? "div" : "button");
      var iconNode;

      if (config.key === "favorite" && !self.favoriteEnabled) {
        return;
      }

      button.className = "playlist-action-btn playlist-action-" + config.key;
      if (config.key !== "rating") {
        button.type = "button";
      }

      if (config.key === "rating") {
        self.mountRatingAction(button);
        actions.appendChild(button);
        return;
      }

      iconNode = createNode("span", "playlist-action-icon", "");
      iconNode.appendChild(createMaterialIcon(getActionIconName(config.key, false), "playlist-action-glyph"));
      button.appendChild(iconNode);
      button.appendChild(createNode("span", "playlist-action-label", config.label));

      if (config.key === "favorite") {
        self.syncFavoriteButton(button, iconNode);
        button.addEventListener("click", function () {
          self.toggleFavorite(button, iconNode);
        });
      }

      if (config.key === "share") {
        self.shareButton = button;
        button.addEventListener("click", function () {
          self.openShareModal();
        });
      }

      if (config.key === "report") {
        button.addEventListener("click", function () {
          window.location.href =
            "mailto:?subject=" +
            encodeURIComponent("Report stream: " + (self.show.title || "")) +
            "&body=" +
            encodeURIComponent(self.linkUrl);
        });
      }

      actions.appendChild(button);
    });

    this.sectionHeadNode = createNode("div", "playlist-section-head");
    if (this.trailerUrl) {
      this.sectionTitleNode = createNode(
        "button",
        "playlist-section-cta",
        this.labels.watchTrailer || "Watch trailer"
      );
      this.sectionTitleNode.type = "button";
      this.sectionTitleNode.addEventListener(
        "click",
        function () {
          this.playTrailer();
        }.bind(this)
      );
    } else {
      this.sectionTitleNode = createNode(
        "div",
        "playlist-section-title",
        this.isMovieMode() ? this.labels.videoSources || "Video Sources" : this.labels.episode || "Episode"
      );
    }
    this.sectionTotalNode = createNode("div", "playlist-list-total", "");
    this.statusBadgeNode = createNode("div", "playlist-status-badge", "");
    this.sectionHeadNode.appendChild(this.sectionTitleNode);
    this.sectionHeadNode.appendChild(this.sectionTotalNode);
    this.sectionHeadNode.appendChild(this.statusBadgeNode);

    this.contextNode = this.buildDescriptionPanel();
    this.listPaneNode = listPane;
    this.serverSwitchNode = createNode("div", "playlist-server-switch");
    this.listNode = createNode("ul", "playlist-list episode-list");

    listPane.appendChild(this.titleNode);
    listPane.appendChild(this.metaNode);
    listPane.appendChild(actions);
    listPane.appendChild(this.sectionHeadNode);
    if (this.contextNode) {
      listPane.appendChild(this.contextNode);
    }
    listPane.appendChild(this.serverSwitchNode);
    listPane.appendChild(this.listNode);

    body.appendChild(playerPane);
    body.appendChild(listPane);
    card.appendChild(body);
    this.root.appendChild(card);
    this.syncPaneLayout();
  };

  PlaylistWidget.prototype.buildDescriptionPanel = function () {
    var contextRoot;
    var detailsNode;
    var summaryNode;
    var questionNode;
    var iconNode;
    var downIcon;
    var upIcon;
    var answerNode;
    var syncExpandedState;

    if (!this.descriptionHtml) {
      return null;
    }

    contextRoot = createNode("div", "playlist-context-top");
    detailsNode = createNode("details", "expansion-panel-dsc playlist-context-item");
    summaryNode = createNode("summary", "expansion-panel-dsc-summary playlist-context-summary");
    questionNode = createNode(
      "span",
      "expansion-panel-dsc-question playlist-context-question",
      this.labels.description || "Description"
    );
    iconNode = createNode("span", "expansion-panel-dsc-icon playlist-context-icon");
    iconNode.setAttribute("aria-hidden", "true");
    downIcon = createNode("span", "material-icons expansion-panel-dsc-icon-down", "keyboard_arrow_down");
    upIcon = createNode("span", "material-icons expansion-panel-dsc-icon-up", "keyboard_arrow_up");
    iconNode.appendChild(downIcon);
    iconNode.appendChild(upIcon);
    answerNode = createNode("div", "expansion-panel-dsc-answer playlist-context-answer");
    answerNode.innerHTML = this.descriptionHtml;

    syncExpandedState = function () {
      var isOpen = !!detailsNode.open;
      summaryNode.setAttribute("aria-expanded", isOpen ? "true" : "false");
      downIcon.hidden = isOpen;
      upIcon.hidden = !isOpen;
    };

    summaryNode.setAttribute("aria-expanded", "false");
    summaryNode.appendChild(questionNode);
    summaryNode.appendChild(iconNode);
    detailsNode.appendChild(summaryNode);
    detailsNode.appendChild(answerNode);
    contextRoot.appendChild(detailsNode);
    detailsNode.addEventListener("toggle", function () {
      syncExpandedState();
      this.syncPaneLayout();
    }.bind(this));
    syncExpandedState();

    return contextRoot;
  };

  PlaylistWidget.prototype.handleWindowResize = function () {
    this.syncPaneLayout();
  };

  PlaylistWidget.prototype.syncPaneLayout = function () {
    var isStacked;
    var paneHeight;

    if (!this.root || !this.listPaneNode || !this.playerPaneNode || !window.getComputedStyle) {
      return;
    }

    isStacked = window.matchMedia && window.matchMedia("(max-width: 1200px)").matches;
    if (isStacked) {
      this.root.style.removeProperty("--playlist-pane-max-height");
      return;
    }

    paneHeight = this.playerPaneNode.offsetHeight;
    if (paneHeight > 0) {
      this.root.style.setProperty("--playlist-pane-max-height", String(paneHeight) + "px");
    }
  };

  PlaylistWidget.prototype.mountRatingAction = function (container) {
    var ratingValue = this.getRatingValue();
    var iconNode;
    var metaNode;
    var labelNode;
    var valueNode;
    var separatorNode;

    if (!container) {
      return;
    }

    container.innerHTML = "";
    container.classList.toggle("is-empty", !ratingValue);

    if (!ratingValue) {
      container.textContent = this.labels.rating || "Rating";
      return;
    }

    iconNode = createNode("span", "playlist-action-icon playlist-rating-icon", "");
    iconNode.appendChild(createMaterialIcon("star", "playlist-action-glyph"));

    metaNode = createNode("span", "playlist-rating-meta", "");
    valueNode = createNode("span", "playlist-rating-value", ratingValue);
    separatorNode = createNode("span", "playlist-rating-separator", "|");
    labelNode = createNode("span", "playlist-rating-label", this.labels.rating || "Rating");

    metaNode.appendChild(valueNode);
    metaNode.appendChild(separatorNode);
    metaNode.appendChild(labelNode);

    container.appendChild(iconNode);
    container.appendChild(metaNode);
  };

  PlaylistWidget.prototype.playTrailer = function () {
    if (!this.trailerUrl) {
      return;
    }

    this.playRequestToken += 1;
    this.currentItemIndex = -1;
    this.renderList();
    this.updatePosterState();
    this.renderPlayerResponse({
      embed_url: this.trailerUrl,
      type: "iframe"
    });
    this.updateRoute();
  };

  PlaylistWidget.prototype.renderMeta = function () {
    var parts = [];
    var summary = String(this.meta.summary || "").trim();
    var items = Array.isArray(this.meta.items) ? this.meta.items : [];

    if (items.length) {
      parts = items
        .map(function (item) {
          return {
            label: String(item && item.label ? item.label : "").trim(),
            url: String(item && item.url ? item.url : "").trim()
          };
        })
        .filter(function (item) {
          return !!item.label;
        });
    } else if (summary) {
      summary.split("|").forEach(function (part) {
        part = String(part || "").trim();
        if (part) {
          parts.push({ label: part, url: "" });
        }
      });
    } else {
      [this.meta.type, this.meta.country, this.meta.network].forEach(function (part) {
        part = String(part || "").trim();
        if (part) {
          parts.push({ label: part, url: "" });
        }
      });
    }

    this.metaNode.innerHTML = "";
    if (!parts.length) {
      this.metaNode.style.display = "none";
      return;
    }

    parts.forEach(
      function (part, index) {
        var itemNode;
        if (part.url) {
          itemNode = document.createElement("a");
          itemNode.className = "playlist-list-meta-item";
          itemNode.href = part.url;
          itemNode.textContent = part.label;
        } else {
          itemNode = createNode("span", "playlist-list-meta-item", part.label);
        }
        this.metaNode.appendChild(itemNode);
        if (index < parts.length - 1) {
          this.metaNode.appendChild(createNode("span", "playlist-list-meta-separator", "|"));
        }
      }.bind(this)
    );

    this.metaNode.style.display = "flex";
  };

  PlaylistWidget.prototype.getCurrentItem = function () {
    var server = this.getCurrentServer();
    var items = server && Array.isArray(server.items) ? server.items : [];

    if (this.currentItemIndex < 0 || this.currentItemIndex >= items.length) {
      return null;
    }

    return items[this.currentItemIndex] || null;
  };

  PlaylistWidget.prototype.getFirstPlayableItemIndex = function () {
    var server = this.getCurrentServer();
    var items = server && Array.isArray(server.items) ? server.items : [];
    var index;

    for (index = 0; index < items.length; index += 1) {
      if (items[index] && !items[index].hidden) {
        return index;
      }
    }

    return -1;
  };

  PlaylistWidget.prototype.getPosterForItem = function (item) {
    if (!item) {
      return pickFirstValidUrl(
        this.root.getAttribute("data-backdrop"),
        this.show.backdrop,
        this.apiPosterUrl,
        this.root.getAttribute("data-player-poster"),
        this.root.getAttribute("data-poster"),
        this.show.poster,
        this.show.defaultPoster
      );
    }

    return pickFirstValidUrl(
      item && (item.poster || item.image || item.thumbnail || item.thumb || item.backdrop),
      this.apiPosterUrl,
      this.root.getAttribute("data-player-poster"),
      this.root.getAttribute("data-backdrop"),
      this.show.backdrop,
      this.posterUrl,
      this.root.getAttribute("data-poster"),
      this.show.poster,
      this.show.defaultPoster
    );
  };

  PlaylistWidget.prototype.setPoster = function (url) {
    var posterUrl = pickFirstValidUrl(url);

    if (!this.posterNode) {
      return;
    }

    if (!posterUrl) {
      this.posterNode.style.backgroundImage = "";
      this.posterNode.classList.remove("has-poster");
      return;
    }

    this.posterNode.style.backgroundImage = 'url("' + posterUrl.replace(/"/g, '\\"') + '")';
    this.posterNode.classList.add("has-poster");
  };

  PlaylistWidget.prototype.updatePosterState = function (item) {
    var visibleItems = this.getVisibleItems();
    var firstPlayableIndex = this.getFirstPlayableItemIndex();
    var server = this.getCurrentServer();
    var firstPlayableItem =
      firstPlayableIndex >= 0 && server && Array.isArray(server.items)
        ? server.items[firstPlayableIndex]
        : null;
    var hasPlayable = visibleItems.length > 0;
    var hasFakePlayer = !hasPlayable && !this.trailerUrl && !!this.posterUrl;
    var targetItem = item || this.getCurrentItem() || firstPlayableItem;

    this.setPoster(this.getPosterForItem(targetItem));

    this.posterNode.classList.toggle("is-playable", hasPlayable || !!this.trailerUrl || hasFakePlayer);
    this.posterNode.setAttribute("aria-disabled", hasPlayable || this.trailerUrl || hasFakePlayer ? "false" : "true");
  };

  PlaylistWidget.prototype.playCurrentSelection = function () {
    var targetIndex = this.currentItemIndex;
    var visibleItems = this.getVisibleItems();
    var hasVisibleTarget = visibleItems.some(function (entry) {
      return entry.index === targetIndex;
    });

    if (targetIndex < 0 || !hasVisibleTarget) {
      targetIndex = this.getFirstPlayableItemIndex();
    }

    if (targetIndex >= 0) {
      this.playIndex(targetIndex, false);
      return;
    }

    if (this.trailerUrl) {
      this.playTrailer();
    }
  };

  PlaylistWidget.prototype.applyInitialSelection = function () {
    var search = new URLSearchParams(window.location.search);
    var requestedServer = toPositiveInt(search.get("sv") || search.get("server"), 1) - 1;
    var requestedEpisode = toPositiveInt(search.get("ep") || search.get("episode"), 0) - 1;

    if (requestedServer < 0 || requestedServer >= this.servers.length) {
      requestedServer = 0;
    }

    this.currentServerIndex = requestedServer;
    this.renderServerSwitch();
    this.renderList();

    if (requestedEpisode >= 0) {
      this.currentItemIndex = requestedEpisode;
      this.showPosterOnly(true);
      return;
    }

    this.showPosterOnly();
  };

  PlaylistWidget.prototype.getCurrentServer = function () {
    return this.servers[this.currentServerIndex] || null;
  };

  PlaylistWidget.prototype.getVisibleItems = function () {
    var server = this.getCurrentServer();
    var items = server && Array.isArray(server.items) ? server.items : [];
    var mapped = items
      .map(function (item, index) {
        return { item: item, index: index };
      })
      .filter(function (entry) {
        return entry.item && !entry.item.hidden;
      });

    if (!this.isMovieMode()) {
      mapped.reverse();
    }

    return mapped;
  };

  PlaylistWidget.prototype.renderServerSwitch = function () {
    var self = this;
    var targetIndex;
    var button;
    var label;
    var isBackward;
    this.serverSwitchNode.innerHTML = "";

    if (!Array.isArray(this.servers) || this.servers.length <= 1) {
      this.serverSwitchNode.style.display = "none";
      return;
    }

    if (this.servers.length === 2) {
      targetIndex = this.currentServerIndex === 0 ? 1 : 0;
    } else {
      targetIndex = (this.currentServerIndex + 1) % this.servers.length;
    }

    label = "Server " + (targetIndex + 1);
    isBackward = targetIndex < this.currentServerIndex;
    button = createNode("button", "playlist-btn playlist-server-btn switch-server", "");
    button.type = "button";
    button.setAttribute("data-server-index", String(targetIndex));
    button.setAttribute("aria-label", "Switch to " + label);
    if (isBackward) {
      button.innerHTML = SERVER_ARROW_LEFT_SVG + '<span class="playlist-server-text">' + label + "</span>";
    } else {
      button.innerHTML = '<span class="playlist-server-text">' + label + "</span>" + SERVER_ARROW_RIGHT_SVG;
    }
    button.addEventListener("click", function () {
      self.currentServerIndex = targetIndex;
      self.currentItemIndex = -1;
      self.renderServerSwitch();
      self.renderList();
      self.showPosterOnly();
      self.updateRoute();
    });
    self.serverSwitchNode.appendChild(button);

    this.serverSwitchNode.style.display = "flex";
  };

  PlaylistWidget.prototype.renderListLoadingState = function () {
    var loaderItem;

    if (!this.listNode) {
      return;
    }

    if (this.sectionTotalNode) {
      this.sectionTotalNode.textContent = "";
      this.sectionTotalNode.style.display = "block";
      this.sectionTotalNode.style.visibility = "hidden";
    }
    if (this.statusBadgeNode) {
      this.statusBadgeNode.textContent = "";
      this.statusBadgeNode.style.display = "none";
    }

    this.listNode.innerHTML = "";
    loaderItem = createNode("li", "playlist-list-loading");
    loaderItem.setAttribute("aria-label", this.labels.loadingList || "Loading playlist");
    loaderItem.innerHTML =
      '<span class="colorful-spinner-container" aria-hidden="true">' +
      '<span class="colorful-spinner"><svg xmlns="http://www.w3.org/2000/svg" viewBox="22 22 44 44" focusable="false"><circle cx="44" cy="44" r="20.2" fill="none"></circle></svg></span>' +
      "</span>";
    this.listNode.appendChild(loaderItem);
  };

  PlaylistWidget.prototype.renderList = function () {
    var self = this;
    var visibleItems = this.getVisibleItems();
    var hasItems = visibleItems.length > 0;
    var yearLabel = String(this.meta.year || "").trim();
    var stateLabel = String(this.meta.status || "").trim();
    var statusLabel = [yearLabel, stateLabel].filter(Boolean).join(" • ");
    var movieMode = this.isMovieMode();
    var emptyNode;

    this.listNode.innerHTML = "";
    this.sectionTotalNode.textContent = movieMode || this.trailerUrl
      ? ""
      : String(visibleItems.length);
    this.sectionTotalNode.style.display = "block";
    this.sectionTotalNode.style.visibility = movieMode || this.trailerUrl ? "hidden" : "visible";
    this.statusBadgeNode.textContent = statusLabel;
    this.statusBadgeNode.style.display = statusLabel ? "inline-flex" : "none";

    if (!hasItems) {
      emptyNode = createNode(
        "li",
        "playlist-list-empty",
        movieMode
          ? this.labels.emptySources || "Video sources will appear here soon"
          : this.labels.emptyEpisodes || "Episodes will appear here soon"
      );
      this.listNode.appendChild(emptyNode);
      return;
    }

    visibleItems.forEach(function (entry, orderIndex) {
      var item = entry.item;
      var li = createNode("li", "playlist-item");
      var button = createNode("button", "episode-item");
      var number = movieMode ? orderIndex + 1 : visibleItems.length - orderIndex;
      button.type = "button";
      button.textContent = "";
      button.setAttribute("data-episode-number", String(number));
      button.setAttribute(
        "aria-label",
        movieMode
          ? (self.labels.source || "Source") + " " + String(number)
          : "Episode " + String(number)
      );
      button.setAttribute("data-episode-index", String(entry.index));
      if (item.hasCc) {
        button.classList.add("has-cc");
      }
      if (self.currentItemIndex === entry.index) {
        button.classList.add("active");
      }
      button.addEventListener("click", function () {
        self.playIndex(entry.index, false);
      });
      li.appendChild(button);
      self.listNode.appendChild(li);
    });
  };

  PlaylistWidget.prototype.showPosterOnly = function (preserveSelection) {
    if (!preserveSelection) {
      this.currentItemIndex = -1;
    }
    this.playRequestToken += 1;
    this.jwRenderToken += 1;
    this.destroyJwPlayer();
    this.frameHost.innerHTML = "";
    this.frameHost.style.display = "none";
    this.updatePosterState();
    this.posterNode.classList.remove("is-hidden");
    this.setLoading(false, true);
    this.renderList();
  };

  PlaylistWidget.prototype.setLoaderVisible = function (visible, mode) {
    if (!this.loadingNode) {
      return;
    }

    this.loaderMode = mode || "video";
    this.loadingNode.classList.remove("is-playlist-loading");
    this.loadingNode.classList.toggle("is-video-loading", visible);
    this.loadingNode.style.display = visible ? "flex" : "none";
    this.loadingNode.setAttribute("aria-hidden", visible ? "false" : "true");
    this.loadingNode.classList.toggle("invisible", !visible);

    if (this.videoLoaderNode) {
      this.videoLoaderNode.style.display = visible ? "flex" : "none";
    }
  };

  PlaylistWidget.prototype.setLoading = function (enabled, immediate) {
    var self = this;
    var minVisibleMs = 260;
    var elapsed;
    var delay;

    if (this.loadingHideTimer) {
      window.clearTimeout(this.loadingHideTimer);
      this.loadingHideTimer = 0;
    }

    if (enabled) {
      if (this.loadingVisible) {
        return;
      }
      this.loadingVisible = true;
      this.loadingStartedAt = Date.now();
      this.root.classList.add("is-player-loading");
      this.setLoaderVisible(true, "video");
      window.requestAnimationFrame(function () {
        if (self.loadingVisible) {
          self.setLoaderVisible(true, "video");
        }
      });
      return;
    }

    if (!this.loadingVisible && (!this.loadingNode || this.loadingNode.classList.contains("invisible"))) {
      return;
    }

    elapsed = Date.now() - (this.loadingStartedAt || 0);
    delay = immediate ? 0 : Math.max(0, minVisibleMs - elapsed);
    this.loadingVisible = false;
    this.loadingHideTimer = window.setTimeout(function () {
      self.loadingHideTimer = 0;
      if (self.loadingVisible) {
        return;
      }
      self.root.classList.remove("is-player-loading");
      self.setLoaderVisible(false, "video");
    }, delay);
  };

  PlaylistWidget.prototype.buildJwUrlFromFile = function (fileUrl, tracks) {
    var base = String(this.settings.jwPageUrl || "").trim();
    var source = normalizeHttpUrl(fileUrl);
    var normalizedTracks = normalizeTrackList(tracks);
    var url;

    if (!source) {
      return "";
    }

    if (!base) {
      return source;
    }

    try {
      url = new URL(base, window.location.href);
      url.searchParams.set("source", source);
      url.searchParams.set("id", String(this.postId || ""));
      url.searchParams.set("type", "mp4");
      url.searchParams.set("autoplay", "1");
      if (normalizedTracks.length) {
        url.searchParams.set("tracks", JSON.stringify(normalizedTracks));
      } else {
        url.searchParams.delete("tracks");
      }
      return url.toString();
    } catch (error) {
      return source;
    }
  };

  PlaylistWidget.prototype.buildJwPageUrl = function (item) {
    return this.buildJwUrlFromFile(item && item.file ? item.file : "", []);
  };

  PlaylistWidget.prototype.destroyJwPlayer = function () {
    this.releaseActiveSubtitleBlobUrls([]);

    if (!this.jwPlayer) {
      return;
    }

    try {
      if (typeof this.jwPlayer.remove === "function") {
        this.jwPlayer.remove();
      } else if (typeof this.jwPlayer.stop === "function") {
        this.jwPlayer.stop();
      }
    } catch (error) {}

    this.jwPlayer = null;
  };

  PlaylistWidget.prototype.releaseActiveSubtitleBlobUrls = function (exceptUrls) {
    var keepMap = {};
    var toRelease = [];

    (Array.isArray(exceptUrls) ? exceptUrls : []).forEach(function (url) {
      if (url) {
        keepMap[url] = true;
      }
    });

    (Array.isArray(this.activeSubtitleBlobUrls) ? this.activeSubtitleBlobUrls : []).forEach(function (url) {
      if (!url || keepMap[url]) {
        return;
      }
      toRelease.push(url);
    });

    if (toRelease.length) {
      purgeCachedSubtitleBlobUrls(toRelease);
    }

    this.activeSubtitleBlobUrls = (Array.isArray(exceptUrls) ? exceptUrls : []).filter(Boolean);
  };

  PlaylistWidget.prototype.rememberActiveSubtitleBlobUrls = function (tracks) {
    var nextUrls = [];

    if (Array.isArray(tracks)) {
      tracks.forEach(function (track) {
        var src = track && (track.src || track.file);
        if (typeof src === "string" && src.indexOf("blob:") === 0) {
          nextUrls.push(src);
        }
      });
    }

    this.releaseActiveSubtitleBlobUrls(unique(nextUrls));
  };

  PlaylistWidget.prototype.getJwTracks = function (tracks) {
    return (Array.isArray(tracks) ? tracks : [])
      .map(function (track) {
        var kind;

        if (!track || (!track.src && !track.file)) {
          return null;
        }

        kind = String(track.kind || "captions").toLowerCase();
        if (kind === "subtitles") {
          kind = "captions";
        }

        return {
          file: track.src || track.file,
          kind: kind || "captions",
          label: track.label || String(track.srclang || "en").toUpperCase(),
          "default": !!(track.default || track.isDefault)
        };
      })
      .filter(Boolean);
  };

  PlaylistWidget.prototype.applyJwSkinClass = function () {
    var node = null;
    var nested = null;
    var i = 0;

    if (this.jwPlayer && typeof this.jwPlayer.getContainer === "function") {
      try {
        node = this.jwPlayer.getContainer();
      } catch (error) {
        node = null;
      }
    }

    if (!node && this.frameHost && this.frameHost.querySelector) {
      node =
        this.frameHost.querySelector(".jwplayer") ||
        this.frameHost.querySelector(".kisskh-playlist-jwplayer");
    }

    if (node && node.classList) {
      node.classList.add("jw-skin-cs");
    }

    if (node && node.querySelectorAll) {
      nested = node.querySelectorAll(".jwplayer");
      for (i = 0; i < nested.length; i += 1) {
        if (nested[i] && nested[i].classList) {
          nested[i].classList.add("jw-skin-cs");
        }
      }
    }
  };

  PlaylistWidget.prototype.seekJwBySeconds = function (seconds) {
    var position = 0;
    var duration = 0;
    var target;

    if (!this.jwPlayer || typeof this.jwPlayer.seek !== "function") {
      return;
    }

    try {
      if (typeof this.jwPlayer.getPosition === "function") {
        position = Number(this.jwPlayer.getPosition() || 0);
      }
    } catch (error) {
      position = 0;
    }

    if (!isFinite(position)) {
      position = 0;
    }

    target = position + Number(seconds || 0);

    try {
      if (typeof this.jwPlayer.getDuration === "function") {
        duration = Number(this.jwPlayer.getDuration() || 0);
      }
    } catch (error) {
      duration = 0;
    }

    if (isFinite(duration) && duration > 0 && target > duration) {
      target = duration;
    }

    if (target < 0 || !isFinite(target)) {
      target = 0;
    }

    try {
      this.jwPlayer.seek(target);
    } catch (error) {}
  };

  PlaylistWidget.prototype.setupJwSkipButtons = function () {
    var self = this;
    var player = this.jwPlayer;
    var container = null;
    var controls;
    var displayNext;
    var existingDisplayForward;
    var customDisplayForwards;
    var barRewind;
    var barForward;
    var barForwardSvg;

    if (!player || typeof player.getContainer !== "function") {
      return;
    }

    try {
      container = player.getContainer();
    } catch (error) {
      container = null;
    }

    if (!container || !container.querySelector) {
      return;
    }

    controls = container.querySelector(".jw-controlbar .jw-button-container");
    displayNext = container.querySelector(".jw-display-icon-next");
    existingDisplayForward = container.querySelector(".playlist-jw-forward-display");

    if (displayNext) {
      if (displayNext.style.getPropertyValue("display") !== "none") {
        displayNext.style.setProperty("display", "none", "important");
      }
      if (displayNext.getAttribute("aria-hidden") !== "true") {
        displayNext.setAttribute("aria-hidden", "true");
      }
    }

    customDisplayForwards = existingDisplayForward
      ? container.querySelectorAll(".playlist-jw-forward-display")
      : [];
    Array.prototype.forEach.call(customDisplayForwards, function (button) {
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    });

    if (!controls) {
      return;
    }

    barRewind = controls.querySelector(".jw-icon-rewind");
    if (!barRewind) {
      return;
    }

    barForward = controls.querySelector(".playlist-jw-forward-bar");
    if (barForward) {
      return;
    }

    barForward = barRewind.cloneNode(true);
    barForward.classList.add("playlist-jw-forward-bar");
    barForward.classList.remove("jw-icon-rewind", "invisible");
    barForward.classList.add("jw-icon-forward");
    barForward.setAttribute("aria-label", "Forward 10 Seconds");

    barForwardSvg = barForward.querySelector(".jw-svg-icon-rewind, .jw-svg-icon-forward");
    if (barForwardSvg) {
      barForwardSvg.classList.remove("jw-svg-icon-rewind");
      barForwardSvg.classList.add("jw-svg-icon-forward");
    }

    barForward.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      self.seekJwBySeconds(10);
    });

    barRewind.parentNode.insertBefore(barForward, barRewind.nextSibling);
  };

  PlaylistWidget.prototype.renderJwPageIframe = function (item) {
    var iframeUrl = this.buildJwPageUrl(item);

    if (!iframeUrl) {
      this.showPosterOnly();
      return;
    }

    this.renderPlayerResponse({
      embed_url: iframeUrl,
      type: "iframe"
    });
  };

  PlaylistWidget.prototype.renderJwVideo = function (item, autoPlay) {
    var self = this;
    var fileUrl = normalizeHttpUrl(item && item.file);
    var token;
    var playerNode;

    if (!this.settings.useJw || !fileUrl) {
      return false;
    }

    token = (this.jwRenderToken || 0) + 1;
    this.jwRenderToken = token;
    this.destroyJwPlayer();
    this.frameHost.innerHTML = "";
    this.frameHost.style.display = "block";
    this.posterNode.classList.add("is-hidden");
    this.setLoading(true);

    playerNode = createNode("div", "kisskh-playlist-jwplayer");
    playerNode.classList.add("jw-skin-cs");
    playerNode.id =
      (this.root.id || "kisskh-playlist") + "-jw-" + String(token) + "-" + String(Date.now());
    this.frameHost.appendChild(playerNode);

    Promise.all([
      ensureJwLibrary(this.settings),
      resolveSubtitleTrackList(normalizeTrackList(item && item.tracks))
    ])
      .then(function (results) {
        var resolvedTracks = results[1] || [];
        var player;
        var jwConfig;
        var jwHasStarted = false;
        var fallbackFromJw = function () {
          if (self.jwRenderToken !== token) {
            return;
          }
          if (!self.renderNativeVideo(item)) {
            self.renderJwPageIframe(item);
          }
        };
        var hideLoaderIfCurrent = function () {
          if (self.jwRenderToken === token) {
            self.setLoading(false);
          }
        };
        var hideLoaderWhenPlayable = function () {
          var state = "";
          var position = 0;

          if (self.jwRenderToken !== token || !player) {
            return;
          }

          try {
            if (typeof player.getState === "function") {
              state = String(player.getState() || "");
            }
          } catch (error) {}

          try {
            if (typeof player.getPosition === "function") {
              position = Number(player.getPosition() || 0);
            }
          } catch (error) {}

          if (
            state === "playing" ||
            state === "paused" ||
            state === "complete" ||
            position > 0
          ) {
            jwHasStarted = true;
            hideLoaderIfCurrent();
          }
        };
        var watchDelays = [1200, 3000, 6000];

        if (self.jwRenderToken !== token) {
          return;
        }

        if (self.settings.jwKey && window.jwplayer) {
          window.jwplayer.key = self.settings.jwKey;
        }

        if (typeof window.jwplayer !== "function") {
          throw new Error("jwplayer unavailable");
        }

        jwConfig = {
          file: fileUrl,
          image: self.getPosterForItem(item),
          tracks: self.getJwTracks(resolvedTracks),
          width: "100%",
          height: "100%",
          autostart: autoPlay !== false,
          mute: false,
          controls: true,
          skin: {
            name: "cs"
          },
          playbackRateControls: [0.5, 1, 1.25, 1.5, 2]
        };

        player = window.jwplayer(playerNode.id);
        self.jwPlayer = player;
        self.rememberActiveSubtitleBlobUrls(resolvedTracks);

        if (player && typeof player.on === "function") {
          player.on("ready", function () {
            if (self.jwRenderToken !== token) {
              return;
            }
            self.applyJwSkinClass();
            self.setupJwSkipButtons();
            hideLoaderIfCurrent();
            if (autoPlay !== false && typeof player.play === "function") {
              try {
                player.play(true);
              } catch (error) {}
            }
            watchDelays.forEach(function (delay) {
              window.setTimeout(hideLoaderWhenPlayable, delay);
            });
          });
          player.on("play", function () {
            if (self.jwRenderToken === token) {
              jwHasStarted = true;
              self.applyJwSkinClass();
              self.setupJwSkipButtons();
              hideLoaderIfCurrent();
            }
          });
          player.on("firstFrame", function () {
            if (self.jwRenderToken === token) {
              jwHasStarted = true;
              self.applyJwSkinClass();
              self.setupJwSkipButtons();
              hideLoaderIfCurrent();
            }
          });
          player.on("buffer", function () {
            if (self.jwRenderToken === token && !jwHasStarted) {
              self.setLoading(true);
            }
          });
          player.on("error", function () {
            fallbackFromJw();
          });
          player.on("setupError", function () {
            fallbackFromJw();
          });
        }

        player.setup(jwConfig);
        self.applyJwSkinClass();
        self.setupJwSkipButtons();
        window.setTimeout(function () {
          if (self.jwRenderToken === token) {
            self.applyJwSkinClass();
            self.setupJwSkipButtons();
          }
        }, 0);
        watchDelays.forEach(function (delay) {
          window.setTimeout(function () {
            if (self.jwRenderToken === token) {
              self.applyJwSkinClass();
              self.setupJwSkipButtons();
            }
            hideLoaderWhenPlayable();
          }, delay);
        });
      })
      .catch(function () {
        if (self.jwRenderToken === token) {
          if (!self.renderNativeVideo(item)) {
            self.renderJwPageIframe(item);
          }
        }
      });

    return true;
  };

  PlaylistWidget.prototype.renderNativeVideo = function (item) {
    var self = this;
    var fileUrl = normalizeHttpUrl(item && item.file);
    var mimeType = getNativeVideoMimeType(fileUrl);
    var tracks = normalizeTrackList(item && item.tracks);
    var token;
    var video;
    var source;

    if (!fileUrl || !mimeType) {
      return false;
    }

    token = (this.jwRenderToken || 0) + 1;
    this.jwRenderToken = token;
    this.destroyJwPlayer();
    this.frameHost.innerHTML = "";
    this.frameHost.style.display = "block";
    this.posterNode.classList.add("is-hidden");
    this.setLoading(true);

    video = createNode("video", "kisskh-playlist-native-video");
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    if (item && item.poster) {
      video.poster = item.poster;
    }

    source = createNode("source");
    source.src = fileUrl;
    source.type = mimeType;
    video.appendChild(source);

    video.addEventListener(
      "error",
      function () {
        this.showPosterOnly();
      }.bind(this),
      { once: true }
    );

    this.frameHost.appendChild(video);

    resolveSubtitleTrackList(tracks)
      .then(function (resolvedTracks) {
        if (self.jwRenderToken !== token) {
          return;
        }

        self.rememberActiveSubtitleBlobUrls(resolvedTracks);
        resolvedTracks.forEach(function (track) {
          if (!track || (!track.src && !track.file)) {
            return;
          }
          var trackNode = createNode("track");
          trackNode.kind = track.kind || "subtitles";
          trackNode.label = track.label || String(track.srclang || "en").toUpperCase();
          trackNode.srclang = track.srclang || "en";
          trackNode.src = track.src || track.file;
          if (track.default || track.isDefault) {
            trackNode.default = true;
          }
          video.appendChild(trackNode);
        });

        self.setLoading(false);
        if (typeof video.play === "function") {
          video.play().catch(function () {});
        }
      })
      .catch(function () {
        if (self.jwRenderToken === token) {
          self.setLoading(false);
          if (typeof video.play === "function") {
            video.play().catch(function () {});
          }
        }
      });

    return true;
  };

  PlaylistWidget.prototype.renderPlayerResponse = function (response) {
    var self = this;
    var iframe;
    var html;
    var iframeSrc;
    var mediaUrl;
    // Capture current play-token so stale iframe load events from a prior play
    // request cannot incorrectly hide the loader for a newer request.
    var loadToken = this.playRequestToken;
    var hideLoaderIfCurrent = function () {
      if (self.playRequestToken === loadToken) {
        self.setLoading(false);
      }
    };

    this.releaseActiveSubtitleBlobUrls([]);
    this.frameHost.innerHTML = "";
    this.frameHost.style.display = "block";
    this.posterNode.classList.add("is-hidden");
    // Do NOT hide the loader here — keep it visible until the iframe actually loads.
    // setLoading(false) is invoked via the iframe "load" event or safety timeout.
    // renderJwVideo / renderNativeVideo manage their own loader lifecycle.

    if (!response || !response.embed_url) {
      this.showPosterOnly();
      return;
    }

    try {
      if (response.source_url && isNativeVideoUrl(response.source_url)) {
        if (
          this.settings.useJw &&
          this.renderJwVideo({
            file: response.source_url,
            tracks: response.tracks || []
          }, true)
        ) {
          return;
        }
        if (
          !this.settings.useJw &&
          this.renderNativeVideo({
            file: response.source_url,
            tracks: response.tracks || []
          })
        ) {
          return;
        }
      }

      if (response.type === "dtshcode") {
        html = String(response.embed_url || "");
        iframeSrc = extractIframeSrcFromHtml(html);
        mediaUrl = iframeSrc ? "" : extractMediaUrlFromHtml(html);

        if (iframeSrc) {
          response = {
            embed_url: iframeSrc,
            type: "iframe"
          };
        } else if (mediaUrl) {
          if (isNativeVideoUrl(mediaUrl)) {
            if (
              this.settings.useJw &&
              this.renderJwVideo({
                file: mediaUrl,
                tracks: []
              }, true)
            ) {
              return;
            }
            if (
              !this.settings.useJw &&
              this.renderNativeVideo({
                file: mediaUrl,
                tracks: []
              })
            ) {
              return;
            }
          }
          response = {
            embed_url: this.buildJwUrlFromFile(mediaUrl, []),
            type: "iframe"
          };
        } else {
          iframe = createNode("iframe", "kisskh-playlist-iframe kisskh-playlist-html-frame");
          iframe.setAttribute("allowfullscreen", "");
          iframe.setAttribute("allow", "autoplay; encrypted-media");
          iframe.setAttribute("loading", "eager");
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute(
            "sandbox",
            "allow-scripts allow-forms allow-presentation allow-popups"
          );
          iframe.srcdoc = html;
          // Hide loader when srcdoc iframe reports loaded; 10 s safety fallback
          iframe.addEventListener("load", hideLoaderIfCurrent, { once: true });
          window.setTimeout(hideLoaderIfCurrent, 10000);
          this.frameHost.appendChild(iframe);
          return;
        }
      }

      iframe = createNode("iframe", "kisskh-playlist-iframe");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("allow", "autoplay; encrypted-media");
      iframe.setAttribute("loading", "eager");
      iframe.setAttribute("frameborder", "0");
      iframeSrc = normalizeHttpUrl(response.embed_url);
      if (!iframeSrc) {
        this.showPosterOnly();
        return;
      }
      iframe.src = iframeSrc;
      // Hide loader once the iframe reports loaded; 10 s safety fallback
      iframe.addEventListener("load", hideLoaderIfCurrent, { once: true });
      window.setTimeout(hideLoaderIfCurrent, 10000);
      this.frameHost.appendChild(iframe);
    } catch (error) {
      this.showPosterOnly();
    }
  };

  PlaylistWidget.prototype.playIndex = function (itemIndex, preserveRoute) {
    var server = this.getCurrentServer();
    var item = server && server.items ? server.items[itemIndex] : null;
    var playToken;

    if (!item) {
      return;
    }

    playToken = (this.playRequestToken || 0) + 1;
    this.playRequestToken = playToken;
    this.currentItemIndex = itemIndex;
    this.renderList();
    this.updatePosterState(item);
    this.posterNode.classList.remove("is-hidden");
    this.setLoading(true);

    if (item.type === "legacy") {
      fetchLegacySource(this.postId, item.legacySourceIndex, this.isMovieMode() ? "movie" : "tvshows")
        .then(
          function (response) {
            if (this.playRequestToken !== playToken) {
              return;
            }
            this.renderPlayerResponse(response);
            if (!preserveRoute) {
              this.updateRoute();
            }
          }.bind(this)
        )
        .catch(
          function () {
            if (this.playRequestToken !== playToken) {
              return;
            }
            this.showPosterOnly();
          }.bind(this)
        );
      return;
    }

    if (item.type === "iframe") {
      this.renderPlayerResponse({
        embed_url: item.url,
        type: "iframe"
      });
      if (!preserveRoute) {
        this.updateRoute();
      }
      return;
    }

    if (item.type === "video") {
      if (this.settings.useJw && this.renderJwVideo(item, true)) {
        if (!preserveRoute) {
          this.updateRoute();
        }
        return;
      }

      if (!this.settings.useJw && isNativeVideoUrl(item.file) && this.renderNativeVideo(item)) {
        if (!preserveRoute) {
          this.updateRoute();
        }
        return;
      }

      this.renderPlayerResponse({
        embed_url: this.buildJwPageUrl(item),
        type: "iframe"
      });
      if (!preserveRoute) {
        this.updateRoute();
      }
      return;
    }

    this.showPosterOnly();
  };

  PlaylistWidget.prototype.updateRoute = function () {
    var url = new URL(window.location.href);
    var serverValue = this.currentServerIndex + 1;

    if (serverValue > 1) {
      url.searchParams.set("sv", String(serverValue));
    } else {
      url.searchParams.delete("sv");
    }

    if (this.currentItemIndex >= 0) {
      url.searchParams.set("ep", String(this.currentItemIndex + 1));
    } else {
      url.searchParams.delete("ep");
    }

    url.searchParams.delete("episode");
    url.searchParams.delete("server");
    window.history.replaceState({}, "", url.toString());
  };

  document.addEventListener("DOMContentLoaded", function () {
    var settings = resolvePlaylistSettings();
    var selector = settings.playerContainer || "[data-kisskh-tvshow-playlist]";

    Array.prototype.forEach.call(document.querySelectorAll(selector), function (root) {
      var widget;
      if (!root || !root.hasAttribute || !root.hasAttribute("data-kisskh-tvshow-playlist")) {
        return;
      }
      widget = new PlaylistWidget(root);
      widget.init();
    });
  });
})();
