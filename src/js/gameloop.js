// Tasas estáticas y acumuladores de recursos
var calculatedRates = { gold: 0, wood: 0, stone: 0, food: 0, cooked: 0 };
var resourcesGeneratedThisSecond = { gold: 0, wood: 0, stone: 0, food: 0, cooked: 0 };
var lastRateResetTime = Date.now();

function getAttributeMult(level) {
  return 1 + ((level || 3) - 3) * 0.1;
}

// Calcular la eficiencia laboral promedio de todos los colonos
function getWorkEfficiency() {
  const total = (typeof state !== 'undefined' && state.colonists) ? state.colonists.length : 0;
  if (total <= 0) return 1.0;
  
  let sumEff = 0;
  state.colonists.forEach(c => {
    sumEff += getColonistEfficiency(c);
  });
  return sumEff / total;
}

// Actualizar el estado de hambre individual de los colonos
function updateStarvingColonists(starvingCount) {
  state.starvingColonists = starvingCount;
  if (!state.colonists) return;
  
  // Quitar el flag hambriento a todos
  state.colonists.forEach(c => c.isStarving = false);
  
  // Marcar a los primeros `starvingCount` como hambrientos
  for (let i = 0; i < Math.min(starvingCount, state.colonists.length); i++) {
    state.colonists[i].isStarving = true;
  }
}
// Intenta alimentar a un colono individual
function tryFeedColonist(colonist) {
  const dailyNeed = (CONFIG.FoodNeed && CONFIG.FoodNeed.colonist_need) ? CONFIG.FoodNeed.colonist_need.yield : 5;
  const mealNeed = dailyNeed / 2;
  let remainingValue = mealNeed;
  
  const priority = state.foodPriority || ['cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries', 'wheat', 'potato', 'carrot', 'berries'];
  
  for (let type of priority) {
    if (remainingValue <= 0) break;
    if (state.allowConsume && state.allowConsume[type] === false) continue;
    
    const mult = (CONFIG.FoodEquivalence && CONFIG.FoodEquivalence[type]) ? CONFIG.FoodEquivalence[type].yield : 1;
    const stock = state[type] || 0;
    const availValue = stock * mult;
    const toConsumeValue = Math.min(remainingValue, availValue);
    
    if (toConsumeValue > 0) {
      state[type] -= toConsumeValue / mult;
      remainingValue -= toConsumeValue;
    }
  }
  
  return remainingValue <= 0;
}

// Alimentar a los colonos por la mañana (Desayuno)
function feedColonistsMorning() {
  state.waterToday = state.waterMax;

  const total = state.colonists ? state.colonists.length : 0;
  if (total <= 0) {
    state.fedCookedToday = 0;
    state.fedRawToday = 0;
    state.fedNoneToday = 0;
    updateStarvingColonists(0);
    return;
  }
  
  let starvingCount = 0;
  state.colonists.forEach(c => {
    const fed = tryFeedColonist(c);
    if (!fed) {
      starvingCount++;
    }
  });
  
  updateGlobalFood();
  
  state.fedNoneToday = starvingCount;
  updateStarvingColonists(starvingCount);
  
  if (state.starvingColonists > 0) {
    showToast(`⚠️ ${state.starvingColonists} aldeanos están hambrientos esta mañana por falta de alimento.`, "warning");
  } else {
    showToast("☀️ Los aldeanos han desayunado correctamente.", "success");
  }
  recalculateRates();
  updateUI();
}

// Alimentar a los colonos por la noche (Cena)
function feedColonistsEvening() {
  const total = state.colonists ? state.colonists.length : 0;
  if (total <= 0) {
    updateStarvingColonists(0);
    return;
  }
  
  let starvingCount = 0;
  state.colonists.forEach(c => {
    const fed = tryFeedColonist(c);
    if (!fed) {
      starvingCount++;
    }
  });
  
  updateGlobalFood();
  
  updateStarvingColonists(starvingCount);
  
  if (state.starvingColonists > 0) {
    showToast(`⚠️ ${state.starvingColonists} aldeanos no cenaron suficiente y dormirán hambrientos.`, "warning");
  } else {
    showToast("🌙 Los aldeanos han cenado y se preparan para dormir.", "success");
  }
  recalculateRates();
  updateUI();
}

function syncStateDurationsFromConfig() {
  if (!CONFIG || Object.keys(CONFIG).length === 0) return;

  // 1. Town Hall
  if (state.townHall) {
    if (state.townHall.isUnderConstruction) {
      const cfg = CONFIG.Building && CONFIG.Building.townhall;
      state.townHall.constructionDuration = (cfg && cfg.duration) || 10;
    } else if (state.townHall.isUpgrading) {
      const targetTier = state.townHall.upgradingToTier || 2;
      const cfg = CONFIG.Building && CONFIG.Building['townhall_t' + targetTier];
      state.townHall.constructionDuration = (cfg && cfg.duration) || (targetTier === 2 ? 25 : 40);
    }
  }

  // 2. Edificios de producción e industriales estándar
  const keyToConfigMap = {
    lumberMills: 'lumbermill',
    quarries: 'quarry',
    farms: 'farm',
    bonfires: 'bonfire',
    markets: 'market',
    granaries: 'granary'
  };

  for (let key in keyToConfigMap) {
    const configType = keyToConfigMap[key];
    if (Array.isArray(state[key])) {
      state[key].forEach(b => {
        if (b.isUnderConstruction) {
          const cfg = CONFIG.Building && CONFIG.Building[configType];
          b.constructionDuration = (cfg && cfg.duration) || b.constructionDuration || 5;
        } else if (b.isUpgrading) {
          let upgradeConfigType = configType;
          if (configType === 'granary') {
            const targetTier = b.upgradingToTier || 2;
            upgradeConfigType = 'granary_t' + targetTier;
          }
          const cfg = CONFIG.Building && CONFIG.Building[upgradeConfigType];
          if (cfg) {
            b.constructionDuration = cfg.duration || b.constructionDuration || 5;
          }
        }
      });
    }
  }

  // 3. Viviendas
  if (Array.isArray(state.houses)) {
    state.houses.forEach(h => {
      if (h.isUnderConstruction) {
        const cfg = CONFIG.Building && CONFIG.Building.basic_house;
        h.constructionDuration = (cfg && cfg.duration) || h.constructionDuration || 10;
      } else if (h.isUpgrading) {
        const targetTier = h.upgradingToTier || 2;
        if (targetTier === 2) {
          const cfg = CONFIG.Building && CONFIG.Building.upgraded_house;
          h.constructionDuration = (cfg && cfg.duration) || h.constructionDuration || 20;
        } else if (targetTier === 3) {
          const cfg = CONFIG.Timing && CONFIG.Timing.upgraded_house_t3;
          h.constructionDuration = (cfg && cfg.duration) || 30;
        }
      }
    });
  }
}

// Recalcular la tasa de cambio diario de recursos basada en asignaciones y eficiencia
function recalculateRates() {
  if (!CONFIG || Object.keys(CONFIG).length === 0) return;
  syncStateDurationsFromConfig();
  const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
  const nightDuration = CONFIG.Timing && CONFIG.Timing.night_duration ? CONFIG.Timing.night_duration.duration : 20.0;
  
  // Inicialización de variables para tasas nominales (medias), mínimas y máximas
  let woodRate = 0, woodRateMin = 0, woodRateMax = 0;
  let stoneRate = 0, stoneRateMin = 0, stoneRateMax = 0;
  let wheatRate = 0, wheatRateMin = 0, wheatRateMax = 0;
  let potatoRate = 0, potatoRateMin = 0, potatoRateMax = 0;
  let carrotRate = 0, carrotRateMin = 0, carrotRateMax = 0;
  let berriesRate = 0, berriesRateMin = 0, berriesRateMax = 0;
  let cooked_wheatRate = 0, cooked_wheatRateMin = 0, cooked_wheatRateMax = 0;
  let cooked_potatoRate = 0, cooked_potatoRateMin = 0, cooked_potatoRateMax = 0;
  let cooked_carrotRate = 0, cooked_carrotRateMin = 0, cooked_carrotRateMax = 0;
  let cooked_berriesRate = 0, cooked_berriesRateMin = 0, cooked_berriesRateMax = 0;

  // 1. Madera (Wood)
  if (CONFIG.BasicGathering && CONFIG.BasicGathering.wood_auto) {
    const cfg = CONFIG.BasicGathering.wood_auto;
    const woodcutters = state.colonists ? state.colonists.filter(c => c.job === 'wood') : [];
    let mult = 0;
    woodcutters.forEach(c => {
      const lvl = c.attributes.woodcutting || 3;
      mult += getAttributeMult(lvl) * getColonistEfficiency(c);
    });
    const yieldMin = cfg.output_min !== undefined ? cfg.output_min : cfg.yield;
    const yieldMax = cfg.output_max !== undefined ? cfg.output_max : cfg.yield;
    woodRate += mult * (cfg.yield / cfg.duration);
    woodRateMin += mult * (yieldMin / cfg.duration);
    woodRateMax += mult * (yieldMax / cfg.duration);
  }
  if (state.lumberMills) {
    state.lumberMills.forEach((m, idx) => {
      if (m.workerAssigned > 0 && !m.isUnderConstruction && !m.isUpgrading) {
        const workers = state.colonists ? state.colonists.filter(c => c.job === `lumbermills_${idx}`) : [];
        let mult = 0;
        workers.forEach(c => {
          const lvl = c.attributes.woodcutting || 3;
          mult += getAttributeMult(lvl) * getColonistEfficiency(c);
        });
        const tier = m.tier || 1;
        const key = `lumbermill_t${tier}`;
        const prodCfg = CONFIG.ProductionRate && CONFIG.ProductionRate[key];
        const yieldVal = prodCfg && prodCfg.yield !== undefined ? prodCfg.yield : (tier === 1 ? 5.0 : (tier === 2 ? 10.0 : 15.0));
        const yieldMin = prodCfg && prodCfg.output_min !== undefined ? prodCfg.output_min : yieldVal;
        const yieldMax = prodCfg && prodCfg.output_max !== undefined ? prodCfg.output_max : yieldVal;
        const durationVal = (prodCfg && prodCfg.duration) ? prodCfg.duration : 90.0;
        woodRate += (yieldVal / durationVal) * mult;
        woodRateMin += (yieldMin / durationVal) * mult;
        woodRateMax += (yieldMax / durationVal) * mult;
      }
    });
  }

  // 2. Piedra (Stone)
  if (CONFIG.BasicGathering && CONFIG.BasicGathering.stone_auto) {
    const cfg = CONFIG.BasicGathering.stone_auto;
    const miners = state.colonists ? state.colonists.filter(c => c.job === 'stone') : [];
    let mult = 0;
    miners.forEach(c => {
      const lvl = c.attributes.mining || 3;
      mult += getAttributeMult(lvl) * getColonistEfficiency(c);
    });
    const yieldMin = cfg.output_min !== undefined ? cfg.output_min : cfg.yield;
    const yieldMax = cfg.output_max !== undefined ? cfg.output_max : cfg.yield;
    stoneRate += mult * (cfg.yield / cfg.duration);
    stoneRateMin += mult * (yieldMin / cfg.duration);
    stoneRateMax += mult * (yieldMax / cfg.duration);
  }
  if (state.quarries) {
    state.quarries.forEach((q, idx) => {
      if (q.workerAssigned > 0 && !q.isUnderConstruction && !q.isUpgrading) {
        const workers = state.colonists ? state.colonists.filter(c => c.job === `quarries_${idx}`) : [];
        let mult = 0;
        workers.forEach(c => {
          const lvl = c.attributes.mining || 3;
          mult += getAttributeMult(lvl) * getColonistEfficiency(c);
        });
        const tier = q.tier || 1;
        const key = `quarry_t${tier}`;
        const prodCfg = CONFIG.ProductionRate && CONFIG.ProductionRate[key];
        const yieldVal = prodCfg && prodCfg.yield !== undefined ? prodCfg.yield : (tier === 1 ? 5.0 : (tier === 2 ? 7.0 : 10.0));
        const yieldMin = prodCfg && prodCfg.output_min !== undefined ? prodCfg.output_min : yieldVal;
        const yieldMax = prodCfg && prodCfg.output_max !== undefined ? prodCfg.output_max : yieldVal;
        const durationVal = (prodCfg && prodCfg.duration) ? prodCfg.duration : 90.0;
        stoneRate += (yieldVal / durationVal) * mult;
        stoneRateMin += (yieldMin / durationVal) * mult;
        stoneRateMax += (yieldMax / durationVal) * mult;
      }
    });
  }

  // 3. Comida y Procesado (Berries auto)
  if (CONFIG.BasicGathering && CONFIG.BasicGathering.berries_auto) {
    const cfg = CONFIG.BasicGathering.berries_auto;
    const foragers = state.colonists ? state.colonists.filter(c => c.job === 'berries') : [];
    let mult = 0;
    foragers.forEach(c => {
      const lvl = c.attributes.exploration || 3;
      mult += getAttributeMult(lvl) * getColonistEfficiency(c);
    });
    const yieldMin = cfg.output_min !== undefined ? cfg.output_min : cfg.yield;
    const yieldMax = cfg.output_max !== undefined ? cfg.output_max : cfg.yield;
    berriesRate += mult * (cfg.yield / cfg.duration);
    berriesRateMin += mult * (yieldMin / cfg.duration);
    berriesRateMax += mult * (yieldMax / cfg.duration);
  }

  // Granjas (Farms)
  if (state.farms) {
    state.farms.forEach((f, idx) => {
      if (f.stage !== 'idle' && !f.isUnderConstruction && f.workerAssigned > 0) {
        const cropKey = f.activeCrop || f.crop || 'wheat';
        const crop = CROPS[cropKey];
        if (crop) {
          const farmTier = f.tier || 1;
          const tierMultiplier = farmTier === 3 ? 2.5 : (farmTier === 2 ? 1.5 : 1.0);
          
          const worker = state.colonists ? state.colonists.find(c => c.job === `farms_${idx}`) : null;
          const farmingLvl = worker ? (worker.attributes.farming || 3) : 3;
          const farmingMult = getAttributeMult(farmingLvl) * (worker ? getColonistEfficiency(worker) : 1.0);

          const r = (crop.yield * tierMultiplier * farmingMult) / getFarmCycleTotal(crop);
          const yieldMin = crop.output_min !== undefined ? crop.output_min : crop.yield;
          const yieldMax = crop.output_max !== undefined ? crop.output_max : crop.yield;
          const rMin = (yieldMin * tierMultiplier * farmingMult) / getFarmCycleTotal(crop);
          const rMax = (yieldMax * tierMultiplier * farmingMult) / getFarmCycleTotal(crop);
          
          if (cropKey === 'wheat') { wheatRate += r; wheatRateMin += rMin; wheatRateMax += rMax; }
          else if (cropKey === 'potato') { potatoRate += r; potatoRateMin += rMin; potatoRateMax += rMax; }
          else if (cropKey === 'carrot') { carrotRate += r; carrotRateMin += rMin; carrotRateMax += rMax; }
        }
      }
    });
  }

  // Fogatas (Bonfires)
  if (state.bonfires) {
    state.bonfires.forEach((b, idx) => {
      if ((b.workerAssigned > 0 || b.isRunning) && !b.isUnderConstruction) {
        let rec;
        if (b.tier === 1) rec = CONFIG.Processing.bonfire_auto;
        else if (b.tier === 2) rec = CONFIG.Processing.pot_auto;
        else rec = CONFIG.Processing.kitchen_auto;

        if (rec) {
          let mult = 0;
          if (b.workerAssigned > 0) {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `bonfires_${idx}`) : [];
            workers.forEach(c => {
              const lvl = c.attributes.cooking || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
          } else if (b.isRunning) {
            mult = 1;
          }
          const recipe = b.isRunning ? (b.activeRecipe || b.selectedRecipe || 'wheat') : (b.selectedRecipe || 'wheat');
          const cookedDish = 'cooked_' + recipe;
          
          const yieldMin = rec.output_min !== undefined ? rec.output_min : rec.yield;
          const yieldMax = rec.output_max !== undefined ? rec.output_max : rec.yield;

          const consumeRate = (rec.consume_amount / rec.duration) * mult;
          const produceRate = (rec.yield / rec.duration) * mult;
          const produceRateMin = (yieldMin / rec.duration) * mult;
          const produceRateMax = (yieldMax / rec.duration) * mult;

          if (recipe === 'wheat') { wheatRate -= consumeRate; wheatRateMin -= consumeRate; wheatRateMax -= consumeRate; }
          else if (recipe === 'potato') { potatoRate -= consumeRate; potatoRateMin -= consumeRate; potatoRateMax -= consumeRate; }
          else if (recipe === 'carrot') { carrotRate -= consumeRate; carrotRateMin -= consumeRate; carrotRateMax -= consumeRate; }
          else if (recipe === 'berries') { berriesRate -= consumeRate; berriesRateMin -= consumeRate; berriesRateMax -= consumeRate; }

          if (cookedDish === 'cooked_wheat') { cooked_wheatRate += produceRate; cooked_wheatRateMin += produceRateMin; cooked_wheatRateMax += produceRateMax; }
          else if (cookedDish === 'cooked_potato') { cooked_potatoRate += produceRate; cooked_potatoRateMin += produceRateMin; cooked_potatoRateMax += produceRateMax; }
          else if (cookedDish === 'cooked_carrot') { cooked_carrotRate += produceRate; cooked_carrotRateMin += produceRateMin; cooked_carrotRateMax += produceRateMax; }
          else if (cookedDish === 'cooked_berries') { cooked_berriesRate += produceRate; cooked_berriesRateMin += produceRateMin; cooked_berriesRateMax += produceRateMax; }
        }
      }
    });
  }

  // Graneros (Granaries)
  if (state.granaries) {
    state.granaries.forEach((g, idx) => {
      if ((g.workerAssigned > 0 || g.isRunning) && !g.isUnderConstruction && !g.isUpgrading) {
        const cropKey = g.isRunning ? (g.activeCrop || g.selectedCrop || 'wheat') : (g.selectedCrop || 'wheat');
        const tier = g.tier || 1;
        const recipeKey = `granary_${cropKey}_t${tier}`;
        const recipe = CONFIG.Processing && CONFIG.Processing[recipeKey];
        if (recipe) {
          let mult = 0;
          if (g.workerAssigned > 0) {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `granaries_${idx}`) : [];
            workers.forEach(c => {
              const lvl = c.attributes.farming || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
          } else if (g.isRunning) {
            mult = 1;
          }
          const duration = recipe.duration || 3.0;
          const consumeRate = (recipe.consume_amount / duration) * mult;
          
          if (cropKey === 'wheat') { wheatRate -= consumeRate; wheatRateMin -= consumeRate; wheatRateMax -= consumeRate; }
          else if (cropKey === 'potato') { potatoRate -= consumeRate; potatoRateMin -= consumeRate; potatoRateMax -= consumeRate; }
          else if (cropKey === 'carrot') { carrotRate -= consumeRate; carrotRateMin -= consumeRate; carrotRateMax -= consumeRate; }
        }
      }
    });
  }

  // Consumo diario de comida (desayuno + cena = total de colonos)
  const total = state.colonists ? state.colonists.length : 0;
  if (total > 0) {
    const dailyNeed = (CONFIG.FoodNeed && CONFIG.FoodNeed.colonist_need) ? CONFIG.FoodNeed.colonist_need.yield : 5;
    const dailyNeedRate = dailyNeed / (dayDuration + nightDuration);
    
    // El consumo consume lo mismo del min, max y rate nominal
    let remainingConsumptionValue = total * dailyNeedRate;
    let remainingConsumptionValueMin = total * dailyNeedRate;
    let remainingConsumptionValueMax = total * dailyNeedRate;

    const priority = state.foodPriority || ['cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries', 'wheat', 'potato', 'carrot', 'berries'];
    for (let type of priority) {
      if (remainingConsumptionValue <= 0 && remainingConsumptionValueMin <= 0 && remainingConsumptionValueMax <= 0) break;
      if (state.allowConsume && state.allowConsume[type] === false) continue;

      const mult = (CONFIG.FoodEquivalence && CONFIG.FoodEquivalence[type]) ? CONFIG.FoodEquivalence[type].yield : 1;

      // Descuento nominal
      if (remainingConsumptionValue > 0) {
        let currentResRate = 0;
        if (type === 'wheat') currentResRate = wheatRate;
        else if (type === 'potato') currentResRate = potatoRate;
        else if (type === 'carrot') currentResRate = carrotRate;
        else if (type === 'berries') currentResRate = berriesRate;
        else if (type === 'cooked_wheat') currentResRate = cooked_wheatRate;
        else if (type === 'cooked_potato') currentResRate = cooked_potatoRate;
        else if (type === 'cooked_carrot') currentResRate = cooked_carrotRate;
        else if (type === 'cooked_berries') currentResRate = cooked_berriesRate;

        const stockVal = (state[type] || 0) * mult;
        const productionVal = Math.max(0, currentResRate) * mult;
        const maxValAvailable = productionVal + stockVal;
        const consumedValue = Math.min(remainingConsumptionValue, maxValAvailable);
        if (consumedValue > 0) {
          const consumedUnitsRate = consumedValue / mult;
          if (type === 'wheat') wheatRate -= consumedUnitsRate;
          else if (type === 'potato') potatoRate -= consumedUnitsRate;
          else if (type === 'carrot') carrotRate -= consumedUnitsRate;
          else if (type === 'berries') berriesRate -= consumedUnitsRate;
          else if (type === 'cooked_wheat') cooked_wheatRate -= consumedUnitsRate;
          else if (type === 'cooked_potato') cooked_potatoRate -= consumedUnitsRate;
          else if (type === 'cooked_carrot') cooked_carrotRate -= consumedUnitsRate;
          else if (type === 'cooked_berries') cooked_berriesRate -= consumedUnitsRate;
          remainingConsumptionValue -= consumedValue;
        }
      }

      // Descuento Min
      if (remainingConsumptionValueMin > 0) {
        let currentResRateMin = 0;
        if (type === 'wheat') currentResRateMin = wheatRateMin;
        else if (type === 'potato') currentResRateMin = potatoRateMin;
        else if (type === 'carrot') currentResRateMin = carrotRateMin;
        else if (type === 'berries') currentResRateMin = berriesRateMin;
        else if (type === 'cooked_wheat') currentResRateMin = cooked_wheatRateMin;
        else if (type === 'cooked_potato') currentResRateMin = cooked_potatoRateMin;
        else if (type === 'cooked_carrot') currentResRateMin = cooked_carrotRateMin;
        else if (type === 'cooked_berries') currentResRateMin = cooked_berriesRateMin;

        const stockVal = (state[type] || 0) * mult;
        const productionValMin = Math.max(0, currentResRateMin) * mult;
        const maxValAvailableMin = productionValMin + stockVal;
        const consumedValueMin = Math.min(remainingConsumptionValueMin, maxValAvailableMin);
        if (consumedValueMin > 0) {
          const consumedUnitsRateMin = consumedValueMin / mult;
          if (type === 'wheat') wheatRateMin -= consumedUnitsRateMin;
          else if (type === 'potato') potatoRateMin -= consumedUnitsRateMin;
          else if (type === 'carrot') carrotRateMin -= consumedUnitsRateMin;
          else if (type === 'berries') berriesRateMin -= consumedUnitsRateMin;
          else if (type === 'cooked_wheat') cooked_wheatRateMin -= consumedUnitsRateMin;
          else if (type === 'cooked_potato') cooked_potatoRateMin -= consumedUnitsRateMin;
          else if (type === 'cooked_carrot') cooked_carrotRateMin -= consumedUnitsRateMin;
          else if (type === 'cooked_berries') cooked_berriesRateMin -= consumedUnitsRateMin;
          remainingConsumptionValueMin -= consumedValueMin;
        }
      }

      // Descuento Max
      if (remainingConsumptionValueMax > 0) {
        let currentResRateMax = 0;
        if (type === 'wheat') currentResRateMax = wheatRateMax;
        else if (type === 'potato') currentResRateMax = potatoRateMax;
        else if (type === 'carrot') currentResRateMax = carrotRateMax;
        else if (type === 'berries') currentResRateMax = berriesRateMax;
        else if (type === 'cooked_wheat') currentResRateMax = cooked_wheatRateMax;
        else if (type === 'cooked_potato') currentResRateMax = cooked_potatoRateMax;
        else if (type === 'cooked_carrot') currentResRateMax = cooked_carrotRateMax;
        else if (type === 'cooked_berries') currentResRateMax = cooked_berriesRateMax;

        const stockVal = (state[type] || 0) * mult;
        const productionValMax = Math.max(0, currentResRateMax) * mult;
        const maxValAvailableMax = productionValMax + stockVal;
        const consumedValueMax = Math.min(remainingConsumptionValueMax, maxValAvailableMax);
        if (consumedValueMax > 0) {
          const consumedUnitsRateMax = consumedValueMax / mult;
          if (type === 'wheat') wheatRateMax -= consumedUnitsRateMax;
          else if (type === 'potato') potatoRateMax -= consumedUnitsRateMax;
          else if (type === 'carrot') carrotRateMax -= consumedUnitsRateMax;
          else if (type === 'berries') berriesRateMax -= consumedUnitsRateMax;
          else if (type === 'cooked_wheat') cooked_wheatRateMax -= consumedUnitsRateMax;
          else if (type === 'cooked_potato') cooked_potatoRateMax -= consumedUnitsRateMax;
          else if (type === 'cooked_carrot') cooked_carrotRateMax -= consumedUnitsRateMax;
          else if (type === 'cooked_berries') cooked_berriesRateMax -= consumedUnitsRateMax;
          remainingConsumptionValueMax -= consumedValueMax;
        }
      }
    }
  }

  // 4. Ventas en Mercados (afecta nominal, min y max)
  let goldRate = 0, goldRateMin = 0, goldRateMax = 0;
  let marketCapacity = 0;
  if (state.markets) {
    state.markets.forEach((m, idx) => {
      if (m.workerAssigned > 0 && !m.isUnderConstruction) {
        const workers = state.colonists ? state.colonists.filter(c => c.job === `markets_${idx}`) : [];
        let mult = 0;
        workers.forEach(c => {
          const lvl = c.attributes.trading || 3;
          mult += getAttributeMult(lvl) * getColonistEfficiency(c);
        });
        marketCapacity += mult || 1;
      }
    });
  }

  if (marketCapacity > 0 && CONFIG.Sales) {
    const sellableTypes = ['wood', 'stone', 'wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
    let marketCapacityMin = marketCapacity;
    let marketCapacityMax = marketCapacity;

    for (let type of sellableTypes) {
      if (marketCapacity <= 0 && marketCapacityMin <= 0 && marketCapacityMax <= 0) break;
      if (!state.autoSell || !state.autoSell[type]) continue;
      const mRule = CONFIG.Sales[`market_${type}`];
      if (mRule) {
        const stock = state[type] || 0;
        const minVal = parseInt(state.autoSellMin[type]) || 0;
        const capacitySell = (mRule.consume_amount / mRule.duration) * marketCapacity;

        // Nominal
        if (marketCapacity > 0) {
          let currentRate = type === 'wood' ? woodRate : (type === 'stone' ? stoneRate : (type === 'wheat' ? wheatRate : (type === 'potato' ? potatoRate : (type === 'carrot' ? carrotRate : (type === 'berries' ? berriesRate : (type === 'cooked_wheat' ? cooked_wheatRate : (type === 'cooked_potato' ? cooked_potatoRate : (type === 'cooked_carrot' ? cooked_carrotRate : cooked_berriesRate))))))));
          const maxRate = Math.max(0, currentRate) + (stock > minVal ? capacitySell : 0);
          const actualSellRate = Math.min(maxRate, capacitySell);
          if (actualSellRate > 0) {
            if (type === 'wood') woodRate -= actualSellRate;
            else if (type === 'stone') stoneRate -= actualSellRate;
            else if (type === 'wheat') wheatRate -= actualSellRate;
            else if (type === 'potato') potatoRate -= actualSellRate;
            else if (type === 'carrot') carrotRate -= actualSellRate;
            else if (type === 'berries') berriesRate -= actualSellRate;
            else if (type === 'cooked_wheat') cooked_wheatRate -= actualSellRate;
            else if (type === 'cooked_potato') cooked_potatoRate -= actualSellRate;
            else if (type === 'cooked_carrot') cooked_carrotRate -= actualSellRate;
            else if (type === 'cooked_berries') cooked_berriesRate -= actualSellRate;
            goldRate += actualSellRate * (mRule.yield / mRule.consume_amount);
            marketCapacity -= (actualSellRate / (mRule.consume_amount / mRule.duration));
          }
        }

        // Min
        if (marketCapacityMin > 0) {
          const capacitySellMin = (mRule.consume_amount / mRule.duration) * marketCapacityMin;
          let currentRateMin = type === 'wood' ? woodRateMin : (type === 'stone' ? stoneRateMin : (type === 'wheat' ? wheatRateMin : (type === 'potato' ? potatoRateMin : (type === 'carrot' ? carrotRateMin : (type === 'berries' ? berriesRateMin : (type === 'cooked_wheat' ? cooked_wheatRateMin : (type === 'cooked_potato' ? cooked_potatoRateMin : (type === 'cooked_carrot' ? cooked_carrotRateMin : cooked_berriesRateMin))))))));
          const maxRateMin = Math.max(0, currentRateMin) + (stock > minVal ? capacitySellMin : 0);
          const actualSellRateMin = Math.min(maxRateMin, capacitySellMin);
          if (actualSellRateMin > 0) {
            if (type === 'wood') woodRateMin -= actualSellRateMin;
            else if (type === 'stone') stoneRateMin -= actualSellRateMin;
            else if (type === 'wheat') wheatRateMin -= actualSellRateMin;
            else if (type === 'potato') potatoRateMin -= actualSellRateMin;
            else if (type === 'carrot') carrotRateMin -= actualSellRateMin;
            else if (type === 'berries') berriesRateMin -= actualSellRateMin;
            else if (type === 'cooked_wheat') cooked_wheatRateMin -= actualSellRateMin;
            else if (type === 'cooked_potato') cooked_potatoRateMin -= actualSellRateMin;
            else if (type === 'cooked_carrot') cooked_carrotRateMin -= actualSellRateMin;
            else if (type === 'cooked_berries') cooked_berriesRateMin -= actualSellRateMin;
            goldRateMin += actualSellRateMin * (mRule.yield / mRule.consume_amount);
            marketCapacityMin -= (actualSellRateMin / (mRule.consume_amount / mRule.duration));
          }
        }

        // Max
        if (marketCapacityMax > 0) {
          const capacitySellMax = (mRule.consume_amount / mRule.duration) * marketCapacityMax;
          let currentRateMax = type === 'wood' ? woodRateMax : (type === 'stone' ? stoneRateMax : (type === 'wheat' ? wheatRateMax : (type === 'potato' ? potatoRateMax : (type === 'carrot' ? carrotRateMax : (type === 'berries' ? berriesRateMax : (type === 'cooked_wheat' ? cooked_wheatRateMax : (type === 'cooked_potato' ? cooked_potatoRateMax : (type === 'cooked_carrot' ? cooked_carrotRateMax : cooked_berriesRateMax))))))));
          const maxRateMax = Math.max(0, currentRateMax) + (stock > minVal ? capacitySellMax : 0);
          const actualSellRateMax = Math.min(maxRateMax, capacitySellMax);
          if (actualSellRateMax > 0) {
            if (type === 'wood') woodRateMax -= actualSellRateMax;
            else if (type === 'stone') stoneRateMax -= actualSellRateMax;
            else if (type === 'wheat') wheatRateMax -= actualSellRateMax;
            else if (type === 'potato') potatoRateMax -= actualSellRateMax;
            else if (type === 'carrot') carrotRateMax -= actualSellRateMax;
            else if (type === 'berries') berriesRateMax -= actualSellRateMax;
            else if (type === 'cooked_wheat') cooked_wheatRateMax -= actualSellRateMax;
            else if (type === 'cooked_potato') cooked_potatoRateMax -= actualSellRateMax;
            else if (type === 'cooked_carrot') cooked_carrotRateMax -= actualSellRateMax;
            else if (type === 'cooked_berries') cooked_berriesRateMax -= actualSellRateMax;
            goldRateMax += actualSellRateMax * (mRule.yield / mRule.consume_amount);
            marketCapacityMax -= (actualSellRateMax / (mRule.consume_amount / mRule.duration));
          }
        }
      }
    }
  }

  // Establecer tasas en calculatedRates
  calculatedRates.wood = woodRate * dayDuration;
  calculatedRates.stone = stoneRate * dayDuration;
  calculatedRates.wheat = wheatRate * dayDuration;
  calculatedRates.potato = potatoRate * dayDuration;
  calculatedRates.carrot = carrotRate * dayDuration;
  calculatedRates.berries = berriesRate * dayDuration;
  calculatedRates.cooked_wheat = cooked_wheatRate * dayDuration;
  calculatedRates.cooked_potato = cooked_potatoRate * dayDuration;
  calculatedRates.cooked_carrot = cooked_carrotRate * dayDuration;
  calculatedRates.cooked_berries = cooked_berriesRate * dayDuration;
  calculatedRates.gold = goldRate * dayDuration;

  // Tasas de comida globales nominales
  let totalFoodRate = 0;
  const foodKeys = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
  foodKeys.forEach(key => {
    if (state.allowConsume && state.allowConsume[key] !== false) {
      const eqObj = CONFIG.FoodEquivalence[key];
      const mult = eqObj ? eqObj.yield : 1;
      let rateVal = key === 'wheat' ? wheatRate : (key === 'potato' ? potatoRate : (key === 'carrot' ? carrotRate : (key === 'berries' ? berriesRate : (key === 'cooked_wheat' ? cooked_wheatRate : (key === 'cooked_potato' ? cooked_potatoRate : (key === 'cooked_carrot' ? cooked_carrotRate : cooked_berriesRate))))));
      totalFoodRate += rateVal * mult;
    }
  });
  calculatedRates.food = totalFoodRate * dayDuration;
  calculatedRates.cooked = (cooked_wheatRate + cooked_potatoRate + cooked_carrotRate + cooked_berriesRate) * dayDuration;

  // Rellenar window.calculatedRatesMin
  if (typeof window.calculatedRatesMin === 'undefined') window.calculatedRatesMin = {};
  window.calculatedRatesMin.wood = woodRateMin * dayDuration;
  window.calculatedRatesMin.stone = stoneRateMin * dayDuration;
  window.calculatedRatesMin.wheat = wheatRateMin * dayDuration;
  window.calculatedRatesMin.potato = potatoRateMin * dayDuration;
  window.calculatedRatesMin.carrot = carrotRateMin * dayDuration;
  window.calculatedRatesMin.berries = berriesRateMin * dayDuration;
  window.calculatedRatesMin.cooked_wheat = cooked_wheatRateMin * dayDuration;
  window.calculatedRatesMin.cooked_potato = cooked_potatoRateMin * dayDuration;
  window.calculatedRatesMin.cooked_carrot = cooked_carrotRateMin * dayDuration;
  window.calculatedRatesMin.cooked_berries = cooked_berriesRateMin * dayDuration;
  window.calculatedRatesMin.gold = goldRateMin * dayDuration;

  let totalFoodRateMin = 0;
  foodKeys.forEach(key => {
    if (state.allowConsume && state.allowConsume[key] !== false) {
      const eqObj = CONFIG.FoodEquivalence[key];
      const mult = eqObj ? eqObj.yield : 1;
      let rateValMin = key === 'wheat' ? wheatRateMin : (key === 'potato' ? potatoRateMin : (key === 'carrot' ? carrotRateMin : (key === 'berries' ? berriesRateMin : (key === 'cooked_wheat' ? cooked_wheatRateMin : (key === 'cooked_potato' ? cooked_potatoRateMin : (key === 'cooked_carrot' ? cooked_carrotRateMin : cooked_berriesRateMin))))));
      totalFoodRateMin += rateValMin * mult;
    }
  });
  window.calculatedRatesMin.food = totalFoodRateMin * dayDuration;

  // Rellenar window.calculatedRatesMax
  if (typeof window.calculatedRatesMax === 'undefined') window.calculatedRatesMax = {};
  window.calculatedRatesMax.wood = woodRateMax * dayDuration;
  window.calculatedRatesMax.stone = stoneRateMax * dayDuration;
  window.calculatedRatesMax.wheat = wheatRateMax * dayDuration;
  window.calculatedRatesMax.potato = potatoRateMax * dayDuration;
  window.calculatedRatesMax.carrot = carrotRateMax * dayDuration;
  window.calculatedRatesMax.berries = berriesRateMax * dayDuration;
  window.calculatedRatesMax.cooked_wheat = cooked_wheatRateMax * dayDuration;
  window.calculatedRatesMax.cooked_potato = cooked_potatoRateMax * dayDuration;
  window.calculatedRatesMax.cooked_carrot = cooked_carrotRateMax * dayDuration;
  window.calculatedRatesMax.cooked_berries = cooked_berriesRateMax * dayDuration;
  window.calculatedRatesMax.gold = goldRateMax * dayDuration;

  let totalFoodRateMax = 0;
  foodKeys.forEach(key => {
    if (state.allowConsume && state.allowConsume[key] !== false) {
      const eqObj = CONFIG.FoodEquivalence[key];
      const mult = eqObj ? eqObj.yield : 1;
      let rateValMax = key === 'wheat' ? wheatRateMax : (key === 'potato' ? potatoRateMax : (key === 'carrot' ? carrotRateMax : (key === 'berries' ? berriesRateMax : (key === 'cooked_wheat' ? cooked_wheatRateMax : (key === 'cooked_potato' ? cooked_potatoRateMax : (key === 'cooked_carrot' ? cooked_carrotRateMax : cooked_berriesRateMax))))));
      totalFoodRateMax += rateValMax * mult;
    }
  });
  window.calculatedRatesMax.food = totalFoodRateMax * dayDuration;

  if (typeof recalculateWaterMax === 'function') recalculateWaterMax();
}

// Bucle principal de simulación (corre cada 100ms)
function gameTick() {
  if (!CONFIG || Object.keys(CONFIG).length === 0) return;
  
  const now = Date.now();
  const delta = 0.1; // 100ms
  const effectiveDelta = delta * (window.devSpeedMultiplier || 1);
  
  const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
  const nightDuration = CONFIG.Timing && CONFIG.Timing.night_duration ? CONFIG.Timing.night_duration.duration : 20.0;
  
  if (typeof state.currentDay === 'undefined') state.currentDay = 1;
  if (typeof state.timePhase === 'undefined') state.timePhase = 'day';
  if (typeof state.phaseElapsed === 'undefined') state.phaseElapsed = 0;
  
  // Avanzar misiones activas (PASO J - REP-MISI)
  if (Array.isArray(state.availableMissions)) {
    state.availableMissions.forEach((mission, idx) => {
      if (mission.status === 'active') {
        mission.elapsedDays += effectiveDelta / dayDuration;
        if (mission.elapsedDays >= mission.durationDays) {
          completeMission(idx);
        }
      }
    });
  }
  
  // Rotación automática de candidatos (candidate_rotation de timings.csv)
  if (typeof state.candidateRotationElapsed === 'undefined') state.candidateRotationElapsed = 0;
  state.candidateRotationElapsed += effectiveDelta;
  const rotationDuration = CONFIG.Timing && CONFIG.Timing.candidate_rotation ? CONFIG.Timing.candidate_rotation.duration : 210.0;
  if (state.candidateRotationElapsed >= rotationDuration) {
    state.candidates = [];
    if (typeof replenishCandidates === 'function') replenishCandidates();
    state.hasHiredThisWeek = false;
    state.candidateRotationElapsed = 0;
    showToast("🔄 Los candidatos disponibles para contratar han rotado automáticamente.", "success");
    if (typeof recalculateRates === 'function') recalculateRates();
    if (typeof updateUI === 'function') updateUI();
  }
  
  // Reducir cooldown activo de recolección manual
  if (state.gatherCooldown > 0) {
    const prevCooldown = state.gatherCooldown;
    state.gatherCooldown = Math.max(0, state.gatherCooldown - effectiveDelta);
    if (state.gatherCooldown === 0 && prevCooldown > 0) {
      if (typeof deliverGatheredResources === 'function') deliverGatheredResources();
    }
  }

  // Avanzar el ciclo de tiempo
  state.phaseElapsed += effectiveDelta;
  if (state.timePhase === 'day') {
    if (state.phaseElapsed >= dayDuration) {
      feedColonistsEvening();
      state.timePhase = 'night';
      state.phaseElapsed = 0;
      showToast("🌙 Ha caído la noche. Los aldeanos se van a dormir.", "warning");
    }
  } else {
    if (state.phaseElapsed >= nightDuration) {
      state.currentDay++;
      
      if (typeof generateDailyOrders === 'function') {
        generateDailyOrders();
      }
      
      const missionsRefreshInterval = CONFIG?.Raid?.missions_refresh_interval?.value ?? 30;
      if (typeof state.missionsRefreshDay === 'undefined') state.missionsRefreshDay = 1;
      if (state.currentDay >= state.missionsRefreshDay + missionsRefreshInterval) {
        if (typeof rotateMissions === 'function') {
          rotateMissions();
        }
        state.missionsRefreshDay = state.currentDay;
        showToast("🔄 Las misiones disponibles han rotado automáticamente.", "success");
      }
      
      feedColonistsMorning();
      state.timePhase = 'day';
      state.phaseElapsed = 0;
      
      // Al amanecer, las granjas que estén creciendo necesitan ser regadas de nuevo
      if (Array.isArray(state.farms)) {
        state.farms.forEach(farm => {
          if (!farm.isUnderConstruction && (farm.stage === 'grow' || farm.stage === 'grow2')) {
            farm.needsWatering = true;
            farm.waterElapsed = 0;
          }
        });
      }
      
      showToast(`☀️ ¡Amanece un nuevo día! Día ${state.currentDay}.`, "success");
    }
  }

  // Actualizar la barra visual del ciclo día/noche
  if (typeof updateCycleUI === 'function') updateCycleUI(dayDuration, nightDuration);

  const isDay = state.timePhase === 'day';
  
  // Procesamos la recolección automática, construcciones y producción pasiva tanto de día como de noche
  const eff = getWorkEfficiency();

  // Ticking de construcciones en curso
  const dayDelta = effectiveDelta;

      // 0. Progreso de construcción/mejora del Ayuntamiento
      if (state.townHall && (state.townHall.isUnderConstruction || state.townHall.isUpgrading) && !state.townHall.isPaused) {
        const isPlayerOnTH = state.playerConstructing && state.playerConstructing.type === 'townHall';
        const playerSpeed = isPlayerOnTH ? 0.25 : 0.0;
        
        let workerSpeed = 0.0;
        if (isDay && state.townHall.builders && state.townHall.builders.length > 0) {
          state.townHall.builders.forEach(bid => {
            const col = state.colonists.find(c => c.id === bid);
            const lvl = col ? (col.attributes.construction || 3) : 3;
            workerSpeed += 0.5 * getAttributeMult(lvl) * getColonistEfficiency(col);
          });
        }
        
        const totalSpeed = playerSpeed + workerSpeed;
        if (totalSpeed > 0) {
          state.townHall.constructionElapsed = (state.townHall.constructionElapsed || 0) + dayDelta * totalSpeed;
          const duration = state.townHall.constructionDuration || 1;
          
          if (state.townHall.constructionElapsed >= duration) {
            const wasUpgrading = state.townHall.isUpgrading;
            const targetTier = state.townHall.upgradingToTier || 1;
            
            state.townHall.isUnderConstruction = false;
            state.townHall.isUpgrading = false;
            state.townHall.constructionElapsed = 0;
            state.townHall.tier = targetTier;
            state.maxBuildingTier = targetTier;
            delete state.townHall.upgradingToTier;
            if (typeof recalculateStorageCapacity === 'function') recalculateStorageCapacity();
            
            if (isPlayerOnTH) {
              state.playerConstructing = null;
              state.playerBuilding = null;
            }
            
            if (wasUpgrading) {
              showToast(`✅ Ayuntamiento mejorado al Nivel ${state.townHall.tier}! Construcciones de Tier ${state.maxBuildingTier} desbloqueadas.`, "success");
            } else {
              showToast("✅ Ayuntamiento ¡construcción completada! Construcciones de Tier 1 desbloqueadas.", "success");
            }
            if (typeof fixColonistAllocation === 'function') fixColonistAllocation();
            if (typeof autoAssignBuilders === 'function') autoAssignBuilders();
            recalculateRates();
            if (typeof updateUI === 'function') updateUI();
          }
        }
      }

      const buildingTypes = [
        { key: 'houses', name: 'Choza', defaultDuration: 1 },
        { key: 'lumberMills', name: 'Cabaña de Leñador', defaultDuration: 5 },
        { key: 'quarries', name: 'Foso de Piedra', defaultDuration: 5 },
        { key: 'farms', name: 'Granja', defaultDuration: 5 },
        { key: 'bonfires', name: 'Fogata', defaultDuration: 5 },
        { key: 'markets', name: 'Puesto de Mercado', defaultDuration: 5 },
        { key: 'granaries', name: 'Granero', defaultDuration: 5 },
        { key: 'wells', name: 'Pozo', defaultDuration: 5 },
        { key: 'warehouses', name: 'Almacén', defaultDuration: 20 }
      ];

      buildingTypes.forEach(bt => {
        if (Array.isArray(state[bt.key])) {
          state[bt.key].forEach((building, idx) => {
            if ((building.isUnderConstruction || building.isUpgrading) && !building.isPaused) {
              const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === bt.key && state.playerConstructing.index === idx;
              const playerSpeed = isPlayerOnIt ? 0.25 : 0.0;
              
              let workerSpeed = 0.0;
              if (isDay && building.builders && building.builders.length > 0) {
                building.builders.forEach(bid => {
                  const col = state.colonists.find(c => c.id === bid);
                  const lvl = col ? (col.attributes.construction || 3) : 3;
                  workerSpeed += 0.5 * getAttributeMult(lvl) * getColonistEfficiency(col);
                });
              }
              
              const totalSpeed = workerSpeed + playerSpeed;
              if (totalSpeed > 0) {
                building.constructionElapsed = (building.constructionElapsed || 0) + dayDelta * totalSpeed;
                
                const duration = building.constructionDuration || bt.defaultDuration;
                if (building.constructionElapsed >= duration) {
                  const wasUpgrading = building.isUpgrading;
                  
                  if (wasUpgrading) {
                    building.isUpgrading = false;
                    building.tier = building.upgradingToTier || (building.tier + 1);
                    delete building.upgradingToTier;
                    building.constructionElapsed = 0;
                  } else {
                    building.isUnderConstruction = false;
                    building.constructionElapsed = 0;
                  }
                  
                  if (isPlayerOnIt) {
                    state.playerConstructing = null;
                    state.playerBuilding = null;
                  }
                  
                  if (bt.key === 'houses') {
                    if (typeof recalculateMaxPopulation === 'function') recalculateMaxPopulation();
                    if (typeof initializeHousingAssignments === 'function') initializeHousingAssignments();
                    if (wasUpgrading) {
                      const tierNames = { 2: 'Cabaña', 3: 'Casa Grande' };
                      showToast(`✅ Choza #${idx + 1} mejorada a ${tierNames[building.tier] || 'Edificio'}!`, "success");
                    } else {
                      showToast(`✅ Choza #${idx + 1} ¡construcción completada! (+1 Capacidad de población)`, "success");
                    }
                  } else if (bt.key === 'warehouses') {
                    if (typeof recalculateStorageCapacity === 'function') recalculateStorageCapacity();
                    if (wasUpgrading) {
                      showToast(`✅ Almacén #${idx + 1} mejorado a Tier ${building.tier}!`, "success");
                    } else {
                      showToast(`✅ Almacén #${idx + 1} ¡construcción completada!`, "success");
                    }
                  } else {
                    if (wasUpgrading) {
                      showToast(`✅ ${bt.name} #${idx + 1} mejorada a Tier ${building.tier}!`, "success");
                    } else {
                      showToast(`✅ ${bt.name} #${idx + 1} ¡construcción completada!`, "success");
                    }
                  }
                  
                  if (typeof fixColonistAllocation === 'function') fixColonistAllocation();
                  if (typeof autoAssignBuilders === 'function') autoAssignBuilders();
                  recalculateRates();
                  if (typeof updateUI === 'function') updateUI();
                }
              }
            }
          });
        }
      });

      // 1. Recolección Automática básica (Continua)
      const woodcutters = state.colonists ? state.colonists.filter(c => c.job === 'wood') : [];
      if (woodcutters.length > 0 && CONFIG.BasicGathering && CONFIG.BasicGathering.wood_auto) {
        const cfg = CONFIG.BasicGathering.wood_auto;
        let mult = 0;
        woodcutters.forEach(c => {
          const lvl = c.attributes.woodcutting || 3;
          mult += getAttributeMult(lvl) * getColonistEfficiency(c);
        });
        const yieldMin = cfg.output_min !== undefined ? cfg.output_min : cfg.yield;
        const yieldMax = cfg.output_max !== undefined ? cfg.output_max : cfg.yield;
        const finalYield = yieldMin + Math.random() * (yieldMax - yieldMin);
        const woodAdded = ((finalYield * mult) / cfg.duration) * effectiveDelta;
        const added = addResourceStock('wood', woodAdded);
        resourcesGeneratedThisSecond.wood += added;
      }
      
      const miners = state.colonists ? state.colonists.filter(c => c.job === 'stone') : [];
      if (miners.length > 0 && CONFIG.BasicGathering && CONFIG.BasicGathering.stone_auto) {
        const cfg = CONFIG.BasicGathering.stone_auto;
        let mult = 0;
        miners.forEach(c => {
          const lvl = c.attributes.mining || 3;
          mult += getAttributeMult(lvl) * getColonistEfficiency(c);
        });
        const yieldMin = cfg.output_min !== undefined ? cfg.output_min : cfg.yield;
        const yieldMax = cfg.output_max !== undefined ? cfg.output_max : cfg.yield;
        const finalYield = yieldMin + Math.random() * (yieldMax - yieldMin);
        const stoneAdded = ((finalYield * mult) / cfg.duration) * effectiveDelta;
        const added = addResourceStock('stone', stoneAdded);
        resourcesGeneratedThisSecond.stone += added;
      }

      const foragers = state.colonists ? state.colonists.filter(c => c.job === 'berries') : [];
      if (foragers.length > 0 && CONFIG.BasicGathering && CONFIG.BasicGathering.berries_auto) {
        const cfg = CONFIG.BasicGathering.berries_auto;
        let mult = 0;
        foragers.forEach(c => {
          const lvl = c.attributes.exploration || 3;
          mult += getAttributeMult(lvl) * getColonistEfficiency(c);
        });
        const yieldMin = cfg.output_min !== undefined ? cfg.output_min : cfg.yield;
        const yieldMax = cfg.output_max !== undefined ? cfg.output_max : cfg.yield;
        const finalYield = yieldMin + Math.random() * (yieldMax - yieldMin);
        const foodAdded = ((finalYield * mult) / cfg.duration) * effectiveDelta;
        addResourceStock('berries', foodAdded);
        updateGlobalFood();
      }

      if (Array.isArray(state.lumberMills)) {
        state.lumberMills.forEach((b, idx) => {
          if (b.workerAssigned > 0 && !b.isUnderConstruction && !b.isUpgrading) {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `lumbermills_${idx}`) : [];
            let mult = 0;
            workers.forEach(c => {
              const lvl = c.attributes.woodcutting || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
            const tier = b.tier || 1;
            const key = `lumbermill_t${tier}`;
            const millCfg = CONFIG.ProductionRate && CONFIG.ProductionRate[key];
            const yieldVal = millCfg && millCfg.yield !== undefined ? millCfg.yield : (tier === 1 ? 5.0 : (tier === 2 ? 10.0 : 15.0));
            const yieldMin = millCfg && millCfg.output_min !== undefined ? millCfg.output_min : yieldVal;
            const yieldMax = millCfg && millCfg.output_max !== undefined ? millCfg.output_max : yieldVal;
            const finalYield = yieldMin + Math.random() * (yieldMax - yieldMin);
            const millDuration = (millCfg && millCfg.duration) ? millCfg.duration : 90.0;
            const woodPassive = ((finalYield * mult) / millDuration) * effectiveDelta;
            const added = addResourceStock('wood', woodPassive);
            resourcesGeneratedThisSecond.wood += added;
          }
        });
      }
      
      if (Array.isArray(state.quarries)) {
        state.quarries.forEach((b, idx) => {
          if (b.workerAssigned > 0 && !b.isUnderConstruction && !b.isUpgrading) {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `quarries_${idx}`) : [];
            let mult = 0;
            workers.forEach(c => {
              const lvl = c.attributes.mining || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
            const tier = b.tier || 1;
            const key = `quarry_t${tier}`;
            const quarryCfg = CONFIG.ProductionRate && CONFIG.ProductionRate[key];
            const yieldVal = quarryCfg && quarryCfg.yield !== undefined ? quarryCfg.yield : (tier === 1 ? 5.0 : (tier === 2 ? 7.0 : 10.0));
            const yieldMin = quarryCfg && quarryCfg.output_min !== undefined ? quarryCfg.output_min : yieldVal;
            const yieldMax = quarryCfg && quarryCfg.output_max !== undefined ? quarryCfg.output_max : yieldVal;
            const finalYield = yieldMin + Math.random() * (yieldMax - yieldMin);
            const quarryDuration = (quarryCfg && quarryCfg.duration) ? quarryCfg.duration : 90.0;
            const stonePassive = ((finalYield * mult) / quarryDuration) * effectiveDelta;
            const added = addResourceStock('stone', stonePassive);
            resourcesGeneratedThisSecond.stone += added;
          }
        });
      }




    // 3b. Procesamiento en Hogueras/Ollas/Cocinas
    if (Array.isArray(state.bonfires)) {
      state.bonfires.forEach((bonfire, idx) => {
        const hasWorker = bonfire.workerAssigned > 0;
        
        let autoRec, manualRec;
        if (bonfire.tier === 1) {
          autoRec = CONFIG.Processing.bonfire_auto;
          manualRec = CONFIG.Processing.bonfire_manual;
        } else if (bonfire.tier === 2) {
          autoRec = CONFIG.Processing.pot_auto;
          manualRec = CONFIG.Processing.pot_manual;
        } else {
          autoRec = CONFIG.Processing.kitchen_auto;
          manualRec = CONFIG.Processing.kitchen_manual;
        }

        if (!autoRec || !manualRec) return;

        if (!bonfire.isUnderConstruction && !bonfire.isRunning && hasWorker) {
          const foodKeys = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
          const totalFood = foodKeys.reduce((sum, k) => sum + (state[k] || 0), 0);
          const foodCapacity = (state.storageCapacity && state.storageCapacity.food) ?? Infinity;
          if (totalFood < foodCapacity) {
            const recipe = bonfire.selectedRecipe || 'wheat';
            const minFood = autoRec.consume_amount;
            if ((state[recipe] || 0) >= minFood) {
              state[recipe] -= minFood;
              updateGlobalFood();
              bonfire.elapsed = 0;
              bonfire.isRunning = true;
              bonfire.mode = 'auto';
              bonfire.activeRecipe = recipe;
              recalculateRates();
            }
          }
        }

        if (!bonfire.isUnderConstruction && bonfire.isRunning) {
          let speedMultiplier = 1;
          if (bonfire.mode === 'auto') {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `bonfires_${idx}`) : [];
            let mult = 0;
            workers.forEach(c => {
              const lvl = c.attributes.cooking || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
            speedMultiplier = mult;
          }
          bonfire.elapsed += effectiveDelta * speedMultiplier;
          const targetDuration = bonfire.mode === 'manual' ? manualRec.duration : autoRec.duration;
          
          if (bonfire.elapsed >= targetDuration) {
            const rec = bonfire.mode === 'manual' ? manualRec : autoRec;
            const yieldMin = rec.output_min !== undefined ? rec.output_min : rec.yield;
            const yieldMax = rec.output_max !== undefined ? rec.output_max : rec.yield;
            const produced = Math.round(yieldMin + Math.random() * (yieldMax - yieldMin));
            const recipe = bonfire.activeRecipe || bonfire.selectedRecipe || 'wheat';
            const cookedDish = 'cooked_' + recipe;
            const added = addResourceStock(cookedDish, produced);
            updateGlobalFood();
            
            resourcesGeneratedThisSecond.cooked = (resourcesGeneratedThisSecond.cooked || 0) + produced;
            
            let bName = bonfire.tier === 1 ? 'Fogata' : (bonfire.tier === 2 ? 'Caldero' : 'Cocina de Taberna');
            const cookedNames = { cooked_wheat: 'Pan', cooked_potato: 'Patata Asada', cooked_carrot: 'Zanahoria Asada', cooked_berries: 'Mermelada' };
            showToast(`🔥 ${bName} #${idx + 1} completó un lote de ${produced} ${cookedNames[cookedDish] || cookedDish}`, "success");
            bonfire.isRunning = false;
            bonfire.activeRecipe = null;
            bonfire.mode = 'none';
            recalculateRates();
            if (typeof updateUI === 'function') updateUI();
          }
        }
      });
    }

    // 3c. Procesamiento en Graneros
    if (Array.isArray(state.granaries)) {
      state.granaries.forEach((granary, idx) => {
        if (granary.isUnderConstruction || granary.isUpgrading) return;

        const hasWorker = granary.workerAssigned > 0;
        const cropKey = granary.selectedCrop || 'wheat';
        const tier = granary.tier || 1;
        const recipeKey = `granary_${cropKey}_t${tier}`;
        const recipe = CONFIG.Processing && CONFIG.Processing[recipeKey];

        if (!recipe) return;

        // Auto-iniciar si tiene trabajadores y no está corriendo
        if (!granary.isRunning && hasWorker) {
          const seedKeys = ['wheat', 'potato', 'carrot'];
          const totalSeeds = state.seeds ? seedKeys.reduce((sum, k) => sum + (state.seeds[k] || 0), 0) : 0;
          const seedsCapacity = (state.storageCapacity && state.storageCapacity.seeds) ?? Infinity;
          if (totalSeeds < seedsCapacity) {
            const minFood = recipe.consume_amount || 5;
            const consumeRes = recipe.consume_type || cropKey;
            if ((state[consumeRes] || 0) >= minFood) {
              state[consumeRes] -= minFood;
              updateGlobalFood();
              granary.elapsed = 0;
              granary.isRunning = true;
              granary.mode = 'auto';
              granary.activeCrop = cropKey;
              recalculateRates();
            }
          }
        }

        // Ticking del progreso de procesamiento
        if (granary.isRunning) {
          let speedMultiplier = 1;
          if (granary.mode === 'auto') {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `granaries_${idx}`) : [];
            let mult = 0;
            workers.forEach(c => {
              const lvl = c.attributes.farming || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
            speedMultiplier = mult;
          }
          granary.elapsed += effectiveDelta * speedMultiplier;
          
          const runningCrop = granary.activeCrop || granary.selectedCrop || 'wheat';
          const runningRecipeKey = `granary_${runningCrop}_t${tier}`;
          const runningRecipe = CONFIG.Processing && CONFIG.Processing[runningRecipeKey];
          const targetDuration = runningRecipe ? runningRecipe.duration : 3.0;

          if (granary.elapsed >= targetDuration) {
            granary.isRunning = false;
            granary.elapsed = 0;
            
            const yieldMin = runningRecipe && runningRecipe.output_min !== undefined ? runningRecipe.output_min : (runningRecipe ? runningRecipe.yield : 1);
            const yieldMax = runningRecipe && runningRecipe.output_max !== undefined ? runningRecipe.output_max : (runningRecipe ? runningRecipe.yield : 1);
            const produced = Math.round(yieldMin + Math.random() * (yieldMax - yieldMin));
            const seedType = runningCrop; 
            addResourceStock(seedType + '_seeds', produced);
            updateUI();
            
            const cropNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
            showToast(`🌾 Granero #${idx + 1} produjo +${produced} Semillas de ${cropNames[seedType] || seedType}`, "success");
            
            granary.activeCrop = null;
            granary.mode = 'none';
            recalculateRates();
            if (typeof updateUI === 'function') updateUI();
          }
        }
      });
    }

    // 4. Automatización de Compras y Ventas en Mercados
    if (Array.isArray(state.markets) && CONFIG.Sales) {
      state.markets.forEach((market, idx) => {
        const hasWorker = market.workerAssigned > 0;
        
        if (!market.isUnderConstruction && !market.isRunning && hasWorker) {
          let transactionStarted = false;

          const resourcesList = [
            'wood', 'stone',
            'wheat', 'potato', 'carrot', 'berries',
            'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries',
            'wheat_seeds', 'potato_seeds', 'carrot_seeds'
          ];

          // 1. CHEQUEAR AUTO-COMPRA
          for (let type of resourcesList) {
            const isChecked = state.autoBuy && state.autoBuy[type];
            const maxVal = state.autoBuyMax ? (parseInt(state.autoBuyMax[type]) || 0) : 0;
            const currentStock = getResourceStock(type);
            const bRule = CONFIG.Sales[`buy_${type}`];
            
            if (bRule && isChecked && currentStock < maxVal) {
              const cost = bRule.cost_gold || 0;
              if (state.gold >= cost) {
                state.gold -= cost;
                
                market.transactionType = 'buy';
                market.boughtResource = type;
                market.revenue = bRule.yield_amount || bRule.yield || 1; 
                market.targetDuration = bRule.duration || 0.1;
                market.elapsed = 0;
                market.isRunning = true;
                transactionStarted = true;
                break;
              }
            }
          }

          // 2. CHEQUEAR AUTO-VENTA (solo si no se inició auto-compra)
          if (!transactionStarted) {
            for (let type of resourcesList) {
              const isChecked = state.autoSell && state.autoSell[type];
              const minVal = state.autoSellMin ? (parseInt(state.autoSellMin[type]) || 0) : 0;
              const currentStock = getResourceStock(type);
              
              const mRule = CONFIG.Sales[`market_${type}`];
              if (mRule && isChecked && currentStock >= minVal + mRule.consume_amount) {
                deductResourceStock(type, mRule.consume_amount);
                updateGlobalFood();
                
                market.transactionType = 'sell';
                market.soldResource = mRule.name;
                market.revenue = mRule.yield;
                market.targetDuration = mRule.duration || 0.1;
                market.elapsed = 0;
                market.isRunning = true;
                transactionStarted = true;
                break;
              }
            }
          }
        }
        
        if (!market.isUnderConstruction && market.isRunning) {
          const workers = state.colonists ? state.colonists.filter(c => c.job === `markets_${idx}`) : [];
          let mult = 0;
          workers.forEach(c => {
            const lvl = c.attributes.trading || 3;
            mult += getAttributeMult(lvl) * getColonistEfficiency(c);
          });
          market.elapsed += effectiveDelta * mult;
          const duration = market.targetDuration || 0.1;
          if (market.elapsed >= duration) {
            market.isRunning = false;
            market.elapsed = 0;
            if (market.transactionType === 'buy') {
              addResourceStock(market.boughtResource, market.revenue);
              updateGlobalFood();
            } else {
              // es de tipo 'sell' (o fallback antiguo)
              state.gold += market.revenue;
              resourcesGeneratedThisSecond.gold += market.revenue;
            }
            market.transactionType = null;
            recalculateRates();
            if (typeof updateUI === 'function') updateUI();
          }
        }
      });
    }

  // Progreso de agricultura en Granjas (Corre de día y de noche)
  if (Array.isArray(state.farms)) {
    state.farms.forEach((farm, idx) => {
      // Si el cultivo no empieza por falta de semillas, se inicia automáticamente cuando haya semillas disponibles
      if (farm.stage === 'idle' && !farm.isUnderConstruction && farm.crop) {
        if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
        const nextCropKey = farm.crop;
        if ((state.seeds[nextCropKey] || 0) >= 1) {
          state.seeds[nextCropKey] -= 1;
          farm.stage = 'plow';
          farm.activeCrop = nextCropKey;
          farm.wateringsCompleted = 0;
          farm.stageElapsed = 0;
          farm.needsWatering = false;
          farm.waterElapsed = 0;
          delete farm.waterPaid;

          
          const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
          showToast(`Semillas disponibles: Iniciando cultivo de ${rawNames[nextCropKey] || nextCropKey} en Granja #${idx + 1}`, "success");
          recalculateRates();
        }
      }

      if (farm.isUnderConstruction || farm.stage === 'idle') return;

      const crop = CROPS[farm.activeCrop || farm.crop] || CROPS.wheat;
      
      const plowDur = (CONFIG.Timing && CONFIG.Timing.farm_plow) ? CONFIG.Timing.farm_plow.duration : 0.5;
      const sowDur = (CONFIG.Timing && CONFIG.Timing.farm_sow) ? CONFIG.Timing.farm_sow.duration : 0.5;
      const waterDur = (CONFIG.Timing && CONFIG.Timing.farm_water) ? CONFIG.Timing.farm_water.duration : 0.25;
      const growDur = crop ? (crop.duration / 2) : 1.5;
      const waterDailyDur = (CONFIG.Timing && CONFIG.Timing.farm_water_daily) ? CONFIG.Timing.farm_water_daily.duration : 0.0417;

      // Si la granja necesita riego diario
      if (farm.needsWatering) {
        if (state.timePhase !== 'night' && farm.workerAssigned > 0) {
          const worker = state.colonists ? state.colonists.find(c => c.job === `farms_${idx}`) : null;
          const farmingLvl = worker ? (worker.attributes.farming || 3) : 3;
          const farmingMult = getAttributeMult(farmingLvl) * (worker ? getColonistEfficiency(worker) : 1.0);
          farm.waterElapsed = (farm.waterElapsed || 0) + effectiveDelta * farmingMult;
          if (farm.waterElapsed >= waterDailyDur) {
            farm.needsWatering = false;
            farm.waterElapsed = 0;
            farm.wateringsCompleted = (farm.wateringsCompleted || 0) + 1;
          }
        }
        return; // Detiene la progresión del crecimiento mientras necesite riego
      }

      let stageDuration = plowDur;
      if (farm.stage === 'sow') {
        stageDuration = sowDur;
      } else if (farm.stage === 'water' || farm.stage === 'water2') {
        stageDuration = waterDur;
      } else if (farm.stage === 'grow' || farm.stage === 'grow2') {
        stageDuration = growDur;
      }

      let elapsedIncrement = 0;
      if (farm.workerAssigned > 0) {
        if (farm.stage === 'grow' || farm.stage === 'grow2') {
          elapsedIncrement = effectiveDelta; // Crecimiento biológico pasivo ocurre día y noche
        } else if (state.timePhase !== 'night') {
          // Si estamos en etapa de riego, primero debemos asegurar que se ha pagado el agua
          if (farm.stage === 'water' || farm.stage === 'water2') {
            if (!farm.waterPaid) {
              const waterCost = CONFIG?.Water?.water_per_irrigation?.value ?? 5;
              if (state.waterToday >= waterCost) {
                state.waterToday -= waterCost;
                farm.waterPaid = true;
                if (typeof updateUI === 'function') updateUI();
              }
            }
          }

          // Solo acumulamos progreso si no es etapa de riego o si ya se pagó el agua
          if (!(farm.stage === 'water' || farm.stage === 'water2') || farm.waterPaid) {
            const worker = state.colonists ? state.colonists.find(c => c.job === `farms_${idx}`) : null;
            const farmingLvl = worker ? (worker.attributes.farming || 3) : 3;
            const farmingMult = getAttributeMult(farmingLvl) * (worker ? getColonistEfficiency(worker) : 1.0);
            elapsedIncrement = effectiveDelta * farmingMult;
          }
        }
      }

      farm.stageElapsed = (farm.stageElapsed || 0) + elapsedIncrement;

      if (farm.stageElapsed >= stageDuration) {
        farm.stageElapsed = 0;
        if (farm.stage === 'plow') {
          farm.stage = 'sow';
        } else if (farm.stage === 'sow') {
          farm.stage = 'water';
          farm.waterPaid = false;
        } else if (farm.stage === 'water') {
          farm.stage = 'grow';
          delete farm.waterPaid;
        } else if (farm.stage === 'grow') {
          farm.stage = 'water2';
          farm.waterPaid = false;
        } else if (farm.stage === 'water2') {
          farm.stage = 'grow2';
          delete farm.waterPaid;
        } else if (farm.stage === 'grow2') {
          // Cosechar!
          const farmTier = farm.tier || 1;
          const tierMultiplier = farmTier === 3 ? 2.5 : (farmTier === 2 ? 1.5 : 1.0);
          const worker = state.colonists ? state.colonists.find(c => c.job === `farms_${idx}`) : null;
          const farmingLvl = worker ? (worker.attributes.farming || 3) : 3;
          const farmingMult = getAttributeMult(farmingLvl);
          const yieldMin = crop.output_min !== undefined ? crop.output_min : crop.yield;
          const yieldMax = crop.output_max !== undefined ? crop.output_max : crop.yield;
          const finalYield = yieldMin + Math.random() * (yieldMax - yieldMin);
          const harvestedYield = finalYield * tierMultiplier * farmingMult;
          
          const cropKey = farm.activeCrop || farm.crop || 'wheat';
          addResourceStock(cropKey, harvestedYield);
          updateGlobalFood();
          
          showToast(`¡Cosecha de ${crop.name} lista en Granja #${idx + 1}! +${harvestedYield.toFixed(0)} ${crop.name}`, "success");

          // Reiniciar el ciclo si hay semillas disponibles para la semilla seleccionada
          const nextCropKey = farm.crop || 'wheat';
          if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
          if ((state.seeds[nextCropKey] || 0) >= 1) {
            state.seeds[nextCropKey] -= 1;
            farm.stage = 'plow';
            farm.activeCrop = nextCropKey;
            farm.wateringsCompleted = 0;
            delete farm.waterPaid;
          } else {
            farm.stage = 'idle';
            farm.wateringsCompleted = 0;
            delete farm.waterPaid;
            const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
            showToast(`Sin semillas de ${rawNames[nextCropKey] || nextCropKey} para reiniciar cultivo en Granja #${idx + 1}`, "warning");
          }
          recalculateRates();
        }
      }
    });
  }

  // 5. Alimentar reactivamente a colonos hambrientos si hay comida disponible
  if (state.colonists) {
    const starvingColonists = state.colonists.filter(c => c.isStarving);
    if (starvingColonists.length > 0 && state.food > 0) {
      let feedOccurred = false;
      starvingColonists.forEach(c => {
        const fed = tryFeedColonist(c);
        if (fed) {
          c.isStarving = false;
          feedOccurred = true;
        }
      });
      if (feedOccurred) {
        state.starvingColonists = state.colonists.filter(c => c.isStarving).length;
        updateGlobalFood();
        recalculateRates();
        if (typeof updateUI === 'function') updateUI();
      }
    }
  }

  // Resetear acumulador de recursos cada segundo
  if (now - lastRateResetTime >= 1000) {
    resourcesGeneratedThisSecond = { gold: 0, wood: 0, stone: 0, food: 0, cooked: 0 };
    lastRateResetTime = now;
  }

  // Progresar XP de atributos para colonos trabajando
  if (state.timePhase === 'day') {
    const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
    
    if (state.colonists) {
      let ratesDirty = false;
      state.colonists.forEach(colonist => {
        const attr = getAttrForJob(colonist.job);
        if (attr) {
          if (!colonist.attributeXP) colonist.attributeXP = {};
          if (typeof colonist.attributeXP[attr] === 'undefined') colonist.attributeXP[attr] = 0;
          
          const xpYield = getXPJobYield(colonist.job);
          colonist.attributeXP[attr] += (xpYield * effectiveDelta) / dayDuration;
          
          const currentLvl = colonist.attributes[attr] || 1;
          const xpReq = getXPThreshold(attr, currentLvl);
          
          if (colonist.attributeXP[attr] >= xpReq && currentLvl < 10) {
            colonist.attributes[attr]++;
            colonist.attributeXP[attr] = 0;
            ratesDirty = true;
            showToast(`⬆️ ¡${colonist.name} mejoró ${getAttrLabel(attr)} a nivel ${currentLvl + 1}!`, 'success');
          }
        }
      });
      if (ratesDirty) {
        recalculateRates();
      }
    }
  }

  if (typeof updateRatesUI === 'function') updateRatesUI();
  if (typeof updateUI === 'function') updateUI();
}

function getAttrForJob(job) {
  if (!job) return null;
  if (job === 'wood' || job.startsWith('lumbermills_')) return 'woodcutting';
  if (job === 'stone' || job.startsWith('quarries_')) return 'mining';
  if (job === 'berries') return 'exploration';
  if (job.startsWith('farms_') || job.startsWith('granaries_')) return 'farming';
  if (job.startsWith('bonfires_')) return 'cooking';
  if (job.startsWith('markets_')) return 'trading';
  if (job === 'construction') return 'construction';
  return null;
}

function getAttrLabel(attr) {
  const labels = {
    woodcutting: 'Corte de Madera',
    mining: 'Minería',
    farming: 'Agricultura',
    cooking: 'Cocinado',
    trading: 'Comercio',
    exploration: 'Exploración',
    construction: 'Construcción',
    combat: 'Combate'
  };
  return labels[attr] || attr;
}

// Añadir XP a un colono y gestionar posibles subidas de nivel
function addXPToColonist(colonist, attr, amount) {
  if (!colonist.attributeXP) colonist.attributeXP = {};
  if (typeof colonist.attributeXP[attr] === 'undefined') colonist.attributeXP[attr] = 0;
  
  colonist.attributeXP[attr] += amount;
  
  let levelsGained = 0;
  let currentLvl = colonist.attributes[attr] || 1;
  
  while (currentLvl < 10) {
    const xpReq = getXPThreshold(attr, currentLvl);
    if (colonist.attributeXP[attr] >= xpReq) {
      colonist.attributeXP[attr] -= xpReq;
      colonist.attributes[attr]++;
      currentLvl++;
      levelsGained++;
    } else {
      break;
    }
  }
  
  if (levelsGained > 0) {
    showToast(`⬆️ ¡${colonist.name} mejoró ${getAttrLabel(attr)} a nivel ${currentLvl}!`, 'success');
    if (typeof recalculateRates === 'function') recalculateRates();
  }
}

// Calcula la probabilidad de éxito de la misión
function getMissionSuccessChance(mission, def) {
  const scalingFactor = CONFIG?.Raid?.success_scaling_factor?.value ?? 0.4;
  const maxAttrCap = CONFIG?.Raid?.max_attribute_cap?.value ?? 10;
  
  let sumAttr = 0;
  mission.assignedColonistIds.forEach(id => {
    const col = state.colonists.find(c => c.id === id);
    if (col) {
      const val = col.attributes[def.attribute] || 1;
      sumAttr += Math.min(val, maxAttrCap);
    }
  });
  
  return Math.min(1.0, def.baseSuccessRate + (sumAttr * scalingFactor));
}

// Otorga las recompensas en caso de éxito
function rewardMissionSuccess(mission, def) {
  if (def.rewardRep > 0) {
    state.reputation = (state.reputation || 0) + def.rewardRep;
  }
  if (def.rewardGold > 0) {
    state.gold = (state.gold || 0) + def.rewardGold;
  }
  if (def.rewardSeedsType !== 'none' && def.rewardSeedsAmt > 0) {
    if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
    state.seeds[def.rewardSeedsType] = (state.seeds[def.rewardSeedsType] || 0) + def.rewardSeedsAmt;
  }
  
  if (def.rewardSpecialist !== 'none') {
    if (typeof generateSpecialistColonist === 'function') {
      generateSpecialistColonist(def.rewardSpecialist);
    }
  }
  
  // XP Completa (2 XP por día de duración)
  const xpAmt = mission.durationDays * 2.0;
  mission.assignedColonistIds.forEach(id => {
    const col = state.colonists.find(c => c.id === id);
    if (col) {
      addXPToColonist(col, def.attribute, xpAmt);
    }
  });
  
  showToast(`🎉 ¡Misión ${mission.name} completada con ÉXITO!`, "success");
}

// Otorga las recompensas en caso de fallo (XP al 50%)
function rewardMissionFailure(mission, def) {
  const xpAmt = mission.durationDays * 2.0 * 0.5;
  mission.assignedColonistIds.forEach(id => {
    const col = state.colonists.find(c => c.id === id);
    if (col) {
      addXPToColonist(col, def.attribute, xpAmt);
    }
  });
  
  showToast(`⚠️ La misión ${mission.name} ha FRACASADO.`, "warning");
}

// Restaura los trabajos y estados previos de los colonos
function restoreMissionColonists(mission) {
  mission.assignedColonistIds.forEach(id => {
    const col = state.colonists.find(c => c.id === id);
    if (col) {
      col.onMission = false;
      col.missionId = null;
      col.job = col.prevJob !== undefined ? col.prevJob : null;
      col.prevJob = null;
    }
  });
  
  if (typeof fixColonistAllocation === 'function') {
    fixColonistAllocation();
  }
}

// Resuelve una misión activa al completarse su tiempo
function completeMission(idx) {
  const m = state.availableMissions[idx];
  if (!m) return;
  
  const def = window.GAME_MISSIONS ? GAME_MISSIONS.find(dm => dm.id === m.defId) : null;
  if (!def) {
    restoreMissionColonists(m);
    m.status = 'completed';
    m.success = true;
    m.rewardsText = 'Ninguna';
    if (typeof updateUI === 'function') updateUI();
    return;
  }
  
  const successChance = getMissionSuccessChance(m, def);
  const success = Math.random() < successChance;
  
  let rewardsList = [];
  if (success) {
    // Otorgar recompensas
    if (m.rewardRep > 0) {
      state.reputation = (state.reputation || 0) + m.rewardRep;
      rewardsList.push(`🏆 +${m.rewardRep} Rep`);
    }
    if (m.rewardGold > 0) {
      state.gold = (state.gold || 0) + m.rewardGold;
      rewardsList.push(`🪙 +${m.rewardGold} Oro`);
    }
    if (m.rewardSeedsType !== 'none' && m.rewardSeedsAmt > 0) {
      if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
      state.seeds[m.rewardSeedsType] = (state.seeds[m.rewardSeedsType] || 0) + m.rewardSeedsAmt;
      const seedEmojis = { wheat: '🌾 Semillas Trigo', potato: '🥔 Semillas Patata', carrot: '🥕 Semillas Zanahoria' };
      rewardsList.push(`${seedEmojis[m.rewardSeedsType] || '🌱'} x${m.rewardSeedsAmt}`);
    }
    if (m.rewardSpecialist !== 'none') {
      if (typeof generateSpecialistColonist === 'function') {
        generateSpecialistColonist(m.rewardSpecialist);
      }
      const specialistLabels = { random: 'Especialista', mining: 'Minero', farming: 'Agricultor', combat: 'Guerrero' };
      rewardsList.push(`🌟 Maestro ${specialistLabels[m.rewardSpecialist] || m.rewardSpecialist}`);
    }
    
    // Asignar XP completa
    const xpAmt = m.durationDays * 2.0;
    m.assignedColonistIds.forEach(id => {
      const col = state.colonists.find(c => c.id === id);
      if (col) {
        addXPToColonist(col, def.attribute, xpAmt);
      }
    });
    
    showToast(`🎉 ¡Expedición ${m.name} completada con ÉXITO!`, "success");
  } else {
    // Asignar 50% XP en caso de fallo
    const xpAmt = m.durationDays * 2.0 * 0.5;
    m.assignedColonistIds.forEach(id => {
      const col = state.colonists.find(c => c.id === id);
      if (col) {
        addXPToColonist(col, def.attribute, xpAmt);
      }
    });
    
    showToast(`⚠️ La expedición ${m.name} ha FRACASADO.`, "warning");
  }
  
  restoreMissionColonists(m);
  
  m.status = 'completed';
  m.success = success;
  m.rewardsText = success ? rewardsList.join(' • ') : 'Ninguna (Fallo)';
  m.completedDay = state.currentDay;
  
  if (!state.missionHistory) state.missionHistory = [];
  state.missionHistory.push({
    defId: m.defId,
    name: m.name,
    status: success ? 'success' : 'failure',
    completedDay: state.currentDay
  });
  
  if (typeof updateGlobalFood === 'function') updateGlobalFood();
  if (typeof recalculateRates === 'function') recalculateRates();
  if (typeof updateUI === 'function') updateUI();
}

// Iniciar el game loop inmediatamente
setInterval(gameTick, 100);

