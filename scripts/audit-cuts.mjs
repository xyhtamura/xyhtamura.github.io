import fs from 'node:fs';
import path from 'node:path';

const cuts = ['pfo', 'pfs', 'pft'];
const baseDir = path.resolve('xyhtamura.github.io');

let allPassed = true;

for (const cut of cuts) {
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
  console.log(`Slide count: ${sections.length} / 10`);
  if (sections.length !== 10) {
    console.error(`❌ Expected 10 slides, found ${sections.length}`);
    allPassed = false;
  } else {
    console.log(`✅ Slide count matches 10 exactly.`);
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
}

console.log(`\n========================================`);
if (allPassed) {
  console.log(`🎉 ALL CUTS PASSED AUDIT SUCCESSFULLY!`);
} else {
  console.error(`❌ AUDIT FAILED WITH ISSUES ABOVE.`);
  process.exit(1);
}
