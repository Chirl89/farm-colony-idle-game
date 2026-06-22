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

function hireColonist() {
  const cfg = CONFIG.Building.hire_colonist;
  if (state.currentColonists >= state.maxPopulation) {
    showToast("No hay suficiente espacio de vivienda. Construye chozas o mejora viviendas.", "warning");
    return;
  }
  if (state.gold >= cfg.cost_gold) {
    state.gold -= cfg.cost_gold;
    state.currentColonists += 1;
    state.freeColonists += 1;
    showToast("¡Aldeano contratado! Ya disponible para tareas.", "success");
    recalculateRates();
    updateUI();
  } else {
    showToast("Oro insuficiente para contratar un aldeano", "warning");
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
  const buttons = document.querySelectorAll('.subtab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const contents = document.querySelectorAll('.subtab-content');
  contents.forEach(content => content.classList.remove('active-subcontent'));
  
  const targetBtn = document.getElementById(`subtab-btn-${subTabId}`);
  if (targetBtn) targetBtn.classList.add('active');
  
  const targetContent = document.getElementById(`subtab-${subTabId}`);
  if (targetContent) targetContent.classList.add('active-subcontent');
  
  state.currentSubTab = subTabId;
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

  // Asignación de trabajos básicos
  const btnAssignWoodDec = document.getElementById('btn-assign-wood-dec');
  if (btnAssignWoodDec) btnAssignWoodDec.addEventListener('click', () => assignJob('wood', -1));
  const btnAssignWoodInc = document.getElementById('btn-assign-wood-inc');
  if (btnAssignWoodInc) btnAssignWoodInc.addEventListener('click', () => assignJob('wood', 1));

  const btnAssignStoneDec = document.getElementById('btn-assign-stone-dec');
  if (btnAssignStoneDec) btnAssignStoneDec.addEventListener('click', () => assignJob('stone', -1));
  const btnAssignStoneInc = document.getElementById('btn-assign-stone-inc');
  if (btnAssignStoneInc) btnAssignStoneInc.addEventListener('click', () => assignJob('stone', 1));

  const btnAssignBerriesDec = document.getElementById('btn-assign-berries-dec');
  if (btnAssignBerriesDec) btnAssignBerriesDec.addEventListener('click', () => assignJob('berries', -1));
  const btnAssignBerriesInc = document.getElementById('btn-assign-berries-inc');
  if (btnAssignBerriesInc) btnAssignBerriesInc.addEventListener('click', () => assignJob('berries', 1));

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

  // Contratar y liberar colonos
  const btnHireColonist = document.getElementById('btn-hire-colonist');
  if (btnHireColonist) btnHireColonist.addEventListener('click', hireColonist);

  const btnResetAssignments = document.getElementById('btn-reset-assignments');
  if (btnResetAssignments) btnResetAssignments.addEventListener('click', resetAllAssignments);
}

// Registro DOMContentLoaded para inicializar manejadores
document.addEventListener('DOMContentLoaded', initEventHandlers);

// ARREGLO DE ASIGNACIÓN (POR SEGURIDAD)
function fixColonistAllocation() {
  state.jobs.wood = Math.max(0, parseInt(state.jobs.wood) || 0);
  state.jobs.stone = Math.max(0, parseInt(state.jobs.stone) || 0);
  state.jobs.berries = Math.max(0, parseInt(state.jobs.berries) || 0);

  let allocated = state.jobs.wood + state.jobs.stone + state.jobs.berries;
  
  if (Array.isArray(state.lumberMills)) {
    state.lumberMills.forEach(b => allocated += (b.workerAssigned || 0));
  } else {
    state.lumberMills = [];
  }
  
  if (Array.isArray(state.quarries)) {
    state.quarries.forEach(b => allocated += (b.workerAssigned || 0));
  } else {
    state.quarries = [];
  }
  
  if (Array.isArray(state.farms)) {
    state.farms.forEach(b => allocated += (b.workerAssigned || 0));
  } else {
    state.farms = [];
  }
  
  if (Array.isArray(state.markets)) {
    state.markets.forEach(b => allocated += (b.workerAssigned || 0));
  } else {
    state.markets = [];
  }
  
  if (Array.isArray(state.bonfires)) {
    state.bonfires.forEach(b => allocated += (b.workerAssigned || 0));
  } else {
    state.bonfires = [];
  }

  if (Array.isArray(state.granaries)) {
    state.granaries.forEach(b => allocated += (b.workerAssigned || 0));
  } else {
    state.granaries = [];
  }

  state.freeColonists = state.currentColonists - allocated;
  
  if (state.freeColonists < 0 || isNaN(state.freeColonists)) {
    state.jobs.wood = 0;
    state.jobs.stone = 0;
    state.jobs.berries = 0;
    state.lumberMills.forEach(b => b.workerAssigned = 0);
    state.quarries.forEach(b => b.workerAssigned = 0);
    state.farms.forEach(b => b.workerAssigned = 0);
    state.markets.forEach(b => b.workerAssigned = 0);
    state.bonfires.forEach(b => b.workerAssigned = 0);
    state.granaries.forEach(b => b.workerAssigned = 0);
    state.freeColonists = state.currentColonists;
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
  
  // Activar la pestaña guardada o por defecto
  switchTab(state.currentTab || 'basic');
  switchSubTab(state.currentSubTab || 'viviendas');
  renderFoodPriorityList();
  recalculateRates();
};
