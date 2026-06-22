// FUNCIÓN DE TOASTS
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';
  
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);
  
  // Eliminar del DOM después de que termine la animación
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// CICLO INTERNO DEL JUEGO (CADA 100ms)
function updateCycleUI(dayDuration, nightDuration) {
  const panel = document.getElementById('time-cycle-panel');
  const label = document.getElementById('cycle-label');
  const timer = document.getElementById('cycle-timer');
  const fill = document.getElementById('cycle-progress-fill');
  if (!panel || !label || !timer || !fill) return;

  const isDay = state.timePhase === 'day';
  const maxTime = isDay ? dayDuration : nightDuration;
  const elapsed = state.phaseElapsed || 0;
  const pct = Math.min(100, (elapsed / maxTime) * 100);

  fill.style.width = `${pct}%`;

  // Calcular hora virtual del juego (pasos de 10 minutos)
  let timeString = '';
  if (isDay) {
    const totalMinutes = 14 * 60; // 14 horas de día (6:00 a 20:00)
    const m = (pct / 100) * totalMinutes;
    const m10 = Math.floor(m / 10) * 10;
    const totalMinutesFromMidnight = (6 * 60) + m10;
    const hours = Math.floor(totalMinutesFromMidnight / 60);
    const mins = totalMinutesFromMidnight % 60;
    const hoursStr = String(hours).padStart(2, '0');
    const minsStr = String(mins).padStart(2, '0');
    timeString = `${hoursStr}:${minsStr}`;
  } else {
    const totalMinutes = 10 * 60; // 10 horas de noche (20:00 a 6:00)
    const m = (pct / 100) * totalMinutes;
    const m10 = Math.floor(m / 10) * 10;
    let totalMinutesFromMidnight;
    if (m10 < 4 * 60) { // Antes de medianoche (20:00 a 24:00)
      totalMinutesFromMidnight = (20 * 60) + m10;
    } else { // Después de medianoche (00:00 a 6:00)
      totalMinutesFromMidnight = m10 - (4 * 60);
    }
    const hours = Math.floor(totalMinutesFromMidnight / 60);
    const mins = totalMinutesFromMidnight % 60;
    const hoursStr = String(hours).padStart(2, '0');
    const minsStr = String(mins).padStart(2, '0');
    timeString = `${hoursStr}:${minsStr}`;
  }

  if (isDay) {
    if (panel.classList.contains('cycle-mode-night')) {
      panel.classList.remove('cycle-mode-night');
      panel.classList.add('cycle-mode-day');
    }
    label.innerHTML = `☀️ Día ${state.currentDay || 1}`;
    timer.innerText = `Hora: ${timeString}`;
  } else {
    if (panel.classList.contains('cycle-mode-day')) {
      panel.classList.remove('cycle-mode-day');
      panel.classList.add('cycle-mode-night');
    }
    label.innerHTML = `🌙 Noche (Aldeanos Durmiendo...)`;
    timer.innerText = `Hora: ${timeString}`;
  }
}

// ACTUALIZACIONES DE UI DE PROGRESO Y BOTONES
// RENDERIZAR CAJITAS DE EDIFICIOS INDIVIDUALES
let lastLumberMillsConstructionStatus = '';
function renderLumberMills() {
  const container = document.getElementById('active-lumbermills-list');
  if (!container) return;
  const count = state.lumberMills ? state.lumberMills.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  const currentStatus = state.lumberMills ? state.lumberMills.map(m => m.isUnderConstruction ? '1' : '0').join(',') : '';
  if (container.children.length !== count || hasPlaceholder || count === 0 || currentStatus !== lastLumberMillsConstructionStatus) {
    lastLumberMillsConstructionStatus = currentStatus;
    if (count === 0) {
      if (!container.querySelector('.placeholder-text')) {
        container.innerHTML = `<div class="placeholder-text" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">Ningún Aserradero construido</div>`;
      }
      return;
    }
    let html = '';
    state.lumberMills.forEach((mill, idx) => {
      if (mill.isUnderConstruction) {
        html += `
          <div class="building-box" id="mill-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="mill-tier-badge-${idx}">Construyendo</div>
            <div class="building-box-header">
              <span class="building-box-title" id="mill-title-${idx}">🏗️ Cabaña de Leñador #${idx + 1} (En construcción)</span>
              <span class="building-box-prod" id="mill-prod-${idx}">En construcción</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="mill-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; gap: 0.5rem;">
              <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;" id="mill-btn-${idx}" onclick="togglePlayerConstruct('lumberMills', ${idx})">
                🔨 Iniciar Construcción
              </button>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('lumberMills', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="mill-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('lumberMills', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="building-box" id="mill-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="mill-tier-badge-${idx}">Tier ${mill.tier || 1}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="mill-title-${idx}">🪵 Cabaña de Leñador #${idx + 1}</span>
              <span class="building-box-prod" id="mill-prod-${idx}">0 Madera/día</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">Asignar aldeano:</span>
              <div class="colonist-allocator">
                <button class="allocator-btn" onclick="assignBuildingWorker('lumberMills', ${idx}, -1)">-</button>
                <span class="allocator-val" id="mill-alloc-${idx}">0</span>
                <button class="allocator-btn" onclick="assignBuildingWorker('lumberMills', ${idx}, 1)">+</button>
              </div>
            </div>
            <div style="margin-top: 0.4rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span id="mill-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel 1</span>
              <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="mill-upgrade-btn-${idx}" onclick="upgradeLumberMill(${idx})">
                Mejorar
              </button>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.lumberMills.forEach((mill, idx) => {
      if (mill.isUnderConstruction) {
        const pBar = document.getElementById(`mill-progress-${idx}`);
        const pct = Math.min(100, (mill.constructionElapsed / mill.constructionDuration) * 100);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const allocText = document.getElementById(`mill-alloc-${idx}`);
        if (allocText) allocText.innerText = `${mill.workerAssigned} / 2`;
        
        const btn = document.getElementById(`mill-btn-${idx}`);
        const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === 'lumberMills' && state.playerConstructing.index === idx;
        if (btn) {
          if (isPlayerOnIt) {
            btn.innerText = '🔨 Construyendo...';
            btn.className = 'btn btn-primary';
            btn.style.background = 'hsl(var(--color-primary))';
            btn.style.borderColor = 'hsl(var(--color-primary))';
          } else {
            btn.innerText = '🔨 Iniciar Construcción';
            btn.className = 'btn btn-secondary';
            btn.style.background = '';
            btn.style.borderColor = '';
          }
        }
      } else {
        const isWorking = mill.workerAssigned > 0;
        const tier = mill.tier || 1;
        const baseYield = CONFIG.ProductionRate.lumbermill_prod.yield;
        const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
        const eff = getWorkEfficiency();
        const yieldVal = baseYield * multiplier * mill.workerAssigned * eff;
        const displayYield = yieldVal.toFixed(yieldVal % 1 === 0 ? 0 : 1);
        
        const titleText = document.getElementById(`mill-title-${idx}`);
        const prodText = document.getElementById(`mill-prod-${idx}`);
        const allocText = document.getElementById(`mill-alloc-${idx}`);
        const tierBadge = document.getElementById(`mill-tier-badge-${idx}`);
        const tierText = document.getElementById(`mill-tier-text-${idx}`);
        const upgradeBtn = document.getElementById(`mill-upgrade-btn-${idx}`);
        
        let bName = tier === 1 ? 'Cabaña de Leñador' : (tier === 2 ? 'Aserradero' : 'Gremio de Leñadores');
        
        if (titleText) titleText.innerHTML = `🪵 ${bName} #${idx + 1}`;
        if (prodText) prodText.innerText = isWorking ? `+${displayYield} Madera/día` : '0 Madera/día';
        if (allocText) allocText.innerText = `${mill.workerAssigned} / ${tier}`;
        if (tierBadge) tierBadge.innerText = `Tier ${tier}`;
        if (tierText) tierText.innerText = `Nivel ${tier} (${bName})`;
        
        if (upgradeBtn) {
          if (tier === 1) {
            upgradeBtn.innerText = `Mejorar (🪙100, 🪵80, 🪨50)`;
            const canAfford = state.gold >= 100 && state.wood >= 80 && state.stone >= 50;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          } else if (tier === 2) {
            upgradeBtn.innerText = `Mejorar (🪙200, 🪵150, 🪨100)`;
            const canAfford = state.gold >= 200 && state.wood >= 150 && state.stone >= 100;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          } else {
            upgradeBtn.style.display = 'none';
          }
        }
      }
    });
  }
}

let lastQuarriesConstructionStatus = '';
function renderQuarries() {
  const container = document.getElementById('active-quarries-list');
  if (!container) return;
  const count = state.quarries ? state.quarries.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  const currentStatus = state.quarries ? state.quarries.map(q => q.isUnderConstruction ? '1' : '0').join(',') : '';
  if (container.children.length !== count || hasPlaceholder || count === 0 || currentStatus !== lastQuarriesConstructionStatus) {
    lastQuarriesConstructionStatus = currentStatus;
    if (count === 0) {
      if (!container.querySelector('.placeholder-text')) {
        container.innerHTML = `<div class="placeholder-text" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">Ninguna Cantera construida</div>`;
      }
      return;
    }
    let html = '';
    state.quarries.forEach((quarry, idx) => {
      if (quarry.isUnderConstruction) {
        html += `
          <div class="building-box" id="quarry-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="quarry-tier-badge-${idx}">Construyendo</div>
            <div class="building-box-header">
              <span class="building-box-title" id="quarry-title-${idx}">🏗️ Foso de Piedra #${idx + 1} (En construcción)</span>
              <span class="building-box-prod" id="quarry-prod-${idx}">En construcción</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="quarry-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; gap: 0.5rem;">
              <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;" id="quarry-btn-${idx}" onclick="togglePlayerConstruct('quarries', ${idx})">
                🔨 Iniciar Construcción
              </button>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('quarries', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="quarry-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('quarries', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="building-box" id="quarry-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="quarry-tier-badge-${idx}">Tier ${quarry.tier || 1}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="quarry-title-${idx}">🪨 Foso de Piedra #${idx + 1}</span>
              <span class="building-box-prod" id="quarry-prod-${idx}">0 Piedra/día</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">Asignar aldeano:</span>
              <div class="colonist-allocator">
                <button class="allocator-btn" onclick="assignBuildingWorker('quarries', ${idx}, -1)">-</button>
                <span class="allocator-val" id="quarry-alloc-${idx}">0</span>
                <button class="allocator-btn" onclick="assignBuildingWorker('quarries', ${idx}, 1)">+</button>
              </div>
            </div>
            <div style="margin-top: 0.4rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span id="quarry-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel 1</span>
              <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="quarry-upgrade-btn-${idx}" onclick="upgradeQuarry(${idx})">
                Mejorar
              </button>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.quarries.forEach((quarry, idx) => {
      if (quarry.isUnderConstruction) {
        const pBar = document.getElementById(`quarry-progress-${idx}`);
        const pct = Math.min(100, (quarry.constructionElapsed / quarry.constructionDuration) * 100);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const allocText = document.getElementById(`quarry-alloc-${idx}`);
        if (allocText) allocText.innerText = `${quarry.workerAssigned} / 2`;
        
        const btn = document.getElementById(`quarry-btn-${idx}`);
        const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === 'quarries' && state.playerConstructing.index === idx;
        if (btn) {
          if (isPlayerOnIt) {
            btn.innerText = '🔨 Construyendo...';
            btn.className = 'btn btn-primary';
            btn.style.background = 'hsl(var(--color-primary))';
            btn.style.borderColor = 'hsl(var(--color-primary))';
          } else {
            btn.innerText = '🔨 Iniciar Construcción';
            btn.className = 'btn btn-secondary';
            btn.style.background = '';
            btn.style.borderColor = '';
          }
        }
      } else {
        const isWorking = quarry.workerAssigned > 0;
        const tier = quarry.tier || 1;
        const baseYield = CONFIG.ProductionRate.quarry_prod.yield;
        const multiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.1 : 1.2);
        const eff = getWorkEfficiency();
        const yieldVal = baseYield * multiplier * quarry.workerAssigned * eff;
        const displayYield = yieldVal.toFixed(yieldVal % 1 === 0 ? 0 : 1);
        
        const titleText = document.getElementById(`quarry-title-${idx}`);
        const prodText = document.getElementById(`quarry-prod-${idx}`);
        const allocText = document.getElementById(`quarry-alloc-${idx}`);
        const tierBadge = document.getElementById(`quarry-tier-badge-${idx}`);
        const tierText = document.getElementById(`quarry-tier-text-${idx}`);
        const upgradeBtn = document.getElementById(`quarry-upgrade-btn-${idx}`);
        
        let bName = tier === 1 ? 'Foso de Piedra' : (tier === 2 ? 'Cantera' : 'Gran Mina de Piedra');
        
        if (titleText) titleText.innerHTML = `🪨 ${bName} #${idx + 1}`;
        if (prodText) prodText.innerText = isWorking ? `+${displayYield} Piedra/día` : '0 Piedra/día';
        if (allocText) allocText.innerText = `${quarry.workerAssigned} / ${tier}`;
        if (tierBadge) tierBadge.innerText = `Tier ${tier}`;
        if (tierText) tierText.innerText = `Nivel ${tier} (${bName})`;
        
        if (upgradeBtn) {
          if (tier === 1) {
            upgradeBtn.innerText = `Mejorar (🪙120, 🪵60, 🪨80)`;
            const canAfford = state.gold >= 120 && state.wood >= 60 && state.stone >= 80;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          } else if (tier === 2) {
            upgradeBtn.innerText = `Mejorar (🪙240, 🪵120, 🪨150)`;
            const canAfford = state.gold >= 240 && state.wood >= 120 && state.stone >= 150;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          } else {
            upgradeBtn.style.display = 'none';
          }
        }
      }
    });
  }
}

let lastFarmsConstructionStatus = '';
function renderFarms() {
  const container = document.getElementById('active-farms-list');
  if (!container) return;
  const count = state.farms ? state.farms.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  const currentStatus = state.farms ? state.farms.map(f => (f.isUnderConstruction ? '1' : '0') + '_' + f.stage + '_' + (f.needsWatering ? '1' : '0')).join(',') : '';
  if (container.children.length !== count || hasPlaceholder || count === 0 || currentStatus !== lastFarmsConstructionStatus) {
    lastFarmsConstructionStatus = currentStatus;
    if (count === 0) {
      if (!container.querySelector('.placeholder-text')) {
        container.innerHTML = `<div class="placeholder-text" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">Ninguna Granja construida</div>`;
      }
      return;
    }
    let html = '';
    state.farms.forEach((farm, idx) => {
      if (farm.isUnderConstruction) {
        html += `
          <div class="building-box" id="farm-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="farm-tier-badge-${idx}">Construyendo</div>
            <div class="building-box-header">
              <span class="building-box-title" id="farm-title-${idx}">🌾 Granja #${idx + 1} (En construcción)</span>
              <span class="building-box-prod" id="farm-prod-${idx}">En construcción</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="farm-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; gap: 0.5rem;">
              <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;" id="farm-btn-${idx}" onclick="togglePlayerConstruct('farms', ${idx})">
                🔨 Iniciar Construcción
              </button>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('farms', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="farm-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('farms', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        let cropsOptionsHtml = '';
        for (let key in CROPS) {
          const crop = CROPS[key];
          const isSelected = farm.crop === key ? 'selected' : '';
          const emoji = key === 'wheat' ? '🌾' : (key === 'potato' ? '🥔' : '🥕');
          cropsOptionsHtml += `<option value="${key}" ${isSelected}>${emoji} ${crop.name} (Costo: 1 Semilla, Duración: ${crop.duration} segundos, Rend: ${crop.yield} Comida)</option>`;
        }
        html += `
          <div class="building-box" id="farm-box-${idx}">
            <div class="building-box-header">
              <span class="building-box-title" id="farm-title-${idx}">🌾 Granja #${idx + 1}</span>
              <span class="building-box-prod" id="farm-prod-${idx}">0 Comida/día</span>
            </div>
            
              <div style="font-size: 0.7rem; color: var(--color-text-muted); display: flex; flex-direction: column; gap: 0.1rem; margin-top: 0.2rem;">
                <span style="font-weight: 500;">Siguiente cultivo:</span>
                <select class="crop-selector" style="width: 100%; font-size: 0.8rem; padding: 0.25rem; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; cursor: pointer; outline: none;" id="farm-select-${idx}" onchange="changeFarmCrop(${idx}, this.value)">
                  ${cropsOptionsHtml}
                </select>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.1rem;">
                <span id="farm-status-${idx}" style="font-size: 0.75rem; color: var(--color-text-muted);">Inactiva</span>
              </div>
              
              <div class="progress-bar-container" style="height: 6px; margin: 0.2rem 0;">
                <div class="progress-bar-fill" id="farm-progress-${idx}"></div>
              </div>
              
              <div style="font-size: 0.7rem; color: var(--color-text-muted); display: flex; justify-content: space-between; margin-top: 0.25rem;">
                <span>Progreso Global:</span>
                <span id="farm-global-pct-${idx}">0%</span>
              </div>
              <div class="progress-bar-container" style="height: 4px; margin: 0.1rem 0; background-color: rgba(255,255,255,0.05);">
                <div class="progress-bar-fill" id="farm-global-progress-${idx}" style="background: linear-gradient(90deg, #10b981 0%, #34d399 100%); width: 0%;"></div>
              </div>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
              <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.4rem 0.6rem;" id="farm-btn-${idx}" onclick="startFarmCycle(${idx})">
                Sembrar
              </button>
              
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('farms', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="farm-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('farms', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.farms.forEach((farm, idx) => {
      if (farm.isUnderConstruction) {
        const pBar = document.getElementById(`farm-progress-${idx}`);
        const pct = Math.min(100, (farm.constructionElapsed / farm.constructionDuration) * 100);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const allocText = document.getElementById(`farm-alloc-${idx}`);
        if (allocText) allocText.innerText = `${farm.workerAssigned} / 2`;
        
        const btn = document.getElementById(`farm-btn-${idx}`);
        const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === 'farms' && state.playerConstructing.index === idx;
        if (btn) {
          if (isPlayerOnIt) {
            btn.innerText = '🔨 Construyendo...';
            btn.className = 'btn btn-primary';
            btn.style.background = 'hsl(var(--color-primary))';
            btn.style.borderColor = 'hsl(var(--color-primary))';
          } else {
            btn.innerText = '🔨 Iniciar Construcción';
            btn.className = 'btn btn-secondary';
            btn.style.background = '';
            btn.style.borderColor = '';
          }
        }
      } else {
        const select = document.getElementById(`farm-select-${idx}`);
        if (select) {
          select.disabled = false;
        }
        
        const pBar = document.getElementById(`farm-progress-${idx}`);
        const btn = document.getElementById(`farm-btn-${idx}`);
        const statusText = document.getElementById(`farm-status-${idx}`);
        const allocText = document.getElementById(`farm-alloc-${idx}`);
        
        if (allocText) allocText.innerText = farm.workerAssigned;
        
        const crop = CROPS[farm.crop];
        const farmTier = farm.tier || 1;
        const tierMultiplier = farmTier === 3 ? 2.5 : (farmTier === 2 ? 1.5 : 1.0);
        
        const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
        const cycleDurationInDays = crop ? (getFarmCycleTotal(crop) / dayDuration) : 1;
        const rate = crop ? ((crop.yield * tierMultiplier) / cycleDurationInDays) : 0;
        const isWorking = farm.stage !== 'idle';
        const eff = getWorkEfficiency();
        const yieldVal = rate * eff;
        const displayYield = yieldVal.toFixed(yieldVal % 1 === 0 ? 0 : 1);
        const prodText = isWorking ? `+${displayYield} Comida/día` : '0 Comida/día';
        
        const farmProd = document.getElementById(`farm-prod-${idx}`);
        if (farmProd) farmProd.innerText = prodText;

        const activeCropObj = CROPS[farm.activeCrop || farm.crop] || CROPS.wheat;
        let stageName = '';
        let stageEmoji = '';
        let stageDuration = 0;
        let requiresWorker = false;
        let isNightGrow = false;

        const plowDur = (CONFIG.Timing && CONFIG.Timing.farm_plow) ? CONFIG.Timing.farm_plow.duration : 0.5;
        const sowDur = (CONFIG.Timing && CONFIG.Timing.farm_sow) ? CONFIG.Timing.farm_sow.duration : 0.5;
        const waterDur = (CONFIG.Timing && CONFIG.Timing.farm_water) ? CONFIG.Timing.farm_water.duration : 0.25;
        const growDur = activeCropObj ? (activeCropObj.duration / 2) : 1.5;

        switch (farm.stage) {
          case 'plow':
            stageName = 'Arando';
            stageEmoji = '🪵';
            stageDuration = plowDur;
            requiresWorker = true;
            break;
          case 'sow':
            stageName = 'Sembrando';
            stageEmoji = '🌱';
            stageDuration = sowDur;
            requiresWorker = true;
            break;
          case 'water':
            stageName = 'Regando';
            stageEmoji = '💧';
            stageDuration = waterDur;
            requiresWorker = true;
            break;
          case 'grow':
            stageName = 'Creciendo';
            stageEmoji = '🌿';
            stageDuration = growDur;
            requiresWorker = false;
            isNightGrow = true;
            break;
          case 'water2':
            stageName = 'Regando';
            stageEmoji = '💧';
            stageDuration = waterDur;
            requiresWorker = true;
            break;
          case 'grow2':
            stageName = 'Creciendo';
            stageEmoji = '🌿';
            stageDuration = growDur;
            requiresWorker = false;
            isNightGrow = true;
            break;
          default:
            stageName = 'Inactiva';
            stageEmoji = '';
            stageDuration = 0;
            requiresWorker = false;
        }

        if (farm.stage !== 'idle') {
          let pct = 0;
          let text = '';
          const waterDailyDur = (CONFIG.Timing && CONFIG.Timing.farm_water_daily) ? CONFIG.Timing.farm_water_daily.duration : 0.0417;
          
          if (farm.needsWatering) {
            pct = Math.min(100, ((farm.waterElapsed || 0) / waterDailyDur) * 100);
            const rem = Math.max(waterDailyDur - (farm.waterElapsed || 0), 0).toFixed(1);
            if (state.timePhase === 'night') {
              text = `💧 Regar (Pausado: Es de noche) (Faltan ${rem}s)`;
            } else if (farm.workerAssigned === 0) {
              text = `💧 Regar (Pausado: Asigna aldeano) (Faltan ${rem}s)`;
            } else {
              text = `💧 Regando (Faltan ${rem}s)`;
            }
          } else {
            pct = Math.min(100, ((farm.stageElapsed || 0) / stageDuration) * 100);
            const rem = Math.max(stageDuration - (farm.stageElapsed || 0), 0).toFixed(1);
            
            text = `${stageEmoji} ${stageName} (Faltan ${rem}s)`;
            if (isNightGrow && state.timePhase === 'night') {
              text = `🌙 Sigue creciendo de noche (${rem}s)`;
            } else if (requiresWorker && (state.timePhase === 'night' || farm.workerAssigned === 0)) {
              if (state.timePhase === 'night') {
                text = `${stageEmoji} ${stageName} (Pausado: Es de noche) (${rem}s)`;
              } else {
                text = `${stageEmoji} ${stageName} (Pausado: Asigna aldeano) (${rem}s)`;
              }
            }
          }
          
          if (pBar) pBar.style.width = `${pct}%`;
          if (statusText) statusText.innerText = `[${activeCropObj.name}] ${text}`;
          if (btn) {
            btn.innerText = 'Cultivando...';
            btn.disabled = true;
          }

          // Progreso Global (Activo)
          const globalPBar = document.getElementById(`farm-global-progress-${idx}`);
          const globalPctText = document.getElementById(`farm-global-pct-${idx}`);
          if (globalPBar || globalPctText) {
            const totalDur = getFarmCycleTotal(crop);
            const elapsedDur = getFarmCycleElapsed(farm, crop);
            const globalPct = Math.min(100, (elapsedDur / totalDur) * 100);
            if (globalPBar) globalPBar.style.width = `${globalPct}%`;
            if (globalPctText) globalPctText.innerText = `${globalPct.toFixed(0)}%`;
          }
        } else {
          if (pBar) pBar.style.width = `0%`;
          if (statusText) statusText.innerText = 'Inactiva';
          if (btn) {
            btn.innerText = 'Cultivar';
            btn.disabled = state.gold < (crop ? crop.cost : 0);
          }

          // Progreso Global (Inactivo)
          const globalPBar = document.getElementById(`farm-global-progress-${idx}`);
          const globalPctText = document.getElementById(`farm-global-pct-${idx}`);
          if (globalPBar) globalPBar.style.width = `0%`;
          if (globalPctText) globalPctText.innerText = `0%`;
        }
      }
    });
  }
}

let lastHousesConstructionStatus = '';
function renderHouses() {
  const container = document.getElementById('active-houses-list');
  if (!container) return;
  const count = state.houses ? state.houses.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  const currentStatus = state.houses ? state.houses.map(h => (h.isUnderConstruction ? '1' : '0') + '_' + (h.isUpgrading ? '1' : '0') + '_' + h.tier).join(',') : '';
  if (container.children.length !== count || hasPlaceholder || count === 0 || currentStatus !== lastHousesConstructionStatus) {
    lastHousesConstructionStatus = currentStatus;
    if (count === 0) {
      if (!container.querySelector('.placeholder-text')) {
        container.innerHTML = `<div class="placeholder-text" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">Ninguna vivienda construida</div>`;
      }
      return;
    }
    let html = '';
    state.houses.forEach((house, idx) => {
      if (house.isUnderConstruction || house.isUpgrading) {
        const badgeText = house.isUpgrading ? 'Mejorando' : 'Construyendo';
        const titleText = house.isUpgrading ? 
          (house.upgradingToTier === 2 ? `🏗️ Cabaña #${idx + 1} (Mejorando...)` : `🏗️ Casa Grande #${idx + 1} (Mejorando...)`) : 
          `🏗️ Choza #${idx + 1} (En construcción)`;
        const prodText = house.isUpgrading ? 'Mejorando...' : 'En construcción';
        
        html += `
          <div class="building-box" id="house-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="house-tier-badge-${idx}">${badgeText}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="house-title-${idx}">${titleText}</span>
              <span class="building-box-prod" id="house-prod-${idx}">${prodText}</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="house-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; gap: 0.5rem;">
              <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;" id="house-btn-${idx}" onclick="togglePlayerConstruct('houses', ${idx})">
                🔨 Iniciar Construcción
              </button>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('houses', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="house-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('houses', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="building-box" id="house-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="house-tier-badge-${idx}">Tier ${house.tier}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="house-title-${idx}">🏠 Choza #${idx + 1}</span>
              <span class="building-box-prod" id="house-prod-${idx}">+1 Capacidad</span>
            </div>
            
            <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
              <span id="house-tier-text-${idx}" style="font-size: 0.75rem; color: #a5b4fc; font-weight: 500;">Nivel 1 (Choza)</span>
              <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="house-upgrade-btn-${idx}" onclick="upgradeHouseItem(${idx})">
                Mejorar
              </button>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.houses.forEach((house, idx) => {
      if (house.isUnderConstruction || house.isUpgrading) {
        const pBar = document.getElementById(`house-progress-${idx}`);
        const pct = Math.min(100, (house.constructionElapsed / house.constructionDuration) * 100);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const allocText = document.getElementById(`house-alloc-${idx}`);
        if (allocText) allocText.innerText = `${house.workerAssigned || 0} / 2`;
        
        const btn = document.getElementById(`house-btn-${idx}`);
        const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === 'houses' && state.playerConstructing.index === idx;
        if (btn) {
          if (isPlayerOnIt) {
            btn.innerText = '🔨 Construyendo...';
            btn.className = 'btn btn-primary';
            btn.style.background = 'hsl(var(--color-primary))';
            btn.style.borderColor = 'hsl(var(--color-primary))';
          } else {
            btn.innerText = '🔨 Iniciar Construcción';
            btn.className = 'btn btn-secondary';
            btn.style.background = '';
            btn.style.borderColor = '';
          }
        }
      } else {
        const titleText = document.getElementById(`house-title-${idx}`);
        const prodText = document.getElementById(`house-prod-${idx}`);
        const tierText = document.getElementById(`house-tier-text-${idx}`);
        const upgradeBtn = document.getElementById(`house-upgrade-btn-${idx}`);
        const tierBadge = document.getElementById(`house-tier-badge-${idx}`);
        
        const hUpgraded = CONFIG.Building.upgraded_house;
        
        if (house.tier === 1) {
          if (titleText) titleText.innerHTML = `🏠 Choza #${idx + 1}`;
          if (prodText) prodText.innerText = `+1 Capacidad`;
          if (tierText) tierText.innerText = `Nivel 1 (Choza)`;
          if (tierBadge) tierBadge.innerText = `Tier 1`;
          if (upgradeBtn) {
            upgradeBtn.innerText = `Mejorar (🪵${hUpgraded.cost_wood}, 🪨${hUpgraded.cost_stone})`;
            const canAfford = state.wood >= hUpgraded.cost_wood && state.stone >= hUpgraded.cost_stone;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          }
        } else if (house.tier === 2) {
          if (titleText) titleText.innerHTML = `🏘️ Cabaña #${idx + 1}`;
          if (prodText) prodText.innerText = `+2 Capacidad`;
          if (tierText) tierText.innerText = `Nivel 2 (Cabaña)`;
          if (tierBadge) tierBadge.innerText = `Tier 2`;
          if (upgradeBtn) {
            upgradeBtn.innerText = `Mejorar (🪙50, 🪵80, 🪨60)`;
            const canAfford = state.gold >= 50 && state.wood >= 80 && state.stone >= 60;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          }
        } else {
          if (titleText) titleText.innerHTML = `🏰 Casa Grande #${idx + 1}`;
          if (prodText) prodText.innerText = `+4 Capacidad`;
          if (tierText) tierText.innerText = `Nivel 3 (Casa Grande)`;
          if (tierBadge) tierBadge.innerText = `Tier 3`;
          if (upgradeBtn) {
            upgradeBtn.style.display = 'none';
          }
        }
      }
    });
  }
}

let lastBonfiresConstructionStatus = '';
function renderBonfires() {
  const container = document.getElementById('active-bonfires-list');
  if (!container) return;
  const count = state.bonfires ? state.bonfires.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  const currentStatus = state.bonfires ? state.bonfires.map(b => b.isUnderConstruction ? '1' : '0').join(',') : '';
  if (container.children.length !== count || hasPlaceholder || count === 0 || currentStatus !== lastBonfiresConstructionStatus) {
    lastBonfiresConstructionStatus = currentStatus;
    if (count === 0) {
      if (!container.querySelector('.placeholder-text')) {
        container.innerHTML = `<div class="placeholder-text" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">Ninguna Fogata construida</div>`;
      }
      return;
    }
    let html = '';
    state.bonfires.forEach((bonfire, idx) => {
      if (bonfire.isUnderConstruction) {
        html += `
          <div class="building-box" id="bonfire-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="bonfire-tier-badge-${idx}">Construyendo</div>
            <div class="building-box-header">
              <span class="building-box-title" id="bonfire-title-${idx}">🏗️ Fogata #${idx + 1} (En construcción)</span>
              <span class="building-box-prod" id="bonfire-status-${idx}">En construcción</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="bonfire-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; gap: 0.5rem;">
              <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;" id="bonfire-construct-btn-${idx}" onclick="togglePlayerConstruct('bonfires', ${idx})">
                🔨 Iniciar Construcción
              </button>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('bonfires', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="bonfire-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('bonfires', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        const recipe = bonfire.selectedRecipe || 'wheat';
        html += `
          <div class="building-box" id="bonfire-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="bonfire-tier-badge-${idx}">Tier ${bonfire.tier || 1}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="bonfire-title-${idx}">🔥 Fogata #${idx + 1}</span>
              <span class="building-box-prod" id="bonfire-status-${idx}">Inactiva</span>
            </div>
            
            <div class="progress-bar-container" style="height: 6px; margin: 0.2rem 0;">
              <div class="progress-bar-fill" id="bonfire-progress-${idx}" style="background: linear-gradient(90deg, hsl(20, 90%, 60%) 0%, #f97316 100%);"></div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.4rem; margin-bottom: 0.4rem;">
              <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">Receta seleccionada:</span>
              <select id="bonfire-recipe-${idx}" onchange="changeBonfireRecipe(${idx}, this.value)" style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; padding: 0.25rem; font-family: var(--font-primary); font-size: 0.75rem; outline: none; cursor: pointer;">
                <option value="wheat" ${recipe === 'wheat' ? 'selected' : ''}>🍞 Trigo -> Pan</option>
                <option value="potato" ${recipe === 'potato' ? 'selected' : ''}>🥔 Patata -> Patata Asada</option>
                <option value="carrot" ${recipe === 'carrot' ? 'selected' : ''}>🥕 Zanahoria -> Zanahoria Asada</option>
                <option value="berries" ${recipe === 'berries' ? 'selected' : ''}>🍯 Frutos -> Mermelada</option>
              </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
              <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.4rem 0.6rem;" id="bonfire-btn-${idx}" onclick="cookManually(${idx})">
                Cocinar Manual
              </button>
              
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('bonfires', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="bonfire-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('bonfires', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>

            <div style="margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
              <span id="bonfire-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel 1 (Fogata)</span>
              <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="bonfire-upgrade-btn-${idx}" onclick="upgradeBonfire(${idx})">
                Mejorar
              </button>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.bonfires.forEach((bonfire, idx) => {
      if (bonfire.isUnderConstruction) {
        const pBar = document.getElementById(`bonfire-progress-${idx}`);
        const pct = Math.min(100, (bonfire.constructionElapsed / bonfire.constructionDuration) * 100);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const allocText = document.getElementById(`bonfire-alloc-${idx}`);
        if (allocText) allocText.innerText = `${bonfire.workerAssigned} / 2`;
        
        const btn = document.getElementById(`bonfire-construct-btn-${idx}`);
        const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === 'bonfires' && state.playerConstructing.index === idx;
        if (btn) {
          if (isPlayerOnIt) {
            btn.innerText = '🔨 Construyendo...';
            btn.className = 'btn btn-primary';
            btn.style.background = 'hsl(var(--color-primary))';
            btn.style.borderColor = 'hsl(var(--color-primary))';
          } else {
            btn.innerText = '🔨 Iniciar Construcción';
            btn.className = 'btn btn-secondary';
            btn.style.background = '';
            btn.style.borderColor = '';
          }
        }
      } else {
        const pBar = document.getElementById(`bonfire-progress-${idx}`);
        const btn = document.getElementById(`bonfire-btn-${idx}`);
        const statusText = document.getElementById(`bonfire-status-${idx}`);
        const allocText = document.getElementById(`bonfire-alloc-${idx}`);
        const titleText = document.getElementById(`bonfire-title-${idx}`);
        const tierText = document.getElementById(`bonfire-tier-text-${idx}`);
        const upgradeBtn = document.getElementById(`bonfire-upgrade-btn-${idx}`);
        const tierBadge = document.getElementById(`bonfire-tier-badge-${idx}`);
        const recipeSelect = document.getElementById(`bonfire-recipe-${idx}`);
        
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

        let bName = bonfire.tier === 1 ? 'Fogata' : (bonfire.tier === 2 ? 'Caldero' : 'Cocina de Taberna');
        if (titleText) titleText.innerHTML = `🔥 ${bName} #${idx + 1}`;
        if (tierText) tierText.innerText = `Nivel ${bonfire.tier || 1} (${bName})`;
        if (tierBadge) tierBadge.innerText = `Tier ${bonfire.tier || 1}`;

        if (upgradeBtn) {
          if (bonfire.tier === 1) {
            upgradeBtn.innerText = `Mejorar (🪙50, 🪨30)`;
            const canAfford = state.gold >= 50 && state.stone >= 30;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          } else if (bonfire.tier === 2) {
            upgradeBtn.innerText = `Mejorar (🪙100, 🪵50)`;
            const canAfford = state.gold >= 100 && state.wood >= 50;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          } else {
            upgradeBtn.style.display = 'none';
          }
        }

        const recipe = bonfire.selectedRecipe || 'wheat';
        if (recipeSelect) {
          if (document.activeElement !== recipeSelect && recipeSelect.value !== recipe) {
            recipeSelect.value = recipe;
          }
          recipeSelect.disabled = bonfire.isRunning;
        }

        const minFood = autoRec ? autoRec.consume_amount : 1;
        if (allocText) allocText.innerText = `${bonfire.workerAssigned} / ${bonfire.tier || 1}`;
        if (btn) btn.disabled = bonfire.isRunning || (state[recipe] || 0) < minFood;

        if (bonfire.isRunning) {
          const targetDuration = bonfire.mode === 'manual' ? manualRec.duration : autoRec.duration;
          const pct = Math.min(100, (bonfire.elapsed / targetDuration) * 100);
          if (pBar) pBar.style.width = `${pct}%`;
          const rem = Math.max(targetDuration - bonfire.elapsed, 0).toFixed(0);
          if (statusText) statusText.innerText = `Cocinando (Faltan ${rem}s)`;
        } else {
          if (pBar) pBar.style.width = `0%`;
          const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos' };
          const ingredientName = rawNames[recipe] || recipe;
          if (statusText) statusText.innerText = bonfire.workerAssigned > 0 ? `Esperando ${ingredientName} (Mín. ${minFood})...` : 'Inactiva';
        }
      }
    });
  }
}

let lastGranariesConstructionStatus = '';
function renderGranaries() {
  const container = document.getElementById('active-granaries-list');
  if (!container) return;
  const count = state.granaries ? state.granaries.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  const currentStatus = state.granaries ? state.granaries.map(g => g.isUnderConstruction ? '1' : '0').join(',') : '';
  if (container.children.length !== count || hasPlaceholder || count === 0 || currentStatus !== lastGranariesConstructionStatus) {
    lastGranariesConstructionStatus = currentStatus;
    if (count === 0) {
      if (!container.querySelector('.placeholder-text')) {
        container.innerHTML = `<div class="placeholder-text" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">Ningún Granero construido</div>`;
      }
      return;
    }
    let html = '';
    state.granaries.forEach((granary, idx) => {
      if (granary.isUnderConstruction) {
        html += `
          <div class="building-box" id="granary-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="granary-tier-badge-${idx}">Construyendo</div>
            <div class="building-box-header">
              <span class="building-box-title" id="granary-title-${idx}">🏗️ Granero #${idx + 1} (En construcción)</span>
              <span class="building-box-prod" id="granary-status-${idx}">En construcción</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="granary-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; gap: 0.5rem;">
              <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;" id="granary-construct-btn-${idx}" onclick="togglePlayerConstruct('granaries', ${idx})">
                🔨 Iniciar Construcción
              </button>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('granaries', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="granary-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('granaries', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        const crop = granary.selectedCrop || 'wheat';
        html += `
          <div class="building-box" id="granary-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="granary-tier-badge-${idx}">Tier ${granary.tier || 1}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="granary-title-${idx}">🌾 Granero #${idx + 1}</span>
              <span class="building-box-prod" id="granary-status-${idx}">Inactivo</span>
            </div>
            
            <div class="progress-bar-container" style="height: 6px; margin: 0.2rem 0;">
              <div class="progress-bar-fill" id="granary-progress-${idx}" style="background: linear-gradient(90deg, #10b981 0%, #059669 100%);"></div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.4rem; margin-bottom: 0.4rem;">
              <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">Cultivo seleccionado:</span>
              <select id="granary-crop-${idx}" onchange="changeGranaryRecipe(${idx}, this.value)" style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; padding: 0.25rem; font-family: var(--font-primary); font-size: 0.75rem; outline: none; cursor: pointer;">
                <option value="wheat" ${crop === 'wheat' ? 'selected' : ''}>🌾 Trigo -> Semillas Trigo</option>
                <option value="potato" ${crop === 'potato' ? 'selected' : ''}>🥔 Patata -> Semillas Patata</option>
                <option value="carrot" ${crop === 'carrot' ? 'selected' : ''}>🥕 Zanahoria -> Semillas Zanahoria</option>
              </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
              <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.4rem 0.6rem;" id="granary-btn-${idx}" onclick="processGranaryManually(${idx})">
                Procesar Manual
              </button>
              
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('granaries', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="granary-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('granaries', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>

            <div style="margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
              <span id="granary-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel 1 (Granero)</span>
              <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="granary-upgrade-btn-${idx}" onclick="upgradeGranary(${idx})">
                Mejorar
              </button>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.granaries.forEach((granary, idx) => {
      if (granary.isUnderConstruction || granary.isUpgrading) {
        const isUpgrading = granary.isUpgrading;
        const duration = granary.constructionDuration || 5;
        const pct = Math.min(100, (granary.constructionElapsed / duration) * 100);
        
        const pBar = document.getElementById(`granary-progress-${idx}`);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const allocText = document.getElementById(`granary-alloc-${idx}`);
        if (allocText) allocText.innerText = `${granary.workerAssigned} / 2`;
        
        const statusText = document.getElementById(`granary-status-${idx}`);
        if (statusText) statusText.innerText = isUpgrading ? `Mejorando a Tier ${granary.upgradingToTier || 2} (${pct.toFixed(0)}%)` : `Construyendo (${pct.toFixed(0)}%)`;
        
        const titleText = document.getElementById(`granary-title-${idx}`);
        if (titleText) {
          titleText.innerHTML = isUpgrading ? `🏗️ Granero #${idx + 1} (Mejorando...)` : `🏗️ Granero #${idx + 1} (En construcción)`;
        }
        
        const btn = document.getElementById(`granary-construct-btn-${idx}`);
        const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === 'granaries' && state.playerConstructing.index === idx;
        if (btn) {
          if (isPlayerOnIt) {
            btn.innerText = '🔨 Construyendo...';
            btn.className = 'btn btn-primary';
            btn.style.background = 'hsl(var(--color-primary))';
            btn.style.borderColor = 'hsl(var(--color-primary))';
          } else {
            btn.innerText = '🔨 Iniciar Construcción';
            btn.className = 'btn btn-secondary';
            btn.style.background = '';
            btn.style.borderColor = '';
          }
        }
      } else {
        const pBar = document.getElementById(`granary-progress-${idx}`);
        const btn = document.getElementById(`granary-btn-${idx}`);
        const statusText = document.getElementById(`granary-status-${idx}`);
        const allocText = document.getElementById(`granary-alloc-${idx}`);
        const titleText = document.getElementById(`granary-title-${idx}`);
        const tierText = document.getElementById(`granary-tier-text-${idx}`);
        const upgradeBtn = document.getElementById(`granary-upgrade-btn-${idx}`);
        const tierBadge = document.getElementById(`granary-tier-badge-${idx}`);
        const cropSelect = document.getElementById(`granary-crop-${idx}`);
        
        const cropKey = granary.selectedCrop || 'wheat';
        const tier = granary.tier || 1;
        const recipeKey = `granary_${cropKey}_t${tier}`;
        const recipe = CONFIG.Processing && CONFIG.Processing[recipeKey];
        
        let bName = tier === 1 ? 'Granero' : (tier === 2 ? 'Mejorar Granero T2' : 'Mejorar Granero T3');
        bName = tier === 1 ? 'Granero T1' : (tier === 2 ? 'Granero T2' : 'Granero T3');
        if (titleText) titleText.innerHTML = `🌾 ${bName} #${idx + 1}`;
        if (tierText) tierText.innerText = `Nivel ${tier} (${bName})`;
        if (tierBadge) tierBadge.innerText = `Tier ${tier}`;
        
        if (upgradeBtn) {
          if (tier === 1) {
            upgradeBtn.innerText = `Mejorar (🪙80, 🪵80, 🪨50)`;
            const canAfford = state.gold >= 80 && state.wood >= 80 && state.stone >= 50;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          } else if (tier === 2) {
            upgradeBtn.innerText = `Mejorar (🪙150, 🪵120, 🪨80)`;
            const canAfford = state.gold >= 150 && state.wood >= 120 && state.stone >= 80;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          } else {
            upgradeBtn.style.display = 'none';
          }
        }
        
        if (cropSelect) {
          if (document.activeElement !== cropSelect && cropSelect.value !== cropKey) {
            cropSelect.value = cropKey;
          }
          cropSelect.disabled = granary.isRunning;
        }
        
        const minFood = recipe ? recipe.consume_amount : 5;
        if (allocText) allocText.innerText = `${granary.workerAssigned} / ${tier}`;
        if (btn) btn.disabled = granary.isRunning || (state[cropKey] || 0) < minFood;
        
        if (granary.isRunning) {
          const targetDuration = recipe ? recipe.duration : 3.0;
          const pct = Math.min(100, (granary.elapsed / targetDuration) * 100);
          if (pBar) pBar.style.width = `${pct}%`;
          const rem = Math.max(targetDuration - granary.elapsed, 0).toFixed(0);
          if (statusText) statusText.innerText = `Procesando (Faltan ${rem}s)`;
        } else {
          if (pBar) pBar.style.width = `0%`;
          const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
          const ingredientName = rawNames[cropKey] || cropKey;
          if (statusText) statusText.innerText = granary.workerAssigned > 0 ? `Esperando ${ingredientName} (Mín. ${minFood})...` : 'Inactivo';
        }
      }
    });
  }
}

let lastMarketUIBuilt = null;
let lastMarketUIUnderConst = null;

function renderMarketBuildingUI() {
  const container = document.getElementById('market-building-ui-container');
  if (!container) return;

  const count = state.markets ? state.markets.length : 0;
  const built = count > 0 && !state.markets[0].isUnderConstruction;
  const underConst = count > 0 && state.markets[0].isUnderConstruction;

  // Render container if state changed
  if (lastMarketUIBuilt !== built || lastMarketUIUnderConst !== underConst || container.children.length === 0) {
    lastMarketUIBuilt = built;
    lastMarketUIUnderConst = underConst;

    let html = '';
    if (count === 0) {
      const cfg = CONFIG.Building.market || { cost_wood: 60, cost_stone: 50 };
      html = `
        <div class="building-item" style="border: none; background: none; padding: 0;">
          <div class="building-info">
            <span class="building-desc">Habilita el Comercio Automatizado para comprar y vender recursos de forma inteligente con mercaderes.</span>
            <div class="costs-list" style="margin-top: 0.5rem;">
              <span class="cost-badge" id="cost-market-wood">🪵 ${cfg.cost_wood} Madera</span>
              <span class="cost-badge" id="cost-market-stone">🪨 ${cfg.cost_stone} Piedra</span>
            </div>
          </div>
          <button class="btn btn-secondary" style="width: 100%; margin-top: 1rem; background: hsl(var(--color-primary)); color: #fff; border-color: hsl(var(--color-primary));" id="btn-build-market" onclick="buildMarket()">
            🔨 Construir Puesto de Mercado
          </button>
        </div>
      `;
    } else if (underConst) {
      html = `
        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          <span style="font-size: 0.85rem; color: var(--color-text-muted);">Construyendo el Puesto de Mercado para habilitar el comercio.</span>
          <div class="progress-bar-container" style="height: 10px; margin: 0.5rem 0; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; width: 100%;">
            <div class="progress-bar-fill" id="market-build-progress-bar" style="height: 100%; background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%); transition: width 0.1s ease-out; width: 0%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <span id="market-build-progress-text" style="font-size: 0.8rem; color: var(--color-text-muted);">Progreso: 0%</span>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">Constructores:</span>
              <div class="colonist-allocator">
                <button class="allocator-btn" onclick="assignBuildingWorker('markets', 0, -1)">-</button>
                <span class="allocator-val" id="market-build-alloc">0</span>
                <button class="allocator-btn" onclick="assignBuildingWorker('markets', 0, 1)">+</button>
              </div>
            </div>
            <button class="btn" id="btn-construct-market" onclick="togglePlayerConstruct('markets', 0)" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
              Iniciar Construcción
            </button>
          </div>
        </div>
      `;
    } else {
      html = `
        <div style="display: flex; align-items: center; gap: 0.75rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.75rem 1rem; border-radius: 8px;">
          <span style="font-size: 1.5rem;">✅</span>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.9rem; font-weight: 700; color: #34d399;">Edificio Construido y Operativo</span>
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">El Puesto de Mercado está activo. Puedes gestionar mercaderes y automatización desde la pestaña de <strong>Comercio</strong>.</span>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  // Update dynamic values
  if (count === 0) {
    const costMarketWood = document.getElementById('cost-market-wood');
    const costMarketStone = document.getElementById('cost-market-stone');
    const cfg = CONFIG.Building.market || { cost_wood: 60, cost_stone: 50 };
    toggleCostAffordability(costMarketWood, state.wood, cfg.cost_wood);
    toggleCostAffordability(costMarketStone, state.stone, cfg.cost_stone);
    
    const btnBuild = document.getElementById('btn-build-market');
    if (btnBuild) {
      btnBuild.disabled = !(state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone);
    }
  } else if (underConst) {
    const market = state.markets[0];
    const duration = market.constructionDuration || 5;
    const pct = Math.min(100, (market.constructionElapsed / duration) * 100);

    const pBar = document.getElementById('market-build-progress-bar');
    if (pBar) pBar.style.width = `${pct}%`;

    const pText = document.getElementById('market-build-progress-text');
    if (pText) pText.innerText = `Progreso: ${pct.toFixed(0)}%`;

    const allocVal = document.getElementById('market-build-alloc');
    if (allocVal) allocVal.innerText = `${market.workerAssigned || 0} / 2`;

    const isPlayerOnMarket = state.playerConstructing && state.playerConstructing.type === 'markets' && state.playerConstructing.index === 0;
    const btn = document.getElementById('btn-construct-market');
    if (btn) {
      if (isPlayerOnMarket) {
        btn.innerText = '🔨 Construyendo...';
        btn.className = 'btn btn-primary';
        btn.style.background = 'hsl(var(--color-primary))';
        btn.style.borderColor = 'hsl(var(--color-primary))';
      } else {
        btn.innerText = '🔨 Iniciar Construcción';
        btn.className = 'btn btn-secondary';
        btn.style.background = '';
        btn.style.borderColor = '';
      }
    }
  }
}

// Actualizar visualización de tasas de recursos
function updateRatesUI() {
  function formatRate(value) {
    const rateVal = value;
    if (rateVal > 0.001) {
      return `+${rateVal.toFixed(0)}/d`;
    } else if (rateVal < -0.001) {
      return `${rateVal.toFixed(0)}/d`;
    } else {
      return `+0/d`;
    }
  }

  if (DOM.rateGold) {
    DOM.rateGold.textContent = formatRate(calculatedRates.gold);
    DOM.rateGold.className = (calculatedRates.gold > 0.001) ? 'resource-rate rate-positive' : 'resource-rate rate-neutral';
  }

  if (DOM.rateWood) {
    DOM.rateWood.textContent = formatRate(calculatedRates.wood);
    DOM.rateWood.className = (calculatedRates.wood > 0.001) ? 'resource-rate rate-positive' : 'resource-rate rate-neutral';
  }

  if (DOM.rateStone) {
    DOM.rateStone.textContent = formatRate(calculatedRates.stone);
    DOM.rateStone.className = (calculatedRates.stone > 0.001) ? 'resource-rate rate-positive' : 'resource-rate rate-neutral';
  }

  DOM.rateFood.textContent = formatRate(calculatedRates.food);
  if (calculatedRates.food > 0.001) {
    DOM.rateFood.className = 'resource-rate rate-positive';
  } else if (calculatedRates.food < -0.001) {
    DOM.rateFood.className = 'resource-rate rate-negative';
  } else {
    DOM.rateFood.className = 'resource-rate rate-neutral';
  }

  if (DOM.rateCooked) {
    DOM.rateCooked.textContent = formatRate(calculatedRates.cooked);
    if (calculatedRates.cooked > 0.001) {
      DOM.rateCooked.className = 'resource-rate rate-positive';
    } else if (calculatedRates.cooked < -0.001) {
      DOM.rateCooked.className = 'resource-rate rate-negative';
    } else {
      DOM.rateCooked.className = 'resource-rate rate-neutral';
    }
  }
}

// Actualiza variables numéricas de recursos
function updateUI() {
  renderDetailedFoodInventory();
  renderDetailedResourcesInventory();
  DOM.resGold.textContent = Math.floor(state.gold);
  if (DOM.resWood) DOM.resWood.textContent = Math.floor(state.wood);
  if (DOM.resStone) DOM.resStone.textContent = Math.floor(state.stone);
  DOM.resFood.textContent = Math.floor(state.food);
  if (DOM.resCooked) DOM.resCooked.textContent = Math.floor(state.cookedFood || 0);
  if (DOM.resWheat) DOM.resWheat.textContent = Math.floor(state.wheat || 0);
  if (DOM.resPotato) DOM.resPotato.textContent = Math.floor(state.potato || 0);
  if (DOM.resCarrot) DOM.resCarrot.textContent = Math.floor(state.carrot || 0);
  if (DOM.resBerries) DOM.resBerries.textContent = Math.floor(state.berries || 0);
  if (state.starvingColonists > 0) {
    DOM.resColonists.innerHTML = `${state.currentColonists} / ${state.maxPopulation} <span style="font-size: 0.8rem; color: #f87171; font-weight: bold; margin-left: 0.25rem;">(⚠️${state.starvingColonists})</span>`;
  } else {
    DOM.resColonists.textContent = `${state.currentColonists} / ${state.maxPopulation}`;
  }
  DOM.resFreeColonists.textContent = `Libres: ${state.freeColonists}`;

  // Actualizar tarjeta de Alimentación
  const starvingVal = document.getElementById('starving-count-val');
  if (starvingVal) starvingVal.textContent = state.starvingColonists || 0;
  
  const effVal = document.getElementById('colony-efficiency-val');
  if (effVal) {
    const effPercent = (getWorkEfficiency() * 100).toFixed(0);
    effVal.textContent = `${effPercent}%`;
    effVal.style.color = getWorkEfficiency() === 1 ? '#4ade80' : (getWorkEfficiency() > 0.5 ? '#facc15' : '#f87171');
  }

  // Asignación de leñadores/mineros/foragers
  DOM.allocWood.textContent = state.jobs.wood;
  DOM.allocStone.textContent = state.jobs.stone;
  DOM.allocBerries.textContent = state.jobs.berries;
  
  const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;

  const woodDuration = CONFIG.BasicGathering.wood_auto.duration;
  const woodYield = CONFIG.BasicGathering.wood_auto.yield;
  DOM.woodAutoInfo.textContent = `+${(state.jobs.wood * (woodYield / (woodDuration / dayDuration))).toFixed(0)}/d`;
  
  const stoneDuration = CONFIG.BasicGathering.stone_auto.duration;
  const stoneYield = CONFIG.BasicGathering.stone_auto.yield;
  DOM.stoneAutoInfo.textContent = `+${(state.jobs.stone * (stoneYield / (stoneDuration / dayDuration))).toFixed(0)}/d`;

  const berriesDuration = CONFIG.BasicGathering.berries_auto.duration;
  const berriesYield = CONFIG.BasicGathering.berries_auto.yield;
  DOM.berriesAutoInfo.textContent = `+${(state.jobs.berries * (berriesYield / (berriesDuration / dayDuration))).toFixed(0)}/d`;

  // Renderizar y actualizar los edificios individuales en tab-production
  renderHouses();
  renderLumberMills();
  renderQuarries();
  renderFarms();
  renderBonfires();
  renderGranaries();
  renderMarketBuildingUI();

  // Viviendas construidas
  if (DOM.countBasicHouses) DOM.countBasicHouses.textContent = `Construidas: ${state.basicHouses}`;

  // Contadores en Construcción
  document.getElementById('count-lumbermills').innerText = `Construidos: ${state.lumberMills.length}`;
  document.getElementById('count-quarries').innerText = `Construidas: ${state.quarries.length}`;
  document.getElementById('count-farms').innerText = `Construidas: ${state.farms ? state.farms.length : 0}`;
  if (DOM.countBonfires) DOM.countBonfires.innerText = `Construidas: ${state.bonfires ? state.bonfires.length : 0}`;
  document.getElementById('count-markets').innerText = `Construidos: ${state.markets ? state.markets.length : 0}`;
  if (DOM.countGranaries) DOM.countGranaries.innerText = `Construidos: ${state.granaries ? state.granaries.length : 0}`;

  // Sincronizar inputs de auto-venta en Comercio y controlar visibilidad
  const marketLockedMsg = document.getElementById('market-locked-msg');
  const marketActiveHeader = document.getElementById('market-active-header-card');
  const marketActiveTables = document.getElementById('market-active-tables');
  
  const countMarkets = state.markets ? state.markets.length : 0;
  const isMarketBuilt = countMarkets > 0 && !state.markets[0].isUnderConstruction;
  
  if (isMarketBuilt) {
    if (marketLockedMsg) marketLockedMsg.style.display = 'none';
    if (marketActiveHeader) marketActiveHeader.style.display = 'flex';
    if (marketActiveTables) marketActiveTables.style.display = 'grid';
    
    renderAutoSellSettings();
    renderAutoBuySettings();
    
    // Sincronizar indicadores globales del Mercado en Comercio
    const anyActive = state.markets.some(m => m.workerAssigned > 0);
    const indicator = document.getElementById('market-indicator');
    const statusText = document.getElementById('market-status-text');
    const globalProgressBar = document.getElementById('market-progress');
    
    if (indicator) {
      if (anyActive) indicator.classList.add('active');
      else indicator.classList.remove('active');
    }
    if (statusText) {
      statusText.innerText = anyActive ? 'Operando' : 'Sin Mercader';
    }
    if (globalProgressBar) {
      const runningMarket = state.markets.find(m => m.isRunning);
      if (runningMarket) {
        const pct = Math.min(100, (runningMarket.elapsed / runningMarket.targetDuration) * 100);
        globalProgressBar.style.width = `${pct}%`;
      } else {
        globalProgressBar.style.width = anyActive ? '100%' : '0%';
      }
    }
  } else {
    if (marketLockedMsg) marketLockedMsg.style.display = 'block';
    if (marketActiveHeader) marketActiveHeader.style.display = 'none';
    if (marketActiveTables) marketActiveTables.style.display = 'none';
  }

  // Sincronizar el asignador de mercaderes del Commerce tab
  const allocMarket = document.getElementById('alloc-market');
  if (allocMarket) {
    allocMarket.textContent = state.markets && state.markets[0] ? (state.markets[0].workerAssigned || 0) : 0;
  }

  // Actualizar estadísticas de colonos y desglose de trabajos
  if (DOM.statsFreeColonists) DOM.statsFreeColonists.textContent = state.freeColonists;
  if (DOM.statsTotalColonists) DOM.statsTotalColonists.textContent = `${state.currentColonists} / ${state.maxPopulation}`;
  if (DOM.jobStatWood) DOM.jobStatWood.textContent = state.jobs.wood;
  if (DOM.jobStatStone) DOM.jobStatStone.textContent = state.jobs.stone;
  if (DOM.jobStatBerries) DOM.jobStatBerries.textContent = state.jobs.berries;
  
  if (DOM.jobStatPlots) DOM.jobStatPlots.textContent = state.farms ? state.farms.reduce((sum, f) => sum + (f.workerAssigned || 0), 0) : 0;
  if (DOM.jobStatLumberMill) DOM.jobStatLumberMill.textContent = state.lumberMills.reduce((sum, l) => sum + (l.workerAssigned || 0), 0);
  if (DOM.jobStatQuarry) DOM.jobStatQuarry.textContent = state.quarries.reduce((sum, q) => sum + (q.workerAssigned || 0), 0);
  if (DOM.jobStatBonfire) DOM.jobStatBonfire.textContent = state.bonfires ? state.bonfires.reduce((sum, b) => sum + (b.workerAssigned || 0), 0) : 0;
  if (DOM.jobStatMarket) DOM.jobStatMarket.textContent = state.markets ? state.markets.reduce((sum, m) => sum + (m.workerAssigned || 0), 0) : 0;
  if (DOM.jobStatGranary) DOM.jobStatGranary.textContent = state.granaries ? state.granaries.reduce((sum, g) => sum + (g.workerAssigned || 0), 0) : 0;

  renderTownHallUI();
  updateButtonStates();
}

function renderTownHallUI() {
  const container = document.getElementById('townhall-ui-container');
  if (!container) return;
  
  const built = state.townHall.built;
  const tier = state.townHall.tier;
  const underConst = state.townHall.isUnderConstruction;
  const upgrading = state.townHall.isUpgrading;
  
  if (lastRenderedTownHallBuilt === built && lastRenderedTownHallTier === tier && lastRenderedTownHallUnderConst === underConst && lastRenderedTownHallUpgrading === upgrading) {
    if (underConst || upgrading) {
      const pBar = document.getElementById('townhall-progress-bar');
      const duration = state.townHall.constructionDuration || 1;
      const pct = Math.min(100, ((state.townHall.constructionElapsed || 0) / duration) * 100);
      if (pBar) pBar.style.width = `${pct}%`;
      const pText = document.getElementById('townhall-progress-text');
      if (pText) pText.innerText = `Progreso: ${pct.toFixed(0)}%`;
      
      const allocVal = document.getElementById('townhall-alloc');
      if (allocVal) allocVal.innerText = `${state.townHall.workerAssigned || 0} / 2`;
      
      const isPlayerOnTH = state.playerConstructing && state.playerConstructing.type === 'townHall';
      const btn = document.getElementById('btn-construct-townhall');
      if (btn) {
        if (isPlayerOnTH) {
          btn.innerText = '🔨 Construyendo...';
          btn.className = 'btn btn-primary';
          btn.style.background = 'hsl(var(--color-primary))';
          btn.style.borderColor = 'hsl(var(--color-primary))';
        } else {
          btn.innerText = '🔨 Iniciar Construcción';
          btn.className = 'btn btn-secondary';
          btn.style.background = '';
          btn.style.borderColor = '';
        }
      }
    }
    return;
  }
  
  lastRenderedTownHallBuilt = built;
  lastRenderedTownHallTier = tier;
  lastRenderedTownHallUnderConst = underConst;
  lastRenderedTownHallUpgrading = upgrading;
  
  const cfg = CONFIG.Building.townhall;
  const cfg_t2 = CONFIG.Building.townhall_t2;
  const cfg_t3 = CONFIG.Building.townhall_t3;
  
  if (!state.townHall.built) {
    container.innerHTML = `
      <div class="building-item" style="border: 1px dashed #f87171; background: rgba(239, 68, 68, 0.05); padding: 1rem; border-radius: 8px;">
        <div class="building-info">
          <span class="building-name" style="font-size: 1.1rem; font-weight: 700; color: #f87171;">Ayuntamiento (No Construido)</span>
          <span class="building-desc" style="margin-top: 0.25rem;">Establece el centro administrativo de tu asentamiento. Permite desbloquear y construir otros edificios.</span>
          <div class="costs-list" style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <span class="cost-badge" id="cost-townhall-wood">🪵 ${cfg.cost_wood} Madera</span>
            <span class="cost-badge" id="cost-townhall-stone">🪨 ${cfg.cost_stone} Piedra</span>
          </div>
          <div style="margin-top: 0.75rem; color: #f87171; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem;">
            <span>⚠️ Debes construir el Ayuntamiento antes de construir cualquier otra cosa.</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
          <button class="btn btn-secondary" id="btn-build-townhall" onclick="buildTownHall()" style="background: hsl(var(--color-primary)); color: #fff; border-color: hsl(var(--color-primary));">
            Construir Ayuntamiento
          </button>
        </div>
      </div>
    `;
  } else if (state.townHall.isUnderConstruction || state.townHall.isUpgrading) {
    const pct = Math.min(100, ((state.townHall.constructionElapsed || 0) / (state.townHall.constructionDuration || 1)) * 100);
    const isPlayerOnTH = state.playerConstructing && state.playerConstructing.type === 'townHall';
    const titleText = state.townHall.isUpgrading ? 
      `Ayuntamiento (Mejorando a Nivel ${state.townHall.upgradingToTier})` : 
      `Ayuntamiento (En construcción)`;
    
    container.innerHTML = `
      <div class="building-item" style="border: 1px dashed #3b82f6; background: rgba(59, 130, 246, 0.05); padding: 1rem; border-radius: 8px;">
        <div class="building-info" style="width: 100%;">
          <span class="building-name" style="font-size: 1.1rem; font-weight: 700; color: #60a5fa;">${titleText}</span>
          <span class="building-desc" style="margin-top: 0.25rem;">
            ${state.townHall.isUpgrading ? `Mejorando la sede administrativa de la colonia.` : `Se está construyendo la sede central de tu villa.`}
          </span>
          <div class="progress-bar-container" style="height: 10px; margin: 0.75rem 0; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; width: 100%;">
            <div class="progress-bar-fill" id="townhall-progress-bar" style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%); transition: width 0.1s ease-out;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <span id="townhall-progress-text" style="font-size: 0.8rem; color: var(--color-text-muted);">Progreso: ${pct.toFixed(0)}%</span>
            
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.8rem; color: var(--color-text-muted);">Aldeanos:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignTownHallWorker(-1)">-</button>
                  <span class="allocator-val" id="townhall-alloc">${state.townHall.workerAssigned || 0}</span>
                  <button class="allocator-btn" onclick="assignTownHallWorker(1)">+</button>
                </div>
              </div>
              
              <button class="btn ${isPlayerOnTH ? 'btn-primary' : 'btn-secondary'}" id="btn-construct-townhall" onclick="togglePlayerConstruct('townHall')" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; ${isPlayerOnTH ? 'background: hsl(var(--color-primary)); border-color: hsl(var(--color-primary)); color: #fff;' : ''}">
                ${isPlayerOnTH ? '🔨 Construyendo...' : '🔨 Iniciar Construcción'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    const tier = state.townHall.tier;
    let costsHtml = '';
    let buttonHtml = '';
    
    if (tier === 1) {
      costsHtml = `
        <div class="costs-list" style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
          <span class="cost-badge" id="cost-townhall-upgrade-wood">🪵 ${cfg_t2.cost_wood} Madera</span>
          <span class="cost-badge" id="cost-townhall-upgrade-stone">🪨 ${cfg_t2.cost_stone} Piedra</span>
        </div>
      `;
      buttonHtml = `
        <button class="btn btn-secondary" id="btn-upgrade-townhall" onclick="upgradeTownHall()">
          Mejorar a Nivel 2
        </button>
      `;
    } else if (tier === 2) {
      costsHtml = `
        <div class="costs-list" style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
          <span class="cost-badge" id="cost-townhall-upgrade-gold">🪙 ${cfg_t3.cost_gold} Oro</span>
          <span class="cost-badge" id="cost-townhall-upgrade-wood">🪵 ${cfg_t3.cost_wood} Madera</span>
          <span class="cost-badge" id="cost-townhall-upgrade-stone">🪨 ${cfg_t3.cost_stone} Piedra</span>
        </div>
      `;
      buttonHtml = `
        <button class="btn btn-secondary" id="btn-upgrade-townhall" onclick="upgradeTownHall()">
          Mejorar a Nivel 3
        </button>
      `;
    } else {
      costsHtml = `
        <span style="font-size: 0.8rem; color: var(--color-success); font-weight: 600; margin-top: 0.25rem;">¡Nivel Máximo alcanzado!</span>
      `;
    }
    
    container.innerHTML = `
      <div class="building-item" style="border: 1px solid var(--border-color); background: rgba(165, 180, 252, 0.05); padding: 1rem; border-radius: 8px;">
        <div class="building-info">
          <span class="building-name" style="font-size: 1.1rem; font-weight: 700; color: #a5b4fc;">Ayuntamiento (Nivel ${tier})</span>
          <span class="building-desc" style="margin-top: 0.25rem;">Desbloquea construcciones hasta Tier ${state.maxBuildingTier}.</span>
          ${costsHtml}
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
          ${buttonHtml}
        </div>
      </div>
    `;
  }
}

// Controla habilitado/deshabilitado de botones
function updateButtonStates() {
  const hBasic = CONFIG.Building.basic_house;
  const hUpgraded = CONFIG.Building.upgraded_house;
  const bLumber = CONFIG.Building.lumbermill;
  const bQuarry = CONFIG.Building.quarry;
  const bFarm = CONFIG.Building.farm;
  const bMarket = CONFIG.Building.market;
  const bBonfire = CONFIG.Building.bonfire;
  const bHire = CONFIG.Building.hire_colonist;
  const bGranary = CONFIG.Building.granary;

  // Costos básicos colores visuales
  toggleCostAffordability(DOM.costBasicWood, state.wood, hBasic.cost_wood);
  toggleCostAffordability(DOM.costBasicStone, state.stone, hBasic.cost_stone);
  toggleCostAffordability(DOM.costHireGold, state.gold, bHire.cost_gold);

  // Costos edificios de producción
  toggleCostAffordability(document.getElementById('cost-lumbermill-gold'), state.gold, bLumber.cost_gold);
  toggleCostAffordability(document.getElementById('cost-lumbermill-stone'), state.stone, bLumber.cost_stone);
  toggleCostAffordability(document.getElementById('cost-quarry-gold'), state.gold, bQuarry.cost_gold);
  toggleCostAffordability(document.getElementById('cost-quarry-wood'), state.wood, bQuarry.cost_wood);
  toggleCostAffordability(document.getElementById('cost-farm-wood'), state.wood, bFarm.cost_wood);
  toggleCostAffordability(document.getElementById('cost-farm-stone'), state.stone, bFarm.cost_stone);
  toggleCostAffordability(DOM.costBonfireWood, state.wood, bBonfire.cost_wood);
  toggleCostAffordability(DOM.costBonfireStone, state.stone, bBonfire.cost_stone);
  toggleCostAffordability(document.getElementById('cost-market-wood'), state.wood, bMarket.cost_wood);
  toggleCostAffordability(document.getElementById('cost-market-stone'), state.stone, bMarket.cost_stone);
  toggleCostAffordability(DOM.costGranaryWood, state.wood, bGranary.cost_wood);
  toggleCostAffordability(DOM.costGranaryStone, state.stone, bGranary.cost_stone);

  // Costos de Ayuntamiento visuales
  if (!state.townHall.built) {
    const costTownHallWood = document.getElementById('cost-townhall-wood');
    const costTownHallStone = document.getElementById('cost-townhall-stone');
    const cfg = CONFIG.Building.townhall;
    toggleCostAffordability(costTownHallWood, state.wood, cfg.cost_wood);
    toggleCostAffordability(costTownHallStone, state.stone, cfg.cost_stone);
    
    const btnBuildTownhall = document.getElementById('btn-build-townhall');
    if (btnBuildTownhall) btnBuildTownhall.disabled = !(state.wood >= cfg.cost_wood && state.stone >= cfg.cost_stone);
  } else {
    const tier = state.townHall.tier;
    if (tier === 1) {
      const cfg_t2 = CONFIG.Building.townhall_t2;
      toggleCostAffordability(document.getElementById('cost-townhall-upgrade-wood'), state.wood, cfg_t2.cost_wood);
      toggleCostAffordability(document.getElementById('cost-townhall-upgrade-stone'), state.stone, cfg_t2.cost_stone);
      
      const btnUpgradeTownhall = document.getElementById('btn-upgrade-townhall');
      if (btnUpgradeTownhall) btnUpgradeTownhall.disabled = !(state.wood >= cfg_t2.cost_wood && state.stone >= cfg_t2.cost_stone);
    } else if (tier === 2) {
      const cfg_t3 = CONFIG.Building.townhall_t3;
      toggleCostAffordability(document.getElementById('cost-townhall-upgrade-gold'), state.gold, cfg_t3.cost_gold);
      toggleCostAffordability(document.getElementById('cost-townhall-upgrade-wood'), state.wood, cfg_t3.cost_wood);
      toggleCostAffordability(document.getElementById('cost-townhall-upgrade-stone'), state.stone, cfg_t3.cost_stone);
      
      const btnUpgradeTownhall = document.getElementById('btn-upgrade-townhall');
      if (btnUpgradeTownhall) btnUpgradeTownhall.disabled = !(state.gold >= cfg_t3.cost_gold && state.wood >= cfg_t3.cost_wood && state.stone >= cfg_t3.cost_stone);
    }
  }

  // Botones comprar construcciones
  const thBuilt = state.townHall.built && !state.townHall.isUnderConstruction;
  DOM.btnBuildBasic.disabled = !thBuilt || !(state.wood >= hBasic.cost_wood && state.stone >= hBasic.cost_stone);
  DOM.btnBuildLumberMill.disabled = !thBuilt || !(state.gold >= bLumber.cost_gold && state.stone >= bLumber.cost_stone);
  DOM.btnBuildQuarry.disabled = !thBuilt || !(state.gold >= bQuarry.cost_gold && state.wood >= bQuarry.cost_wood);
  
  const btnBuildFarm = document.getElementById('btn-build-farm');
  if (btnBuildFarm) btnBuildFarm.disabled = !thBuilt || !(state.wood >= bFarm.cost_wood && state.stone >= bFarm.cost_stone);

  DOM.btnBuildBonfire.disabled = !thBuilt || !(state.wood >= bBonfire.cost_wood && state.stone >= bBonfire.cost_stone);
  const btnBuildMarket = document.getElementById('btn-build-market');
  if (btnBuildMarket) {
    btnBuildMarket.disabled = !thBuilt || !(state.wood >= bMarket.cost_wood && state.stone >= bMarket.cost_stone);
  }
  if (DOM.btnBuildGranary) {
    DOM.btnBuildGranary.disabled = !thBuilt || !(state.wood >= bGranary.cost_wood && state.stone >= bGranary.cost_stone);
  }

  // Botón contratar colono (Condición: colonos actuales < maxPopulation)
  const spaceAvailable = state.currentColonists < state.maxPopulation;
  DOM.btnHireColonist.disabled = !(spaceAvailable && state.gold >= bHire.cost_gold);

  // Marketplace - Ventas manuales unificadas habilitadas según stock
  if (CONFIG && CONFIG.Sales) {
    const selectEl = document.getElementById('sell-resource-select');
    if (selectEl) {
      const type = selectEl.value;
      const saleRule = CONFIG.Sales[`sell_${type}_manual`];
      if (saleRule) {
        const consumeUnit = saleRule.consume_amount;
        const currentStock = getResourceStock(type);
        
        const btnSell1 = document.getElementById('btn-sell-1');
        if (btnSell1) btnSell1.disabled = currentStock < (1 * consumeUnit);
        
        const btnSell10 = document.getElementById('btn-sell-10');
        if (btnSell10) btnSell10.disabled = currentStock < (10 * consumeUnit);
        
        const btnSell100 = document.getElementById('btn-sell-100');
        if (btnSell100) btnSell100.disabled = currentStock < (100 * consumeUnit);
      }
    }
  }

  // Marketplace - Compras manuales unificadas habilitadas según oro
  if (CONFIG && CONFIG.Sales) {
    const buySelectEl = document.getElementById('buy-resource-select');
    if (buySelectEl) {
      const type = buySelectEl.value;
      const buyRule = CONFIG.Sales[`buy_${type}`];
      if (buyRule) {
        const costPerUnit = buyRule.cost_gold || 0;
        
        const btnBuy1 = document.getElementById('btn-buy-1');
        if (btnBuy1) btnBuy1.disabled = state.gold < (1 * costPerUnit);
        
        const btnBuy10 = document.getElementById('btn-buy-10');
        if (btnBuy10) btnBuy10.disabled = state.gold < (10 * costPerUnit);
        
        const btnBuy100 = document.getElementById('btn-buy-100');
        if (btnBuy100) btnBuy100.disabled = state.gold < (100 * costPerUnit);
      }
    }
  }

  // Ocultar mercado si ya se ha construido uno
  const marketCard = document.getElementById('build-market-card');
  if (marketCard) {
    if (state.markets && state.markets.length >= 1) {
      marketCard.style.display = 'none';
    } else {
      marketCard.style.display = 'flex';
    }
  }

  // Habilitar/Deshabilitar pestaña de Comercio
  const hasMarket = state.markets && state.markets.length >= 1;
  const salesTabBtn = document.getElementById('tab-btn-sales');
  if (salesTabBtn) {
    if (!hasMarket) {
      salesTabBtn.classList.add('tab-btn-locked');
      salesTabBtn.setAttribute('title', 'Requiere un Puesto de Mercado para comerciar');
      if (state.currentTab === 'sales') {
        switchTab('basic');
      }
    } else {
      salesTabBtn.classList.remove('tab-btn-locked');
      salesTabBtn.removeAttribute('title');
    }
  }

  // Cooldown de Recolección Manual (Global)
  const cooldown = state.gatherCooldown || 0;
  const keys = ['wood', 'stone', 'berries'];
  const emojis = { wood: '🪵', stone: '🪨', berries: '🍓' };
  const labels = { wood: 'Madera', stone: 'Piedra', berries: 'Frutos' };
  const dDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
  const nDuration = CONFIG.Timing && CONFIG.Timing.night_duration ? CONFIG.Timing.night_duration.duration : 20.0;
  const maxCooldown = CONFIG.Timing && CONFIG.Timing.gather_cooldown ? CONFIG.Timing.gather_cooldown.duration : 2.0;
  
  keys.forEach(k => {
    const btn = document.getElementById(`btn-gather-${k}`);
    const container = document.getElementById(`gather-cooldown-container-${k}`);
    const bar = document.getElementById(`gather-cooldown-bar-${k}`);
    
    if (cooldown > 0) {
      if (btn) {
        btn.disabled = true;
        const secs = Math.ceil(cooldown);
        btn.innerHTML = `⏳ ${secs}s`;
      }
      if (container) container.style.display = 'block';
      if (bar) {
        const pct = ((maxCooldown - cooldown) / maxCooldown) * 100;
        bar.style.width = `${pct}%`;
      }
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `${emojis[k]} Recolectar ${labels[k]} (+${CONFIG.BasicGathering[k + '_manual'].yield})`;
      }
      if (container) container.style.display = 'none';
      if (bar) bar.style.width = '0%';
    }
  });
}

function toggleCostAffordability(element, currentAmount, costAmount) {
  if (!element) return;
  if (currentAmount >= costAmount) {
    element.classList.add('affordable');
    element.classList.remove('expensive');
  } else {
    element.classList.add('expensive');
    element.classList.remove('affordable');
  }
}

function updateStaticTextsFromConfig() {
  // Viviendas y Aldeanos
  document.getElementById('cost-basic-wood').innerHTML = `🪵 ${CONFIG.Building.basic_house.cost_wood} Madera`;
  document.getElementById('cost-basic-stone').innerHTML = `🪨 ${CONFIG.Building.basic_house.cost_stone} Piedra`;
  
  document.getElementById('cost-hire-gold').innerHTML = `🪙 ${CONFIG.Building.hire_colonist.cost_gold} Oro`;
  document.getElementById('btn-hire-colonist').innerHTML = `🧑‍🌾 Contratar Aldeano (${CONFIG.Building.hire_colonist.cost_gold}🪙)`;

  // Edificios
  document.getElementById('cost-lumbermill-gold').innerHTML = `🪙 ${CONFIG.Building.lumbermill.cost_gold} Oro`;
  document.getElementById('cost-lumbermill-stone').innerHTML = `🪨 ${CONFIG.Building.lumbermill.cost_stone} Piedra`;
  
  document.getElementById('cost-quarry-gold').innerHTML = `🪙 ${CONFIG.Building.quarry.cost_gold} Oro`;
  document.getElementById('cost-quarry-wood').innerHTML = `🪵 ${CONFIG.Building.quarry.cost_wood} Madera`;
  
  document.getElementById('cost-farm-wood').innerHTML = `🪵 ${CONFIG.Building.farm.cost_wood} Madera`;
  document.getElementById('cost-farm-stone').innerHTML = `🪨 ${CONFIG.Building.farm.cost_stone} Piedra`;

  if (DOM.costBonfireWood) DOM.costBonfireWood.innerHTML = `🪵 ${CONFIG.Building.bonfire.cost_wood} Madera`;
  if (DOM.costBonfireStone) DOM.costBonfireStone.innerHTML = `🪨 ${CONFIG.Building.bonfire.cost_stone} Piedra`;
  
  const costMarketWood = document.getElementById('cost-market-wood');
  const costMarketStone = document.getElementById('cost-market-stone');
  if (costMarketWood) costMarketWood.innerHTML = `🪵 ${CONFIG.Building.market.cost_wood} Madera`;
  if (costMarketStone) costMarketStone.innerHTML = `🪨 ${CONFIG.Building.market.cost_stone} Piedra`;

  if (DOM.costGranaryWood) DOM.costGranaryWood.innerHTML = `🪵 ${CONFIG.Building.granary.cost_wood} Madera`;
  if (DOM.costGranaryStone) DOM.costGranaryStone.innerHTML = `🪨 ${CONFIG.Building.granary.cost_stone} Piedra`;

  // Recolección Manual
  const gatherWoodBtn = document.getElementById('btn-gather-wood');
  if (gatherWoodBtn) gatherWoodBtn.innerHTML = `🪵 Recolectar Madera (+${CONFIG.BasicGathering.wood_manual.yield})`;
  const gatherStoneBtn = document.getElementById('btn-gather-stone');
  if (gatherStoneBtn) gatherStoneBtn.innerHTML = `🪨 Recolectar Piedra (+${CONFIG.BasicGathering.stone_manual.yield})`;
  const gatherBerriesBtn = document.getElementById('btn-gather-berries');
  if (gatherBerriesBtn) gatherBerriesBtn.innerHTML = `🍓 Recolectar Frutos (+${CONFIG.BasicGathering.berries_manual.yield})`;

  // Descripciones de Edificios
  const lumberDesc = document.querySelector('#cost-lumbermill-gold').parentElement.parentElement.querySelector('.building-desc');
  if (lumberDesc) lumberDesc.innerHTML = `Habilita leñadores industriales (+${CONFIG.ProductionRate.lumbermill_prod.yield.toFixed(0)} Madera/día por trabajador).`;
  const quarryDesc = document.querySelector('#cost-quarry-gold').parentElement.parentElement.querySelector('.building-desc');
  if (quarryDesc) quarryDesc.innerHTML = `Habilita canteros industriales (+${CONFIG.ProductionRate.quarry_prod.yield.toFixed(0)} Piedra/día por trabajador).`;

  // Comercio - Compras y Ventas manuales dinámicas
  const rawNames = {
    wood: 'Madera', stone: 'Piedra', wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos',
    cooked_wheat: 'Pan', cooked_potato: 'Patata Asada', cooked_carrot: 'Zanahoria Asada', cooked_berries: 'Mermelada',
    wheat_seeds: 'Semillas de Trigo', potato_seeds: 'Semillas de Patata', carrot_seeds: 'Semillas de Zanahoria'
  };
  const icons = {
    wood: '🪵', stone: '🪨', wheat: '🌾', potato: '🥔', carrot: '🥕', berries: '🍓',
    cooked_wheat: '🍞', cooked_potato: '🥔', cooked_carrot: '🥕', cooked_berries: '🍯',
    wheat_seeds: '🌾🌱', potato_seeds: '🥔🌱', carrot_seeds: '🥕🌱'
  };

  const sellSelect = document.getElementById('sell-resource-select');
  if (sellSelect) {
    const prevVal = sellSelect.value;
    sellSelect.innerHTML = '';
    for (let key in CONFIG.Sales) {
      if (key.startsWith('sell_') && key.endsWith('_manual')) {
        const type = key.replace('sell_', '').replace('_manual', '');
        const sale = CONFIG.Sales[key];
        const price = sale.yield / sale.consume_amount;
        const opt = document.createElement('option');
        opt.value = type;
        opt.text = `${icons[type] || ''} ${rawNames[type] || type} (🪙 ${price})`;
        sellSelect.appendChild(opt);
      }
    }
    if (prevVal) sellSelect.value = prevVal;
    if (!sellSelect.value && sellSelect.options.length > 0) {
      sellSelect.selectedIndex = 0;
    }
  }

  const buySelect = document.getElementById('buy-resource-select');
  if (buySelect) {
    const prevVal = buySelect.value;
    buySelect.innerHTML = '';
    for (let key in CONFIG.Sales) {
      if (key.startsWith('buy_') && !key.endsWith('_seeds')) {
        const type = key.replace('buy_', '');
        const buyRule = CONFIG.Sales[key];
        const price = buyRule.cost_gold;
        const opt = document.createElement('option');
        opt.value = type;
        opt.text = `${icons[type] || ''} ${rawNames[type] || type} (🪙 ${price})`;
        buySelect.appendChild(opt);
      }
    }
    // Añadir también las semillas
    const seedTypes = ['wheat', 'potato', 'carrot'];
    seedTypes.forEach(st => {
      const type = st + '_seeds';
      const buyRule = CONFIG.Sales[`buy_${type}`];
      if (buyRule) {
        const price = buyRule.cost_gold;
        const opt = document.createElement('option');
        opt.value = type;
        opt.text = `${icons[type] || ''} ${rawNames[type] || type} (🪙 ${price})`;
        buySelect.appendChild(opt);
      }
    });

    if (prevVal) buySelect.value = prevVal;
    if (!buySelect.value && buySelect.options.length > 0) {
      buySelect.selectedIndex = 0;
    }
  }
}


function renderFoodPriorityList() {
  const container = document.getElementById('food-priority-list');
  if (!container) return;
  
  const priority = state.foodPriority || ['cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries', 'wheat', 'potato', 'carrot', 'berries'];
  
  const rawNames = {
    wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos',
    cooked_wheat: 'Pan', cooked_potato: 'Patata Asada', cooked_carrot: 'Zanahoria Asada', cooked_berries: 'Mermelada'
  };
  const icons = {
    wheat: '🌾', potato: '🥔', carrot: '🥕', berries: '🍓',
    cooked_wheat: '🍞', cooked_potato: '🥔', cooked_carrot: '🥕', cooked_berries: '🍯'
  };
  
  let html = '';
  priority.forEach((type, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === priority.length - 1;
    const checked = state.allowConsume && state.allowConsume[type] !== false;
    const eqObj = CONFIG.FoodEquivalence && CONFIG.FoodEquivalence[type];
    const mult = eqObj ? eqObj.yield : 1;
    
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 0.5rem 0.75rem; border-radius: 6px; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" style="cursor: pointer; width: 14px; height: 14px;" onchange="toggleConsumeType('${type}', this.checked)" ${checked ? 'checked' : ''}>
          <span style="font-size: 0.85rem; font-weight: 500; color: #fff;">${idx + 1}. ${icons[type] || ''} ${rawNames[type] || type} <span style="font-size: 0.7rem; color: #a5b4fc;">(Nutr. x${mult})</span></span>
        </div>
        <div style="display: flex; gap: 0.25rem;">
          <button class="allocator-btn" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem;" onclick="moveFoodPriority(${idx}, -1)" ${isFirst ? 'disabled' : ''}>▲</button>
          <button class="allocator-btn" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem;" onclick="moveFoodPriority(${idx}, 1)" ${isLast ? 'disabled' : ''}>▼</button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderDetailedFoodInventory() {
  const container = document.getElementById('food-details-grid');
  if (!container) return;
  if (container.children.length === 0) {
    const foods = [
      { key: 'wheat', name: 'Trigo', icon: '🌾', color: '#f59e0b' },
      { key: 'potato', name: 'Patata', icon: '🥔', color: '#a8a29e' },
      { key: 'carrot', name: 'Zanahoria', icon: '🥕', color: '#f97316' },
      { key: 'berries', name: 'Frutos', icon: '🍓', color: '#ef4444' },
      { key: 'cooked_wheat', name: 'Pan', icon: '🍞', color: '#fbbf24' },
      { key: 'cooked_potato', name: 'Patata Asada', icon: '🥔', color: '#d6d3d1' },
      { key: 'cooked_carrot', name: 'Zan. Asada', icon: '🥕', color: '#fdba74' },
      { key: 'cooked_berries', name: 'Mermelada', icon: '🍯', color: '#f43f5e' }
    ];
    let html = '';
    foods.forEach(f => {
      const eqObj = CONFIG.FoodEquivalence && CONFIG.FoodEquivalence[f.key];
      const mult = eqObj ? eqObj.yield : 1;
      html += `
        <div class="subresource-item" style="display: flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.03); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); min-width: 130px; flex: 1;">
          <span style="font-size: 1.2rem;">${f.icon}</span>
          <div style="display: flex; flex-direction: column; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">${f.name}</span>
              <span style="font-size: 0.65rem; color: #a5b4fc; font-weight: 600;">x${mult}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <div style="display: flex; gap: 0.25rem; align-items: baseline;">
                <span id="res-detail-${f.key}" style="font-size: 0.95rem; font-weight: 700; color: ${f.color};">0</span>
                <span id="res-val-${f.key}" style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">(0)</span>
              </div>
              <span id="res-rate-${f.key}" style="font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted);">+0/d</span>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }
  
  // Update quantities and values
  const list = ['wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries'];
  list.forEach(key => {
    const qty = state[key] || 0;
    const eqObj = CONFIG.FoodEquivalence && CONFIG.FoodEquivalence[key];
    const mult = eqObj ? eqObj.yield : 1;
    const value = qty * mult;
    
    const qtyEl = document.getElementById(`res-detail-${key}`);
    if (qtyEl) qtyEl.innerText = qty.toFixed(0);
    const valEl = document.getElementById(`res-val-${key}`);
    if (valEl) valEl.innerText = `(${value.toFixed(0)})`;
    
    const rateEl = document.getElementById(`res-rate-${key}`);
    if (rateEl && typeof calculatedRates !== 'undefined' && calculatedRates[key] !== undefined) {
      const rateVal = calculatedRates[key];
      if (rateVal > 0.001) {
        rateEl.innerText = `+${rateVal.toFixed(0)}/d`;
        rateEl.style.color = '#4ade80';
      } else if (rateVal < -0.001) {
        rateEl.innerText = `${rateVal.toFixed(0)}/d`;
        rateEl.style.color = '#f87171';
      } else {
        rateEl.innerText = '+0/d';
        rateEl.style.color = 'var(--color-text-muted)';
      }
    }
  });
}

function renderAutoSellSettings() {
  const container = document.getElementById('auto-sell-list-container');
  if (!container) return;
  
  const sellableTypes = [
    { key: 'wood', name: 'Madera', icon: '🪵' },
    { key: 'stone', name: 'Piedra', icon: '🪨' },
    { key: 'wheat', name: 'Trigo', icon: '🌾' },
    { key: 'potato', name: 'Patata', icon: '🥔' },
    { key: 'carrot', name: 'Zanahoria', icon: '🥕' },
    { key: 'berries', name: 'Frutos', icon: '🍓' },
    { key: 'cooked_wheat', name: 'Pan', icon: '🍞' },
    { key: 'cooked_potato', name: 'Patata Asada', icon: '🥔' },
    { key: 'cooked_carrot', name: 'Zanahoria Asada', icon: '🥕' },
    { key: 'cooked_berries', name: 'Mermelada', icon: '🍯' },
    { key: 'wheat_seeds', name: 'Semillas Trigo', icon: '🌾🌱' },
    { key: 'potato_seeds', name: 'Semillas Patata', icon: '🥔🌱' },
    { key: 'carrot_seeds', name: 'Semillas Zanahoria', icon: '🥕🌱' }
  ];
  
  if (container.children.length === 0) {
    let html = '';
    sellableTypes.forEach(item => {
      const mRule = CONFIG.Sales && CONFIG.Sales[`market_${item.key}`];
      const priceText = mRule ? `(+${mRule.yield}🪙)` : '';
      
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); padding: 0.4rem 0.6rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
          <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="auto-sell-chk-${item.key}" onchange="toggleAutoSell('${item.key}', this.checked)">
            <span style="font-weight: 500;">${item.icon} ${item.name} <span style="font-size: 0.7rem; color: #fbbf24;">${priceText}</span></span>
          </label>
          <div style="display: flex; align-items: center; gap: 0.25rem;">
            <span style="font-size: 0.7rem; color: var(--color-text-muted);">Mantener:</span>
            <input type="number" id="auto-sell-min-${item.key}" value="0" min="0" step="10" onchange="changeAutoSellMin('${item.key}', this.value)" style="width: 50px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 4px; padding: 0.1rem 0.25rem; font-family: var(--font-primary); font-size: 0.75rem; text-align: center; outline: none;">
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }
  
  // Sincronizar valores
  sellableTypes.forEach(item => {
    const chk = document.getElementById(`auto-sell-chk-${item.key}`);
    if (chk) chk.checked = state.autoSell && state.autoSell[item.key] ? true : false;
    const valInput = document.getElementById(`auto-sell-min-${item.key}`);
    if (valInput && document.activeElement !== valInput) {
      valInput.value = state.autoSellMin && state.autoSellMin[item.key] !== undefined ? state.autoSellMin[item.key] : 0;
    }
  });
}

function renderAutoBuySettings() {
  const container = document.getElementById('auto-buy-list-container');
  if (!container) return;
  
  const buyableTypes = [
    { key: 'wood', name: 'Madera', icon: '🪵' },
    { key: 'stone', name: 'Piedra', icon: '🪨' },
    { key: 'wheat', name: 'Trigo', icon: '🌾' },
    { key: 'potato', name: 'Patata', icon: '🥔' },
    { key: 'carrot', name: 'Zanahoria', icon: '🥕' },
    { key: 'berries', name: 'Frutos', icon: '🍓' },
    { key: 'cooked_wheat', name: 'Pan', icon: '🍞' },
    { key: 'cooked_potato', name: 'Patata Asada', icon: '🥔' },
    { key: 'cooked_carrot', name: 'Zanahoria Asada', icon: '🥕' },
    { key: 'cooked_berries', name: 'Mermelada', icon: '🍯' },
    { key: 'wheat_seeds', name: 'Semillas Trigo', icon: '🌾🌱' },
    { key: 'potato_seeds', name: 'Semillas Patata', icon: '🥔🌱' },
    { key: 'carrot_seeds', name: 'Semillas Zanahoria', icon: '🥕🌱' }
  ];
  
  if (container.children.length === 0) {
    let html = '';
    buyableTypes.forEach(item => {
      const bRule = CONFIG.Sales && CONFIG.Sales[`buy_${item.key}`];
      const priceText = bRule ? `(-${bRule.cost_gold}🪙)` : '';
      
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); padding: 0.4rem 0.6rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
          <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="auto-buy-chk-${item.key}" onchange="toggleAutoBuy('${item.key}', this.checked)">
            <span style="font-weight: 500;">${item.icon} ${item.name} <span style="font-size: 0.7rem; color: #fbbf24;">${priceText}</span></span>
          </label>
          <div style="display: flex; align-items: center; gap: 0.25rem;">
            <span style="font-size: 0.7rem; color: var(--color-text-muted);">Comprar hasta:</span>
            <input type="number" id="auto-buy-max-${item.key}" value="0" min="0" step="10" onchange="changeAutoBuyMax('${item.key}', this.value)" style="width: 50px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 4px; padding: 0.1rem 0.25rem; font-family: var(--font-primary); font-size: 0.75rem; text-align: center; outline: none;">
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }
  
  // Sincronizar valores
  buyableTypes.forEach(item => {
    const chk = document.getElementById(`auto-buy-chk-${item.key}`);
    if (chk) chk.checked = state.autoBuy && state.autoBuy[item.key] ? true : false;
    const valInput = document.getElementById(`auto-buy-max-${item.key}`);
    if (valInput && document.activeElement !== valInput) {
      valInput.value = state.autoBuyMax && state.autoBuyMax[item.key] !== undefined ? state.autoBuyMax[item.key] : 0;
    }
  });
}

function renderDetailedResourcesInventory() {
  const container = document.getElementById('resources-details-grid');
  if (!container) return;
  if (container.children.length === 0) {
    const resources = [
      { key: 'wood', name: 'Madera', icon: '🪵', color: '#f59e0b', isSeed: false },
      { key: 'stone', name: 'Piedra', icon: '🪨', color: '#94a3b8', isSeed: false },
      { key: 'wheat_seeds', name: 'Sem. Trigo', icon: '🌾', color: '#fbbf24', isSeed: true },
      { key: 'potato_seeds', name: 'Sem. Patata', icon: '🥔', color: '#a8a29e', isSeed: true },
      { key: 'carrot_seeds', name: 'Sem. Zanahoria', icon: '🥕', color: '#f97316', isSeed: true }
    ];
    let html = '';
    resources.forEach(r => {
      html += `
        <div class="subresource-item" style="display: flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.03); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); min-width: 130px; flex: 1;">
          <span style="font-size: 1.2rem;">${r.icon}</span>
          <div style="display: flex; flex-direction: column; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">${r.name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span id="res-detail-${r.key}" style="font-size: 0.95rem; font-weight: 700; color: ${r.color};">0</span>
              <span id="res-rate-${r.key}" style="font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted);"></span>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  const resourcesList = [
    { key: 'wood', stateKey: 'wood', isSeed: false },
    { key: 'stone', stateKey: 'stone', isSeed: false },
    { key: 'wheat_seeds', stateKey: 'wheat', isSeed: true },
    { key: 'potato_seeds', stateKey: 'potato', isSeed: true },
    { key: 'carrot_seeds', stateKey: 'carrot', isSeed: true }
  ];

  resourcesList.forEach(item => {
    let qty = 0;
    if (item.isSeed) {
      qty = state.seeds ? (state.seeds[item.stateKey] || 0) : 0;
    } else {
      qty = state[item.stateKey] || 0;
    }

    const qtyEl = document.getElementById(`res-detail-${item.key}`);
    if (qtyEl) qtyEl.innerText = qty.toFixed(0);

    const rateEl = document.getElementById(`res-rate-${item.key}`);
    if (rateEl) {
      if (!item.isSeed && typeof calculatedRates !== 'undefined' && calculatedRates[item.stateKey] !== undefined) {
        const rateVal = calculatedRates[item.stateKey];
        if (rateVal > 0.001) {
          rateEl.innerText = `+${rateVal.toFixed(0)}/d`;
          rateEl.style.color = '#4ade80';
        } else if (rateVal < -0.001) {
          rateEl.innerText = `${rateVal.toFixed(0)}/d`;
          rateEl.style.color = '#f87171';
        } else {
          rateEl.innerText = '+0/d';
          rateEl.style.color = 'var(--color-text-muted)';
        }
      } else {
        rateEl.innerText = '';
      }
    }
  });
}

