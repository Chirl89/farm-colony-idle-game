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
    resWheat: document.getElementById('res-wheat'),
    resPotato: document.getElementById('res-potato'),
    resCarrot: document.getElementById('res-carrot'),
    resBerries: document.getElementById('res-berries'),

    rateGold: document.getElementById('rate-gold'),
    rateWood: document.getElementById('rate-wood'),
    rateStone: document.getElementById('rate-stone'),
    rateFood: document.getElementById('rate-food'),
    rateCooked: document.getElementById('rate-cooked'),
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

    btnBuildGranary: document.getElementById('btn-build-granary'),
    costGranaryWood: document.getElementById('cost-granary-wood'),
    costGranaryStone: document.getElementById('cost-granary-stone'),
    countGranaries: document.getElementById('count-granaries'),

    statsFreeColonists: document.getElementById('stats-free-colonists'),
    statsTotalColonists: document.getElementById('stats-total-colonists'),
    jobStatWood: document.getElementById('job-stat-wood'),
    jobStatStone: document.getElementById('job-stat-stone'),
    jobStatBerries: document.getElementById('job-stat-berries'),
    jobStatPlots: document.getElementById('job-stat-plots'),
    jobStatLumberMill: document.getElementById('job-stat-lumbermill'),
    jobStatQuarry: document.getElementById('job-stat-quarry'),
    jobStatBonfire: document.getElementById('job-stat-bonfire'),
    jobStatMarket: document.getElementById('job-stat-market'),
    jobStatGranary: document.getElementById('job-stat-granary')
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
    'src/data/timings.csv',
    'src/data/equivalences.csv'
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

function getFarmCycleTotal(crop) {
  const plowDur = (CONFIG.Timing && CONFIG.Timing.farm_plow) ? CONFIG.Timing.farm_plow.duration : 0.5;
  const sowDur = (CONFIG.Timing && CONFIG.Timing.farm_sow) ? CONFIG.Timing.farm_sow.duration : 0.5;
  const waterDur = (CONFIG.Timing && CONFIG.Timing.farm_water) ? CONFIG.Timing.farm_water.duration : 0.25;
  const growDur = crop ? (crop.duration / 2) : 1.5;
  const waterDailyDur = (CONFIG.Timing && CONFIG.Timing.farm_water_daily) ? CONFIG.Timing.farm_water_daily.duration : 0.0417;
  const dayDuration = (CONFIG.Timing && CONFIG.Timing.day_duration) ? CONFIG.Timing.day_duration.duration : 100.0;

  const totalGrowth = growDur * 2;
  const expectedWateringsPerStage = Math.ceil(growDur / dayDuration);
  const totalWaterings = expectedWateringsPerStage * 2;
  return plowDur + sowDur + 2 * waterDur + totalGrowth + totalWaterings * waterDailyDur;
}

function getFarmCycleElapsed(farm, crop) {
  const plowDur = (CONFIG.Timing && CONFIG.Timing.farm_plow) ? CONFIG.Timing.farm_plow.duration : 0.5;
  const sowDur = (CONFIG.Timing && CONFIG.Timing.farm_sow) ? CONFIG.Timing.farm_sow.duration : 0.5;
  const waterDur = (CONFIG.Timing && CONFIG.Timing.farm_water) ? CONFIG.Timing.farm_water.duration : 0.25;
  const growDur = crop ? (crop.duration / 2) : 1.5;
  const waterDailyDur = (CONFIG.Timing && CONFIG.Timing.farm_water_daily) ? CONFIG.Timing.farm_water_daily.duration : 0.0417;
  const dayDuration = (CONFIG.Timing && CONFIG.Timing.day_duration) ? CONFIG.Timing.day_duration.duration : 100.0;

  const expectedWaterings = Math.ceil(growDur / dayDuration);

  const t0 = 0;
  const t1 = plowDur;
  const t2 = t1 + sowDur;
  const t3 = t2 + waterDur;
  const t4 = t3 + growDur + expectedWaterings * waterDailyDur;
  const t5 = t4 + waterDur;
  const t6 = t5 + growDur + expectedWaterings * waterDailyDur;

  if (farm.stage === 'idle') return 0;

  let startVal = 0;
  let endVal = 0;
  let localPct = 0;

  if (farm.stage === 'plow') {
    startVal = t0;
    endVal = t1;
    localPct = Math.min(1, farm.stageElapsed / plowDur);
  } else if (farm.stage === 'sow') {
    startVal = t1;
    endVal = t2;
    localPct = Math.min(1, farm.stageElapsed / sowDur);
  } else if (farm.stage === 'water') {
    startVal = t2;
    endVal = t3;
    localPct = Math.min(1, farm.stageElapsed / waterDur);
  } else if (farm.stage === 'grow') {
    startVal = t3;
    endVal = t4;
    const stageExpected = growDur + expectedWaterings * waterDailyDur;
    const stageElapsedTotal = farm.stageElapsed + (farm.wateringsCompleted || 0) * waterDailyDur + (farm.needsWatering ? farm.waterElapsed : 0);
    localPct = stageExpected > 0 ? Math.min(1, stageElapsedTotal / stageExpected) : 1;
    if (farm.stageElapsed >= growDur && !farm.needsWatering) {
      localPct = 1;
    }
  } else if (farm.stage === 'water2') {
    startVal = t4;
    endVal = t5;
    localPct = Math.min(1, farm.stageElapsed / waterDur);
  } else if (farm.stage === 'grow2') {
    startVal = t5;
    endVal = t6;
    const wateringsInGrow2 = Math.max(0, (farm.wateringsCompleted || 0) - expectedWaterings);
    const stageExpected = growDur + expectedWaterings * waterDailyDur;
    const stageElapsedTotal = farm.stageElapsed + wateringsInGrow2 * waterDailyDur + (farm.needsWatering ? farm.waterElapsed : 0);
    localPct = stageExpected > 0 ? Math.min(1, stageElapsedTotal / stageExpected) : 1;
    if (farm.stageElapsed >= growDur && !farm.needsWatering) {
      localPct = 1;
    }
  }

  return startVal + localPct * (endVal - startVal);
}

// GESTIÓN GENÉRICA DE INVENTARIO (SOPORTA SEMILLAS Y RECURSOS ESTÁNDAR)
function getResourceStock(key) {
  if (key.endsWith('_seeds')) {
    const crop = key.replace('_seeds', '');
    return state.seeds ? (state.seeds[crop] || 0) : 0;
  }
  return state[key] || 0;
}

function deductResourceStock(key, amount) {
  if (key.endsWith('_seeds')) {
    const crop = key.replace('_seeds', '');
    if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
    state.seeds[crop] = Math.max(0, (state.seeds[crop] || 0) - amount);
  } else {
    state[key] = Math.max(0, (state[key] || 0) - amount);
  }
}

function addResourceStock(key, amount) {
  if (typeof window.lastFullToastTime === 'undefined') {
    window.lastFullToastTime = { wood: 0, stone: 0, food: 0, seeds: 0 };
  }

  let storageType = null;
  let currentVal = 0;
  let isSeed = false;
  let seedType = null;
  let storageName = '';

  if (key === 'wood') {
    storageType = 'wood';
    currentVal = state.wood || 0;
    storageName = 'Madera';
  } else if (key === 'stone') {
    storageType = 'stone';
    currentVal = state.stone || 0;
    storageName = 'Piedra';
  } else if (['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'].includes(key)) {
    storageType = 'food';
    const foodKeys = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
    currentVal = foodKeys.reduce((sum, k) => sum + (state[k] || 0), 0);
    storageName = 'Alimentos';
  } else if (key.endsWith('_seeds')) {
    storageType = 'seeds';
    seedType = key.replace('_seeds', '');
    const seedKeys = ['wheat', 'potato', 'carrot'];
    currentVal = state.seeds ? seedKeys.reduce((sum, k) => sum + (state.seeds[k] || 0), 0) : 0;
    isSeed = true;
    storageName = 'Semillas';
  }

  // Si no está en el mapa, se añade directamente (como gold o reputation)
  if (!storageType) {
    state[key] = (state[key] || 0) + amount;
    return amount;
  }

  // Obtener capacidad
  const cap = (state.storageCapacity && state.storageCapacity[storageType]) ?? Infinity;
  const toAdd = Math.min(amount, Math.max(0, cap - currentVal));

  if (toAdd < amount && amount > 0) {
    // Almacén lleno o parcialmente lleno
    if (toAdd > 0) {
      if (isSeed) {
        if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
        state.seeds[seedType] = (state.seeds[seedType] || 0) + toAdd;
      } else {
        state[key] = (state[key] || 0) + toAdd;
      }
    }
    
    // Alerta "Almacén lleno" con throttle (máx una cada 15 segundos por tipo)
    const now = Date.now();
    if (now - (window.lastFullToastTime[storageType] || 0) > 15000) {
      if (typeof showToast === 'function') {
        showToast(`⚠️ ¡Almacén de ${storageName} lleno!`, 'warning');
      }
      window.lastFullToastTime[storageType] = now;
    }
    return toAdd;
  } else {
    // Cabe todo o es un decremento
    if (isSeed) {
      if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
      state.seeds[seedType] = (state.seeds[seedType] || 0) + amount;
    } else {
      state[key] = (state[key] || 0) + amount;
    }
    return amount;
  }
}

// FUNCIONES DE LEVELLING Y XP GLOBAL
function getXPJobKey(job) {
  if (!job) return null;
  if (job === 'wood') return 'wood';
  if (job.startsWith('lumbermills_')) {
    const idx = parseInt(job.split('_')[1]);
    const tier = (typeof state !== 'undefined' && state.lumberMills && state.lumberMills[idx]) ? (state.lumberMills[idx].tier || 1) : 1;
    return `lumbermill_t${tier}`;
  }
  if (job === 'stone') return 'stone';
  if (job.startsWith('quarries_')) {
    const idx = parseInt(job.split('_')[1]);
    const tier = (typeof state !== 'undefined' && state.quarries && state.quarries[idx]) ? (state.quarries[idx].tier || 1) : 1;
    return `quarry_t${tier}`;
  }
  if (job === 'berries') return 'berries';
  if (job.startsWith('farms_')) {
    const idx = parseInt(job.split('_')[1]);
    const tier = (typeof state !== 'undefined' && state.farms && state.farms[idx]) ? (state.farms[idx].tier || 1) : 1;
    return `farm_t${tier}`;
  }
  if (job.startsWith('granaries_')) {
    const idx = parseInt(job.split('_')[1]);
    const tier = (typeof state !== 'undefined' && state.granaries && state.granaries[idx]) ? (state.granaries[idx].tier || 1) : 1;
    return `granary_t${tier}`;
  }
  if (job.startsWith('bonfires_')) {
    const idx = parseInt(job.split('_')[1]);
    const tier = (typeof state !== 'undefined' && state.bonfires && state.bonfires[idx]) ? (state.bonfires[idx].tier || 1) : 1;
    return `bonfire_t${tier}`;
  }
  if (job.startsWith('markets_')) {
    const idx = parseInt(job.split('_')[1]);
    const tier = (typeof state !== 'undefined' && state.markets && state.markets[idx]) ? (state.markets[idx].tier || 1) : 1;
    return `market_t${tier}`;
  }
  if (job === 'construction') return 'construction';
  return null;
}

function getXPThreshold(attr, currentLvl) {
  // 1. Specific key like woodcutting_t1 in CONFIG.AttributeXP (legacy/default config)
  const specKey = `${attr}_t${currentLvl}`;
  if (typeof CONFIG !== 'undefined' && CONFIG.AttributeXP && CONFIG.AttributeXP[specKey]) {
    return CONFIG.AttributeXP[specKey].yield;
  }
  // 2. Universal key like "1" in CONFIG.XPCurve or CONFIG.AttributeXP (server config)
  if (typeof CONFIG !== 'undefined') {
    const universalCurve = CONFIG.XPCurve || CONFIG.AttributeXP;
    if (universalCurve) {
      const entry = universalCurve[currentLvl] || universalCurve[String(currentLvl)];
      if (entry) {
        return typeof entry.yield !== 'undefined' ? entry.yield : (typeof entry.value !== 'undefined' ? entry.value : 10 * Math.pow(2, currentLvl - 1));
      }
    }
  }
  // 3. Fallback to formula
  return 10 * Math.pow(2, currentLvl - 1);
}

function getXPJobYield(job) {
  const key = getXPJobKey(job);
  if (key && typeof CONFIG !== 'undefined' && CONFIG.XPYield && CONFIG.XPYield[key]) {
    return CONFIG.XPYield[key].yield;
  }
  // Fallbacks si no esta en el config
  if (job === 'wood' || job === 'stone') return 0.5;
  if (job === 'berries') return 0.8;
  if (job === 'construction') return 1.2;
  // Para edificios
  return 1.0;
}

// Calcular la eficiencia individual de un colono (Falta de casa -40%, Falta de comida -45%, Ambas -85%)
function getColonistEfficiency(c) {
  if (!c) return 1.0;
  
  let noHousePenalty = 0.40;
  let noFoodPenalty = 0.45;
  
  if (typeof CONFIG !== 'undefined') {
    const effGroup = CONFIG.Efficiency || CONFIG.EfficiencyPenalty;
    if (effGroup) {
      if (effGroup.no_house) {
        noHousePenalty = (effGroup.no_house.value !== undefined) ? effGroup.no_house.value : effGroup.no_house.yield;
      }
      if (effGroup.no_food) {
        noFoodPenalty = (effGroup.no_food.value !== undefined) ? effGroup.no_food.value : effGroup.no_food.yield;
      }
    }
  }
  
  let penalty = 0;
  
  // Verificar si tiene casa (si houseIdx es null, undefined, o fuera de rango)
  const hasHouse = (c.houseIdx !== null && c.houseIdx !== undefined && c.houseIdx >= 0 && typeof state !== 'undefined' && state.houses && c.houseIdx < state.houses.length);
  if (!hasHouse) {
    penalty += noHousePenalty;
  }
  
  // Verificar si está hambriento
  if (c.isStarving) {
    penalty += noFoodPenalty;
  }
  
  return Math.max(0.15, 1.0 - penalty);
}

// FUNCIÓN DE TOASTS GLOBAL
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';
  
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);
  
  // Eliminar del DOM después de que termine la animación
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

