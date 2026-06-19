// ESTADO POR DEFECTO
const DEFAULT_STATE = {
  gold: 0,
  wood: 0,
  stone: 0,
  food: 0,
  cookedFood: 0,
  maxPopulation: 0,
  currentColonists: 0,
  freeColonists: 0,
  basicHouses: 0,
  upgradedHouses: 0,
  houses: [],
  currentSubTab: 'viviendas',
  foodPriority: ['cooked', 'raw'],
  starvingColonists: 0,
  fedCookedToday: 0,
  fedRawToday: 0,
  fedNoneToday: 0,
  allowConsumeCooked: true,
  allowConsumeRaw: true,
  lumberMills: [],
  quarries: [],
  farms: [],
  markets: [],
  bonfires: [],
  autoSellFood: true,
  autoSellFoodMin: 50,
  autoSellCooked: true,
  autoSellCookedMin: 0,
  autoSellWood: false,
  autoSellWoodMin: 100,
  autoSellStone: false,
  autoSellStoneMin: 100,
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
  playerConstructing: null
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
      if (!state.foodPriority) {
        state.foodPriority = ['cooked', 'raw'];
      } else {
        state.foodPriority = state.foodPriority.filter(p => p !== 'packaged');
        if (state.foodPriority.length === 0) state.foodPriority = ['cooked', 'raw'];
      }
      if (typeof state.starvingColonists === 'undefined') state.starvingColonists = 0;
      if (typeof state.fedCookedToday === 'undefined') state.fedCookedToday = 0;
      if (typeof state.fedRawToday === 'undefined') state.fedRawToday = 0;
      if (typeof state.fedNoneToday === 'undefined') state.fedNoneToday = 0;
      if (typeof state.allowConsumeCooked === 'undefined') state.allowConsumeCooked = true;
      if (typeof state.allowConsumeRaw === 'undefined') state.allowConsumeRaw = true;
      
      // Migración para unificar frutos (berries) en comida (food)
      if (parsed.hasOwnProperty('berries') && parsed.berries > 0) {
        state.food = (state.food || 0) + parsed.berries;
      }
      if (state.hasOwnProperty('berries')) {
        delete state.berries;
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
    state.food = 10000;
    state.cookedFood = 10000;
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
