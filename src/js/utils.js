// CONFIGURACIONES GLOBALES DE CULTIVOS
let CROPS = {
  wheat: { name: 'Trigo', cost: 5, duration: 3.0, yield: 30 },
  potato: { name: 'Patata', cost: 10, duration: 5.0, yield: 100 },
  carrot: { name: 'Zanahoria', cost: 20, duration: 10.0, yield: 300 }
};

// CACHÉ DE ELEMENTOS DEL DOM
let DOM = {};

function initDOMReferences() {
  DOM = {
    resGold: document.getElementById('res-gold'),
    resWood: document.getElementById('res-wood'),
    resStone: document.getElementById('res-stone'),
    resFood: document.getElementById('res-food'),
    resCooked: document.getElementById('res-cooked'),
    resColonists: document.getElementById('res-colonists'),
    resFreeColonists: document.getElementById('res-free-colonists'),

    rateGold: document.getElementById('rate-gold'),
    rateWood: document.getElementById('rate-wood'),
    rateStone: document.getElementById('rate-stone'),
    rateFood: document.getElementById('rate-food'),
    rateCooked: document.getElementById('rate-cooked'),

    allocWood: document.getElementById('alloc-wood'),
    allocStone: document.getElementById('alloc-stone'),
    allocBerries: document.getElementById('alloc-berries'),
    woodAutoInfo: document.getElementById('wood-auto-info'),
    stoneAutoInfo: document.getElementById('stone-auto-info'),
    berriesAutoInfo: document.getElementById('berries-auto-info'),

    countBasicHouses: document.getElementById('count-basic-houses'),
    btnBuildBasic: document.getElementById('btn-build-basic'),
    btnHireColonist: document.getElementById('btn-hire-colonist'),

    costBasicWood: document.getElementById('cost-basic-wood'),
    costBasicStone: document.getElementById('cost-basic-stone'),
    costHireGold: document.getElementById('cost-hire-gold'),

    btnBuildLumberMill: document.getElementById('btn-build-lumbermill'),
    btnBuildQuarry: document.getElementById('btn-build-quarry'),
    btnBuildMarket: document.getElementById('btn-build-market'),
    btnBuildBonfire: document.getElementById('btn-build-bonfire'),
    costBonfireWood: document.getElementById('cost-bonfire-wood'),
    costBonfireStone: document.getElementById('cost-bonfire-stone'),
    countBonfires: document.getElementById('count-bonfires'),

    autoSellFoodChk: document.getElementById('auto-sell-food-chk'),
    autoSellFoodMin: document.getElementById('auto-sell-food-min'),
    autoSellCookedChk: document.getElementById('auto-sell-cooked-chk'),
    autoSellCookedMin: document.getElementById('auto-sell-cooked-min'),
    autoSellWoodChk: document.getElementById('auto-sell-wood-chk'),
    autoSellWoodMin: document.getElementById('auto-sell-wood-min'),
    autoSellStoneChk: document.getElementById('auto-sell-stone-chk'),
    autoSellStoneMin: document.getElementById('auto-sell-stone-min'),

    btnSellFood: document.getElementById('btn-sell-food'),
    btnSellCooked: document.getElementById('btn-sell-cooked'),
    btnSellWood: document.getElementById('btn-sell-wood'),
    btnSellStone: document.getElementById('btn-sell-stone'),

    statsFreeColonists: document.getElementById('stats-free-colonists'),
    statsTotalColonists: document.getElementById('stats-total-colonists'),
    jobStatWood: document.getElementById('job-stat-wood'),
    jobStatStone: document.getElementById('job-stat-stone'),
    jobStatBerries: document.getElementById('job-stat-berries'),
    jobStatPlots: document.getElementById('job-stat-plots'),
    jobStatLumberMill: document.getElementById('job-stat-lumbermill'),
    jobStatQuarry: document.getElementById('job-stat-quarry'),
    jobStatBonfire: document.getElementById('job-stat-bonfire'),
    jobStatMarket: document.getElementById('job-stat-market')
  };
}

// SISTEMA DE BACKUP ZIP
async function createBackupZip(versionName) {
  const zip = new JSZip();

  // Añade index.html
  const indexRes = await fetch('index.html');
  zip.file('index.html', await indexRes.text());

  // Añade todos los archivos src/
  const srcFiles = [
    'src/css/styles.css',
    'src/js/utils.js',
    'src/js/data-loader.js',
    'src/js/gamestate.js',
    'src/js/gameloop.js',
    'src/js/buildings.js',
    'src/js/ui-render.js',
    'src/js/ui-events.js',
    'src/js/lib/jszip.min.js',
    'src/data/buildings.csv',
    'src/data/prices.csv',
    'src/data/production.csv',
    'src/data/timings.csv'
  ];
  for (const path of srcFiles) {
    try {
      const res = await fetch(path);
      if (res.ok) zip.file(path, await res.text());
    } catch { /* archivo no encontrado, saltar */ }
  }

  // Genera y descarga el ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aetheria_bkp_${versionName}.zip`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`💾 Backup "${versionName}" descargado`, 'success');
}
