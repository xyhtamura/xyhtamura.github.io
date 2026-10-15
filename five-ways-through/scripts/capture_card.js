// Renders card.jpg (1200 × 630 share card) and apple-touch-icon.png from the live
// opening page. Not loaded by any page; run it by hand:
//   1. python F:/xyh/framecast/test/put-receiver.py --dir <out folder> --port 8011
//   2. Open http://localhost:8000/xyhtamura.github.io/five-ways-through/ at a
//      1200 × 630 viewport, wait for the plants, and run this file's contents in
//      the console (it awaits, so paste it whole).
//   3. Stop the receiver, move both files into five-ways-through/, and check them.
const m = await import('/xyhtamura.github.io/five-ways-through/engine/scene.js');
await document.fonts.ready;
document.querySelector('main').style.visibility = 'hidden';
document.getElementById('sound').style.visibility = 'hidden';
Object.assign(m.S, {scale: 1, grain: .03, yaw: 2.2});
const c = document.getElementById('view');
sceneStep(.02); sceneStep(.02);
const gl = c.getContext('webgl2'), w = c.width, h = c.height, px = new Uint8Array(w * h * 4);
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
const src = Object.assign(document.createElement('canvas'), {width: w, height: h}), image = new ImageData(w, h);
for (let y = 0; y < h; y++) image.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);   // WebGL rows run bottom-up
src.getContext('2d').putImageData(image, 0, 0);
const W = 1200, H = 630, out = Object.assign(document.createElement('canvas'), {width: W, height: H}), g = out.getContext('2d');
g.filter = 'brightness(1.45) saturate(1.15)'; g.drawImage(src, 0, 0, W, H); g.filter = 'none';
const shade = g.createLinearGradient(0, 0, W, 0);
shade.addColorStop(0, 'rgba(4,5,11,.86)'); shade.addColorStop(.55, 'rgba(4,5,11,.42)'); shade.addColorStop(1, 'rgba(4,5,11,0)');
g.fillStyle = shade; g.fillRect(0, 0, W, H);
g.fillStyle = '#f2f0ea'; g.font = "italic 300 92px 'Averia Sans Libre'"; g.fillText('Five Ways Through', 72, 300);
g.fillStyle = '#b6bdd0'; g.font = "300 34px 'Averia Sans Libre'"; g.fillText('Five browser pieces for a photographed hand', 76, 362);
['#8fdcff', '#ffa3cb', '#cdb8ff', '#ffb67a', '#98f0d4'].forEach((colour, i) => { g.fillStyle = colour; g.beginPath(); g.arc(88 + i * 34, 420, 9, 0, Math.PI * 2); g.fill(); });
g.fillStyle = '#8a91a6'; g.font = "400 24px 'Averia Sans Libre'"; g.fillText('Xyh Tamura', 76, 560);
await fetch('http://localhost:8011/card.jpg', {method: 'PUT', body: await new Promise(r => out.toBlob(r, 'image/jpeg', .88))});
const icon = Object.assign(document.createElement('canvas'), {width: 180, height: 180}), svg = new Image();
svg.src = '/xyhtamura.github.io/five-ways-through/favicon.svg'; await svg.decode();
icon.getContext('2d').drawImage(svg, 0, 0, 180, 180);
await fetch('http://localhost:8011/apple-touch-icon.png', {method: 'PUT', body: await new Promise(r => icon.toBlob(r, 'image/png'))});
