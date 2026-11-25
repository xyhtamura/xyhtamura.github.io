import { cues, works } from "./cues.mjs";

const video = document.querySelector("#intro-video");
const player = video.parentElement;
const status = document.querySelector("#player-status");
const shotLink = document.querySelector("#shot-link");
const shotTitle = document.querySelector("#shot-title");
const workList = document.querySelector("#work-list");

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
  loadCaptions();
}, { once: true });

video.addEventListener("error", () => {
  status.textContent = "The video could not load.";
  status.hidden = false;
  video.hidden = true;
  shotLink.hidden = true;
});

video.src = "./intro.mp4";
