const dialog = document.querySelector('#about');
const copy = document.querySelector('#about-copy');
const title = document.querySelector('#about-title');
let opener;
const content = fetch('./content.json').then(r => { if (!r.ok) throw new Error('Content unavailable'); return r.json(); });
// Handle failure immediately, even if nobody opens a panel.
content.catch(() => {});
document.querySelectorAll('[data-about]').forEach(button => button.addEventListener('click', async () => {
  opener = button;
  title.textContent = button.dataset.about === 'artist' ? 'About the artist' : button.closest('.slot').querySelector('h2').textContent;
  copy.replaceChildren();
  const status = document.createElement('p');
  status.textContent = 'Loading…';
  copy.append(status);
  dialog.showModal();
  activity();
  try {
    const entry = (await content)[button.dataset.about];
    if (opener !== button || !dialog.open) return;
    copy.replaceChildren();
    title.textContent = entry.title;
    const paragraphs = entry.paragraphs.length ? entry.paragraphs : ['Text to come.'];
    paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; copy.append(p); });
  } catch { status.textContent = 'The text could not be loaded. Close this panel and reload the page to try again.'; }
}));
dialog.addEventListener('close', () => { opener?.focus(); activity(); });
dialog.addEventListener('click', e => { if (e.target !== dialog) return; const r = dialog.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); });
let paused = false;
let idleTimer;
const motion = document.querySelector('#motion');
function activity() {
  document.body.classList.remove('idle');
  clearTimeout(idleTimer);
  if (!paused && !document.hidden && !dialog.open) idleTimer = setTimeout(() => document.body.classList.add('idle'), 6000);
}
['pointermove', 'pointerdown', 'keydown', 'scroll'].forEach(name => window.addEventListener(name, activity, {passive: true}));
document.addEventListener('visibilitychange', activity);
motion.addEventListener('click', () => { paused = !paused; motion.setAttribute('aria-pressed', String(paused)); motion.textContent = paused ? 'Resume motion' : 'Pause motion'; activity(); });
activity();
