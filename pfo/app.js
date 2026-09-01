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
  "Desiderata · xyhnthesizer · The Unbounded Organ": [
    ["Desiderata stream", "https://xyhtamura.bandcamp.com/album/desiderata"],
    ["The Wrong Eclipse", "https://thewrong.org"],
    ["xyhnthesizer demo", "https://www.instagram.com/p/DXrk60ITOau/"],
    ["The Unbounded Organ", "https://xyhtamura.github.io/unbounded-organ/"]
  ],
  "Experimental Pop and Performance": [
    ["Spotify", "https://open.spotify.com/artist/6sC8YWzht783z5DhjB1j0N"],
    ["Bandcamp", "https://xyhtamura.bandcamp.com"],
    ["Pacing To", "https://masmxyh.bandcamp.com/album/pacing-to"],
    ["Piyesta Plaza", "https://cyberpaean.bandcamp.com/album/piyesta-plaza-1985-to-1995-airwaves"]
  ],
  "Eosforos": [
    ["Bandcamp", "https://xyhtochrome.bandcamp.com/album/eosforos"],
    ["The Wrong Eclipse", "https://thewrong.org"],
    ["Hadean Flare", "https://xyhtamura.github.io/hadeanflare/"],
    ["Roil", "https://xyhtamura.github.io/roil/"],
    ["Antemelos", "https://xyhtamura.github.io/antemelos/"],
    ["Kaos Magick", "https://www.facebook.com/artologist/posts/1257909719683580/"]
  ],
  "Tabota · Cycla · Stanzuary": [
    ["Tabota", "https://xyhtamura.github.io/tabota/"],
    ["Tabota Roll", "https://xyhtamura.github.io/tabota/roll/"],
    ["Cycla", "https://xyhtamura.github.io/tabota/cycla/builder/"],
    ["Stanzuary", "https://xyhtamura.github.io/stanzuary/"],
    ["Binlod", "https://xyhtamura.github.io/binlod/"]
  ],
  "Cytophones": [["Open collection", "https://xyhtamura.github.io/cytophone/"]],
  "Night Bus · intermedia musicopoetics": [
    ["Read paper", "https://www.researchgate.net/publication/393631680_Intermedia_Musicopoetics_and_Transpractice_Songwriting_in_Night_Bus"],
    ["Saliksik-Musika II", "https://www.facebook.com/U.P.Visayas.Official/posts/pfbid0grNNpExXsDdu87idz22Pmt8bue2W4T9jnwKr4FJ3qB8tfGKnCsL68keidgxAURpPl"]
  ],
  "Manifest": [
    ["Watch", "https://vimeo.com/1019003508"],
    ["Online project", "https://www.instagram.com/manifest.0x"],
    ["Bea Mariano", "https://www.beamariano.com/"]
  ],
  "The Magic Staff": [
    ["Production archive", "https://xyhtamura.github.io/the-magic-staff/"],
    ["Watch", "https://www.youtube.com/watch?v=R4hyaAySjG0"],
    ["Press", "https://www.philstar.com/pilipino-star-ngayon/showbiz/2000/11/04/118632/gifted-children-san-sila-galing-"]
  ],
  "Anexacta": [["Open collection", "https://xyhtamura.github.io/anexacta/"]],
  "Aliquoto": [["Launch instrument", "https://xyhtamura.github.io/anexacta/aliquoto/"]],
  "Cella": [["Launch instrument", "https://xyhtamura.github.io/anexacta/cella/"]],
  "Moire": [["Launch instrument", "https://xyhtamura.github.io/anexacta/moire/"]],
  "Physa": [["Launch instrument", "https://xyhtamura.github.io/anexacta/physa/"]]
};

let slides = [];
let slidesHTML = "";
let activeIndex = 0;
let observer;

const WIDE = matchMedia("(min-width: 801px) and (orientation: landscape)");

const ratio = (figure) => Number.parseFloat(figure.style.getPropertyValue("--ar")) || 1;
const figuresIn = (node) => [...node.querySelectorAll("figure.slot")];

function annotateRow(row, figures) {
  row.style.setProperty("--rowsum", figures.reduce((total, figure) => total + ratio(figure), 0).toFixed(4));
  row.style.setProperty("--rown", String(figures.length));
}

function justifiedRow(figures) {
  const row = document.createElement("div");
  row.className = "jrow";
  annotateRow(row, figures);
  figures.forEach((figure) => row.append(figure));
  return row;
}

const sumRatios = (figures) => figures.reduce((total, figure) => total + ratio(figure), 0);

function sortChild(node, figures, copy) {
  if (node.matches(".blobfield, .folio")) return;
  if (node.matches("figure.slot")) {
    figures.push(node);
    return;
  }
  if (node.matches(".justified, .thumbstrip, .feature-grid, .p03-study-grid, .mosaic")) {
    figuresIn(node).forEach((figure) => figures.push(figure));
    return;
  }
  if (node.matches(".row")) {
    [...node.children].forEach((child) => {
      if (child.matches("figure.slot")) figures.push(child);
      else sortChild(child, figures, copy);
    });
    return;
  }
  if (node.matches(".grow, .col")) {
    const inside = figuresIn(node);
    if (!inside.length) {
      copy.push(node);
      return;
    }
    inside.forEach((figure) => figures.push(figure));
    [...node.children].forEach((child) => {
      if (!child.matches("figure.slot") && !figuresIn(child).length) copy.push(child);
    });
    return;
  }
  copy.push(node);
}

function planRows(ratios, width, height, stackGap, rowGap) {
  const count = ratios.length;
  if (count < 2) return [count].slice(0, count);

  const rowHeight = (from, span, sums, cap) => {
    const spread = sums[from + span] - sums[from];
    const measure = width - (span - 1) * rowGap;
    if (spread <= 0 || measure <= 0) return 0;
    return Math.min(cap, measure / spread);
  };

  const sums = [0];
  ratios.forEach((r, i) => sums.push(sums[i] + r));

  let bestPlan = [count];
  let bestArea = -1;

  for (let rows = 1; rows <= count; rows += 1) {
    const cap = (height - (rows - 1) * stackGap) / rows;
    if (cap <= 0) break;

    const area = [];
    const from = [];
    for (let i = 0; i <= count; i += 1) {
      area.push(new Array(rows + 1).fill(-Infinity));
      from.push(new Array(rows + 1).fill(0));
    }
    area[0][0] = 0;

    for (let i = 1; i <= count; i += 1) {
      for (let r = 1; r <= Math.min(rows, i); r += 1) {
        for (let start = r - 1; start < i; start += 1) {
          if (area[start][r - 1] === -Infinity) continue;
          const h = rowHeight(start, i - start, sums, cap);
          const gained = h * h * (sums[i] - sums[start]);
          if (area[start][r - 1] + gained > area[i][r]) {
            area[i][r] = area[start][r - 1] + gained;
            from[i][r] = start;
          }
        }
      }
    }

    if (area[count][rows] <= bestArea) continue;
    bestArea = area[count][rows];
    const plan = [];
    let at = count;
    for (let r = rows; r > 0; r -= 1) {
      const start = from[at][r];
      plan.unshift(at - start);
      at = start;
    }
    bestPlan = plan;
  }

  return bestPlan;
}

function planWidth(plan, ratios, height, stackGap, rowGap) {
  const cap = (height - (plan.length - 1) * stackGap) / plan.length;
  let at = 0;
  let widest = 0;
  plan.forEach((span) => {
    const spread = ratios.slice(at, at + span).reduce((total, r) => total + r, 0);
    widest = Math.max(widest, cap * spread + (span - 1) * rowGap);
    at += span;
  });
  return widest;
}

function fillMedia(column, figures, frame) {
  if (!figures.length) return;

  const stackGap = Number.parseFloat(getComputedStyle(column).rowGap) || 0;
  const probe = document.createElement("div");
  probe.className = "jrow";
  column.append(probe);
  const rowGap = Number.parseFloat(getComputedStyle(probe).columnGap) || 0;
  probe.remove();

  const ratios = figures.map(ratio);
  let box = column.getBoundingClientRect();
  let plan = planRows(ratios, box.width || 1, box.height || 1, stackGap, rowGap);

  if (frame) {
    const wanted = planWidth(plan, ratios, box.height || 1, stackGap, rowGap);
    const frameWidth = frame.getBoundingClientRect().width || 1;
    const frameStyle = getComputedStyle(frame);
    const minShare = Number.parseFloat(frameStyle.getPropertyValue("--media-min")) || 24;
    const maxShare = Number.parseFloat(frameStyle.getPropertyValue("--media-max")) || 70;
    const share = Math.min(maxShare, Math.max(minShare, (wanted / frameWidth) * 100));
    frame.style.setProperty("--media-w", `${share.toFixed(2)}%`);
    box = column.getBoundingClientRect();
    plan = planRows(ratios, box.width || 1, box.height || 1, stackGap, rowGap);
  }

  let at = 0;
  plan.forEach((span) => {
    column.append(justifiedRow(figures.slice(at, at + span)));
    at += span;
  });

  column.style.setProperty("--stack", String(plan.length || 1));
}

function buildSpread(page) {
  const figures = [];
  const copyNodes = [];

  [...page.children].forEach((child) => sortChild(child, figures, copyNodes));

  const spread = document.createElement("div");
  spread.className = "spread";

  const mediaCol = document.createElement("div");
  mediaCol.className = "media-col";

  const copyCol = document.createElement("div");
  copyCol.className = "copy-col";
  copyNodes.forEach((node) => copyCol.append(node));

  spread.append(mediaCol, copyCol);
  page.append(spread);

  fillMedia(mediaCol, figures, spread);
}

function buildPanel(panel) {
  const figures = [];
  const copyNodes = [];

  [...panel.children].forEach((child) => {
    if (child.matches(".panel-copy")) {
      [...child.children].forEach((sub) => sortChild(sub, figures, copyNodes));
    } else {
      sortChild(child, figures, copyNodes);
    }
  });

  panel.innerHTML = "";

  const frame = document.createElement("div");
  frame.className = "panel-frame";

  const mediaCol = document.createElement("div");
  mediaCol.className = "panel-media";

  const copyCol = document.createElement("div");
  copyCol.className = "panel-text";
  copyNodes.forEach((node) => copyCol.append(node));

  frame.append(mediaCol, copyCol);
  panel.append(frame);

  fillMedia(mediaCol, figures, frame);
}

function buildCover(page) {
  const mosaic = page.querySelector(".mosaic");
  const plate = page.querySelector(".practice-plate");
  if (!mosaic || !plate) return;

  const stack = document.createElement("div");
  stack.className = "cover-stack";
  stack.append(mosaic, plate);
  page.append(stack);

  const figures = figuresIn(mosaic);
  mosaic.innerHTML = "";

  const probe = document.createElement("div");
  probe.className = "jrow";
  mosaic.append(probe);
  const rowGap = Number.parseFloat(getComputedStyle(probe).columnGap) || 0;
  const stackGap = Number.parseFloat(getComputedStyle(mosaic).rowGap) || 0;
  probe.remove();

  const ratios = figures.map(ratio);
  const box = mosaic.getBoundingClientRect();
  const plan = planRows(ratios, box.width || 1, box.height || 1, stackGap, rowGap);

  let at = 0;
  plan.forEach((span) => {
    mosaic.append(justifiedRow(figures.slice(at, at + span)));
    at += span;
  });
  mosaic.style.setProperty("--stack", String(plan.length || 1));
}

function buildWide(page) {
  if (page.matches(".cover")) {
    buildCover(page);
    return;
  }
  if (page.matches(".panelled")) {
    page.querySelectorAll(".panel").forEach(buildPanel);
    return;
  }
  buildSpread(page);
}

function headingName(heading) {
  return heading.childNodes[0]?.textContent?.trim().replace(/\s+/g, " ") || heading.textContent.trim();
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function addLinks(heading) {
  const raw = headingName(heading);
  const title = Object.keys(workLinks).find((key) => key.toLowerCase() === raw.toLowerCase()) || raw;
  const links = workLinks[title];
  if (!links || heading.querySelector(".work-links")) return;

  const list = document.createElement("span");
  list.className = "work-links";
  links.forEach(([label, url]) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.className = "work-link";
    link.textContent = label;
    list.append(link);
  });
  heading.append(list);
}

function openViewer(image) {
  viewerImage.src = image.src;
  viewerImage.alt = image.alt;
  viewerCaption.textContent = image.alt;
  viewer.showModal();
}

function setActive(index, updateHash = true) {
  if (index < 0 || index >= slides.length) return;
  activeIndex = index;
  const slide = slides[activeIndex];
  const heading = slide.querySelector("h1, h2");
  currentTitle.textContent = heading ? headingName(heading) : "Apparatus";
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
    const mediaCount = slide.querySelectorAll("img").length;
    const wordCount = slide.textContent.trim().split(/\s+/).filter(Boolean).length;
    slide.classList.add("slide");
    slide.classList.add(mediaCount >= 7 ? "media-rich" : mediaCount >= 4 ? "media-set" : "media-sparse");
    if (wordCount >= 150) slide.classList.add("copy-dense");
    slide.dataset.index = index;
    slide.dataset.mediaCount = mediaCount;
    slide.id = `${pad(index + 1)}-${slug(name) || "portfolio"}`;
    slide.setAttribute("aria-label", `Slide ${index + 1}: ${name}`);

    slide.querySelectorAll(".spec").forEach((spec) => spec.remove());
    slide.querySelectorAll("figure.slot[style*='max-height']").forEach((figure) => {
      figure.style.removeProperty("max-height");
    });
    slide.querySelectorAll(".justified").forEach((row) => annotateRow(row, figuresIn(row)));
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

    if (WIDE.matches) buildWide(slide);
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

function render() {
  if (observer) observer.disconnect();
  built = measureFrame();
  slidesRoot.innerHTML = slidesHTML;
  prepareSlides();
}

async function init() {
  try {
    const response = await fetch("slides.html?v=1");
    if (!response.ok) throw new Error(`Slide request failed: ${response.status}`);
    slidesHTML = await response.text();
    render();
  } catch (error) {
    console.error(error);
    slidesRoot.innerHTML = '<p class="loading error">Portfolio could not load. Refresh the page to try again.</p>';
  }
}

let built = { wide: null, width: 0, height: 0 };
let rebuildTimer;

function measureFrame() {
  const box = slidesRoot.getBoundingClientRect();
  return { wide: WIDE.matches, width: box.width, height: box.height };
}

function staleLayout() {
  const now = measureFrame();
  if (now.wide !== built.wide) return true;
  if (!now.wide) return false;
  return Math.abs(now.width - built.width) >= 40 || Math.abs(now.height - built.height) >= 40;
}

function rebuild() {
  if (!staleLayout()) return;
  const at = activeIndex;
  render();
  setActive(at, false);
  goTo(at, "auto");
}

function scheduleRebuild() {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(rebuild, 180);
}

new ResizeObserver(scheduleRebuild).observe(slidesRoot);
WIDE.addEventListener("change", scheduleRebuild);
addEventListener("resize", scheduleRebuild);

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
