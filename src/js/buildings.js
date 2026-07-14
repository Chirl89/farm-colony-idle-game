// Comprobar si el jugador puede pagar los costes parametrizados de un edificio/mejora
function getBuildingDuration(timingKey, fallbackSeconds) {
  const timing = CONFIG?.Timing?.[timingKey];
  if (timing && typeof timing.duration !== 'undefined') {
    let dur = timing.duration;
    if (dur >= 100) {
      return dur / 100;
    }
    return dur;
  }
  return fallbackSeconds;
}

function canAffordBuilding(cfg) {
  if (!cfg) return false;
  
  const goldCost = cfg.cost_gold || 0;
  const woodCost = cfg.cost_wood || 0;
  const stoneCost = cfg.cost_stone || 0;
  const ironCost = cfg.cost_iron || 0;
  const repCost = cfg.cost_reputation || 0;
  
  if (state.gold < goldCost) return false;
  if (state.wood < woodCost) return false;
  if (state.stone < stoneCost) return false;
  if ((state.iron || 0) < ironCost) return false;
  if ((state.reputation || 0) < repCost) return false;
  
  return true;
}

// Descontar los costes de construcción de un edificio del estado del jugador
function deductBuildingCosts(cfg) {
  if (!cfg) return;
  
  state.gold -= (cfg.cost_gold || 0);
  state.wood -= (cfg.cost_wood || 0);
  state.stone -= (cfg.cost_stone || 0);
  if (cfg.cost_iron) {
    state.iron = (state.iron || 0) - cfg.cost_iron;
  }
  if (cfg.cost_reputation) {
    state.reputation = (state.reputation || 0) - cfg.cost_reputation;
  }
}

window.canAffordBuilding = canAffordBuilding;
window.deductBuildingCosts = deductBuildingCosts;

// AUTOASIGNACIÓN DE CONSTRUCTORES
function autoAssignBuilders() {
  if (!state.colonists) return;

  const activeProjects = [];

  // Ayuntamiento
  if (state.townHall && (state.townHall.isUnderConstruction || state.townHall.isUpgrading) && !state.townHall.isPaused) {
    activeProjects.push({
      type: 'townHall',
      building: state.townHall,
      index: null,
      activatedAt: state.townHall.activatedAt || 0
    });
  }

  // Otros edificios
  const typesToCheck = ['houses', 'lumberMills', 'quarries', 'farms', 'markets', 'bonfires', 'granaries', 'smithies', 'forges', 'mills', 'corrals', 'wells', 'warehouses'];
  for (const type of typesToCheck) {
    if (Array.isArray(state[type])) {
      state[type].forEach((building, index) => {
        if ((building.isUnderConstruction || building.isUpgrading) && !building.isPaused) {
          activeProjects.push({
            type: type,
            building: building,
            index: index,
            activatedAt: building.activatedAt || 0
          });
        }
      });
    }
  }

  // Ordenar por activatedAt ascendente (más antiguos primero)
  activeProjects.sort((a, b) => (a.activatedAt || 0) - (b.activatedAt || 0));

  // Resetear workerAssigned a 0 y builders a [] solo para los proyectos activos (bajo construcción o mejora)
  if (state.townHall) {
    state.townHall.builders = [];
    if (state.townHall.isUnderConstruction || state.townHall.isUpgrading) {
      state.townHall.workerAssigned = 0;
    }
  }
  for (const type of typesToCheck) {
    if (Array.isArray(state[type])) {
      state[type].forEach(b => {
        b.builders = [];
        if (b.isUnderConstruction || b.isUpgrading) {
          b.workerAssigned = 0;
        }
      });
    }
  }

  // Obtener constructores genéricos
  const buildersList = state.colonists.filter(c => c.job === 'construction');
  let builderIdx = 0;

  // Repartir equitativamente (round-robin) hasta max de 2 por obra
  if (activeProjects.length > 0 && buildersList.length > 0) {
    for (let round = 1; round <= 2; round++) {
      for (const project of activeProjects) {
        if (builderIdx < buildersList.length && project.building.workerAssigned < 2) {
          const builder = buildersList[builderIdx++];
          project.building.builders = project.building.builders || [];
          project.building.builders.push(builder.id);
          project.building.workerAssigned++;
        }
      }
    }
  }
}

// ASIGNACIÓN DE TRABAJOS BÁSICOS
function assignJob(job, val) {
  if (val > 0) {
    const freeColonist = state.colonists.find(c => c.job === null);
    if (freeColonist) {
      freeColonist.job = job;
      const jobName = job === 'wood' ? 'Leñador' : job === 'stone' ? 'Cantero' : 'Recolector de Frutos';
      showToast(`Aldeano asignado a ${jobName}`);
    } else {
      showToast("No tienes aldeanos libres disponibles", "warning");
    }
  } else {
    const assignedColonist = state.colonists.find(c => c.job === job);
    if (assignedColonist) {
      assignedColonist.job = null;
      const jobName = job === 'wood' ? 'Leñador' : job === 'stone' ? 'Cantero' : 'Recolector de Frutos';
      showToast(`Aldeano retirado de ${jobName}`);
    }
  }
  fixColonistAllocation();
  recalculateRates();
  updateUI();
}

// ASIGNACIÓN A EDIFICIO INDIVIDUAL
function assignBuildingWorker(type, index, val) {
  const list = state[type];
  if (!list || !list[index]) return;
  const building = list[index];
  
  if (building.isUnderConstruction || building.isUpgrading) {
    return; // Ahora se maneja por autoasignación de constructores
  }
  
  if (type === 'houses') {
    return;
  }
  
  const isIndustrial = type === 'lumberMills' || type === 'quarries' || type === 'bonfires' || type === 'granaries';
  const maxWorkers = isIndustrial ? (building.tier || 1) : 1;
  const currentAssigned = state.colonists.filter(c => c.job === `${type.toLowerCase()}_${index}`).length;
  
  if (val > 0) {
    const freeColonist = state.colonists.find(c => c.job === null);
    if (freeColonist) {
      if (currentAssigned >= maxWorkers) {
        showToast(`Este edificio ya tiene el máximo de aldeanos asignados (${maxWorkers})`, "warning");
        return;
      }
      freeColonist.job = `${type.toLowerCase()}_${index}`;
      showToast("Aldeano asignado al edificio");
    } else {
      showToast("No tienes aldeanos libres disponibles", "warning");
    }
  } else {
    const assignedColonist = state.colonists.find(c => c.job === `${type.toLowerCase()}_${index}`);
    if (assignedColonist) {
      assignedColonist.job = null;
      showToast("Aldeano retirado del edificio");
    }
  }
  fixColonistAllocation();
  recalculateRates();
  updateUI();
}

function assignTownHallWorker(val) {
  // Obsoleto: ahora se maneja por autoasignación de constructores
}

function togglePlayerConstruct(type, index) {
  if (state.playerConstructing && state.playerConstructing.type === type && state.playerConstructing.index === index) {
    state.playerConstructing = null;
    showToast("Construcción manual pausada");
  } else {
    state.playerConstructing = { type: type, index: index };
    
    let bName = 'Edificio';
    if (type === 'townHall') {
      bName = 'Ayuntamiento';
    } else if (type === 'houses') {
      const house = state.houses[index];
      const tierNames = { 1: 'Choza', 2: 'Cabaña', 3: 'Casa Grande' };
      bName = (house ? tierNames[house.tier || 1] : 'Choza') + ` #${index + 1}`;
    } else {
      const list = state[type];
      if (list && list[index]) {
        const names = {
          lumberMills: 'Aserradero',
          quarries: 'Cantera',
          farms: 'Granja',
          bonfires: 'Fogata',
          markets: 'Puesto de Mercado',
          smithies: 'Taller del Herrero',
          wells: 'Pozo',
          warehouses: 'Almacén',
          granaries: 'Granero'
        };
        bName = `${names[type] || 'Edificio'} #${index + 1}`;
      }
    }
    showToast(`El jugador ha comenzado a construir: ${bName}`);
  }
  recalculateRates();
  updateUI();
}

// AGRICULTURA DE GRANJA INDIVIDUAL
function changeFarmCrop(idx, cropKey) {
  if (state.farms && state.farms[idx]) {
    const farm = state.farms[idx];
    if (farm.isUnderConstruction) return;
    farm.crop = cropKey;
    recalculateRates();
    updateUI();
  }
}

function startFarmCycle(idx) {
  if (!state.farms || !state.farms[idx]) return;
  const farm = state.farms[idx];
  if (farm.isUnderConstruction) return;
  if (farm.stage !== 'idle') return;

  const cropKey = farm.crop || 'wheat';
  const crop = CROPS[cropKey];
  if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
  
  if ((state.seeds[cropKey] || 0) >= 1) {
    state.seeds[cropKey] -= 1;
    farm.stageElapsed = 0;
    farm.stage = 'plow';
    farm.activeCrop = cropKey;
    farm.needsWatering = false;
    farm.waterElapsed = 0;
    farm.wateringsCompleted = 0;
    recalculateRates();
    updateUI();
  } else {
    const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
    showToast(`No tienes semillas de ${rawNames[cropKey] || cropKey} para iniciar el ciclo`, "warning");
  }
}

function recalculateMaxPopulation() {
  if (!state.houses) state.houses = [];
  
  const basicHouseCfg = CONFIG.Building && CONFIG.Building.basic_house;
  const cap1 = basicHouseCfg ? basicHouseCfg.yield_amount : 1;
  
  const upgradedHouseCfg = CONFIG.Building && CONFIG.Building.upgraded_house;
  const cap2 = cap1 + (upgradedHouseCfg ? upgradedHouseCfg.yield_amount : 1);
  
  const luxuryHouseCfg = CONFIG.Building && CONFIG.Building.luxury_house;
  const cap3 = cap2 + (luxuryHouseCfg ? luxuryHouseCfg.yield_amount : 2);
  
  state.basicHouses = state.houses.filter(h => h.tier === 1 && !h.isUnderConstruction).length;
  state.upgradedHouses = state.houses.filter(h => h.tier === 2 && !h.isUnderConstruction).length;
  state.luxuryHouses = state.houses.filter(h => h.tier === 3 && !h.isUnderConstruction).length;
  
  state.maxPopulation = state.basicHouses * cap1 + state.upgradedHouses * cap2 + state.luxuryHouses * cap3;
}

function buildBasicHouse() {
  if (!isBuildingUnlocked('basic_house')) {
    showToast("Requiere investigar Construcción Básica", "warning");
    return;
  }
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción del Ayuntamiento primero.", "warning");
    return;
  }
  const cfg = CONFIG.Building.basic_house;
  if (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    
    if (!state.houses) state.houses = [];
    const idx = state.houses.length;
    state.houses.push({
      id: idx,
      tier: 1,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('basic_house', 8.4),
      workerAssigned: 0,
      activatedAt: state.nextActivationId++,
      isPaused: false
    });
    
    recalculateMaxPopulation();
    autoAssignBuilders();
    
    showToast("🏗️ Comenzando construcción de la Choza. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir la Choza", "warning");
  }
}

function upgradeHouseItem(idx) {
  if (!state.houses || !state.houses[idx]) return;
  const house = state.houses[idx];
  
  if (house.isUnderConstruction || house.isUpgrading) {
    showToast("Esta vivienda ya está en proceso de construcción o mejora.", "warning");
    return;
  }
  
  if (house.tier === 1) {
    if (!isBuildingUnlocked('upgraded_house') && !isBuildingUnlocked('house_t2')) {
      showToast("Requiere investigar Albañilería", "warning");
      return;
    }
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Ayuntamiento de Nivel 2 para mejorar viviendas a Tier 2.", "warning");
      return;
    }
    const cfg = CONFIG.Building.upgraded_house;
    if (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
      state.wood -= cfg.cost_wood;
      state.stone -= cfg.cost_stone;
      
      house.isUpgrading = true;
      house.upgradingToTier = 2;
      house.constructionElapsed = 0;
      house.constructionDuration = getBuildingDuration('upgraded_house', 16.8);
      house.workerAssigned = 0;
      house.activatedAt = state.nextActivationId++;
      house.isPaused = false;
      autoAssignBuilders();
      
      showToast(`🏗️ Comenzando mejora de Choza #${idx + 1} a Cabaña. ¡Asigna constructores para comenzar!`, "info");
      recalculateRates();
      updateUI();
    } else {
      showToast("Recursos insuficientes para mejorar a Cabaña (Requiere 40 Madera y 30 Piedra)", "warning");
    }
  } else if (house.tier === 2) {
    if (!isBuildingUnlocked('luxury_house')) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento de Nivel 3 para mejorar viviendas a Tier 3.", "warning");
      return;
    }
    // Upgrade to Tier 3 (Casa Grande): 50 Gold, 80 Wood, 60 Stone
    const cfg = CONFIG.Building && CONFIG.Building.luxury_house ? CONFIG.Building.luxury_house : { cost_gold: 50, cost_wood: 80, cost_stone: 60 };
    if (state.gold >= cfg.cost_gold && state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
      state.gold -= cfg.cost_gold;
      state.wood -= cfg.cost_wood;
      state.stone -= cfg.cost_stone;
      
      house.isUpgrading = true;
      house.upgradingToTier = 3;
      house.constructionElapsed = 0;
      house.constructionDuration = getBuildingDuration('luxury_house', 33.6);
      house.workerAssigned = 0;
      house.activatedAt = state.nextActivationId++;
      house.isPaused = false;
      autoAssignBuilders();
      
      showToast(`🏗️ Comenzando mejora de Cabaña #${idx + 1} a Casa Grande. ¡Asigna constructores para comenzar!`, "info");
      recalculateRates();
      updateUI();
    } else {
      showToast(`Recursos insuficientes para mejorar a Casa Grande (Requiere ${cfg.cost_gold} Oro, ${cfg.cost_wood} Madera y ${cfg.cost_stone} Piedra)`, "warning");
    }
  }
}

function buildLumberMill() {
  if (!isBuildingUnlocked('lumbermill')) {
    showToast("Requiere investigación", "warning");
    return;
  }
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción del Ayuntamiento primero.", "warning");
    return;
  }
  const cfg = CONFIG.Building.lumbermill;
  if (state.gold >= cfg.cost_gold && state.stone >= cfg.cost_stone) {
    state.gold -= cfg.cost_gold;
    state.stone -= cfg.cost_stone;
    state.lumberMills.push({
      id: state.lumberMills.length,
      workerAssigned: 0,
      tier: 1,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('lumbermill', 16.8),
      activatedAt: state.nextActivationId++,
      isPaused: false
    });
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción de Cabaña de Leñador. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir la Cabaña de Leñador", "warning");
  }
}

function upgradeLumberMill(idx) {
  if (!state.lumberMills || !state.lumberMills[idx]) return;
  const mill = state.lumberMills[idx];
  if (mill.isUnderConstruction || mill.isUpgrading) return;
  const tier = mill.tier || 1;
  if (tier >= 3) {
    showToast("Este aserradero ya está en el nivel máximo.", "info");
    return;
  }
  
  let cfg;
  if (tier === 1) {
    if (!isBuildingUnlocked('lumbermill_t2')) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Ayuntamiento de Nivel 2 para mejorar el Aserradero a Tier 2.", "warning");
      return;
    }
    cfg = CONFIG.Building.lumbermill_t2;
  } else if (tier === 2) {
    if (!isBuildingUnlocked('lumbermill_t3')) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento de Nivel 3 para mejorar el Aserradero a Tier 3.", "warning");
      return;
    }
    cfg = CONFIG.Building.lumbermill_t3;
  }
  
  if (!cfg) return;
  
  if (state.gold >= cfg.cost_gold && state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.gold -= cfg.cost_gold;
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    
    mill.isUpgrading = true;
    mill.upgradingToTier = tier + 1;
    mill.constructionElapsed = 0;
    mill.constructionDuration = getBuildingDuration(`lumbermill_t${tier + 1}`, tier === 1 ? 33.6 : 67.2);
    mill.activatedAt = state.nextActivationId++;
    mill.isPaused = false;
    
    autoAssignBuilders();
    showToast(`🏗️ Comenzando mejora de Aserradero #${idx + 1} a Tier ${tier + 1}. ¡Asigna constructores para comenzar!`, "info");
    recalculateRates();
    updateUI();
  } else {
    showToast(`Recursos insuficientes para mejorar el Aserradero (Oro: ${cfg.cost_gold}, Madera: ${cfg.cost_wood}, Piedra: ${cfg.cost_stone})`, "warning");
  }
}

function buildQuarry() {
  if (!isBuildingUnlocked('quarry')) {
    showToast("Requiere investigación", "warning");
    return;
  }
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción del Ayuntamiento primero.", "warning");
    return;
  }
  const cfg = CONFIG.Building.quarry;
  if (state.gold >= cfg.cost_gold && state.wood >= cfg.cost_wood) {
    state.gold -= cfg.cost_gold;
    state.wood -= cfg.cost_wood;
    state.quarries.push({
      id: state.quarries.length,
      workerAssigned: 0,
      tier: 1,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('quarry', 16.8),
      activatedAt: state.nextActivationId++,
      isPaused: false
    });
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción de Foso de Piedra. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir el Foso de Piedra", "warning");
  }
}

function upgradeQuarry(idx) {
  if (!state.quarries || !state.quarries[idx]) return;
  const quarry = state.quarries[idx];
  if (quarry.isUnderConstruction || quarry.isUpgrading) return;
  const tier = quarry.tier || 1;
  if (tier >= 3) {
    showToast("Esta cantera ya está en el nivel máximo.", "info");
    return;
  }
  
  let cfg;
  if (tier === 1) {
    if (!isBuildingUnlocked('quarry_t2')) {
      showToast("Requiere investigar Albañilería", "warning");
      return;
    }
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Ayuntamiento de Nivel 2 para mejorar la Cantera a Tier 2.", "warning");
      return;
    }
    cfg = CONFIG.Building.quarry_t2;
  } else if (tier === 2) {
    if (!isBuildingUnlocked('quarry_t3')) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento de Nivel 3 para mejorar la Cantera a Tier 3.", "warning");
      return;
    }
    cfg = CONFIG.Building.quarry_t3;
  }
  
  if (!cfg) return;
  
  if (state.gold >= cfg.cost_gold && state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.gold -= cfg.cost_gold;
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    
    quarry.isUpgrading = true;
    quarry.upgradingToTier = tier + 1;
    quarry.constructionElapsed = 0;
    quarry.constructionDuration = getBuildingDuration(`quarry_t${tier + 1}`, tier === 1 ? 33.6 : 67.2);
    quarry.activatedAt = state.nextActivationId++;
    quarry.isPaused = false;
    
    autoAssignBuilders();
    showToast(`🏗️ Comenzando mejora de Cantera #${idx + 1} a Tier ${tier + 1}. ¡Asigna constructores para comenzar!`, "info");
    recalculateRates();
    updateUI();
  } else {
    showToast(`Recursos insuficientes para mejorar la Cantera (Oro: ${cfg.cost_gold}, Madera: ${cfg.cost_wood}, Piedra: ${cfg.cost_stone})`, "warning");
  }
}

function buildFarm() {
  if (!isBuildingUnlocked('farm')) {
    showToast("Requiere investigar Construcción Básica", "warning");
    return;
  }
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción del Ayuntamiento primero.", "warning");
    return;
  }
  const cfg = CONFIG.Building.farm;
  if (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    state.farms.push({
      id: state.farms.length,
      workerAssigned: 0,
      crop: 'wheat',
      stage: 'idle',
      stageElapsed: 0,
      activeCrop: 'wheat',
      needsWatering: false,
      waterElapsed: 0,
      wateringsCompleted: 0,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('farm', 16.8),
      activatedAt: state.nextActivationId++,
      isPaused: false
    });
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción de Granja. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir la Granja", "warning");
  }
}

// MERCADO
function buildMarket() {
  if (!isBuildingUnlocked('market')) {
    showToast("Requiere investigación", "warning");
    return;
  }
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción del Ayuntamiento primero.", "warning");
    return;
  }
  const cfg = CONFIG.Building.market;
  if (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    state.markets.push({
      id: state.markets.length,
      workerAssigned: 0,
      elapsed: 0,
      isRunning: false,
      sales: { food: 0, stone: 0, wood: 0 },
      tier: 1,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('market', 100.8),
      activatedAt: state.nextActivationId++,
      isPaused: false
    });
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción de Puesto de Mercado. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir el Puesto de Mercado", "warning");
  }
}

// HOGUERA Y COCINADO
function buildBonfire() {
  if (!isBuildingUnlocked('bonfire')) {
    showToast("Requiere investigar Construcción Básica", "warning");
    return;
  }
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción del Ayuntamiento primero.", "warning");
    return;
  }
  const cfg = CONFIG.Building.bonfire;
  if (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    state.bonfires.push({
      id: state.bonfires.length,
      workerAssigned: 0,
      workers: [null],
      elapsed: 0,
      isRunning: false,
      mode: 'none',
      tier: 1,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('bonfire', 8.4),
      activatedAt: state.nextActivationId++,
      isPaused: false,
      recipePriorities: ['carrot', 'wheat', 'potato', 'berries'],
      cookingRecipeNow: null
    });
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción de Fogata. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir la Fogata", "warning");
  }
}

function upgradeBonfire(idx) {
  if (!state.bonfires || !state.bonfires[idx]) return;
  const bonfire = state.bonfires[idx];
  if (bonfire.isUnderConstruction) return;
  
  if (bonfire.tier === 1) {
    if (!isBuildingUnlocked('pot_upgrade') && !isBuildingUnlocked('bonfire_t2')) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Ayuntamiento de Nivel 2 para mejorar el Caldero a Tier 2.", "warning");
      return;
    }
      // Mejorar a Caldero
      const cfg = CONFIG.Building.pot_upgrade;
      if (state.gold >= cfg.cost_gold && state.stone >= cfg.cost_stone) {
        state.gold -= cfg.cost_gold;
        state.stone -= cfg.cost_stone;
        bonfire.tier = 2;
        bonfire.workers = bonfire.workers || [];
        while (bonfire.workers.length < 2) bonfire.workers.push(null);
        showToast(`¡Fogata #${idx + 1} mejorada a Caldero! Producción y velocidad aumentadas.`, "success");
        recalculateRates();
        updateUI();
      } else {
        showToast("Recursos insuficientes para mejorar a Caldero (Requiere 50 Oro y 30 Piedra)", "warning");
      }
    } else if (bonfire.tier === 2) {
      if (!isBuildingUnlocked('kitchen_upgrade') && !isBuildingUnlocked('bonfire_t3')) {
        showToast("Requiere investigar Alta Cocina", "warning");
        return;
      }
      if (state.maxBuildingTier < 3) {
        showToast("Se requiere Ayuntamiento de Nivel 3 para mejorar la Cocina de Taberna a Tier 3.", "warning");
        return;
      }
      // Mejorar a Cocina de Taberna
      const cfg = CONFIG.Building.kitchen_upgrade;
      if (state.gold >= cfg.cost_gold && state.wood >= cfg.cost_wood) {
        state.gold -= cfg.cost_gold;
        state.wood -= cfg.cost_wood;
        bonfire.tier = 3;
        bonfire.workers = bonfire.workers || [];
        while (bonfire.workers.length < 2) bonfire.workers.push(null);
        showToast(`¡Caldero #${idx + 1} mejorado a Cocina de Taberna! Producción y velocidad optimizadas al máximo.`, "success");
        recalculateRates();
        updateUI();
      } else {
        showToast("Recursos insuficientes para mejorar a Cocina de Taberna (Requiere 100 Oro y 50 Madera)", "warning");
      }
  } else {
    showToast("Este edificio ya ha alcanzado el nivel máximo (Cocina de Taberna).", "info");
  }
}

function cookManually(idx) {
  if (!state.bonfires || !state.bonfires[idx]) return;
  const bonfire = state.bonfires[idx];
  if (bonfire.isUnderConstruction) return;
  if (bonfire.isRunning) {
    let bName = bonfire.tier === 1 ? 'Esta fogata' : (bonfire.tier === 2 ? 'Este caldero' : 'Esta cocina de taberna');
    showToast(`${bName} ya está procesando un lote`, "warning");
    return;
  }
  
  let manualRec;
  if (bonfire.tier === 1) manualRec = CONFIG.Processing.bonfire_manual;
  else if (bonfire.tier === 2) manualRec = CONFIG.Processing.pot_manual;
  else manualRec = CONFIG.Processing.kitchen_manual;

  if (!manualRec) return;

  const recipe = bonfire.selectedRecipe || 'wheat';
  const minFood = manualRec.consume_amount;
  
  const currentFood = typeof getFoodOccupation === 'function' ? getFoodOccupation() : 0;
  const maxFood = state.maxFoodCapacity || 100;
  if (currentFood >= maxFood) {
    showToast("⚠️ ¡Almacén de Alimentos lleno! Despeja espacio antes de cocinar.", "warning");
    return;
  }

  if ((state[recipe] || 0) >= minFood) {
    state[recipe] -= minFood;
    updateGlobalFood();
    bonfire.elapsed = 0;
    bonfire.isRunning = true;
    bonfire.mode = 'manual';
    bonfire.activeRecipe = recipe;
    recalculateRates();
    updateUI();
  } else {
    const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos' };
    showToast(`${rawNames[recipe] || recipe} insuficiente para cocinar manualmente (Mín. ${minFood})`, "warning");
  }
}

function changeBonfireRecipe(idx, recipe) {
  if (state.bonfires && state.bonfires[idx]) {
    const bonfire = state.bonfires[idx];
    if (bonfire.isUnderConstruction) return;
    bonfire.selectedRecipe = recipe;
    
    // Sincronizar slot 0
    bonfire.workers = bonfire.workers || [];
    if (bonfire.workers[0]) {
      bonfire.workers[0].selectedRecipe = recipe;
    }
    
    recalculateRates();
    updateUI();
  }
}
window.changeBonfireRecipe = changeBonfireRecipe;

function changeBonfireSlotRecipe(idx, slotIdx, recipe) {
  if (state.bonfires && state.bonfires[idx]) {
    const bonfire = state.bonfires[idx];
    if (bonfire.isUnderConstruction) return;
    
    bonfire.workers = bonfire.workers || [];
    if (!bonfire.workers[slotIdx]) {
      bonfire.workers[slotIdx] = {
        colonistId: null,
        selectedRecipe: recipe,
        elapsed: 0,
        isRunning: false
      };
    } else {
      bonfire.workers[slotIdx].selectedRecipe = recipe;
    }
    
    if (slotIdx === 0) {
      bonfire.selectedRecipe = recipe;
    }
    
    recalculateRates();
    updateUI();
    saveGame();
  }
}
window.changeBonfireSlotRecipe = changeBonfireSlotRecipe;

function buildTownHall() {
  const cfg = CONFIG.Building.townhall;
  if (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    state.townHall.built = true;
    state.townHall.tier = 1;
    state.townHall.isUnderConstruction = true;
    state.townHall.constructionElapsed = 0;
    state.townHall.constructionDuration = getBuildingDuration('townhall', 8.4);
    state.townHall.activatedAt = state.nextActivationId++;
    state.townHall.isPaused = false;
    state.playerConstructing = { type: 'townHall' };
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción del Ayuntamiento. ¡El jugador ha iniciado la construcción!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir el Ayuntamiento", "warning");
  }
}

function upgradeTownHall() {
  if (!state.townHall.built) return;
  if (state.townHall.isUnderConstruction || state.townHall.isUpgrading) {
    showToast("El Ayuntamiento ya está en proceso de construcción o mejora.", "warning");
    return;
  }
  const currentTier = state.townHall.tier;
  if (currentTier >= 3) {
    showToast("El Ayuntamiento ya está al nivel máximo.", "info");
    return;
  }
  
  let cfg;
  if (currentTier === 1) {
    cfg = CONFIG.Building.townhall_t2;
  } else if (currentTier === 2) {
    cfg = CONFIG.Building.townhall_t3;
  }
  
  if (!cfg) return;
  
  if (state.gold >= cfg.cost_gold && state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.gold -= cfg.cost_gold;
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    
    state.townHall.isUpgrading = true;
    state.townHall.upgradingToTier = currentTier + 1;
    state.townHall.constructionElapsed = 0;
    state.townHall.constructionDuration = getBuildingDuration(currentTier === 1 ? 'townhall_t2' : 'townhall_t3', currentTier === 1 ? 16.8 : 33.6);
    state.townHall.workerAssigned = 0;
    state.townHall.activatedAt = state.nextActivationId++;
    state.townHall.isPaused = false;
    autoAssignBuilders();
    
    showToast(`🏗️ Comenzando mejora de Ayuntamiento a Nivel ${currentTier + 1}. ¡Asigna constructores para comenzar!`, "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para mejorar el Ayuntamiento", "warning");
  }
}

// ASIGNAR ALDEANOS A TRABAJOS DE EDIFICIOS INDUSTRIALES DE FORMA GLOBAL
function assignBuildingJob(type, val) {
  const arrayKey = type === 'market' ? 'markets' : (type === 'bonfire' ? 'bonfires' : (type === 'granary' ? 'granaries' : null));
  if (!arrayKey || !state[arrayKey]) return;
  const list = state[arrayKey];
  
  const getJobNames = (t) => {
    if (t === 'market') return { singular: 'Puesto de Mercado', plural: 'Puestos de Mercado' };
    if (t === 'bonfire') return { singular: 'Fuego/Cocina', plural: 'Fuegos/Cocinas' };
    if (t === 'granary') return { singular: 'Granero', plural: 'Graneros' };
    return { singular: 'Edificio', plural: 'Edificios' };
  };
  const names = getJobNames(type);

  if (val > 0) {
    const freeColonist = state.colonists.find(c => c.job === null);
    if (freeColonist) {
      const building = list.find(b => {
        if (b.isUnderConstruction || b.isUpgrading) return false;
        const maxWorkers = (type === 'bonfire' || type === 'granary') ? (b.tier || 1) : 1;
        const currentAssigned = state.colonists.filter(c => c.job === `${arrayKey.toLowerCase()}_${b.id}`).length;
        return currentAssigned < maxWorkers;
      });
      if (building) {
        freeColonist.job = `${arrayKey.toLowerCase()}_${building.id}`;
        showToast(`Aldeano asignado al ${names.singular}`);
      } else {
        showToast(`Todos los ${names.plural} ya tienen el máximo de trabajadores`, "warning");
      }
    } else {
      showToast("No tienes aldeanos libres disponibles", "warning");
    }
  } else {
    const reversedColonists = [...state.colonists].reverse();
    const assignedColonist = reversedColonists.find(c => c.job && c.job.startsWith(`${arrayKey.toLowerCase()}_`));
    if (assignedColonist) {
      assignedColonist.job = null;
      showToast(`Aldeano retirado del ${names.singular}`);
    }
  }
  fixColonistAllocation();
  recalculateRates();
  updateUI();
}

// LIBERAR TODOS LOS TRABAJADORES (QoL)
function resetAllAssignments() {
  if (confirm("¿Estás seguro de que quieres liberar a todos tus aldeanos asignados?")) {
    if (Array.isArray(state.colonists)) {
      state.colonists.forEach(c => c.job = null);
    }
    fixColonistAllocation();
    showToast("Todos los aldeanos han sido liberados de sus tareas", "info");
    recalculateRates();
    updateUI();
  }
}

// COMPRAR SEMILLAS
function buySeed(type) {
  const seedKey = `buy_${type}_seeds`;
  if (!CONFIG || !CONFIG.Sales || !CONFIG.Sales[seedKey]) {
    showToast("Configuración de semillas no encontrada", "warning");
    return;
  }
  const recipe = CONFIG.Sales[seedKey];
  const price = recipe.cost_gold || 0;
  if (state.gold >= price) {
    state.gold -= price;
    if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
    state.seeds[type] = (state.seeds[type] || 0) + 1;
    showToast(`¡Comprado: ${recipe.name} por ${price}🪙!`, "success");
    recalculateRates();
    updateUI();
  } else {
    showToast("Oro insuficiente para comprar la semilla", "warning");
  }
}

function buildGranary() {
  if (!isBuildingUnlocked('granary')) {
    showToast("Requiere investigación", "warning");
    return;
  }
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción del Ayuntamiento primero.", "warning");
    return;
  }
  const cfg = CONFIG.Building.granary;
  if (!cfg) return;
  if (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    state.granaries.push({
      id: state.granaries.length,
      tier: 1,
      workerAssigned: 0,
      workers: [null],
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('granary', 50.4),
      isUpgrading: false,
      selectedCrop: 'wheat',
      elapsed: 0,
      isRunning: false,
      activatedAt: state.nextActivationId++,
      isPaused: false,
      seedsPriorities: ['wheat', 'potato', 'carrot'],
      cookingRecipeNow: null
    });
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción de Granero. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir el Granero", "warning");
  }
}

function upgradeGranary(idx) {
  if (!state.granaries || !state.granaries[idx]) return;
  const granary = state.granaries[idx];
  if (granary.isUnderConstruction || granary.isUpgrading) {
    showToast("Este granero ya está en proceso de construcción o mejora.", "warning");
    return;
  }
  const tier = granary.tier || 1;
  if (tier >= 3) {
    showToast("Este granero ya está en el nivel máximo.", "info");
    return;
  }
  
  let cfg;
  if (tier === 1) {
    if (!isBuildingUnlocked('granary_t2')) {
      showToast("Requiere investigar Agricultura Avanzada", "warning");
      return;
    }
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Ayuntamiento de Nivel 2 para mejorar el Granero a Tier 2.", "warning");
      return;
    }
    cfg = CONFIG.Building.granary_t2;
  } else if (tier === 2) {
    if (!isBuildingUnlocked('granary_t3')) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento de Nivel 3 para mejorar el Granero a Tier 3.", "warning");
      return;
    }
    cfg = CONFIG.Building.granary_t3;
  }
  
  if (!cfg) return;
  
  if (state.gold >= cfg.cost_gold && state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.gold -= cfg.cost_gold;
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    
    granary.isUpgrading = true;
    granary.upgradingToTier = tier + 1;
    granary.constructionElapsed = 0;
    granary.constructionDuration = getBuildingDuration(`granary_t${tier + 1}`, tier === 1 ? 100.8 : 201.6);
    granary.activatedAt = state.nextActivationId++;
    granary.isPaused = false;
    autoAssignBuilders();
    
    showToast(`🏗️ Comenzando mejora de Granero #${idx + 1} a Tier ${tier + 1}. ¡Asigna constructores para comenzar!`, "info");
    recalculateRates();
    updateUI();
  } else {
    showToast(`Recursos insuficientes para mejorar el Granero (Oro: ${cfg.cost_gold}, Madera: ${cfg.cost_wood}, Piedra: ${cfg.cost_stone})`, "warning");
  }
}

function changeGranaryRecipe(idx, cropKey) {
  if (state.granaries && state.granaries[idx]) {
    const granary = state.granaries[idx];
    if (granary.isUnderConstruction) return;
    granary.selectedCrop = cropKey;
    
    // Sincronizar slot 0
    granary.workers = granary.workers || [];
    if (granary.workers[0]) {
      granary.workers[0].selectedCrop = cropKey;
    }
    
    recalculateRates();
    updateUI();
  }
}
window.changeGranaryRecipe = changeGranaryRecipe;

function changeGranarySlotCrop(idx, slotIdx, cropKey) {
  if (state.granaries && state.granaries[idx]) {
    const granary = state.granaries[idx];
    if (granary.isUnderConstruction) return;
    
    granary.workers = granary.workers || [];
    if (!granary.workers[slotIdx]) {
      granary.workers[slotIdx] = {
        colonistId: null,
        selectedCrop: cropKey,
        elapsed: 0,
        isRunning: false
      };
    } else {
      granary.workers[slotIdx].selectedCrop = cropKey;
    }
    
    if (slotIdx === 0) {
      granary.selectedCrop = cropKey;
    }
    
    recalculateRates();
    updateUI();
    saveGame();
  }
}
window.changeGranarySlotCrop = changeGranarySlotCrop;

function processGranaryManually(idx) {
  if (!state.granaries || !state.granaries[idx]) return;
  const granary = state.granaries[idx];
  if (granary.isUnderConstruction) return;
  if (granary.isRunning) {
    showToast("Este granero ya está procesando", "warning");
    return;
  }
  
  const cropKey = granary.selectedCrop || 'wheat';
  const tier = granary.tier || 1;
  const recipeKey = `granary_${cropKey}_t${tier}`;
  const recipe = CONFIG.Processing && CONFIG.Processing[recipeKey];
  
  if (!recipe) {
    showToast("Receta no encontrada para este nivel de granero", "warning");
    return;
  }
  
  const minFood = recipe.consume_amount || 5;
  const consumeResource = recipe.consume_type || cropKey;
  
  if ((state[consumeResource] || 0) >= minFood) {
    state[consumeResource] -= minFood;
    updateGlobalFood();
    granary.elapsed = 0;
    granary.isRunning = true;
    granary.mode = 'manual';
    granary.activeCrop = cropKey;
    recalculateRates();
    updateUI();
  } else {
    const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
    showToast(`${rawNames[consumeResource] || consumeResource} insuficiente para procesar manualmente (Mín. ${minFood})`, "warning");
  }
}

function destroyBuildingPrompt(arrayName, idx) {
  if (!state[arrayName] || !state[arrayName][idx]) return;
  const building = state[arrayName][idx];
  
  // Calculate cumulative costs
  let totalGold = 0;
  let totalWood = 0;
  let totalStone = 0;

  const baseKeys = {
    lumberMills: 'lumbermill',
    quarries: 'quarry',
    farms: 'farm',
    bonfires: 'bonfire',
    granaries: 'granary',
    markets: 'market',
    houses: 'basic_house',
    smithies: 'smithy',
    forges: 'forge',
    wells: 'well',
    warehouses: null
  };
  const baseKey = baseKeys[arrayName];
  if (baseKey && CONFIG.Building[baseKey]) {
    const cfg = CONFIG.Building[baseKey];
    totalGold += cfg.cost_gold || 0;
    totalWood += cfg.cost_wood || 0;
    totalStone += cfg.cost_stone || 0;
  }

  const tier = building.tier || 1;
  if (arrayName === 'lumberMills') {
    if (tier >= 2 || building.upgradingToTier >= 2) {
      const cfg = CONFIG.Building.lumbermill_t2;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
    if (tier >= 3 || building.upgradingToTier >= 3) {
      const cfg = CONFIG.Building.lumbermill_t3;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
  } else if (arrayName === 'quarries') {
    if (tier >= 2 || building.upgradingToTier >= 2) {
      const cfg = CONFIG.Building.quarry_t2;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
    if (tier >= 3 || building.upgradingToTier >= 3) {
      const cfg = CONFIG.Building.quarry_t3;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
  } else if (arrayName === 'farms') {
    if (tier >= 2 || building.upgradingToTier >= 2) {
      const cfg = CONFIG.Building.farm_t2;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
    if (tier >= 3 || building.upgradingToTier >= 3) {
      const cfg = CONFIG.Building.farm_t3;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
  } else if (arrayName === 'bonfires') {
    if (tier >= 2 || building.upgradingToTier >= 2) {
      const cfg = CONFIG.Building.pot_upgrade;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
    if (tier >= 3 || building.upgradingToTier >= 3) {
      const cfg = CONFIG.Building.kitchen_upgrade;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
  } else if (arrayName === 'granaries') {
    if (tier >= 2 || building.upgradingToTier >= 2) {
      const cfg = CONFIG.Building.granary_t2;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
    if (tier >= 3 || building.upgradingToTier >= 3) {
      const cfg = CONFIG.Building.granary_t3;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
  } else if (arrayName === 'mills') {
    if (tier >= 2 || building.upgradingToTier >= 2) {
      const cfg = CONFIG.Building.mill_t2;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
  } else if (arrayName === 'houses') {
    if (tier >= 2 || building.upgradingToTier >= 2) {
      const cfg = CONFIG.Building.upgraded_house;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
    if (tier >= 3 || building.upgradingToTier >= 3) {
      const cfg = CONFIG.Building.luxury_house;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
  } else if (arrayName === 'smithies') {
    if (tier >= 2 || building.upgradingToTier >= 2) {
      const cfg = CONFIG.Building?.smithy_t2;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
  } else if (arrayName === 'forges') {
    if (tier >= 2 || building.upgradingToTier >= 2) {
      const cfg = CONFIG.Building?.forge_t2;
      if (cfg) { totalGold += cfg.cost_gold || 0; totalWood += cfg.cost_wood || 0; totalStone += cfg.cost_stone || 0; }
    }
  }

  // Para smithies: liberar herramientas asignadas a este taller si alguna vez las tiene
  if (arrayName === 'smithies') {
    // (las herramientas son del jugador, no del edificio — no se eliminan)
  }

  const refundGold = Math.floor(totalGold * 0.5);
  const refundWood = Math.floor(totalWood * 0.5);
  const refundStone = Math.floor(totalStone * 0.5);

  const displayNames = {
    lumberMills: 'Aserradero',
    quarries: 'Cantera',
    farms: 'Granja',
    bonfires: 'Hoguera/Cocina',
    granaries: 'Granero',
    markets: 'Puesto de Mercado',
    houses: 'Choza/Residencia',
    smithies: 'Taller del Herrero',
    forges: 'Forja',
    wells: 'Pozo',
    warehouses: 'Almacén',
    mills: 'Molino'
  };
  const bName = `${displayNames[arrayName] || 'Edificio'} #${idx + 1}`;
  
  let refundMsg = [];
  if (refundGold > 0) refundMsg.push(`🪙 ${refundGold} Oro`);
  if (refundWood > 0) refundMsg.push(`🪵 ${refundWood} Madera`);
  if (refundStone > 0) refundMsg.push(`🪨 ${refundStone} Piedra`);
  
  const refundText = refundMsg.length > 0 ? `Reembolso estimado: ${refundMsg.join(', ')}` : 'No se reembolsarán recursos.';
  
  if (!confirm(`¿Estás seguro de que deseas destruir ${bName}? ${refundText}`)) {
    return;
  }
  
  // Apply refund
  state.gold += refundGold;
  state.wood += refundWood;
  state.stone += refundStone;
  
  // Unassign workers and shift indices
  const jobPrefix = arrayName.toLowerCase();
  state.colonists.forEach(c => {
    if (c.job === `${jobPrefix}_${idx}`) {
      c.job = null;
    }
  });
  state.colonists.forEach(c => {
    if (c.job && c.job.startsWith(`${jobPrefix}_`)) {
      const parts = c.job.split('_');
      const bIdx = parseInt(parts[1]);
      if (bIdx > idx) {
        c.job = `${jobPrefix}_${bIdx - 1}`;
      }
    }
  });
  
  // For houses, unhouse residents and shift indices
  if (arrayName === 'houses') {
    state.colonists.forEach(c => {
      if (c.houseIdx === idx) {
        c.houseIdx = null;
      } else if (c.houseIdx > idx) {
        c.houseIdx = c.houseIdx - 1;
      }
    });
  }
  
  // Delete from array and reindex
  state[arrayName].splice(idx, 1);
  state[arrayName].forEach((b, i) => {
    b.id = i;
  });
  
  // Recalculate population and assignments
  if (arrayName === 'houses') {
    if (typeof recalculateMaxPopulation === 'function') recalculateMaxPopulation();
    if (typeof initializeHousingAssignments === 'function') initializeHousingAssignments();
  }
  
  showToast(`💥 ${bName} destruido correctamente.`, "success");
  
  fixColonistAllocation();
  autoAssignBuilders();
  recalculateRates();
  updateUI();
}

function recalculateWaterMax() {
  if (!state.wells) state.wells = [];
  
  const capT1 = CONFIG?.Water?.well_t1_capacity?.value ?? 50;
  const capT2 = CONFIG?.Water?.well_t2_capacity?.value ?? 120;
  
  let total = 0;
  state.wells.forEach(w => {
    if (w.isUnderConstruction) return;
    if (w.tier === 1) total += capT1;
    else if (w.tier === 2) total += capT2;
  });
  
  state.waterMax = total;
  state.waterToday = Math.min(state.waterToday || 0, state.waterMax);
}

function buildWell() {
  if (!isBuildingUnlocked('well')) {
    showToast("Requiere investigar Gestión del Agua", "warning");
    return;
  }
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción de la Casa del Jugador primero.", "warning");
    return;
  }
  const cfg = CONFIG?.Building?.well;
  if (!cfg) return;
  
  // Utilizar canAffordBuilding si está disponible, sino fallback
  if (typeof canAffordBuilding === 'function' ? canAffordBuilding(cfg) : (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone)) {
    if (typeof deductBuildingCosts === 'function') deductBuildingCosts(cfg);
    else {
      state.wood -= cfg.cost_wood;
      state.stone -= cfg.cost_stone;
    }
    
    if (!state.wells) state.wells = [];
    state.wells.push({
      id: state.wells.length,
      tier: 1,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('well', 5),
      isUpgrading: false,
      activatedAt: state.nextActivationId++,
      isPaused: false
    });
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción de Pozo. ¡Asigna constructores para comenzar!", "info");
    recalculateWaterMax();
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir el Pozo", "warning");
  }
}

function upgradeWell(idx) {
  if (!state.wells || !state.wells[idx]) return;
  const well = state.wells[idx];
  if (well.isUnderConstruction || well.isUpgrading) {
    showToast("Este pozo ya está en proceso de construcción o mejora.", "warning");
    return;
  }
  const tier = well.tier || 1;
  if (tier >= 2) {
    showToast("Este pozo ya está en el nivel máximo.", "info");
    return;
  }
  
  let cfg;
  if (tier === 1) {
    if (!isBuildingUnlocked('well_t2')) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Centro Comunitario (Nivel 2) para mejorar el Pozo a Tier 2.", "warning");
      return;
    }
    cfg = CONFIG?.Building?.well_t2;
  }
  
  if (!cfg) return;
  
  if (typeof canAffordBuilding === 'function' ? canAffordBuilding(cfg) : (state.gold >= (cfg.cost_gold || 0) && state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone)) {
    if (typeof deductBuildingCosts === 'function') deductBuildingCosts(cfg);
    else {
      state.gold -= (cfg.cost_gold || 0);
      state.wood -= cfg.cost_wood;
      state.stone -= cfg.cost_stone;
    }
    
    well.isUpgrading = true;
    well.upgradingToTier = tier + 1;
    well.constructionElapsed = 0;
    well.constructionDuration = getBuildingDuration(`well_t${tier + 1}`, 10);
    well.activatedAt = state.nextActivationId++;
    well.isPaused = false;
    autoAssignBuilders();
    
    showToast(`🏗️ Comenzando mejora de Pozo #${idx + 1} a Tier ${tier + 1}. ¡Asigna constructores para comenzar!`, "info");
    recalculateWaterMax();
    recalculateRates();
    updateUI();
  } else {
    showToast(`Recursos insuficientes para mejorar el Pozo (Oro: ${cfg.cost_gold || 0}, Madera: ${cfg.cost_wood}, Piedra: ${cfg.cost_stone})`, "warning");
  }
}

function buildMill() {
  if (!isBuildingUnlocked('mill')) {
    showToast("Requiere investigación", "warning");
    return;
  }
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción de la Casa del Jugador primero.", "warning");
    return;
  }
  const cfg = CONFIG?.Building?.mill;
  if (!cfg) return;
  
  if (typeof canAffordBuilding === 'function' ? canAffordBuilding(cfg) : (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone)) {
    if (typeof deductBuildingCosts === 'function') deductBuildingCosts(cfg);
    else {
      state.wood -= cfg.cost_wood;
      state.stone -= cfg.cost_stone;
    }
    
    if (!state.mills) state.mills = [];
    state.mills.push({
      id: state.mills.length,
      tier: 1,
      workerAssigned: 0,
      workers: [null],
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('mill', 100.8),
      isUpgrading: false,
      selectedCrop: 'wheat',
      elapsed: 0,
      isRunning: false,
      activatedAt: state.nextActivationId++,
      isPaused: false,
      cookingRecipeNow: null
    });
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción de Molino. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir el Molino", "warning");
  }
}

function upgradeMill(idx) {
  if (!state.mills || !state.mills[idx]) return;
  const mill = state.mills[idx];
  if (mill.isUnderConstruction || mill.isUpgrading) {
    showToast("Este molino ya está en proceso de construcción o mejora.", "warning");
    return;
  }
  const tier = mill.tier || 1;
  if (tier >= 2) {
    showToast("Este molino ya está en el nivel máximo.", "info");
    return;
  }
  
  let cfg;
  if (tier === 1) {
    if (!isBuildingUnlocked('mill_t2')) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento (Nivel 3) para mejorar el Molino a Tier 2.", "warning");
      return;
    }
    cfg = CONFIG?.Building?.mill_t2;
  }
  
  if (!cfg) return;
  
  if (typeof canAffordBuilding === 'function' ? canAffordBuilding(cfg) : (state.gold >= (cfg.cost_gold || 0) && state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone)) {
    if (typeof deductBuildingCosts === 'function') deductBuildingCosts(cfg);
    else {
      state.gold -= (cfg.cost_gold || 0);
      state.wood -= cfg.cost_wood;
      state.stone -= cfg.cost_stone;
    }
    
    mill.isUpgrading = true;
    mill.upgradingToTier = tier + 1;
    mill.constructionElapsed = 0;
    mill.constructionDuration = getBuildingDuration(`mill_t2`, 201.6);
    mill.activatedAt = state.nextActivationId++;
    mill.isPaused = false;
    autoAssignBuilders();
    
    showToast(`🏗️ Comenzando mejora de Molino #${idx + 1} a Tier ${tier + 1}. ¡Asigna constructores para comenzar!`, "info");
    recalculateRates();
    updateUI();
  } else {
    showToast(`Recursos insuficientes para mejorar el Molino (Oro: ${cfg.cost_gold || 0}, Madera: ${cfg.cost_wood}, Piedra: ${cfg.cost_stone})`, "warning");
  }
}

window.recalculateWaterMax = recalculateWaterMax;
window.buildWell = buildWell;
window.upgradeWell = upgradeWell;
window.buildMill = buildMill;
window.upgradeMill = upgradeMill;

function selectWeightedOrderTemplate(templates) {
  const totalWeight = templates.reduce((sum, t) => sum + (t.weight || 0), 0);
  let rand = Math.random() * totalWeight;
  for (const t of templates) {
    rand -= (t.weight || 0);
    if (rand <= 0) return t;
  }
  return templates[templates.length - 1];
}

function generateDailyOrders() {
  if (typeof state.currentDay === 'undefined') state.currentDay = 1;
  if (typeof state.ordersRefreshDay === 'undefined') state.ordersRefreshDay = 0;
  
  const refreshInterval = CONFIG?.Economy?.orders_refresh_interval?.value ?? 2;
  
  if (state.currentDay >= state.ordersRefreshDay + refreshInterval || !state.orders || state.orders.length === 0) {
    const templates = CONFIG.Order ? Object.values(CONFIG.Order) : [];
    if (templates.length === 0) return;
    
    const newOrders = [];
    for (let i = 0; i < 3; i++) {
      const template = selectWeightedOrderTemplate(templates);
      const amount = Math.floor(template.req_min + Math.random() * (template.req_max - template.req_min + 1));
      
      const rewards = [];
      for (let rIdx = 1; rIdx <= 3; rIdx++) {
        const rType = template[`reward_${rIdx}_type`] || 'none';
        if (rType && rType !== 'none') {
          const rMin = template[`reward_${rIdx}_min`] || 0;
          const rMax = template[`reward_${rIdx}_max`] || 0;
          const rAmount = Math.floor(rMin + Math.random() * (rMax - rMin + 1));
          if (rAmount > 0) {
            rewards.push({ type: rType, amount: rAmount });
          }
        }
      }
      
      newOrders.push({
        id: `order_${state.currentDay}_${i}`,
        resource: template.req_resource,
        amount: amount,
        rewards: rewards,
        completed: false
      });
    }
    
    state.orders = newOrders;
    state.ordersRefreshDay = state.currentDay;
    
    if (typeof updateUI === 'function') {
      updateUI();
    }
  }
}

function fulfillOrder(orderId) {
  if (!state.orders) return;
  const order = state.orders.find(o => o.id === orderId);
  if (!order) {
    showToast("Pedido no encontrado", "warning");
    return;
  }
  if (order.completed) {
    showToast("Este pedido ya ha sido completado", "info");
    return;
  }
  
  const currentStock = getResourceStock(order.resource);
  if (Math.floor(currentStock) >= order.amount) {
    deductResourceStock(order.resource, order.amount);
    
    // Otorgar recompensas dinámicas
    if (Array.isArray(order.rewards)) {
      order.rewards.forEach(reward => {
        if (reward.type === 'reputation') {
          state.reputation = (state.reputation || 0) + reward.amount;
        } else if (reward.type.endsWith('_seeds')) {
          const seedType = reward.type.replace('_seeds', '');
          if (state.seeds && typeof state.seeds[seedType] !== 'undefined') {
            state.seeds[seedType] += reward.amount;
          }
        } else {
          state[reward.type] = (state[reward.type] || 0) + reward.amount;
        }
      });
    } else if (order.reward) {
      state.reputation = (state.reputation || 0) + order.reward;
    }
    
    order.completed = true;
    
    const resConfig = CONFIG?.resources?.[order.resource];
    const emoji = resConfig?.Emoji || '📦';
    const name = resConfig?.Name || order.resource;
    
    showToast(`✅ ¡Pedido de ${name} entregado!`, "success");
    
    if (typeof updateGlobalFood === 'function') updateGlobalFood();
    if (typeof recalculateRates === 'function') recalculateRates();
    if (typeof updateUI === 'function') updateUI();
  }
}

function generateAvailableMissions() {
  if (!state.availableMissions) state.availableMissions = [];
  if (!window.GAME_MISSIONS || GAME_MISSIONS.length === 0) return;
  
  while (state.availableMissions.length < 2) {
    const activeHeadhuntDefIds = (state.availableMissions || [])
      .filter(m => m.status === 'active' && m.defId.startsWith('headhunt_'))
      .map(m => m.defId);
    
    const recentHeadhuntDefIds = (state.missionHistory || [])
      .filter(h => h.defId.startsWith('headhunt_') && (state.currentDay - h.completedDay) < 20)
      .map(h => h.defId);
    
    const filteredMissions = GAME_MISSIONS.filter(m => {
      if (m.id.startsWith('headhunt_')) {
        if (activeHeadhuntDefIds.includes(m.id) || recentHeadhuntDefIds.includes(m.id)) {
          return false;
        }
      }
      return true;
    });
    
    if (filteredMissions.length === 0) break;
    
    const availableDefIds = state.availableMissions.map(am => am.defId);
    const uniqueMissions = filteredMissions.filter(m => !availableDefIds.includes(m.id));
    
    const pool = uniqueMissions.length > 0 ? uniqueMissions : filteredMissions;
    
    const totalWeight = pool.reduce((sum, m) => sum + m.weight, 0);
    let rand = Math.random() * totalWeight;
    let selected = pool[pool.length - 1];
    
    for (const m of pool) {
      rand -= m.weight;
      if (rand <= 0) {
        selected = m;
        break;
      }
    }
    
    const duration = Math.floor(selected.minDays + Math.random() * (selected.maxDays - selected.minDays + 1));
    
    state.availableMissions.push({
      id: "avail_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      defId: selected.id,
      name: selected.name,
      description: selected.description,
      duration: duration,
      durationDays: duration,
      colonistsMin: selected.colonistsMin,
      colonistsMax: selected.colonistsMax,
      rewardRep: selected.rewardRep,
      rewardGold: selected.rewardGold,
      rewardSeedsType: selected.rewardSeedsType,
      rewardSeedsAmt: selected.rewardSeedsAmt,
      rewardSpecialist: selected.rewardSpecialist,
      attribute: selected.attribute,
      baseSuccessRate: selected.baseSuccessRate,
      status: 'available',
      elapsedDays: 0
    });
  }
}

function launchMission(missionAvailIdx, colonistIds) {
  if (!state.availableMissions || !state.availableMissions[missionAvailIdx]) {
    showToast("Misión no disponible", "warning");
    return;
  }
  
  const mAvail = state.availableMissions[missionAvailIdx];
  
  if (!Array.isArray(colonistIds) || colonistIds.length < mAvail.colonistsMin || colonistIds.length > mAvail.colonistsMax) {
    showToast(`Esta misión requiere entre ${mAvail.colonistsMin} y ${mAvail.colonistsMax} aldeanos`, "warning");
    return;
  }
  
  const selectedColonists = [];
  for (const cid of colonistIds) {
    const col = state.colonists.find(c => c.id === cid);
    if (!col || col.onMission) {
      showToast("Uno de los aldeanos elegidos no está disponible", "warning");
      return;
    }
    selectedColonists.push(col);
  }
  
  const prevJobs = {};
  const missionId = "active_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
  
  selectedColonists.forEach(col => {
    prevJobs[col.id] = col.job;
    col.prevJob = col.job;
    col.job = 'mission';
    col.onMission = true;
    col.missionId = missionId;
  });
  
  mAvail.status = 'active';
  mAvail.assignedColonistIds = colonistIds;
  mAvail.prevJobs = prevJobs;
  mAvail.elapsedDays = 0;
  mAvail.missionId = missionId;
  mAvail.durationDays = mAvail.duration;
  
  showToast(`🗺️ Misión iniciada: ${mAvail.name}`, "success");
  
  if (typeof fixColonistAllocation === 'function') fixColonistAllocation();
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof updateUI === 'function') updateUI();
}

function rotateMissions() {
  state.availableMissions = [];
  generateAvailableMissions();
}

function buildWarehouse(type) {
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción de la Casa del Jugador primero.", "warning");
    return;
  }
  
  let mappedType = type;
  let buildingId = '';
  if (['wood', 'stone', 'seeds', 'resource'].includes(type)) {
    buildingId = 'resource_warehouse';
    mappedType = 'resource';
  } else if (['food', 'food_granary'].includes(type)) {
    buildingId = 'food_granary';
    mappedType = 'food';
  }
  
  if (!isBuildingUnlocked(buildingId)) {
    showToast("Requiere investigar Almacenamiento Básico", "warning");
    return;
  }
  
  const cfg = CONFIG.Storage?.[buildingId];
  if (!cfg) return;
  
  if (typeof canAffordBuilding === 'function' ? canAffordBuilding(cfg) : (state.gold >= (cfg.cost_gold || 0) && state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone)) {
    if (typeof deductBuildingCosts === 'function') deductBuildingCosts(cfg);
    else {
      state.gold -= (cfg.cost_gold || 0);
      state.wood -= cfg.cost_wood;
      state.stone -= cfg.cost_stone;
    }
    
    if (!state.warehouses) state.warehouses = [];
    state.warehouses.push({
      id: state.warehouses.length,
      type: mappedType,
      tier: 1,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration(`warehouse_${type}`, 20),
      isUpgrading: false,
      activatedAt: state.nextActivationId++,
      isPaused: false
    });
    autoAssignBuilders();
    showToast(`🏗️ Comenzando construcción de ${cfg.name}. ¡Asigna constructores para comenzar!`, "info");
    recalculateRates();
    updateUI();
  } else {
    showToast(`Recursos insuficientes para construir el Almacén de ${cfg.name}`, "warning");
  }
}

function upgradeWarehouse(idx) {
  if (!state.warehouses || !state.warehouses[idx]) return;
  const warehouse = state.warehouses[idx];
  if (warehouse.isUnderConstruction || warehouse.isUpgrading) {
    showToast("Este almacén ya está en proceso de construcción o mejora.", "warning");
    return;
  }
  const tier = warehouse.tier || 1;
  if (tier >= 3) {
    showToast("Este almacén ya está en el nivel máximo.", "info");
    return;
  }
  
  const type = warehouse.type;
  let cfg;
  let buildingBaseId = type === 'resource' ? 'resource_warehouse' : 'food_granary';
  if (tier === 1) {
    if (!isBuildingUnlocked(`${buildingBaseId}_t2`)) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Centro Comunitario (Nivel 2) para mejorar el Almacén a Tier 2.", "warning");
      return;
    }
    cfg = CONFIG.Storage?.[`${buildingBaseId}_t2`];
  } else if (tier === 2) {
    if (!isBuildingUnlocked(`${buildingBaseId}_t3`)) {
      showToast("Requiere investigación", "warning");
      return;
    }
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento (Nivel 3) para mejorar el Almacén a Tier 3.", "warning");
      return;
    }
    cfg = CONFIG.Storage?.[`${buildingBaseId}_t3`];
  }
  
  if (!cfg) return;
  
  if (typeof canAffordBuilding === 'function' ? canAffordBuilding(cfg) : (state.gold >= (cfg.cost_gold || 0) && state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone)) {
    if (typeof deductBuildingCosts === 'function') deductBuildingCosts(cfg);
    else {
      state.gold -= (cfg.cost_gold || 0);
      state.wood -= cfg.cost_wood;
      state.stone -= cfg.cost_stone;
    }
    
    warehouse.isUpgrading = true;
    warehouse.upgradingToTier = tier + 1;
    warehouse.constructionElapsed = 0;
    warehouse.constructionDuration = getBuildingDuration(`warehouse_${warehouse.type}_t${tier + 1}`, tier === 1 ? 40 : 80);
    warehouse.activatedAt = state.nextActivationId++;
    warehouse.isPaused = false;
    autoAssignBuilders();
    
    showToast(`🏗️ Comenzando mejora de ${cfg.name} a Tier ${tier + 1}. ¡Asigna constructores para comenzar!`, "info");
    recalculateRates();
    updateUI();
  } else {
    showToast(`Recursos insuficientes para mejorar el Almacén de ${cfg.name}`, "warning");
  }
}

window.generateDailyOrders = generateDailyOrders;
window.fulfillOrder = fulfillOrder;
window.generateAvailableMissions = generateAvailableMissions;
window.launchMission = launchMission;
window.rotateMissions = rotateMissions;
window.buildWarehouse = buildWarehouse;
window.upgradeWarehouse = upgradeWarehouse;

function startPlayerTradeRoute(villageId, type, resource, amount) {
  if (state.playerOnMission) {
    showToast("Ya estás en un viaje comercial", "warning");
    return false;
  }

  if (!window.GAME_VILLAGES) {
    showToast("Pueblos no cargados", "warning");
    return false;
  }

  const village = window.GAME_VILLAGES.find(v => v.id === villageId);
  if (!village) {
    showToast("Pueblo no encontrado", "warning");
    return false;
  }

  let goldCost = 0;
  let resourceCost = 0;

  if (type === 'buy') {
    goldCost = village.sellsPrice * amount;
    if (state.gold < goldCost) {
      showToast(`Oro insuficiente (necesitas ${goldCost}🪙)`, "warning");
      return false;
    }
  } else if (type === 'sell') {
    resourceCost = amount;
    const isAnimal = ['chicken', 'pig', 'cow'].includes(resource);
    const currentStock = isAnimal
      ? (state.animals ? state.animals.filter(a => a.type === resource).length : 0)
      : (resource.endsWith('_seeds')
        ? (state.seeds ? state.seeds[resource.replace('_seeds', '')] || 0 : 0)
        : (state[resource] || 0));

    if (currentStock < resourceCost) {
      showToast(`Recursos insuficientes (necesitas ${resourceCost} de recurso)`, "warning");
      return false;
    }
  } else {
    showToast("Tipo de comercio inválido", "warning");
    return false;
  }

  // Descontar costes
  if (type === 'buy') {
    state.gold -= goldCost;
  } else if (type === 'sell') {
    const isAnimal = ['chicken', 'pig', 'cow'].includes(resource);
    if (isAnimal) {
      let removed = 0;
      state.animals = state.animals.filter(a => {
        if (a.type === resource && removed < resourceCost) {
          removed++;
          return false;
        }
        return true;
      });
    } else if (resource.endsWith('_seeds')) {
      state.seeds[resource.replace('_seeds', '')] -= resourceCost;
    } else {
      state[resource] -= resourceCost;
    }
  }

  const durationDays = (village.distanceDays || 1) * 2;

  state.playerOnMission = true;
  state.playerMission = {
    villageId: village.id,
    villageName: village.name,
    type: type,
    resource: resource,
    amount: amount,
    totalPrice: type === 'buy' ? goldCost : (village.buysPrice * amount),
    timeLeftDays: durationDays,
    durationDays: durationDays
  };

  showToast(`🐎 ¡Has partido de viaje comercial a ${village.name}!`, "success");

  if (typeof updateGlobalFood === 'function') updateGlobalFood();
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof updateUI === 'function') updateUI();
  return true;
}

function completePlayerTradeRoute() {
  if (!state.playerOnMission || !state.playerMission) return;

  const trade = state.playerMission;
  if (trade.type === 'buy') {
    const isAnimal = ['chicken', 'pig', 'cow'].includes(trade.resource);
    if (isAnimal) {
      if (!state.animals) state.animals = [];
      const maxCap = getAnimalsCapacity();
      const spaceLeft = maxCap - state.animals.length;
      const actualBuy = Math.min(trade.amount, spaceLeft);
      
      for (let i = 0; i < actualBuy; i++) {
        state.animals.push({
          id: state.nextActivationId || (state.animals.length + 1),
          type: trade.resource,
          fedToday: false
        });
        if (state.nextActivationId) state.nextActivationId++;
      }
      
      showToast(`✅ ¡Has regresado de tu viaje a ${trade.villageName}! Traes x${actualBuy} de ${trade.resource} a tus corrales.`, "success");
      
      if (actualBuy < trade.amount) {
        const refund = (trade.amount - actualBuy) * (trade.totalPrice / trade.amount);
        state.gold += refund;
        showToast(`⚠️ No había espacio suficiente en los corrales. Se reembolsaron ${refund.toFixed(0)}🪙 por los animales sobrantes.`, "warning");
      }
    } else {
      addResourceStock(trade.resource, trade.amount);
      showToast(`✅ ¡Has regresado de tu viaje a ${trade.villageName}! Traes x${trade.amount} de ${trade.resource}.`, "success");
    }
  } else if (trade.type === 'sell') {
    state.gold += trade.totalPrice;
    showToast(`✅ ¡Has regresado de tu viaje a ${trade.villageName}! Vendiste por ${trade.totalPrice}🪙.`, "success");
  }

  state.playerOnMission = false;
  state.playerMission = null;

  if (typeof updateGlobalFood === 'function') updateGlobalFood();
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof updateUI === 'function') updateUI();
}

function assignColonistToMarket(slotIdx, colonistId) {
  const countMarkets = state.markets ? state.markets.length : 0;
  const isMarketBuilt = countMarkets > 0 && !state.markets[0].isUnderConstruction;
  if (!isMarketBuilt) {
    showToast("Requiere un Puesto de Mercado construido", "warning");
    return false;
  }

  const colonist = state.colonists.find(c => c.id === colonistId);
  if (!colonist) {
    showToast("Colono no encontrado", "warning");
    return false;
  }

  if (colonist.job !== null || colonist.onMission || colonist.isStarving) {
    showToast("El colono seleccionado no está disponible", "warning");
    return false;
  }

  // Desasignar cualquier colono que estuviera previamente en este slot
  state.colonists.forEach(c => {
    if (c.job === 'merchant_slot_' + slotIdx) {
      c.job = null;
    }
  });

  colonist.job = 'merchant_slot_' + slotIdx;
  
  if (state.markets && state.markets[0]) {
    const assignedCount = state.colonists.filter(c => c.job && c.job.startsWith('merchant_slot_')).length;
    state.markets[0].workerAssigned = assignedCount;
  }

  showToast(`💼 Colono ${colonist.name} asignado como Mercader Slot ${slotIdx + 1}`, "success");
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof updateUI === 'function') updateUI();
  return true;
}

function unassignColonistFromMarket(slotIdx) {
  const colonist = state.colonists.find(c => c.job === 'merchant_slot_' + slotIdx);
  if (!colonist) return false;

  if (colonist.onMission) {
    showToast("No puedes desasignar al colono mientras esté en viaje comercial", "warning");
    return false;
  }

  colonist.job = null;

  if (state.markets && state.markets[0]) {
    const assignedCount = state.colonists.filter(c => c.job && c.job.startsWith('merchant_slot_')).length;
    state.markets[0].workerAssigned = assignedCount;
  }

  showToast(`💼 Mercader Slot ${slotIdx + 1} desasignado`, "info");
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof updateUI === 'function') updateUI();
  return true;
}

function startTradeRoute(villageId, type, resource, amount, slotIdx) {
  if (!window.GAME_VILLAGES) {
    showToast("Pueblos no cargados", "warning");
    return false;
  }
  const village = window.GAME_VILLAGES.find(v => v.id === villageId);
  if (!village) {
    showToast("Pueblo no encontrado", "warning");
    return false;
  }

  const colonist = state.colonists.find(c => c.job === 'merchant_slot_' + slotIdx);
  if (!colonist) {
    showToast("No hay ningún colono asignado a este slot de mercado", "warning");
    return false;
  }
  if (colonist.onMission || colonist.isStarving) {
    showToast("El colono mercader no está disponible o está hambriento", "warning");
    return false;
  }

  let goldCost = 0;
  let resourceCost = 0;

  if (type === 'buy') {
    goldCost = village.sellsPrice * amount;
    if (state.gold < goldCost) {
      showToast(`Oro insuficiente (necesitas ${goldCost}🪙)`, "warning");
      return false;
    }
  } else if (type === 'sell') {
    resourceCost = amount;
    const isAnimal = ['chicken', 'pig', 'cow'].includes(resource);
    const currentStock = isAnimal
      ? (state.animals ? state.animals.filter(a => a.type === resource).length : 0)
      : (resource.endsWith('_seeds')
        ? (state.seeds ? state.seeds[resource.replace('_seeds', '')] || 0 : 0)
        : (state[resource] || 0));

    if (currentStock < resourceCost) {
      showToast(`Recursos insuficientes (necesitas ${resourceCost} de recurso)`, "warning");
      return false;
    }
  } else {
    showToast("Tipo de comercio inválido", "warning");
    return false;
  }

  const tradeId = "trade_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
  
  if (type === 'buy') {
    state.gold -= goldCost;
  } else if (type === 'sell') {
    const isAnimal = ['chicken', 'pig', 'cow'].includes(resource);
    if (isAnimal) {
      let removed = 0;
      state.animals = state.animals.filter(a => {
        if (a.type === resource && removed < resourceCost) {
          removed++;
          return false;
        }
        return true;
      });
    } else if (resource.endsWith('_seeds')) {
      state.seeds[resource.replace('_seeds', '')] -= resourceCost;
    } else {
      state[resource] -= resourceCost;
    }
  }

  colonist.onMission = true;
  colonist.missionId = tradeId;

  const durationDays = (village.distanceDays || 1) * 2;
  
  const newTrade = {
    id: tradeId,
    villageId: village.id,
    villageName: village.name,
    type: type,
    resource: resource,
    amount: amount,
    totalPrice: type === 'buy' ? goldCost : (village.buysPrice * amount),
    timeLeftDays: durationDays,
    durationDays: durationDays,
    colonistId: colonist.id,
    colonistName: colonist.name,
    slotIdx: slotIdx
  };

  if (!state.activeTrades) {
    state.activeTrades = [];
  }
  state.activeTrades.push(newTrade);

  showToast(`🚚 Caravana enviada a ${village.name} con ${colonist.name}!`, "success");

  if (typeof updateGlobalFood === 'function') updateGlobalFood();
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof updateUI === 'function') updateUI();
  return true;
}

function completeTradeRoute(trade) {
  if (trade.type === 'buy') {
    const isAnimal = ['chicken', 'pig', 'cow'].includes(trade.resource);
    if (isAnimal) {
      if (!state.animals) state.animals = [];
      const maxCap = getAnimalsCapacity();
      const spaceLeft = maxCap - state.animals.length;
      const actualBuy = Math.min(trade.amount, spaceLeft);
      
      for (let i = 0; i < actualBuy; i++) {
        state.animals.push({
          id: state.nextActivationId || (state.animals.length + 1),
          type: trade.resource,
          fedToday: false
        });
        if (state.nextActivationId) state.nextActivationId++;
      }
      
      showToast(`✅ ¡La caravana de ${trade.villageName} ha regresado! Traes x${actualBuy} de ${trade.resource}.`, "success");
      
      if (actualBuy < trade.amount) {
        const refund = (trade.amount - actualBuy) * (trade.totalPrice / trade.amount);
        state.gold += refund;
        showToast(`⚠️ No había espacio suficiente en los corrales. Se reembolsaron ${refund.toFixed(0)}🪙 por los animales sobrantes.`, "warning");
      }
    } else {
      addResourceStock(trade.resource, trade.amount);
      showToast(`✅ ¡La caravana de ${trade.villageName} ha regresado! Comprado x${trade.amount} de ${trade.resource}.`, "success");
    }
  } else if (trade.type === 'sell') {
    state.gold += trade.totalPrice;
    showToast(`✅ ¡La caravana de ${trade.villageName} ha regresado! Vendido por ${trade.totalPrice}🪙.`, "success");
  }

  const colonist = state.colonists.find(c => c.id === trade.colonistId);
  if (colonist) {
    colonist.onMission = false;
    colonist.missionId = null;
  }

  if (typeof updateGlobalFood === 'function') updateGlobalFood();
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof updateUI === 'function') updateUI();
}

window.startPlayerTradeRoute = startPlayerTradeRoute;
window.completePlayerTradeRoute = completePlayerTradeRoute;
window.assignColonistToMarket = assignColonistToMarket;
window.unassignColonistFromMarket = unassignColonistFromMarket;
window.startTradeRoute = startTradeRoute;
window.completeTradeRoute = completeTradeRoute;

function discardResource(resourceId, amount) {
  const currentStock = getResourceStock(resourceId);
  if (currentStock <= 0) {
    showToast("No hay stock para descartar", "warning");
    return;
  }
  
  const toDiscard = amount === 'all' ? currentStock : Math.min(amount, currentStock);
  if (toDiscard <= 0) return;
  
  deductResourceStock(resourceId, toDiscard);
  updateGlobalFood();
  if (typeof recalculateRates === 'function') recalculateRates();
  updateUI();
  
  const rawNames = {
    wood: 'Madera', stone: 'Piedra',
    wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos',
    cooked_wheat: 'Pan', cooked_potato: 'Patata Asada', cooked_carrot: 'Zan. Asada', cooked_berries: 'Mermelada',
    wheat_seeds: 'Semillas de Trigo', potato_seeds: 'Semillas de Patata', carrot_seeds: 'Semillas de Zanahoria'
  };
  
  showToast(`Se han descartado ${toDiscard.toFixed(0)} de ${rawNames[resourceId] || resourceId}`, "info");
}

window.discardResource = discardResource;

function startResearch(techId) {
  if (!CONFIG || !CONFIG.Tech || !CONFIG.Tech[techId]) {
    showToast("Tecnología no encontrada.", "warning");
    return;
  }
  const tech = CONFIG.Tech[techId];
  
  if (state.researchQueue) {
    showToast("Ya hay una investigación en curso.", "warning");
    return;
  }
  
  if (state.unlockedTechs && state.unlockedTechs.includes(techId)) {
    showToast("Esta tecnología ya está investigada.", "info");
    return;
  }
  
  const thTier = (state.townHall && state.townHall.tier) || 1;
  const reqTh = tech.req_th || 1;
  if (thTier < reqTh) {
    showToast(`Se requiere Ayuntamiento nivel ${reqTh} para investigar esto.`, "warning");
    return;
  }
  
  const reqTech = tech.req_tech || 'none';
  if (reqTech !== 'none' && (!state.unlockedTechs || !state.unlockedTechs.includes(reqTech))) {
    const parentTechName = CONFIG.Tech[reqTech] ? CONFIG.Tech[reqTech].name : reqTech;
    showToast(`Requiere investigar primero: ${parentTechName}`, "warning");
    return;
  }
  
  const costGold = tech.cost_gold || 0;
  const costWood = tech.cost_wood || 0;
  const costStone = tech.cost_stone || 0;
  const costRep = tech.cost_reputation || tech.cost_rep || 0;
  
  if (state.gold < costGold || state.wood < costWood || state.stone < costStone || (state.reputation || 0) < costRep) {
    showToast("Recursos o reputación insuficientes.", "warning");
    return;
  }
  
  state.gold -= costGold;
  state.wood -= costWood;
  state.stone -= costStone;
  state.reputation = (state.reputation || 0) - costRep;
  
  const days = tech.research_days !== undefined ? tech.research_days : 0;
  if (days <= 0) {
    if (!state.unlockedTechs) state.unlockedTechs = [];
    state.unlockedTechs.push(techId);
    showToast(`¡Investigación completada: ${tech.name}!`, "success");
  } else {
    state.researchQueue = {
      techId: techId,
      elapsed: 0,
      duration: days
    };
    showToast(`🎓 Comenzando investigación: ${tech.name} (${days} días).`, "info");
  }
  
  recalculateRates();
  updateUI();
  saveGame();
}

function completeResearch() {
  if (!state.researchQueue) return;
  const techId = state.researchQueue.techId;
  const tech = CONFIG.Tech[techId];
  
  if (!state.unlockedTechs) state.unlockedTechs = [];
  if (!state.unlockedTechs.includes(techId)) {
    state.unlockedTechs.push(techId);
  }
  
  state.researchQueue = null;
  
  showToast(`🎓 ¡Investigación completada: ${tech ? tech.name : techId}!`, "success");
  
  recalculateRates();
  updateUI();
  saveGame();
}

window.startResearch = startResearch;
window.completeResearch = completeResearch;

function devUnlockAllTechs() {
  if (CONFIG && CONFIG.Tech) {
    state.unlockedTechs = Object.keys(CONFIG.Tech);
    state.researchQueue = null;
    showToast("🔓 Todas las tecnologías han sido investigadas.", "success");
    recalculateRates();
    updateUI();
    saveGame();
  }
}

function devBuildOneOfEach() {
  // 1. Choza
  if (!state.houses) state.houses = [];
  state.houses.push({
    id: state.houses.length,
    tier: 1,
    isUnderConstruction: false,
    constructionElapsed: 1,
    constructionDuration: 1,
    workerAssigned: 0,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });

  // 2. Aserradero
  if (!state.lumberMills) state.lumberMills = [];
  state.lumberMills.push({
    id: state.lumberMills.length,
    workerAssigned: 0,
    tier: 1,
    isUnderConstruction: false,
    constructionElapsed: 5,
    constructionDuration: 5,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });

  // 3. Cantera
  if (!state.quarries) state.quarries = [];
  state.quarries.push({
    id: state.quarries.length,
    workerAssigned: 0,
    tier: 1,
    isUnderConstruction: false,
    constructionElapsed: 5,
    constructionDuration: 5,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });

  // 4. Granja
  if (!state.farms) state.farms = [];
  state.farms.push({
    id: state.farms.length,
    workerAssigned: 0,
    crop: 'wheat',
    stage: 'idle',
    stageElapsed: 0,
    activeCrop: 'wheat',
    needsWatering: false,
    waterElapsed: 0,
    wateringsCompleted: 0,
    isUnderConstruction: false,
    constructionElapsed: 5,
    constructionDuration: 5,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });

  // 5. Fogata
  if (!state.bonfires) state.bonfires = [];
  state.bonfires.push({
    id: state.bonfires.length,
    workerAssigned: 0,
    elapsed: 0,
    isRunning: false,
    mode: 'none',
    tier: 1,
    isUnderConstruction: false,
    constructionElapsed: 5,
    constructionDuration: 5,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });

  // 6. Mercado
  if (!state.markets) state.markets = [];
  state.markets.push({
    id: state.markets.length,
    workerAssigned: 0,
    elapsed: 0,
    isRunning: false,
    sales: { food: 0, stone: 0, wood: 0 },
    tier: 1,
    isUnderConstruction: false,
    constructionElapsed: 5,
    constructionDuration: 5,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });

  // 7. Granero
  if (!state.granaries) state.granaries = [];
  state.granaries.push({
    id: state.granaries.length,
    tier: 1,
    workerAssigned: 0,
    isUnderConstruction: false,
    constructionElapsed: 5,
    constructionDuration: 5,
    isUpgrading: false,
    selectedCrop: 'wheat',
    elapsed: 0,
    isRunning: false,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });

  // 8. Pozo
  if (!state.wells) state.wells = [];
  state.wells.push({
    id: state.wells.length,
    tier: 1,
    isUnderConstruction: false,
    constructionElapsed: 5,
    constructionDuration: 5,
    isUpgrading: false,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });

  // 9. Almacenes (Recursos y Comida)
  if (!state.warehouses) state.warehouses = [];
  state.warehouses.push({
    id: state.warehouses.length,
    type: 'resource',
    tier: 1,
    isUnderConstruction: false,
    constructionElapsed: 20,
    constructionDuration: 20,
    isUpgrading: false,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });
  state.warehouses.push({
    id: state.warehouses.length,
    type: 'food',
    tier: 1,
    isUnderConstruction: false,
    constructionElapsed: 20,
    constructionDuration: 20,
    isUpgrading: false,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });

  showToast("🏗️ Construido un edificio de cada tipo (completados).", "success");
  
  if (typeof recalculateMaxPopulation === 'function') recalculateMaxPopulation();
  if (typeof initializeHousingAssignments === 'function') initializeHousingAssignments();
  if (typeof recalculateWaterMax === 'function') recalculateWaterMax();
  if (typeof recalculateStorageCapacity === 'function') recalculateStorageCapacity();
  recalculateRates();
  updateUI();
  saveGame();
}

window.devUnlockAllTechs = devUnlockAllTechs;
window.devBuildOneOfEach = devBuildOneOfEach;

// ============================================================
// PASO L - [MET-TALL] Taller del Herrero
// ============================================================

function buildSmithy() {
  const isUnlocked = isBuildingUnlocked('smithy');
  const thBuilt = state.townHall && state.townHall.built;
  const thUnderConst = state.townHall && state.townHall.isUnderConstruction;
  const maxTier = state.maxBuildingTier || 0;
  const cfg = CONFIG?.Building?.smithy;
  
  console.log("[DEBUG SMITHY BUILD] isUnlocked:", isUnlocked, "thBuilt:", thBuilt, "thUnderConst:", thUnderConst, "maxTier:", maxTier, "cfg:", cfg);

  if (!isUnlocked) {
    showToast(`🔒 Requiere investigar Herramientas Mejoradas. (Desbloqueado: ${isUnlocked})`, "warning");
    return;
  }
  if (!thBuilt || thUnderConst) {
    showToast(`Debes completar la construcción del Ayuntamiento primero. (Construido: ${thBuilt}, En construcción: ${thUnderConst})`, "warning");
    return;
  }
  if (!cfg) { 
    showToast("Error: configuración del Taller no encontrada en CONFIG.Building.smithy.", "error"); 
    return; 
  }
  const reqTh = typeof cfg.req_th !== 'undefined' ? cfg.req_th : 2;
  if (maxTier < reqTh) {
    showToast(`Se requiere Ayuntamiento (Nivel ${reqTh}) para construir el Taller. (Nivel de construcción actual: Tier ${maxTier})`, "warning");
    return;
  }
  if (!canAffordBuilding(cfg)) {
    showToast(`Recursos insuficientes (Coste: 🪵${cfg.cost_wood} Madera, 🪨${cfg.cost_stone} Piedra. Tienes: 🪵${Math.floor(state.wood)}, 🪨${Math.floor(state.stone)})`, "warning");
    return;
  }
  state.wood  -= cfg.cost_wood  || 0;
  state.stone -= cfg.cost_stone || 0;
  state.gold  -= cfg.cost_gold  || 0;
  const duration = getBuildingDuration('smithy', 50.4);
  state.smithies.push({
    id: state.smithies.length,
    tier: 1,
    workerAssigned: 0,
    workers: [null],
    isUnderConstruction: true,
    constructionElapsed: 0,
    constructionDuration: duration,
    isUpgrading: false,
    upgradeElapsed: 0,
    selectedTool: 'axe_t1',
    elapsed: 0,
    isRunning: false,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });
  autoAssignBuilders();
  showToast("🏗️ Comenzando construcción del Taller del Herrero.", "info");
  recalculateRates();
  updateUI();
}

function upgradeSmithy(idx) {
  if (!state.smithies || !state.smithies[idx]) return;
  const smithy = state.smithies[idx];
  if (smithy.isUnderConstruction || smithy.isUpgrading) {
    showToast("El Taller ya está en proceso de construcción o mejora.", "warning");
    return;
  }
  const tier = smithy.tier || 1;
  if (tier >= 2) {
    showToast("El Taller ya está en el nivel máximo.", "info");
    return;
  }
  if (!isBuildingUnlocked('smithy_t2')) {
    showToast("🔒 Requiere investigación para mejorar el Taller a T2.", "warning");
    return;
  }
  const cfg = CONFIG?.Building?.smithy_t2;
  if (!cfg) return;
  const reqTh = typeof cfg.req_th !== 'undefined' ? cfg.req_th : 3;
  if (state.maxBuildingTier < reqTh) {
    showToast(`Se requiere Ayuntamiento Nivel ${reqTh} para mejorar el Taller a T2. (Nivel de construcción actual: Tier ${state.maxBuildingTier})`, "warning");
    return;
  }
  if (!canAffordBuilding(cfg)) {
    showToast(`Recursos insuficientes para mejorar el Taller (🪙${cfg.cost_gold} Oro, 🪵${cfg.cost_wood}, 🪨${cfg.cost_stone})`, "warning");
    return;
  }
  state.gold  -= cfg.cost_gold  || 0;
  state.wood  -= cfg.cost_wood  || 0;
  state.stone -= cfg.cost_stone || 0;
  const duration = getBuildingDuration('smithy_t2', 100.8);
  smithy.isUpgrading = true;
  smithy.upgradingToTier = 2;
  smithy.constructionElapsed = 0;
  smithy.constructionDuration = duration;
  autoAssignBuilders();
  showToast(`🏗️ Mejorando Taller del Herrero #${idx + 1} a Tier 2.`, "info");
  recalculateRates();
  updateUI();
}


/** Asigna una herramienta (por id) a un edificio. Solo si la herramienta está libre y es del tipo correcto. */
function assignTool(toolId, buildingType, buildingIdx) {
  const tool = state.tools.find(t => t.id === toolId);
  if (!tool) return;
  const required = TOOL_REQUIREMENTS[buildingType];
  if (!required) return;
  // Verificar tipo compatible (axe, pickaxe, hoe, weapon)
  if (tool.type !== required) {
    showToast(`⚠️ Este edificio necesita ${required}, no ${tool.type}`, "warning");
    return;
  }
  if (tool.assignedTo !== null) {
    showToast("⚠️ Esta herramienta ya está asignada a otro edificio.", "warning");
    return;
  }
  if (tool.durability <= 0) {
    showToast("⚠️ Esta herramienta está rota, no se puede asignar.", "warning");
    return;
  }
  const assignKey = `${buildingType.toLowerCase()}_${buildingIdx}`;
  tool.assignedTo = assignKey;
  showToast(`🔧 Herramienta asignada a ${buildingType} #${buildingIdx + 1}`, "success");
  recalculateRates();
  updateUI();
}

/** Desasigna la herramienta de un edificio concreto */
function unassignTool(buildingType, buildingIdx) {
  const assignKey = `${buildingType.toLowerCase()}_${buildingIdx}`;
  const tool = state.tools.find(t => t.assignedTo === assignKey);
  if (!tool) return;
  tool.assignedTo = null;
  showToast(`🔧 Herramienta liberada de ${buildingType} #${buildingIdx + 1}`, "info");
  recalculateRates();
  updateUI();
}

window.buildSmithy = buildSmithy;
window.upgradeSmithy = upgradeSmithy;
window.assignTool = assignTool;
window.unassignTool = unassignTool;

// PASO M - [MET-FORJA] Forja
// ============================================================

function buildForge() {
  const isUnlocked = isBuildingUnlocked('forge');
  const thBuilt = state.townHall && state.townHall.built;
  const thUnderConst = state.townHall && state.townHall.isUnderConstruction;
  const maxTier = state.maxBuildingTier || 0;
  const cfg = CONFIG?.Building?.forge;
  
  if (!isUnlocked) {
    showToast("🔒 Requiere investigar Trabajo en Hierro.", "warning");
    return;
  }
  if (!thBuilt || thUnderConst) {
    showToast("Debes completar la construcción del Ayuntamiento primero.", "warning");
    return;
  }
  if (!cfg) { 
    showToast("Error: configuración de la Forja no encontrada en CONFIG.Building.forge.", "error"); 
    return; 
  }
  const reqTh = typeof cfg.req_th !== 'undefined' ? cfg.req_th : 2;
  if (maxTier < reqTh) {
    showToast(`Se requiere Ayuntamiento (Nivel ${reqTh}) para construir la Forja.`, "warning");
    return;
  }
  if (!canAffordBuilding(cfg)) {
    showToast(`Recursos insuficientes (Coste: 🪵${cfg.cost_wood} Madera, 🪨${cfg.cost_stone} Piedra. Tienes: 🪵${Math.floor(state.wood)}, 🪨${Math.floor(state.stone)})`, "warning");
    return;
  }
  state.wood  -= cfg.cost_wood  || 0;
  state.stone -= cfg.cost_stone || 0;
  state.gold  -= cfg.cost_gold  || 0;
  const duration = getBuildingDuration('forge', 50.4);
  
  if (!Array.isArray(state.forges)) state.forges = [];
  state.forges.push({
    id: state.forges.length,
    tier: 1,
    workerAssigned: 0,
    isUnderConstruction: true,
    constructionElapsed: 0,
    constructionDuration: duration,
    isUpgrading: false,
    upgradeElapsed: 0,
    elapsed: 0,
    isRunning: false,
    activatedAt: state.nextActivationId++,
    isPaused: false
  });
  autoAssignBuilders();
  showToast("🏗️ Comenzando construcción de la Forja.", "info");
  recalculateRates();
  updateUI();
}

function upgradeForge(idx) {
  if (!state.forges || !state.forges[idx]) return;
  const forge = state.forges[idx];
  if (forge.isUnderConstruction || forge.isUpgrading) {
    showToast("La Forja ya está en proceso de construcción o mejora.", "warning");
    return;
  }
  const tier = forge.tier || 1;
  if (tier >= 2) {
    showToast("La Forja ya está en el nivel máximo.", "info");
    return;
  }
  const cfg = CONFIG?.Building?.forge_t2;
  if (!cfg) return;
  const reqTh = typeof cfg.req_th !== 'undefined' ? cfg.req_th : 3;
  if (state.maxBuildingTier < reqTh) {
    showToast(`Se requiere Ayuntamiento Nivel ${reqTh} para mejorar la Forja a T2.`, "warning");
    return;
  }
  if (!canAffordBuilding(cfg)) {
    showToast(`Recursos insuficientes para mejorar la Forja (🪙${cfg.cost_gold} Oro, 🪵${cfg.cost_wood}, 🪨${cfg.cost_stone})`, "warning");
    return;
  }
  state.gold  -= cfg.cost_gold  || 0;
  state.wood  -= cfg.cost_wood  || 0;
  state.stone -= cfg.cost_stone || 0;
  const duration = getBuildingDuration('forge_t2', 100.8);
  forge.isUpgrading = true;
  forge.upgradingToTier = 2;
  forge.constructionElapsed = 0;
  forge.constructionDuration = duration;
  autoAssignBuilders();
  showToast(`🏗️ Mejorando Forja #${idx + 1} a Tier 2.`, "info");
  recalculateRates();
  updateUI();
}

window.buildForge = buildForge;
window.upgradeForge = upgradeForge;

function buyAnimal(type) {
  const buyKey = `buy_${type}`;
  if (!CONFIG || !CONFIG.Sales || !CONFIG.Sales[buyKey]) {
    showToast("Configuración de animal no encontrada", "warning");
    return;
  }

  if (!state.animals) state.animals = [];
  const maxCap = getAnimalsCapacity();
  if (state.animals.length >= maxCap) {
    showToast(`No tienes espacio en tus corrales para albergar más animales. (Capacidad actual: ${maxCap})`, "warning");
    return;
  }

  const recipe = CONFIG.Sales[buyKey];
  const price = recipe.cost_gold || 0;
  if (state.gold >= price) {
    state.gold -= price;
    state.animals.push({
      id: state.nextActivationId || (state.animals.length + 1),
      type: type,
      fedToday: false
    });
    if (state.nextActivationId) {
      state.nextActivationId++;
    }
    showToast(`¡Comprado: ${recipe.name} por ${price}🪙!`, "success");
    recalculateRates();
    updateUI();
    saveGame();
  } else {
    showToast("Oro insuficiente para comprar el animal", "warning");
  }
}

function fertilizeFarm(farmIdx) {
  if (!state.farms || !state.farms[farmIdx]) return;
  const farm = state.farms[farmIdx];
  if (state.fertilizer >= 1 && (farm.stage === 'grow' || farm.stage === 'grow2') && !farm.isUnderConstruction) {
    state.fertilizer -= 1;
    const cropKey = farm.activeCrop || farm.crop || 'wheat';
    const stageKey = `stage_${farm.stage}_${cropKey}`;
    const stageDuration = (CONFIG.Timing && CONFIG.Timing[stageKey]) ? CONFIG.Timing[stageKey].duration : 5;
    farm.stageElapsed = (farm.stageElapsed || 0) + (stageDuration * 0.5);
    showToast(`🌱 ¡Campo #${farmIdx + 1} fertilizado!`, "success");
    recalculateRates();
    updateUI();
    saveGame();
  }
}

window.buyAnimal = buyAnimal;
window.fertilizeFarm = fertilizeFarm;

function buildCorral() {
  if (!state.townHall.built || state.townHall.isUnderConstruction) {
    showToast("Debes completar la construcción del Ayuntamiento primero.", "warning");
    return;
  }
  const cfg = CONFIG.Building.corral;
  if (!cfg) return;
  if (state.gold >= (cfg.cost_gold || 0) && state.wood >= (cfg.cost_wood || 0)) {
    state.gold -= (cfg.cost_gold || 0);
    state.wood -= (cfg.cost_wood || 0);
    if (!state.corrals) state.corrals = [];
    state.corrals.push({
      id: state.corrals.length,
      tier: 1,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: getBuildingDuration('corral', 16.8),
      isUpgrading: false,
      activatedAt: state.nextActivationId++,
      isPaused: false
    });
    autoAssignBuilders();
    showToast("🏗️ Comenzando construcción de Corral. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
    saveGame();
  } else {
    showToast("Recursos insuficientes para construir el Corral de Ganado (40🪙, 60🪵)", "warning");
  }
}

function upgradeCorral(idx) {
  if (!state.corrals || !state.corrals[idx]) return;
  const corral = state.corrals[idx];
  if (corral.isUnderConstruction || corral.isUpgrading) {
    showToast("Este corral ya está en proceso de construcción o mejora.", "warning");
    return;
  }
  const tier = corral.tier || 1;
  if (tier >= 3) {
    showToast("Este corral ya está en el nivel máximo.", "info");
    return;
  }
  
  let cfg;
  if (tier === 1) {
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Ayuntamiento de Nivel 2 para mejorar el Corral a Tier 2.", "warning");
      return;
    }
    cfg = CONFIG.Building.corral_t2;
  } else if (tier === 2) {
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento de Nivel 3 para mejorar el Corral a Tier 3.", "warning");
      return;
    }
    cfg = CONFIG.Building.corral_t3;
  }
  
  if (!cfg) return;
  
  if (state.gold >= (cfg.cost_gold || 0) && state.wood >= (cfg.cost_wood || 0) && state.stone >= (cfg.cost_stone || 0)) {
    state.gold -= (cfg.cost_gold || 0);
    state.wood -= (cfg.cost_wood || 0);
    state.stone -= (cfg.cost_stone || 0);
    
    corral.isUpgrading = true;
    corral.upgradingToTier = tier + 1;
    corral.constructionElapsed = 0;
    corral.constructionDuration = getBuildingDuration(`corral_t${tier + 1}`, tier === 1 ? 33.6 : 67.2);
    corral.activatedAt = state.nextActivationId++;
    
    autoAssignBuilders();
    showToast(`🏗️ Comenzando mejora de Corral a Tier ${tier + 1}.`, "info");
    recalculateRates();
    updateUI();
    saveGame();
  } else {
    showToast(`Recursos insuficientes para mejorar el Corral.`, "warning");
  }
}

window.buildCorral = buildCorral;
window.upgradeCorral = upgradeCorral;

