const slidesRoot = document.querySelector("#slides");
const currentTitle = document.querySelector("#currentTitle");
const currentNumber = document.querySelector("#currentNumber");
const totalNumber = document.querySelector("#totalNumber");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const slideNav = document.querySelector("#slideNav");
const viewer = document.querySelector("#viewer");
const viewerImage = document.querySelector("#viewerImage");
const viewerCaption = document.querySelector("#viewerCaption");

const workLinks = {
  "Desiderata · xyhnthesizer": [
    ["Desiderata", "https://xyhtamura.bandcamp.com/album/desiderata"],
    ["The Wrong Eclipse", "https://thewrong.org"],
    ["xyhnthesizer demo", "https://www.instagram.com/p/DXrk60ITOau/"]
  ],
  "Eosforos": [
    ["Bandcamp", "https://xyhtochrome.bandcamp.com/album/eosforos"],
    ["The Wrong Eclipse", "https://thewrong.org"]
  ],
  "Tabota · Cycla · Stanzuary": [
    ["Tabota", "https://xyhtamura.github.io/tabota/"],
    ["Stanzuary", "https://xyhtamura.github.io/stanzuary/"]
  ],
  "Whisper House": [["View score", "https://xyhtamura.github.io/whisperhouse/"]],
  "Insulae Incognita": [
    ["Open work", "https://xyhtamura.github.io/insulaeincognita/"],
    ["Exhibition note", "https://www.dayangyraola.com/2025/07/proposal-for-another-history-98b-fub-9.html"]
  ],
  "Manifest": [
    ["Watch", "https://vimeo.com/1019003508"],
    ["Bea Mariano", "https://www.beamariano.com/"]
  ],
  "Cytophones": [["Open collection", "https://xyhtamura.github.io/cytophone/"]],
  "Glossolalia": [
    ["In Vitro", "https://xyhtamura.github.io/glossolalia-invitro.html"],
    ["Rabble", "https://xyhtamura.github.io/glossolalia-rabble.html"]
  ],
  "Electropond": [["Launch instrument", "https://xyhtamura.github.io/electropond/"]],
  "Anexacta": [["Open collection", "https://xyhtamura.github.io/anexacta/"]],
  "Aliquoto": [["Launch instrument", "https://xyhtamura.github.io/anexacta/aliquoto/"]],
  "Cella": [["Launch instrument", "https://xyhtamura.github.io/anexacta/cella/"]],
  "Moire": [["Launch instrument", "https://xyhtamura.github.io/anexacta/moire/"]],
  "Physa": [["Launch instrument", "https://xyhtamura.github.io/anexacta/physa/"]],
  "Cornice": [["Launch work", "https://xyhtamura.github.io/cornice/"]],
  "The Unbounded Organ": [
    ["Launch instrument", "https://xyhtamura.github.io/unbounded-organ/"],
    ["Read explainer", "https://xyhtamura.github.io/unbounded-organ/explainer.html"]
  ],
  "Ombak Lock": [["Launch work", "https://xyhtamura.github.io/ombak-lock/"]],
  "plica": [["Launch work", "https://xyhtamura.github.io/plica/"]],
  "The Magic Staff": [
    ["Watch", "https://www.youtube.com/watch?v=R4hyaAySjG0"],
    ["Press", "https://www.philstar.com/pilipino-star-ngayon/showbiz/2000/11/04/118632/gifted-children-san-sila-galing-"]
  ],
  "Palibut-Libot · 2018": [["Watch", "https://vimeo.com/245099254/f42219fc27"]],
  "Naughty Maids · 2026": [["Instagram", "https://www.instagram.com/stories/thenaughtymaids/"]],
  "Handaan · 2018": [["Watch", "https://vimeo.com/257075950/16254d49cb"]],
  "Memory of Jaro · 2019": [
    ["Trailer", "https://youtu.be/ulzUkRW31S4"],
    ["Asó nga Tin-aw", "https://youtu.be/m5h0V8sohe4"]
  ],
  "Remanence": [["Launch tool", "https://xyhtamura.github.io/hindcasts/remanence/"]],
  "CyberScotoma": [["Launch tool", "https://xyhtamura.github.io/sgueltch/cyberscotoma/"]],
  "Of Another Shore": [["Open suite", "https://ppk80.github.io/of-another-shore/"]],
  "Table of Metalloids": [["Open Plasticoid", "https://ppk80.github.io/plasticoid/"]]
};

let slides = [];
let activeIndex = 0;
let observer;

function pad(number) {
  return String(number).padStart(2, "0");
}

function headingName(heading) {
  const copy = heading.cloneNode(true);
  copy.querySelectorAll(".year").forEach((year) => year.remove());
  return copy.textContent.trim().replace(/\s+/g, " ");
}

function slug(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function addLinks(heading) {
  const name = headingName(heading);
  const links = workLinks[name];
  if (!links) return;

  const primary = document.createElement("a");
  primary.href = links[0][1];
  primary.target = "_blank";
  primary.rel = "noreferrer";
  primary.className = "title-link";
  while (heading.firstChild) primary.append(heading.firstChild);
  heading.append(primary);

  const list = document.createElement("p");
  list.className = "work-links";
  links.forEach(([label, url]) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = `${label} ↗`;
    list.append(link);
  });
  heading.insertAdjacentElement("afterend", list);
}

function openViewer(image) {
  viewerImage.src = image.currentSrc || image.src;
  viewerImage.alt = image.alt;
  viewerCaption.textContent = image.alt;
  viewer.showModal();
}

function setActive(index, updateHash = true) {
  activeIndex = Math.max(0, Math.min(index, slides.length - 1));
  const slide = slides[activeIndex];
  const heading = slide.querySelector("h1, h2");
  currentTitle.textContent = heading ? headingName(heading) : "Portfolio";
  currentNumber.textContent = pad(activeIndex + 1);
  prevButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === slides.length - 1;
  slideNav.querySelectorAll("button").forEach((button, buttonIndex) => {
    const active = buttonIndex === activeIndex;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  if (updateHash && history.replaceState) history.replaceState(null, "", `#${slide.id}`);
}

function goTo(index, behavior = "smooth") {
  const target = slides[Math.max(0, Math.min(index, slides.length - 1))];
  if (target) target.scrollIntoView({ behavior, block: "start" });
}

function prepareSlides() {
  slides = [...slidesRoot.querySelectorAll(".page")];
  totalNumber.textContent = pad(slides.length);
  slideNav.innerHTML = "";

  slides.forEach((slide, index) => {
    const heading = slide.querySelector("h1, h2");
    const name = heading ? headingName(heading) : `Slide ${index + 1}`;
    slide.classList.add("slide");
    slide.dataset.index = index;
    slide.id = `${pad(index + 1)}-${slug(name) || "portfolio"}`;
    slide.setAttribute("aria-label", `Slide ${index + 1}: ${name}`);

    slide.querySelectorAll(".spec").forEach((spec) => spec.remove());
    slide.querySelectorAll("h2, h3").forEach(addLinks);
    slide.querySelectorAll("img").forEach((image) => {
      image.loading = index === 0 ? "eager" : "lazy";
      image.decoding = "async";
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `Enlarge image: ${image.alt}`);
      image.addEventListener("click", () => openViewer(image));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openViewer(image);
        }
      });
    });

    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}: ${name}`);
    dot.title = `${pad(index + 1)} · ${name}`;
    dot.addEventListener("click", () => goTo(index));
    slideNav.append(dot);
  });

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(Number(entry.target.dataset.index));
    });
  }, { root: slidesRoot, rootMargin: "-46% 0px -46% 0px", threshold: 0 });
  slides.forEach((slide) => observer.observe(slide));

  const requested = decodeURIComponent(location.hash.slice(1));
  const startIndex = slides.findIndex((slide) => slide.id === requested);
  setActive(startIndex >= 0 ? startIndex : 0, false);
  if (startIndex >= 0) requestAnimationFrame(() => goTo(startIndex, "auto"));
}

async function init() {
  try {
    const response = await fetch("slides.html");
    if (!response.ok) throw new Error(`Slide request failed: ${response.status}`);
    slidesRoot.innerHTML = await response.text();
    prepareSlides();
  } catch (error) {
    console.error(error);
    slidesRoot.innerHTML = '<p class="loading error">Portfolio could not load. Refresh the page to try again.</p>';
  }
}

prevButton.addEventListener("click", () => goTo(activeIndex - 1));
nextButton.addEventListener("click", () => goTo(activeIndex + 1));
document.querySelector("#viewerClose").addEventListener("click", () => viewer.close());
viewer.addEventListener("click", (event) => {
  if (event.target === viewer) viewer.close();
});

document.addEventListener("keydown", (event) => {
  if (viewer.open || ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
  if (["ArrowRight", "PageDown"].includes(event.key)) {
    event.preventDefault();
    goTo(activeIndex + 1);
  }
  if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    goTo(activeIndex - 1);
  }
  if (event.key === "Home") {
    event.preventDefault();
    goTo(0);
  }
  if (event.key === "End") {
    event.preventDefault();
    goTo(slides.length - 1);
  }
});

init();
