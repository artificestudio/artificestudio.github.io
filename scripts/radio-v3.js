/* ARTIFICE Radio: one recording and shared playback state on all HTML pages.
   GitHub Pages cannot maintain an Audio element between separate HTML loads.
   We restore time and playback intention after navigation when browsers allow. */
(() => {
  "use strict";

  const STORAGE_KEY = "artifice-radio-v2";
  const isHome = document.body.classList.contains("home-page");
  const track = "assets/artifice-ambient.mp3";
  let saved = null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.time === "number" && Number.isFinite(parsed.time) &&
          typeof parsed.playing === "boolean") saved = parsed;
    }
  } catch (_) { /* Browsers can disable session storage. */ }

  let player;
  let audio = document.getElementById("home-soundtrack");

  if (!isHome) {
    player = document.createElement("section");
    player.className = "radio-dock";
    player.setAttribute("aria-label", "ARTIFICE Radio");
    player.innerHTML =
      '<div class="radio-dock-meta"><span>ARTIFICE RADIO</span><span>001</span></div>' +
      '<div class="radio-dock-row">' +
        '<span class="radio-dock-track">TECHNO MART</span>' +
        '<div class="radio-dock-controls">' +
          '<button type="button" id="radio-previous" class="radio-dock-button" aria-label="Back 15 seconds" title="Back 15 seconds"><svg class="radio-control-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M11 6 4 12l7 6V6Zm9 0-7 6 7 6V6Z"/></svg></button>' +
          '<button type="button" id="sound-toggle" class="radio-dock-button radio-dock-play" aria-label="Play Techno Mart recording" aria-pressed="false">PLAY</button>' +
          '<button type="button" id="radio-next" class="radio-dock-button" aria-label="Forward 15 seconds" title="Forward 15 seconds"><svg class="radio-control-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 7 6-7 6V6Zm9 0 7 6-7 6V6Z"/></svg></button>' +
        '</div>' +
      '</div>' +
      '<div class="radio-dock-bottom">' +
        '<div class="radio-dock-progress"><span id="radio-progress-fill"></span></div>' +
        '<span id="radio-clock">00:00 / 00:00</span>' +
      '</div>' +
      '<span id="radio-status" class="radio-dock-status" role="status">PRESS PLAY TO LISTEN</span>';
    document.body.append(player);
    audio = document.createElement("audio");
    audio.id = "home-soundtrack";
    audio.src = track;
    audio.loop = true;
    audio.preload = "metadata";
    document.body.append(audio);
  }

  if (!audio) return;
  audio.loop = true;
  const toggle = document.getElementById("sound-toggle");
  const previous = document.getElementById("radio-previous");
  const next = document.getElementById("radio-next");
  const progress = document.getElementById("radio-progress-fill");
  const clock = document.getElementById("radio-clock");
  const status = document.getElementById("radio-status");
  if (!toggle || !previous || !next || !progress || !clock || !status) return;

  let wantsPlayback = saved ? saved.playing : isHome;
  let restorePending = Boolean(saved);
  let recoveryAttempted = false;

  const padded = number => String(Math.floor(number)).padStart(2, "0");
  const timecode = seconds => Number.isFinite(seconds)
    ? padded(seconds / 60) + ":" + padded(seconds % 60)
    : "00:00";

  function persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        playing: wantsPlayback,
        savedAt: Date.now()
      }));
    } catch (_) { /* Ignore storage limitations. */ }
  }

  function render() {
    const playing = !audio.paused && !audio.ended;
    toggle.textContent = playing ? "PAUSE" : "PLAY";
    toggle.setAttribute("aria-label", playing ? "Pause Techno Mart recording" : "Play Techno Mart recording");
    toggle.setAttribute("aria-pressed", String(playing));
    status.textContent = playing ? "NOW PLAYING" :
      wantsPlayback ? "PLAY TO RESUME" : "PRESS PLAY TO LISTEN";
    const duration = audio.duration;
    clock.textContent = timecode(audio.currentTime) + " / " + timecode(duration);
    progress.style.width = Number.isFinite(duration) && duration > 0
      ? Math.min(100, audio.currentTime / duration * 100) + "%" : "0%";
  }

  function restorePosition() {
    if (!restorePending || !saved) return;
    const duration = audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    // When returning from another page, advance the position by the small
    // navigation interval only when playback was intended to continue.
    const elapsed = saved.playing && Number.isFinite(saved.savedAt)
      ? Math.min(12, Math.max(0, (Date.now() - saved.savedAt) / 1000))
      : 0;
    const target = (saved.time + elapsed) % duration;
    try {
      audio.currentTime = Math.max(0, Math.min(duration - .05, target));
      restorePending = false;
      render();
    } catch (_) { /* Wait for audio metadata on this browser. */ }
  }

  async function play() {
    wantsPlayback = true;
    restorePosition();
    try {
      await audio.play();
      recoveryAttempted = false;
    } catch (_) {
      // Browsers may require a fresh click after a full page navigation.
      recoveryAttempted = true;
    }
    persist();
    render();
  }

  toggle.addEventListener("click", () => {
    if (!audio.paused) {
      wantsPlayback = false;
      audio.pause();
      persist();
      render();
    } else {
      play();
    }
  });

  function seek(seconds) {
    const duration = audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    try { audio.currentTime = Math.max(0, Math.min(duration - .05, audio.currentTime + seconds)); }
    catch (_) { return; }
    render();
    persist();
  }
  previous.addEventListener("click", () => seek(-15));
  next.addEventListener("click", () => seek(15));

  audio.addEventListener("loadedmetadata", () => {
    restorePosition();
    if (wantsPlayback) play();
    else render();
  });
  for (const event of ["play", "pause", "timeupdate", "durationchange", "ended", "seeked"]) {
    audio.addEventListener(event, () => { render(); if (event !== "durationchange") persist(); });
  }
  window.addEventListener("pagehide", persist);
  document.addEventListener("visibilitychange", () => { if (document.hidden) persist(); });

  // A click on the site can unlock browser-restricted resumed playback.
  // Never restart audio after the visitor deliberately paused it.
  function unlock(event) {
    if (!wantsPlayback || !audio.paused || event.target === toggle) return;
    if (event.target instanceof Element && event.target.closest("a[href]")) return;
    play();
  }
  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);

  if (audio.readyState >= 1) restorePosition();
  if (wantsPlayback) play();
  render();
})();