import { cues, works, sideWorks } from "./cues.mjs?v=landscape";

const video = document.querySelector("#intro-video");
const player = video.parentElement;
const status = document.querySelector("#player-status");
const shotLink = document.querySelector("#shot-link");
const shotTitle = document.querySelector("#shot-title");
const workList = document.querySelector("#work-list");
const stage = player.parentElement;
const siteRoot = new URL(stage.dataset.siteRoot, document.baseURI);
const landscape = matchMedia("(min-width: 42rem) and (min-aspect-ratio: 6/5)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const sidePanels = Array.from(stage.querySelectorAll(".side-work"), link => ({
  link,
  image: link.querySelector("img"),
  clip: link.querySelector("video"),
  title: link.querySelector(".side-title"),
  work: null,
}));

const shuffledWorks = [...sideWorks];
for (let index = shuffledWorks.length - 1; index > 0; index--) {
  const other = Math.floor(Math.random() * (index + 1));
  [shuffledWorks[index], shuffledWorks[other]] = [shuffledWorks[other], shuffledWorks[index]];
}
const pairCount = Math.floor(shuffledWorks.length / sidePanels.length);
let activePair = -1;

function syncSideMotion() {
  const playing = landscape.matches && !reducedMotion.matches && !document.hidden
    && !video.paused && !video.seeking && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
  for (const { clip, work } of sidePanels) {
    if (playing && work?.clip) {
      if (!clip.hasAttribute("src")) clip.src = new URL(work.clip, siteRoot).href;
      clip.play().catch(() => {});
    } else {
      clip.pause();
    }
  }
}

function updateSideWorks() {
  const pair = landscape.matches && !video.hidden
    ? (reducedMotion.matches ? 0 : Math.floor(video.currentTime / 10) % pairCount)
    : -1;

  if (pair === activePair) return;
  activePair = pair;
  for (const [index, panel] of sidePanels.entries()) {
    const { link, image, clip, title } = panel;
    if (clip.hasAttribute("src")) {
      clip.removeAttribute("data-visible");
      clip.removeAttribute("src");
      clip.load();
    }
    panel.work = pair < 0 ? null : shuffledWorks[pair * sidePanels.length + index];
    if (panel.work) {
      image.src = new URL(panel.work.image, siteRoot).href;
      link.href = new URL(panel.work.page, "https://xyhtamura.github.io/").href;
      title.textContent = panel.work.label;
    }
    link.hidden = !panel.work;
  }
  syncSideMotion();
}

for (const { link, clip } of sidePanels) {
  clip.muted = true;
  link.addEventListener("click", () => video.pause());
  link.addEventListener("focus", () => video.pause());
  clip.addEventListener("playing", () => {
    if (!clip.paused) clip.setAttribute("data-visible", "");
  });
  clip.addEventListener("error", () => clip.removeAttribute("data-visible"));
}

for (const event of ["playing", "pause", "waiting", "seeking", "seeked", "ended"]) {
  video.addEventListener(event, syncSideMotion);
}
video.addEventListener("timeupdate", updateSideWorks);
landscape.addEventListener("change", updateSideWorks);
reducedMotion.addEventListener("change", () => {
  updateSideWorks();
  if (reducedMotion.matches) {
    for (const { clip } of sidePanels) clip.removeAttribute("data-visible");
  }
  syncSideMotion();
});
document.addEventListener("visibilitychange", syncSideMotion);

function projectLink(work) {
  const link = document.createElement("a");
  link.href = work.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = work.label;
  link.setAttribute("aria-describedby", "link-note");
  link.addEventListener("click", () => video.pause());
  return link;
}

for (const work of Object.values(works)) {
  const item = document.createElement("li");
  item.append(projectLink(work));
  workList.append(item);
}

const track = video.addTextTrack("metadata", "Project links");
track.mode = "hidden";
for (const { work, start, end } of cues) {
  track.addCue(new VTTCue(start, end, work));
}

function updateShotLink() {
  const work = works[track.activeCues?.[0]?.text];
  shotLink.hidden = video.hidden || !work;
  if (work) {
    shotLink.href = work.href;
    shotTitle.textContent = work.label;
  }
}

track.addEventListener("cuechange", updateShotLink);
shotLink.addEventListener("click", () => video.pause());
shotLink.addEventListener("focus", () => video.pause());

async function loadCaptions() {
  try {
    const response = await fetch("./intro.vtt");
    if (!response.ok) return;

    // Give the local server's generic MIME type an explicit WebVTT type.
    const captionURL = URL.createObjectURL(new Blob([await response.text()], { type: "text/vtt" }));
    const captions = document.createElement("track");
    captions.kind = "captions";
    captions.label = "English";
    captions.srclang = "en";
    captions.default = true;
    captions.src = captionURL;
    captions.addEventListener("load", () => URL.revokeObjectURL(captionURL), { once: true });
    captions.addEventListener("error", () => URL.revokeObjectURL(captionURL), { once: true });
    video.append(captions);
  } catch (error) {
    console.warn("Could not load intro.vtt", error);
  }
}

video.addEventListener("loadedmetadata", () => {
  status.hidden = true;
  video.hidden = false;
  player.style.setProperty("--video-ratio", video.videoWidth / video.videoHeight);
  updateShotLink();
  updateSideWorks();
  loadCaptions();
}, { once: true });

video.addEventListener("error", () => {
  status.textContent = "The video could not load.";
  status.hidden = false;
  video.hidden = true;
  shotLink.hidden = true;
  updateSideWorks();
});

video.src = "./intro.mp4";
