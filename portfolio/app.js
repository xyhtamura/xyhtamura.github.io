/* ============================================================
   RENDER
============================================================ */
const pad2 = n => String(n).padStart(2, "0");

/* ------------------------------------------------------------
   CONFIG — global defaults for the new set grammar.
   Flip DEFAULT_CHROME to "none" if you want sets to render as
   continuous fields by default instead of walled-off blocks.
------------------------------------------------------------ */
const DEFAULT_CHROME  = "dividers"; // "dividers" | "none"
const DEFAULT_LAYOUT  = "stack";    // "stack" | "row" | "grid" | <number> | [..spans]

const IMG_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`;

function renderMediaItem(m) {
  if (!m) return "";
  if (m.type === "placeholder") {
    return `<div class="media-item"><div class="media-ph">${IMG_ICON}<span>${m.label || "image"}</span></div></div>`;
  }
  if (m.type === "image") {
    const esc = (s) => (s || "").replace(/"/g, "&quot;");
    return `<div class="media-item" onclick="openLb('${esc(m.src)}','${esc(m.label||"")}')">
      <img src="${esc(m.src)}" alt="${esc(m.label||"")}">
      <div class="media-overlay">${m.label || ""}</div>
    </div>`;
  }
  if (m.type === "video-loop") {
    return `<div class="media-item media-item--wide"><video src="${m.src || ""}" autoplay loop muted playsinline preload="metadata"></video></div>`;
  }
  if (m.type === "video") {
    return `<div class="media-item media-item--wide"><video src="${m.src || ""}" controls preload="none"></video></div>`;
  }
  if (m.type === "youtube") {
    return `<div class="media-item media-item--wide"><iframe src="https://www.youtube.com/embed/${m.id || ""}" allowfullscreen></iframe></div>`;
  }
  if (m.type === "soundcloud") {
    const url = encodeURIComponent(m.url || "");
    const color = (m.color || "ff5500").replace("#", "");
    return `<div class="media-item media-item--audio"><iframe
      src="https://w.soundcloud.com/player/?url=${url}&color=%23${color}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=${m.visual !== false}"
      scrolling="no" allow="autoplay"></iframe></div>`;
  }
  if (m.type === "bandcamp") {
    // m.id = the numeric album/track id from the embed code
    // m.kind = "album" | "track" (default "album")
    const kind = m.kind || "album";
    const bgcol = (m.bgcol || "333333").replace("#", "");
    const linkcol = (m.linkcol || "ffffff").replace("#", "");
    return `<div class="media-item media-item--audio"><iframe
      src="https://bandcamp.com/EmbeddedPlayer/${kind}=${m.id || ""}/size=large/bgcol=${bgcol}/linkcol=${linkcol}/tracklist=${m.tracklist !== false}/transparent=true/"
      seamless></iframe></div>`;
  }
  if (m.type === "audio") {
    return `<div class="media-item media-item--audio">
      <audio controls preload="none" style="width:100%; height:100%;">
        <source src="${m.src || ""}" type="${m.mime || "audio/mpeg"}">
      </audio>
      ${m.label ? `<div class="media-overlay">${m.label}</div>` : ""}
    </div>`;
  }

  return "";
}

/* ============================================================
   WORKREF — scroll to a named work by id
============================================================ */
function scrollToWork(id) {
  const el = document.getElementById("work-" + id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ============================================================
   SHARED HELPERS
============================================================ */
/**
 * Render a links block. Handles both external links and internal
 * workrefs ({ type: "internal", label: "...", target: "work-id" }).
 */
function renderLinks(links, fontSize = "0.85rem") {
  if (!links || links.length === 0) return "";
  const items = links.map(lnk => {
    if (lnk.type === "internal") {
      return `<li style="font-size:${fontSize}; line-height:1.4;">
        <a href="#work-${lnk.target}" class="workref"
           onclick="event.preventDefault(); scrollToWork('${lnk.target}')"
        >${lnk.label || lnk.target} ↙</a>
      </li>`;
    }
    return `<li style="font-size:${fontSize}; line-height:1.4;">
      <span style="color:var(--text); font-weight:bold;">${lnk.label || "Link"}:</span>
      <a href="${lnk.url || "#"}" target="_blank" class="explicit-url"
         style="color:var(--ch); text-decoration:none; word-break:break-all; font-family:monospace; margin-left:.25rem;"
      >${lnk.url || ""} ↗</a>
    </li>`;
  }).join("");
  return `<div style="margin-top:1rem; padding-top:.8rem; border-top:1px solid var(--border);">
    <ul style="list-style:none; display:flex; flex-direction:column; gap:.4rem;">${items}</ul>
  </div>`;
}
function renderExhibitions(exhibitions, fontSize = "0.75rem", gap = "0.3rem") {
  if (!exhibitions || exhibitions.length === 0) return "";
  return `<div style="margin-top:.8rem; display:flex; flex-direction:column; gap:${gap};">
    ${exhibitions.map(ex => {
      let content = "";
      // Use custom type capitalized nicely, or fallback to "Presented at"
      const prefix = ex.type ? ex.type : "Presented at";

      if (!ex.venue && ex.event) {
        // Condition 1: No venue, but event exists
        content = `${prefix} <em>${ex.event}</em>`;
      } else if (ex.venue && !ex.event) {
        // Condition 2: FIXED — Now properly includes the prefix type before the venue!
        content = `${prefix} <strong>${ex.venue}</strong>`;
      } else if (ex.venue && ex.event) {
        // Standard layout fallback
        content = `${prefix} <strong>${ex.venue}</strong> <em>${ex.event}</em>`;
      }

      // Append custom details text and/or the year if present
      const detailsHTML = ex.details ? `<span class="ex-details" style="margin-left:.25rem; margin-right:.25rem;">${ex.details}</span>` : "";
      const yearHTML = ex.year ? `(${ex.year})` : "";

      if (!content && !detailsHTML && !yearHTML) return "";

      return `
        <div style="font-family:'Averia Sans Libre',sans-serif; font-size:${fontSize}; color:var(--text-dim); line-height:1.35;">
          ${content}${detailsHTML}${yearHTML}
        </div>`;
    }).join("")}
  </div>`;
}
function renderTags(tags) {
  return (tags || []).map(t => `<span class="tag">${t}</span>`).join("");
}

/* ---- Per-entry renderers (reused in standalone slides and set children) ---- */

function renderGridCard(p) {
  const title = p.title || "";
  const letter = title.replace(/^(A|An|The)\s+/i, "").charAt(0) || "?";
  const thumb  = p.thumbnail
    ? `<img src="${p.thumbnail}" alt="${title}">`
    : `<div class="acad-ph"><span class="big-ltr">${letter}</span></div>`;
  const collabHTML = p.collaborators
    ? `<span class="tag tag-collab" style="border-color:var(--mg);color:var(--mg);margin-top:.15rem;">With ${p.collaborators}</span>`
    : "";
  return `<article class="acad-card"${p.id ? ` id="work-${p.id}"` : ""}>
    <div class="acad-thumb">${thumb}</div>
    <div class="acad-body">
      <div class="acad-title">${title}</div>
      <div class="acad-year">${p.year || ""}</div>
      <p class="acad-blurb">${p.blurb || ""}</p>
      <div class="acad-tags">${renderTags(p.tags)}${collabHTML}</div>
      ${renderExhibitions(p.exhibitions, "0.7rem")}
      ${renderLinks(p.links, "0.75rem")}
    </div>
  </article>`;
}

function renderPanelCard(p) {
  const title = p.title || "";
  const collabHTML = p.collaborators
    ? `<span class="tag tag-collab" style="border-color:var(--mg);color:var(--mg);">With ${p.collaborators}</span>`
    : "";
  const mediaHTML = (p.media || []).map(renderMediaItem).join("");
  const hasMedia = (p.media || []).length > 0;
  return `<article class="panel-card"${p.id ? ` id="work-${p.id}"` : ""}>
    ${hasMedia ? `<div class="panel-media">${mediaHTML}</div>` : ""}
    <div class="panel-body">
      <div class="panel-title">${title}</div>
      <div class="panel-year">${p.year || ""}</div>
      <p class="panel-blurb">${p.blurb || ""}</p>
      <div class="panel-tags">${renderTags(p.tags)}${collabHTML}</div>
      ${renderExhibitions(p.exhibitions, "0.72rem")}
      ${renderLinks(p.links, "0.8rem")}
    </div>
  </article>`;
}

/* ---- Block renderers (shared by standalone slides + set children) ---- */

/**
 * Full "piece" body (title / meta / tags / media / blurb / exhibitions / links).
 * heading: "h2" for standalone slides, "h3" for set children.
 */
function renderPieceBody(p, { heading = "h2", titleStyle = "" } = {}) {
  p = p || {};
  const tag = heading === "h3" ? "h3" : "h2";
  const mediaHTML = (p.media || []).map(renderMediaItem).join("");
  const collabHTML = p.collaborators
    ? `<span class="tag tag-collab" style="border-color:var(--mg);color:var(--mg);">With ${p.collaborators}</span>`
    : "";
  return `
    <${tag} class="piece-title"${titleStyle ? ` style="${titleStyle}"` : ""}>${p.title || ""}</${tag}>
    <div class="piece-meta" style="margin-bottom:.4rem;">${p.year || ""}</div>
    <div class="piece-tags" style="margin-bottom:1.1rem;">${renderTags(p.tags)}${collabHTML}</div>
    <div class="media-strip">${mediaHTML}</div>
    <p class="piece-blurb">${p.blurb || ""}</p>
    ${renderExhibitions(p.exhibitions, "0.75rem", "0.5rem")}
    ${renderLinks(p.links)}`;
}

function renderGridBlock(node, headerText, headerStyle = "") {
  const header = headerText
    ? `<div class="grid-header"${headerStyle ? ` style="${headerStyle}"` : ""}>${headerText}</div>`
    : "";
  return `${header}<div class="academic-grid">${(node.pieces || []).map(renderGridCard).join("")}</div>`;
}

function renderPanelsBlock(node, headerText, headerStyle = "") {
  const header = headerText
    ? `<div class="grid-header"${headerStyle ? ` style="${headerStyle}"` : ""}>${headerText}</div>`
    : "";
  return `${header}<div class="panel-grid">${(node.panels || []).map(renderPanelCard).join("")}</div>`;
}

/* ============================================================
   RECURSIVE SET ENGINE

   A "set" is just a container. Two independent axes control it:

     layout  — how children share space:
                 "stack"  (vertical, default)
                 "row"    (horizontal, wraps)
                 "grid"   (responsive auto-fit columns)
                 <number> (that many equal columns, e.g. 3)
                 [2,1,..] (explicit fr spans per column)
               a child may also carry `span: N` to span N columns
               in grid / number / array layouts.

     chrome  — whether children read as separate works:
                 "dividers" (lead gets a rule, children labelled + gapped)
                 "none"     (continuous field: no lead rule, labels
                             suppressed, tighter gap)
               chrome INHERITS into nested sets unless a child set
               sets its own. So `chrome:"none"` on an outer set makes
               the whole nested tree continuous in one line.

   `children` may contain nodes of kind grid / panels / piece / set,
   so sets nest arbitrarily deep. Legacy `pieces[]` (no children) is
   still rendered as a grid, exactly as before.
============================================================ */

function setChildrenContainerStyle(layout, gap) {
  if (Array.isArray(layout)) {
    const cols = layout.map(n => `${n}fr`).join(" ");
    return `display:grid; grid-template-columns:${cols}; gap:${gap}; align-items:start;`;
  }
  if (typeof layout === "number") {
    return `display:grid; grid-template-columns:repeat(${layout}, 1fr); gap:${gap}; align-items:start;`;
  }
  if (layout === "grid") {
    return `display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:${gap}; align-items:start;`;
  }
  if (layout === "row") {
    return `display:flex; flex-direction:row; flex-wrap:wrap; gap:${gap}; align-items:start;`;
  }
  // "stack" (default)
  return `display:flex; flex-direction:column; gap:${gap};`;
}

function renderSetBlock(node, ctx = {}) {
  const depth  = ctx.depth || 0;
  // chrome is inherited from parent unless this set declares its own
  const chrome = node.chrome ?? ctx.chrome ?? DEFAULT_CHROME;
  const layout = node.layout ?? DEFAULT_LAYOUT;
  const lead   = node.lead || node.main || null;
  const isNone = chrome === "none";

  // ---- lead ("description + pics of whole") ----
  let leadHTML = "";
  if (lead) {
    const leadStyle = isNone
      ? "padding-bottom:1.2rem; margin-bottom:1.5rem;"
      : "padding-bottom:2rem; border-bottom:1px dashed var(--border-hi); margin-bottom:2rem;";
    const mediaHTML = (lead.media || []).map(renderMediaItem).join("");
    const collabHTML = lead.collaborators
      ? `<span class="tag tag-collab" style="border-color:var(--mg);color:var(--mg);">With ${lead.collaborators}</span>`
      : "";
    // At depth 0 the anchor lives on the slide div, so don't duplicate the id here.
    const idAttr = (depth > 0 && lead.id) ? ` id="work-${lead.id}"` : "";
    leadHTML = `
      <div class="set-main-body"${idAttr} style="${leadStyle}">
        <h2 class="piece-title">${lead.title || ""}</h2>
        <div class="piece-meta" style="margin-bottom:.4rem;">${lead.year || ""}</div>
        <div class="piece-tags" style="margin-bottom:1.1rem;">${renderTags(lead.tags)}${collabHTML}</div>
        <div class="media-strip">${mediaHTML}</div>
        <p class="piece-blurb">${lead.blurb || ""}</p>
        ${renderExhibitions(lead.exhibitions, "0.75rem", "0.5rem")}
        ${renderLinks(lead.links)}
      </div>`;
  }

  // ---- children ----
  let childrenHTML = "";
  const gap = isNone ? "1.1rem" : "2rem";
  const spanCapable = Array.isArray(layout) || typeof layout === "number" || layout === "grid";

  if (node.children && node.children.length) {
    const childCtx = { depth: depth + 1, chrome };
    const cells = node.children.map(child => {
      const spanStyle = (spanCapable && child && child.span)
        ? ` style="grid-column: span ${child.span};"`
        : "";
      return `<div class="set-child"${spanStyle}>${renderNode(child, childCtx)}</div>`;
    }).join("");
    childrenHTML = `<div class="set-children" style="${setChildrenContainerStyle(layout, gap)}">${cells}</div>`;
  } else if (node.pieces && node.pieces.length) {
    // Legacy fallback: a set with a bare pieces[] becomes a grid.
    const label = isNone
      ? ""
      : `<div class="grid-header" style="font-size:.85rem; color:var(--text-dim); margin-bottom:1.2rem;">Suite Tools &amp; Environments</div>`;
    childrenHTML = `${label}<div class="academic-grid">${node.pieces.map(renderGridCard).join("")}</div>`;
  }

  return `<div class="set-container" style="display:flex; flex-direction:column; width:100%;">${leadHTML}${childrenHTML}</div>`;
}

/**
 * Render any content node (grid / panels / piece / set) as a set child.
 * Recurses on nested sets. `ctx.chrome` is the PARENT set's chrome, which
 * decides whether this child shows its own label.
 */
function renderNode(node, ctx = {}) {
  if (!node) return "";
  const parentChrome = ctx.chrome || DEFAULT_CHROME;
  const showLabel = parentChrome !== "none";
  const labelStyle = "font-size:.85rem; color:var(--text-dim); margin-bottom:1.2rem;";
  const headerText = showLabel ? (node.label || "") : "";
  const labelHTML  = headerText ? `<div class="grid-header" style="${labelStyle}">${headerText}</div>` : "";

  if (node.kind === "grid")   return renderGridBlock(node, headerText, labelStyle);
  if (node.kind === "panels") return renderPanelsBlock(node, headerText, labelStyle);
  if (node.kind === "piece") {
    const p = node.piece || {};
    return `${labelHTML}<div${p.id ? ` id="work-${p.id}"` : ""}>${renderPieceBody(p, { heading: "h3", titleStyle: "font-size:clamp(1.2rem,3vw,2rem);" })}</div>`;
  }
  if (node.kind === "set") {
    // pass parent chrome so nested sets can inherit it
    return renderSetBlock(node, { depth: (ctx.depth || 0), chrome: ctx.chrome });
  }
  return "";
}

// Back-compat alias (older code/data referred to renderSetChild).
const renderSetChild = renderNode;

/* ---- Main slide factory ---- */

function makeSlideEl(obj, gi) {
  const num = pad2(gi + 1);
  const div = document.createElement("div");
  div.className = "slide";
  div.dataset.idx = gi;

  // Assign workref anchor if the slide has a top-level id
  if (obj.id) div.id = "work-" + obj.id;

  if (obj.kind === "title") {
    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      <div class="divider-body">
        <h1 class="divider-label"><em>${PORTFOLIO.name || "Portfolio"}</em></h1>
        <div class="piece-meta" style="margin-top:.2rem; margin-bottom:1.5rem; font-size:.82rem; letter-spacing:.2em;">
          Interdisciplinary Artist-Researcher &ensp;&middot;&ensp; Singer-Songwriter &ensp;&middot;&ensp; Creative Technologist
        </div>
        <p class="divider-desc">
          Colliding code, composition, text, and media ecology. Building experimental instruments, intermedia poetics, and hybrid systems.
        </p>
      </div>`;

  } else if (obj.kind === "divider") {
    const sec = obj.sec || {};
    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      <div class="divider-body">
        <div class="divider-label"><em>${sec.label || ""}</em></div>
        <p class="divider-desc">${sec.description || ""}</p>
      </div>`;

  } else if (obj.kind === "piece") {
    const piece = obj.piece || {};
    if (piece.id && !obj.id) div.id = "work-" + piece.id;
    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      <div class="piece-body">${renderPieceBody(piece, { heading: "h2" })}</div>`;

  } else if (obj.kind === "grid") {
    const sec = obj.sec || {};
    const headerText = sec.label || obj.label || "";
    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      ${renderGridBlock(obj, headerText, "")}`;

  } else if (obj.kind === "panels") {
    // Standalone panels slide — header from obj.label only (unchanged behavior)
    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      ${renderPanelsBlock(obj, obj.label || "", "")}`;

  } else if (obj.kind === "set") {
    const lead = obj.lead || obj.main || {};
    if (lead.id && !obj.id) div.id = "work-" + lead.id;
    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      ${renderSetBlock(obj, { depth: 0 })}`;
  }

  return div;
}

/* ============================================================
   DOM + NAV + OBSERVER
============================================================ */
let curIdx = 0;
let slideEls = [];

const mainArea  = document.getElementById("mainArea");
const slideNumEl = document.getElementById("slideNum");
const slideTotalEl = document.getElementById("slideTotal");
const prevBtn   = document.getElementById("prevBtn");
const nextBtn   = document.getElementById("nextBtn");
const secDotsEl = document.getElementById("secDots");
const secTabsEl = document.getElementById("secTabs");
const mobileSelEl = document.getElementById("mobileSel");

function buildDOM() {
  mainArea.innerHTML = "";
  slideEls = [];

  const observerOptions = {
    root: mainArea,
    rootMargin: "-45% 0px -45% 0px",
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        curIdx = parseInt(entry.target.dataset.idx);
        updateUI();
      }
    });
  }, observerOptions);

  slides.forEach((s, i) => {
    const el = makeSlideEl(s, i);
    mainArea.appendChild(el);
    slideEls.push(el);
    observer.observe(el);
  });
}

function goTo(idx) {
  if (idx < 0 || idx >= slides.length) return;
  slideEls[idx].scrollIntoView({ behavior: "smooth", block: "start" });
}

function curSecId() { return slides[curIdx]?.sec?.id; }

function updateUI() {
  slideNumEl.textContent = pad2(curIdx + 1);
  slideTotalEl.textContent = pad2(slides.length);
  prevBtn.disabled = curIdx === 0;
  nextBtn.disabled = curIdx === slides.length - 1;

  const sid = curSecId();
  document.querySelectorAll(".section-tab").forEach(b => b.classList.toggle("active", b.dataset.sec === sid));
  if (sid) mobileSelEl.value = sid;

  /* Section specific dots */
  secDotsEl.innerHTML = "";
  if (sid && secRange[sid]) {
    const [s, e] = secRange[sid];
    for (let i = s; i <= e; i++) {
      const d = document.createElement("button");
      d.className = "sdot" + (i === curIdx ? " active" : "");
      d.title = `Slide ${i - s + 1}`;
      d.onclick = () => goTo(i);
      secDotsEl.appendChild(d);
    }
  }
}

function buildNav() {
  document.getElementById("pName").textContent = PORTFOLIO.name || "Portfolio";

  const introBtn = document.createElement("button");
  introBtn.className = "section-tab";
  introBtn.textContent = "Intro";
  introBtn.dataset.sec = "intro";
  introBtn.onclick = () => goTo(0);
  secTabsEl.appendChild(introBtn);

  const introOpt = document.createElement("option");
  introOpt.value = "intro";
  introOpt.textContent = "Intro";
  mobileSelEl.appendChild(introOpt);

  if (PORTFOLIO && PORTFOLIO.sections) {
    PORTFOLIO.sections.forEach(sec => {
      const btn = document.createElement("button");
      btn.className = "section-tab";
      btn.textContent = sec.label;
      btn.dataset.sec = sec.id;
      btn.onclick = () => goTo(secRange[sec.id][0]);
      secTabsEl.appendChild(btn);

      const opt = document.createElement("option");
      opt.value = sec.id;
      opt.textContent = sec.label;
      mobileSelEl.appendChild(opt);
    });
  }
  mobileSelEl.onchange = () => goTo(secRange[mobileSelEl.value][0]);
}

prevBtn.onclick = () => goTo(curIdx - 1);
nextBtn.onclick = () => goTo(curIdx + 1);

document.addEventListener("keydown", e => {
  if (["INPUT","SELECT","TEXTAREA"].includes(e.target.tagName)) return;
  if (e.key === "ArrowRight" || e.key === "ArrowDown")  { e.preventDefault(); goTo(curIdx + 1); }
  if (e.key === "ArrowLeft"  || e.key === "ArrowUp")    { e.preventDefault(); goTo(curIdx - 1); }
});

/* ============================================================
   LIGHTBOX
============================================================ */
const lb    = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");

function openLb(src, alt) { lbImg.src = src; lbImg.alt = alt || ""; lb.classList.add("open"); }

document.getElementById("lbClose").onclick = () => lb.classList.remove("open");
lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("open"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("open"); });

/* ============================================================
   INIT
============================================================ */
buildSlides();
buildDOM();
buildNav();
goTo(0);