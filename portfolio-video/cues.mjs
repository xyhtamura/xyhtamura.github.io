export const works = {
  fashionHour: { label: "Fashion Hour Omnipresence", href: "https://xyhtamura.github.io/#fashion-hour-omnipresence" },
  weizenbaum: { label: "LLMs and the Patterns", href: "https://denkwerkstatt.berlin/ANNA-STRASSER/ORGANIZED-EVENTS/LLMs-in-Berlin/" },
  eosforos: { label: "Eosforos", href: "https://xyhtamura.github.io/#eosforos" },
  music: { label: "Music by Xyh Tamura", href: "https://xyhtamura.bandcamp.com/" },
  xyhnthesizer: { label: "xyhnthesizer", href: "https://xyhtamura.github.io/#xyhnthesizer" },
  catchment: { label: "Catchment", href: "https://xyhtamura.github.io/catchment/" },
  insulae: { label: "Insulae Incognitae", href: "https://xyhtamura.github.io/insulae-incognitae/" },
  pacingTo: { label: "Pacing To", href: "https://crookedtreerecords.bandcamp.com/album/pacing-to" },
  loveLetter: { label: "love-letter-for-you.txt", href: "https://xyhtamura.github.io/loveletterforyou/" },
  gliese: { label: "Gliese", href: "https://xyhtamura.github.io/gliese/" },
  kosmica: { label: "The Radial Poetics of Planets and Stars", href: "https://xyhtamura.github.io/blog/radial-poetics-planets-stars.html" },
  feelingTogether: { label: "Feeling Together", href: "https://xyhtamura.github.io/#feeling-together" },
  istorya: { label: "Istorya sang Bȧlatyagon", href: "https://xyhtamura.github.io/istorya-sang-balatyagon/" },
  tabota: { label: "TaboTa Roll", href: "https://xyhtamura.github.io/tabota/roll/" },
  aliquoto: { label: "Aliquoto", href: "https://xyhtamura.github.io/anexacta/aliquoto/" },
  tanimKalye: { label: "Tanim-Kalye", href: "https://xyhtamura.github.io/tanim-kalye/" },
  impossibility: { label: "The Impossibility of Form in the Mind", href: "https://xyhtamura.github.io/#the-impossibility-of-form-in-the-mind" },
  open4: { label: "Open4 at VIDEOAKTION #7", href: "https://www.attaqueerlevisible.com/videoaktion-7/" },
  drawingTheHours: { label: "Drawing the Hours", href: "https://xyhtamura.github.io/drawing-the-hours/" },
  magicStaff: { label: "The Magic Staff", href: "https://xyhtamura.github.io/the-magic-staff/" },
  kikik: { label: "kíkik", href: "https://xyhtamura.github.io/kikik/" },
  physicsThesis: { label: "Physics thesis", href: "https://xyhtamura.github.io/gliese/application%20of%20the%20lagrangian%20thesis.pdf" },
  plasticoid: { label: "Plasticoid", href: "https://xyhtamura.github.io/plasticoid/" },
  nightBus: { label: "Night Bus", href: "https://xyhtamura.github.io/of-another-shore/nightbus.html" },
  naughtyMaids: { label: "Naughty Maids", href: "https://xyhtamura.github.io/#naughty-maids" },
  manifest: { label: "Manifest", href: "https://vimeo.com/1019003508" },
  palibut: { label: "Palibut-Libot", href: "https://xyhtamura.github.io/#palibut-libot" },
  selecta: { label: "Selecta Carte d’Or", href: "https://www.youtube.com/watch?v=Ee93Wmt1GTk" },
  secondLife: { label: "Second Life", href: "https://xyhtamura.github.io/#second-life" },
  foamGreenCity: { label: "Foam Green City", href: "https://xyhtamura.github.io/foam-green-city/" },
  fashionPortrait: { label: "Fashion portrait", href: "https://www.instagram.com/p/DOtRiRSAdgQ/" },
  diceCult: { label: "The Dice Cult", href: "https://www.youtube.com/c/TheDiceCult" },
};

// Times are relative to the narration. Camera shots clear the destination.
const cuts = [
  [2.3, "fashionHour"],
  [3.43, "weizenbaum"],
  [4.35, "eosforos"],
  [5.45, "catchment"],
  [6.6, "insulae"],
  [8, "pacingTo"],
  [9.7, "loveLetter"],
  [11.4, "gliese"],
  [12.2, "kosmica"],
  [13.25, "feelingTogether"],
  [14.55, "istorya"],
  [16.15, "tabota"],
  [17.5, "aliquoto"],
  [18.45, "istorya"],
  [20.15, "tanimKalye"],
  [21.45, "open4"],
  [22.95, "drawingTheHours"],
  [24.1, "magicStaff"],
  [25.15, null],
  [27.35, "kikik"],
  [30.15, "physicsThesis"],
  [31.45, "plasticoid"],
  [33.8, null],
  [36.1, "nightBus"],
  [37.55, "naughtyMaids"],
  [38.75, "manifest"],
  [41.08, "palibut"],
  [42.33, "magicStaff"],
  [42.9, "selecta"],
  [43.65, "music"],
  [44.85, "secondLife"],
  [46, "foamGreenCity"],
  [47, "magicStaff"],
  [47.8, "fashionPortrait"],
  [48.65, "diceCult"],
  [49.4, "impossibility"],
  [50.5, null],
];

// The singing excerpt shifts Insulae Incognitae and every later shot.
const toFrames = seconds => Math.round(seconds * 30 + 1e-8);
const trimStartFrames = 27; // Matches intro-edit.json.
const sourceEndFrame = 1506;
const excerptStart = toFrames(6.6);
const excerptFrames = toFrames(3);
const endFrame = sourceEndFrame + excerptFrames;
const frames = cuts.flatMap(([seconds, work]) => {
  const frame = toFrames(seconds);
  const resumed = [frame < excerptStart ? frame : frame + excerptFrames, work];
  return frame === excerptStart ? [[frame, "xyhnthesizer"], resumed] : [resumed];
});

export const cues = frames.slice(0, -1).flatMap(([start, work], index) => work && start < endFrame ? [{
  work,
  start: Math.max(0, start - trimStartFrames) / 30,
  end: (Math.min(frames[index + 1][0], endFrame) - trimStartFrames) / 30,
}] : []);

const sidePairs = [
  [
    { label: "KuboCities", image: "img/works/kubocities.jpg", href: "https://xyhtamura.github.io/kubocities/" },
    { label: "Benzaiten", image: "img/works/benzaiten.jpg", href: "https://xyhtamura.github.io/benzaiten/" },
  ],
  [
    { label: "Of Another Shore", image: "img/works/of-another-shore.jpg", href: "https://xyhtamura.github.io/of-another-shore/" },
    { label: "Ooid", image: "img/works/ooid.jpg", href: "https://xyhtamura.github.io/sgueltch/goopCodecs/ooid/" },
  ],
  [
    { label: "Where You Were Last Seen", image: "img/works/where-you-were-last-seen.jpg", href: "https://xyhtamura.github.io/where-you-were-last-seen/" },
    { label: "CUTLINE", image: "img/works/cutline.jpg", href: "https://xyhtamura.github.io/cutline/" },
  ],
];

// Give the on-camera gaps within the montage their own pairs.
export const sideCues = cues.flatMap(({ start }, index) => {
  const previousEnd = cues[index - 1]?.end ?? 0;
  return previousEnd < start ? [{ start: previousEnd, end: start }] : [];
}).map((cue, index) => ({ ...cue, works: sidePairs[index % sidePairs.length] }));
