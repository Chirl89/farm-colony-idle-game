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
  
  let remaining = total;
  let fedC = 0;
  let fedR = 0;
  
  const priority = state.foodPriority || ['cooked', 'raw'];
  
  for (let type of priority) {
    if (remaining <= 0) break;
    
    if (type === 'cooked') {
      if (state.allowConsumeCooked === false) continue;
      fedC = Math.min(remaining, Math.floor(state.cookedFood || 0));
      state.cookedFood = Math.max(0, state.cookedFood - fedC);
      remaining -= fedC;
    } else if (type === 'raw') {
      if (state.allowConsumeRaw === false) continue;
      fedR = Math.min(remaining, Math.floor((state.food || 0) / 2));
      state.food = Math.max(0, state.food - (fedR * 2));
      remaining -= fedR;
    }
  }
  
  state.fedCookedToday = fedC;
  state.fedRawToday = fedR;
  state.fedNoneToday = remaining;
  
  state.starvingColonists = remaining;
  
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
  
  const fedC = state.fedCookedToday || 0;
  const fedR = state.fedRawToday || 0;
  const fedN = state.fedNoneToday || 0;
  
  const fedCEven = Math.min(fedC, Math.floor(state.cookedFood || 0));
  state.cookedFood = Math.max(0, state.cookedFood - fedCEven);
  const starvedC = fedC - fedCEven;
  
  const fedREven = Math.min(fedR, Math.floor((state.food || 0) / 2));
  state.food = Math.max(0, state.food - (fedREven * 2));
  const starvedR = fedR - fedREven;
  
  state.starvingColonists = fedN + starvedC + starvedR;
  
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
  const dayDuration = CONFIG.System && CONFIG.System.day_duration ? CONFIG.System.day_duration.duration : 30.0;
  
  // 1. Madera (Wood)
  let woodRate = 0;
  if (CONFIG.BasicGathering && CONFIG.BasicGathering.wood_auto) {
    const cfg = CONFIG.BasicGathering.wood_auto;
    woodRate += state.jobs.wood * (cfg.yield / cfg.duration);
  }
  if (state.lumberMills && CONFIG.ProductionRate && CONFIG.ProductionRate.lumbermill_prod) {
    const baseYield = CONFIG.ProductionRate.lumbermill_prod.yield;
    state.lumberMills.forEach(m => {
      if (m.workerAssigned > 0 && !m.isUnderConstruction) {
        const tier = m.tier || 1;
        const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
        woodRate += baseYield * multiplier * m.workerAssigned;
      }
    });
  }
  calculatedRates.wood = woodRate;

  // 2. Piedra (Stone)
  let stoneRate = 0;
  if (CONFIG.BasicGathering && CONFIG.BasicGathering.stone_auto) {
    const cfg = CONFIG.BasicGathering.stone_auto;
    stoneRate += state.jobs.stone * (cfg.yield / cfg.duration);
  }
  if (state.quarries && CONFIG.ProductionRate && CONFIG.ProductionRate.quarry_prod) {
    const baseYield = CONFIG.ProductionRate.quarry_prod.yield;
    state.quarries.forEach(q => {
      if (q.workerAssigned > 0 && !q.isUnderConstruction) {
        const tier = q.tier || 1;
        const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
        stoneRate += baseYield * multiplier * q.workerAssigned;
      }
    });
  }
  calculatedRates.stone = stoneRate;

  // 3. Comida (Food) y Comida Cocinada (Cooked)
  let foodRate = 0;
  if (CONFIG.BasicGathering && CONFIG.BasicGathering.berries_auto) {
    const cfg = CONFIG.BasicGathering.berries_auto;
    foodRate += state.jobs.berries * (cfg.yield / cfg.duration);
  }
  if (state.farms) {
    state.farms.forEach(f => {
      if ((f.workerAssigned > 0 || f.isRunning) && !f.isUnderConstruction) {
        const cropKey = (f.isRunning ? f.activeCrop : f.crop) || f.crop || 'wheat';
        const crop = CROPS[cropKey];
        if (crop) {
          foodRate += crop.yield / crop.duration;
        }
      }
    });
  }
  let cookedRate = 0;
  if (state.bonfires) {
    state.bonfires.forEach(b => {
      if ((b.workerAssigned > 0 || b.isRunning) && !b.isUnderConstruction) {
        let rec;
        if (b.tier === 1) rec = CONFIG.Processing.bonfire_auto;
        else if (b.tier === 2) rec = CONFIG.Processing.pot_auto;
        else rec = CONFIG.Processing.kitchen_auto;

        if (rec) {
          const mult = b.workerAssigned > 0 ? b.workerAssigned : (b.isRunning ? 1 : 0);
          foodRate -= (rec.consume_amount / rec.duration) * mult;
          cookedRate += (rec.yield / rec.duration) * mult;
        }
      }
    });
  }

  calculatedRates.food = foodRate;
  calculatedRates.cooked = cookedRate;

  // 5. Oro (Gold)
  let goldRate = 0;
  const activeMarkets = state.markets ? state.markets.filter(m => m.workerAssigned > 0 && !m.isUnderConstruction).length : 0;
  if (activeMarkets > 0 && CONFIG.Sales) {
    if (state.autoSellCooked && CONFIG.Sales.market_cooked) {
      const mCooked = CONFIG.Sales.market_cooked;
      goldRate += Math.max(0, cookedRate) * (mCooked.yield / mCooked.consume_amount);
    }
    if (state.autoSellFood && CONFIG.Sales.market_food) {
      const mFood = CONFIG.Sales.market_food;
      goldRate += Math.max(0, foodRate) * (mFood.yield / mFood.consume_amount);
    }
    if (state.autoSellWood && CONFIG.Sales.market_wood) {
      const mWood = CONFIG.Sales.market_wood;
      goldRate += Math.max(0, woodRate) * (mWood.yield / mWood.consume_amount);
    }
    if (state.autoSellStone && CONFIG.Sales.market_stone) {
      const mStone = CONFIG.Sales.market_stone;
      goldRate += Math.max(0, stoneRate) * (mStone.yield / mStone.consume_amount);
    }
  }
  
  // Simular consumo proyectado de alimento por día
  let remainingColonists = state.currentColonists || 0;
  let projCooked = 0;
  let projRaw = 0;

  const foodPriorityList = state.foodPriority || ['cooked', 'raw'];
  for (let type of foodPriorityList) {
    if (remainingColonists <= 0) break;
    
    if (type === 'cooked') {
      if (state.allowConsumeCooked !== false) {
        const avail = Math.floor((state.cookedFood || 0) / 2);
        const consumed = Math.min(remainingColonists, avail);
        projCooked += consumed * 2;
        remainingColonists -= consumed;
      }
    } else if (type === 'raw') {
      if (state.allowConsumeRaw !== false) {
        const avail = Math.floor((state.food || 0) / 4);
        const consumed = Math.min(remainingColonists, avail);
        projRaw += consumed * 4;
        remainingColonists -= consumed;
      }
    }
  }

  foodRate -= projRaw;
  cookedRate -= projCooked;

  calculatedRates.food = foodRate;
  calculatedRates.cooked = cookedRate;
  calculatedRates.gold = goldRate;

  // Escalar tasas según la eficiencia laboral
  const eff = getWorkEfficiency();
  calculatedRates.wood *= eff;
  calculatedRates.stone *= eff;
  calculatedRates.food *= eff;
  calculatedRates.cooked *= eff;
  calculatedRates.gold *= eff;
}

// Bucle principal de simulación (corre cada 100ms)
function gameTick() {
  if (!CONFIG || Object.keys(CONFIG).length === 0) return;
  
  const now = Date.now();
  const delta = 0.1; // 100ms
  
  const dayDuration = CONFIG.System && CONFIG.System.day_duration ? CONFIG.System.day_duration.duration : 30.0;
  const nightDuration = CONFIG.System && CONFIG.System.night_duration ? CONFIG.System.night_duration.duration : 20.0;
  
  if (typeof state.currentDay === 'undefined') state.currentDay = 1;
  if (typeof state.timePhase === 'undefined') state.timePhase = 'day';
  if (typeof state.phaseElapsed === 'undefined') state.phaseElapsed = 0;
  
  // Reducir cooldown activo de recolección manual
  if (state.gatherCooldown > 0) {
    const hourDuration = state.timePhase === 'day' ? (dayDuration / 14) : (nightDuration / 10);
    const prevCooldown = state.gatherCooldown;
    state.gatherCooldown = Math.max(0, state.gatherCooldown - delta / hourDuration);
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
    const dayDelta = delta / dayDuration;

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
      { key: 'markets', name: 'Puesto de Mercado', defaultDuration: 5 }
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
      const woodAdded = ((cfg.yield * state.jobs.wood) / (dayDuration * cfg.duration)) * delta * eff;
      state.wood += woodAdded;
      resourcesGeneratedThisSecond.wood += woodAdded;
    }
    
    if (state.jobs.stone > 0 && CONFIG.BasicGathering && CONFIG.BasicGathering.stone_auto) {
      const cfg = CONFIG.BasicGathering.stone_auto;
      const stoneAdded = ((cfg.yield * state.jobs.stone) / (dayDuration * cfg.duration)) * delta * eff;
      state.stone += stoneAdded;
      resourcesGeneratedThisSecond.stone += stoneAdded;
    }

    if (state.jobs.berries > 0 && CONFIG.BasicGathering && CONFIG.BasicGathering.berries_auto) {
      const cfg = CONFIG.BasicGathering.berries_auto;
      const foodAdded = ((cfg.yield * state.jobs.berries) / (dayDuration * cfg.duration)) * delta * eff;
      state.food += foodAdded;
      resourcesGeneratedThisSecond.food += foodAdded;
    }

    // 1b. Producción Pasiva de Aserraderos y Canteras
    if (Array.isArray(state.lumberMills) && CONFIG.ProductionRate && CONFIG.ProductionRate.lumbermill_prod) {
      state.lumberMills.forEach(b => {
        if (b.workerAssigned > 0 && !b.isUnderConstruction) {
          const millCfg = CONFIG.ProductionRate.lumbermill_prod;
          const tier = b.tier || 1;
          const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
          const woodPassive = ((millCfg.yield * multiplier * b.workerAssigned) / dayDuration) * delta * eff;
          state.wood += woodPassive;
          resourcesGeneratedThisSecond.wood += woodPassive;
        }
      });
    }
    
    if (Array.isArray(state.quarries) && CONFIG.ProductionRate && CONFIG.ProductionRate.quarry_prod) {
      state.quarries.forEach(b => {
        if (b.workerAssigned > 0 && !b.isUnderConstruction) {
          const quarryCfg = CONFIG.ProductionRate.quarry_prod;
          const tier = b.tier || 1;
          const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
          const stonePassive = ((quarryCfg.yield * multiplier * b.workerAssigned) / dayDuration) * delta * eff;
          state.stone += stonePassive;
          resourcesGeneratedThisSecond.stone += stonePassive;
        }
      });
    }

    // 2. Progreso de agricultura en Granjas
    if (Array.isArray(state.farms)) {
      state.farms.forEach((farm, idx) => {
        const hasWorker = farm.workerAssigned > 0;
        
        if (!farm.isUnderConstruction && !farm.isRunning && hasWorker) {
          const crop = CROPS[farm.crop];
          if (crop && state.gold >= crop.cost) {
            state.gold -= crop.cost;
            farm.elapsed = 0;
            farm.isRunning = true;
            farm.activeCrop = farm.crop;
            recalculateRates();
          }
        }
        
        if (!farm.isUnderConstruction && farm.isRunning) {
          const crop = CROPS[farm.activeCrop || farm.crop];
          if (crop) {
            farm.elapsed += (1 / dayDuration) * delta * eff;
            if (farm.elapsed >= crop.duration) {
              farm.isRunning = false;
              farm.elapsed = 0;
              state.food += crop.yield;
              resourcesGeneratedThisSecond.food += crop.yield;
              showToast(`¡Cosecha de ${crop.name} lista en Granja #${idx + 1}! +${crop.yield} Comida`, "success");
              recalculateRates();
            }
          }
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
          if (state.food >= autoRec.consume_amount) {
            state.food -= autoRec.consume_amount;
            bonfire.elapsed = 0;
            bonfire.isRunning = true;
            bonfire.mode = 'auto';
            recalculateRates();
          }
        }

        if (!bonfire.isUnderConstruction && bonfire.isRunning) {
          const speedMultiplier = bonfire.mode === 'auto' ? (bonfire.workerAssigned || 1) : 1;
          bonfire.elapsed += (1 / dayDuration) * delta * eff * speedMultiplier;
          const targetDuration = bonfire.mode === 'manual' ? manualRec.duration : autoRec.duration;
          
          if (bonfire.elapsed >= targetDuration) {
            bonfire.isRunning = false;
            bonfire.elapsed = 0;
            const produced = bonfire.mode === 'manual' ? manualRec.yield : autoRec.yield;
            state.cookedFood = (state.cookedFood || 0) + produced;
            resourcesGeneratedThisSecond.cooked = (resourcesGeneratedThisSecond.cooked || 0) + produced;
            
            let bName = bonfire.tier === 1 ? 'Fogata' : (bonfire.tier === 2 ? 'Caldero' : 'Cocina de Taberna');
            showToast(`🔥 ${bName} #${idx + 1} completó un lote de ${produced} Comida Cocinada`, "success");
            bonfire.mode = 'none';
            recalculateRates();
            if (typeof updateUI === 'function') updateUI();
          }
        }
      });
    }

    // 4. Automatización de Ventas en Mercados
    if (Array.isArray(state.markets) && CONFIG.Sales) {
      state.markets.forEach((market, idx) => {
        const hasWorker = market.workerAssigned > 0;
        
        if (!market.isUnderConstruction && !market.isRunning && hasWorker) {
          const minCooked = parseInt(state.autoSellCookedMin) || 0;
          const minFood = parseInt(state.autoSellFoodMin) || 0;
          const minStone = parseInt(state.autoSellStoneMin) || 0;
          const minWood = parseInt(state.autoSellWoodMin) || 0;

          const mCooked = CONFIG.Sales.market_cooked;
          const mFood = CONFIG.Sales.market_food;
          const mStone = CONFIG.Sales.market_stone;
          const mWood = CONFIG.Sales.market_wood;

          let soldResource = null;
          let revenue = 0;
          let targetDuration = 0.1;

          if (state.autoSellCooked && state.cookedFood >= minCooked + mCooked.consume_amount) {
            state.cookedFood -= mCooked.consume_amount;
            soldResource = 'Comida Cocinada';
            revenue = mCooked.yield;
            targetDuration = mCooked.duration;
          } else if (state.autoSellFood && state.food >= minFood + mFood.consume_amount) {
            state.food -= mFood.consume_amount;
            soldResource = 'Comida';
            revenue = mFood.yield;
            targetDuration = mFood.duration;
          } else if (state.autoSellStone && state.stone >= minStone + mStone.consume_amount) {
            state.stone -= mStone.consume_amount;
            soldResource = 'Piedra';
            revenue = mStone.yield;
            targetDuration = mStone.duration;
          } else if (state.autoSellWood && state.wood >= minWood + mWood.consume_amount) {
            state.wood -= mWood.consume_amount;
            soldResource = 'Madera';
            revenue = mWood.yield;
            targetDuration = mWood.duration;
          }

          if (soldResource !== null) {
            market.soldResource = soldResource;
            market.revenue = revenue;
            market.targetDuration = targetDuration;
            market.elapsed = 0;
            market.isRunning = true;
          }
        }
        
        if (!market.isUnderConstruction && market.isRunning) {
          market.elapsed += delta * eff;
          const duration = market.targetDuration || 0.1;
          if (market.elapsed >= duration) {
            market.isRunning = false;
            market.elapsed = 0;
            state.gold += market.revenue;
            resourcesGeneratedThisSecond.gold += market.revenue;
          }
        }
      });
    }
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
