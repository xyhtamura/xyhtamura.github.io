/* ============================================================
   RENDER
============================================================ */
const pad2 = n => String(n).padStart(2, "0");

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
  if (m.type === "video") {
    return `<div class="media-item media-item--wide"><video src="${m.src || ""}" controls preload="none"></video></div>`;
  }
  if (m.type === "youtube") {
    return `<div class="media-item media-item--wide"><iframe src="https://www.youtube.com/embed/${m.id || ""}" allowfullscreen></iframe></div>`;
  }
  return "";
}

function renderTags(tags) {
  return (tags || []).map(t => `<span class="tag">${t}</span>`).join("");
}

function makeSlideEl(obj, gi) {
  const num = pad2(gi + 1);
  const div = document.createElement("div");
  div.className = "slide";
  div.dataset.idx = gi;

  if (obj.kind === "title") {
    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      <div class="divider-body">
        <h1 class="divider-label"><em>${PORTFOLIO.name || "Portfolio"}</em></h1>
        <div class="piece-meta" style="margin-top: 0.2rem; margin-bottom: 1.5rem; font-size: .82rem; letter-spacing: .2em;">
          Interdisciplinary Artist &ensp;&middot;&ensp; Researcher
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
    const mediaHTML = (piece.media || []).map(renderMediaItem).join("");
    
    let collabHTML = "";
    if (piece.collaborators) {
      collabHTML = `<span class="tag tag-collab" style="border-color: var(--mg); color: var(--mg);">With ${piece.collaborators}</span>`;
    }

    let exhibitionsHTML = "";
    if (piece.exhibitions && piece.exhibitions.length > 0) {
      exhibitionsHTML = `
        <div class="piece-exhibitions-list" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
          ${piece.exhibitions.map(ex => `
            <div class="piece-venue-stamp" style="display: flex; align-items: center; gap: 0.5rem; font-family: 'Averia Sans Libre', sans-serif; font-size: 0.75rem; letter-spacing: 0.05em; color: var(--text-dim);">
              <span>Presented at <strong>${ex.venue || ""}</strong> for <em>${ex.event || ""}</em> (${ex.year || ""})</span>
            </div>
          `).join("")}
        </div>
      `;
    }
    
    let linksHTML = "";
    if (piece.links && piece.links.length > 0) {
      linksHTML = `
        <div class="piece-links-section" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px;">
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem;">
            ${piece.links.map(lnk => `
              <li style="font-size: 0.85rem; line-height: 1.4;">
                <span style="color: var(--text); font-weight: bold;">${lnk.label || "Link"}:</span> 
                <a href="${lnk.url || "#"}" target="_blank" class="explicit-url" style="color: var(--ch); text-decoration: none; word-break: break-all; font-family: monospace; margin-left: 0.25rem;">${lnk.url || ""} ↗</a>
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }

    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      <div class="piece-body">
        <h2 class="piece-title">${piece.title || ""}</h2>
        <div class="piece-meta" style="margin-bottom: 0.4rem;">${piece.year || ""}</div>
        
        <div class="piece-tags" style="margin-bottom: 1.1rem;">${renderTags(piece.tags)}${collabHTML}</div>
        
        <div class="media-strip">${mediaHTML}</div>
        <p class="piece-blurb">${piece.blurb || ""}</p>
        
        ${exhibitionsHTML} 
        ${linksHTML}
      </div>`;

  } else if (obj.kind === "grid") {
    const sec = obj.sec || {};
    const pieces = obj.pieces || [];
    
    const cardsHTML = pieces.map(p => {
      const title = p.title || "";
      const letter = title.replace(/^(A|An|The)\s+/i, "").charAt(0) || "?";
      const thumb  = p.thumbnail
        ? `<img src="${p.thumbnail}" alt="${title}">`
        : `<div class="acad-ph"><span class="big-ltr">${letter}</span></div>`;

      let collabHTML = "";
      if (p.collaborators) {
        collabHTML = `<span class="tag tag-collab" style="border-color: var(--mg); color: var(--mg); margin-top: 0.15rem;">With ${p.collaborators}</span>`;
      }

      let exhibitionsHTML = "";
      if (p.exhibitions && p.exhibitions.length > 0) {
        exhibitionsHTML = `
          <div class="acad-exhibitions" style="margin-top: 0.8rem; display: flex; flex-direction: column; gap: 0.3rem;">
            ${p.exhibitions.map(ex => `
              <div style="font-family: 'Averia Sans Libre', sans-serif; font-size: 0.7rem; color: var(--text-dim); line-height: 1.3;">
                <span>Presented at <strong>${ex.venue || ""}</strong> for <em>${ex.event || ""}</em> (${ex.year || ""})</span>
              </div>
            `).join("")}
          </div>
        `;
      }

      let linksHTML = "";
      if (p.links && p.links.length > 0) {
        linksHTML = `
          <div class="acad-links" style="margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid var(--border);">
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem;">
              ${p.links.map(lnk => `
                <li style="font-size: 0.75rem; line-height: 1.4;">
                  <span style="color: var(--text); font-weight: bold;">${lnk.label || "Link"}:</span> 
                  <a href="${lnk.url || "#"}" target="_blank" class="explicit-url" style="color: var(--ch); text-decoration: none; word-break: break-all; font-family: monospace; margin-left: 0.2rem;">${lnk.url || ""} ↗</a>
                </li>
              `).join("")}
            </ul>
          </div>
        `;
      }

      return `<article class="acad-card">
        <div class="acad-thumb">${thumb}</div>
        <div class="acad-body">
          <div class="acad-title">${title}</div>
          <div class="acad-year">${p.year || ""}</div>
          <p class="acad-blurb">${p.blurb || ""}</p>
          <div class="acad-tags">${renderTags(p.tags)}${collabHTML}</div>
          ${exhibitionsHTML}
          ${linksHTML}
        </div>
      </article>`;
    }).join("");

    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      <div class="grid-header">${sec.label || ""}</div>
      <div class="academic-grid">${cardsHTML}</div>`;
  } else if (obj.kind === "set") {
    const main = obj.main || {};
    const pieces = obj.pieces || [];

    // --- 1. BUILD THE MAIN COMPONENT (TOP HALF) ---
    const mediaHTML = (main.media || []).map(renderMediaItem).join("");
    let mainCollabHTML = main.collaborators ? `<span class="tag tag-collab" style="border-color: var(--mg); color: var(--mg);">With ${main.collaborators}</span>` : "";

    const mainHTML = `
      <div class="set-main-body" style="padding-bottom: 2rem; border-bottom: 1px dashed var(--border-hi); margin-bottom: 2rem;">
        <h2 class="piece-title">${main.title || ""}</h2>
        <div class="piece-meta" style="margin-bottom: 0.4rem;">${main.year || ""}</div>
        <div class="piece-tags" style="margin-bottom: 1.1rem;">${renderTags(main.tags)}${mainCollabHTML}</div>
        <div class="media-strip">${mediaHTML}</div>
        <p class="piece-blurb">${main.blurb || ""}</p>
      </div>`;

    // --- 2. BUILD THE GRID COMPONENT (BOTTOM HALF) ---
    const cardsHTML = pieces.map(p => {
      const title = p.title || "";
      const letter = title.replace(/^(A|An|The)\s+/i, "").charAt(0) || "?";
      const thumb  = p.thumbnail
        ? `<img src="${p.thumbnail}" alt="${title}">`
        : `<div class="acad-ph"><span class="big-ltr">${letter}</span></div>`;

      let collabHTML = p.collaborators ? `<span class="tag tag-collab" style="border-color: var(--mg); color: var(--mg); margin-top: 0.15rem;">With ${p.collaborators}</span>` : "";
      
      let linksHTML = "";
      if (p.links && p.links.length > 0) {
        linksHTML = `
          <div class="acad-links" style="margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid var(--border);">
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem;">
              ${p.links.map(lnk => `
                <li style="font-size: 0.75rem; line-height: 1.4;">
                  <span style="color: var(--text); font-weight: bold;">${lnk.label || "Link"}:</span> 
                  <a href="${lnk.url || "#"}" target="_blank" class="explicit-url" style="color: var(--ch); text-decoration: none; word-break: break-all; font-family: monospace; margin-left: 0.2rem;">${lnk.url || ""} ↗</a>
                </li>
              `).join("")}
            </ul>
          </div>`;
      }

      return `<article class="acad-card">
        <div class="acad-thumb">${thumb}</div>
        <div class="acad-body">
          <div class="acad-title">${title}</div>
          <div class="acad-year">${p.year || ""}</div>
          <p class="acad-blurb">${p.blurb || ""}</p>
          <div class="acad-tags">${renderTags(p.tags)}${collabHTML}</div>
          ${linksHTML}
        </div>
      </article>`;
    }).join("");

    const gridHTML = `<div class="academic-grid">${cardsHTML}</div>`;

    // --- 3. STITCH THEM TOGETHER ---
    div.innerHTML = `
      <div class="ghost-num" aria-hidden="true">${num}</div>
      <div class="set-container" style="display: flex; flex-direction: column; width: 100%;">
        ${mainHTML}
        <div class="grid-header" style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 1.2rem;">Suite Tools & Environments</div>
        ${gridHTML}
      </div>`;
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