export const works = {
  fashionHour: { label: "Fashion Hour Omnipresence", href: "https://xyhtamura.github.io/#fashion-hour-omnipresence" },
  music: { label: "Music by Xyh Tamura", href: "https://xyhtamura.bandcamp.com/" },
  xyhnthesizer: { label: "xyhnthesizer", href: "https://xyhtamura.github.io/#xyhnthesizer" },
  stanzuary: { label: "Stanzuary", href: "https://xyhtamura.github.io/stanzuary/" },
  pacingTo: { label: "Pacing To", href: "https://masmxyh.bandcamp.com/album/pacing-to" },
  plica: { label: "plica", href: "https://xyhtamura.github.io/plica/" },
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
  naughtyMaids: { label: "Naughty Maids", href: "https://xyhtamura.github.io/#naughty-maids" },
  manifest: { label: "Manifest", href: "https://vimeo.com/1019003508" },
  titanopsis: { label: "Titanopsis calcarea bizarre", href: "https://xyhtamura.github.io/#titanopsis" },
};

// Times are relative to the narration. Camera shots clear the destination.
const cuts = [
  [2.3, "fashionHour"],
  [4.4, "music"],
  [6.6, "stanzuary"],
  [7.75, "pacingTo"],
  [9.7, "plica"],
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
  [36.1, "music"],
  [38.45, "naughtyMaids"],
  [41.08, "manifest"],
  [42.65, "magicStaff"],
  [44.15, null],
  [44.85, "manifest"],
  [46, "fashionHour"],
  [47, "magicStaff"],
  [47.8, "titanopsis"],
  [48.65, "magicStaff"],
  [49.4, "impossibility"],
  [50.5, null],
];

// The excerpt starts on the Stanzuary cut and shifts every later frame.
const toFrames = seconds => Math.round(seconds * 30 + 1e-8);
const excerptStart = toFrames(6.6);
const excerptFrames = toFrames(1.6);
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
