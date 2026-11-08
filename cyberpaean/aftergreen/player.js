import { openMP3Stream, supportsMP3Stream } from "./album-stream.js";

const byId = (id) => document.getElementById(id);
const audio = byId("audio");
const playAlbum = byId("play-album");
const toggle = byId("toggle");
const previous = byId("previous");
const next = byId("next");
const position = byId("position");
const chapterMarks = byId("chapter-marks");
const status = byId("status");
let album;
let albumLength = 0;
let mode = "idle";
let bonusTrack;
let closeStream;
let pendingTime = 0;
let isScrubbing = false;
const rows = new Map();

function timeLabel(seconds) {
  const value = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(value / 60);
  const remainder = String(value % 60).padStart(2, "0");
  return minutes < 60
    ? `${minutes}:${remainder}`
    : `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${remainder}`;
}

function showStatus(message = "") {
  status.textContent = message;
  status.hidden = !message;
}

function updatePlayer() {
  if (!album) return;
  const bonus = mode === "bonus";
  chapterMarks.hidden = bonus;
  const duration = bonus ? (Number.isFinite(audio.duration) ? audio.duration : 0) : albumLength;
  const current = audio.readyState ? audio.currentTime : pendingTime;
  const chapter = album.tracks.findLastIndex((entry) => entry.time <= current + .001);
  const track = bonus ? bonusTrack : album.tracks[chapter];
  const albumActive = !bonus && mode !== "idle";
  previous.disabled = !albumActive || chapter <= 0;
  next.disabled = !albumActive || chapter >= album.tracks.length - 1;
  byId("playing-label").textContent = bonus ? "Bonus track" : "Album";
  byId("playing-title").textContent = mode === "idle" ? "Aftergreen" : track?.title ?? "Aftergreen";
  position.max = duration || 1;
  position.disabled = !duration || mode === "idle";
  if (!isScrubbing) {
    position.value = current;
    byId("elapsed").textContent = timeLabel(current);
    position.setAttribute("aria-valuetext", timeLabel(current));
  }
  byId("total").textContent = timeLabel(duration);
  const playing = !audio.paused && !audio.ended;
  toggle.setAttribute("aria-label", playing ? "Pause" : "Play");
  toggle.firstElementChild.textContent = playing ? "Ⅱ" : "▶";
  playAlbum.textContent = (mode === "stream" || mode === "fallback") && playing ? "Pause album" : "Play album";
  for (const [entry, row] of rows) {
    if (entry === track && mode !== "idle") row.setAttribute("aria-current", "true");
    else row.removeAttribute("aria-current");
  }
}

function play() {
  audio.play().catch((error) => {
    if (error.name === "NotAllowedError") showStatus("Press Play to start audio.");
  });
}

function close() {
  closeStream?.();
  closeStream = undefined;
}

function nativeAlbum(time, shouldPlay) {
  close();
  mode = "fallback";
  pendingTime = time;
  audio.src = "audio/" + encodeURIComponent(album.fallback);
  audio.currentTime = time;
  showStatus();
  if (shouldPlay) play();
  updatePlayer();
}

function streamFailed() {
  if (mode !== "stream") return;
  const time = audio.readyState ? audio.currentTime : pendingTime;
  nativeAlbum(time, !audio.paused || audio.error !== null);
}

function bufferedAt(time) {
  return Array.from({ length: audio.buffered.length }, (_, index) => index)
    .some((index) => time >= audio.buffered.start(index) - .001 && time < audio.buffered.end(index));
}

function playChapter(index, shouldPlay = true) {
  const time = album.tracks[index].time;
  pendingTime = time;
  if (mode === "fallback" || (mode === "stream" && bufferedAt(time))) {
    audio.currentTime = time;
  } else if (supportsMP3Stream()) {
    close();
    mode = "stream";
    closeStream = openMP3Stream(audio, album, index, streamFailed);
    audio.currentTime = time;
    showStatus();
  } else {
    nativeAlbum(time, shouldPlay);
    return;
  }
  if (shouldPlay) play();
  updatePlayer();
}

function skipChapter(offset) {
  const current = audio.readyState ? audio.currentTime : pendingTime;
  const index = album.tracks.findLastIndex((entry) => entry.time <= current + .001);
  playChapter(index + offset, !audio.paused || audio.ended);
}

function playBonus(track) {
  close();
  mode = "bonus";
  bonusTrack = track;
  pendingTime = 0;
  audio.src = "audio/" + encodeURIComponent(track.file);
  showStatus();
  play();
  updatePlayer();
}

function addRow(list, track, index, activate) {
  const item = document.createElement("li");
  const row = document.createElement(activate ? "button" : "div");
  row.className = "track";
  if (activate) {
    row.type = "button";
    row.addEventListener("click", activate);
    rows.set(track, row);
  }

  if (index !== null) {
    const number = document.createElement("span");
    number.className = "track-index";
    number.textContent = String(index + 1).padStart(2, "0");
    row.append(number);
  }
  const title = document.createElement("span");
  title.textContent = track.title;
  row.append(title);
  if (track.samples) {
    const duration = document.createElement("span");
    duration.className = "track-duration";
    duration.textContent = timeLabel(track.samples / album.sampleRate);
    row.append(duration);
  }
  item.append(row);
  list.append(item);
}

toggle.addEventListener("click", () => {
  if (mode === "idle" || (audio.ended && mode !== "bonus")) playChapter(0);
  else if (audio.paused) play();
  else audio.pause();
});
previous.addEventListener("click", () => skipChapter(-1));
next.addEventListener("click", () => skipChapter(1));
playAlbum.addEventListener("click", () => {
  if (mode === "idle" || mode === "bonus" || audio.ended) playChapter(0);
  else if (audio.paused) play();
  else audio.pause();
});
position.addEventListener("input", () => {
  isScrubbing = true;
  byId("elapsed").textContent = timeLabel(position.valueAsNumber);
  position.setAttribute("aria-valuetext", timeLabel(position.valueAsNumber));
});
position.addEventListener("change", () => {
  isScrubbing = false;
  const time = position.valueAsNumber;
  if (mode === "stream" && !bufferedAt(time)) nativeAlbum(time, !audio.paused);
  else audio.currentTime = time;
  updatePlayer();
});
for (const event of ["play", "pause", "ended", "timeupdate", "durationchange", "loadedmetadata", "seeked"]) {
  audio.addEventListener(event, updatePlayer);
}
audio.addEventListener("error", () => {
  if (mode === "stream") streamFailed();
  else showStatus("Audio could not be loaded.");
});

async function readManifest(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

readManifest("album.json").then((data) => {
  album = data;
  albumLength = album.samples / album.sampleRate;
  album.tracks.forEach((track, index) => {
    track.time = track.start / album.sampleRate;
    const mark = document.createElement("button");
    mark.type = "button";
    mark.style.setProperty("--chapter-position", `${100 * track.start / album.samples}%`);
    mark.setAttribute("aria-label", `Play ${track.title}`);
    mark.addEventListener("click", () => playChapter(index));
    const label = document.createElement("span");
    label.textContent = track.title;
    label.setAttribute("aria-hidden", "true");
    mark.append(label);
    chapterMarks.append(mark);
    addRow(byId("album-tracks"), track, index, () => playChapter(index));
  });
  byId("album-info").textContent = `${album.tracks.length} tracks · ${Math.round(albumLength / 60)} min`;
  playAlbum.disabled = toggle.disabled = false;
  updatePlayer();
}).catch(() => showStatus("The album could not be loaded."));

readManifest("bonus.json").then((tracks) => {
  tracks.forEach((track) => {
    addRow(byId("bonus-tracks"), track, null, track.file ? () => playBonus(track) : null);
  });
  byId("bonus-status").hidden = tracks.every((track) => track.file);
}).catch(() => { byId("bonus-status").textContent = "The bonus track list could not be loaded."; });
