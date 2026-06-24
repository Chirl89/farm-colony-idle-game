// ACCIONES DE RECOLECCIÓN MANUAL
function gatherWood() {
  if (state.gatherCooldown > 0) { showToast("Aún te estás recuperando...", "warning"); return; }
  const cooldown = CONFIG.Timing && CONFIG.Timing.gather_cooldown ? CONFIG.Timing.gather_cooldown.duration : 2.0;
  state.gatherCooldown = cooldown;
  state.gatherType = 'wood';
  state.playerConstructing = null;
  showToast("Comenzando a recolectar madera...", "info");
  updateUI();
}

function gatherStone() {
  if (state.gatherCooldown > 0) { showToast("Aún te estás recuperando...", "warning"); return; }
  const cooldown = CONFIG.Timing && CONFIG.Timing.gather_cooldown ? CONFIG.Timing.gather_cooldown.duration : 2.0;
  state.gatherCooldown = cooldown;
  state.gatherType = 'stone';
  state.playerConstructing = null;
  showToast("Comenzando a recolectar piedra...", "info");
  updateUI();
}

function gatherBerries() {
  if (state.gatherCooldown > 0) { showToast("Aún te estás recuperando...", "warning"); return; }
  const cooldown = CONFIG.Timing && CONFIG.Timing.gather_cooldown ? CONFIG.Timing.gather_cooldown.duration : 2.0;
  state.gatherCooldown = cooldown;
  state.gatherType = 'berries';
  state.playerConstructing = null;
  showToast("Comenzando a recolectar frutos...", "info");
  updateUI();
}

function deliverGatheredResources() {
  const type = state.gatherType;
  if (!type) return;
  
  if (type === 'wood') {
    const yieldVal = CONFIG.BasicGathering.wood_manual.yield;
    state.wood += yieldVal;
    resourcesGeneratedThisSecond.wood += yieldVal;
    showToast(`+${yieldVal} Madera recolectada`, "success");
  } else if (type === 'stone') {
    const yieldVal = CONFIG.BasicGathering.stone_manual.yield;
    state.stone += yieldVal;
    resourcesGeneratedThisSecond.stone += yieldVal;
    showToast(`+${yieldVal} Piedra recolectada`, "success");
  } else if (type === 'berries') {
    const yieldVal = CONFIG.BasicGathering.berries_manual.yield;
    state.berries = (state.berries || 0) + yieldVal;
    updateGlobalFood();
    showToast(`+${yieldVal} Frutos recolectados`, "success");
  }
  
  state.gatherType = null;
  recalculateRates();
  updateUI();
}

function hireColonist(candidateIdx) {
  if (!state.candidates || !state.candidates[candidateIdx]) {
    showToast("Candidato no disponible", "warning");
    return;
  }
  
  const cost = (CONFIG.Building && CONFIG.Building.hire_colonist) ? CONFIG.Building.hire_colonist.cost_gold : 50;
  if (state.gold >= cost) {
    state.gold -= cost;
    
    // Asignar ID secuencial único a este colono al ser contratado
    const nextId = state.colonists.length ? Math.max(...state.colonists.map(c => c.id)) + 1 : 0;
    const candidate = state.candidates[candidateIdx];
    candidate.id = nextId;
    
    // Mover de candidates a colonists
    state.colonists.push(candidate);
    state.candidates.splice(candidateIdx, 1);
    
    // Asignar vivienda al nuevo colono de forma automática
    if (typeof initializeHousingAssignments === 'function') {
      initializeHousingAssignments();
    }
    
    showToast(`¡${candidate.name} ha sido contratado!`, "success");
    fixColonistAllocation();
    recalculateRates();
    updateUI();
  } else {
    showToast("Oro insuficiente para contratar a este candidato", "warning");
  }
}

// MERCADO
function sellFoodSelected(type, amount = 10) {
  const saleRule = CONFIG.Sales[`sell_${type}_manual`];
  if (!saleRule) {
    showToast("Receta de venta no válida", "warning");
    return;
  }
  const stock = getResourceStock(type);
  if (stock >= amount) {
    deductResourceStock(type, amount);
    updateGlobalFood();
    
    const yieldPerUnit = saleRule.yield / saleRule.consume_amount;
    const totalYield = amount * yieldPerUnit;
    
    state.gold += totalYield;
    resourcesGeneratedThisSecond.gold += totalYield;
    
    const rawNames = {
      wood: 'Madera', stone: 'Piedra',
      wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos',
      cooked_wheat: 'Pan', cooked_potato: 'Patata Asada', cooked_carrot: 'Zanahoria Asada', cooked_berries: 'Mermelada',
      wheat_seeds: 'Semillas de Trigo', potato_seeds: 'Semillas de Patata', carrot_seeds: 'Semillas de Zanahoria'
    };
    showToast(`¡Vendidas ${amount} unidades de ${rawNames[type] || type} por ${totalYield}🪙!`, "success");
    updateUI();
  } else {
    const rawNames = {
      wood: 'Madera', stone: 'Piedra',
      wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos',
      cooked_wheat: 'Pan', cooked_potato: 'Patata Asada', cooked_carrot: 'Zanahoria Asada', cooked_berries: 'Mermelada',
      wheat_seeds: 'Semillas de Trigo', potato_seeds: 'Semillas de Patata', carrot_seeds: 'Semillas de Zanahoria'
    };
    showToast(`No tienes suficiente cantidad de ${rawNames[type] || type} (Mín. ${amount})`, "warning");
  }
}

function updateSellResourcePriceDisplay() {
  const select = document.getElementById('sell-resource-select');
  const priceText = document.getElementById('sell-resource-price-text');
  if (!select || !priceText) return;
  const type = select.value;
  const saleRule = CONFIG.Sales && CONFIG.Sales[`sell_${type}_manual`];
  if (saleRule) {
    const price = saleRule.yield / saleRule.consume_amount;
    priceText.innerText = `${price} 🪙`;
  } else {
    priceText.innerText = '0 🪙';
  }
}

function sellResourceManual(amount) {
  const select = document.getElementById('sell-resource-select');
  if (!select) return;
  const type = select.value;
  sellFoodSelected(type, amount);
}

// COMPRA MANUAL
function buyResourceSelected(type, amount = 1) {
  const buyRule = CONFIG.Sales[`buy_${type}`];
  if (!buyRule) {
    showToast("Fórmula de compra no encontrada", "warning");
    return;
  }
  const cost = (buyRule.cost_gold || 0) * amount;
  if (state.gold >= cost) {
    state.gold -= cost;
    addResourceStock(type, amount);
    updateGlobalFood();
    
    const rawNames = {
      wood: 'Madera', stone: 'Piedra',
      wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos',
      cooked_wheat: 'Pan', cooked_potato: 'Patata Asada', cooked_carrot: 'Zanahoria Asada', cooked_berries: 'Mermelada',
      wheat_seeds: 'Semillas de Trigo', potato_seeds: 'Semillas de Patata', carrot_seeds: 'Semillas de Zanahoria'
    };
    
    showToast(`¡Compradas ${amount} unidades de ${rawNames[type] || type} por ${cost}🪙!`, "success");
    recalculateRates();
    updateUI();
  } else {
    showToast(`Oro insuficiente (necesitas ${cost}🪙)`, "warning");
  }
}

function updateBuyResourcePriceDisplay() {
  const select = document.getElementById('buy-resource-select');
  const priceText = document.getElementById('buy-resource-price-text');
  if (!select || !priceText) return;
  const type = select.value;
  const buyRule = CONFIG.Sales && CONFIG.Sales[`buy_${type}`];
  if (buyRule) {
    priceText.innerText = `${buyRule.cost_gold} 🪙`;
  } else {
    priceText.innerText = '0 🪙';
  }
}

function buyResourceManual(amount) {
  const select = document.getElementById('buy-resource-select');
  if (!select) return;
  const type = select.value;
  buyResourceSelected(type, amount);
}


function toggleFoodDetails() {
  const content = document.getElementById('food-details-content');
  if (!content) return;
  
  if (content.style.display === 'none') {
    content.style.display = 'flex';
  } else {
    content.style.display = 'none';
  }
}

function toggleResourcesDetails() {
  const content = document.getElementById('resources-details-content');
  if (!content) return;
  
  if (content.style.display === 'none') {
    content.style.display = 'flex';
  } else {
    content.style.display = 'none';
  }
}

// CONFIGURACIÓN DE AUTO-VENTAS
function toggleAutoSell(type, checked) {
  if (!state.autoSell) state.autoSell = {};
  state.autoSell[type] = checked;
  recalculateRates();
  updateUI();
}

function changeAutoSellMin(type, val) {
  const value = Math.max(0, parseInt(val) || 0);
  if (!state.autoSellMin) state.autoSellMin = {};
  state.autoSellMin[type] = value;
  recalculateRates();
  updateUI();
}

// CONFIGURACIÓN DE AUTO-COMPRAS
function toggleAutoBuy(type, checked) {
  if (!state.autoBuy) state.autoBuy = {};
  state.autoBuy[type] = checked;
  recalculateRates();
  updateUI();
}

function changeAutoBuyMax(type, val) {
  const value = Math.max(0, parseInt(val) || 0);
  if (!state.autoBuyMax) state.autoBuyMax = {};
  state.autoBuyMax[type] = value;
  recalculateRates();
  updateUI();
}


function toggleConsumeType(type, checked) {
  if (!state.allowConsume) state.allowConsume = {};
  state.allowConsume[type] = checked;
  
  updateGlobalFood();
  recalculateRates();
  updateUI();
  
  const rawNames = {
    wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos',
    cooked_wheat: 'Pan', cooked_potato: 'Patata Asada', cooked_carrot: 'Zanahoria Asada', cooked_berries: 'Mermelada'
  };
  showToast(`Consumo de ${rawNames[type] || type} ${checked ? 'permitido' : 'prohibido'} para aldeanos`, "info");
}

function moveFoodPriority(idx, dir) {
  if (!state.foodPriority) state.foodPriority = ['cooked', 'raw'];
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.foodPriority.length) return;
  
  const temp = state.foodPriority[idx];
  state.foodPriority[idx] = state.foodPriority[newIdx];
  state.foodPriority[newIdx] = temp;
  recalculateRates();
  renderFoodPriorityList();
  updateUI();

  showToast("Prioridad de alimentación actualizada", "info");
}

// GESTIÓN DE PESTAÑAS (TABS)
function switchTab(tabId) {
  if (tabId === 'sales' && (!state.markets || state.markets.length === 0)) {
    showToast("Debes construir un Puesto de Mercado para desbloquear el comercio", "warning");
    return;
  }
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(c => c.classList.remove('active-content'));
  
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(b => b.classList.remove('active'));
  
  const targetContent = document.getElementById(`tab-${tabId}`);
  if (targetContent) targetContent.classList.add('active-content');
  
  const targetBtn = document.getElementById(`tab-btn-${tabId}`);
  if (targetBtn) targetBtn.classList.add('active');
  
  state.currentTab = tabId;
}

function switchSubTab(subTabId) {
  const buttons = document.querySelectorAll('#tab-production .subtab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const contents = document.querySelectorAll('#tab-production .subtab-content');
  contents.forEach(content => content.classList.remove('active-subcontent'));
  
  const targetBtn = document.getElementById(`subtab-btn-${subTabId}`);
  if (targetBtn) targetBtn.classList.add('active');
  
  const targetContent = document.getElementById(`subtab-${subTabId}`);
  if (targetContent) targetContent.classList.add('active-subcontent');
  
  state.currentSubTab = subTabId;
}

function switchColonistsSubTab(subTabId) {
  const buttons = document.querySelectorAll('#tab-colonists .subtab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const contents = document.querySelectorAll('#tab-colonists .subtab-content');
  contents.forEach(content => content.classList.remove('active-subcontent'));
  
  const targetBtn = document.getElementById(`subtab-btn-colonists-${subTabId}`);
  if (targetBtn) targetBtn.classList.add('active');
  
  const targetContent = document.getElementById(`subtab-colonists-${subTabId}`);
  if (targetContent) targetContent.classList.add('active-subcontent');
  
  state.currentColonistsSubTab = subTabId;
}

function changeColonistJobDirectly(colonistId, newJobValue) {
  if (!state.colonists) return;
  const col = state.colonists.find(c => c.id === colonistId);
  if (!col) return;
  
  const oldJob = col.job;
  const finalJob = newJobValue === "" ? null : newJobValue;
  
  if (finalJob === oldJob) return;
  
  if (finalJob !== null) {
    let maxWorkers = 1;
    let currentAssigned = state.colonists.filter(c => c.job === finalJob).length;
    
    if (finalJob === 'construction') {
      maxWorkers = Infinity;
    } else if (finalJob === 'townHall') {
      maxWorkers = (state.townHall.isUnderConstruction || state.townHall.isUpgrading) ? 0 : 2;
    } else if (finalJob.startsWith('lumbermills_')) {
      const idx = parseInt(finalJob.split('_')[1]);
      const b = state.lumberMills[idx];
      maxWorkers = (b.isUnderConstruction || b.isUpgrading) ? 0 : (b.tier || 1);
    } else if (finalJob.startsWith('quarries_')) {
      const idx = parseInt(finalJob.split('_')[1]);
      const b = state.quarries[idx];
      maxWorkers = (b.isUnderConstruction || b.isUpgrading) ? 0 : (b.tier || 1);
    } else if (finalJob.startsWith('bonfires_')) {
      const idx = parseInt(finalJob.split('_')[1]);
      const b = state.bonfires[idx];
      maxWorkers = (b.isUnderConstruction || b.isUpgrading) ? 0 : (b.tier || 1);
    } else if (finalJob.startsWith('granaries_')) {
      const idx = parseInt(finalJob.split('_')[1]);
      const b = state.granaries[idx];
      maxWorkers = (b.isUnderConstruction || b.isUpgrading) ? 0 : (b.tier || 1);
    } else if (finalJob.startsWith('farms_')) {
      const idx = parseInt(finalJob.split('_')[1]);
      const b = state.farms[idx];
      maxWorkers = (b.isUnderConstruction || b.isUpgrading) ? 0 : 1;
    } else if (finalJob.startsWith('markets_')) {
      const idx = parseInt(finalJob.split('_')[1]);
      const b = state.markets[idx];
      maxWorkers = (b.isUnderConstruction || b.isUpgrading) ? 0 : 1;
    } else {
      maxWorkers = Infinity;
    }
    
    if (currentAssigned >= maxWorkers) {
      if (maxWorkers === 0) {
        showToast("Este edificio está en construcción/mejora. Asigna constructores generales para avanzar.", "warning");
      } else {
        showToast("Este puesto de trabajo ya está al límite de su capacidad", "warning");
      }
      updateUI();
      return;
    }
  }
  
  col.job = finalJob;
  fixColonistAllocation();
  recalculateRates();
  updateUI();
  showToast(`Trabajo de ${col.name} cambiado con éxito`, "success");
}

// REGISTRO DE MANEJADORES DE EVENTOS
function initEventHandlers() {
  // Input de importar carpeta
  const folderImportInput = document.getElementById('folder-import-input');
  if (folderImportInput) {
    folderImportInput.addEventListener('change', importCSVFolder);
  }

  // Botón de importar carpeta
  const btnImportCsv = document.getElementById('btn-import-csv');
  if (btnImportCsv) {
    btnImportCsv.addEventListener('click', () => {
      const input = document.getElementById('folder-import-input');
      if (input) input.click();
    });
  }

  // Botón de recargar balances
  const btnReloadCsv = document.getElementById('btn-reload-csv');
  if (btnReloadCsv) {
    btnReloadCsv.addEventListener('click', () => {
      initGameData(true);
    });
  }

  // Botón de guardar
  const btnSave = document.getElementById('btn-save');
  if (btnSave) {
    btnSave.addEventListener('click', saveGame);
  }

  // Botón de backup
  const btnBackup = document.getElementById('btn-backup');
  if (btnBackup) {
    btnBackup.addEventListener('click', () => {
      const v = `v${new Date().toISOString().replace(/[:.]/g,'-').slice(0,16)}`;
      createBackupZip(v);
    });
  }

  // Botón de reiniciar
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', confirmReset);
  }

  // Botón de test
  const btnResetTest = document.getElementById('btn-reset-test');
  if (btnResetTest) {
    btnResetTest.addEventListener('click', confirmResetTest);
  }

  // Botones de pestañas principales
  const tabBasic = document.getElementById('tab-btn-basic');
  if (tabBasic) tabBasic.addEventListener('click', () => switchTab('basic'));
  const tabProd = document.getElementById('tab-btn-production');
  if (tabProd) tabProd.addEventListener('click', () => switchTab('production'));
  const tabConst = document.getElementById('tab-btn-construction');
  if (tabConst) tabConst.addEventListener('click', () => switchTab('construction'));
  const tabSales = document.getElementById('tab-btn-sales');
  if (tabSales) tabSales.addEventListener('click', () => switchTab('sales'));
  const tabCol = document.getElementById('tab-btn-colonists');
  if (tabCol) tabCol.addEventListener('click', () => switchTab('colonists'));

  // Botones de recolección manual
  const btnGatherWood = document.getElementById('btn-gather-wood');
  if (btnGatherWood) btnGatherWood.addEventListener('click', gatherWood);
  const btnGatherStone = document.getElementById('btn-gather-stone');
  if (btnGatherStone) btnGatherStone.addEventListener('click', gatherStone);
  const btnGatherBerries = document.getElementById('btn-gather-berries');
  if (btnGatherBerries) btnGatherBerries.addEventListener('click', gatherBerries);



  // Botones de ventas manuales unificadas
  const sellResourceSelect = document.getElementById('sell-resource-select');
  if (sellResourceSelect) {
    sellResourceSelect.addEventListener('change', updateSellResourcePriceDisplay);
  }
  const btnSell1 = document.getElementById('btn-sell-1');
  if (btnSell1) btnSell1.addEventListener('click', () => sellResourceManual(1));
  const btnSell10 = document.getElementById('btn-sell-10');
  if (btnSell10) btnSell10.addEventListener('click', () => sellResourceManual(10));
  const btnSell100 = document.getElementById('btn-sell-100');
  if (btnSell100) btnSell100.addEventListener('click', () => sellResourceManual(100));

  // Botones de compras manuales unificadas
  const buyResourceSelect = document.getElementById('buy-resource-select');
  if (buyResourceSelect) {
    buyResourceSelect.addEventListener('change', updateBuyResourcePriceDisplay);
  }
  const btnBuy1 = document.getElementById('btn-buy-1');
  if (btnBuy1) btnBuy1.addEventListener('click', () => buyResourceManual(1));
  const btnBuy10 = document.getElementById('btn-buy-10');
  if (btnBuy10) btnBuy10.addEventListener('click', () => buyResourceManual(10));
  const btnBuy100 = document.getElementById('btn-buy-100');
  if (btnBuy100) btnBuy100.addEventListener('click', () => buyResourceManual(100));


  // Botón desplegable del inventario de comida al pulsar en la tarjeta global
  const cardFood = document.getElementById('card-food');
  if (cardFood) {
    cardFood.addEventListener('click', toggleFoodDetails);
  }

  // Botón desplegable del inventario de recursos y semillas al pulsar en la tarjeta global
  const cardResources = document.getElementById('card-resources');
  if (cardResources) {
    cardResources.addEventListener('click', toggleResourcesDetails);
  }

  // Botones de subpestañas
  const subtabViviendas = document.getElementById('subtab-btn-viviendas');
  if (subtabViviendas) subtabViviendas.addEventListener('click', () => switchSubTab('viviendas'));
  const subtabAlimentos = document.getElementById('subtab-btn-alimentos');
  if (subtabAlimentos) subtabAlimentos.addEventListener('click', () => switchSubTab('alimentos'));
  const subtabProcesado = document.getElementById('subtab-btn-procesado');
  if (subtabProcesado) subtabProcesado.addEventListener('click', () => switchSubTab('procesado'));
  const subtabRecursos = document.getElementById('subtab-btn-recursos');
  if (subtabRecursos) subtabRecursos.addEventListener('click', () => switchSubTab('recursos'));
  
  const subtabColonistsHire = document.getElementById('subtab-btn-colonists-hire');
  if (subtabColonistsHire) subtabColonistsHire.addEventListener('click', () => switchColonistsSubTab('hire'));
  const subtabColonistsDetail = document.getElementById('subtab-btn-colonists-detail');
  if (subtabColonistsDetail) subtabColonistsDetail.addEventListener('click', () => switchColonistsSubTab('detail'));
  const subtabColonistsPriority = document.getElementById('subtab-btn-colonists-priority');
  if (subtabColonistsPriority) subtabColonistsPriority.addEventListener('click', () => switchColonistsSubTab('priority'));
  const subtabColonistsSummary = document.getElementById('subtab-btn-colonists-summary');
  if (subtabColonistsSummary) subtabColonistsSummary.addEventListener('click', () => switchColonistsSubTab('summary'));

  // Botones de construcción de edificios
  const btnBuildBasic = document.getElementById('btn-build-basic');
  if (btnBuildBasic) btnBuildBasic.addEventListener('click', buildBasicHouse);
  const btnBuildLumbermill = document.getElementById('btn-build-lumbermill');
  if (btnBuildLumbermill) btnBuildLumbermill.addEventListener('click', buildLumberMill);
  const btnBuildQuarry = document.getElementById('btn-build-quarry');
  if (btnBuildQuarry) btnBuildQuarry.addEventListener('click', buildQuarry);
  const btnBuildFarm = document.getElementById('btn-build-farm');
  if (btnBuildFarm) btnBuildFarm.addEventListener('click', buildFarm);
  const btnBuildBonfire = document.getElementById('btn-build-bonfire');
  if (btnBuildBonfire) btnBuildBonfire.addEventListener('click', buildBonfire);
  const btnBuildMarket = document.getElementById('btn-build-market');
  if (btnBuildMarket) btnBuildMarket.addEventListener('click', buildMarket);
  const btnBuildGranary = document.getElementById('btn-build-granary');
  if (btnBuildGranary) btnBuildGranary.addEventListener('click', buildGranary);

  // Liberar colonos

  const btnResetAssignments = document.getElementById('btn-reset-assignments');
  if (btnResetAssignments) btnResetAssignments.addEventListener('click', resetAllAssignments);
}

// Registro DOMContentLoaded para inicializar manejadores
document.addEventListener('DOMContentLoaded', initEventHandlers);

// ARREGLO DE ASIGNACIÓN (POR SEGURIDAD Y SINCRONIZACIÓN DESDE COLONISTAS)
function fixColonistAllocation() {
  if (!state.colonists) state.colonists = [];
  
  // Reconstruir contadores de trabajos básicos
  state.jobs.wood = state.colonists.filter(c => c.job === 'wood').length;
  state.jobs.stone = state.colonists.filter(c => c.job === 'stone').length;
  state.jobs.berries = state.colonists.filter(c => c.job === 'berries').length;
  
  // Reconstruir asignación del Ayuntamiento
  if (state.townHall) {
    state.townHall.workerAssigned = state.colonists.filter(c => c.job === 'townHall').length;
  }
  
  // Reconstruir asignación de cada tipo de edificio
  const buildingTypes = [
    { array: 'lumberMills', prefix: 'lumbermills' },
    { array: 'quarries', prefix: 'quarries' },
    { array: 'farms', prefix: 'farms' },
    { array: 'markets', prefix: 'markets' },
    { array: 'bonfires', prefix: 'bonfires' },
    { array: 'granaries', prefix: 'granaries' },
    { array: 'houses', prefix: 'houses' }
  ];
  
  buildingTypes.forEach(bt => {
    if (Array.isArray(state[bt.array])) {
      state[bt.array].forEach((b, idx) => {
        b.workerAssigned = state.colonists.filter(c => c.job === `${bt.prefix}_${idx}`).length;
      });
    }
  });

  if (typeof autoAssignBuilders === 'function') {
    autoAssignBuilders();
  }
}

function assignColonistToBuildingSlot(type, index, slotIdx, newColonistId) {
  const jobString = type === 'townHall' ? 'townHall' : `${type.toLowerCase()}_${index}`;
  const cid = newColonistId === "" ? null : parseInt(newColonistId);
  
  // Find currently assigned colonists to this jobString
  const assigned = state.colonists.filter(c => c.job === jobString);
  const currentOccupant = assigned[slotIdx] || null;
  
  if (cid === null) {
    if (currentOccupant) {
      currentOccupant.job = null;
      showToast("Aldeano retirado del puesto", "info");
    }
  } else {
    const targetCol = state.colonists.find(c => c.id === cid);
    if (!targetCol) return;
    
    targetCol.job = jobString;
    
    if (currentOccupant && currentOccupant.id !== cid) {
      currentOccupant.job = null;
    }
    
    showToast(`Aldeano ${targetCol.name} asignado al puesto`, "success");
  }
  
  fixColonistAllocation();
  recalculateRates();
  updateUI();
}

function assignBasicJobSlot(jobType, slotIdx, newColonistId) {
  const cid = newColonistId === "" ? null : parseInt(newColonistId);
  const assigned = state.colonists ? state.colonists.filter(c => c.job === jobType) : [];
  const currentOccupant = assigned[slotIdx] || null;

  if (cid === null) {
    if (currentOccupant) {
      currentOccupant.job = null;
      const jobName = jobType === 'wood' ? 'Leñador' : jobType === 'stone' ? 'Cantero' : 'Recolector de Frutos';
      showToast(`Aldeano retirado de ${jobName}`, "info");
    }
  } else {
    const targetCol = state.colonists.find(c => c.id === cid);
    if (!targetCol) return;
    
    targetCol.job = jobType;
    if (currentOccupant && currentOccupant.id !== cid) {
      currentOccupant.job = null;
    }
    const jobName = jobType === 'wood' ? 'Leñador' : jobType === 'stone' ? 'Cantero' : 'Recolector de Frutos';
    showToast(`Aldeano ${targetCol.name} asignado a ${jobName}`, "success");
  }

  fixColonistAllocation();
  recalculateRates();
  updateUI();
}

function changeColonistHouseDirectly(colonistId, newHouseIdxValue) {
  if (!state.colonists) return;
  const col = state.colonists.find(c => c.id === colonistId);
  if (!col) return;
  
  const finalHouseIdx = newHouseIdxValue === "" ? null : parseInt(newHouseIdxValue);
  const oldHouseIdx = col.houseIdx;
  
  if (finalHouseIdx === oldHouseIdx) return;
  
  if (finalHouseIdx !== null) {
    const house = state.houses[finalHouseIdx];
    if (!house) return;
    if (house.isUnderConstruction) {
      showToast("No puedes asignar aldeanos a una vivienda en construcción", "warning");
      updateUI();
      return;
    }
    
    const basicHouseCfg = CONFIG.Building && CONFIG.Building.basic_house;
    const cap1 = basicHouseCfg ? basicHouseCfg.yield_amount : 1;
    const upgradedHouseCfg = CONFIG.Building && CONFIG.Building.upgraded_house;
    const cap2 = cap1 + (upgradedHouseCfg ? upgradedHouseCfg.yield_amount : 1);
    const luxuryHouseCfg = CONFIG.Building && CONFIG.Building.luxury_house;
    const cap3 = cap2 + (luxuryHouseCfg ? luxuryHouseCfg.yield_amount : 2);
    const capacity = house.tier === 1 ? cap1 : (house.tier === 2 ? cap2 : cap3);
    const currentAssigned = state.colonists.filter(c => c.houseIdx === finalHouseIdx).length;
    
    if (currentAssigned >= capacity) {
      showToast("Esta vivienda ya está al límite de su capacidad", "warning");
      updateUI();
      return;
    }
  }
  
  col.houseIdx = finalHouseIdx;
  recalculateRates();
  updateUI();
  showToast(`Residencia de ${col.name} cambiada con éxito`, "success");
}

function assignColonistToHouseSlot(houseIdx, slotIdx, newColonistId) {
  const cid = newColonistId === "" ? null : parseInt(newColonistId);
  
  // Find currently assigned residents in this house
  const residents = state.colonists.filter(c => c.houseIdx === houseIdx);
  const currentOccupant = residents[slotIdx] || null;
  
  if (cid === null) {
    if (currentOccupant) {
      currentOccupant.houseIdx = null;
      showToast("Aldeano desalojado de la vivienda", "info");
    }
  } else {
    const targetCol = state.colonists.find(c => c.id === cid);
    if (!targetCol) return;
    
    targetCol.houseIdx = houseIdx;
    
    if (currentOccupant && currentOccupant.id !== cid) {
      currentOccupant.houseIdx = null;
    }
    
    showToast(`Aldeano ${targetCol.name} asignado a la vivienda`, "success");
  }
  
  recalculateRates();
  updateUI();
}

function togglePauseConstruction(type, index) {
  let building;
  if (type === 'townHall') {
    building = state.townHall;
  } else {
    const list = state[type];
    if (list && list[index]) {
      building = list[index];
    }
  }

  if (building && (building.isUnderConstruction || building.isUpgrading)) {
    building.isPaused = !building.isPaused;
    
    let bName = 'Edificio';
    if (type === 'townHall') {
      bName = 'Ayuntamiento';
    } else {
      const names = {
        houses: 'Choza/Vivienda',
        lumberMills: 'Aserradero',
        quarries: 'Cantera',
        farms: 'Granja',
        bonfires: 'Fogata',
        markets: 'Puesto de Mercado',
        granaries: 'Granero'
      };
      bName = `${names[type] || 'Edificio'} #${index + 1}`;
    }
    
    if (building.isPaused) {
      showToast(`Construcción de ${bName} pausada`, "info");
    } else {
      showToast(`Construcción de ${bName} reanudada`, "success");
    }

    if (typeof autoAssignBuilders === 'function') {
      autoAssignBuilders();
    }
    
    recalculateRates();
    updateUI();
  }
}

function rotateCandidatesPool() {
  const rotateCost = CONFIG.Sales && CONFIG.Sales.rotate_candidates ? CONFIG.Sales.rotate_candidates.cost_gold : 15;
  if (state.gold >= rotateCost) {
    state.gold -= rotateCost;
    state.candidates = [];
    replenishCandidates();
    state.hasHiredThisWeek = false;
    state.candidateRotationElapsed = 0;
    showToast("🔄 Pool de candidatos rotado con éxito", "success");
    recalculateRates();
    updateUI();
  } else {
    showToast("Oro insuficiente para rotar los candidatos", "warning");
  }
}

function dismissColonist(colonistId) {
  if (!state.colonists) return;
  const colIndex = state.colonists.findIndex(c => c.id === colonistId);
  if (colIndex === -1) return;
  
  const col = state.colonists[colIndex];
  const confirmMsg = `¿Estás seguro de que quieres despedir a ${col.name}? No recuperarás los recursos invertidos en su contratación, pero se liberará su espacio de vivienda y dejará de consumir comida.`;
  
  if (confirm(confirmMsg)) {
    // Eliminar de la lista de colonos
    state.colonists.splice(colIndex, 1);
    
    // Ejecutar sincronización de asignaciones de empleo y viviendas
    fixColonistAllocation();
    if (typeof initializeHousingAssignments === 'function') {
      initializeHousingAssignments();
    }
    
    // Recalcular tasas globales y actualizar la UI
    recalculateRates();
    updateUI();
    
    showToast(`El aldeano ${col.name} ha sido despedido con éxito`, "info");
  }
}

// INICIALIZACIÓN PRINCIPAL DEL JUEGO
window.onload = async function() {
  // Inicializar referencias DOM
  initDOMReferences();

  // 1. Cargar el progreso guardado de la partida
  loadGame();
  
  // 2. Cargar el balance de múltiples CSVs (data-loader)
  await initGameData(false);

  // Auto-guardado cada 10 segundos
  setInterval(saveGame, 10000);

  // Limpieza de colonos fantasmas por corrupción de datos
  fixColonistAllocation();
  if (typeof initializeHousingAssignments === 'function') {
    initializeHousingAssignments();
  }
  
  // Activar la pestaña guardada o por defecto
  switchTab(state.currentTab || 'basic');
  switchSubTab(state.currentSubTab || 'viviendas');
  switchColonistsSubTab(state.currentColonistsSubTab || 'hire');
  renderFoodPriorityList();
  recalculateRates();
};
