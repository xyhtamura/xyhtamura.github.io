// Sixth panel: the extras in games.json, with original illustrations per hack.
(async () => {
  const panel = document.querySelector('#hax-list');
  try {
    const response = await fetch('./games.json');
    if (!response.ok) throw new Error('Registry unavailable');
    const {games, extras} = await response.json();
    const titles = Object.fromEntries(games.map(game => [game.id, game.title]));
    panel.innerHTML = extras.map((extra, i) => {
      const names = extra.parents.map(id => titles[id]);
      const from = extra.kind === 'reskin' ? `${names[0]}, reskinned` : names.join(' × ');
      return `<a class="hack ${extra.kind}" href="${extra.entry}" target="_blank" rel="noopener noreferrer"><div class="hax-art"><img src="./assets/hax/${extra.id === 'crawl' ? 'foam-green-crawl' : extra.id}.svg" alt=""><span class="number">H${i + 1}</span></div><div class="hax-caption"><h3>${extra.title}</h3><p class="hax-from">${from}</p><p>${extra.summary}</p><span class="launch" aria-hidden="true">↗</span></div></a>`;
    }).join('');
  } catch {
    panel.textContent = 'The hacks could not be loaded. Reload the page to try again.';
  }
})();
