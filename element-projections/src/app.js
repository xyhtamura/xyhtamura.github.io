// src/app.js
// Main application controller for Element Projections:
// - Initializes dataset and projection stage.
// - Manages layout transitions, UI control events, inspector updates, and URL hash sync.

import { ELEMENTS, CATEGORIES, BLOCKS } from './data/elements.js';
import { LAYOUT_PRESETS, layoutScatter, layoutStrip } from './projections/layout_registry.js?v=20260828b';
import { computeDisplacements, computeNeighborhoodPreservation, classifyResiduals } from './metrics/distortion.js';
import { ProjectionStage } from './view/stage.js?v=20260828b';

class ElementProjectionsApp {
  constructor() {
    this.stage = null;
    this.currentPreset = 'standard';
    this.scatterX = 'electronegativity';
    this.scatterY = 'atomicRadius';
    this.stripKey = 'z';
    this.colorMode = 'category';
    this.heatmapProp = 'electronegativity';
    this.selectedElement = null;

    // Cache standard baseline coordinates for displacement computation
    const standardLayout = LAYOUT_PRESETS.find(p => p.id === 'standard').fn();
    this.baselineCoords = standardLayout.coords;

    // Precompute residual classification for all elements
    this.residualMap = new Map();
    for (const elem of ELEMENTS) {
      this.residualMap.set(elem.z, classifyResiduals(elem));
    }

    this.init();
  }

  init() {
    const stageContainer = document.getElementById('stage-container');
    if (!stageContainer) return;

    this.stage = new ProjectionStage(stageContainer, ELEMENTS, {
      onSelectElement: (elem) => this.handleSelectElement(elem),
      onHoverElement: (elem) => this.handleHoverElement(elem)
    });

    this.setupUI();
    this.parseURLHash();
    this.applyCurrentProjection();

    // Keep a URL-selected element, otherwise start with Hydrogen (Z=1).
    this.stage.selectElement((this.selectedElement || ELEMENTS[0]).z);
  }

  setupUI() {
    // Preset Buttons
    const presetContainer = document.getElementById('layout-presets');
    const projectionSelect = document.getElementById('projection-select');
    if (presetContainer) {
      presetContainer.innerHTML = '';
      LAYOUT_PRESETS.forEach(preset => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn btn-preset ${preset.id === this.currentPreset ? 'active' : ''}`;
        btn.dataset.preset = preset.id;
        btn.textContent = preset.name;
        btn.addEventListener('click', () => this.switchPreset(preset.id));
        presetContainer.appendChild(btn);
      });
    }

    if (projectionSelect) {
      projectionSelect.innerHTML = '';
      LAYOUT_PRESETS.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        projectionSelect.appendChild(option);
      });
      projectionSelect.value = this.currentPreset;
      projectionSelect.addEventListener('change', (e) => this.switchPreset(e.target.value));
    }

    // Scatter Axis Controls
    const scatterControls = document.getElementById('scatter-controls');
    const xSelect = document.getElementById('scatter-x-prop');
    const ySelect = document.getElementById('scatter-y-prop');

    if (xSelect && ySelect) {
      xSelect.addEventListener('change', (e) => {
        this.scatterX = e.target.value;
        if (this.currentPreset === 'scatter') this.applyCurrentProjection();
      });
      ySelect.addEventListener('change', (e) => {
        this.scatterY = e.target.value;
        if (this.currentPreset === 'scatter') this.applyCurrentProjection();
      });
    }

    // Color Mode Select
    const colorSelect = document.getElementById('color-mode-select');
    const heatmapSelect = document.getElementById('heatmap-prop-select');
    if (colorSelect) {
      colorSelect.addEventListener('change', (e) => {
        this.colorMode = e.target.value;
        if (heatmapSelect) {
          heatmapSelect.style.display = (this.colorMode === 'heatmap') ? 'inline-block' : 'none';
        }
        this.stage.setColorMode(this.colorMode, this.heatmapProp);
      });
    }

    if (heatmapSelect) {
      heatmapSelect.addEventListener('change', (e) => {
        this.heatmapProp = e.target.value;
        this.stage.setColorMode(this.colorMode, this.heatmapProp);
      });
    }

    // Residual Filter Buttons
    const resFilterAll = document.getElementById('filter-all');
    const resFilterOnly = document.getElementById('filter-residuals');
    if (resFilterAll && resFilterOnly) {
      resFilterAll.addEventListener('click', () => {
        resFilterAll.classList.add('active');
        resFilterOnly.classList.remove('active');
        this.stage.setResidualFilter('all');
      });
      resFilterOnly.addEventListener('click', () => {
        resFilterOnly.classList.add('active');
        resFilterAll.classList.remove('active');
        this.stage.setResidualFilter('residuals-only');
      });
    }

    // Trails Toggle
    const trailsToggle = document.getElementById('toggle-trails');
    if (trailsToggle) {
      trailsToggle.addEventListener('change', (e) => {
        this.stage.setTrails(e.target.checked);
      });
    }

    // Guides Toggle
    const guidesToggle = document.getElementById('toggle-guides');
    if (guidesToggle) {
      guidesToggle.addEventListener('change', (e) => {
        this.stage.setGuides(e.target.checked);
      });
    }

    // Literature Modal
    const modalBtn = document.getElementById('btn-open-thesis');
    const modal = document.getElementById('thesis-modal');
    const closeBtn = document.getElementById('btn-close-thesis');
    if (modalBtn && modal && closeBtn) {
      modalBtn.addEventListener('click', () => modal.classList.add('open'));
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }
  }

  switchPreset(presetId) {
    this.currentPreset = presetId;

    // Update active preset button styling
    const buttons = document.querySelectorAll('.btn-preset');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetId);
    });

    const projectionSelect = document.getElementById('projection-select');
    if (projectionSelect) projectionSelect.value = presetId;

    // Toggle scatter controls visibility
    const scatterControls = document.getElementById('scatter-controls');
    if (scatterControls) {
      scatterControls.style.display = (presetId === 'scatter') ? 'flex' : 'none';
    }

    this.applyCurrentProjection();
    this.updateURLHash();
  }

  applyCurrentProjection() {
    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === this.currentPreset);
    });
    const projectionSelect = document.getElementById('projection-select');
    if (projectionSelect) projectionSelect.value = this.currentPreset;

    let layoutResult;
    if (this.currentPreset === 'scatter') {
      layoutResult = layoutScatter(this.scatterX, this.scatterY);
    } else if (this.currentPreset === 'strip') {
      layoutResult = layoutStrip(this.stripKey);
    } else {
      const preset = LAYOUT_PRESETS.find(p => p.id === this.currentPreset);
      layoutResult = preset ? preset.fn() : LAYOUT_PRESETS[0].fn();
    }

    // Calculate displacement vectors relative to standard IUPAC baseline
    const displacements = computeDisplacements(layoutResult.coords, this.baselineCoords);

    // Calculate topological k-NN preservation
    const preservation = computeNeighborhoodPreservation(ELEMENTS, layoutResult.coords, 5);

    // Apply to stage
    this.stage.setLayout(layoutResult, displacements, this.residualMap);

    // Update Meta & Diagnostics Header
    this.updateDiagnostics(layoutResult, displacements, preservation);

    // Refresh Inspector for current selected element
    if (this.selectedElement) {
      this.updateInspector(this.selectedElement, layoutResult, displacements);
    }
  }

  updateDiagnostics(layoutResult, displacements, preservation) {
    const titleElem = document.getElementById('diag-title');
    const keyElem = document.getElementById('diag-key');
    const wrapElem = document.getElementById('diag-wrap');
    const thesisElem = document.getElementById('diag-thesis');
    const descElem = document.getElementById('diag-desc');
    const metricDisplacementElem = document.getElementById('metric-displacement');
    const metricPreservationElem = document.getElementById('metric-preservation');

    if (titleElem) titleElem.textContent = layoutResult.name;
    if (keyElem) keyElem.textContent = layoutResult.orderingKey;
    if (wrapElem) wrapElem.textContent = layoutResult.wrapRule;
    if (thesisElem) thesisElem.textContent = layoutResult.thesis;
    if (descElem) descElem.textContent = layoutResult.description;

    // Calculate mean normalized displacement
    let sumDist = 0;
    let count = 0;
    for (const d of displacements.values()) {
      sumDist += d.dist;
      count++;
    }
    const meanDist = count > 0 ? (sumDist / count).toFixed(2) : '0.00';

    if (metricDisplacementElem) {
      metricDisplacementElem.textContent = `${meanDist} grid units`;
    }
    if (metricPreservationElem) {
      metricPreservationElem.textContent = `${(preservation.overallScore * 100).toFixed(1)}%`;
    }
  }

  handleSelectElement(elem) {
    if (!elem) return;
    this.selectedElement = elem;
    const currentLayout = this.stage.currentLayout;
    const displacements = this.stage.displacements;
    this.updateInspector(elem, currentLayout, displacements);
    this.updateURLHash();
  }

  handleHoverElement(elem) {
    const hoverHint = document.getElementById('hover-hint');
    if (!hoverHint) return;
    if (elem) {
      const disp = this.stage.displacements.get(elem.z);
      const distStr = disp ? ` | Δ = ${disp.dist.toFixed(2)}` : '';
      hoverHint.textContent = `${elem.z}. ${elem.name} (${elem.symbol}) — Block ${elem.block}, Gr ${elem.group18 || '-'}, Period ${elem.period}${distStr}`;
    } else {
      hoverHint.textContent = 'Select an element to inspect its coordinates and properties.';
    }
  }

  updateInspector(elem, layoutResult, displacements) {
    const card = document.getElementById('inspector-card');
    if (!card || !elem) return;

    const cat = CATEGORIES[elem.category] || { label: elem.category, color: '#aaa' };
    const blk = BLOCKS[elem.block] || { label: elem.block, color: '#aaa' };
    const res = this.residualMap.get(elem.z);
    const disp = displacements?.get(elem.z);

    const pos = layoutResult?.coords.get(elem.z) || { x: elem.stdCol, y: elem.stdRow };

    // Build residual pill badges
    const badges = [];
    if (res?.isBesaluH) {
      badges.push('<span class="badge badge-residual" title="Besalú 2013: Hydrogen lands near Carbon and Nitrogen rather than Group 1 in property PCA">★ Besalú H Residual</span>');
    }
    if (res?.isBesaluCN) {
      badges.push('<span class="badge badge-residual" title="Besalú 2013: C and N are displaced from expected period line">★ Besalú C/N Shift</span>');
    }
    if (res?.isDiagonal) {
      badges.push(`<span class="badge badge-diagonal" title="Diagonal relationship with ${res.diagonalPartner}">⤢ Diagonal Partner: ${res.diagonalPartner}</span>`);
    }
    if (res?.isDobereinerTriad) {
      badges.push(`<span class="badge badge-triad" title="${res.triadName}">≡ Triad: ${res.triadName}</span>`);
    }
    if (res?.isSneathIntruder) {
      badges.push('<span class="badge badge-residual" title="Sneath 2000: d-block intruder into p-block region">▲ Sneath d-Block Intruder</span>');
    }
    if (res?.isSneathPlatinum) {
      badges.push('<span class="badge badge-info" title="Sneath 2000: Axis III platinum-group segregation">◆ Sneath Platinum Group</span>');
    }

    card.innerHTML = `
      <div class="card-header">
        <div class="card-symbol" style="border-color: ${cat.color}; color: ${cat.color};">
          <span class="card-z">${elem.z}</span>
          <span class="card-sym">${elem.symbol}</span>
        </div>
        <div class="card-title-group">
          <h3 class="card-name">${elem.name}</h3>
          <div class="card-tags">
            <span class="badge" style="background: ${cat.color}22; color: ${cat.color}; border: 1px solid ${cat.color}66;">${cat.label}</span>
            <span class="badge" style="background: ${blk.color}22; color: ${blk.color}; border: 1px solid ${blk.color}66;">${blk.label}</span>
          </div>
        </div>
      </div>

      ${badges.length > 0 ? `<div class="residual-badges">${badges.join(' ')}</div>` : ''}

      <div class="card-section">
        <h4>Projection Metrics</h4>
        <table class="prop-table">
          <tr><td>Current Coordinates</td><td><code>(${pos.rawX != null ? Number(pos.rawX).toFixed(2) : pos.x.toFixed(2)}, ${pos.rawY != null ? Number(pos.rawY).toFixed(2) : pos.y.toFixed(2)})</code></td></tr>
          <tr><td>Standard Position</td><td><code>(Col ${elem.stdCol}, Row ${elem.stdRow})</code></td></tr>
          <tr><td>Displacement from Baseline</td><td><strong>${disp ? disp.dist.toFixed(2) : '0.00'}</strong> grid units</td></tr>
          <tr><td>Sneath Atypicality Index</td><td>${res?.sneathAtypicality ? res.sneathAtypicality.toFixed(3) : (elem.sneathTypicality ? elem.sneathTypicality.toFixed(3) : '—')}</td></tr>
          <tr><td>Allahyari–Oganov Rank (USE)</td><td>${elem.mendeleevUSE || '—'} (scale: ${elem.chemicalScale != null ? elem.chemicalScale.toFixed(3) : '—'})</td></tr>
          <tr><td>Pettifor Chemical Scale</td><td>${elem.mendeleevPettifor || '—'}</td></tr>
        </table>
      </div>

      <div class="card-section">
        <h4>Physical & Chemical Properties</h4>
        <table class="prop-table">
          <tr><td>Standard Atomic Weight</td><td><strong>${elem.atomicMass}</strong> amu</td></tr>
          <tr><td>Electron Configuration</td><td><code>${elem.electronConfig}</code></td></tr>
          <tr><td>Pauling Electronegativity</td><td>${elem.electronegativity != null ? elem.electronegativity.toFixed(2) : '—'}</td></tr>
          <tr><td>Allred–Rochow Electronegativity</td><td>${elem.electronegativityAR != null ? elem.electronegativityAR.toFixed(2) : '—'}</td></tr>
          <tr><td>Atomic Radius (Slater)</td><td>${elem.atomicRadius ? elem.atomicRadius + ' pm' : '—'}</td></tr>
          <tr><td>1st Ionization Potential</td><td>${elem.ionizationEnergy1 ? elem.ionizationEnergy1 + ' kJ/mol' : '—'}</td></tr>
          <tr><td>1st Electron Affinity</td><td>${elem.electronAffinity != null ? elem.electronAffinity + ' kJ/mol' : '—'}</td></tr>
          <tr><td>Density at STP</td><td>${elem.density ? elem.density + ' g/cm³' : '—'}</td></tr>
          <tr><td>Melting Point / Boiling Point</td><td>${elem.meltingPoint ? elem.meltingPoint + ' K' : '—'} / ${elem.boilingPoint ? elem.boilingPoint + ' K' : '—'}</td></tr>
          <tr><td>Valence / Oxidation States</td><td>${elem.valence || '—'} / [${(elem.oxidationStates || []).join(', ')}]</td></tr>
          <tr><td>Standard Phase / Discovery</td><td>${elem.phase || '—'} / ${elem.discoveryYear < 0 ? Math.abs(elem.discoveryYear) + ' BCE' : elem.discoveryYear}</td></tr>
        </table>
      </div>
    `;
  }

  parseURLHash() {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    const params = new URLSearchParams(hash);

    const proj = params.get('proj');
    if (proj && LAYOUT_PRESETS.some(p => p.id === proj)) {
      this.currentPreset = proj;
    }

    const z = parseInt(params.get('z'), 10);
    if (!isNaN(z) && z >= 1 && z <= 118) {
      this.selectedElement = ELEMENTS.find(e => e.z === z) || null;
    }

    const color = params.get('color');
    if (color) this.colorMode = color;
  }

  updateURLHash() {
    const params = new URLSearchParams();
    params.set('proj', this.currentPreset);
    if (this.selectedElement) params.set('z', this.selectedElement.z);
    if (this.colorMode !== 'category') params.set('color', this.colorMode);
    window.history.replaceState(null, '', `#${params.toString()}`);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ElementProjectionsApp();
});
