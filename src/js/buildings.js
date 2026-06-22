// ASIGNACIÓN DE TRABAJOS BÁSICOS
function assignJob(job, val) {
  if (val > 0) {
    if (state.freeColonists > 0) {
      state.jobs[job] += 1;
      state.freeColonists -= 1;
      const jobName = job === 'wood' ? 'Leñador' : job === 'stone' ? 'Cantero' : 'Recolector de Frutos';
      showToast(`Aldeano asignado a ${jobName}`);
    } else {
      showToast("No tienes aldeanos libres disponibles", "warning");
    }
  } else {
    if (state.jobs[job] > 0) {
      state.jobs[job] -= 1;
      state.freeColonists += 1;
      const jobName = job === 'wood' ? 'Leñador' : job === 'stone' ? 'Cantero' : 'Recolector de Frutos';
      showToast(`Aldeano retirado de ${jobName}`);
    }
  }
  recalculateRates();
  updateUI();
}

// ASIGNACIÓN A EDIFICIO INDIVIDUAL
function assignBuildingWorker(type, index, val) {
  const list = state[type];
  if (!list || !list[index]) return;
  const building = list[index];
  
  // Las viviendas no usan aldeanos una vez terminadas de construir y si no se están mejorando
  if (type === 'houses' && !building.isUnderConstruction && !building.isUpgrading) {
    return;
  }
  
  const isIndustrial = type === 'lumberMills' || type === 'quarries' || type === 'bonfires' || type === 'granaries';
  const maxWorkers = (building.isUnderConstruction || building.isUpgrading) ? 2 : (isIndustrial ? (building.tier || 1) : 1);
  
  if (val > 0) {
    if (state.freeColonists > 0) {
      if (building.workerAssigned >= maxWorkers) {
        showToast(`Este edificio ya tiene el máximo de aldeanos asignados (${maxWorkers})`, "warning");
        return;
      }
      building.workerAssigned = (building.workerAssigned || 0) + 1;
      state.freeColonists -= 1;
      showToast("Aldeano asignado al edificio");
    } else {
      showToast("No tienes aldeanos libres disponibles", "warning");
    }
  } else {
    if (building.workerAssigned > 0) {
      building.workerAssigned -= 1;
      state.freeColonists += 1;
      showToast("Aldeano retirado del edificio");
    }
  }
  recalculateRates();
  updateUI();
}

function assignTownHallWorker(val) {
  if (!state.townHall.built) return;
  if (!state.townHall.isUnderConstruction && !state.townHall.isUpgrading) return;
  
  const maxWorkers = 2;
  
  if (val > 0) {
    if (state.freeColonists > 0) {
      if ((state.townHall.workerAssigned || 0) >= maxWorkers) {
        showToast(`El Ayuntamiento ya tiene el máximo de aldeanos asignados (${maxWorkers})`, "warning");
        return;
      }
      state.townHall.workerAssigned = (state.townHall.workerAssigned || 0) + 1;
      state.freeColonists -= 1;
      showToast("Aldeano asignado a la construcción del Ayuntamiento");
    } else {
      showToast("No tienes aldeanos libres disponibles", "warning");
    }
  } else {
    if ((state.townHall.workerAssigned || 0) > 0) {
      state.townHall.workerAssigned -= 1;
      state.freeColonists += 1;
      showToast("Aldeano retirado de la construcción del Ayuntamiento");
    }
  }
  recalculateRates();
  updateUI();
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
          markets: 'Puesto de Mercado'
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
  const cap1 = 1;
  const cap2 = 2;
  const cap3 = 4;
  
  state.basicHouses = state.houses.filter(h => h.tier === 1 && !h.isUnderConstruction).length;
  state.upgradedHouses = state.houses.filter(h => h.tier === 2 && !h.isUnderConstruction).length;
  state.luxuryHouses = state.houses.filter(h => h.tier === 3 && !h.isUnderConstruction).length;
  
  state.maxPopulation = state.basicHouses * cap1 + state.upgradedHouses * cap2 + state.luxuryHouses * cap3;
}

function buildBasicHouse() {
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
      constructionDuration: (cfg && cfg.duration) || 1,
      workerAssigned: 0
    });
    
    recalculateMaxPopulation();
    
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
      house.constructionDuration = (cfg && cfg.duration) || 2;
      house.workerAssigned = 0;
      
      showToast(`🏗️ Comenzando mejora de Choza #${idx + 1} a Cabaña. ¡Asigna constructores para comenzar!`, "info");
      recalculateRates();
      updateUI();
    } else {
      showToast("Recursos insuficientes para mejorar a Cabaña (Requiere 40 Madera y 30 Piedra)", "warning");
    }
  } else if (house.tier === 2) {
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento de Nivel 3 para mejorar viviendas a Tier 3.", "warning");
      return;
    }
    // Upgrade to Tier 3 (Casa Grande): 50 Gold, 80 Wood, 60 Stone
    if (state.gold >= 50 && state.wood >= 80 && state.stone >= 60) {
      state.gold -= 50;
      state.wood -= 80;
      state.stone -= 60;
      
      house.isUpgrading = true;
      house.upgradingToTier = 3;
      house.constructionElapsed = 0;
      house.constructionDuration = 3;
      house.workerAssigned = 0;
      
      showToast(`🏗️ Comenzando mejora de Cabaña #${idx + 1} a Casa Grande. ¡Asigna constructores para comenzar!`, "info");
      recalculateRates();
      updateUI();
    } else {
      showToast("Recursos insuficientes para mejorar a Casa Grande (Requiere 50 Oro, 80 Madera y 60 Piedra)", "warning");
    }
  }
}

function buildLumberMill() {
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
      constructionDuration: (cfg && cfg.duration) || 5
    });
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
  if (mill.isUnderConstruction) return;
  const tier = mill.tier || 1;
  
  if (tier === 1) {
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Ayuntamiento de Nivel 2 para mejorar el Aserradero a Tier 2.", "warning");
      return;
    }
    // Upgrade to Tier 2: 100 Gold, 80 Wood, 50 Stone
    if (state.gold >= 100 && state.wood >= 80 && state.stone >= 50) {
      state.gold -= 100;
      state.wood -= 80;
      state.stone -= 50;
      mill.tier = 2;
      showToast(`¡Cabaña de Leñador #${idx + 1} mejorada a Aserradero! (Tasa de producción duplicada e incrementada la capacidad de trabajadores a 2)`, "success");
      recalculateRates();
      updateUI();
    } else {
      showToast("Recursos insuficientes (Requiere 100 Oro, 80 Madera y 50 Piedra)", "warning");
    }
  } else if (tier === 2) {
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento de Nivel 3 para mejorar el Aserradero a Tier 3.", "warning");
      return;
    }
    // Upgrade to Tier 3: 200 Gold, 150 Wood, 100 Stone
    if (state.gold >= 200 && state.wood >= 150 && state.stone >= 100) {
      state.gold -= 200;
      state.wood -= 150;
      state.stone -= 100;
      mill.tier = 3;
      showToast(`¡Aserradero #${idx + 1} mejorado a Gremio de Leñadores! (Tasa de producción cuadruplicada e incrementada la capacidad de trabajadores a 3)`, "success");
      recalculateRates();
      updateUI();
    } else {
      showToast("Recursos insuficientes (Requiere 200 Oro, 150 Madera y 100 Piedra)", "warning");
    }
  }
}

function buildQuarry() {
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
      constructionDuration: (cfg && cfg.duration) || 5
    });
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
  if (quarry.isUnderConstruction) return;
  const tier = quarry.tier || 1;
  
  if (tier === 1) {
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Ayuntamiento de Nivel 2 para mejorar la Cantera a Tier 2.", "warning");
      return;
    }
    // Upgrade to Tier 2: 120 Gold, 60 Wood, 80 Stone
    if (state.gold >= 120 && state.wood >= 60 && state.stone >= 80) {
      state.gold -= 120;
      state.wood -= 60;
      state.stone -= 80;
      quarry.tier = 2;
      showToast(`¡Foso de Piedra #${idx + 1} mejorado a Cantera! (Tasa de producción duplicada e incrementada la capacidad de trabajadores a 2)`, "success");
      recalculateRates();
      updateUI();
    } else {
      showToast("Recursos insuficientes (Requiere 120 Oro, 60 Madera y 80 Piedra)", "warning");
    }
  } else if (tier === 2) {
    if (state.maxBuildingTier < 3) {
      showToast("Se requiere Ayuntamiento de Nivel 3 para mejorar la Cantera a Tier 3.", "warning");
      return;
    }
    // Upgrade to Tier 3: 240 Gold, 120 Wood, 150 Stone
    if (state.gold >= 240 && state.wood >= 120 && state.stone >= 150) {
      state.gold -= 240;
      state.wood -= 120;
      state.stone -= 150;
      quarry.tier = 3;
      showToast(`¡Cantera #${idx + 1} mejorado a Gran Mina de Piedra! (Tasa de producción cuadruplicada e incrementada la capacidad de trabajadores a 3)`, "success");
      recalculateRates();
      updateUI();
    } else {
      showToast("Recursos insuficientes (Requiere 240 Oro, 120 Madera y 150 Piedra)", "warning");
    }
  }
}

function buildFarm() {
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
      constructionDuration: (cfg && cfg.duration) || 5
    });
    showToast("🏗️ Comenzando construcción de Granja. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir la Granja", "warning");
  }
}

// MERCADO
function buildMarket() {
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
      constructionDuration: (cfg && cfg.duration) || 5
    });
    showToast("🏗️ Comenzando construcción de Puesto de Mercado. ¡Asigna constructores para comenzar!", "info");
    recalculateRates();
    updateUI();
  } else {
    showToast("Recursos insuficientes para construir el Puesto de Mercado", "warning");
  }
}

// HOGUERA Y COCINADO
function buildBonfire() {
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
      elapsed: 0,
      isRunning: false,
      mode: 'none',
      tier: 1,
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: (cfg && cfg.duration) || 5
    });
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
      showToast(`¡Fogata #${idx + 1} mejorada a Caldero! Producción y velocidad aumentadas.`, "success");
      recalculateRates();
      updateUI();
    } else {
      showToast("Recursos insuficientes para mejorar a Caldero (Requiere 50 Oro y 30 Piedra)", "warning");
    }
  } else if (bonfire.tier === 2) {
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
  if ((state[recipe] || 0) >= minFood) {
    state[recipe] -= minFood;
    updateGlobalFood();
    bonfire.elapsed = 0;
    bonfire.isRunning = true;
    bonfire.mode = 'manual';
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
    if (bonfire.isRunning) {
      showToast("No puedes cambiar la receta mientras cocinas", "warning");
      return;
    }
    bonfire.selectedRecipe = recipe;
    recalculateRates();
    updateUI();
  }
}

function buildTownHall() {
  const cfg = CONFIG.Building.townhall;
  if (state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone) {
    state.wood -= cfg.cost_wood;
    state.stone -= cfg.cost_stone;
    state.townHall.built = true;
    state.townHall.tier = 1;
    state.townHall.isUnderConstruction = true;
    state.townHall.constructionElapsed = 0;
    state.townHall.constructionDuration = (cfg && cfg.duration) || 1;
    state.playerConstructing = { type: 'townHall' };
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
    state.townHall.constructionDuration = (cfg && cfg.duration) || (currentTier === 1 ? 2 : 3);
    state.townHall.workerAssigned = 0;
    
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
    if (state.freeColonists > 0) {
      const building = list.find(b => {
        const maxWorkers = b.isUnderConstruction ? 2 : ((type === 'bonfire' || type === 'granary') ? (b.tier || 1) : 1);
        return (b.workerAssigned || 0) < maxWorkers;
      });
      if (building) {
        building.workerAssigned = (building.workerAssigned || 0) + 1;
        state.freeColonists -= 1;
        showToast(`Aldeano asignado al ${names.singular}`);
      } else {
        showToast(`Todos los ${names.plural} ya tienen el máximo de trabajadores`, "warning");
      }
    } else {
      showToast("No tienes aldeanos libres disponibles", "warning");
    }
  } else {
    const building = [...list].reverse().find(b => (b.workerAssigned || 0) > 0);
    if (building) {
      building.workerAssigned -= 1;
      state.freeColonists += 1;
      showToast(`Aldeano retirado del ${names.singular}`);
    }
  }
  recalculateRates();
  updateUI();
}

// LIBERAR TODOS LOS TRABAJADORES (QoL)
function resetAllAssignments() {
  if (confirm("¿Estás seguro de que quieres liberar a todos tus aldeanos asignados?")) {
    state.jobs.wood = 0;
    state.jobs.stone = 0;
    state.jobs.berries = 0;
    
    if (Array.isArray(state.lumberMills)) state.lumberMills.forEach(b => b.workerAssigned = 0);
    if (Array.isArray(state.quarries)) state.quarries.forEach(b => b.workerAssigned = 0);
    if (Array.isArray(state.farms)) state.farms.forEach(b => b.workerAssigned = 0);
    if (Array.isArray(state.markets)) state.markets.forEach(b => b.workerAssigned = 0);
    if (Array.isArray(state.bonfires)) state.bonfires.forEach(b => b.workerAssigned = 0);
    if (Array.isArray(state.granaries)) state.granaries.forEach(b => b.workerAssigned = 0);
    if (Array.isArray(state.houses)) state.houses.forEach(b => b.workerAssigned = 0);
    if (state.townHall) state.townHall.workerAssigned = 0;
    
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
      isUnderConstruction: true,
      constructionElapsed: 0,
      constructionDuration: (cfg && cfg.duration) || 5,
      isUpgrading: false,
      selectedCrop: 'wheat',
      elapsed: 0,
      isRunning: false
    });
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
    if (state.maxBuildingTier < 2) {
      showToast("Se requiere Ayuntamiento de Nivel 2 para mejorar el Granero a Tier 2.", "warning");
      return;
    }
    cfg = CONFIG.Building.granary_t2;
  } else if (tier === 2) {
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
    granary.constructionDuration = (cfg && cfg.duration) || 5;
    
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
    if (granary.isRunning) {
      showToast("No puedes cambiar el cultivo mientras se procesa", "warning");
      return;
    }
    granary.selectedCrop = cropKey;
    recalculateRates();
    updateUI();
  }
}

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
    recalculateRates();
    updateUI();
  } else {
    const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
    showToast(`${rawNames[consumeResource] || consumeResource} insuficiente para procesar manualmente (Mín. ${minFood})`, "warning");
  }
}
