(() => {
  const storageKey = "xyh.shortlit.visited.v1";

  const slugFromUrl = (value) => {
    const pathname = new URL(value, window.location.href).pathname;
    return decodeURIComponent(pathname.split("/").pop() || "").toLowerCase();
  };

  const readVisited = () => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(stored) ? stored.filter((item) => typeof item === "string") : []);
    } catch {
      return new Set();
    }
  };

  const writeVisited = (visited) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...visited]));
    } catch {
      // The trace remains session-only when browser storage is unavailable.
    }
  };

  const remember = (slug) => {
    if (!slug || slug === "index.html") return;
    const visited = readVisited();
    visited.add(slug);
    writeVisited(visited);
  };

  if (document.body.classList.contains("reading")) {
    remember(slugFromUrl(window.location.href));
  }

  const cards = [...document.querySelectorAll(".poem-card")];

  const applyVisitedState = () => {
    const visited = readVisited();
    cards.forEach((card) => {
      const wasVisited = visited.has(slugFromUrl(card.href));
      card.classList.toggle("is-visited", wasVisited);
      card.dataset.visited = wasVisited ? "true" : "false";
    });
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      remember(slugFromUrl(card.href));
      applyVisitedState();
    });
  });

  window.addEventListener("pageshow", applyVisitedState);
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) applyVisitedState();
  });

  applyVisitedState();
})();
