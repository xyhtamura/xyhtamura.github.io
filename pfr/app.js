/* Work-link registry for the Responsive Environments cut route (private nickname: Sensoria).

   The slide behaviour and the landscape layout engine are shared: index.html
   loads this file first, then ../pfi/engine.js, which reads the two globals set
   below. Keys are matched to slide headings case-insensitively.
   slides.html is generated from plan.json by ../scripts/lift-slides.mjs. */
window.portfolioLinks = {
  "Cytophones": [["Open collection", "https://xyhtamura.github.io/cytophone/"]],
  "kíkik": [
    ["Listen to the piece", "https://xyhtamura.github.io/kikik.mp3"],
    ["Launch tool", "https://xyhtamura.github.io/kikik/"]
  ],
  "Gliese": [["Launch tool", "https://xyhtamura.github.io/gliese/"]],
  "Physa · Biomemristor as Instrument": [
    ["Launch Physa", "https://xyhtamura.github.io/physa/"],
    ["Read abstract", "https://www.researchgate.net/publication/414237766_Biomemristor_as_Instrument"]
  ],
  "The Unbounded Organ · Composition Without Audition": [
    ["Launch instrument", "https://xyhtamura.github.io/unbounded-organ/"],
    ["Read explainer", "https://xyhtamura.github.io/unbounded-organ/explainer.html"],
    ["Read paper", "https://www.researchgate.net/publication/414228002_Composition_Without_Audition"]
  ],
  "Deskarium": [["Launch tool", "https://xyhtamura.github.io/deskarium/"]],
  "Benzaiten": [["Launch tool", "https://xyhtamura.github.io/benzaiten/"]],
  "Tanim-Kalye": [
    ["Open project", "https://xyhtamura.github.io/tanim-kalye/"],
    ["Quezon City Biennial", "https://www.quezoncitybiennial.com/"]
  ],
  "Hindcasts": [["Open suite", "https://xyhtamura.github.io/hindcasts/"]],
  "Remanence": [["Launch tool", "https://xyhtamura.github.io/hindcasts/remanence/"]],
  "Metachamber": [["Launch tool", "https://xyhtamura.github.io/hindcasts/metachamber/"]],
  "Pythia": [["Launch tool", "https://xyhtamura.github.io/hindcasts/pythia/"]],
  "Prolepsis": [["Launch tool", "https://xyhtamura.github.io/hindcasts/prolepsis/"]],
  "Sounder": [["Launch tool", "https://xyhtamura.github.io/hindcasts/sounder/"]],
  "CyberScotoma": [["Launch tool", "https://xyhtamura.github.io/sgueltch/cyberscotoma/"]],
  "The Commitments of Physical Modeling": [
    ["Conference schedule", "https://timbreconference.org/timbre2026/schedule/"],
    ["Timbre 2026", "https://timbreconference.org/"],
    ["Conference video", "https://www.youtube.com/watch?v=un487fhnW2s"]
  ],
  "From Interiority to Interaction": [
    ["Read paper", "https://journals.ub.uni-koeln.de/index.php/phidi/article/view/11659"],
    ["Philosophy & Digitality", "https://journals.ub.uni-koeln.de/index.php/phidi"]
  ]
};

window.portfolioSlides = "slides.html?v=7";
