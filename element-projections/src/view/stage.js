// src/view/stage.js
// Coordinated rendering engine for Element Projections:
// - Background HTML5 Canvas for axes, grid lines, displacement vectors, period tracks, and triad guides.
// - Interactive DOM elements with GPU-accelerated 3D transforms for crisp typography and accessibility.
// - 60fps interruptible animation engine with spring/cubic interpolation.

import { CATEGORIES, BLOCKS } from '../data/elements.js';

export class ProjectionStage {
  /**
   * @param {HTMLElement} container - DOM container for the stage.
   * @param {Object[]} elements - Full list of 118 elements.
   * @param {Object} options - Configuration callbacks and settings.
   */
  constructor(container, elements, options = {}) {
    this.container = container;
    this.elements = elements;
    this.options = {
      onSelectElement: options.onSelectElement || (() => {}),
      onHoverElement: options.onHoverElement || (() => {}),
      ...options
    };

    this.currentLayout = null;
    this.targetCoords = new Map(); // z -> { x, y, rawX, rawY }
    this.currentPositions = new Map(); // z -> { x, y, screenX, screenY, vx, vy }
    this.baselineCoords = new Map(); // Standard table coordinates for displacement reference

    this.colorMode = 'category'; // 'category', 'block', 'displacement', 'atypicality', 'heatmap'
    this.heatmapProperty = 'electronegativity';
    this.residualFilter = 'all'; // 'all', 'residuals-only', 'none'
    this.selectedZ = null;
    this.hoveredZ = null;
    this.showTrails = true;
    this.showGuides = true;
    this.showAxes = true;

    this.displacements = new Map(); // z -> { dx, dy, dist, normDist }
    this.residuals = new Map(); // z -> classification object

    this.animating = false;
    this.animationProgress = 1.0;
    this.animationDuration = 700; // ms
    this.animationStartTime = 0;

    this.setupDOM();
    this.setupEvents();
  }

  setupDOM() {
    this.container.innerHTML = '';
    this.container.classList.add('projection-stage');

    // Canvas layer
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'stage-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    // DOM Tiles layer
    this.tilesContainer = document.createElement('div');
    this.tilesContainer.className = 'stage-tiles';
    this.container.appendChild(this.tilesContainer);

    // Create 118 tile elements
    this.tileElements = new Map();
    for (const elem of this.elements) {
      const tile = document.createElement('div');
      tile.className = 'element-tile';
      tile.dataset.z = elem.z;
      tile.dataset.symbol = elem.symbol;
      tile.dataset.block = elem.block;
      tile.dataset.category = elem.category;
      tile.tabIndex = 0;
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', `${elem.name} (${elem.symbol}), atomic number ${elem.z}`);

      tile.innerHTML = `
        <div class="tile-header">
          <span class="tile-z">${elem.z}</span>
          <span class="tile-mass">${elem.atomicMass ? Number(elem.atomicMass).toFixed(1) : ''}</span>
        </div>
        <div class="tile-symbol">${elem.symbol}</div>
        <div class="tile-name">${elem.name}</div>
        <div class="tile-badge" style="display:none;"></div>
      `;

      this.tilesContainer.appendChild(tile);
      this.tileElements.set(elem.z, tile);

      // Initialize position
      this.currentPositions.set(elem.z, {
        x: elem.stdCol,
        y: elem.stdRow,
        screenX: 0,
        screenY: 0,
        fromX: elem.stdCol,
        fromY: elem.stdRow,
        toX: elem.stdCol,
        toY: elem.stdRow
      });

      this.baselineCoords.set(elem.z, { x: elem.stdCol, y: elem.stdRow });
    }

    this.handleResize();
  }

  setupEvents() {
    window.addEventListener('resize', () => this.handleResize());
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.container);
    }

    this.tilesContainer.addEventListener('click', (e) => {
      const tile = e.target.closest('.element-tile');
      if (tile) {
        const z = parseInt(tile.dataset.z, 10);
        this.selectElement(z);
      }
    });

    this.tilesContainer.addEventListener('mouseover', (e) => {
      const tile = e.target.closest('.element-tile');
      if (tile) {
        const z = parseInt(tile.dataset.z, 10);
        this.hoveredZ = z;
        this.options.onHoverElement(this.elements.find(el => el.z === z));
        this.drawCanvas();
      }
    });

    this.tilesContainer.addEventListener('mouseout', (e) => {
      const tile = e.target.closest('.element-tile');
      if (tile && !this.tilesContainer.contains(e.relatedTarget)) {
        this.hoveredZ = null;
        this.options.onHoverElement(null);
        this.drawCanvas();
      }
    });

    this.tilesContainer.addEventListener('keydown', (e) => {
      const tile = e.target.closest('.element-tile');
      if (tile && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const z = parseInt(tile.dataset.z, 10);
        this.selectElement(z);
      }
    });
  }

  handleResize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.updateScreenTransforms();
    this.drawCanvas();
  }

  /**
   * Applies a new layout projection with smooth interruptible transition.
   * @param {Object} layoutResult - Output from layout_registry functions.
   * @param {Map} displacements - Displacements from baseline.
   * @param {Map} residuals - Residual classifications.
   */
  setLayout(layoutResult, displacements = new Map(), residuals = new Map()) {
    this.currentLayout = layoutResult;
    this.displacements = displacements;
    this.residuals = residuals;
    this.configureLayoutSurface(layoutResult);

    // Capture instantaneous positions for interruptible animation
    const now = performance.now();
    for (const elem of this.elements) {
      const pos = this.currentPositions.get(elem.z);
      const target = layoutResult.coords.get(elem.z) || { x: 1, y: 1 };

      pos.fromX = pos.x;
      pos.fromY = pos.y;
      pos.toX = target.x;
      pos.toY = target.y;
      pos.rawX = target.rawX;
      pos.rawY = target.rawY;
    }

    this.animationStartTime = now;
    this.animationProgress = 0;
    this.animating = true;

    this.updateTileVisuals();
    this.runAnimationLoop();
  }

  configureLayoutSurface(layoutResult) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const pos of layoutResult.coords.values()) {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    }

    const rangeX = Math.max(1, maxX - minX);
    const rangeY = Math.max(1, maxY - minY);
    const mode = layoutResult.displayMode || (layoutResult.hasAxes ? 'points' : 'grid');
    const visibleWidth = this.container.parentElement?.clientWidth || this.container.clientWidth || 0;

    let contentWidth;
    let contentHeight;
    if (mode === 'strip') {
      contentWidth = (rangeX + 1) * 26 + 72;
      contentHeight = 260;
    } else if (mode === 'packed-grid') {
      contentWidth = (rangeX + 1) * 82 + 72;
      contentHeight = (rangeY + 1) * 54 + 72;
    } else if (mode === 'points') {
      contentWidth = 700;
      contentHeight = 540;
    } else {
      contentWidth = (rangeX + 1) * 34 + 72;
      contentHeight = (rangeY + 1) * 38 + 72;
    }

    this.container.style.minWidth = `${Math.ceil(Math.max(visibleWidth, contentWidth))}px`;
    this.container.style.height = `${Math.ceil(Math.max(440, contentHeight))}px`;
    this.container.classList.toggle('point-layout', mode === 'points');
    this.container.classList.toggle('packed-layout', mode === 'packed-grid');
    this.container.classList.toggle('strip-layout', mode === 'strip');
    this.handleResize();
  }

  runAnimationLoop() {
    if (!this.animating) return;

    const now = performance.now();
    const elapsed = now - this.animationStartTime;
    this.animationProgress = Math.min(1.0, elapsed / this.animationDuration);

    // Smooth cubic ease-out
    const t = this.animationProgress;
    const ease = 1 - Math.pow(1 - t, 3);

    for (const elem of this.elements) {
      const pos = this.currentPositions.get(elem.z);
      pos.x = pos.fromX + (pos.toX - pos.fromX) * ease;
      pos.y = pos.fromY + (pos.toY - pos.fromY) * ease;
    }

    this.updateScreenTransforms();
    this.drawCanvas();

    if (this.animationProgress < 1.0) {
      requestAnimationFrame(() => this.runAnimationLoop());
    } else {
      this.animating = false;
      this.drawCanvas();
    }
  }

  updateScreenTransforms() {
    if (!this.currentLayout) return;

    // Compute coordinate bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const pos of this.currentPositions.values()) {
      if (pos.x < minX) minX = pos.x;
      if (pos.x > maxX) maxX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.y > maxY) maxY = pos.y;
    }

    const mode = this.currentLayout.displayMode || (this.currentLayout.hasAxes ? 'points' : 'grid');
    const pointMode = mode === 'points' || mode === 'packed-grid';
    const padX = this.currentLayout.hasAxes ? 72 : 36;
    const padY = this.currentLayout.hasAxes ? 64 : 36;
    const availW = Math.max(100, this.width - padX * 2);
    const availH = Math.max(100, this.height - padY * 2);

    const rangeX = Math.max(1, maxX - minX);
    const rangeY = Math.max(1, maxY - minY);

    const pitch = Math.min(availW / (rangeX + 1), availH / (rangeY + 1));
    let tileSize;
    if (pointMode) {
      tileSize = mode === 'packed-grid' ? 24 : 16;
    } else if (mode === 'strip') {
      tileSize = Math.max(16, Math.min(24, pitch - 2));
    } else {
      tileSize = Math.max(16, Math.min(56, pitch - 2));
    }

    const scaleX = (availW - tileSize) / rangeX;
    const scaleY = (availH - tileSize) / rangeY;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = padX + (availW - rangeX * scale) / 2;
    const offsetY = padY + (availH - rangeY * scale) / 2;

    this.stageMetrics = { minX, maxX, minY, maxY, scale, offsetX, offsetY, tileSize, pointMode };

    const anchors = [];
    for (const elem of this.elements) {
      const pos = this.currentPositions.get(elem.z);
      anchors.push({
        elem,
        pos,
        x: offsetX + (pos.x - minX) * scale,
        y: offsetY + (pos.y - minY) * scale
      });
    }

    const placedPoints = pointMode && this.animationProgress >= 0.999
      ? this.placePointTiles(anchors, tileSize, padX, padY)
      : null;

    for (const { elem, pos, x, y } of anchors) {
      const placed = placedPoints?.get(elem.z);
      const sx = placed?.x ?? x;
      const sy = placed?.y ?? y;

      pos.anchorX = x;
      pos.anchorY = y;
      pos.screenX = sx;
      pos.screenY = sy;

      const tile = this.tileElements.get(elem.z);
      if (tile) {
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;

        // Adjust font sizes based on tile size
        if (tileSize < 42) {
          tile.classList.add('compact');
        } else {
          tile.classList.remove('compact');
        }
      }
    }
  }

  placePointTiles(anchors, tileSize, padX, padY) {
    const placed = [];
    const result = new Map();
    const step = tileSize + 3;
    const maxX = this.width - padX - tileSize;
    const maxY = this.height - padY - tileSize;

    const overlaps = (x, y) => placed.some(rect => (
      x < rect.x + tileSize + 2 &&
      x + tileSize + 2 > rect.x &&
      y < rect.y + tileSize + 2 &&
      y + tileSize + 2 > rect.y
    ));

    for (const { elem, x: anchorX, y: anchorY } of anchors) {
      let best = null;
      const tried = new Set();
      for (let ring = 0; ring <= 18 && !best; ring++) {
        const offsets = ring === 0 ? [[0, 0]] : [];
        if (ring > 0) {
          for (let i = -ring; i <= ring; i++) {
            offsets.push([i, -ring], [i, ring], [-ring, i], [ring, i]);
          }
        }

        for (const [ox, oy] of offsets) {
          const x = Math.max(padX, Math.min(maxX, anchorX + ox * step));
          const y = Math.max(padY, Math.min(maxY, anchorY + oy * step));
          const key = `${x.toFixed(1)},${y.toFixed(1)}`;
          if (tried.has(key)) continue;
          tried.add(key);
          if (!overlaps(x, y)) {
            best = { x, y };
            break;
          }
        }
      }

      best ||= { x: anchorX, y: anchorY };
      placed.push(best);
      result.set(elem.z, best);
    }

    return result;
  }

  updateTileVisuals() {
    for (const elem of this.elements) {
      const tile = this.tileElements.get(elem.z);
      if (!tile) continue;

      // Category / Block / Metric coloring
      let bgColor = 'rgba(26,23,20,0.03)';
      let borderColor = 'transparent';
      let textColor = '#1a1714';

      if (this.colorMode === 'category') {
        const cat = CATEGORIES[elem.category];
        if (cat) {
          bgColor = `${cat.color}2b`;
          borderColor = cat.color;
        }
      } else if (this.colorMode === 'block') {
        const blk = BLOCKS[elem.block];
        if (blk) {
          bgColor = `${blk.color}2b`;
          borderColor = blk.color;
        }
      } else if (this.colorMode === 'displacement') {
        const disp = this.displacements.get(elem.z);
        const norm = disp ? disp.normDist : 0;
        // Color scale from calm blue to bright magenta/amber
        const hue = 220 - norm * 180;
        bgColor = `hsla(${hue}, 62%, 48%, 0.24)`;
        borderColor = `hsl(${hue}, 58%, 38%)`;
      } else if (this.colorMode === 'atypicality') {
        const res = this.residuals.get(elem.z);
        const aty = res?.sneathAtypicality;
        if (aty != null) {
          // 0.28 (typical/green) to 0.48 (atypical/red)
          const norm = Math.max(0, Math.min(1, (aty - 0.28) / 0.20));
          const hue = 140 - norm * 140; // green -> red
          bgColor = `hsla(${hue}, 58%, 44%, 0.24)`;
          borderColor = `hsl(${hue}, 55%, 34%)`;
        }
      } else if (this.colorMode === 'heatmap') {
        const val = elem[this.heatmapProperty];
        if (val != null) {
          // Normalize property across all elements
          const vals = this.elements.map(e => e[this.heatmapProperty]).filter(v => v != null);
          const min = Math.min(...vals);
          const max = Math.max(...vals);
          const norm = (val - min) / ((max - min) || 1.0);
          const hue = 240 - norm * 240; // blue to red
          bgColor = `hsla(${hue}, 60%, 46%, 0.26)`;
          borderColor = `hsl(${hue}, 56%, 36%)`;
        }
      }

      tile.style.backgroundColor = bgColor;
      tile.style.setProperty('--tile-edge', borderColor);

      // Residual highlighting
      const res = this.residuals.get(elem.z);
      const isResidual = res && (res.isBesaluH || res.isBesaluCN || res.isDiagonal || res.isDobereinerTriad || res.isSneathIntruder);

      if (this.residualFilter === 'residuals-only' && !isResidual) {
        tile.style.opacity = '0.15';
      } else {
        tile.style.opacity = '1.0';
      }

      if (elem.z === this.selectedZ) {
        tile.classList.add('selected');
      } else {
        tile.classList.remove('selected');
      }
    }
  }

  drawCanvas() {
    const { ctx, width, height, currentLayout, stageMetrics } = this;
    if (!ctx || !width || !height || !stageMetrics) return;

    ctx.clearRect(0, 0, width, height);

    // Draw Axes if layout supports continuous axes
    if (currentLayout && currentLayout.hasAxes && this.showAxes) {
      this.drawAxes();
    }

    if (stageMetrics.pointMode && this.animationProgress >= 0.999) {
      this.drawPointLeaderLines();
    }

    // Draw motion displacement vectors / trails if enabled
    if (this.showTrails && this.currentLayout && this.currentLayout.key !== 'standard') {
      this.drawDisplacementTrails();
    }

    // Draw Triad / Diagonal guides if active
    if (this.showGuides) {
      this.drawRelationshipGuides();
    }
  }

  drawPointLeaderLines() {
    const { ctx, stageMetrics } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(26, 23, 20, 0.18)';
    ctx.lineWidth = 0.75;

    for (const pos of this.currentPositions.values()) {
      const dx = pos.screenX - pos.anchorX;
      const dy = pos.screenY - pos.anchorY;
      if (Math.hypot(dx, dy) < 3) continue;
      ctx.beginPath();
      ctx.moveTo(pos.anchorX + stageMetrics.tileSize / 2, pos.anchorY + stageMetrics.tileSize / 2);
      ctx.lineTo(pos.screenX + stageMetrics.tileSize / 2, pos.screenY + stageMetrics.tileSize / 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawAxes() {
    const { ctx, stageMetrics, currentLayout, width, height } = this;
    const { offsetX, offsetY, scale, minX, maxX, minY, maxY, tileSize } = stageMetrics;

    ctx.save();
    ctx.strokeStyle = 'rgba(26, 23, 20, 0.20)';
    ctx.lineWidth = 1;
    ctx.font = '11px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(26, 23, 20, 0.58)';

    // X axis line (at bottom)
    const axisY = offsetY + (maxY - minY) * scale + tileSize + 10;
    ctx.beginPath();
    ctx.moveTo(offsetX, axisY);
    ctx.lineTo(offsetX + (maxX - minX) * scale + tileSize, axisY);
    ctx.stroke();

    // Y axis line (at left)
    const axisX = offsetX - 10;
    ctx.beginPath();
    ctx.moveTo(axisX, offsetY);
    ctx.lineTo(axisX, axisY);
    ctx.stroke();

    // Labels
    if (currentLayout.xAxisLabel) {
      ctx.textAlign = 'center';
      ctx.fillText(currentLayout.xAxisLabel, offsetX + ((maxX - minX) * scale) / 2, axisY + 28);
    }
    if (currentLayout.yAxisLabel) {
      ctx.save();
      ctx.translate(axisX - 25, offsetY + ((maxY - minY) * scale) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(currentLayout.yAxisLabel, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  drawDisplacementTrails() {
    const { ctx, stageMetrics } = this;
    ctx.save();
    ctx.lineWidth = 1.5;

    for (const elem of this.elements) {
      const pos = this.currentPositions.get(elem.z);
      const base = this.baselineCoords.get(elem.z);
      if (!pos || !base) continue;

      const baseScreenX = stageMetrics.offsetX + (base.x - stageMetrics.minX) * stageMetrics.scale;
      const baseScreenY = stageMetrics.offsetY + (base.y - stageMetrics.minY) * stageMetrics.scale;

      const disp = this.displacements.get(elem.z);
      const norm = disp ? disp.normDist : 0;
      if (norm < 0.05) continue;

      const hue = 220 - norm * 180;
      ctx.strokeStyle = `hsla(${hue}, 58%, 38%, ${0.18 + norm * 0.42})`;

      ctx.beginPath();
      ctx.moveTo(pos.screenX + stageMetrics.tileSize / 2, pos.screenY + stageMetrics.tileSize / 2);
      ctx.lineTo(pos.screenX - (pos.toX - pos.fromX) * stageMetrics.scale * (1 - this.animationProgress), pos.screenY);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRelationshipGuides() {
    const { ctx, stageMetrics } = this;
    ctx.save();

    // Connect Diagonal pairs: Li-Mg, Be-Al, B-Si
    const diagonalPairs = [['Li', 'Mg'], ['Be', 'Al'], ['B', 'Si']];
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(24, 82, 130, 0.55)';

    for (const [s1, s2] of diagonalPairs) {
      const e1 = this.elements.find(e => e.symbol === s1);
      const e2 = this.elements.find(e => e.symbol === s2);
      if (!e1 || !e2) continue;

      const p1 = this.currentPositions.get(e1.z);
      const p2 = this.currentPositions.get(e2.z);
      if (!p1 || !p2) continue;

      ctx.beginPath();
      ctx.moveTo(p1.screenX + stageMetrics.tileSize / 2, p1.screenY + stageMetrics.tileSize / 2);
      ctx.lineTo(p2.screenX + stageMetrics.tileSize / 2, p2.screenY + stageMetrics.tileSize / 2);
      ctx.stroke();
    }

    // Connect Döbereiner triads: Li-Na-K, Ca-Sr-Ba, Cl-Br-I
    const triads = [
      ['Li', 'Na', 'K'],
      ['Ca', 'Sr', 'Ba'],
      ['Cl', 'Br', 'I']
    ];
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(122, 84, 12, 0.5)';

    for (const triad of triads) {
      const elems = triad.map(s => this.elements.find(e => e.symbol === s)).filter(Boolean);
      if (elems.length < 3) continue;

      const p0 = this.currentPositions.get(elems[0].z);
      const p1 = this.currentPositions.get(elems[1].z);
      const p2 = this.currentPositions.get(elems[2].z);

      ctx.beginPath();
      ctx.moveTo(p0.screenX + stageMetrics.tileSize / 2, p0.screenY + stageMetrics.tileSize / 2);
      ctx.lineTo(p1.screenX + stageMetrics.tileSize / 2, p1.screenY + stageMetrics.tileSize / 2);
      ctx.lineTo(p2.screenX + stageMetrics.tileSize / 2, p2.screenY + stageMetrics.tileSize / 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  selectElement(z) {
    this.selectedZ = z;
    const elem = this.elements.find(e => e.z === z) || null;
    this.updateTileVisuals();
    this.options.onSelectElement(elem);
  }

  setColorMode(mode, property = 'electronegativity') {
    this.colorMode = mode;
    this.heatmapProperty = property;
    this.updateTileVisuals();
  }

  setResidualFilter(filter) {
    this.residualFilter = filter;
    this.updateTileVisuals();
  }

  setTrails(enabled) {
    this.showTrails = enabled;
    this.drawCanvas();
  }

  setGuides(enabled) {
    this.showGuides = enabled;
    this.drawCanvas();
  }
}
