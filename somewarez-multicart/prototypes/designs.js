const games = [
  ['Cornice','cornice','Glyph terrarium','WASD + pointer','https://xyhtamura.github.io/cornice/'],
  ['Ombak Lock','ombak','Tune by ear','Pointer + keyboard','https://xyhtamura.github.io/ombak-lock/'],
  ['Foam Green City','foam','Domestic walkthrough','Automatic / WASD','https://xyhtamura.github.io/foam-green-city/'],
  ['Drawing the Hours','hours','Draw among insects','Pointer + touch','https://xyhtamura.github.io/drawing-the-hours/'],
  ['Sulat','sulat','Type a landscape','Keyboard + touch','https://xyhtamura.github.io/insulae-incognitae/sulat/']
];
function art(kind) {
 const start = '<svg viewBox="0 0 300 220" aria-hidden="true" focusable="false">';
 const end = '</svg>';
 const drawings = {
 cornice:`<path fill="#162d34" d="M0 0h300v220H0z"/><circle cx="240" cy="42" r="22" fill="#e7bd60"/><g fill="#43756c"><path d="M0 80h30v-25h30v55h35V45h30v60h30V70h35v50h30V80h30v50h50v90H0z"/></g><path d="M0 160h300M18 160v60m44-60v60m44-60v60m44-60v60m44-60v60m44-60v60m44-60v60" stroke="#a4c7a5" stroke-width="5"/><g fill="#ed7963" font-family="monospace" font-size="47"><text x="27" y="153">✳</text><text x="130" y="137">♧</text><text x="205" y="157">✣</text></g><g fill="#e8e0c1" font-family="monospace" font-size="20"><text x="26" y="200">: . * ~ : .</text><text x="76" y="58">··  ░  ··</text></g>`,
 ombak:`<path fill="#ecba65" d="M0 0h300v220H0z"/><g fill="none" stroke="#17363b" stroke-width="3"><ellipse cx="100" cy="107" rx="65" ry="79"/><ellipse cx="150" cy="107" rx="65" ry="79"/><ellipse cx="200" cy="107" rx="65" ry="79"/><circle cx="150" cy="107" r="36" fill="#ed7963"/><path d="M150 107l17-24M24 192h252"/></g><g fill="#17363b"><circle cx="55" cy="192" r="8"/><circle cx="150" cy="192" r="8"/><circle cx="245" cy="192" r="8"/></g>`,
 foam:`<path fill="#a4c7a5" d="M0 0h300v220H0z"/><path d="M0 0l90 55v110L0 220m300-220-90 55v110l90 55" fill="#6b9d8d" stroke="#17363b" stroke-width="2"/><path d="M90 55h120v110H90z" fill="#d6d6b0" stroke="#17363b" stroke-width="3"/><path d="M130 76h44v89h-44z" fill="#17363b"/><path d="M142 91h21v74h-21z" fill="#edba65"/><path d="M0 220l130-55m170 55-126-55M0 190h300" stroke="#17363b" fill="none"/><path d="M30 70h32v35H30z" fill="#ecba65" stroke="#17363b" stroke-width="3"/><path d="M228 135h48v22h-48zm5 22v30m36-30v30" fill="#ed7963" stroke="#17363b" stroke-width="4"/>`,
 hours:`<path fill="#e8e0c1" d="M0 0h300v220H0z"/><g stroke="#a4c7a5" fill="none" stroke-width="2"><path d="M20 220q-12-48 3-69m-3 34-13-16m13 21 12-15M269 220q19-64 6-87m0 53-16-14m17 0 12-19"/></g><path d="M25 179C5 8 156 20 158 111S285 215 276 92 110 66 70 160" fill="none" stroke="#ed7963" stroke-width="5"/><g fill="#edba65" stroke="#17363b" stroke-width="2"><ellipse cx="83" cy="82" rx="15" ry="9" transform="rotate(-30 83 82)"/><ellipse cx="103" cy="82" rx="15" ry="9" transform="rotate(30 103 82)"/><ellipse cx="213" cy="131" rx="15" ry="9"/><ellipse cx="237" cy="131" rx="15" ry="9"/></g><path d="M93 75v25m132 25v25" stroke="#17363b" stroke-width="3"/><g fill="#6b9d8d"><circle cx="175" cy="41" r="4"/><circle cx="48" cy="145" r="4"/><circle cx="252" cy="52" r="4"/></g>`,
 sulat:`<path fill="#17363b" d="M0 0h300v220H0z"/><g font-family="monospace" font-size="27" letter-spacing="6"><text x="18" y="46" fill="#ecba65">山 山 · 山</text><text x="26" y="84" fill="#a4c7a5">木 ♧ 木 ♧ 木</text><text x="18" y="122" fill="#a4c7a5">♧ 木 · 木 ♧</text><text x="38" y="159" fill="#87c6d1">≈ ≈ ≈ ≈ ≈</text><text x="20" y="196" fill="#ed7963">· · deer · ·</text></g>`
 };
 return start + drawings[kind] + end;
}
const mode = document.body.dataset.design;
document.querySelector('#games').innerHTML = games.map(([title,id,desc,input,url],i)=> {
 const link = `<a class="game ${id}" href="${url}" target="_blank" rel="noopener noreferrer"><div class="art">${art(id)}<span class="number">0${i+1}</span></div><div class="caption"><h2>${title}</h2><p>${desc}</p><span class="input">${input}</span><span class="launch" aria-hidden="true">↗</span></div></a>`;
 const registryId = ['cornice','ombak-lock','foam-green-city','drawing-the-hours','sulat'][i];
 return document.body.dataset.live ? `<section class="slot">${link}<button class="statement" data-about="${registryId}" aria-label="About ${title}">About this work</button></section>` : link;
}).join('');
if(mode==='label') document.querySelector('#collage').innerHTML = `<div class="city-fragment">${art('foam')}</div><div class="glyph-fragment">${art('cornice')}</div><div class="wave-fragment">${art('ombak')}</div><div class="terrain-fragment">${art('sulat')}</div><div class="cord-fragment">${art('hours')}</div><span class="sticker">FIVE<br>WORLDS</span>`;
