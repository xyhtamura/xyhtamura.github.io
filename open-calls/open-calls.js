(function () {
  "use strict";

  const cards = Array.from(document.querySelectorAll(".call-card"));
  const filters = Array.from(document.querySelectorAll("[data-filter]"));
  const search = document.querySelector("[data-search]");
  const resultCount = document.querySelector("[data-result-count]");
  const emptyState = document.querySelector("[data-empty]");
  let activeFilter = "all";

  function normalized(value) {
    return value.toLocaleLowerCase().trim();
  }

  function applyFilters() {
    const query = normalized(search.value);
    let visible = 0;

    cards.forEach(function (card) {
      const tags = card.dataset.tags.split(" ");
      const searchableText = normalized(card.dataset.title + " " + card.textContent);
      const matchesFilter = activeFilter === "all" || tags.includes(activeFilter);
      const matchesSearch = !query || searchableText.includes(query);
      card.hidden = !(matchesFilter && matchesSearch);
      if (!card.hidden) visible += 1;
    });

    resultCount.textContent = "Showing " + visible + (visible === 1 ? " opportunity" : " opportunities");
    emptyState.hidden = visible !== 0;
  }

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filter;
      filters.forEach(function (item) {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      applyFilters();
    });
  });

  search.addEventListener("input", applyFilters);

  function dayDifference(target) {
    return Math.ceil((target.getTime() - Date.now()) / 86400000);
  }

  document.querySelectorAll("[data-date]").forEach(function (label) {
    if (label.classList.contains("warning")) return;
    const days = dayDifference(new Date(label.dataset.date));
    if (days < 0) {
      label.textContent = "Closed";
    } else if (days === 0) {
      label.textContent = "Due today";
    } else {
      label.textContent = days + (days === 1 ? " day left" : " days left");
    }
  });

  const nextCountdown = document.querySelector("[data-next-countdown]");
  if (nextCountdown) {
    const days = Math.max(0, dayDifference(new Date("2026-07-26T23:59:00+08:00")));
    nextCountdown.textContent = String(days).padStart(2, "0") + (days === 1 ? " day" : " days");
  }
}());
