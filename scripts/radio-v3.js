/* ARTIFICE Radio: curated recordings, with track and playback state preserved
   across page changes when browser autoplay policies permit. Add future recordings
   to TRACKS; files are served from the repository's assets folder. */
(() => {
  "use strict";

  const TRACKS = [
    { id: "techno-mart", title: "techno mart", src: "assets/artifice-ambient.mp3" },
    { id: "yodobashi-camera", title: "yodobashi camera", src: "assets/yodobashi camera.mp3" }
  ];
  const STORAGE_KEY = "artifice-radio-v2";
  const isHome = document.body.classList.contains("home-page");
  let saved = null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (Number.isFinite(obj.time) && typeof obj.playing === "boolean") saved = obj;
    }
  } catch (_) { /* Storage may be restricted. */ }

  let current = Math.max(0, TRACKS.findIndex(item => item.id === saved?.trackId));
  const audio = isHome
    ? document.getElementById("home-soundtrack")
    : document.createElement("audio");

  if (!isHome) {
    const player = document.createElement("section");
    player.className = "radio-dock";
    player.setAttribute("aria-label", "ARTIFICE Radio");
    player.innerHTML =
      '<span class="radio-bracket" aria-hidden="true">[</span>' +
      '<div class="radio-dock-meta"><span>artifice radio</span> <span id="radio-sequence">001</span></div>' +
      '<div class="radio-dock-row">' +
      '<span class="radio-dock-track radio-track">techno mart</span>' +
      '<div class="radio-dock-controls">' +
      '<button type="button" id="radio-previous" class="radio-dock-button" aria-label="Previous recording" title="Previous recording"><svg class="radio-control-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M11 6 4 12l7 6V6Zm9 0-7 6 7 6V6Z"/></svg></button>' +
      '<button type="button" id="sound-toggle" class="radio-dock-button radio-dock-play" aria-label="Play recording" aria-pressed="false">play</button>' +
      '<button type="button" id="radio-next" class="radio-dock-button" aria-label="Next recording" title="Next recording"><svg class="radio-control-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 7 6-7 6V6Zm9 0 7 6-7 6V6Z"/></svg></button>' +
      '</div></div>' +
      '<div class="radio-dock-bottom"><div class="radio-dock-progress"><span id="radio-progress-fill"></span></div>' +
      '<span id="radio-clock">00:00 / 00:00</span></div>' +
      '<span id="radio-status" class="radio-dock-status" role="status">press play to listen</span>' +
      '<span class="radio-bracket" aria-hidden="true">]</span>';
    const header = document.querySelector(".site-header");
    (header || document.body).append(player);
    audio.id = "home-soundtrack";
    audio.preload = "metadata";
    document.body.append(audio);
  }
  if (!audio) return;

  audio.loop = false;
  const toggle = document.getElementById("sound-toggle");
  const previous = document.getElementById("radio-previous");
  const next = document.getElementById("radio-next");
  const progress = document.getElementById("radio-progress-fill");
  const clock = document.getElementById("radio-clock");
  const status = document.getElementById("radio-status");
  const title = isHome
    ? document.querySelector(".artifice-radio .radio-track")
    : document.querySelector(".radio-dock .radio-track");
  const sequence = document.getElementById("radio-sequence");
  if (![toggle, previous, next, progress, clock, status, title].every(Boolean)) return;

  let wantsPlayback = saved ? saved.playing : isHome;
  let pendingRestore = saved !== null;
  let pendingPosition = saved ? saved.time : 0;
  let pendingElapsed = saved?.playing && Number.isFinite(saved.savedAt)
    ? Math.min(12, Math.max(0, (Date.now() - saved.savedAt) / 1000))
    : 0;

  const padded = num => String(Math.floor(num)).padStart(2, "0");
  const timecode = seconds => Number.isFinite(seconds)
    ? padded(seconds / 60) + ":" + padded(seconds % 60)
    : "00:00";

  function persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        trackId: TRACKS[current].id,
        time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        playing: wantsPlayback,
        savedAt: Date.now()
      }));
    } catch (_) { /* Disabled storage must not break the radio. */ }
  }

  function render() {
    const track = TRACKS[current];
    title.textContent = track.title;
    if (sequence) sequence.textContent = String(current + 1).padStart(3, "0");
    const playing = !audio.paused && !audio.ended;
    toggle.textContent = playing ? "pause" : "play";
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute("aria-label", (playing ? "Pause " : "Play ") + track.title);
    previous.setAttribute("aria-label", "Previous recording: " + TRACKS[(current - 1 + TRACKS.length) % TRACKS.length].title);
    next.setAttribute("aria-label", "Next recording: " + TRACKS[(current + 1) % TRACKS.length].title);
    status.textContent = playing ? "now playing" : wantsPlayback ? "play to resume" : "press play to listen";
    clock.textContent = timecode(audio.currentTime) + " / " + timecode(audio.duration);
    progress.style.width = Number.isFinite(audio.duration) && audio.duration > 0
      ? Math.min(100, audio.currentTime / audio.duration * 100) + "%"
      : "0%";
  }

  function restorePosition() {
    if (!pendingRestore || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    try {
      audio.currentTime = Math.max(0, Math.min(audio.duration - .05, pendingPosition + pendingElapsed));
      pendingRestore = false;
      pendingPosition = 0;
      pendingElapsed = 0;
    } catch (_) { /* Wait until seeking is available. */ }
  }

  async function play() {
    wantsPlayback = true;
    restorePosition();
    try {
      await audio.play();
    } catch (_) { /* A browser may require a user gesture. */ }
    persist();
    render();
  }

  function changeTrack(delta) {
    current = (current + delta + TRACKS.length) % TRACKS.length;
    pendingRestore = false;
    pendingPosition = 0;
    pendingElapsed = 0;
    audio.pause();
    audio.src = TRACKS[current].src;
    audio.load();
    render();
    persist();
    if (wantsPlayback) play();
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
  previous.addEventListener("click", () => changeTrack(-1));
  next.addEventListener("click", () => changeTrack(1));
  audio.addEventListener("loadedmetadata", () => { restorePosition(); render(); });
  audio.addEventListener("ended", () => {
    wantsPlayback = true;
    changeTrack(1);
  });
  for (const event of ["play", "pause", "timeupdate", "durationchange", "seeked"]) {
    audio.addEventListener(event, () => {
      render();
      if (event !== "durationchange") persist();
    });
  }
  window.addEventListener("pagehide", persist);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) persist();
  });
  function unlock(event) {
    if (!wantsPlayback || !audio.paused) return;
    if (event.target instanceof Element &&
        event.target.closest("a[href], #sound-toggle, #radio-previous, #radio-next")) return;
    play();
  }
  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);

  audio.pause();
  audio.src = TRACKS[current].src;
  audio.load();
  restorePosition();
  render();
  if (wantsPlayback) play();
})();
