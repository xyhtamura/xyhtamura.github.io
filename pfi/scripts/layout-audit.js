/* Layout audit for /pfi/.
 *
 * Paste into the browser console with the portfolio open, or run it through a
 * devtools-protocol evaluate. It answers the two questions this layout is built
 * around and cannot be checked by eye:
 *
 *   1. Is any picture cropped or squashed? Every filled slot is supposed to take
 *      its picture's own aspect ratio, so a rendered box that disagrees with the
 *      image's natural ratio by more than 3% is a fault, whatever it looks like.
 *   2. Is the slide used? `slideOverflow` must be 0 in landscape — one slide is
 *      one screen there — and `img%` is the share of the slide the pictures
 *      actually cover, which is the number that moves when a row breaks badly.
 *
 * It forces every image to load first, so the numbers cover all 20 slides rather
 * than the two or three that happen to be in view.
 *
 * Note when running it against a headless or hidden pane: the slide counter and
 * title are driven by an IntersectionObserver, and neither that nor
 * requestAnimationFrame is delivered while the frame loop is paused. Geometry is
 * still correct and still measurable; the counter is not, and reads stale.
 */
async function auditLayout({ tolerance = 0.03 } = {}) {
  const images = [...document.querySelectorAll("#slides img")];
  images.forEach((image) => { image.loading = "eager"; });
  await Promise.all(images.map((image) => (
    image.complete ? null : new Promise((done) => { image.onload = image.onerror = done; })
  )));

  const frame = document.querySelector("#slides");
  const frameHeight = frame.clientHeight;
  const rows = [];
  const faults = [];
  let pictureArea = 0;
  let slideArea = 0;
  let overflow = 0;

  document.querySelectorAll(".page").forEach((page) => {
    const pageBox = page.getBoundingClientRect();
    let cropped = 0;
    let area = 0;

    page.querySelectorAll("img").forEach((image) => {
      const box = image.getBoundingClientRect();
      if (!box.width || !image.naturalWidth) return;
      const drawn = box.width / box.height;
      const natural = image.naturalWidth / image.naturalHeight;
      if (Math.abs(drawn - natural) / natural > tolerance) {
        cropped += 1;
        faults.push({
          slide: Number(page.dataset.index) + 1,
          slot: image.closest(".slot")?.dataset.slot,
          drawn: Number(drawn.toFixed(3)),
          natural: Number(natural.toFixed(3))
        });
      }
      area += box.width * box.height;
    });

    const spill = Math.max(0, Math.round(pageBox.height - frameHeight));
    pictureArea += area;
    slideArea += pageBox.width * frameHeight;
    overflow += spill;

    rows.push({
      slide: Number(page.dataset.index) + 1,
      cropped,
      overflow: spill,
      picturePercent: Math.round((area / (pageBox.width * frameHeight)) * 100)
    });
  });

  const root = document.documentElement;
  const summary = {
    viewport: `${innerWidth}x${innerHeight}`,
    landscapeLayout: matchMedia("(min-width: 801px) and (orientation: landscape)").matches,
    images: images.length,
    cropped: faults.length,
    slideOverflow: overflow,
    picturePercent: Math.round((pictureArea / slideArea) * 100),
    horizontalOverflow: root.scrollWidth - root.clientWidth
  };

  console.table(rows);
  if (faults.length) console.table(faults);
  console.log(summary);
  return { summary, rows, faults };
}

auditLayout();
