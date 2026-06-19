// ACCIONES DE RECOLECCIÓN MANUAL
function gatherWood() {
  if (state.gatherCooldown > 0) { showToast("Aún te estás recuperando...", "warning"); return; }
  state.gatherCooldown = 1.0;
  state.gatherType = 'wood';
  state.playerConstructing = null;
  showToast("Comenzando a recolectar madera...", "info");
  updateUI();
}

function gatherStone() {
  if (state.gatherCooldown > 0) { showToast("Aún te estás recuperando...", "warning"); return; }
  state.gatherCooldown = 1.0;
  state.gatherType = 'stone';
  state.playerConstructing = null;
  showToast("Comenzando a recolectar piedra...", "info");
  updateUI();
}

function gatherBerries() {
  if (state.gatherCooldown > 0) { showToast("Aún te estás recuperando...", "warning"); return; }
  state.gatherCooldown = 1.0;
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
    state.food += yieldVal;
    resourcesGeneratedThisSecond.food += yieldVal;
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
function sellCookedFood() {
  const sale = CONFIG.Sales.sell_cooked_manual;
  if (!sale) return;
  if (state.cookedFood >= sale.consume_amount) {
    state.cookedFood -= sale.consume_amount;
    state.gold += sale.yield;
    resourcesGeneratedThisSecond.gold += sale.yield;
    showToast(`¡Vendidas ${sale.consume_amount} unidades de Comida Cocinada por ${sale.yield}🪙!`, "success");
    updateUI();
  } else {
    showToast(`No tienes suficiente Comida Cocinada (Mín. ${sale.consume_amount})`, "warning");
  }
}

// CONFIGURACIÓN DE AUTO-VENTAS
function toggleAutoSell(type, checked) {
  if (type === 'food') state.autoSellFood = checked;
  if (type === 'cooked') state.autoSellCooked = checked;
  if (type === 'wood') state.autoSellWood = checked;
  if (type === 'stone') state.autoSellStone = checked;
  recalculateRates();
  updateUI();
}

// COMERCIO (VENTAS MANUALES)
function sellFood() {
  const sale = CONFIG.Sales.sell_food_manual;
  if (state.food >= sale.consume_amount) {
    state.food -= sale.consume_amount;
    state.gold += sale.yield;
    resourcesGeneratedThisSecond.gold += sale.yield;
    showToast(`¡Vendidas ${sale.consume_amount} unidades de Comida por ${sale.yield}🪙!`, "success");
    updateUI();
  } else {
    showToast(`No tienes suficiente Comida (Mín. ${sale.consume_amount})`, "warning");
  }
}

function sellWood() {
  const sale = CONFIG.Sales.sell_wood_manual;
  if (state.wood >= sale.consume_amount) {
    state.wood -= sale.consume_amount;
    state.gold += sale.yield;
    resourcesGeneratedThisSecond.gold += sale.yield;
    showToast(`¡Vendidas ${sale.consume_amount} unidades de Madera por ${sale.yield}🪙!`, "success");
    updateUI();
  } else {
    showToast(`No tienes suficiente Madera (Mín. ${sale.consume_amount})`, "warning");
  }
}

function sellStone() {
  const sale = CONFIG.Sales.sell_stone_manual;
  if (state.stone >= sale.consume_amount) {
    state.stone -= sale.consume_amount;
    state.gold += sale.yield;
    resourcesGeneratedThisSecond.gold += sale.yield;
    showToast(`¡Vendidas ${sale.consume_amount} unidades de Piedra por ${sale.yield}🪙!`, "success");
    updateUI();
  } else {
    showToast(`No tienes suficiente Piedra (Mín. ${sale.consume_amount})`, "warning");
  }
}

function changeAutoSellMin(type, val) {
  const value = Math.max(0, parseInt(val) || 0);
  if (type === 'food') state.autoSellFoodMin = value;
  if (type === 'cooked') state.autoSellCookedMin = value;
  if (type === 'wood') state.autoSellWoodMin = value;
  if (type === 'stone') state.autoSellStoneMin = value;
  recalculateRates();
  updateUI();
}

function toggleConsumeType(type, checked) {
  if (type === 'cooked') state.allowConsumeCooked = checked;
  else if (type === 'raw') state.allowConsumeRaw = checked;
  
  recalculateRates();
  updateUI();
  
  const label = type === 'cooked' ? 'Cocinada' : 'Cruda';
  showToast(`Consumo de Comida ${label} ${checked ? 'permitido' : 'prohibido'} para aldeanos`, "info");
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

  // Botones de ventas manuales
  const btnSellFood = document.getElementById('btn-sell-food');
  if (btnSellFood) btnSellFood.addEventListener('click', sellFood);
  const btnSellCooked = document.getElementById('btn-sell-cooked');
  if (btnSellCooked) btnSellCooked.addEventListener('click', sellCookedFood);
  const btnSellWood = document.getElementById('btn-sell-wood');
  if (btnSellWood) btnSellWood.addEventListener('click', sellWood);
  const btnSellStone = document.getElementById('btn-sell-stone');
  if (btnSellStone) btnSellStone.addEventListener('click', sellStone);

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

  // Mercado auto-venta checkboxes e inputs
  const sellFoodChk = document.getElementById('auto-sell-food-chk');
  if (sellFoodChk) sellFoodChk.addEventListener('change', (e) => toggleAutoSell('food', e.target.checked));
  const sellFoodMin = document.getElementById('auto-sell-food-min');
  if (sellFoodMin) sellFoodMin.addEventListener('change', (e) => changeAutoSellMin('food', e.target.value));

  const sellCookedChk = document.getElementById('auto-sell-cooked-chk');
  if (sellCookedChk) sellCookedChk.addEventListener('change', (e) => toggleAutoSell('cooked', e.target.checked));
  const sellCookedMin = document.getElementById('auto-sell-cooked-min');
  if (sellCookedMin) sellCookedMin.addEventListener('change', (e) => changeAutoSellMin('cooked', e.target.value));

  const sellWoodChk = document.getElementById('auto-sell-wood-chk');
  if (sellWoodChk) sellWoodChk.addEventListener('change', (e) => toggleAutoSell('wood', e.target.checked));
  const sellWoodMin = document.getElementById('auto-sell-wood-min');
  if (sellWoodMin) sellWoodMin.addEventListener('change', (e) => changeAutoSellMin('wood', e.target.value));

  const sellStoneChk = document.getElementById('auto-sell-stone-chk');
  if (sellStoneChk) sellStoneChk.addEventListener('change', (e) => toggleAutoSell('stone', e.target.checked));
  const sellStoneMin = document.getElementById('auto-sell-stone-min');
  if (sellStoneMin) sellStoneMin.addEventListener('change', (e) => changeAutoSellMin('stone', e.target.value));

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

  state.freeColonists = state.currentColonists - allocated;
  
  if (state.freeColonists < 0 || isNaN(state.freeColonists)) {
    state.jobs.wood = 0;
    state.jobs.stone = 0;
    state.jobs.berries = 0;
    state.lumberMills.forEach(b => b.workerAssigned = 0);
    state.quarries.forEach(b => b.workerAssigned = 0);
    state.farms.forEach(b => b.workerAssigned = 0);
    state.markets.forEach(b => b.workerAssigned = 0);
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
