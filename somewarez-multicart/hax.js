// Sixth panel: the extras in games.json, each drawn from its parents' illustrations.
// Uses art() from prototypes/designs.js.
(async () => {
  const panel = document.querySelector('#hax-list');
  const kinds = {'cornice':'cornice','ombak-lock':'ombak','foam-green-city':'foam','drawing-the-hours':'hours','sulat':'sulat'};
  try {
    const response = await fetch('./games.json');
    if (!response.ok) throw new Error('Registry unavailable');
    const {games, extras} = await response.json();
    const titles = Object.fromEntries(games.map(game => [game.id, game.title]));
    panel.innerHTML = extras.map((extra, i) => {
      const names = extra.parents.map(id => titles[id]);
      const from = extra.kind === 'reskin' ? `${names[0]}, reskinned` : names.join(' × ');
      const layers = extra.parents.map(id => art(kinds[id])).join('');
      return `<a class="hack ${extra.kind}" href="${extra.entry}" target="_blank" rel="noopener noreferrer"><div class="hax-art">${layers}<span class="number">H${i + 1}</span></div><div class="hax-caption"><h3>${extra.title}</h3><p class="hax-from">${from}</p><p>${extra.summary}</p><span class="launch" aria-hidden="true">↗</span></div></a>`;
    }).join('');
  } catch {
    panel.textContent = 'The hacks could not be loaded. Reload the page to try again.';
  }
})();
