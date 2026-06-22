// ESTADO POR DEFECTO
const DEFAULT_STATE = {
  gold: 0,
  wood: 0,
  stone: 0,
  food: 0,
  cookedFood: 0,
  wheat: 0,
  potato: 0,
  carrot: 0,
  berries: 0,
  cooked_wheat: 0,
  cooked_potato: 0,
  cooked_carrot: 0,
  cooked_berries: 0,
  maxPopulation: 0,
  currentColonists: 0,
  freeColonists: 0,
  basicHouses: 0,
  upgradedHouses: 0,
  houses: [],
  currentSubTab: 'viviendas',
  foodPriority: ['cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries', 'wheat', 'potato', 'carrot', 'berries'],
  starvingColonists: 0,
  fedCookedToday: 0,
  fedRawToday: 0,
  fedNoneToday: 0,
  allowConsume: {
    wheat: true,
    potato: true,
    carrot: true,
    berries: true,
    cooked_wheat: true,
    cooked_potato: true,
    cooked_carrot: true,
    cooked_berries: true
  },
  lumberMills: [],
  quarries: [],
  farms: [],
  markets: [],
  bonfires: [],
  granaries: [],
  autoSell: {
    wood: false,
    stone: false,
    wheat: false,
    potato: false,
    carrot: false,
    berries: false,
    cooked_wheat: false,
    cooked_potato: false,
    cooked_carrot: false,
    cooked_berries: false,
    wheat_seeds: false,
    potato_seeds: false,
    carrot_seeds: false
  },
  autoSellMin: {
    wood: 100,
    stone: 100,
    wheat: 50,
    potato: 50,
    carrot: 50,
    berries: 50,
    cooked_wheat: 0,
    cooked_potato: 0,
    cooked_carrot: 0,
    cooked_berries: 0,
    wheat_seeds: 0,
    potato_seeds: 0,
    carrot_seeds: 0
  },
  autoBuy: {
    wood: false,
    stone: false,
    wheat: false,
    potato: false,
    carrot: false,
    berries: false,
    cooked_wheat: false,
    cooked_potato: false,
    cooked_carrot: false,
    cooked_berries: false,
    wheat_seeds: false,
    potato_seeds: false,
    carrot_seeds: false
  },
  autoBuyMax: {
    wood: 100,
    stone: 100,
    wheat: 50,
    potato: 50,
    carrot: 50,
    berries: 50,
    cooked_wheat: 20,
    cooked_potato: 20,
    cooked_carrot: 20,
    cooked_berries: 20,
    wheat_seeds: 10,
    potato_seeds: 10,
    carrot_seeds: 10
  },
  gatherCooldown: 0,
  gatherType: null,
  jobs: {
    wood: 0,
    stone: 0,
    berries: 0
  },
  jobsProgress: {
    wood: 0,
    stone: 0,
    berries: 0
  },
  currentTab: 'basic',
  currentDay: 1,
  timePhase: 'day',
  phaseElapsed: 0,
  townHall: { built: false, tier: 1, isUpgrading: false, upgradeElapsed: 0, isUnderConstruction: false, constructionElapsed: 0, constructionDuration: 1, workerAssigned: 0 },
  maxBuildingTier: 0,
  playerConstructing: null,
  seeds: { wheat: 0, potato: 0, carrot: 0 }
};

// ESTADO ACTIVO
var state = JSON.parse(JSON.stringify(DEFAULT_STATE));

// Variables globales para la caché de render del Ayuntamiento
var lastRenderedTownHallBuilt = null;
var lastRenderedTownHallTier = null;
var lastRenderedTownHallUnderConst = null;
var lastRenderedTownHallUpgrading = null;

// Clave de guardado persistente
const SAVE_KEY = 'aetheria_farm_colony_save';

// Guardar el estado del juego en LocalStorage
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    showToast("Progreso auto-guardado en la nube local", "info");
  } catch (err) {
    console.error("Error al guardar la partida:", err);
  }
}

// Cargar el estado del juego desde LocalStorage
function loadGame() {
  lastRenderedTownHallBuilt = null;
  lastRenderedTownHallTier = null;
  lastRenderedTownHallUnderConst = null;
  lastRenderedTownHallUpgrading = null;
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Deep merge seguro para evitar problemas con estructuras anidadas como state.jobs
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      for (let key in parsed) {
        if (typeof parsed[key] === 'object' && parsed[key] !== null) {
          if (Array.isArray(parsed[key])) {
            state[key] = [...parsed[key]];
          } else {
            state[key] = Object.assign(state[key] || {}, parsed[key]);
          }
        } else {
          state[key] = parsed[key];
        }
      }
      
      // Compatibilidad para inicializar Ayuntamiento si no existe en el save antiguo
      if (!parsed.hasOwnProperty('townHall')) {
        const hasProgress = (parsed.houses && parsed.houses.length > 0) || 
                            (parsed.basicHouses && parsed.basicHouses > 0) ||
                            (parsed.lumberMills && parsed.lumberMills.length > 0) ||
                            (parsed.quarries && parsed.quarries.length > 0) ||
                            (parsed.farms && parsed.farms.length > 0) ||
                            (parsed.markets && parsed.markets.length > 0);
        
        state.townHall = { 
          built: hasProgress, 
          tier: 1, 
          isUpgrading: false, 
          upgradeElapsed: 0, 
          isUnderConstruction: false, 
          constructionElapsed: 0, 
          constructionDuration: 1,
          workerAssigned: 0
        };
        state.maxBuildingTier = hasProgress ? 1 : 0;
      }
      
      if (!state.townHall) {
        state.townHall = { built: false, tier: 1, isUpgrading: false, upgradeElapsed: 0, isUnderConstruction: false, constructionElapsed: 0, constructionDuration: 1, workerAssigned: 0 };
      } else {
        if (typeof state.townHall.built === 'undefined') state.townHall.built = false;
        if (typeof state.townHall.tier === 'undefined') state.townHall.tier = 1;
        if (typeof state.townHall.isUnderConstruction === 'undefined') state.townHall.isUnderConstruction = false;
        if (typeof state.townHall.constructionElapsed === 'undefined') state.townHall.constructionElapsed = 0;
        if (typeof state.townHall.constructionDuration === 'undefined') state.townHall.constructionDuration = 1;
        if (typeof state.townHall.workerAssigned === 'undefined') state.townHall.workerAssigned = 0;
      }
      
      if (typeof state.playerConstructing === 'undefined') {
        state.playerConstructing = null;
      }
      
      if (typeof state.gatherCooldown === 'undefined') {
        state.gatherCooldown = 0;
      }
      if (typeof state.gatherType === 'undefined') {
        state.gatherType = null;
      }
      
      // Asegurar inicialización de variables de alimentación
      if (!state.foodPriority || state.foodPriority.includes('cooked') || state.foodPriority.includes('raw')) {
        let newPriority = [];
        const basePriority = state.foodPriority || ['cooked', 'raw'];
        basePriority.forEach(p => {
          if (p === 'cooked') {
            newPriority.push('cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries');
          } else if (p === 'raw') {
            newPriority.push('wheat', 'potato', 'carrot', 'berries');
          } else if (p !== 'packaged') {
            newPriority.push(p);
          }
        });
        state.foodPriority = newPriority.length > 0 ? newPriority : ['cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries', 'wheat', 'potato', 'carrot', 'berries'];
      }
      if (typeof state.starvingColonists === 'undefined') state.starvingColonists = 0;
      if (typeof state.fedCookedToday === 'undefined') state.fedCookedToday = 0;
      if (typeof state.fedRawToday === 'undefined') state.fedRawToday = 0;
      if (typeof state.fedNoneToday === 'undefined') state.fedNoneToday = 0;

      // Migrar allowConsume
      const foodKeys = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
      if (!state.allowConsume || typeof state.allowConsume !== 'object') {
        state.allowConsume = {};
      }
      foodKeys.forEach(k => {
        if (state.allowConsume[k] === undefined) {
          if (k.startsWith('cooked_')) {
            state.allowConsume[k] = parsed.hasOwnProperty('allowConsumeCooked') ? parsed.allowConsumeCooked : true;
          } else {
            state.allowConsume[k] = parsed.hasOwnProperty('allowConsumeRaw') ? parsed.allowConsumeRaw : true;
          }
        }
      });

      // Migrar autoSell, autoSellMin, autoBuy, autoBuyMax de todos los recursos
      const allResources = [
        'wood', 'stone',
        'wheat', 'potato', 'carrot', 'berries',
        'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries',
        'wheat_seeds', 'potato_seeds', 'carrot_seeds'
      ];

      if (!state.autoSell) state.autoSell = {};
      if (!state.autoSellMin) state.autoSellMin = {};
      if (!state.autoBuy) state.autoBuy = {};
      if (!state.autoBuyMax) state.autoBuyMax = {};

      allResources.forEach(k => {
        if (state.autoSell[k] === undefined) {
          if (k === 'wood') state.autoSell[k] = parsed.autoSellWood || false;
          else if (k === 'stone') state.autoSell[k] = parsed.autoSellStone || false;
          else if (k === 'wheat' || k === 'potato' || k === 'carrot' || k === 'berries') state.autoSell[k] = parsed.autoSellFood || false;
          else if (k.startsWith('cooked_')) state.autoSell[k] = parsed.autoSellCooked || false;
          else state.autoSell[k] = false;
        }
        if (state.autoSellMin[k] === undefined) {
          if (k === 'wood') state.autoSellMin[k] = parsed.autoSellWoodMin !== undefined ? parsed.autoSellWoodMin : 100;
          else if (k === 'stone') state.autoSellMin[k] = parsed.autoSellStoneMin !== undefined ? parsed.autoSellStoneMin : 100;
          else if (k === 'wheat' || k === 'potato' || k === 'carrot' || k === 'berries') state.autoSellMin[k] = parsed.autoSellFoodMin !== undefined ? parsed.autoSellFoodMin : 50;
          else if (k.startsWith('cooked_')) state.autoSellMin[k] = parsed.autoSellCookedMin !== undefined ? parsed.autoSellCookedMin : 0;
          else state.autoSellMin[k] = 0;
        }
        if (state.autoBuy[k] === undefined) {
          state.autoBuy[k] = false;
        }
        if (state.autoBuyMax[k] === undefined) {
          if (k === 'wood' || k === 'stone') state.autoBuyMax[k] = 100;
          else if (k === 'wheat' || k === 'potato' || k === 'carrot' || k === 'berries') state.autoBuyMax[k] = 50;
          else if (k.startsWith('cooked_')) state.autoBuyMax[k] = 20;
          else state.autoBuyMax[k] = 10; // seeds
        }
      });

      // Migración de cookedFood antigua a cooked_wheat
      if (parsed.hasOwnProperty('cookedFood') && parsed.cookedFood > 0) {
        state.cooked_wheat = (state.cooked_wheat || 0) + parsed.cookedFood;
      }
      
      // Migración para unificar frutos (berries) en comida (food) - solo en saves antiguos
      if (typeof parsed.wheat === 'undefined' && parsed.hasOwnProperty('berries') && parsed.berries > 0) {
        state.berries = (state.berries || 0) + parsed.berries;
      }

      // --- MIGRACIONES PARA ARREGLOS DE EDIFICIOS INDUSTRIALES ---
      
      // Aserraderos
      let oldLumberMillWorkers = (parsed.jobs && parsed.jobs.lumberMill) || 0;
      if (!Array.isArray(state.lumberMills)) {
        const count = parseInt(state.lumberMills) || 0;
        state.lumberMills = [];
        for (let i = 0; i < count; i++) {
          const assigned = oldLumberMillWorkers > 0 ? 1 : 0;
          state.lumberMills.push({ id: i, workerAssigned: assigned });
          if (assigned) oldLumberMillWorkers--;
        }
      }

      // Canteras
      let oldQuarryWorkers = (parsed.jobs && parsed.jobs.quarry) || 0;
      if (!Array.isArray(state.quarries)) {
        const count = parseInt(state.quarries) || 0;
        state.quarries = [];
        for (let i = 0; i < count; i++) {
          const assigned = oldQuarryWorkers > 0 ? 1 : 0;
          state.quarries.push({ id: i, workerAssigned: assigned });
          if (assigned) oldQuarryWorkers--;
        }
      }

      // Mercados
      if (!Array.isArray(state.markets)) {
        let count = 0;
        if (parsed.hasOwnProperty('hasMarket') && parsed.hasMarket) count = 1;
        else count = parseInt(state.markets) || 0;
        
        let oldMarketWorkers = (parsed.jobs && parsed.jobs.market) || 0;
        state.markets = [];
        for (let i = 0; i < count; i++) {
          const assigned = oldMarketWorkers > 0 ? 1 : 0;
          state.markets.push({
            id: i,
            workerAssigned: assigned,
            elapsed: 0,
            isRunning: false,
            sales: { food: 0, stone: 0, wood: 0 }
          });
          if (assigned) oldMarketWorkers--;
        }
      }

      // Granjas
      if (parsed.plots && Array.isArray(parsed.plots)) {
        state.farms = [];
        parsed.plots.forEach((plot, idx) => {
          let assigned = 0;
          if (parsed.jobs && parsed.jobs.plots && parsed.jobs.plots[idx]) {
            assigned = parsed.jobs.plots[idx];
          }
          state.farms.push({
            id: idx,
            workerAssigned: assigned,
            crop: plot.crop || 'wheat',
            stage: 'idle',
            stageElapsed: 0,
            activeCrop: plot.crop || 'wheat'
          });
        });
      } else if (!Array.isArray(state.farms)) {
        const count = parseInt(state.farms) || 0;
        state.farms = [];
        for (let i = 0; i < count; i++) {
          state.farms.push({
            id: i,
            workerAssigned: 0,
            crop: 'wheat',
            stage: 'idle',
            stageElapsed: 0,
            activeCrop: 'wheat'
          });
        }
      }

      // Migración para viviendas a formato arreglo individual
      if (!state.houses || !Array.isArray(state.houses) || state.houses.length === 0) {
        if (parsed.hasOwnProperty('upgradedHouses') && parsed.hasOwnProperty('basicHouses') && parsed.hasOwnProperty('maxPopulation')) {
          if (parsed.upgradedHouses > 0 && parsed.maxPopulation === parsed.basicHouses + parsed.upgradedHouses) {
            state.basicHouses = Math.max(0, parsed.basicHouses - parsed.upgradedHouses);
          }
        }
        state.houses = [];
        for (let i = 0; i < state.basicHouses; i++) {
          state.houses.push({ id: state.houses.length, tier: 1 });
        }
        for (let i = 0; i < state.upgradedHouses; i++) {
          state.houses.push({ id: state.houses.length, tier: 2 });
        }
      }
      if (typeof recalculateMaxPopulation === 'function') recalculateMaxPopulation();
      
      // Sanitizar tiers de edificios cargados
      if (Array.isArray(state.lumberMills)) state.lumberMills.forEach(m => { if (typeof m.tier === 'undefined') m.tier = 1; });
      if (Array.isArray(state.quarries)) state.quarries.forEach(q => { if (typeof q.tier === 'undefined') q.tier = 1; });
      if (Array.isArray(state.markets)) state.markets.forEach(m => { if (typeof m.tier === 'undefined') m.tier = 1; });
      
      // Resetear estados de ejecución para evitar bloqueos
      if (Array.isArray(state.markets)) {
        state.markets.forEach(m => {
          m.isRunning = false;
          m.elapsed = 0;
        });
      }
      if (Array.isArray(state.farms)) {
        state.farms.forEach(f => {
          if (typeof f.stage === 'undefined') {
            f.stage = f.isRunning ? 'grow' : 'idle';
          }
          if (typeof f.stageElapsed === 'undefined') {
            f.stageElapsed = f.elapsed || 0;
          }
          if (typeof f.activeCrop === 'undefined') {
            f.activeCrop = f.crop || 'wheat';
          }
          if (typeof f.tier === 'undefined') {
            f.tier = 1;
          }
          if (typeof f.needsWatering === 'undefined') {
            f.needsWatering = false;
          }
          if (typeof f.waterElapsed === 'undefined') {
            f.waterElapsed = 0;
          }
          if (typeof f.wateringsCompleted === 'undefined') {
            f.wateringsCompleted = 0;
          }
          delete f.isRunning;
          delete f.elapsed;
        });
      }
      if (Array.isArray(state.bonfires)) {
        state.bonfires.forEach(b => {
          b.isRunning = false;
          b.elapsed = 0;
          if (b.tier === undefined) b.tier = 1;
        });
      } else {
        const count = parseInt(state.bonfires) || 0;
        state.bonfires = [];
        for (let i = 0; i < count; i++) {
          state.bonfires.push({
            id: i,
            workerAssigned: 0,
            tier: 1,
            elapsed: 0,
            isRunning: false
          });
        }
      }
      
      if (Array.isArray(state.granaries)) {
        state.granaries.forEach(g => {
          g.isRunning = false;
          g.elapsed = 0;
          if (g.tier === undefined) g.tier = 1;
          if (g.selectedCrop === undefined) g.selectedCrop = 'wheat';
        });
      } else {
        const count = parseInt(state.granaries) || 0;
        state.granaries = [];
        for (let i = 0; i < count; i++) {
          state.granaries.push({
            id: i,
            workerAssigned: 0,
            tier: 1,
            selectedCrop: 'wheat',
            elapsed: 0,
            isRunning: false,
            isUnderConstruction: false,
            constructionElapsed: 0,
            constructionDuration: 5,
            isUpgrading: false
          });
        }
      }

      if (typeof state.wheat === 'undefined') state.wheat = 0;
      if (typeof state.potato === 'undefined') state.potato = 0;
      if (typeof state.carrot === 'undefined') state.carrot = 0;
      if (typeof state.berries === 'undefined') state.berries = 0;
      if (typeof state.cooked_wheat === 'undefined') state.cooked_wheat = 0;
      if (typeof state.cooked_potato === 'undefined') state.cooked_potato = 0;
      if (typeof state.cooked_carrot === 'undefined') state.cooked_carrot = 0;
      if (typeof state.cooked_berries === 'undefined') state.cooked_berries = 0;
      
      if (typeof state.seeds === 'undefined') {
        state.seeds = { wheat: 0, potato: 0, carrot: 0 };
      } else {
        if (typeof state.seeds.wheat === 'undefined') state.seeds.wheat = 0;
        if (typeof state.seeds.potato === 'undefined') state.seeds.potato = 0;
        if (typeof state.seeds.carrot === 'undefined') state.seeds.carrot = 0;
      }

      if (Array.isArray(state.bonfires)) {
        state.bonfires.forEach(b => {
          if (typeof b.selectedRecipe === 'undefined') {
            b.selectedRecipe = 'wheat';
          }
        });
      }
      
      updateGlobalFood();

      if (typeof recalculateRates === 'function') recalculateRates();
      if (typeof renderFoodPriorityList === 'function') renderFoodPriorityList();
      showToast("Partida cargada con éxito", "success");
    }
  } catch (err) {
    console.error("Error al cargar la partida:", err);
    showToast("Error al cargar la partida anterior", "warning");
  }
}

// Ventanas emergentes de confirmación de reinicio
function confirmReset() {
  if (confirm("¿Estás seguro de que quieres restablecer tu colonia? Perderás todo tu progreso actual.")) {
    resetGame(false);
  }
}

function confirmResetTest() {
  if (confirm("¿Estás seguro de que quieres empezar una nueva partida de prueba? Comenzarás con 10,000 de cada recurso básico y cocinado (oro, madera, piedra, comida cruda, comida cocinada) para pruebas rápidas.")) {
    resetGame(true);
  }
}

// Reiniciar el estado del juego
function resetGame(isTestMode = false) {
  lastRenderedTownHallBuilt = null;
  lastRenderedTownHallTier = null;
  lastRenderedTownHallUnderConst = null;
  lastRenderedTownHallUpgrading = null;
  localStorage.removeItem(SAVE_KEY);
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  
  if (isTestMode) {
    state.gold = 10000;
    state.wood = 10000;
    state.stone = 10000;
    state.wheat = 10000;
    state.potato = 10000;
    state.carrot = 10000;
    state.berries = 10000;
    state.cooked_wheat = 10000;
    state.cooked_potato = 10000;
    state.cooked_carrot = 10000;
    state.cooked_berries = 10000;
    state.seeds = { wheat: 10000, potato: 10000, carrot: 10000 };
    updateGlobalFood();
  }
  
  // Limpiar el contenido renderizado de forma segura
  const listIds = [
    'active-houses-list',
    'active-bonfires-list',
    'active-lumbermills-list',
    'active-quarries-list',
    'active-farms-list',
    'active-markets-list'
  ];
  listIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  
  showToast(isTestMode ? "Iniciada partida de prueba con 10,000 recursos" : "Juego reiniciado por completo", "warning");
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof switchSubTab === 'function') switchSubTab(state.currentSubTab || 'viviendas');
  if (typeof renderFoodPriorityList === 'function') renderFoodPriorityList();
  if (typeof updateUI === 'function') updateUI();
}

function updateGlobalFood() {
  const list = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
  
  if (!CONFIG || !CONFIG.FoodEquivalence) {
    let total = 0;
    list.forEach(key => {
      const isAllowed = state.allowConsume && state.allowConsume[key] !== false;
      if (isAllowed) {
        const mult = key.startsWith('cooked_') ? 5 : 1;
        total += (state[key] || 0) * mult;
      }
    });
    state.food = total;
    return;
  }
  
  let total = 0;
  list.forEach(key => {
    const isAllowed = state.allowConsume && state.allowConsume[key] !== false;
    if (isAllowed) {
      const eqObj = CONFIG.FoodEquivalence[key];
      const mult = eqObj ? eqObj.yield : 1;
      total += (state[key] || 0) * mult;
    }
  });
  state.food = total;
}
