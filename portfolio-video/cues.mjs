export const works = {
  fashionHour: { label: "Fashion Hour Omnipresence", href: "https://xyhtamura.github.io/#fashion-hour-omnipresence" },
  weizenbaum: { label: "Weizenbaum workshop", href: "https://denkwerkstatt.berlin/ANNA-STRASSER/ORGANIZED-EVENTS/LLMs-in-Berlin/" },
  eosforos: { label: "Eosforos", href: "https://xyhtamura.github.io/#eosforos" },
  music: { label: "Music by Xyh Tamura", href: "https://xyhtamura.bandcamp.com/" },
  xyhnthesizer: { label: "xyhnthesizer", href: "https://xyhtamura.github.io/#xyhnthesizer" },
  catchment: { label: "Catchment", href: "https://xyhtamura.github.io/catchment/" },
  fiveWays: { label: "Five Ways Through", href: "https://xyhtamura.github.io/five-ways-through/" },
  pacingTo: { label: "Pacing To", href: "https://masmxyh.bandcamp.com/album/pacing-to" },
  loveLetter: { label: "love-letter-for-you.txt", href: "https://xyhtamura.github.io/loveletterforyou/" },
  gliese: { label: "Gliese", href: "https://xyhtamura.github.io/gliese/" },
  feelingTogether: { label: "Feeling Together", href: "https://xyhtamura.github.io/#feeling-together" },
  istorya: { label: "Istorya sang Bȧlatyagon", href: "https://xyhtamura.github.io/istorya-sang-balatyagon/" },
  tabota: { label: "TaboTa Roll", href: "https://xyhtamura.github.io/tabota/roll/" },
  unboundedOrgan: { label: "The Unbounded Organ", href: "https://xyhtamura.github.io/unbounded-organ/" },
  tanimKalye: { label: "Tanim-Kalye", href: "https://xyhtamura.github.io/tanim-kalye/" },
  impossibility: { label: "The Impossibility of Form in the Mind", href: "https://xyhtamura.github.io/#the-impossibility-of-form-in-the-mind" },
  open4: { label: "Open4 at VIDEOAKTION #7", href: "https://www.attaqueerlevisible.com/videoaktion-7/" },
  drawingTheHours: { label: "Drawing the Hours", href: "https://xyhtamura.github.io/drawing-the-hours/" },
  magicStaff: { label: "The Magic Staff", href: "https://xyhtamura.github.io/the-magic-staff/" },
  kikik: { label: "kíkik", href: "https://xyhtamura.github.io/kikik/" },
  whisperHouse: { label: "Whisper House score", href: "https://xyhtamura.github.io/whisperhouse/" },
  naughtyMaids: { label: "Naughty Maids", href: "https://xyhtamura.github.io/#naughty-maids" },
  manifest: { label: "Manifest", href: "https://vimeo.com/1019003508" },
  palibut: { label: "Palibut-Libot", href: "https://xyhtamura.github.io/#palibut-libot" },
  selecta: { label: "Selecta Carte d’Or", href: "https://www.youtube.com/watch?v=Ee93Wmt1GTk" },
  aftergreen: { label: "Aftergreen", href: "https://xyhtamura.github.io/#aftergreen" },
  foamGreenCity: { label: "Foam Green City", href: "https://xyhtamura.github.io/foam-green-city/" },
  titanopsis: { label: "Titanopsis calcarea bizarre", href: "https://xyhtamura.github.io/#titanopsis" },
};

// Times are relative to the narration. Camera shots clear the destination.
const cuts = [
  [2.3, "fashionHour"],
  [3.43, "weizenbaum"],
  [4.35, "eosforos"],
  [5.45, "catchment"],
  [6.6, "fiveWays"],
  [7.75, "pacingTo"],
  [9.7, "loveLetter"],
  [11.4, "gliese"],
  [13.25, "feelingTogether"],
  [14.55, "istorya"],
  [16.15, "tabota"],
  [17.5, "unboundedOrgan"],
  [18.45, "tanimKalye"],
  [21.45, "open4"],
  [22.95, "drawingTheHours"],
  [24.1, "magicStaff"],
  [25.15, null],
  [27.35, "kikik"],
  [30.15, "gliese"],
  [31.45, null],
  [36.1, "whisperHouse"],
  [37.55, "naughtyMaids"],
  [38.75, "manifest"],
  [41.08, "palibut"],
  [42.33, "magicStaff"],
  [42.9, "selecta"],
  [43.65, "music"],
  [44.85, "aftergreen"],
  [46, "foamGreenCity"],
  [47, "magicStaff"],
  [47.8, "titanopsis"],
  [48.65, "magicStaff"],
  [49.4, "impossibility"],
  [50.5, null],
];

// The excerpt starts just before Five Ways Through and shifts every later frame.
const toFrames = seconds => Math.round(seconds * 30 + 1e-8);
const excerptStart = toFrames(6.6);
const excerptFrames = toFrames(3);
const frames = cuts.flatMap(([seconds, work]) => {
  const frame = toFrames(seconds);
  const resumed = [frame < excerptStart ? frame : frame + excerptFrames, work];
  return frame === excerptStart ? [[frame, "xyhnthesizer"], resumed] : [resumed];
});

export const cues = frames.slice(0, -1).flatMap(([start, work], index) => work ? [{
  work,
  start: start / 30,
  end: frames[index + 1][0] / 30,
}] : []);
