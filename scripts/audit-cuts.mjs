import fs from 'node:fs';
import path from 'node:path';

const cuts = [
  { name: 'pfo', expectedSlides: 10 },
  { name: 'pfs', expectedSlides: 10 },
  { name: 'pft', expectedSlides: 10 },
  { name: 'pfd', expectedSlides: 14 }
];
const baseDir = path.resolve('xyhtamura.github.io');
const sharedCss = fs.readFileSync(path.join(baseDir, 'pfi', 'styles.css'), 'utf8');

let allPassed = true;

for (const cutConfig of cuts) {
  const cut = typeof cutConfig === 'string' ? cutConfig : cutConfig.name;
  const expectedSlides = typeof cutConfig === 'object' ? cutConfig.expectedSlides : 10;
  console.log(`\n========================================`);
  console.log(`AUDITING CUT: ${cut}`);
  console.log(`========================================`);

  const cutDir = path.join(baseDir, cut);
  const slidesHtmlPath = path.join(cutDir, 'slides.html');
  const indexHtmlPath = path.join(cutDir, 'index.html');
  const appJsPath = path.join(cutDir, 'app.js');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`❌ Missing index.html in ${cut}`);
    allPassed = false;
  }
  if (!fs.existsSync(slidesHtmlPath)) {
    console.error(`❌ Missing slides.html in ${cut}`);
    allPassed = false;
    continue;
  }
  if (!fs.existsSync(appJsPath)) {
    console.error(`❌ Missing app.js in ${cut}`);
    allPassed = false;
  }

  const slidesContent = fs.readFileSync(slidesHtmlPath, 'utf8');

  // 1. Verify slide count
  const sections = slidesContent.match(/<section class="page/g) || [];
  console.log(`Slide count: ${sections.length} / ${expectedSlides}`);
  if (sections.length !== expectedSlides) {
    console.error(`❌ Expected ${expectedSlides} slides, found ${sections.length}`);
    allPassed = false;
  } else {
    console.log(`✅ Slide count matches ${expectedSlides} exactly.`);
  }

  // 2. Verify images on disk
  const imgRegex = /<img src="([^"]+)"/g;
  let match;
  let imgCount = 0;
  let missingImages = [];
  while ((match = imgRegex.exec(slidesContent)) !== null) {
    imgCount++;
    const src = match[1];
    const absPath = path.resolve(cutDir, src);
    if (!fs.existsSync(absPath)) {
      missingImages.push({ src, absPath });
    }
  }
  console.log(`Total images referenced: ${imgCount}`);
  if (missingImages.length > 0) {
    console.error(`❌ Missing ${missingImages.length} images:`, missingImages);
    allPassed = false;
  } else {
    console.log(`✅ All ${imgCount} referenced image files exist on disk.`);
  }

  // 3. Verify slot aspect ratios (--ar)
  const figureRegex = /<figure class="slot[^"]*"[^>]*style="([^"]*)"/g;
  let figureCount = 0;
  let missingArCount = 0;
  while ((match = figureRegex.exec(slidesContent)) !== null) {
    figureCount++;
    const style = match[1];
    if (!style.includes('--ar:')) {
      missingArCount++;
    }
  }
  console.log(`Total figure slots: ${figureCount}`);
  if (missingArCount > 0) {
    console.warn(`⚠️ ${missingArCount} slots missing --ar definition.`);
  } else {
    console.log(`✅ All ${figureCount} figure slots define explicit --ar aspect ratios.`);
  }

  // 4. Verify headings vs workLinks in app.js
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  const h2Regex = /<h2>([^<]+)/g;
  let h2Count = 0;
  let unlinkedH2 = [];
  while ((match = h2Regex.exec(slidesContent)) !== null) {
    h2Count++;
    const h2Title = match[1].trim();
    if (!appJsContent.includes(h2Title)) {
      unlinkedH2.push(h2Title);
    }
  }
  console.log(`Total h2 sections: ${h2Count}`);
  if (unlinkedH2.length > 0) {
    console.warn(`⚠️ Heading titles without exact match in app.js workLinks:`, unlinkedH2);
  } else {
    console.log(`✅ All h2 heading titles have matching entries in app.js.`);
  }

  // 5. Verify the cut loads the shared layout engine rather than its own copy.
  //    A cut that carries its own builder drifts from ../pfi/styles.css and its
  //    landscape pictures collapse to thumbnails without anything erroring.
  const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
  if (!/<script src="\.\.\/pfi\/engine\.js/.test(indexContent)) {
    console.error(`❌ ${cut}/index.html does not load ../pfi/engine.js.`);
    allPassed = false;
  } else if (/function (buildSpread|buildPanels|fillMedia|planRows)/.test(appJsContent)) {
    console.error(`❌ ${cut}/app.js defines its own layout builder; it should hold only the link registry.`);
    allPassed = false;
  } else {
    console.log(`✅ Loads the shared engine, app.js holds only the link registry.`);
  }

  // 6. Verify every layout class the slides use has a rule in the shared
  //    stylesheet. `.panels.triple` reached production with no rule at all.
  const layoutClasses = new Set();
  const panelsRegex = /class="panels ([^"]+)"/g;
  while ((match = panelsRegex.exec(slidesContent)) !== null) {
    match[1].split(/\s+/).filter(Boolean).forEach((name) => layoutClasses.add(name));
  }
  const unstyled = [...layoutClasses].filter((name) => !sharedCss.includes(`.${name}`));
  if (unstyled.length > 0) {
    console.error(`❌ Layout classes with no rule in pfi/styles.css:`, unstyled);
    allPassed = false;
  } else {
    console.log(`✅ All ${layoutClasses.size} panel layout classes are styled in pfi/styles.css.`);
  }
}

console.log(`\n========================================`);
if (allPassed) {
  console.log(`🎉 ALL CUTS PASSED AUDIT SUCCESSFULLY!`);
} else {
  console.error(`❌ AUDIT FAILED WITH ISSUES ABOVE.`);
  process.exit(1);
}
