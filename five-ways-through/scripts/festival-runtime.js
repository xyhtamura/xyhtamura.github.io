// Injected into engine/scene.js by make_engine.py. Uses that scene's solid
// shader and lighting; geometry is exported by build_props.cjs.
const festivalMeshes = new Map();
const FESTIVAL_NAMES = ['banderitas', 'parol', 'chochin', 'koinobori'];
async function loadFestival() {
  await Promise.all(FESTIVAL_NAMES.map(async name => {
    const base = DATA + 'festival/' + name;
    const [meta, buffer, image] = await Promise.all([
      fetch(base + '.json').then(r => r.json()), fetch(base + '.bin').then(r => r.arrayBuffer()),
      fetch(base + '.webp').then(r => r.blob()).then(createImageBitmap),
    ]);
    const mesh = solidMesh(new Float32Array(buffer), meta.stride, true), tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    image.close(); festivalMeshes.set(name, {...mesh, tex});
  }));
}
function drawFestival(cam, vp) {
  if (!S.festival || !festivalMeshes.size) return;
  const u = P.solid.u, d = cam.dir, r = [-d[1], d[0]], counts = {};
  gl.useProgram(P.solid.p); common(P.solid, cam);
  gl.uniformMatrix4fv(u.uVP, false, vp); gl.uniform1f(u.uFlat, 0);
  gl.uniform1f(u.uWind, 0); gl.uniform1f(u.uTime, time);
  gl.uniform1f(u.uFestival, 1); gl.uniform1f(u.uFlutter, .08 + S.wind * .2);
  gl.uniform1f(u.uTextured, 1); gl.activeTexture(gl.TEXTURE2); gl.uniform1i(u.uSolidTex, 2);
  const draw = (name, along, across, yaw, phase) => {
    const mesh = festivalMeshes.get(name), c = Math.cos(yaw), s = Math.sin(yaw);
    const ax = [r[0] * c - d[0] * s, r[1] * c - d[1] * s];
    const az = [-r[0] * s - d[0] * c, -r[1] * s - d[1] * c];
    const base = [along * d[0] + across * r[0], along * d[1] + across * r[1]];
    gl.uniformMatrix4fv(u.uModel, false, frameMatrix(ax, az, base)); gl.uniform1f(u.uPhase, phase);
    gl.bindTexture(gl.TEXTURE_2D, mesh.tex); gl.bindVertexArray(mesh.vao); gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
    counts[name] = (counts[name] || 0) + 1;
  };
  // Index-addressed stations stream indefinitely; no objects accumulate. The
  // same station has the same arrangement when reached from either direction.
  const first = Math.max(0, Math.floor((travel - 12) / 18)), last = Math.ceil((travel + 65) / 18);
  for (let k = first; k <= last; k++) {
    const rnd = seeded(1016 + k * 7919), along = 9 + k * 18 + rnd() * 4;
    if (rnd() < .55) draw('banderitas', along, 0, (rnd() - .5) * .25, k * 2.7);
    const name = FESTIVAL_NAMES[1 + Math.floor(rnd() * 3)], side = rnd() < .5 ? -1 : 1;
    draw(name, along + 4, side * (2 + rnd() * .8), side * (.12 + rnd() * .4), k * 3.1);
    if (rnd() < .3) draw(FESTIVAL_NAMES[1 + Math.floor(rnd() * 3)], along + 10, -side * 2.5, -.3 * side, k * 1.3);
  }
  canvas.dataset.festival = JSON.stringify(counts);
  canvas.dataset.festivalStations = first + ':' + last;
  gl.uniform1f(u.uFestival, 0); gl.uniform1f(u.uFlutter, 0); gl.uniform1f(u.uTextured, 0);
  gl.activeTexture(gl.TEXTURE0);
}
