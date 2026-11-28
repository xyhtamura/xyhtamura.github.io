import { cues, works } from "./cues.mjs?v=night-bus";

const video = document.querySelector("#intro-video");
const player = video.parentElement;
const status = document.querySelector("#player-status");
const shotLink = document.querySelector("#shot-link");
const shotTitle = document.querySelector("#shot-title");
const workList = document.querySelector("#work-list");

// Both cuts share one edit list, so cue times and captions apply to either file.
const landscape = matchMedia("(min-width: 35rem) and (min-aspect-ratio: 6/5)");
const sources = {
  portrait: "./intro.mp4?v=night-bus",
  landscape: "./intro-landscape.mp4?v=night-bus",
};
let landscapeFailed = false;
let captionsLoaded = false;

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
  if (captionsLoaded) return;
  captionsLoaded = true;
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

// Swap cuts when the viewport turns, keeping the playhead and play state.
function chooseSource() {
  const src = landscape.matches && !landscapeFailed ? sources.landscape : sources.portrait;
  if (video.getAttribute("src") === src) return;
  const resumeAt = video.currentTime;
  const resume = !video.paused && !video.ended;
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
});

landscape.addEventListener("change", chooseSource);

status.textContent = "Loading video…";
chooseSource();
