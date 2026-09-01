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

/* The work-link registry and the slide-source URL are the only things that
   differ between the general portfolio and the three MIT cuts, so each route
   supplies them in its own app.js and this file holds everything else. Loading
   the engine without a registry is not an error — headings simply carry no
   links. */
const workLinks = window.portfolioLinks || {};
const slidesURL = window.portfolioSlides || "slides.html";
let slides = [];
let slidesHTML = "";
let activeIndex = 0;
let observer;

/* Landscape gets its own slide structure, built by buildWide below. This is the
   same query styles.css uses. When it flips, the slides are re-rendered from the
   source HTML rather than unpicked in place, so there is one build path instead
   of a build and an inverse that can drift apart. */
const WIDE = matchMedia("(min-width: 801px) and (orientation: landscape)");

/* --------------------------------------------------------------------------
   Landscape slide builder.

   Two shapes, and only two. A sheet carrying one work becomes [pictures][text]
   across the slide; a sheet carrying several becomes a stack of panels, each of
   them [picture][text], filling the slide rather than its top half.

   The builder reads each picture's `--ar` — written into slides.html by the
   print build, out of the file header — decides where the rows break, and writes
   `--rowsum` and `--rown` onto each one. styles.css turns those into a width
   ceiling, which is what holds a row inside its height budget without cropping.
   Every number here comes off the pictures themselves.
   -------------------------------------------------------------------------- */

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

/* Sort one flow child into pictures and copy. Pictures come out as one ordered
   list, because in landscape the slide re-breaks them itself; the containers
   they arrived in are a print page's rows, solved against a different measure.
   A `.row` is unpicked for the same reason — it already mixes the two, and the
   landscape slide is doing that job. */
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

/* --------------------------------------------------------------------------
   Breaking a column into rows.

   Everything above holds pictures whole. What is left is how many rows to break
   them into, and where — and that decides how much of the column the pictures
   actually cover. A row shown whole across width W solves to a height of
   (W - gaps) / (sum of its ratios), so a row of wide pictures is short and a row
   of tall ones is tall, and R rows sharing a column of height H each get at most
   H / R. Whichever of the two binds is the row's height.

   Guessing the break is what left slides half empty: three wide pictures in one
   row solve to a fifth of the height they are given, and five tallish ones in
   three rows reach a third of the width. So the break is not guessed. For each
   row count the best partition is found by dynamic programming — rows are
   contiguous, so a row's area does not depend on the other rows once the count
   is fixed — and the count with the most picture area wins.

   The objective is total picture area with nothing cropped and the column not
   overrun. It has no taste in it: swap a picture for one of a different shape
   and the layout re-solves, with nothing here to retune.
   -------------------------------------------------------------------------- */
function planRows(ratios, width, height, stackGap, rowGap) {
  const count = ratios.length;
  if (count < 2) return [count].slice(0, count);

  /* Height of one row of `span` pictures starting at `from`, given a ceiling. */
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

    /* area[i][r] — the most picture area the first i pictures can cover in r
       rows; from[i][r] — where that last row started, for reconstruction. */
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

/* The width a plan wants: the widest row it holds, at the height each row gets.
   A row is only as wide as its pictures at that height, so a column given more
   than this parks white beside them, and one given less makes them shorter than
   they need to be. */
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

/* Fill a picture column with the rows planRows chose, and tell the stylesheet
   how many it holds so it can divide the column's height between them.

   `frame` is the grid the column stands in. Where there is one, the picture
   track is sized to what the plan wants rather than to a fixed fraction, and the
   plan is then solved again against the track it actually got. Two passes, not a
   loop: the first asks the pictures how wide they want to be, the second lays
   them out in that width. The bounds keep a very tall lead picture from
   squeezing the text into a gutter, and a very wide one from crowding it out. */
function fillMedia(column, figures, frame) {
  if (!figures.length) return;

  const stackGap = Number.parseFloat(getComputedStyle(column).rowGap) || 0;

  /* The row gap is read off a real row rather than assumed, so the plan is
     solved against the measure the rows will actually get. */
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
  const copy = [];
  [...page.children].forEach((child) => sortChild(child, figures, copy));

  const spread = document.createElement("div");
  spread.className = "spread";
  const media = document.createElement("div");
  media.className = "spread-media";
  const text = document.createElement("div");
  text.className = "spread-copy";

  copy.forEach((node) => text.append(node));
  spread.append(media, text);

  [...page.children].forEach((child) => {
    if (!child.matches(".blobfield, .folio")) child.remove();
  });
  page.append(spread);
  page.classList.add("wide-spread");
  /* Measured before it is filled. `container-type: size` on the spread means its
     contents cannot change its size, so the box read here is the box the rows
     will end up standing in. */
  fillMedia(media, figures, spread);
}

/* Pages 12 and 18 carry four works as cards with the picture above the text.
   That is the same content as a quad panel sheet, so they become one. */
function cardsToPanels(page) {
  const grid = page.querySelector(".anexacta-grid, .film-grid, .mosaic-digital");
  if (!grid) return;
  grid.classList.add("panels", "quad");
  grid.querySelectorAll("article").forEach((article) => {
    article.classList.add("panel");
    const copy = document.createElement("div");
    copy.className = "panel-copy";
    [...article.children].forEach((child) => {
      if (!child.matches("figure.slot")) copy.append(child);
    });
    article.append(copy);
  });
}

function buildPanels(page) {
  const pending = [];
  page.querySelectorAll(".panel").forEach((panel) => {
    const figures = [];
    const copy = [];
    [...panel.children].forEach((child) => {
      if (!child.matches(".panel-copy")) sortChild(child, figures, copy);
    });

    const media = document.createElement("div");
    media.className = "panel-media";

    const text = panel.querySelector(".panel-copy");
    if (text) copy.forEach((node) => text.append(node));
    [...panel.children].forEach((child) => {
      if (!child.matches(".panel-copy")) child.remove();
    });
    panel.prepend(media);
    pending.push([media, figures, panel]);
  });
  /* Every panel is emptied and the page classed before any of them is filled, so
     each column is measured against the grid it will actually be laid out in. */
  page.classList.add("wide-panels");
  pending.forEach(([media, figures, panel]) => fillMedia(media, figures, panel));
}

/* The cover is one field of pictures behind the name plate, so it is a picture
   column with no text column beside it. Its authored cells are four rows across
   half the measure, which at true ratios solve to half the height they are
   given. Across the whole measure the planner picks the break instead, and the
   seventeen pictures come out at nearly four times the area. */
function buildCover(page) {
  const mosaic = page.querySelector(".mosaic-cover-cells");
  if (!mosaic) return;
  const figures = figuresIn(mosaic);
  mosaic.replaceChildren();
  mosaic.classList.add("cover-stack");
  fillMedia(mosaic, figures);
}

function buildWide(page) {
  if (page.classList.contains("cover")) {
    buildCover(page);
    return;
  }
  cardsToPanels(page);
  if (page.querySelector(".panels")) buildPanels(page);
  else buildSpread(page);
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function headingName(heading) {
  const copy = heading.cloneNode(true);
  copy.querySelectorAll(".year").forEach((year) => year.remove());
  return copy.textContent.trim().replace(/\s+/g, " ");
}

function slug(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function addLinks(heading) {
  const name = headingName(heading);
  /* Matched case-insensitively: a cut can retitle a page's heading without the
     registry key silently ceasing to match and the links vanishing. */
  const key = Object.keys(workLinks).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  const links = key ? workLinks[key] : null;
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
    /* The print build writes a millimetre height budget onto a dozen figures.
       On screen it is a ceiling with no matching width ceiling, which is the one
       way a box can still come out a different shape from its picture. Drop it;
       the screen budgets its own height. */
    slide.querySelectorAll("figure.slot[style*='max-height']").forEach((figure) => {
      figure.style.removeProperty("max-height");
    });
    /* Authored rows carry their own membership; they need the same two numbers
       the built rows get, so the width ceiling applies to them as well. */
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
    const response = await fetch(slidesURL);
    if (!response.ok) throw new Error(`Slide request failed: ${response.status}`);
    slidesHTML = await response.text();
    render();
  } catch (error) {
    console.error(error);
    slidesRoot.innerHTML = '<p class="loading error">Portfolio could not load. Refresh the page to try again.</p>';
  }
}

/* Rebuilding keeps one build path. The slide being read is held across it; the
   scroll position inside that slide is not, because the landscape and portrait
   slides are different shapes.

   Two things ask for a rebuild: crossing the query, and — while past it — a
   resize, because the landscape row plan is solved against the measure the
   column had when it was built. Everything else is in viewport or container
   units and follows on its own, so a resize under the threshold is ignored.

   The trigger is a ResizeObserver on the slide area rather than the window's
   `resize` event or the query's own `change`. Neither of those fired when this
   was tested against an emulated viewport, and a layout left standing on the
   wrong side of the query is the worse failure. The observer watches the box the
   layout is actually solved against, so it also catches the cases a window event
   would miss — a scrollbar appearing, the pane being resized around the page.
   What is compared is the state the slides were last built in, not the event
   that announced the change, so a missed signal cannot leave the two disagreeing
   for longer than the next one. */
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
  /* Straight after render rather than on the next frame: the builder has already
     forced layout by measuring its columns, so the slide is where it will be, and
     a frame callback is one more thing that has to arrive. */
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
