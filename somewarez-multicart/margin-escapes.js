// Small fragments leave visible edge illustrations and follow the outside margin.
const marginEscapes = (() => {
  const layer = document.createElement('div');
  layer.className = 'margin-escapes';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  document.body.append(layer);
  let timer;
  let active = false;
  const animations = new Set();
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const between = (min, max) => min + Math.random() * (max - min);
  const drawings = {
    hours: '<svg viewBox="0 0 32 32"><g class="escape-wings" fill="#ecba65" stroke="#17363b" stroke-width="1.5"><path d="M16 15C3 1 1 13 14 21Z"/><path d="M16 15C29 1 31 13 18 21Z"/></g><path d="M16 12v12m0-12-3-4m3 4 3-4" fill="none" stroke="#17363b" stroke-width="2" stroke-linecap="round"/></svg>',
    sulat: '<svg viewBox="0 0 32 32"><path d="m4 15 6-8 6 8 6-8 6 8M4 23q4-5 8 0t8 0 8 0" fill="none" stroke="#17363b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cornice: '<svg viewBox="0 0 32 32"><path d="M16 6v20M6 16h20M9 9l14 14M23 9 9 23" stroke="#e8e0c1" stroke-width="2.5"/><circle cx="16" cy="16" r="4" fill="#ed7963" stroke="#17363b" stroke-width="1.5"/></svg>'
  };
  function spawn() {
    if (!active) return;
    const page = document.querySelector('main').getBoundingClientRect();
    const sources = [...document.querySelectorAll('.hours .art, .sulat .art, .cornice .art')]
      .map(el => ({el, rect: el.getBoundingClientRect()}))
      .filter(({rect}) => rect.top < innerHeight - 40 && rect.bottom > 40);
    if (sources.length && !layer.childElementCount) {
      const {el, rect} = sources[Math.floor(Math.random() * sources.length)];
      const side = rect.left + rect.width / 2 < innerWidth / 2 ? -1 : 1;
      const gutter = side < 0 ? Math.max(0, page.left) : Math.max(0, innerWidth - page.right);
      // Smaller fragments fit the narrow margins of the mobile layout.
      const size = clamp(gutter - 4, 8, 28);
      const edge = side < 0 ? gutter / 2 : innerWidth - gutter / 2;
      const y = clamp(between(rect.top + 24, rect.bottom - 24), size, innerHeight - size);
      const x = side < 0 ? rect.left + size : rect.right - size;
      const kind = el.closest('.game').classList.contains('hours') ? 'hours'
        : el.closest('.game').classList.contains('sulat') ? 'sulat' : 'cornice';
      const fragment = document.createElement('span');
      fragment.className = 'margin-escape';
      fragment.style.width = fragment.style.height = size + 'px';
      fragment.innerHTML = drawings[kind];
      layer.append(fragment);
      const travel = between(65, 150) * (Math.random() < .5 ? -1 : 1);
      const drift = Math.max(0, (gutter - size * Math.SQRT2) / 2 - 2);
      const pose = (px, py, angle) => 'translate(' + (px - size / 2) + 'px,' + (py - size / 2) + 'px) rotate(' + angle + 'deg)';
      const animation = fragment.animate([
        {transform: pose(x, y, 0), opacity: 0, offset: 0},
        {transform: pose(x + side * 8, y, side * 8), opacity: .9, offset: .1},
        {transform: pose(edge, y, side * 15), opacity: .9, offset: .28},
        {transform: pose(edge - side * drift, clamp(y + travel * .4, size, innerHeight - size), -side * 12), opacity: .9, offset: .52},
        {transform: pose(edge, clamp(y + travel, size, innerHeight - size), side * 20), opacity: .8, offset: .86},
        {transform: pose(edge, clamp(y + travel + 12, size, innerHeight - size), side * 8), opacity: 0, offset: 1}
      ].map(frame => ({...frame, easing: 'ease-in-out'})), {duration: between(9000, 12000), fill: 'forwards'});
      animations.add(animation);
      animation.finished.then(() => { animations.delete(animation); fragment.remove(); }, () => {});
    }
    timer = setTimeout(spawn, between(14000, 19000));
  }
  return {
    start() { if (active) return; active = true; spawn(); },
    stop() { active = false; clearTimeout(timer); animations.forEach(animation => animation.cancel()); animations.clear(); layer.replaceChildren(); }
  };
})();
