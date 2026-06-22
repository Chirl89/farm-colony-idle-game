// Tasas estáticas y acumuladores de recursos
var calculatedRates = { gold: 0, wood: 0, stone: 0, food: 0, cooked: 0 };
var resourcesGeneratedThisSecond = { gold: 0, wood: 0, stone: 0, food: 0, cooked: 0 };
var lastRateResetTime = Date.now();

// Calcular la eficiencia laboral según colonos hambrientos
function getWorkEfficiency() {
  const total = state.currentColonists || 0;
  if (total <= 0) return 1.0;
  const starving = state.starvingColonists || 0;
  return Math.max(0.15, (total - starving) / total);
}

// Alimentar a los colonos por la mañana (Desayuno)
function feedColonistsMorning() {
  const total = state.currentColonists || 0;
  if (total <= 0) {
    state.fedCookedToday = 0;
    state.fedRawToday = 0;
    state.fedNoneToday = 0;
    state.starvingColonists = 0;
    return;
  }
  
  const dailyNeed = (CONFIG.FoodNeed && CONFIG.FoodNeed.colonist_need) ? CONFIG.FoodNeed.colonist_need.yield : 5;
  const mealNeed = dailyNeed / 2;
  let remainingValue = total * mealNeed;
  
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
  
  updateGlobalFood();
  
  state.fedNoneToday = Math.ceil(remainingValue / mealNeed);
  state.starvingColonists = state.fedNoneToday;
  
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
  const total = state.currentColonists || 0;
  if (total <= 0) {
    state.starvingColonists = 0;
    return;
  }
  
  const dailyNeed = (CONFIG.FoodNeed && CONFIG.FoodNeed.colonist_need) ? CONFIG.FoodNeed.colonist_need.yield : 5;
  const mealNeed = dailyNeed / 2;
  let remainingValue = total * mealNeed;
  
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
  
  updateGlobalFood();
  
  state.starvingColonists = Math.ceil(remainingValue / mealNeed);
  
  if (state.starvingColonists > 0) {
    showToast(`⚠️ ${state.starvingColonists} aldeanos no cenaron suficiente y dormirán hambrientos.`, "warning");
  } else {
    showToast("🌙 Los aldeanos han cenado y se preparan para dormir.", "success");
  }
  recalculateRates();
  updateUI();
}

// Recalcular la tasa de cambio diario de recursos basada en asignaciones y eficiencia
function recalculateRates() {
  if (!CONFIG || Object.keys(CONFIG).length === 0) return;
  const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
  
  // 1. Madera (Wood)
  let woodRate = 0;
  if (CONFIG.BasicGathering && CONFIG.BasicGathering.wood_auto) {
    const cfg = CONFIG.BasicGathering.wood_auto;
    woodRate += state.jobs.wood * (cfg.yield / cfg.duration);
  }
  if (state.lumberMills && CONFIG.ProductionRate && CONFIG.ProductionRate.lumbermill_prod) {
    const baseYield = CONFIG.ProductionRate.lumbermill_prod.yield;
    const duration = CONFIG.ProductionRate.lumbermill_prod.duration || 1.0;
    state.lumberMills.forEach(m => {
      if (m.workerAssigned > 0 && !m.isUnderConstruction) {
        const tier = m.tier || 1;
        const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
        woodRate += (baseYield / duration) * multiplier * m.workerAssigned;
      }
    });
  }

  // 2. Piedra (Stone)
  let stoneRate = 0;
  if (CONFIG.BasicGathering && CONFIG.BasicGathering.stone_auto) {
    const cfg = CONFIG.BasicGathering.stone_auto;
    stoneRate += state.jobs.stone * (cfg.yield / cfg.duration);
  }
  if (state.quarries && CONFIG.ProductionRate && CONFIG.ProductionRate.quarry_prod) {
    const baseYield = CONFIG.ProductionRate.quarry_prod.yield;
    const duration = CONFIG.ProductionRate.quarry_prod.duration || 1.0;
    state.quarries.forEach(q => {
      if (q.workerAssigned > 0 && !q.isUnderConstruction) {
        const tier = q.tier || 1;
        const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
        stoneRate += (baseYield / duration) * multiplier * q.workerAssigned;
      }
    });
  }

  // 3. Comida y Procesado
  let wheatRate = 0;
  let potatoRate = 0;
  let carrotRate = 0;
  let berriesRate = 0;
  let cooked_wheatRate = 0;
  let cooked_potatoRate = 0;
  let cooked_carrotRate = 0;
  let cooked_berriesRate = 0;

  if (CONFIG.BasicGathering && CONFIG.BasicGathering.berries_auto) {
    const cfg = CONFIG.BasicGathering.berries_auto;
    berriesRate += state.jobs.berries * (cfg.yield / cfg.duration);
  }

  if (state.farms) {
    state.farms.forEach(f => {
      if (f.stage !== 'idle' && !f.isUnderConstruction) {
        const cropKey = f.activeCrop || f.crop || 'wheat';
        const crop = CROPS[cropKey];
        if (crop) {
          const farmTier = f.tier || 1;
          const tierMultiplier = farmTier === 3 ? 2.5 : (farmTier === 2 ? 1.5 : 1.0);
          const r = (crop.yield * tierMultiplier) / getFarmCycleTotal(crop);
          if (cropKey === 'wheat') wheatRate += r;
          else if (cropKey === 'potato') potatoRate += r;
          else if (cropKey === 'carrot') carrotRate += r;
        }
      }
    });
  }

  if (state.bonfires) {
    state.bonfires.forEach(b => {
      if ((b.workerAssigned > 0 || b.isRunning) && !b.isUnderConstruction) {
        let rec;
        if (b.tier === 1) rec = CONFIG.Processing.bonfire_auto;
        else if (b.tier === 2) rec = CONFIG.Processing.pot_auto;
        else rec = CONFIG.Processing.kitchen_auto;

        if (rec) {
          const mult = b.workerAssigned > 0 ? b.workerAssigned : (b.isRunning ? 1 : 0);
          const recipe = b.selectedRecipe || 'wheat';
          const cookedDish = 'cooked_' + recipe;
          const consumeRate = (rec.consume_amount / rec.duration) * mult;
          const produceRate = (rec.yield / rec.duration) * mult;

          if (recipe === 'wheat') wheatRate -= consumeRate;
          else if (recipe === 'potato') potatoRate -= consumeRate;
          else if (recipe === 'carrot') carrotRate -= consumeRate;
          else if (recipe === 'berries') berriesRate -= consumeRate;

          if (cookedDish === 'cooked_wheat') cooked_wheatRate += produceRate;
          else if (cookedDish === 'cooked_potato') cooked_potatoRate += produceRate;
          else if (cookedDish === 'cooked_carrot') cooked_carrotRate += produceRate;
          else if (cookedDish === 'cooked_berries') cooked_berriesRate += produceRate;
        }
      }
    });
  }

  if (state.granaries) {
    state.granaries.forEach(g => {
      if ((g.workerAssigned > 0 || g.isRunning) && !g.isUnderConstruction) {
        const cropKey = g.selectedCrop || 'wheat';
        const tier = g.tier || 1;
        const recipeKey = `granary_${cropKey}_t${tier}`;
        const recipe = CONFIG.Processing && CONFIG.Processing[recipeKey];
        if (recipe) {
          const mult = g.workerAssigned > 0 ? g.workerAssigned : (g.isRunning ? 1 : 0);
          const duration = recipe.duration || 3.0;
          const consumeRate = (recipe.consume_amount / duration) * mult;
          
          if (cropKey === 'wheat') wheatRate -= consumeRate;
          else if (cropKey === 'potato') potatoRate -= consumeRate;
          else if (cropKey === 'carrot') carrotRate -= consumeRate;
        }
      }
    });
  }

  // Simular consumo de comida
  const dailyNeed = (CONFIG.FoodNeed && CONFIG.FoodNeed.colonist_need) ? CONFIG.FoodNeed.colonist_need.yield : 5;
  let remainingConsumptionValue = (state.currentColonists || 0) * dailyNeed;
  const priority = state.foodPriority || ['cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries', 'wheat', 'potato', 'carrot', 'berries'];

  for (let type of priority) {
    if (remainingConsumptionValue <= 0) break;
    if (state.allowConsume && state.allowConsume[type] === false) continue;

    const mult = (CONFIG.FoodEquivalence && CONFIG.FoodEquivalence[type]) ? CONFIG.FoodEquivalence[type].yield : 1;

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

  // 4. Ventas en Mercados
  let goldRate = 0;
  const activeMarkets = state.markets ? state.markets.filter(m => m.workerAssigned > 0 && !m.isUnderConstruction).length : 0;
  let marketCapacity = activeMarkets;

  if (marketCapacity > 0 && CONFIG.Sales) {
    const sellableTypes = ['wood', 'stone', 'wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
    for (let type of sellableTypes) {
      if (marketCapacity <= 0) break;
      if (!state.autoSell || !state.autoSell[type]) continue;

      const mRule = CONFIG.Sales[`market_${type}`];
      if (mRule) {
        let currentRate = 0;
        if (type === 'wood') currentRate = woodRate;
        else if (type === 'stone') currentRate = stoneRate;
        else if (type === 'wheat') currentRate = wheatRate;
        else if (type === 'potato') currentRate = potatoRate;
        else if (type === 'carrot') currentRate = carrotRate;
        else if (type === 'berries') currentRate = berriesRate;
        else if (type === 'cooked_wheat') currentRate = cooked_wheatRate;
        else if (type === 'cooked_potato') currentRate = cooked_potatoRate;
        else if (type === 'cooked_carrot') currentRate = cooked_carrotRate;
        else if (type === 'cooked_berries') currentRate = cooked_berriesRate;

        const stock = state[type] || 0;
        const minVal = parseInt(state.autoSellMin[type]) || 0;
        const maxDailySell = Math.max(0, currentRate) + Math.max(0, stock - minVal);

        const capacitySell = (mRule.consume_amount / mRule.duration) * marketCapacity;
        const actualSellRate = Math.min(maxDailySell, capacitySell);

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
    }
  }

  // Establecer tasas en calculatedRates
  calculatedRates.wood = woodRate;
  calculatedRates.stone = stoneRate;
  calculatedRates.wheat = wheatRate;
  calculatedRates.potato = potatoRate;
  calculatedRates.carrot = carrotRate;
  calculatedRates.berries = berriesRate;
  calculatedRates.cooked_wheat = cooked_wheatRate;
  calculatedRates.cooked_potato = cooked_potatoRate;
  calculatedRates.cooked_carrot = cooked_carrotRate;
  calculatedRates.cooked_berries = cooked_berriesRate;
  calculatedRates.gold = goldRate;

  // Tasa de comida global
  let totalFoodRate = 0;
  const list = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
  list.forEach(key => {
    const isAllowed = state.allowConsume && state.allowConsume[key] !== false;
    if (isAllowed) {
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

      totalFoodRate += rateVal * mult;
    }
  });
  calculatedRates.food = totalFoodRate;
  calculatedRates.cooked = cooked_wheatRate + cooked_potatoRate + cooked_carrotRate + cooked_berriesRate;

  // Escalar tasas según la eficiencia laboral
  const eff = getWorkEfficiency();
  calculatedRates.wood *= eff;
  calculatedRates.stone *= eff;
  calculatedRates.wheat *= eff;
  calculatedRates.potato *= eff;
  calculatedRates.carrot *= eff;
  calculatedRates.berries *= eff;
  calculatedRates.cooked_wheat *= eff;
  calculatedRates.cooked_potato *= eff;
  calculatedRates.cooked_carrot *= eff;
  calculatedRates.cooked_berries *= eff;
  calculatedRates.gold *= eff;
  calculatedRates.food *= eff;
  calculatedRates.cooked *= eff;
}

// Bucle principal de simulación (corre cada 100ms)
function gameTick() {
  if (!CONFIG || Object.keys(CONFIG).length === 0) return;
  
  const now = Date.now();
  const delta = 0.1; // 100ms
  
  const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
  const nightDuration = CONFIG.Timing && CONFIG.Timing.night_duration ? CONFIG.Timing.night_duration.duration : 20.0;
  
  if (typeof state.currentDay === 'undefined') state.currentDay = 1;
  if (typeof state.timePhase === 'undefined') state.timePhase = 'day';
  if (typeof state.phaseElapsed === 'undefined') state.phaseElapsed = 0;
  
  // Reducir cooldown activo de recolección manual
  if (state.gatherCooldown > 0) {
    const prevCooldown = state.gatherCooldown;
    state.gatherCooldown = Math.max(0, state.gatherCooldown - delta);
    if (state.gatherCooldown === 0 && prevCooldown > 0) {
      if (typeof deliverGatheredResources === 'function') deliverGatheredResources();
    }
  }

  // Avanzar el ciclo de tiempo
  state.phaseElapsed += delta;
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
  
  // Si es de día, procesamos la recolección automática y producción pasiva
  if (isDay) {
    const eff = getWorkEfficiency();

    // Ticking de construcciones en curso
    const dayDelta = delta;

    // 0. Progreso de construcción/mejora del Ayuntamiento
    if (state.townHall && (state.townHall.isUnderConstruction || state.townHall.isUpgrading)) {
      const isPlayerOnTH = state.playerConstructing && state.playerConstructing.type === 'townHall';
      const playerSpeed = isPlayerOnTH ? 0.25 : 0.0;
      
      const workers = state.townHall.workerAssigned || 0;
      const workerSpeed = workers >= 2 ? 1.0 : (workers === 1 ? 0.5 : 0.0);
      
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
          
          if (isPlayerOnTH) {
            state.playerConstructing = null;
          }
          
          if (workers > 0) {
            state.freeColonists += workers;
            state.townHall.workerAssigned = 0;
          }
          
          if (wasUpgrading) {
            showToast(`✅ Ayuntamiento mejorado al Nivel ${state.townHall.tier}! Construcciones de Tier ${state.maxBuildingTier} desbloqueadas.`, "success");
          } else {
            showToast("✅ Ayuntamiento ¡construcción completada! Construcciones de Tier 1 desbloqueadas.", "success");
          }
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
      { key: 'granaries', name: 'Granero', defaultDuration: 5 }
    ];

    buildingTypes.forEach(bt => {
      if (Array.isArray(state[bt.key])) {
        state[bt.key].forEach((building, idx) => {
          if (building.isUnderConstruction || building.isUpgrading) {
            const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === bt.key && state.playerConstructing.index === idx;
            const playerSpeed = isPlayerOnIt ? 0.25 : 0.0;
            
            const workers = building.workerAssigned || 0;
            const workerSpeed = workers >= 2 ? 1.0 : (workers === 1 ? 0.5 : 0.0);
            
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
                }
                
                // Liberar constructores al pool de colonos sin empleo
                if (workers > 0) {
                  state.freeColonists += workers;
                  building.workerAssigned = 0;
                }
                
                if (bt.key === 'houses') {
                  if (typeof recalculateMaxPopulation === 'function') recalculateMaxPopulation();
                  if (wasUpgrading) {
                    const tierNames = { 2: 'Cabaña', 3: 'Casa Grande' };
                    showToast(`✅ Choza #${idx + 1} mejorada a ${tierNames[building.tier] || 'Edificio'}!`, "success");
                  } else {
                    showToast(`✅ Choza #${idx + 1} ¡construcción completada! (+1 Capacidad de población)`, "success");
                  }
                } else {
                  if (wasUpgrading) {
                    showToast(`✅ ${bt.name} #${idx + 1} mejorada a Tier ${building.tier}!`, "success");
                  } else {
                    showToast(`✅ ${bt.name} #${idx + 1} ¡construcción completada!`, "success");
                  }
                }
                
                recalculateRates();
                if (typeof updateUI === 'function') updateUI();
              }
            }
          }
        });
      }
    });

    // 1. Recolección Automática básica (Continua)
    if (state.jobs.wood > 0 && CONFIG.BasicGathering && CONFIG.BasicGathering.wood_auto) {
      const cfg = CONFIG.BasicGathering.wood_auto;
      const woodAdded = ((cfg.yield * state.jobs.wood) / cfg.duration) * delta * eff;
      state.wood += woodAdded;
      resourcesGeneratedThisSecond.wood += woodAdded;
    }
    
    if (state.jobs.stone > 0 && CONFIG.BasicGathering && CONFIG.BasicGathering.stone_auto) {
      const cfg = CONFIG.BasicGathering.stone_auto;
      const stoneAdded = ((cfg.yield * state.jobs.stone) / cfg.duration) * delta * eff;
      state.stone += stoneAdded;
      resourcesGeneratedThisSecond.stone += stoneAdded;
    }

    if (state.jobs.berries > 0 && CONFIG.BasicGathering && CONFIG.BasicGathering.berries_auto) {
      const cfg = CONFIG.BasicGathering.berries_auto;
      const foodAdded = ((cfg.yield * state.jobs.berries) / cfg.duration) * delta * eff;
      state.berries = (state.berries || 0) + foodAdded;
      updateGlobalFood();
    }

    // 1b. Producción Pasiva de Aserraderos y Canteras
    if (Array.isArray(state.lumberMills) && CONFIG.ProductionRate && CONFIG.ProductionRate.lumbermill_prod) {
      state.lumberMills.forEach(b => {
        if (b.workerAssigned > 0 && !b.isUnderConstruction) {
          const millCfg = CONFIG.ProductionRate.lumbermill_prod;
          const millDuration = millCfg.duration || 1.0;
          const tier = b.tier || 1;
          const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
          const woodPassive = ((millCfg.yield * multiplier * b.workerAssigned) / millDuration) * delta * eff;
          state.wood += woodPassive;
          resourcesGeneratedThisSecond.wood += woodPassive;
        }
      });
    }
    
    if (Array.isArray(state.quarries) && CONFIG.ProductionRate && CONFIG.ProductionRate.quarry_prod) {
      state.quarries.forEach(b => {
        if (b.workerAssigned > 0 && !b.isUnderConstruction) {
          const quarryCfg = CONFIG.ProductionRate.quarry_prod;
          const quarryDuration = quarryCfg.duration || 1.0;
          const tier = b.tier || 1;
          const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
          const stonePassive = ((quarryCfg.yield * multiplier * b.workerAssigned) / quarryDuration) * delta * eff;
          state.stone += stonePassive;
          resourcesGeneratedThisSecond.stone += stonePassive;
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
          const recipe = bonfire.selectedRecipe || 'wheat';
          const minFood = autoRec.consume_amount;
          if ((state[recipe] || 0) >= minFood) {
            state[recipe] -= minFood;
            updateGlobalFood();
            bonfire.elapsed = 0;
            bonfire.isRunning = true;
            bonfire.mode = 'auto';
            recalculateRates();
          }
        }

        if (!bonfire.isUnderConstruction && bonfire.isRunning) {
          const speedMultiplier = bonfire.mode === 'auto' ? (bonfire.workerAssigned || 1) : 1;
          bonfire.elapsed += delta * eff * speedMultiplier;
          const targetDuration = bonfire.mode === 'manual' ? manualRec.duration : autoRec.duration;
          
          if (bonfire.elapsed >= targetDuration) {
            bonfire.isRunning = false;
            bonfire.elapsed = 0;
            const produced = bonfire.mode === 'manual' ? manualRec.yield : autoRec.yield;
            const recipe = bonfire.selectedRecipe || 'wheat';
            const cookedDish = 'cooked_' + recipe;
            state[cookedDish] = (state[cookedDish] || 0) + produced;
            updateGlobalFood();
            
            resourcesGeneratedThisSecond.cooked = (resourcesGeneratedThisSecond.cooked || 0) + produced;
            
            let bName = bonfire.tier === 1 ? 'Fogata' : (bonfire.tier === 2 ? 'Caldero' : 'Cocina de Taberna');
            const cookedNames = { cooked_wheat: 'Pan', cooked_potato: 'Patata Asada', cooked_carrot: 'Zanahoria Asada', cooked_berries: 'Mermelada' };
            showToast(`🔥 ${bName} #${idx + 1} completó un lote de ${produced} ${cookedNames[cookedDish] || cookedDish}`, "success");
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
        if (granary.isUnderConstruction) return;

        const hasWorker = granary.workerAssigned > 0;
        const cropKey = granary.selectedCrop || 'wheat';
        const tier = granary.tier || 1;
        const recipeKey = `granary_${cropKey}_t${tier}`;
        const recipe = CONFIG.Processing && CONFIG.Processing[recipeKey];

        if (!recipe) return;

        // Auto-iniciar si tiene trabajadores y no está corriendo
        if (!granary.isRunning && hasWorker) {
          const minFood = recipe.consume_amount || 5;
          const consumeRes = recipe.consume_type || cropKey;
          if ((state[consumeRes] || 0) >= minFood) {
            state[consumeRes] -= minFood;
            updateGlobalFood();
            granary.elapsed = 0;
            granary.isRunning = true;
            granary.mode = 'auto';
            recalculateRates();
          }
        }

        // Ticking del progreso de procesamiento
        if (granary.isRunning) {
          const speedMultiplier = granary.mode === 'auto' ? (granary.workerAssigned || 1) : 1;
          granary.elapsed += delta * eff * speedMultiplier;
          const targetDuration = recipe.duration || 3.0;

          if (granary.elapsed >= targetDuration) {
            granary.isRunning = false;
            granary.elapsed = 0;
            
            const produced = recipe.yield || 1;
            const seedType = cropKey; 
            if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
            state.seeds[seedType] = (state.seeds[seedType] || 0) + produced;
            updateUI();
            
            const cropNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
            showToast(`🌾 Granero #${idx + 1} produjo +${produced} Semillas de ${cropNames[seedType] || seedType}`, "success");
            
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
          market.elapsed += delta * eff;
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
        if (state.timePhase === 'day' && farm.workerAssigned > 0) {
          farm.waterElapsed = (farm.waterElapsed || 0) + delta * getWorkEfficiency();
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
      if (farm.stage === 'grow' || farm.stage === 'grow2') {
        elapsedIncrement = delta;
      } else {
        if (state.timePhase === 'day' && farm.workerAssigned > 0) {
          elapsedIncrement = delta * getWorkEfficiency();
        }
      }

      farm.stageElapsed = (farm.stageElapsed || 0) + elapsedIncrement;

      if (farm.stageElapsed >= stageDuration) {
        farm.stageElapsed = 0;
        if (farm.stage === 'plow') {
          farm.stage = 'sow';
        } else if (farm.stage === 'sow') {
          farm.stage = 'water';
        } else if (farm.stage === 'water') {
          farm.stage = 'grow';
        } else if (farm.stage === 'grow') {
          farm.stage = 'water2';
        } else if (farm.stage === 'water2') {
          farm.stage = 'grow2';
        } else if (farm.stage === 'grow2') {
          // Cosechar!
          const farmTier = farm.tier || 1;
          const tierMultiplier = farmTier === 3 ? 2.5 : (farmTier === 2 ? 1.5 : 1.0);
          const harvestedYield = crop.yield * tierMultiplier;
          
          const cropKey = farm.activeCrop || farm.crop || 'wheat';
          state[cropKey] = (state[cropKey] || 0) + harvestedYield;
          updateGlobalFood();
          
          showToast(`¡Cosecha de ${crop.name} lista en Granja #${idx + 1}! +${harvestedYield.toFixed(0)} ${crop.name}`, "success");

          // Reiniciar el ciclo si hay semillas disponibles para la semilla seleccionada
          const nextCropKey = farm.crop || 'wheat';
          const nextCrop = CROPS[nextCropKey];
          if (!state.seeds) state.seeds = { wheat: 0, potato: 0, carrot: 0 };
          if ((state.seeds[nextCropKey] || 0) >= 1) {
            state.seeds[nextCropKey] -= 1;
            farm.stage = 'plow';
            farm.activeCrop = nextCropKey;
            farm.wateringsCompleted = 0;
          } else {
            farm.stage = 'idle';
            farm.wateringsCompleted = 0;
            const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
            showToast(`Sin semillas de ${rawNames[nextCropKey] || nextCropKey} para reiniciar cultivo en Granja #${idx + 1}`, "warning");
          }
          recalculateRates();
        }
      }
    });
  }

  // Resetear acumulador de recursos cada segundo
  if (now - lastRateResetTime >= 1000) {
    resourcesGeneratedThisSecond = { gold: 0, wood: 0, stone: 0, food: 0, cooked: 0 };
    lastRateResetTime = now;
  }

  if (typeof updateRatesUI === 'function') updateRatesUI();
  if (typeof updateUI === 'function') updateUI();
}

// Iniciar el game loop inmediatamente
setInterval(gameTick, 100);
