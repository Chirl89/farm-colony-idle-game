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
  colonists: [],
  candidates: [],
  orders: [],
  ordersRefreshDay: 0,
  reputation: 0,
  basicHouses: 0,
  upgradedHouses: 0,
  houses: [],
  currentSubTab: 'viviendas',
  currentColonistsSubTab: 'hire',
  candidateRotationElapsed: 0,
  hasHiredThisWeek: false,
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
  wells: [],
  waterToday: 0,
  waterMax: 0,
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
  playerBuilding: null,
  seeds: { wheat: 0, potato: 0, carrot: 0 },
  nextActivationId: 1,
  warehouses: [],
  storageCapacity: {},
  missions: [],
  availableMissions: [],
  missionHistory: [],
  currentMissionsSubTab: 'orders',
  missionsRefreshDay: 1
};

const COLONIST_NAMES = [
  "Aldric", "Brea", "Corvus", "Dagur", "Elara", "Faelan", "Garon", "Hadria", "Idris", "Jarek",
  "Kaelen", "Lyra", "Mael", "Nerys", "Orin", "Pyke", "Quilla", "Rowan", "Sela", "Tristan",
  "Ulric", "Valen", "Wynn", "Xander", "Yvaine", "Zephyr", "Alistair", "Beatrice", "Cedric", "Diana",
  "Eamon", "Fiona", "Gideon", "Helen", "Isaac", "Julia", "Kieran", "Lorna", "Morgan", "Nadia",
  "Oswald", "Penelope", "Quentin", "Rosemary", "Silas", "Teresa", "Urias", "Vivian", "Walter", "Yvonne"
];

const COLONIST_SURNAMES = [
  "Ashwood", "Blackwood", "Claymore", "Dunstan", "Elmwood", "Foxglove", "Goldcrest", "Hallowell", "Ironwood", "Kingscote",
  "Lockwell", "Miller", "Northwind", "Oakheart", "Pinehurst", "Quicksilver", "Redford", "Stonebridge", "Thorncroft", "Underhill",
  "Valerius", "Whitewater", "Yardley", "Zephyrus", "Alderley", "Bracken", "Calder", "Davenport", "Edgecomb", "Fairwind",
  "Greenwood", "Hardwood", "Ingham", "Jennings", "Kelford", "Lyndwood", "Milligan", "Newbolt", "Overholt", "Pendelton",
  "Redmayne", "Stanfield", "Trowbridge", "Upton", "Vance", "Westbrook", "Yeardley", "Zouch", "Barlow", "Croft"
];

function generateColonistName() {
  const name = COLONIST_NAMES[Math.floor(Math.random() * COLONIST_NAMES.length)];
  const surname = COLONIST_SURNAMES[Math.floor(Math.random() * COLONIST_SURNAMES.length)];
  return `${name} ${surname}`;
}

function generateAttribute() {
  let weights = { 1: 10, 2: 20, 3: 35, 4: 30, 5: 4, 6: 1 };
  if (typeof CONFIG !== 'undefined' && CONFIG.AttributeWeight) {
    weights = {};
    for (let key in CONFIG.AttributeWeight) {
      const val = parseInt(key);
      if (!isNaN(val)) {
        const w = CONFIG.AttributeWeight[key].yield || 0;
        if (w > 0) {
          weights[val] = w;
        }
      }
    }
  }

  let totalWeight = 0;
  for (let key in weights) {
    totalWeight += weights[key];
  }

  if (totalWeight <= 0) return 3;

  const r = Math.random() * totalWeight;
  let currentSum = 0;
  const sortedKeys = Object.keys(weights).map(Number).sort((a, b) => a - b);
  for (let key of sortedKeys) {
    currentSum += weights[key];
    if (r <= currentSum) {
      return key;
    }
  }

  return 3;
}

function generateNewColonist(id = null) {
  const finalId = id !== null ? id : (state.colonists.length ? Math.max(...state.colonists.map(c => c.id)) + 1 : 0);
  return {
    id: finalId,
    name: generateColonistName(),
    job: null,
    prevJob: null,
    attributes: {
      woodcutting: generateAttribute(),
      mining: generateAttribute(),
      farming: generateAttribute(),
      cooking: generateAttribute(),
      trading: generateAttribute(),
      exploration: generateAttribute(),
      combat: generateAttribute(),
      construction: generateAttribute()
    },
    attributeXP: {
      woodcutting: 0,
      mining: 0,
      farming: 0,
      cooking: 0,
      trading: 0,
      exploration: 0,
      combat: 0,
      construction: 0
    },
    onMission: false,
    missionId: null
  };
}

function replenishCandidates() {
  if (!state.candidates) {
    state.candidates = [];
  }
  while (state.candidates.length < 3) {
    state.candidates.push(generateNewColonist(null));
  }
}

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
            state[key] = JSON.parse(JSON.stringify(parsed[key]));
          } else {
            state[key] = Object.assign(state[key] || {}, parsed[key]);
          }
        } else {
          state[key] = parsed[key];
        }
      }
      
      // Migración de colonos numéricos a arreglo de objetos
      if (!state.colonists || !Array.isArray(state.colonists) || state.colonists.length === 0) {
        const totalColonists = parseInt(parsed.currentColonists) || 0;
        state.colonists = [];
        for (let i = 0; i < totalColonists; i++) {
          state.colonists.push(generateNewColonist(i));
        }
        
        // Reconstruir asignación de trabajos
        const oldJobsToAssign = [];
        if (parsed.jobs) {
          for (let i = 0; i < (parsed.jobs.wood || 0); i++) oldJobsToAssign.push('wood');
          for (let i = 0; i < (parsed.jobs.stone || 0); i++) oldJobsToAssign.push('stone');
          for (let i = 0; i < (parsed.jobs.berries || 0); i++) oldJobsToAssign.push('berries');
        }
        if (parsed.townHall && parsed.townHall.workerAssigned) {
          for (let i = 0; i < parsed.townHall.workerAssigned; i++) oldJobsToAssign.push('townHall');
        }
        const buildingTypes = [
          { array: 'lumberMills', prefix: 'lumbermills' },
          { array: 'quarries', prefix: 'quarries' },
          { array: 'farms', prefix: 'farms' },
          { array: 'markets', prefix: 'markets' },
          { array: 'bonfires', prefix: 'bonfires' },
          { array: 'granaries', prefix: 'granaries' }
        ];
        buildingTypes.forEach(bt => {
          if (parsed[bt.array] && Array.isArray(parsed[bt.array])) {
            parsed[bt.array].forEach((b, idx) => {
              const assigned = b.workerAssigned || 0;
              for (let i = 0; i < assigned; i++) {
                oldJobsToAssign.push(`${bt.prefix}_${idx}`);
              }
            });
          }
        });
        
        for (let i = 0; i < Math.min(oldJobsToAssign.length, state.colonists.length); i++) {
          state.colonists[i].job = oldJobsToAssign[i];
        }
      }
      
      replenishCandidates();
      if (typeof state.candidateRotationElapsed === 'undefined') state.candidateRotationElapsed = 0;
      if (typeof state.hasHiredThisWeek === 'undefined') state.hasHiredThisWeek = false;
      if (typeof state.nextActivationId === 'undefined') state.nextActivationId = 1;
      
      // Asegurar que todos los atributos y XPs existen en todos los colonos
      const allAttrs = ['woodcutting', 'mining', 'farming', 'cooking', 'trading', 'exploration', 'combat', 'construction'];
      if (state.colonists) {
        state.colonists.forEach(c => {
          if (!c.attributes) c.attributes = {};
          if (!c.attributeXP) c.attributeXP = {};
          allAttrs.forEach(attr => {
            if (typeof c.attributes[attr] === 'undefined') {
              c.attributes[attr] = generateAttribute();
            }
            if (typeof c.attributeXP[attr] === 'undefined') {
              c.attributeXP[attr] = 0;
            }
          });
          if (typeof c.isStarving === 'undefined') {
            c.isStarving = false;
          }
        });
      }
      
      // Asegurar que todos los atributos y XPs existen en todos los candidatos
      if (state.candidates) {
        state.candidates.forEach(c => {
          if (!c.attributes) c.attributes = {};
          if (!c.attributeXP) c.attributeXP = {};
          allAttrs.forEach(attr => {
            if (typeof c.attributes[attr] === 'undefined') {
              c.attributes[attr] = generateAttribute();
            }
            if (typeof c.attributeXP[attr] === 'undefined') {
              c.attributeXP[attr] = 0;
            }
          });
        });
      }

      initializeHousingAssignments();
      
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
      if (typeof state.playerBuilding === 'undefined') {
        state.playerBuilding = null;
      }
      
      if (typeof state.gatherCooldown === 'undefined') {
        state.gatherCooldown = 0;
      }
      if (typeof state.gatherType === 'undefined') {
        state.gatherType = null;
      }
      
      // Migración obligatoria de pozos
      if (!Array.isArray(state.wells)) {
        state.wells = [];
      }
      if (typeof state.waterToday === 'undefined') {
        state.waterToday = 0;
      }
      if (typeof state.waterMax === 'undefined') {
        state.waterMax = 0;
      }
      
      // Migración de almacenes
      if (!Array.isArray(state.warehouses)) {
        state.warehouses = [];
      }
      if (typeof state.storageCapacity === 'undefined' || state.storageCapacity === null) {
        state.storageCapacity = {};
      }

      // Migración de pedidos y reputación (PASO I - REP-TABL)
      if (!Array.isArray(state.orders)) {
        state.orders = [];
      }
      if (typeof state.ordersRefreshDay === 'undefined') {
        state.ordersRefreshDay = 0;
      }
      if (typeof state.reputation === 'undefined') {
        state.reputation = 0;
      }

      // Migración de misiones (PASO J - REP-MISI)
      if (!Array.isArray(state.missions)) {
        state.missions = [];
      }
      if (!Array.isArray(state.availableMissions)) {
        state.availableMissions = [];
      }
      if (!Array.isArray(state.missionHistory)) {
        state.missionHistory = [];
      }
      if (typeof state.currentMissionsSubTab === 'undefined') {
        state.currentMissionsSubTab = 'orders';
      }
      if (typeof state.missionsRefreshDay === 'undefined') {
        state.missionsRefreshDay = 1;
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

      if (typeof recalculateStorageCapacity === 'function') recalculateStorageCapacity();
      if (typeof recalculateRates === 'function') recalculateRates();
      if (typeof renderFoodPriorityList === 'function') renderFoodPriorityList();
      showToast("Partida cargada con éxito", "success");
    }
    replenishCandidates();
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
  replenishCandidates();
  
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

function initializeHousingAssignments() {
  if (!state.colonists) return;
  if (!state.houses) state.houses = [];
  
  // Clean up non-existent house references
  state.colonists.forEach(c => {
    if (c.houseIdx !== undefined && c.houseIdx !== null) {
      if (c.houseIdx < 0 || c.houseIdx >= state.houses.length) {
        c.houseIdx = null;
      }
    }
  });

  const basicHouseCfg = CONFIG.Building && CONFIG.Building.basic_house;
  const cap1 = basicHouseCfg ? basicHouseCfg.yield_amount : 1;
  const upgradedHouseCfg = CONFIG.Building && CONFIG.Building.upgraded_house;
  const cap2 = cap1 + (upgradedHouseCfg ? upgradedHouseCfg.yield_amount : 1);
  const luxuryHouseCfg = CONFIG.Building && CONFIG.Building.luxury_house;
  const cap3 = cap2 + (luxuryHouseCfg ? luxuryHouseCfg.yield_amount : 2);

  // Assign houseIdx sequentially to any colonist without a house
  state.colonists.forEach(c => {
    if (c.houseIdx === undefined || c.houseIdx === null) {
      // Find first house with available capacity
      for (let i = 0; i < state.houses.length; i++) {
        const house = state.houses[i];
        if (house.isUnderConstruction) continue;
        const capacity = house.tier === 1 ? cap1 : (house.tier === 2 ? cap2 : cap3);
        const currentCount = state.colonists.filter(x => x.houseIdx === i).length;
        if (currentCount < capacity) {
          c.houseIdx = i;
          break;
        }
      }
      if (c.houseIdx === undefined) {
        c.houseIdx = null;
      }
    }
  });
}

// Recalcular la capacidad de almacenamiento de recursos según el ayuntamiento y almacenes completados
function recalculateStorageCapacity() {
  const thTier = (state.townHall && state.townHall.tier) || 1;
  
  // Capacidad base según Ayuntamiento y mechanics.csv
  let baseWood = 100, baseStone = 100, baseFood = 100, baseSeeds = 100;
  if (typeof CONFIG !== 'undefined' && CONFIG.Storage) {
    baseWood = CONFIG.Storage[`townhall_t${thTier}_capacity`]?.value ?? (thTier === 1 ? 100 : (thTier === 2 ? 200 : 500));
    baseStone = CONFIG.Storage[`townhall_t${thTier}_capacity`]?.value ?? (thTier === 1 ? 100 : (thTier === 2 ? 200 : 500));
    baseFood = CONFIG.Storage[`townhall_t${thTier}_capacity`]?.value ?? (thTier === 1 ? 100 : (thTier === 2 ? 200 : 500));
    baseSeeds = CONFIG.Storage[`townhall_t${thTier}_capacity`]?.value ?? (thTier === 1 ? 100 : (thTier === 2 ? 200 : 500));
  } else {
    // Fallback hardcodeado si CONFIG no está cargado
    const caps = { 1: 100, 2: 200, 3: 500 };
    const c = caps[thTier] || 100;
    baseWood = c; baseStone = c; baseFood = c; baseSeeds = c;
  }

  // Inicializar storageCapacity
  state.storageCapacity = {
    wood: baseWood,
    stone: baseStone,
    food: baseFood,
    seeds: baseSeeds
  };

  // Sumar bonus de los almacenes completados
  if (Array.isArray(state.warehouses)) {
    state.warehouses.forEach(w => {
      if (w.isUnderConstruction) return; // solo almacenes construidos
      const tier = w.tier || 1;
      let bonus = tier === 1 ? 200 : (tier === 2 ? 500 : 1000);
      if (typeof CONFIG !== 'undefined' && CONFIG.Storage) {
        const bonusKey = `warehouse_t${tier}_bonus`;
        bonus = CONFIG.Storage[bonusKey]?.value ?? bonus;
      }
      if (state.storageCapacity[w.type] !== undefined) {
        state.storageCapacity[w.type] += bonus;
      }
    });
  }

  // Forzar capping de recursos actuales para no exceder la capacidad calculada
  if (state.storageCapacity) {
    if (state.wood > state.storageCapacity.wood) state.wood = state.storageCapacity.wood;
    if (state.stone > state.storageCapacity.stone) state.stone = state.storageCapacity.stone;
    
    // Alimentos y procesados de alimentos (capacidad grupal total)
    const foodKeys = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
    let totalFood = foodKeys.reduce((sum, k) => sum + (state[k] || 0), 0);
    if (totalFood > state.storageCapacity.food) {
      let excess = totalFood - state.storageCapacity.food;
      // Reducir de forma secuencial empezando por alimentos básicos y luego cocinados
      for (let i = 0; i < foodKeys.length; i++) {
        const k = foodKeys[i];
        const val = state[k] || 0;
        if (val > 0) {
          const toDeduct = Math.min(val, excess);
          state[k] = val - toDeduct;
          excess -= toDeduct;
          if (excess <= 0) break;
        }
      }
      updateGlobalFood();
    }

    // Semillas (capacidad grupal total)
    if (state.seeds) {
      const seedKeys = ['wheat', 'potato', 'carrot'];
      let totalSeeds = seedKeys.reduce((sum, k) => sum + (state.seeds[k] || 0), 0);
      if (totalSeeds > state.storageCapacity.seeds) {
        let excess = totalSeeds - state.storageCapacity.seeds;
        for (let i = 0; i < seedKeys.length; i++) {
          const k = seedKeys[i];
          const val = state.seeds[k] || 0;
          if (val > 0) {
            const toDeduct = Math.min(val, excess);
            state.seeds[k] = val - toDeduct;
            excess -= toDeduct;
            if (excess <= 0) break;
          }
        }
      }
    }
  }
}

// Genera un colono especialista con un atributo alto (8-10) y un título especial
function generateSpecialistColonist(speciality) {
  const allAttrs = ['woodcutting', 'mining', 'farming', 'cooking', 'trading', 'exploration', 'combat', 'construction'];
  let actualSpeciality = speciality;
  if (speciality === 'random' || speciality === 'any') {
    actualSpeciality = allAttrs[Math.floor(Math.random() * allAttrs.length)];
  }
  
  // Generar colono nuevo
  const specialist = generateNewColonist(null);
  
  // Extraer valores desde CONFIG o usar fallbacks
  const specialistMin = CONFIG.Colonist && CONFIG.Colonist.specialist_min ? CONFIG.Colonist.specialist_min.value : 8;
  const specialistMax = CONFIG.Colonist && CONFIG.Colonist.specialist_max ? CONFIG.Colonist.specialist_max.value : 10;
  const specialistSecondaryMax = CONFIG.Colonist && CONFIG.Colonist.specialist_attr_secondary ? CONFIG.Colonist.specialist_attr_secondary.value : 2;
  
  const mainVal = Math.floor(specialistMin + Math.random() * (specialistMax - specialistMin + 1));
  
  allAttrs.forEach(attr => {
    if (attr === actualSpeciality) {
      specialist.attributes[attr] = mainVal;
    } else {
      specialist.attributes[attr] = Math.floor(1 + Math.random() * specialistSecondaryMax);
    }
    specialist.attributeXP[attr] = 0;
  });
  
  // Obtener título según especialidad
  let title = "Especialista";
  if (CONFIG.SpecialistTitle && CONFIG.SpecialistTitle[actualSpeciality]) {
    const titlesStr = CONFIG.SpecialistTitle[actualSpeciality].name || "";
    const titlesArray = titlesStr.split(',').map(t => t.trim());
    if (titlesArray.length > 0 && titlesArray[0]) {
      title = titlesArray[Math.floor(Math.random() * titlesArray.length)];
    }
  }
  
  specialist.specialist = true;
  specialist.speciality = actualSpeciality;
  specialist.title = title;
  
  state.colonists.push(specialist);
  showToast(`🌟 ¡${title} ${specialist.name} se une a la colonia!`, 'success');
  
  if (typeof recalculateMaxPopulation === 'function') recalculateMaxPopulation();
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof updateUI === 'function') updateUI();
  
  return specialist;
}

