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

function feedAnimalsDaily() {
  if (!state.animals || state.animals.length === 0) return;
  
  let starvedCount = 0;
  state.animals.forEach(a => {
    const def = ANIMAL_TYPES[a.type];
    if (!def) return;
    const dailyCost = def.foodCost;
    
    if ((state.pienso || 0) >= dailyCost) {
      state.pienso -= dailyCost;
      a.fedToday = true;
    } else {
      a.fedToday = false;
      starvedCount++;
    }
  });
  
  if (starvedCount > 0) {
    showToast(`⚠️ ${starvedCount} animales no pudieron alimentarse hoy por falta de pienso.`, "warning");
  } else {
    showToast("🌾 Todos los animales han sido alimentados con pienso.", "success");
  }
}

// Alimentar a los colonos por la mañana (Desayuno)
function feedColonistsMorning() {
  state.waterToday = state.waterMax;

  const total = state.colonists ? state.colonists.length : 0;
  
  // Alimentar animales primero
  feedAnimalsDaily();

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
  if (typeof updateUI === 'function') updateUI();
}

// Alimentar a los colonos por la noche (Cena)
function feedColonistsEvening() {
  const total = state.colonists ? state.colonists.length : 0;
  
  // Resetear alimentación de animales al anochecer
  if (state.animals) {
    state.animals.forEach(a => a.fedToday = false);
  }

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
  if (typeof updateUI === 'function') updateUI();
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

function autoAssignTools() {
  if (!Array.isArray(state.tools)) return false;

  const buildingsNeedTools = [
    { type: 'lumberMills', stateKey: 'lumberMills', assignPrefix: 'lumbermills', toolType: 'axe' },
    { type: 'quarries', stateKey: 'quarries', assignPrefix: 'quarries', toolType: 'pickaxe' },
    { type: 'farms', stateKey: 'farms', assignPrefix: 'farms', toolType: 'hoe' }
  ];

  let changed = false;

  buildingsNeedTools.forEach(spec => {
    const list = state[spec.stateKey];
    if (Array.isArray(list)) {
      list.forEach((building, idx) => {
        const assignKey = `${spec.assignPrefix}_${idx}`;
        if (!building.isUnderConstruction && !building.isUpgrading && building.workerAssigned > 0) {
          // ¿Tiene ya herramienta asignada y viva?
          const currentTool = state.tools.find(t => t.assignedTo === assignKey && t.durability > 0);
          if (!currentTool) {
            // Si hay una herramienta asignada rota, la liberamos
            const brokenTool = state.tools.find(t => t.assignedTo === assignKey);
            if (brokenTool) {
              brokenTool.assignedTo = null;
              changed = true;
            }

            // Buscamos la mejor herramienta libre de este tipo (mejor tier, y en caso de empate, mayor durabilidad)
            const freeTools = state.tools.filter(t => t.type === spec.toolType && t.assignedTo === null && t.durability > 0);
            if (freeTools.length > 0) {
              freeTools.sort((a, b) => {
                if (b.tier !== a.tier) return b.tier - a.tier;
                return b.durability - a.durability;
              });
              const bestTool = freeTools[0];
              bestTool.assignedTo = assignKey;
              changed = true;
              console.log(`[AUTO TOOL] Assigned Tool ID ${bestTool.id} (${bestTool.type} T${bestTool.tier}) to ${assignKey}`);
            }
          }
        } else {
          // Liberar herramientas asignadas a edificios inactivos o sin trabajadores
          const currentTool = state.tools.find(t => t.assignedTo === assignKey);
          if (currentTool) {
            currentTool.assignedTo = null;
            changed = true;
            console.log(`[AUTO TOOL] Released Tool ID ${currentTool.id} from ${assignKey} (no workers or building in progress)`);
          }
        }
      });
    }
  });

  return changed;
}

// Recalcular la tasa de cambio diario de recursos basada en asignaciones y eficiencia
function recalculateRates() {
  if (!CONFIG || Object.keys(CONFIG).length === 0) return;
  autoAssignTools();


  syncStateDurationsFromConfig();
  const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
  const nightDuration = CONFIG.Timing && CONFIG.Timing.night_duration ? CONFIG.Timing.night_duration.duration : 20.0;
  
  // Inicialización de variables para tasas nominales (medias), mínimas y máximas
  let woodRate = 0, woodRateMin = 0, woodRateMax = 0;
  let stoneRate = 0, stoneRateMin = 0, stoneRateMax = 0;
  let ironRate = 0, ironRateMin = 0, ironRateMax = 0;
  let iron_barRate = 0, iron_barRateMin = 0, iron_barRateMax = 0;
  let wheatRate = 0, wheatRateMin = 0, wheatRateMax = 0;
  let potatoRate = 0, potatoRateMin = 0, potatoRateMax = 0;
  let carrotRate = 0, carrotRateMin = 0, carrotRateMax = 0;
  let berriesRate = 0, berriesRateMin = 0, berriesRateMax = 0;
  let cooked_wheatRate = 0, cooked_wheatRateMin = 0, cooked_wheatRateMax = 0;
  let cooked_potatoRate = 0, cooked_potatoRateMin = 0, cooked_potatoRateMax = 0;
  let cooked_carrotRate = 0, cooked_carrotRateMin = 0, cooked_carrotRateMax = 0;
  let cooked_berriesRate = 0, cooked_berriesRateMin = 0, cooked_berriesRateMax = 0;
  let flourRate = 0, flourRateMin = 0, flourRateMax = 0;
  let breadRate = 0, breadRateMin = 0, breadRateMax = 0;
  let stewRate = 0, stewRateMin = 0, stewRateMax = 0;

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
        // PASO L: verificar hacha asignada
        const assignKey = `lumbermills_${idx}`;
        const tool = Array.isArray(state.tools) ? state.tools.find(t => t.assignedTo === assignKey && t.durability > 0) : null;
        if (!tool) return; // sin hacha: producción 0

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
        // PASO L: verificar pico asignado
        const assignKey = `quarries_${idx}`;
        const tool = Array.isArray(state.tools) ? state.tools.find(t => t.assignedTo === assignKey && t.durability > 0) : null;
        if (!tool) return; // sin pico: producción 0

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

        const ironRatio = CONFIG?.Mining?.iron_ore_ratio?.value ?? 5;
        ironRate += ((yieldVal / durationVal) * mult) / ironRatio;
        ironRateMin += ((yieldMin / durationVal) * mult) / ironRatio;
        ironRateMax += ((yieldMax / durationVal) * mult) / ironRatio;
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
          
          if (recipe === 'bread') {
            const recipeCfg = CONFIG.Processing && CONFIG.Processing.recipe_bread;
            if (recipeCfg) {
              const consumeRate = (recipeCfg.input_amt / rec.duration) * mult;
              const rMin = recipeCfg.output_min !== undefined ? recipeCfg.output_min : recipeCfg.yield;
              const rMax = recipeCfg.output_max !== undefined ? recipeCfg.output_max : recipeCfg.yield;
              const produceRate = (recipeCfg.yield / rec.duration) * mult;
              const produceRateMin = (rMin / rec.duration) * mult;
              const produceRateMax = (rMax / rec.duration) * mult;

              flourRate -= consumeRate;
              flourRateMin -= consumeRate;
              flourRateMax -= consumeRate;

              breadRate += produceRate;
              breadRateMin += produceRateMin;
              breadRateMax += produceRateMax;
            }
          } else if (recipe === 'stew') {
            const recipeCfg = CONFIG.Processing && CONFIG.Processing.recipe_stew;
            if (recipeCfg) {
              const consumeRate = (recipeCfg.input_amt / rec.duration) * mult;
              const rMin = recipeCfg.output_min !== undefined ? recipeCfg.output_min : recipeCfg.yield;
              const rMax = recipeCfg.output_max !== undefined ? recipeCfg.output_max : recipeCfg.yield;
              const produceRate = (recipeCfg.yield / rec.duration) * mult;
              const produceRateMin = (rMin / rec.duration) * mult;
              const produceRateMax = (rMax / rec.duration) * mult;

              potatoRate -= consumeRate;
              potatoRateMin -= consumeRate;
              potatoRateMax -= consumeRate;

              carrotRate -= consumeRate;
              carrotRateMin -= consumeRate;
              carrotRateMax -= consumeRate;

              stewRate += produceRate;
              stewRateMin += produceRateMin;
              stewRateMax += produceRateMax;
            }
          } else {
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
      }
    });
  }

  // Molinos (Mills)
  if (state.mills) {
    state.mills.forEach((m, idx) => {
      if ((m.workerAssigned > 0 || m.isRunning) && !m.isUnderConstruction && !m.isUpgrading) {
        const tier = m.tier || 1;
        const recipeKey = `mill_flour_t${tier}`;
        const recipe = CONFIG.Crafting && CONFIG.Crafting[recipeKey];
        if (recipe) {
          let mult = 0;
          if (m.workerAssigned > 0) {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `mills_${idx}`) : [];
            workers.forEach(c => {
              const lvl = c.attributes.farming || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
          } else if (m.isRunning) {
            mult = 1;
          }
          
          const timingKey = `mill_flour_t${tier}`;
          const timing = CONFIG.Timing && CONFIG.Timing[timingKey];
          const duration = timing ? timing.duration : 2.0;
          
          const consumeRate = (recipe.input_amt / duration) * mult;
          const yieldMin = recipe.output_min !== undefined ? recipe.output_min : recipe.yield;
          const yieldMax = recipe.output_max !== undefined ? recipe.output_max : recipe.yield;
          const produceRate = (recipe.yield / duration) * mult;
          const produceRateMin = (yieldMin / duration) * mult;
          const produceRateMax = (yieldMax / duration) * mult;
          
          wheatRate -= consumeRate;
          wheatRateMin -= consumeRate;
          wheatRateMax -= consumeRate;
          
          flourRate += produceRate;
          flourRateMin += produceRateMin;
          flourRateMax += produceRateMax;
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

  // Forjas (Forges)
  if (state.forges) {
    state.forges.forEach((forge, idx) => {
      if ((forge.workerAssigned > 0 || forge.isRunning) && !forge.isUnderConstruction && !forge.isUpgrading) {
        const tier = forge.tier || 1;
        const recipeKey = `forge_iron_t${tier}`;
        const recipe = CONFIG.Crafting && CONFIG.Crafting[recipeKey];
        if (recipe) {
          let mult = 0;
          if (forge.workerAssigned > 0) {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `forges_${idx}`) : [];
            workers.forEach(c => {
              const lvl = c.attributes.mining || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
          } else if (forge.isRunning) {
            mult = 1;
          }
          const duration = recipe.duration || (tier === 1 ? 3.0 : 2.0);
          const consumeRate = (recipe.consume_amount / duration) * mult;
          
          const yieldMin = recipe.output_min !== undefined ? recipe.output_min : recipe.yield;
          const yieldMax = recipe.output_max !== undefined ? recipe.output_max : recipe.yield;
          const produceRate = (recipe.yield / duration) * mult;
          const produceRateMin = (yieldMin / duration) * mult;
          const produceRateMax = (yieldMax / duration) * mult;

          ironRate -= consumeRate;
          ironRateMin -= consumeRate;
          ironRateMax -= consumeRate;

          iron_barRate += produceRate;
          iron_barRateMin += produceRateMin;
          iron_barRateMax += produceRateMax;
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

  // 13. Ganadería (Livestock)
  let eggsRate = 0, feathersRate = 0, skinsRate = 0, fertilizerRate = 0;
  if (Array.isArray(state.animals)) {
    state.animals.forEach(a => {
      if (!a.fedToday) return;
      const def = ANIMAL_TYPES[a.type];
      if (!def) return;
      if (a.type === 'chicken') {
        eggsRate += def.outputRate / dayDuration;
        feathersRate += 0.1 / dayDuration;
      } else if (a.type === 'pig') {
        skinsRate += def.outputRate / dayDuration;
        fertilizerRate += 0.1 / dayDuration;
      } else if (a.type === 'cow') {
        skinsRate += def.outputRate / dayDuration;
        fertilizerRate += 0.1 / dayDuration;
      }
    });
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
  calculatedRates.iron = ironRate * dayDuration;
  calculatedRates.iron_bar = iron_barRate * dayDuration;
  calculatedRates.eggs = eggsRate * dayDuration;
  calculatedRates.feathers = feathersRate * dayDuration;
  calculatedRates.skins = skinsRate * dayDuration;
  calculatedRates.fertilizer = fertilizerRate * dayDuration;
  calculatedRates.flour = flourRate * dayDuration;
  calculatedRates.bread = breadRate * dayDuration;
  calculatedRates.stew = stewRate * dayDuration;

  // Tasas de comida globales nominales
  let totalFoodRate = 0;
  const foodKeys = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries', 'eggs', 'bread', 'stew'];
  foodKeys.forEach(key => {
    if (state.allowConsume && state.allowConsume[key] !== false) {
      const eqObj = CONFIG.FoodEquivalence[key];
      const mult = eqObj ? eqObj.yield : 1;
      let rateVal = 0;
      if (key === 'wheat') rateVal = wheatRate;
      else if (key === 'potato') rateVal = potatoRate;
      else if (key === 'carrot') rateVal = carrotRate;
      else if (key === 'berries') rateVal = berriesRate;
      else if (key === 'cooked_wheat') rateVal = cooked_wheatRate;
      else if (key === 'cooked_potato') rateVal = cooked_potatoRate;
      else if (key === 'cooked_carrot') rateVal = cooked_carrotRate;
      else if (key === 'cooked_berries') rateVal = cooked_berriesRate;
      else if (key === 'eggs') rateVal = eggsRate;
      else if (key === 'bread') rateVal = breadRate;
      else if (key === 'stew') rateVal = stewRate;
      totalFoodRate += rateVal * mult;
    }
  });
  calculatedRates.food = totalFoodRate * dayDuration;
  calculatedRates.cooked = (cooked_wheatRate + cooked_potatoRate + cooked_carrotRate + cooked_berriesRate + breadRate + stewRate) * dayDuration;

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
  window.calculatedRatesMin.iron = ironRateMin * dayDuration;
  window.calculatedRatesMin.iron_bar = iron_barRateMin * dayDuration;
  window.calculatedRatesMin.eggs = eggsRate * dayDuration;
  window.calculatedRatesMin.feathers = feathersRate * dayDuration;
  window.calculatedRatesMin.skins = skinsRate * dayDuration;
  window.calculatedRatesMin.fertilizer = fertilizerRate * dayDuration;

  window.calculatedRatesMin.flour = flourRateMin * dayDuration;
  window.calculatedRatesMin.bread = breadRateMin * dayDuration;
  window.calculatedRatesMin.stew = stewRateMin * dayDuration;

  let totalFoodRateMin = 0;
  foodKeys.forEach(key => {
    if (state.allowConsume && state.allowConsume[key] !== false) {
      const eqObj = CONFIG.FoodEquivalence[key];
      const mult = eqObj ? eqObj.yield : 1;
      let rateValMin = 0;
      if (key === 'wheat') rateValMin = wheatRateMin;
      else if (key === 'potato') rateValMin = potatoRateMin;
      else if (key === 'carrot') rateValMin = carrotRateMin;
      else if (key === 'berries') rateValMin = berriesRateMin;
      else if (key === 'cooked_wheat') rateValMin = cooked_wheatRateMin;
      else if (key === 'cooked_potato') rateValMin = cooked_potatoRateMin;
      else if (key === 'cooked_carrot') rateValMin = cooked_carrotRateMin;
      else if (key === 'cooked_berries') rateValMin = cooked_berriesRateMin;
      else if (key === 'eggs') rateValMin = eggsRate;
      else if (key === 'bread') rateValMin = breadRateMin;
      else if (key === 'stew') rateValMin = stewRateMin;
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
  window.calculatedRatesMax.iron = ironRateMax * dayDuration;
  window.calculatedRatesMax.iron_bar = iron_barRateMax * dayDuration;
  window.calculatedRatesMax.eggs = eggsRate * dayDuration;
  window.calculatedRatesMax.feathers = feathersRate * dayDuration;
  window.calculatedRatesMax.skins = skinsRate * dayDuration;
  window.calculatedRatesMax.fertilizer = fertilizerRate * dayDuration;
  window.calculatedRatesMax.flour = flourRateMax * dayDuration;
  window.calculatedRatesMax.bread = breadRateMax * dayDuration;
  window.calculatedRatesMax.stew = stewRateMax * dayDuration;

  let totalFoodRateMax = 0;
  foodKeys.forEach(key => {
    if (state.allowConsume && state.allowConsume[key] !== false) {
      const eqObj = CONFIG.FoodEquivalence[key];
      const mult = eqObj ? eqObj.yield : 1;
      let rateValMax = 0;
      if (key === 'wheat') rateValMax = wheatRateMax;
      else if (key === 'potato') rateValMax = potatoRateMax;
      else if (key === 'carrot') rateValMax = carrotRateMax;
      else if (key === 'berries') rateValMax = berriesRateMax;
      else if (key === 'cooked_wheat') rateValMax = cooked_wheatRateMax;
      else if (key === 'cooked_potato') rateValMax = cooked_potatoRateMax;
      else if (key === 'cooked_carrot') rateValMax = cooked_carrotRateMax;
      else if (key === 'cooked_berries') rateValMax = cooked_berriesRateMax;
      else if (key === 'eggs') rateValMax = eggsRate;
      else if (key === 'bread') rateValMax = breadRateMax;
      else if (key === 'stew') rateValMax = stewRateMax;
      totalFoodRateMax += rateValMax * mult;
    }
  });
  window.calculatedRatesMax.food = totalFoodRateMax * dayDuration;

  if (typeof recalculateWaterMax === 'function') recalculateWaterMax();
}

function resolveColonistsPriorities() {
  if (!state.colonists || !Array.isArray(state.colonists)) return;
  
  const occupiedSlots = {};
  
  const getBuildingMaxWorkers = (type, idx) => {
    const list = state[type];
    if (!list || !list[idx]) return 0;
    const b = list[idx];
    if (b.isUnderConstruction || b.isUpgrading) {
      return 2;
    }
    if (type === 'houses') return 0;
    if (type === 'farms') return 1;
    if (type === 'forges') return 1;
    if (type === 'markets') return b.tier || 1;
    
    if (['bonfires', 'granaries', 'smithies', 'mills'].includes(type)) {
      const typeKey = type === 'smithies' ? 'smithy' : (type === 'bonfires' ? 'bonfire' : (type === 'mills' ? 'mill' : 'granary'));
      const slotsKey = `${typeKey}_t${b.tier || 1}_slots`;
      if (CONFIG && CONFIG.BuildingSlots && CONFIG.BuildingSlots[slotsKey]) {
        return parseInt(CONFIG.BuildingSlots[slotsKey].value) || 1;
      }
      return b.tier || 1;
    }
    return b.tier || 1;
  };

  const prefixMapping = {
    lumberMills: 'lumbermills',
    quarries: 'quarries',
    farms: 'farms',
    markets: 'markets',
    bonfires: 'bonfires',
    granaries: 'granaries',
    smithies: 'smithies',
    forges: 'forges',
    mills: 'mills',
    corrals: 'corrals'
  };

  const isBasicResourceFull = (taskType) => {
    if (taskType === 'wood') {
      const cap = (state.storageCapacity && state.storageCapacity.wood) ?? Infinity;
      return (state.wood || 0) >= cap;
    }
    if (taskType === 'stone') {
      const cap = (state.storageCapacity && state.storageCapacity.stone) ?? Infinity;
      return (state.stone || 0) >= cap;
    }
    if (taskType === 'berries') {
      const cap = (state.storageCapacity && state.storageCapacity.food) ?? Infinity;
      const currentVal = typeof window.getFoodOccupation === 'function' ? window.getFoodOccupation() : 0;
      return currentVal >= cap;
    }
    return false;
  };

  const hasActiveConstructionProjects = () => {
    if (state.townHall && (state.townHall.isUnderConstruction || state.townHall.isUpgrading) && !state.townHall.isPaused) {
      return true;
    }
    const typesToCheck = ['houses', 'lumberMills', 'quarries', 'farms', 'markets', 'bonfires', 'granaries', 'smithies', 'forges', 'mills', 'corrals', 'wells', 'warehouses'];
    for (const type of typesToCheck) {
      if (Array.isArray(state[type])) {
        for (const building of state[type]) {
          if ((building.isUnderConstruction || building.isUpgrading) && !building.isPaused) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const findFallbackJob = (c) => {
    const isFoodFull = isBasicResourceFull('berries');
    if (!isFoodFull) {
      return { job: 'berries', taskType: 'berries', buildingIdx: null };
    }
    
    const isWoodFull = isBasicResourceFull('wood');
    const isStoneFull = isBasicResourceFull('stone');
    
    if (!isWoodFull && !isStoneFull) {
      const woodQty = state.wood || 0;
      const stoneQty = state.stone || 0;
      let targetJob = 'wood';
      if (woodQty > stoneQty) {
        if (woodQty - stoneQty >= 5) {
          targetJob = 'stone';
        } else {
          const prevJob = c ? c.job : null;
          if (prevJob === 'stone') {
            targetJob = 'stone';
          } else {
            targetJob = 'wood';
          }
        }
      } else if (stoneQty > woodQty) {
        targetJob = 'wood';
      }
      return { job: targetJob, taskType: targetJob, buildingIdx: null };
    }
    if (!isWoodFull) {
      return { job: 'wood', taskType: 'wood', buildingIdx: null };
    }
    if (!isStoneFull) {
      return { job: 'stone', taskType: 'stone', buildingIdx: null };
    }
    
    // Si todo lo básico está lleno, intentar trabajar en edificios
    const buildingTypesOrder = ['farms', 'bonfires', 'lumberMills', 'quarries', 'smithies', 'forges', 'granaries', 'mills', 'markets'];
    for (const bType of buildingTypesOrder) {
      const prefix = prefixMapping[bType];
      const list = state[bType] || [];
      const available = [];
      list.forEach((b, idx) => {
        if (!b.isUnderConstruction && !b.isUpgrading && !b.isPaused) {
          const key = `${prefix}_${idx}`;
          if (typeof isWarehouseFullForJob === 'function' && !isWarehouseFullForJob(key)) {
            const max = getBuildingMaxWorkers(bType, idx);
            const currentCount = occupiedSlots[key] || 0;
            if (currentCount < max) {
              available.push({ idx, currentCount });
            }
          }
        }
      });
      if (available.length > 0) {
        available.sort((a, b) => a.currentCount - b.currentCount);
        const bestIdx = available[0].idx;
        const key = `${prefix}_${bestIdx}`;
        occupiedSlots[key] = (occupiedSlots[key] || 0) + 1;
        return { job: key, taskType: bType, buildingIdx: bestIdx };
      }
    }
    
    return null;
  };

  let totalConstructionSlots = 0;
  if (state.townHall && (state.townHall.isUnderConstruction || state.townHall.isUpgrading) && !state.townHall.isPaused) {
    totalConstructionSlots += 2;
  }
  const typesToCheck = ['houses', 'lumberMills', 'quarries', 'farms', 'markets', 'bonfires', 'granaries', 'smithies', 'forges', 'mills', 'corrals', 'wells', 'warehouses'];
  for (const type of typesToCheck) {
    if (Array.isArray(state[type])) {
      state[type].forEach(building => {
        if ((building.isUnderConstruction || building.isUpgrading) && !building.isPaused) {
          totalConstructionSlots += 2;
        }
      });
    }
  }

  let assignedBuildersCount = 0;

  state.colonists.forEach(c => {
    if (c.onMission) {
      return;
    }
    
    const sorted = [...(c.priorities || [])].sort((a, b) => (a.weight || 1) - (b.weight || 1));
    
    let assigned = false;
    for (const priority of sorted) {
      const { taskType } = priority;
      if (!taskType) continue;
      
      if (['wood', 'stone', 'berries', 'construction'].includes(taskType)) {
        if (taskType === 'construction') {
          if (!hasActiveConstructionProjects() || assignedBuildersCount >= totalConstructionSlots) {
            continue;
          }
        }
        if (taskType !== 'construction' && isBasicResourceFull(taskType)) {
          continue;
        }
        c.currentTask = priority;
        c.job = taskType;
        if (taskType === 'construction') {
          assignedBuildersCount++;
        }
        assigned = true;
        break;
      }
      
      if (prefixMapping[taskType]) {
        const prefix = prefixMapping[taskType];
        const list = state[taskType] || [];
        const available = [];
        
        list.forEach((b, idx) => {
          if (taskType === 'mills') {
            console.log("[MILL DEBUG] Evaluating mill index", idx, "isUnderConstruction:", b.isUnderConstruction, "isUpgrading:", b.isUpgrading, "isPaused:", b.isPaused);
            console.log("[MILL DEBUG] Warehouse full for mills:", isWarehouseFullForJob(`${prefix}_${idx}`));
            console.log("[MILL DEBUG] Max workers:", getBuildingMaxWorkers(taskType, idx), "Current count:", occupiedSlots[`${prefix}_${idx}`]);
          }
          if (!b.isUnderConstruction && !b.isUpgrading && !b.isPaused) {
            const key = `${prefix}_${idx}`;
            if (typeof isWarehouseFullForJob === 'function' && !isWarehouseFullForJob(key)) {
              const max = getBuildingMaxWorkers(taskType, idx);
              const currentCount = occupiedSlots[key] || 0;
              if (currentCount < max) {
                available.push({ idx, currentCount });
              }
            }
          }
        });
        
        if (available.length > 0) {
          available.sort((a, b) => a.currentCount - b.currentCount);
          const bestIdx = available[0].idx;
          const key = `${prefix}_${bestIdx}`;
          
          c.currentTask = priority;
          c.job = key;
          occupiedSlots[key] = (occupiedSlots[key] || 0) + 1;
          assigned = true;
          break;
        }
      }
    }
    
    if (!assigned) {
      const fallback = findFallbackJob(c);
      if (fallback) {
        c.currentTask = { taskType: fallback.taskType, buildingIdx: fallback.buildingIdx, isFallback: true };
        c.job = fallback.job;
      } else {
        c.currentTask = null;
        c.job = null;
      }
    }
  });

  const buildingTypes = [
    { key: 'lumberMills', prefix: 'lumbermills' },
    { key: 'quarries', prefix: 'quarries' },
    { key: 'farms', prefix: 'farms' },
    { key: 'markets', prefix: 'markets' },
    { key: 'bonfires', prefix: 'bonfires' },
    { key: 'granaries', prefix: 'granaries' },
    { key: 'smithies', prefix: 'smithies' },
    { key: 'forges', prefix: 'forges' },
    { key: 'mills', prefix: 'mills' },
    { key: 'corrals', prefix: 'corrals' }
  ];
  
  buildingTypes.forEach(bt => {
    if (Array.isArray(state[bt.key])) {
      state[bt.key].forEach(b => {
        if (!b.isUnderConstruction && !b.isUpgrading) {
          b.workerAssigned = 0;
        }
      });
    }
  });
  
  if (state.townHall && !state.townHall.isUnderConstruction && !state.townHall.isUpgrading) {
    state.townHall.workerAssigned = 0;
  }
  
  state.colonists.forEach(c => {
    if (c.job) {
      if (c.job === 'townHall') {
        state.townHall.workerAssigned = (state.townHall.workerAssigned || 0) + 1;
      } else {
        const parts = c.job.split('_');
        if (parts.length === 2) {
          const type = parts[0];
          const idx = parseInt(parts[1]);
          const bt = buildingTypes.find(b => b.prefix === type);
          if (bt && state[bt.key] && state[bt.key][idx]) {
            const b = state[bt.key][idx];
            if (!b.isUnderConstruction && !b.isUpgrading) {
              b.workerAssigned = (b.workerAssigned || 0) + 1;
            }
          }
        }
      }
    }
  });

  // Sincronizar arreglos de slots individuales para edificios de producción
  buildingTypes.forEach(bt => {
    if (['bonfires', 'granaries', 'smithies', 'mills'].includes(bt.key)) {
      if (Array.isArray(state[bt.key])) {
        state[bt.key].forEach((b, idx) => {
          if (!b.isUnderConstruction && !b.isUpgrading) {
            const prefix = bt.prefix;
            const key = `${prefix}_${idx}`;
            const maxSlots = getBuildingMaxWorkers(bt.key, idx);
            
            b.workers = b.workers || [];
            while (b.workers.length < maxSlots) {
              b.workers.push(null);
            }
            if (b.workers.length > maxSlots) {
              b.workers = b.workers.slice(0, maxSlots);
            }
            
            const currentAssigns = state.colonists
              ? state.colonists.filter(c => c.job === key).map(c => c.id)
              : [];
            
            // Eliminar ocupantes desasignados
            for (let i = 0; i < b.workers.length; i++) {
              if (b.workers[i] !== null && !currentAssigns.includes(b.workers[i].colonistId)) {
                b.workers[i] = null;
              }
            }
            
            // Añadir nuevos ocupantes en slots vacíos
            currentAssigns.forEach(cId => {
              const alreadyOccupying = b.workers.some(w => w !== null && w.colonistId === cId);
              if (!alreadyOccupying) {
                const emptySlot = b.workers.findIndex(w => w === null);
                if (emptySlot !== -1) {
                  b.workers[emptySlot] = {
                    colonistId: cId,
                    selectedRecipe: bt.key === 'bonfires' ? (b.selectedRecipe || 'wheat') : undefined,
                    selectedCrop: bt.key === 'granaries' ? (b.selectedCrop || 'wheat') : undefined,
                    selectedTool: bt.key === 'smithies' ? (b.selectedTool || 'axe_t1') : undefined,
                    elapsed: 0,
                    isRunning: false
                  };
                }
              }
            });
            
            // Sincronizar workerAssigned
            b.workerAssigned = b.workers.filter(w => w !== null).length;
          }
        });
      }
    }
  });

  if (typeof autoAssignBuilders === 'function') {
    autoAssignBuilders();
  }
}
window.resolveColonistsPriorities = resolveColonistsPriorities;

// Bucle principal de simulación (corre cada 100ms)
function gameTick() {
  if (!CONFIG || Object.keys(CONFIG).length === 0) return;
  
  resolveColonistsPriorities();
  
  if (autoAssignTools()) {
    recalculateRates();
    if (typeof updateUI === 'function') updateUI();
  }

  
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
  
  // Avanzar viajes comerciales activos (PASO J.3 - COM-TRIP)
  if (Array.isArray(state.activeTrades)) {
    for (let i = state.activeTrades.length - 1; i >= 0; i--) {
      const trade = state.activeTrades[i];
      trade.timeLeftDays -= effectiveDelta / dayDuration;
      if (trade.timeLeftDays <= 0) {
        if (typeof completeTradeRoute === 'function') {
          completeTradeRoute(trade);
        }
        state.activeTrades.splice(i, 1);
      }
    }
  }

  // Avanzar viaje comercial personal del jugador (PASO J.3 - COM-TRIP)
  if (state.playerOnMission && state.playerMission) {
    state.playerMission.timeLeftDays -= effectiveDelta / dayDuration;
    if (state.playerMission.timeLeftDays <= 0) {
      if (typeof completePlayerTradeRoute === 'function') {
        completePlayerTradeRoute();
      }
    }
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
      
      // Progresar investigación activa
      if (state.researchQueue) {
        state.researchQueue.elapsed += 1;
        if (state.researchQueue.elapsed >= state.researchQueue.duration) {
          if (typeof completeResearch === 'function') {
            completeResearch();
          }
        }
      }
      
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
        const playerBuildSpeedCfg = CONFIG.Efficiency && CONFIG.Efficiency.player_build_speed ? CONFIG.Efficiency.player_build_speed.value : 0.25;
        const playerSpeed = isPlayerOnTH ? playerBuildSpeedCfg : 0.0;
        
        let workerSpeed = 0.0;
        if (isDay && state.townHall.builders && state.townHall.builders.length > 0) {
          const workerBuildSpeedCfg = CONFIG.Efficiency && CONFIG.Efficiency.worker_build_speed ? CONFIG.Efficiency.worker_build_speed.value : 0.5;
          state.townHall.builders.forEach(bid => {
            const col = state.colonists.find(c => c.id === bid);
            const lvl = col ? (col.attributes.construction || 3) : 3;
            workerSpeed += workerBuildSpeedCfg * getAttributeMult(lvl) * getColonistEfficiency(col);
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
        { key: 'warehouses', name: 'Almacén', defaultDuration: 20 },
        { key: 'mills', name: 'Molino de Harina', defaultDuration: 5 },
        { key: 'corrals', name: 'Corral', defaultDuration: 5 },
        { key: 'smithies', name: 'Taller del Herrero', defaultDuration: 5040 },
        { key: 'forges', name: 'Forja', defaultDuration: 5040 }
      ];

      buildingTypes.forEach(bt => {
        if (Array.isArray(state[bt.key])) {
          state[bt.key].forEach((building, idx) => {
            if ((building.isUnderConstruction || building.isUpgrading) && !building.isPaused) {
              const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === bt.key && state.playerConstructing.index === idx;
              const playerBuildSpeedCfg = CONFIG.Efficiency && CONFIG.Efficiency.player_build_speed ? CONFIG.Efficiency.player_build_speed.value : 0.25;
              const playerSpeed = isPlayerOnIt ? playerBuildSpeedCfg : 0.0;
              
              let workerSpeed = 0.0;
              if (isDay && building.builders && building.builders.length > 0) {
                const workerBuildSpeedCfg = CONFIG.Efficiency && CONFIG.Efficiency.worker_build_speed ? CONFIG.Efficiency.worker_build_speed.value : 0.5;
                building.builders.forEach(bid => {
                  const col = state.colonists.find(c => c.id === bid);
                  const lvl = col ? (col.attributes.construction || 3) : 3;
                  workerSpeed += workerBuildSpeedCfg * getAttributeMult(lvl) * getColonistEfficiency(col);
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

                    if (['bonfires', 'granaries', 'smithies', 'mills'].includes(bt.key)) {
                      const typeKey = bt.key === 'smithies' ? 'smithy' : (bt.key === 'bonfires' ? 'bonfire' : (bt.key === 'mills' ? 'mill' : 'granary'));
                      const slotsKey = `${typeKey}_t${building.tier}_slots`;
                      const maxSlots = (CONFIG && CONFIG.BuildingSlots && CONFIG.BuildingSlots[slotsKey]) ? (parseInt(CONFIG.BuildingSlots[slotsKey].value) || 1) : 1;
                      building.workers = building.workers || [];
                      while (building.workers.length < maxSlots) {
                        building.workers.push(null);
                      }
                    }
                  } else {
                    building.isUnderConstruction = false;
                    building.constructionElapsed = 0;

                    if (['bonfires', 'granaries', 'smithies', 'mills'].includes(bt.key)) {
                      const typeKey = bt.key === 'smithies' ? 'smithy' : (bt.key === 'bonfires' ? 'bonfire' : (bt.key === 'mills' ? 'mill' : 'granary'));
                      const slotsKey = `${typeKey}_t${building.tier}_slots`;
                      const maxSlots = (CONFIG && CONFIG.BuildingSlots && CONFIG.BuildingSlots[slotsKey]) ? (parseInt(CONFIG.BuildingSlots[slotsKey].value) || 1) : 1;
                      building.workers = Array(maxSlots).fill(null);
                      building.workerAssigned = 0;
                    }
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

      // PASO Q - [FOOD-GRAN] Animal Production
      if (Array.isArray(state.animals)) {
        let pigsAndCowsFed = 0;
        state.animals.forEach(a => {
          if (!a.fedToday) return;
          const def = ANIMAL_TYPES[a.type];
          if (!def) return;
          
          const amt = def.outputRate * (effectiveDelta / dayDuration);
          if (def.output === 'eggs') {
            addResourceStock('eggs', amt);
            addResourceStock('feathers', 0.1 * (effectiveDelta / dayDuration));
          } else if (def.output === 'skins') {
            addResourceStock('skins', amt);
          }
          
          if (a.type === 'pig' || a.type === 'cow') {
            pigsAndCowsFed++;
          }
        });
        
        if (pigsAndCowsFed > 0) {
          addResourceStock('fertilizer', 0.1 * (effectiveDelta / dayDuration) * pigsAndCowsFed);
        }
      }

      if (Array.isArray(state.lumberMills)) {
        state.lumberMills.forEach((b, idx) => {
          b.isWarehouseFull = false;
          if (b.workerAssigned > 0 && !b.isUnderConstruction && !b.isUpgrading) {
            const assignKey = `lumbermills_${idx}`;
            if (isWarehouseFullForJob(assignKey)) {
              b.isWarehouseFull = true;
              return;
            }
            // PASO L: verificar hacha asignada
            const tool = Array.isArray(state.tools) ? state.tools.find(t => t.assignedTo === assignKey && t.durability > 0) : null;
            if (!tool) return; // sin hacha: producción 0

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
          b.isWarehouseFull = false;
          if (b.workerAssigned > 0 && !b.isUnderConstruction && !b.isUpgrading) {
            const assignKey = `quarries_${idx}`;
            if (isWarehouseFullForJob(assignKey)) {
              b.isWarehouseFull = true;
              return;
            }
            // PASO L: verificar pico asignado
            const tool = Array.isArray(state.tools) ? state.tools.find(t => t.assignedTo === assignKey && t.durability > 0) : null;
            if (!tool) return; // sin pico: producción 0

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

            const ironRatio = CONFIG?.Mining?.iron_ore_ratio?.value ?? 5;
            const ironPassive = stonePassive / ironRatio;
            const addedIron = addResourceStock('iron', ironPassive);
            resourcesGeneratedThisSecond.iron = (resourcesGeneratedThisSecond.iron || 0) + addedIron;
          }
        });
      }

      // PASO L - [MET-TALL]: Producción de herramientas en Talleres
      if (Array.isArray(state.smithies)) {
        state.smithies.forEach((smithy, idx) => {
          smithy.isWarehouseFull = false;
          if (smithy.isUnderConstruction || smithy.isUpgrading) return;
          const assignKey = `smithies_${idx}`;
          if (isWarehouseFullForJob(assignKey)) {
            smithy.isWarehouseFull = true;
            return;
          }

          const maxSlots = smithy.workers ? smithy.workers.length : 1;
          smithy.workers = smithy.workers || Array(maxSlots).fill(null);

          smithy.workers.forEach((worker, slotIdx) => {
            if (worker === null) return;

            const toolKey = worker.selectedTool || smithy.selectedTool || 'axe_t1';
            const timingId = 'smithy_' + toolKey;
            const craftDuration = CONFIG?.Timing?.[timingId]?.duration ?? 4;
            const craftCfg = CONFIG?.Crafting?.[`smithy_${toolKey}`];
            const woodCost = craftCfg ? (craftCfg.input_amt || craftCfg.consume_amount || 4) : 4;
            const ironCost = toolKey.endsWith('_t2') ? (craftCfg ? (craftCfg.input_amt || 2) : 2) : 0;

            worker.elapsed = (worker.elapsed || 0) + effectiveDelta / dayDuration;

            if (worker.elapsed >= craftDuration) {
              worker.elapsed = 0;
              // Verificar materiales
              const isT2 = toolKey.endsWith('_t2');
              const matResource = isT2 ? 'iron_bar' : 'wood';
              const matCost = isT2 ? ironCost : woodCost;
              if ((state[matResource] || 0) < matCost) {
                showToast(`⚠️ Sin ${matResource === 'wood' ? 'madera' : 'lingotes'} para fabricar en Taller #${idx + 1} (Slot ${slotIdx + 1})`, "warning");
                return;
              }
              state[matResource] -= matCost;
              // Extraer tipo y tier de la herramienta
              const parts = toolKey.split('_'); // e.g. ['axe', 't1']
              const toolType = parts[0]; // 'axe', 'pickaxe', 'hoe', 'weapon'
              const toolTier = parseInt((parts[1] || 't1').replace('t', '')) || 1;
              const newTool = {
                id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: toolType,
                tier: toolTier,
                durability: 100,
                assignedTo: null
              };
              state.tools.push(newTool);
              const toolNames = { axe: 'Hacha', pickaxe: 'Pico', hoe: 'Azada', weapon: 'Arma' };
              showToast(`🔨 Nueva ${toolNames[toolType] || toolType} T${toolTier} fabricada en Taller #${idx + 1} (Slot ${slotIdx + 1})!`, "success");
              recalculateRates();
              if (typeof updateUI === 'function') updateUI();
            }
          });

          const firstWorker = smithy.workers[0];
          if (firstWorker) {
            smithy.elapsed = firstWorker.elapsed;
            smithy.selectedTool = firstWorker.selectedTool;
          } else {
            smithy.elapsed = 0;
          }
        });
      }

      // PASO L - [MET-TALL]: Desgaste de herramientas asignadas
      if (Array.isArray(state.tools)) {
        const wearT1 = CONFIG?.Tool?.durability_loss_t1?.value ?? 1.5;
        const wearT2 = CONFIG?.Tool?.durability_loss_t2?.value ?? 0.8;
        let toolBroke = false;
        state.tools.forEach(tool => {
          if (tool.assignedTo !== null && tool.durability > 0) {
            if (isWarehouseFullForJob(tool.assignedTo)) {
              return;
            }
            const wearRate = (tool.tier || 1) >= 2 ? wearT2 : wearT1;
            const deltaWear = wearRate * (effectiveDelta / dayDuration);
            tool.durability -= deltaWear;
            
            // Log de depuración para ver el desgaste en consola
            console.log(`[DEBUG WEAR] Tool ID: ${tool.id}, Type: ${tool.type}, Durability: ${tool.durability.toFixed(3)}% (-${deltaWear.toFixed(5)}%)`);
            
            if (tool.durability <= 0) {
              tool.durability = 0;
              tool.assignedTo = null;
              toolBroke = true;
              const toolNames = { axe: 'Hacha', pickaxe: 'Pico', hoe: 'Azada', weapon: 'Arma' };
              showToast(`⚠️ ${toolNames[tool.type] || 'Herramienta'} T${tool.tier} rota y desasignada`, "warning");
            }
          }
        });
        if (toolBroke) {
          recalculateRates();
          if (typeof updateUI === 'function') updateUI();
        }
      }

    // 3b. Procesamiento en Hogueras/Ollas/Cocinas
    if (Array.isArray(state.bonfires)) {
      state.bonfires.forEach((bonfire, idx) => {
        if (bonfire.isUnderConstruction || bonfire.isUpgrading) return;
        bonfire.isWarehouseFull = false;
        const assignKey = `bonfires_${idx}`;
        if (isWarehouseFullForJob(assignKey)) {
          bonfire.isWarehouseFull = true;
          return;
        }
        
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

        let speedBonus = 0;
        if (bonfire.tier === 3) {
          speedBonus = (CONFIG && CONFIG.BuildingSlots && CONFIG.BuildingSlots.bonfire_t3_speed) ? (parseFloat(CONFIG.BuildingSlots.bonfire_t3_speed.value) || 0.3) : 0.3;
        }

        const maxSlots = bonfire.workers ? bonfire.workers.length : 1;
        bonfire.workers = bonfire.workers || Array(maxSlots).fill(null);

        bonfire.workers.forEach((worker, slotIdx) => {
          if (worker === null) return;

          if (worker.isRunning) {
            worker.cookingRecipeNow = worker.activeRecipe || worker.selectedRecipe || bonfire.selectedRecipe || 'wheat';
          }

          const hasWorker = true;
          const recipe = worker.selectedRecipe || bonfire.selectedRecipe || 'wheat';
          
          let inputResources = {};
          if (recipe === 'bread') {
            const recipeCfg = CONFIG.Processing && CONFIG.Processing.recipe_bread;
            const flourAmt = recipeCfg ? (recipeCfg.input_amt || 2) : 2;
            inputResources.flour = flourAmt;
          } else if (recipe === 'stew') {
            const recipeCfg = CONFIG.Processing && CONFIG.Processing.recipe_stew;
            const potAmt = recipeCfg ? (recipeCfg.input_amt || 1) : 1;
            inputResources.potato = potAmt;
            inputResources.carrot = 1;
          } else {
            inputResources[recipe] = autoRec.consume_amount || 1;
          }

          if (!worker.isRunning && hasWorker) {
            const foodKeys = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries', 'eggs', 'bread'];
            const totalFood = foodKeys.reduce((sum, k) => sum + (state[k] || 0), 0);
            const foodCapacity = (state.storageCapacity && state.storageCapacity.food) ?? Infinity;
            if (totalFood < foodCapacity) {
              let hasInputs = true;
              for (const [k, amt] of Object.entries(inputResources)) {
                if ((state[k] || 0) < amt) {
                  hasInputs = false;
                  break;
                }
              }
              
              if (hasInputs) {
                for (const [k, amt] of Object.entries(inputResources)) {
                  state[k] -= amt;
                }
                updateGlobalFood();
                worker.elapsed = 0;
                worker.isRunning = true;
                worker.mode = 'auto';
                worker.activeRecipe = recipe;
                worker.cookingRecipeNow = recipe;
                recalculateRates();
              } else {
                const priorities = bonfire.recipePriorities || ['carrot', 'wheat', 'potato', 'berries'];
                let fallbackFound = false;
                for (const r of priorities) {
                  const minFood = autoRec.consume_amount || 1;
                  if ((state[r] || 0) >= minFood) {
                    state[r] -= minFood;
                    updateGlobalFood();
                    worker.elapsed = 0;
                    worker.isRunning = true;
                    worker.mode = 'auto';
                    worker.activeRecipe = r;
                    worker.cookingRecipeNow = r;
                    fallbackFound = true;
                    recalculateRates();
                    break;
                  }
                }
                if (!fallbackFound) {
                  worker.cookingRecipeNow = null;
                }
              }
            } else {
              worker.cookingRecipeNow = null;
            }
          }

          if (worker.isRunning) {
            let speedMultiplier = 1;
            if (worker.mode === 'auto') {
              const colonist = state.colonists ? state.colonists.find(c => c.id === worker.colonistId) : null;
              if (colonist) {
                const lvl = colonist.attributes.cooking || 3;
                speedMultiplier = getAttributeMult(lvl) * getColonistEfficiency(colonist);
              }
            }
            speedMultiplier *= (1 + speedBonus);

            worker.elapsed = (worker.elapsed || 0) + effectiveDelta * speedMultiplier;
            const targetDuration = worker.mode === 'manual' ? manualRec.duration : autoRec.duration;
            
            if (worker.elapsed >= targetDuration) {
              const rec = worker.mode === 'manual' ? manualRec : autoRec;
              const yieldMin = rec.output_min !== undefined ? rec.output_min : rec.yield;
              const yieldMax = rec.output_max !== undefined ? rec.output_max : rec.yield;
              let produced = Math.round(yieldMin + Math.random() * (yieldMax - yieldMin));
              const activeRecKey = worker.activeRecipe || recipe;
              
              let outputRes = 'cooked_' + activeRecKey;
              if (activeRecKey === 'bread' || activeRecKey === 'stew') {
                const recipeCfg = CONFIG.Processing && CONFIG.Processing['recipe_' + activeRecKey];
                if (recipeCfg) {
                  outputRes = recipeCfg.yield_type || activeRecKey;
                  const rMin = recipeCfg.output_min !== undefined ? recipeCfg.output_min : (recipeCfg.yield || 1);
                  const rMax = recipeCfg.output_max !== undefined ? recipeCfg.output_max : (recipeCfg.yield || 1);
                  produced = Math.round(rMin + Math.random() * (rMax - rMin));
                }
              }
              
              addResourceStock(outputRes, produced);
              updateGlobalFood();
              
              resourcesGeneratedThisSecond.cooked = (resourcesGeneratedThisSecond.cooked || 0) + produced;
              
              let bName = bonfire.tier === 1 ? 'Fogata' : (bonfire.tier === 2 ? 'Caldero' : 'Cocina de Taberna');
              const cookedNames = { 
                cooked_wheat: 'Pan', 
                cooked_potato: 'Patata Asada', 
                cooked_carrot: 'Zanahoria Asada', 
                cooked_berries: 'Mermelada',
                bread: 'Pan Artesano',
                stew: 'Guiso'
              };
              showToast(`🔥 ${bName} #${idx + 1} (Slot ${slotIdx + 1}) completó un lote de ${produced} ${cookedNames[outputRes] || outputRes}`, "success");
              worker.isRunning = false;
              worker.activeRecipe = null;
              worker.mode = 'none';
              recalculateRates();
              if (typeof updateUI === 'function') updateUI();
            }
          }
        });

        // Retrocompatibilidad: Sincronizar campos principales de bonfire con slot 0
        const firstWorker = bonfire.workers[0];
        if (firstWorker) {
          bonfire.cookingRecipeNow = firstWorker.cookingRecipeNow;
          bonfire.isRunning = firstWorker.isRunning;
          bonfire.elapsed = firstWorker.elapsed;
          bonfire.activeRecipe = firstWorker.activeRecipe;
          bonfire.mode = firstWorker.mode;
        } else {
          bonfire.cookingRecipeNow = null;
          bonfire.isRunning = false;
          bonfire.elapsed = 0;
          bonfire.activeRecipe = null;
          bonfire.mode = 'none';
        }
      });
    }

    // 3c. Procesamiento en Graneros
    if (Array.isArray(state.granaries)) {
      state.granaries.forEach((granary, idx) => {
        if (granary.isUnderConstruction || granary.isUpgrading) return;

        const tier = granary.tier || 1;

        let speedBonus = 0;
        if (granary.tier === 3) {
          speedBonus = (CONFIG && CONFIG.BuildingSlots && CONFIG.BuildingSlots.granary_t3_speed) ? (parseFloat(CONFIG.BuildingSlots.granary_t3_speed.value) || 0.3) : 0.3;
        }

        const maxSlots = granary.workers ? granary.workers.length : 1;
        granary.workers = granary.workers || Array(maxSlots).fill(null);

        granary.workers.forEach((worker, slotIdx) => {
          if (worker === null) return;

          if (worker.isRunning) {
            worker.cookingRecipeNow = worker.activeCrop || worker.selectedCrop || granary.selectedCrop || 'wheat';
          }

          const cropKey = worker.selectedCrop || granary.selectedCrop || 'wheat';
          const recipeKey = `granary_${cropKey}_t${tier}`;
          const recipe = CONFIG.Processing && CONFIG.Processing[recipeKey];
          if (!recipe) return;

          const hasWorker = true;
          const minFood = recipe.consume_amount || 5;
          const consumeRes = recipe.consume_type || cropKey;

          if (!worker.isRunning && hasWorker) {
            const seedKeys = ['wheat', 'potato', 'carrot'];
            const totalSeeds = state.seeds ? seedKeys.reduce((sum, k) => sum + (state.seeds[k] || 0), 0) : 0;
            const seedsCapacity = (state.storageCapacity && state.storageCapacity.seeds) ?? Infinity;
            if (totalSeeds < seedsCapacity) {
              if ((state[consumeRes] || 0) >= minFood) {
                state[consumeRes] -= minFood;
                updateGlobalFood();
                worker.elapsed = 0;
                worker.isRunning = true;
                worker.mode = 'auto';
                worker.activeCrop = cropKey;
                worker.cookingRecipeNow = cropKey;
                recalculateRates();
              } else {
                const priorities = granary.seedsPriorities || ['wheat', 'potato', 'carrot'];
                let fallbackFound = false;
                for (const crop of priorities) {
                  const rKey = `granary_${crop}_t${tier}`;
                  const r = CONFIG.Processing && CONFIG.Processing[rKey];
                  if (r) {
                    const fallbackMin = r.consume_amount || 5;
                    const fallbackRes = r.consume_type || crop;
                    if ((state[fallbackRes] || 0) >= fallbackMin) {
                      state[fallbackRes] -= fallbackMin;
                      updateGlobalFood();
                      worker.elapsed = 0;
                      worker.isRunning = true;
                      worker.mode = 'auto';
                      worker.activeCrop = crop;
                      worker.cookingRecipeNow = crop;
                      fallbackFound = true;
                      recalculateRates();
                      break;
                    }
                  }
                }
                if (!fallbackFound) {
                  worker.cookingRecipeNow = null;
                }
              }
            } else {
              worker.cookingRecipeNow = null;
            }
          }

          if (worker.isRunning) {
            let speedMultiplier = 1;
            if (worker.mode === 'auto') {
              const colonist = state.colonists ? state.colonists.find(c => c.id === worker.colonistId) : null;
              if (colonist) {
                const lvl = colonist.attributes.farming || 3;
                speedMultiplier = getAttributeMult(lvl) * getColonistEfficiency(colonist);
              }
            }
            speedMultiplier *= (1 + speedBonus);

            worker.elapsed = (worker.elapsed || 0) + effectiveDelta * speedMultiplier;
            const runningCrop = worker.activeCrop || cropKey;
            const runningRecipeKey = `granary_${runningCrop}_t${tier}`;
            const runningRecipe = CONFIG.Processing && CONFIG.Processing[runningRecipeKey];
            const targetDuration = runningRecipe ? runningRecipe.duration : 3.0;

            if (worker.elapsed >= targetDuration) {
              worker.isRunning = false;
              worker.elapsed = 0;

              const yieldMin = runningRecipe && runningRecipe.output_min !== undefined ? runningRecipe.output_min : (runningRecipe ? runningRecipe.yield : 1);
              const yieldMax = runningRecipe && runningRecipe.output_max !== undefined ? runningRecipe.output_max : (runningRecipe ? runningRecipe.yield : 1);
              const produced = Math.round(yieldMin + Math.random() * (yieldMax - yieldMin));
              const seedType = runningCrop;
              const outputRes = (runningRecipe && runningRecipe.yield_type) ? runningRecipe.yield_type : (seedType + '_seeds');
              addResourceStock(outputRes, produced);
              if (typeof updateUI === 'function') updateUI();

              const cropNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', pienso: 'Pienso' };
              const outputName = outputRes === 'pienso' ? 'Pienso' : `Semillas de ${cropNames[seedType] || seedType}`;
              showToast(`🌾 Granero #${idx + 1} (Slot ${slotIdx + 1}) produjo +${produced} ${outputName}`, "success");

              worker.activeCrop = null;
              worker.mode = 'none';
              recalculateRates();
              if (typeof updateUI === 'function') updateUI();
            }
          }
        });

        const firstWorker = granary.workers[0];
        if (firstWorker) {
          granary.cookingRecipeNow = firstWorker.cookingRecipeNow;
          granary.isRunning = firstWorker.isRunning;
          granary.elapsed = firstWorker.elapsed;
          granary.activeCrop = firstWorker.activeCrop;
          granary.mode = firstWorker.mode;
        } else {
          granary.cookingRecipeNow = null;
          granary.isRunning = false;
          granary.elapsed = 0;
          granary.activeCrop = null;
          granary.mode = 'none';
        }
      });
    }

    // 3d. Procesamiento en Molinos
    if (Array.isArray(state.mills)) {
      state.mills.forEach((mill, idx) => {
        if (mill.isUnderConstruction || mill.isUpgrading) return;

        const tier = mill.tier || 1;
        const maxSlots = mill.workers ? mill.workers.length : 1;
        mill.workers = mill.workers || Array(maxSlots).fill(null);

        mill.workers.forEach((worker, slotIdx) => {
          if (worker === null) return;

          if (worker.isRunning) {
            worker.cookingRecipeNow = 'wheat';
          }

          const recipeKey = `mill_flour_t${tier}`;
          const recipe = CONFIG.Crafting && CONFIG.Crafting[recipeKey];
          if (!recipe) return;

          const hasWorker = true;
          const minWheat = recipe.input_amt || 5;

          if (!worker.isRunning && hasWorker) {
            const totalFlour = state.flour || 0;
            const flourCapacity = (state.storageCapacity && state.storageCapacity.flour) ?? Infinity;
            if (totalFlour < flourCapacity) {
              if ((state.wheat || 0) >= minWheat) {
                state.wheat -= minWheat;
                updateGlobalFood();
                worker.elapsed = 0;
                worker.isRunning = true;
                worker.mode = 'auto';
                worker.cookingRecipeNow = 'wheat';
                recalculateRates();
              } else {
                worker.cookingRecipeNow = null;
              }
            } else {
              worker.cookingRecipeNow = null;
            }
          }

          if (worker.isRunning) {
            let speedMultiplier = 1;
            if (worker.mode === 'auto') {
              const colonist = state.colonists ? state.colonists.find(c => c.id === worker.colonistId) : null;
              if (colonist) {
                const lvl = colonist.attributes.farming || 3;
                speedMultiplier = getAttributeMult(lvl) * getColonistEfficiency(colonist);
              }
            }

            worker.elapsed = (worker.elapsed || 0) + effectiveDelta * speedMultiplier;
            const timingKey = `mill_flour_t${tier}`;
            const timing = CONFIG.Timing && CONFIG.Timing[timingKey];
            const targetDuration = timing ? timing.duration : 2.0;

            if (worker.elapsed >= targetDuration) {
              worker.isRunning = false;
              worker.elapsed = 0;

              const yieldMin = recipe.output_min !== undefined ? recipe.output_min : recipe.yield;
              const yieldMax = recipe.output_max !== undefined ? recipe.output_max : recipe.yield;
              const produced = Math.round(yieldMin + Math.random() * (yieldMax - yieldMin));
              
              addResourceStock('flour', produced);
              if (typeof updateUI === 'function') updateUI();

              showToast(`🌾 Molino #${idx + 1} (Slot ${slotIdx + 1}) produjo +${produced} Harina`, "success");

              worker.mode = 'none';
              recalculateRates();
              if (typeof updateUI === 'function') updateUI();
            }
          }
        });

        const firstWorker = mill.workers[0];
        if (firstWorker) {
          mill.cookingRecipeNow = firstWorker.cookingRecipeNow;
          mill.isRunning = firstWorker.isRunning;
          mill.elapsed = firstWorker.elapsed;
          mill.mode = firstWorker.mode;
        } else {
          mill.cookingRecipeNow = null;
          mill.isRunning = false;
          mill.elapsed = 0;
          mill.mode = 'none';
        }
      });
    }

    // PASO M - [MET-FORJA]: Procesamiento en Forjas
    if (Array.isArray(state.forges)) {
      state.forges.forEach((forge, idx) => {
        forge.isWarehouseFull = false;
        if (forge.isUnderConstruction || forge.isUpgrading) return;
        const assignKey = `forges_${idx}`;
        if (isWarehouseFullForJob(assignKey)) {
          forge.isWarehouseFull = true;
          return;
        }

        const hasWorker = forge.workerAssigned > 0;
        const tier = forge.tier || 1;
        const recipeKey = `forge_iron_t${tier}`;
        const recipe = CONFIG.Crafting && CONFIG.Crafting[recipeKey];

        if (!recipe) return;

        // Auto-iniciar si tiene trabajadores y no está corriendo
        if (!forge.isRunning && hasWorker) {
          const minIron = recipe.consume_amount || recipe.input_amt || 5;
          const consumeRes = recipe.consume_type || recipe.input || 'iron';
          if ((state[consumeRes] || 0) >= minIron) {
            state[consumeRes] -= minIron;
            forge.elapsed = 0;
            forge.isRunning = true;
            forge.mode = 'auto';
            recalculateRates();
          }
        }

        // Progress ticking
        if (forge.isRunning) {
          let speedMultiplier = 1;
          if (forge.mode === 'auto') {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `forges_${idx}`) : [];
            let mult = 0;
            workers.forEach(c => {
              const lvl = c.attributes.mining || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
            speedMultiplier = mult;
          }
          forge.elapsed += (effectiveDelta / dayDuration) * speedMultiplier;

          const craftTiming = CONFIG?.Timing?.[recipeKey]?.duration ?? recipe.duration ?? (tier === 1 ? 3 : 2);
          if (forge.elapsed >= craftTiming) {
            forge.isRunning = false;
            forge.elapsed = 0;

            const yieldMin = recipe.output_min !== undefined ? recipe.output_min : (recipe.yield || 1);
            const yieldMax = recipe.output_max !== undefined ? recipe.output_max : (recipe.yield || 1);
            const produced = Math.round(yieldMin + Math.random() * (yieldMax - yieldMin));

            const outRes = recipe.yield_type || recipe.output || 'iron_bar';
            const addedIronBar = addResourceStock(outRes, produced);
            resourcesGeneratedThisSecond.iron_bar = (resourcesGeneratedThisSecond.iron_bar || 0) + addedIronBar;

            showToast(`🔩 Forja #${idx + 1} produjo +${produced} Lingote de Hierro`, "success");

            forge.mode = 'none';
            recalculateRates();
            if (typeof updateUI === 'function') updateUI();
          }
        }
      });
    }

  // Progreso de agricultura en Granjas (Corre de día y de noche)
    if (Array.isArray(state.farms)) {
      state.farms.forEach((farm, idx) => {
        farm.isWarehouseFull = false;
        if (isWarehouseFullForJob(`farms_${idx}`)) {
          farm.isWarehouseFull = true;
          return;
        }
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
  if (job.startsWith('farms_') || job.startsWith('granaries_') || job.startsWith('mills_')) return 'farming';
  if (job.startsWith('bonfires_')) return 'cooking';
  if (job.startsWith('markets_')) return 'trading';
  if (job === 'construction') return 'construction';
  if (job.startsWith('smithies_')) return 'woodcutting';
  if (job.startsWith('forges_')) return 'mining';
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

