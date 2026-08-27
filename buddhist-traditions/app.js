// Buddhist Traditions Visual Map — Application Logic
// Handles multi-view rendering (Tree, Cards Grid, Tech Compass, Pathways),
// dynamic filtering, search indexing, SVG lineage rendering, and detail modal.

(function () {
  'use strict';

  // Data Reference
  const DATA = window.BUDDHIST_DATA;
  if (!DATA) {
    console.error('BUDDHIST_DATA not loaded.');
    return;
  }

  // Application State
  const state = {
    currentView: 'tree', // 'tree', 'cards', 'tech', 'pathways'
    activeVehicle: 'all', // 'all', 'theravada', 'mahayana', 'vajrayana', 'modernist'
    activeRegion: 'all',
    activePractice: 'all',
    searchQuery: '',
    selectedTraditionId: null,
    theme: localStorage.getItem('buddhist_map_theme') || 'light'
  };

  // DOM Elements
  const elements = {
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    viewTabs: document.querySelectorAll('.view-tab'),
    viewContainers: {
      tree: document.getElementById('tree-view'),
      cards: document.getElementById('cards-view'),
      tech: document.getElementById('tech-view'),
      pathways: document.getElementById('pathways-view')
    },
    vehiclePillsContainer: document.getElementById('vehicle-pills'),
    searchInput: document.getElementById('search-input'),
    regionFilter: document.getElementById('region-filter'),
    practiceFilter: document.getElementById('practice-filter'),
    filterStats: document.getElementById('filter-stats'),

    // Drawer Elements
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    drawerBadges: document.getElementById('drawer-badges'),
    drawerTitle: document.getElementById('drawer-title'),
    drawerNative: document.getElementById('drawer-native'),
    drawerOverview: document.getElementById('drawer-overview'),
    drawerMetaTable: document.getElementById('drawer-meta-table'),
    drawerPhilosophy: document.getElementById('drawer-philosophy'),
    drawerPractices: document.getElementById('drawer-practices'),
    drawerLinks: document.getElementById('drawer-links'),
    drawerPrevBtn: document.getElementById('drawer-prev-btn'),
    drawerNextBtn: document.getElementById('drawer-next-btn')
  };

  // Initialize
  function init() {
    applyTheme(state.theme);
    populateFilterDropdowns();
    renderVehiclePills();
    renderAllViews();
    attachEventListeners();
    updateFilterStats();
  }

  // Theme Management
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('buddhist_map_theme', theme);
    const icon = elements.themeToggleBtn.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    elements.themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Use light theme' : 'Use dark theme');
    elements.themeToggleBtn.title = theme === 'dark' ? 'Use light theme' : 'Use dark theme';
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // Populate Dropdown Selects
  function populateFilterDropdowns() {
    // Unique Regions
    const regions = Array.from(new Set(DATA.traditions.map(t => t.region))).sort();
    regions.forEach(region => {
      const opt = document.createElement('option');
      opt.value = region;
      opt.textContent = region;
      elements.regionFilter.appendChild(opt);
    });

    // Unique Practice Types
    const practiceTypes = Array.from(new Set(DATA.traditions.map(t => t.practiceType))).sort();
    practiceTypes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      elements.practiceFilter.appendChild(opt);
    });
  }

  // Render Vehicle Header Hero Pills
  function renderVehiclePills() {
    elements.vehiclePillsContainer.innerHTML = '';

    // "All" Pill
    const allPill = document.createElement('div');
    allPill.className = `vehicle-pill ${state.activeVehicle === 'all' ? 'active' : ''}`;
    allPill.setAttribute('role', 'button');
    allPill.setAttribute('tabindex', '0');
    allPill.setAttribute('aria-pressed', String(state.activeVehicle === 'all'));
    allPill.style.setProperty('--pill-color', '#4b5563');
    allPill.style.setProperty('--pill-bg', 'var(--bg-secondary)');
    allPill.innerHTML = `
      <div class="vehicle-pill-header">
        <span class="vehicle-pill-name">All Traditions</span>
        <span class="vehicle-pill-count">${DATA.traditions.length}</span>
      </div>
      <div class="vehicle-pill-desc">Complete cross-lineage panoramic map across early, southern, eastern, northern, and global streams.</div>
    `;
    allPill.addEventListener('click', () => setVehicleFilter('all'));
    allPill.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setVehicleFilter('all');
      }
    });
    elements.vehiclePillsContainer.appendChild(allPill);

    // Vehicle Specific Pills
    DATA.vehicles.forEach(v => {
      const count = DATA.traditions.filter(t => t.stream === v.id || t.vehicle.toLowerCase().includes(v.id.substring(0, 5))).length;
      const pill = document.createElement('div');
      pill.className = `vehicle-pill ${state.activeVehicle === v.id ? 'active' : ''}`;
      pill.setAttribute('role', 'button');
      pill.setAttribute('tabindex', '0');
      pill.setAttribute('aria-pressed', String(state.activeVehicle === v.id));
      pill.style.setProperty('--pill-color', v.color);
      pill.style.setProperty('--pill-bg', v.bgLight);
      pill.innerHTML = `
        <div class="vehicle-pill-header">
          <span class="vehicle-pill-name">${v.name}</span>
          <span class="vehicle-pill-count">${count}</span>
        </div>
        <div class="vehicle-pill-desc">${v.description}</div>
      `;
      pill.addEventListener('click', () => setVehicleFilter(v.id));
      pill.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setVehicleFilter(v.id);
        }
      });
      elements.vehiclePillsContainer.appendChild(pill);
    });
  }

  function setVehicleFilter(vehicleId) {
    state.activeVehicle = vehicleId;
    renderVehiclePills();
    renderAllViews();
    updateFilterStats();
  }

  // Filter Pipeline
  function getFilteredTraditions() {
    return DATA.traditions.filter(t => {
      // Vehicle Filter
      if (state.activeVehicle !== 'all') {
        const matchesStream = t.stream === state.activeVehicle;
        const matchesVehicle = t.vehicle.toLowerCase().includes(state.activeVehicle.substring(0, 5));
        if (!matchesStream && !matchesVehicle) return false;
      }

      // Region Filter
      if (state.activeRegion !== 'all' && t.region !== state.activeRegion) {
        return false;
      }

      // Practice Type Filter
      if (state.activePractice !== 'all' && t.practiceType !== state.activePractice) {
        return false;
      }

      // Search Query
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase().trim();
        const searchable = [
          t.name,
          t.nativeName,
          t.transliteration,
          t.corePhilosophy,
          t.practiceType,
          t.soteriologicalGoal,
          t.founders.join(' '),
          t.keyTexts.join(' '),
          t.corePractices.join(' '),
          t.countries.join(' ')
        ].join(' ').toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }

  function updateFilterStats() {
    const filtered = getFilteredTraditions();
    elements.filterStats.textContent = `Showing ${filtered.length} of ${DATA.traditions.length} traditions`;
  }

  // Switch View Tab
  function switchView(viewName) {
    state.currentView = viewName;
    elements.viewTabs.forEach(tab => {
      const isActive = tab.dataset.view === viewName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    Object.keys(elements.viewContainers).forEach(key => {
      elements.viewContainers[key].style.display = key === viewName ? (key === 'cards' ? 'grid' : 'block') : 'none';
    });

    if (viewName === 'tree') {
      renderTreeView();
    }
  }

  // Render All Views
  function renderAllViews() {
    renderCardsView();
    renderTreeView();
    renderTechView();
    renderPathwaysView();
    switchView(state.currentView);
  }

  // Helper: Get Color for Tradition
  function getTraditionColor(t) {
    if (t.stream === 'theravada') return 'var(--color-theravada)';
    if (t.stream === 'mahayana') return 'var(--color-mahayana)';
    if (t.stream === 'vajrayana') return 'var(--color-vajrayana)';
    if (t.stream === 'modernist') return 'var(--color-modernist)';
    return 'var(--color-root)';
  }

  function getTraditionBgColor(t) {
    if (t.stream === 'theravada') return 'var(--color-theravada-bg)';
    if (t.stream === 'mahayana') return 'var(--color-mahayana-bg)';
    if (t.stream === 'vajrayana') return 'var(--color-vajrayana-bg)';
    if (t.stream === 'modernist') return 'var(--color-modernist-bg)';
    return 'var(--color-root-bg)';
  }

  // ========================================================
  // VIEW 1: Interactive Lineage Tree (SVG Graph)
  // ========================================================
  function renderTreeView() {
    const container = document.getElementById('tree-canvas-container');
    if (!container) return;

    // Node positioning layout calculation
    const filteredTraditions = getFilteredTraditions();
    const filteredIds = new Set(filteredTraditions.map(t => t.id));

    // Custom layout coordinates for clear visual hierarchy
    const layoutCoords = {
      // Level 0: Roots (Top Center)
      'early-buddhism': { x: 700, y: 60 },

      // Level 1: Major Stream Foundations
      'classical-theravada': { x: 260, y: 190 },
      'early-mahayana': { x: 740, y: 190 },
      'tibetan-nyingma': { x: 1180, y: 190 },

      // Level 2: Southern Theravada Tree (Left)
      'sri-lanka-nikayas': { x: 120, y: 320 },
      'thai-forest': { x: 300, y: 320 },
      'thai-dhammayuttika': { x: 440, y: 320 },
      'cambodian-lao-theravada': { x: 160, y: 440 },
      'esoteric-theravada': { x: 340, y: 440 },
      'burmese-vipassana-mahasi': { x: 110, y: 560 },
      'burmese-vipassana-goenka': { x: 260, y: 560 },
      'burmese-pa-auk': { x: 390, y: 560 },
      'burmese-weizza': { x: 500, y: 440 },

      // Level 2 & 3: Eastern Mahayana Tree (Center)
      'chinese-chan-linji': { x: 620, y: 320 },
      'chinese-chan-caodong': { x: 760, y: 320 },
      'chinese-pure-land': { x: 900, y: 320 },
      'tiantai-tendai': { x: 1040, y: 320 },
      'huayan-kegon': { x: 900, y: 220 },
      'korean-seon-jogye': { x: 620, y: 440 },
      'vietnamese-thien': { x: 750, y: 440 },
      'japanese-soto': { x: 670, y: 560 },
      'japanese-rinzai': { x: 550, y: 560 },
      'japanese-obaku': { x: 560, y: 670 },
      'japanese-pure-land-jodo': { x: 880, y: 440 },
      'japanese-jodo-shinshu': { x: 880, y: 560 },
      'japanese-ji-shu': { x: 990, y: 560 },
      'nichiren-shoshu-sgi': { x: 1070, y: 440 },
      'humanistic-buddhism': { x: 780, y: 670 },

      // Level 2 & 3: Northern Vajrayana Tree (Right)
      'tibetan-kagyu': { x: 1180, y: 320 },
      'tibetan-sakya': { x: 1320, y: 320 },
      'tibetan-gelug': { x: 1320, y: 440 },
      'tibetan-jonang': { x: 1180, y: 440 },
      'tibetan-bon': { x: 1060, y: 220 },
      'newar-buddhism': { x: 1320, y: 220 },
      'japanese-shingon': { x: 1040, y: 560 },
      'japanese-shugendo': { x: 1040, y: 670 },
      'mongolian-buddhism': { x: 1320, y: 560 },

      // Level 4: Modernist / Global Transmissions (Bottom)
      'buddhist-modernism': { x: 260, y: 700 },
      'western-insight': { x: 140, y: 810 },
      'western-zen': { x: 670, y: 810 },
      'secular-buddhism': { x: 260, y: 920 },
      'navayana-ambedkarite': { x: 440, y: 810 },
      'socially-engaged-buddhism': { x: 880, y: 810 }
    };

    let svgHtml = `
      <svg class="tree-svg" viewBox="0 0 1440 1020" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="tree-map-title tree-map-desc">
        <title id="tree-map-title">Historical and doctrinal lineages across 43 Buddhist traditions</title>
        <desc id="tree-map-desc">A top-to-bottom relation map from early Buddhist roots through regional schools to modern global traditions.</desc>
        <defs>
          <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1" />
          </filter>
          <filter id="node-shadow-strong" x="-18%" y="-28%" width="136%" height="156%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.24" />
          </filter>
        </defs>
        <g aria-hidden="true">
          <text class="tree-map-label" x="18" y="30">FOUNDATIONS</text>
          <line class="tree-map-rule" x1="18" y1="125" x2="1422" y2="125" />
          <text class="tree-map-label" x="18" y="150">EARLY REGIONAL STREAMS</text>
          <line class="tree-map-rule" x1="18" y1="255" x2="1422" y2="255" />
          <text class="tree-map-label" x="18" y="280">SCHOOLS AND ORDERS</text>
          <line class="tree-map-rule" x1="18" y1="625" x2="1422" y2="625" />
          <text class="tree-map-label" x="18" y="650">LATER TRANSMISSIONS</text>
          <line class="tree-map-rule" x1="18" y1="755" x2="1422" y2="755" />
          <text class="tree-map-label" x="18" y="780">MODERN AND GLOBAL FORMATIONS</text>
        </g>
        <g class="tree-links-group">
    `;

    // Render connection paths
    DATA.linksData.forEach(link => {
      const src = layoutCoords[link.source];
      const tgt = layoutCoords[link.target];
      if (!src || !tgt) return;

      const isFiltered = filteredIds.has(link.source) && filteredIds.has(link.target);
      const strokeClass = isFiltered ? 'tree-link highlight' : 'tree-link';
      const targetTradition = DATA.traditions.find(t => t.id === link.target);
      const strokeColor = isFiltered && targetTradition ? getTraditionColor(targetTradition) : 'var(--border-color)';
      const opacity = isFiltered ? 1 : 0.25;

      // Smooth vertical cubic bezier curve
      const pathD = `M ${src.x} ${src.y + 18} C ${src.x} ${(src.y + tgt.y) / 2}, ${tgt.x} ${(src.y + tgt.y) / 2}, ${tgt.x} ${tgt.y - 18}`;
      svgHtml += `<path class="${strokeClass}" d="${pathD}" stroke="${strokeColor}" opacity="${opacity}" />`;
    });

    svgHtml += `</g><g class="tree-nodes-group">`;

    // Render Nodes
    DATA.traditions.forEach(t => {
      const pos = layoutCoords[t.id];
      if (!pos) return;

      const isVisible = filteredIds.has(t.id);
      const nodeColor = getTraditionColor(t);
      const nodeBg = getTraditionBgColor(t);
      const nodeOpacity = isVisible ? 1 : 0.22;
      const nodeWidth = 160;
      const nodeHeight = 44;

      svgHtml += `
        <g class="tree-node-group" data-id="${t.id}" transform="translate(${pos.x - nodeWidth / 2}, ${pos.y - nodeHeight / 2})" opacity="${nodeOpacity}" role="button" tabindex="0" aria-label="Open ${t.name}">
          <title>${t.name} — ${t.period}; ${t.countries.join(', ')}</title>
          <rect width="${nodeWidth}" height="${nodeHeight}" rx="8" fill="${nodeBg}" stroke="${nodeColor}" stroke-width="1.8" filter="url(#node-shadow)"/>
          <text x="12" y="20" font-family="var(--font-sans)" font-size="11" font-weight="700" fill="var(--text-primary)">
            ${truncateText(t.name, 20)}
          </text>
          <text x="12" y="34" font-family="var(--font-sans)" font-size="9.5" fill="var(--text-muted)">
            ${truncateText(t.countries[0] + ' • ' + t.vehicle, 24)}
          </text>
          <circle cx="${nodeWidth - 14}" cy="${nodeHeight / 2}" r="4" fill="${nodeColor}"/>
        </g>
      `;
    });

    svgHtml += `</g></svg>`;
    container.innerHTML = svgHtml;

    // Attach click handlers to nodes
    container.querySelectorAll('.tree-node-group').forEach(node => {
      node.addEventListener('click', () => {
        const id = node.dataset.id;
        if (id) openDrawer(id);
      });
      node.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = node.dataset.id;
          if (id) openDrawer(id);
        }
      });
    });
  }

  function truncateText(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max - 1) + '…' : str;
  }

  // ========================================================
  // VIEW 2: Taxonomy Cards Grid
  // ========================================================
  function renderCardsView() {
    const container = elements.viewContainers.cards;
    container.innerHTML = '';

    const filtered = getFilteredTraditions();
    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <h3>No traditions match your filters</h3>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try adjusting your search query, vehicle, or practice filters.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(t => {
      const card = document.createElement('div');
      card.className = 'tradition-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Open ${t.name}`);
      const color = getTraditionColor(t);
      const bg = getTraditionBgColor(t);
      card.style.setProperty('--card-accent', color);

      card.innerHTML = `
        <div class="card-top">
          <div class="card-badges">
            <span class="badge badge-vehicle" style="--badge-bg: ${bg}; --badge-color: ${color}; --badge-border: ${color};">${t.vehicle}</span>
            <span class="badge badge-region">${t.region}</span>
          </div>
          <h3 class="card-title">${t.name}</h3>
          <div class="card-native">
            <span>${t.nativeName}</span>
            <span>•</span>
            <span><em>${t.transliteration}</em></span>
          </div>
          <div class="card-meta">
            <span class="card-meta-label">Founders:</span>
            <span class="card-meta-value">${t.founders[0]}</span>
            <span class="card-meta-label">Founding Era:</span>
            <span class="card-meta-value">${t.period}</span>
            <span class="card-meta-label">Geography:</span>
            <span class="card-meta-value">${t.countries.slice(0, 3).join(', ')}</span>
          </div>
          <p class="card-desc">${t.corePhilosophy}</p>
        </div>
        <div class="card-footer">
          <span class="practice-pill" title="${t.practiceType}">${t.practiceType}</span>
          <span class="card-link-arrow">Inspect Details →</span>
        </div>
      `;

      card.addEventListener('click', () => openDrawer(t.id));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDrawer(t.id);
        }
      });
      container.appendChild(card);
    });
  }

  // ========================================================
  // VIEW 3: Meditative Technology Compass
  // ========================================================
  function renderTechView() {
    const container = elements.viewContainers.tech;
    container.innerHTML = `
      <div class="tree-toolbar">
        <div class="tree-heading">
          <div class="section-kicker">View 03 · Practice</div>
          <h2 class="tree-title">Contemplative practice matrix</h2>
          <p class="tree-caption">Eight recurring practice mechanisms, with traditions grouped by their primary emphasis.</p>
        </div>
      </div>
      <div class="tech-grid" id="tech-grid-container"></div>
    `;

    const gridContainer = document.getElementById('tech-grid-container');

    const techCategories = [
      {
        id: 'absorption',
        name: 'Single-Pointed Absorption (Śamatha & Jhāna)',
        icon: '🧘',
        desc: 'Concentrating attention on breath, kasiṇas, or mantras to suppress the five hindrances and enter the 8 absorptions.',
        matches: ['early-buddhism', 'classical-theravada', 'burmese-pa-auk', 'thai-dhammayuttika']
      },
      {
        id: 'noting',
        name: 'Dry Insight & Momentary Noting (Vipassanā)',
        icon: '👁️',
        desc: 'Deconstructing experience in real-time into impermanence, unsatisfactoriness, and non-self without prior absorption.',
        matches: ['burmese-vipassana-mahasi', 'burmese-vipassana-goenka', 'western-insight']
      },
      {
        id: 'nondual',
        name: 'Objectless & Non-Dual Awareness',
        icon: '⭕',
        desc: 'Resting effortlessly in the innate, uncreated baseline awareness of Buddha-Nature / Rigpa / Sahaja.',
        matches: ['japanese-soto', 'chinese-chan-caodong', 'tibetan-nyingma', 'tibetan-kagyu']
      },
      {
        id: 'inquiry',
        name: 'Ante-Rational Inquiry & Kōan Shock',
        icon: '⚡',
        desc: 'Using paradoxical encounters, shouts, strikes, and Hwadu questions to short-circuit conceptual dualism.',
        matches: ['chinese-chan-linji', 'japanese-rinzai', 'korean-seon-jogye']
      },
      {
        id: 'devotional',
        name: 'Other-Power & Devotional Recitation',
        icon: '📿',
        desc: 'Total reliance on Amida Buddha or the Lotus Sūtra through repetitive vocalization (Nembutsu, Daimoku).',
        matches: ['chinese-pure-land', 'japanese-pure-land-jodo', 'japanese-jodo-shinshu', 'japanese-ji-shu', 'nichiren-shoshu-sgi']
      },
      {
        id: 'tantric',
        name: 'Tantric Deity Yoga & Subtle Energetics',
        icon: '✨',
        desc: 'Transforming mind and body through mandala visualization, deity identification, mantras, and prāṇa/nāḍī manipulation.',
        matches: ['japanese-shingon', 'tibetan-sakya', 'tibetan-gelug', 'tibetan-jonang', 'newar-buddhism']
      },
      {
        id: 'ascetic',
        name: 'Wilderness Asceticism & Mountain Austerities',
        icon: '🌲',
        desc: 'Direct forest dwelling, Dhutaṅga rules, waterfall purifications, and enduring natural hardships.',
        matches: ['thai-forest', 'japanese-shugendo', 'tibetan-bon']
      },
      {
        id: 'engaged',
        name: 'Emancipatory Action & Clinical Mindfulness',
        icon: '🤝',
        desc: 'Applying mindfulness to structural oppression (Navayāna), peace activism, and clinical stress reduction (MBSR).',
        matches: ['navayana-ambedkarite', 'socially-engaged-buddhism', 'humanistic-buddhism', 'secular-buddhism', 'vietnamese-thien']
      }
    ];

    techCategories.forEach(cat => {
      const col = document.createElement('div');
      col.className = 'tech-column';

      let itemsHtml = '';
      cat.matches.forEach(tid => {
        const t = DATA.traditions.find(item => item.id === tid);
        if (t) {
          const color = getTraditionColor(t);
          itemsHtml += `
            <div class="tech-tradition-item" data-id="${t.id}" style="--item-color: ${color}">
              <div class="tech-item-title">${t.name}</div>
              <div class="tech-item-sub">${t.countries[0]} • ${t.vehicle}</div>
            </div>
          `;
        }
      });

      col.innerHTML = `
        <div class="tech-header">
          <span class="tech-icon">${cat.icon}</span>
          <span class="tech-name">${cat.name}</span>
        </div>
        <p class="tech-desc">${cat.desc}</p>
        <div class="tech-traditions-list">${itemsHtml}</div>
      `;

      col.querySelectorAll('.tech-tradition-item').forEach(item => {
        item.addEventListener('click', () => openDrawer(item.dataset.id));
      });

      gridContainer.appendChild(col);
    });
  }

  // ========================================================
  // VIEW 4: Geographic & Historical Pathways
  // ========================================================
  function renderPathwaysView() {
    const container = elements.viewContainers.pathways;
    container.innerHTML = '';

    const pathways = [
      {
        title: 'Southern Pathway: The Pāli Theravāda Arc',
        color: 'var(--color-theravada)',
        route: 'Ancient Magadha (3rd c. BCE) → Anuradhapura (Sri Lanka) → Bagan (Burma) → Ayutthaya/Siam → Angkor (Cambodia) → Lan Xang (Laos) → Global West',
        stream: 'theravada',
        traditions: ['early-buddhism', 'classical-theravada', 'sri-lanka-nikayas', 'burmese-vipassana-mahasi', 'thai-forest', 'cambodian-lao-theravada', 'western-insight']
      },
      {
        title: 'Eastern Pathway: The Silk Road & Sinosphere Transmission',
        color: 'var(--color-mahayana)',
        route: 'Nālandā/Gandhāra (1st c. CE) → Chang\'an/Luoyang (Tang China) → Silla/Goryeo (Korea) → Nara/Kamakura (Japan) → Vietnam → Modern Taiwan & West',
        stream: 'mahayana',
        traditions: ['early-mahayana', 'tiantai-tendai', 'chinese-chan-linji', 'chinese-pure-land', 'korean-seon-jogye', 'japanese-soto', 'japanese-jodo-shinshu', 'nichiren-shoshu-sgi', 'humanistic-buddhism', 'western-zen']
      },
      {
        title: 'Northern Pathway: Himalayan & Central Asian Tantra',
        color: 'var(--color-vajrayana)',
        route: 'Vikramashīla/Kashmir (8th c. CE) → Samye (Imperial Tibet) → Sakya/Lhasa → Bhutan → Karakorum (Mongolia) → Buryatia/Kalmykia (Russia)',
        stream: 'vajrayana',
        traditions: ['tibetan-nyingma', 'newar-buddhism', 'tibetan-kagyu', 'tibetan-sakya', 'tibetan-gelug', 'tibetan-jonang', 'mongolian-buddhism']
      },
      {
        title: 'Modernist & Emancipatory Global Adaptations',
        color: 'var(--color-modernist)',
        route: 'Colonial Ceylon/Japan (Late 19th c.) → Nagpur India (1956) → Plum Village France → UMass Medical School (1979) → Global Transnational Networks',
        stream: 'modernist',
        traditions: ['buddhist-modernism', 'navayana-ambedkarite', 'vietnamese-thien', 'secular-buddhism', 'socially-engaged-buddhism']
      }
    ];

    pathways.forEach(p => {
      const section = document.createElement('div');
      section.className = 'pathway-stream';
      section.style.setProperty('--stream-color', p.color);

      let cardsHtml = '';
      p.traditions.forEach(tid => {
        const t = DATA.traditions.find(item => item.id === tid);
        if (t) {
          cardsHtml += `
            <div class="timeline-card" data-id="${t.id}">
              <div class="timeline-era">${t.period}</div>
              <h4 class="timeline-name">${t.name}</h4>
              <div class="timeline-desc">${truncateText(t.corePhilosophy, 110)}</div>
            </div>
          `;
        }
      });

      section.innerHTML = `
        <div class="pathway-header">
          <h3 class="pathway-title">${p.title}</h3>
          <div class="pathway-route">${p.route}</div>
        </div>
        <div class="pathway-timeline">${cardsHtml}</div>
      `;

      section.querySelectorAll('.timeline-card').forEach(card => {
        card.addEventListener('click', () => openDrawer(card.dataset.id));
      });

      container.appendChild(section);
    });
  }

  // ========================================================
  // Detail Slide-over Drawer Modal
  // ========================================================
  function openDrawer(traditionId) {
    const t = DATA.traditions.find(item => item.id === traditionId);
    if (!t) return;

    state.selectedTraditionId = traditionId;
    const color = getTraditionColor(t);
    const bg = getTraditionBgColor(t);

    // Badges
    elements.drawerBadges.innerHTML = `
      <span class="badge badge-vehicle" style="--badge-bg: ${bg}; --badge-color: ${color}; --badge-border: ${color};">${t.vehicle}</span>
      <span class="badge badge-region">${t.region}</span>
    `;

    // Title & Native
    elements.drawerTitle.textContent = t.name;
    elements.drawerNative.innerHTML = `
      <span style="font-weight: 600;">${t.nativeName}</span>
      <span>•</span>
      <span><em>${t.transliteration}</em></span>
    `;

    // Overview Description
    elements.drawerOverview.textContent = t.description;

    // Metadata Table
    elements.drawerMetaTable.innerHTML = `
      <div class="drawer-meta-label">Founding Period:</div>
      <div class="drawer-meta-val">${t.period}</div>

      <div class="drawer-meta-label">Foundational Masters:</div>
      <div class="drawer-meta-val">${t.founders.join(', ')}</div>

      <div class="drawer-meta-label">Primary Geography:</div>
      <div class="drawer-meta-val">${t.countries.join(', ')}</div>

      <div class="drawer-meta-label">Canonical Languages:</div>
      <div class="drawer-meta-val">${t.canonicalLanguages.join(', ')}</div>

      <div class="drawer-meta-label">Key Texts & Sūtras:</div>
      <div class="drawer-meta-val">${t.keyTexts.join(', ')}</div>

      <div class="drawer-meta-label">Institutional Structure:</div>
      <div class="drawer-meta-val">${t.institutionalForm}</div>

      <div class="drawer-meta-label">Soteriological Goal:</div>
      <div class="drawer-meta-val" style="color: ${color}; font-weight: 600;">${t.soteriologicalGoal}</div>
    `;

    // Core Philosophy
    elements.drawerPhilosophy.textContent = t.corePhilosophy;

    // Core Practices
    elements.drawerPractices.innerHTML = t.corePractices.map(p => `
      <div class="practice-item">${p}</div>
    `).join('');

    // Outbound Links
    elements.drawerLinks.innerHTML = t.links.map(link => `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="outbound-link-btn">
        <span>${link.title}</span>
        <span class="outbound-tag">${link.type} ↗</span>
      </a>
    `).join('');

    // Open Drawer
    elements.drawerBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    elements.drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    state.selectedTraditionId = null;
  }

  function navigateDrawer(direction) {
    if (!state.selectedTraditionId) return;
    const currentIdx = DATA.traditions.findIndex(t => t.id === state.selectedTraditionId);
    if (currentIdx === -1) return;

    let nextIdx = currentIdx + direction;
    if (nextIdx < 0) nextIdx = DATA.traditions.length - 1;
    if (nextIdx >= DATA.traditions.length) nextIdx = 0;

    openDrawer(DATA.traditions[nextIdx].id);
  }

  // ========================================================
  // Event Listeners
  // ========================================================
  function attachEventListeners() {
    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // View tab switching
    elements.viewTabs.forEach(tab => {
      tab.addEventListener('click', () => switchView(tab.dataset.view));
    });

    // Search bar
    elements.searchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      renderAllViews();
      updateFilterStats();
    });

    // Dropdowns
    elements.regionFilter.addEventListener('change', e => {
      state.activeRegion = e.target.value;
      renderAllViews();
      updateFilterStats();
    });

    elements.practiceFilter.addEventListener('change', e => {
      state.activePractice = e.target.value;
      renderAllViews();
      updateFilterStats();
    });

    // Drawer close events
    elements.drawerCloseBtn.addEventListener('click', closeDrawer);
    elements.drawerBackdrop.addEventListener('click', e => {
      if (e.target === elements.drawerBackdrop) closeDrawer();
    });

    elements.drawerPrevBtn.addEventListener('click', () => navigateDrawer(-1));
    elements.drawerNextBtn.addEventListener('click', () => navigateDrawer(1));

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && elements.drawerBackdrop.classList.contains('open')) {
        closeDrawer();
      }
      if (elements.drawerBackdrop.classList.contains('open')) {
        if (e.key === 'ArrowLeft') navigateDrawer(-1);
        if (e.key === 'ArrowRight') navigateDrawer(1);
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
