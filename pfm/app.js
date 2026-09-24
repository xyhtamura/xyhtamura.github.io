/* Work-link registry for the SAM Residencies Cycle 4 cut route.

   The slide behaviour and the landscape layout engine are shared: index.html
   loads this file first, then ../pfi/engine.js, which reads the two globals set
   below. Keys are matched to slide headings case-insensitively.

   SAM asks for a link beside every project, so a key here is not optional
   decoration — a page whose heading matches nothing prints without its URLs.
   slides.html is generated from plan.json by ../scripts/lift-slides.mjs. */
window.portfolioLinks = {
  "Istorya sang Bȧlatyagon": [
    ["Critical essay & installation", "https://xyhtamura.github.io/istorya-sang-balatyagon/"],
    ["Atipan+", "https://www.usacfi.net/atipan-tdp4.html"]
  ],
  "Tanim-Kalye": [
    ["Open project", "https://xyhtamura.github.io/tanim-kalye/"],
    ["Quezon City Biennial", "https://www.quezoncitybiennial.com/"]
  ],
  "Eosforos": [
    ["Bandcamp", "https://xyhtochrome.bandcamp.com/album/eosforos"],
    ["The Wrong Eclipse", "https://thewrong.org"],
    ["Hadean Flare", "https://xyhtamura.github.io/hadeanflare/"],
    ["Roil", "https://xyhtamura.github.io/roil/"],
    ["Antemelos", "https://xyhtamura.github.io/antemelos/"],
    ["Kaos Magick", "https://www.facebook.com/artologist/posts/1257909719683580/"]
  ],
  "Ombak Lock": [["Play", "https://xyhtamura.github.io/ombak-lock/"]],
  "Cytophones": [["Open collection", "https://xyhtamura.github.io/cytophone/"]],
  "Experimental Pop and Performance": [
    ["Spotify", "https://open.spotify.com/artist/6sC8YWzht783z5DhjB1j0N"],
    ["Bandcamp", "https://xyhtamura.bandcamp.com"],
    ["Pacing To", "https://masmxyh.bandcamp.com/album/pacing-to"],
    ["Piyesta Plaza", "https://cyberpaean.bandcamp.com/album/piyesta-plaza-1985-to-1995-airwaves"]
  ],
  "Playable works": [
    ["Cornice", "https://xyhtamura.github.io/cornice/"],
    ["Electropond", "https://xyhtamura.github.io/electropond/"],
    ["Drawing the Hours", "https://xyhtamura.github.io/drawing-the-hours/"]
  ],
  "Tabota · Cycla · Stanzuary · kíkik": [
    ["Tabota", "https://xyhtamura.github.io/tabota/"],
    ["Tabota Roll", "https://xyhtamura.github.io/tabota/roll/"],
    ["Cycla", "https://xyhtamura.github.io/tabota/cycla/builder/"],
    ["Stanzuary", "https://xyhtamura.github.io/stanzuary/"],
    ["kíkik", "https://xyhtamura.github.io/kikik/"],
    ["Binlod", "https://xyhtamura.github.io/binlod/"]
  ],
  "Tools, instruments, web art": [["The whole shelf", "https://xyhtamura.github.io"]]
};

window.portfolioSlides = "slides.html?v=1";
