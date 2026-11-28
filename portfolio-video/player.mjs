import { cues, sideCues, works } from "./cues.mjs?v=paired-works";

const video = document.querySelector("#intro-video");
const player = video.parentElement;
const status = document.querySelector("#player-status");
const shotLink = document.querySelector("#shot-link");
const shotTitle = document.querySelector("#shot-title");
const shotCompanion = document.querySelector("#shot-companion");
const shotCompanionTitle = document.querySelector("#shot-companion-title");
const gallery = document.querySelector(".side-gallery");
const workList = document.querySelector("#work-list");

// Both cuts share one edit list, so cue times and captions apply to either file.
const landscape = matchMedia("(min-width: 35rem) and (min-aspect-ratio: 6/5)");
const sources = {
  portrait: "./intro.mp4?v=paired-works",
  landscape: "./intro-landscape.mp4?v=paired-works",
};
let landscapeFailed = false;
let captionsLoaded = false;
const sideGroups = [];

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

function showSideWorks() {
  const isWide = !video.hidden && !video.ended && player.dataset.cut === "landscape";
  const active = isWide ? sideCues.findIndex(({ start, end }) => (
    start <= video.currentTime && video.currentTime < end
  )) : -1;
  gallery.hidden = active < 0;
  for (const [index, group] of sideGroups.entries()) group.hidden = index !== active;
}

function loadSideWorks() {
  if (sideGroups.length || player.dataset.cut !== "landscape") return;
  const siteRoot = new URL(gallery.dataset.siteRoot, document.baseURI);
  for (const { works: pair } of sideCues) {
    const group = document.createElement("div");
    group.className = "side-pair";
    group.hidden = true;
    for (const work of pair) {
      const link = projectLink(work);
      const title = document.createElement("span");
      title.textContent = work.label;
      const image = document.createElement("img");
      image.alt = "";
      image.decoding = "async";
      image.src = new URL(work.image, siteRoot).href;
      link.className = "side-work";
      link.replaceChildren(image, title);
      link.addEventListener("focus", () => video.pause());
      group.append(link);
    }
    gallery.append(group);
    sideGroups.push(group);
  }
}

for (const work of Object.values(works)) {
  const item = document.createElement("li");
  item.append(projectLink(work));
  workList.append(item);
}

const track = video.addTextTrack("metadata", "Project links");
track.mode = "hidden";
for (const { work, companion, start, end } of cues) {
  track.addCue(new VTTCue(start, end, companion ? `${work} ${companion}` : work));
}

function updateShotLink() {
  const [primary, secondary] = track.activeCues?.[0]?.text.split(" ") ?? [];
  const work = works[primary];
  const companion = works[secondary];
  shotLink.hidden = video.hidden || !work;
  shotCompanion.hidden = video.hidden || !companion;
  player.toggleAttribute("data-paired-shot", !shotCompanion.hidden);
  if (work) {
    shotLink.href = work.href;
    shotTitle.textContent = work.label;
  }
  if (companion) {
    shotCompanion.href = companion.href;
    shotCompanionTitle.textContent = companion.label;
  }
  showSideWorks();
}

track.addEventListener("cuechange", updateShotLink);
video.addEventListener("seeked", showSideWorks);
video.addEventListener("ended", showSideWorks);
for (const link of [shotLink, shotCompanion]) {
  link.addEventListener("click", () => video.pause());
  link.addEventListener("focus", () => video.pause());
}

async function loadCaptions() {
  if (captionsLoaded) return;
  captionsLoaded = true;
  try {
    const response = await fetch("./intro.vtt?v=reaper-trim");
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

// Swap cuts when the viewport turns, keeping the playhead and play state.
function chooseSource() {
  const src = landscape.matches && !landscapeFailed ? sources.landscape : sources.portrait;
  if (video.getAttribute("src") === src) return;
  const resumeAt = video.currentTime;
  const resume = !video.paused && !video.ended;
  gallery.hidden = true;
  shotCompanion.hidden = true;
  video.src = src;
  if (resumeAt > 0 || resume) {
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = resumeAt;
      if (resume) video.play().catch(() => {});
    }, { once: true });
  }
}

video.addEventListener("loadedmetadata", () => {
  status.hidden = true;
  video.hidden = false;
  player.style.setProperty("--video-ratio", video.videoWidth / video.videoHeight);
  player.dataset.cut = video.videoWidth > video.videoHeight ? "landscape" : "portrait";
  loadSideWorks();
  updateShotLink();
  loadCaptions();
});

video.addEventListener("error", () => {
  if (video.getAttribute("src") === sources.landscape) {
    landscapeFailed = true;
    chooseSource();
    return;
  }
  status.textContent = "The video could not load.";
  status.hidden = false;
  video.hidden = true;
  shotLink.hidden = true;
  shotCompanion.hidden = true;
  gallery.hidden = true;
});

landscape.addEventListener("change", chooseSource);

status.textContent = "Loading video…";
chooseSource();
