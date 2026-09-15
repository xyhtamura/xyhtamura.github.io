// Keeps a lineated poem's line breaks where the poet put them.
// poetry.css sets lineated poems (pre.poem-text, and the line blocks of 口) to
// not wrap, so a line never breaks early.
// When the longest line is wider than the column, this scales the poem's font
// size down until it fits — the poem behaves like an image, and the reader can
// pinch-zoom to enlarge it without reflowing the lines.
// Prose (body.prose-poem) is left to wrap normally.
(() => {
  if (document.body.classList.contains("prose-poem")) return;
  const poems = [...document.querySelectorAll("pre.poem-text, .mouth-poem")];
  if (!poems.length) return;

  // Guards against sub-pixel rounding leaving a 1 px overflow.
  const SAFETY = 0.995;

  // A <pre> reports its longest line as scrollWidth. 口 is built from one
  // block per line, and its translation tooltips overflow to the right, so
  // there the widest line box is measured instead.
  const lineWidth = (poem) => {
    if (poem.matches("pre")) return poem.scrollWidth;
    const left = poem.getBoundingClientRect().left;
    const lines = [...poem.children].filter((line) => line.matches("span, button"));
    return Math.ceil(Math.max(0, ...lines.map((line) => line.getBoundingClientRect().right - left)));
  };

  const fit = (poem) => {
    poem.style.fontSize = "";
    const available = poem.clientWidth;
    let natural = lineWidth(poem);
    if (!available || natural <= available) {
      poem.classList.remove("is-scaled");
      return;
    }
    let size = parseFloat(getComputedStyle(poem).fontSize);
    // Text width is close to linear in font size; a second pass absorbs the
    // difference font hinting makes at small sizes.
    for (let pass = 0; pass < 3 && natural > available; pass += 1) {
      size *= (available / natural) * SAFETY;
      poem.style.fontSize = `${size}px`;
      natural = lineWidth(poem);
    }
    poem.classList.add("is-scaled");
  };

  const fitAll = () => poems.forEach(fit);

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fitAll);
  };

  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener("load", fitAll);

  if ("ResizeObserver" in window) {
    // Observe the column, not the poem, so changing the poem's font size
    // does not trigger another fit.
    const observer = new ResizeObserver(schedule);
    poems.forEach((poem) => observer.observe(poem.parentElement));
  } else {
    window.addEventListener("resize", schedule);
  }
})();
