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
  const currentStatus = state.farms ? state.farms.map(f => f.isUnderConstruction ? '1' : '0').join(',') : '';
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
        Object.keys(CROPS).forEach(key => {
          const crop = CROPS[key];
          const emoji = key === 'wheat' ? '🌾' : (key === 'potato' ? '🥔' : '🥕');
          cropsOptionsHtml += `<option value="${key}">${emoji} ${crop.name} (Costo: ${crop.cost}🪙, Duración: ${crop.duration} días, Rend: ${crop.yield} Comida)</option>`;
        });
        html += `
          <div class="building-box" id="farm-box-${idx}">
            <div class="building-box-header">
              <span class="building-box-title" id="farm-title-${idx}">🌾 Granja #${idx + 1}</span>
              <span class="building-box-prod" id="farm-prod-${idx}">0 Comida/día</span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <select class="crop-selector" style="width: 100%; font-size: 0.8rem; padding: 0.25rem;" id="farm-select-${idx}" onchange="changeFarmCrop(${idx}, this.value)">
                ${cropsOptionsHtml}
              </select>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.1rem;">
                <span id="farm-status-${idx}" style="font-size: 0.75rem; color: var(--color-text-muted);">Inactiva</span>
              </div>
              
              <div class="progress-bar-container" style="height: 6px; margin: 0.2rem 0;">
                <div class="progress-bar-fill" id="farm-progress-${idx}"></div>
              </div>
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
        if (select && select.value !== farm.crop) {
          select.value = farm.crop;
        }
        
        const pBar = document.getElementById(`farm-progress-${idx}`);
        const btn = document.getElementById(`farm-btn-${idx}`);
        const statusText = document.getElementById(`farm-status-${idx}`);
        const allocText = document.getElementById(`farm-alloc-${idx}`);
        
        if (allocText) allocText.innerText = farm.workerAssigned;
        
        const crop = CROPS[farm.crop];
        const rate = crop ? (crop.yield / crop.duration) : 0;
        const isWorking = farm.workerAssigned > 0 || farm.isRunning;
        const eff = getWorkEfficiency();
        const yieldVal = rate * eff;
        const displayYield = yieldVal.toFixed(yieldVal % 1 === 0 ? 0 : 1);
        const prodText = isWorking ? `+${displayYield} Comida/día` : '0 Comida/día';
        
        const farmProd = document.getElementById(`farm-prod-${idx}`);
        if (farmProd) farmProd.innerText = prodText;
        
        if (btn) btn.disabled = farm.isRunning || state.gold < (crop ? crop.cost : 0);

        if (farm.isRunning) {
          const activeCropObj = CROPS[farm.activeCrop || farm.crop];
          const pct = Math.min(100, (farm.elapsed / activeCropObj.duration) * 100);
          if (pBar) pBar.style.width = `${pct}%`;
          const rem = Math.max(activeCropObj.duration - farm.elapsed, 0).toFixed(0);
          if (statusText) statusText.innerText = `Cultivando (Faltan ${rem}d)`;
        } else {
          if (pBar) pBar.style.width = `0%`;
          if (statusText) statusText.innerText = farm.workerAssigned > 0 ? 'Esperando Oro...' : 'Inactiva';
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

        const minFood = autoRec ? autoRec.consume_amount : 1;
        if (allocText) allocText.innerText = `${bonfire.workerAssigned} / ${bonfire.tier || 1}`;
        if (btn) btn.disabled = bonfire.isRunning || state.food < minFood;

        if (bonfire.isRunning) {
          const targetDuration = bonfire.mode === 'manual' ? manualRec.duration : autoRec.duration;
          const pct = Math.min(100, (bonfire.elapsed / targetDuration) * 100);
          if (pBar) pBar.style.width = `${pct}%`;
          const rem = Math.max(targetDuration - bonfire.elapsed, 0).toFixed(0);
          if (statusText) statusText.innerText = `Cocinando (Faltan ${rem}d)`;
        } else {
          if (pBar) pBar.style.width = `0%`;
          if (statusText) statusText.innerText = bonfire.workerAssigned > 0 ? `Esperando comida (Mín. ${minFood})...` : 'Inactiva';
        }
      }
    });
  }
}

let lastMarketsConstructionStatus = '';
function renderMarkets() {
  const container = document.getElementById('active-markets-list');
  if (!container) return;
  const count = state.markets ? state.markets.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  const currentStatus = state.markets ? state.markets.map(m => m.isUnderConstruction ? '1' : '0').join(',') : '';
  if (container.children.length !== count || hasPlaceholder || count === 0 || currentStatus !== lastMarketsConstructionStatus) {
    lastMarketsConstructionStatus = currentStatus;
    if (count === 0) {
      if (!container.querySelector('.placeholder-text')) {
        container.innerHTML = `<div class="placeholder-text" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">Ningún Puesto de Mercado construido</div>`;
      }
      return;
    }
    let html = '';
    state.markets.forEach((market, idx) => {
      if (market.isUnderConstruction) {
        html += `
          <div class="building-box" id="market-box-${idx}" style="position: relative;">
            <div class="building-box-header">
              <span class="building-box-title" id="market-title-${idx}">🏗️ Puesto de Mercado #${idx + 1} (En construcción)</span>
              <span class="building-box-prod" id="market-status-${idx}">En construcción</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="market-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
              <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;" id="market-construct-btn-${idx}" onclick="togglePlayerConstruct('markets', ${idx})">
                🔨 Iniciar Construcción
              </button>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">Auto:</span>
                <div class="colonist-allocator">
                  <button class="allocator-btn" onclick="assignBuildingWorker('markets', ${idx}, -1)">-</button>
                  <span class="allocator-val" id="market-alloc-${idx}">0</span>
                  <button class="allocator-btn" onclick="assignBuildingWorker('markets', ${idx}, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="building-box" id="market-box-${idx}" style="position: relative;">
            <div class="building-box-header">
              <span class="building-box-title" id="market-title-${idx}">📈 Puesto de Mercado #${idx + 1}</span>
              <span class="building-box-prod" id="market-status-${idx}">Inactivo</span>
            </div>
            
            <div class="progress-bar-container" style="height: 6px; margin: 0.2rem 0;">
              <div class="progress-bar-fill" id="market-progress-${idx}" style="background: linear-gradient(90deg, hsl(var(--color-gold)) 0%, #fbbf24 100%);"></div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">Asignar mercader:</span>
              
              <div class="colonist-allocator">
                <button class="allocator-btn" onclick="assignBuildingWorker('markets', ${idx}, -1)">-</button>
                <span class="allocator-val" id="market-alloc-${idx}">0</span>
                <button class="allocator-btn" onclick="assignBuildingWorker('markets', ${idx}, 1)">+</button>
              </div>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.markets.forEach((market, idx) => {
      if (market.isUnderConstruction) {
        const pBar = document.getElementById(`market-progress-${idx}`);
        const pct = Math.min(100, (market.constructionElapsed / market.constructionDuration) * 100);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const allocText = document.getElementById(`market-alloc-${idx}`);
        if (allocText) allocText.innerText = `${market.workerAssigned} / 2`;
        
        const btn = document.getElementById(`market-construct-btn-${idx}`);
        const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === 'markets' && state.playerConstructing.index === idx;
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
        const pBar = document.getElementById(`market-progress-${idx}`);
        const statusText = document.getElementById(`market-status-${idx}`);
        const allocText = document.getElementById(`market-alloc-${idx}`);
        const titleText = document.getElementById(`market-title-${idx}`);
        
        if (titleText) titleText.innerHTML = `📈 Puesto de Mercado #${idx + 1}`;
        if (allocText) allocText.innerText = `${market.workerAssigned} / 1`;

        if (market.isRunning) {
          const duration = market.targetDuration || 0.1;
          const pct = Math.min(100, (market.elapsed / duration) * 100);
          if (pBar) pBar.style.width = `${pct}%`;
          if (statusText) statusText.innerText = `Vendiendo...`;
        } else {
          if (pBar) pBar.style.width = `0%`;
          if (statusText) statusText.innerText = market.workerAssigned > 0 ? 'Comerciando' : 'Inactivo';
        }
      }
    });
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

  DOM.rateWood.textContent = formatRate(calculatedRates.wood);
  DOM.rateWood.className = (calculatedRates.wood > 0.001) ? 'resource-rate rate-positive' : 'resource-rate rate-neutral';

  DOM.rateStone.textContent = formatRate(calculatedRates.stone);
  DOM.rateStone.className = (calculatedRates.stone > 0.001) ? 'resource-rate rate-positive' : 'resource-rate rate-neutral';

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
  DOM.resGold.textContent = Math.floor(state.gold);
  DOM.resWood.textContent = Math.floor(state.wood);
  DOM.resStone.textContent = Math.floor(state.stone);
  DOM.resFood.textContent = Math.floor(state.food);
  if (DOM.resCooked) DOM.resCooked.textContent = Math.floor(state.cookedFood || 0);
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
  
  const dayDuration = CONFIG.System && CONFIG.System.day_duration ? CONFIG.System.day_duration.duration : 30.0;

  const woodDuration = CONFIG.BasicGathering.wood_auto.duration;
  const woodYield = CONFIG.BasicGathering.wood_auto.yield;
  DOM.woodAutoInfo.textContent = `+${(state.jobs.wood * (woodYield / woodDuration)).toFixed(0)}/d`;
  
  const stoneDuration = CONFIG.BasicGathering.stone_auto.duration;
  const stoneYield = CONFIG.BasicGathering.stone_auto.yield;
  DOM.stoneAutoInfo.textContent = `+${(state.jobs.stone * (stoneYield / stoneDuration)).toFixed(0)}/d`;

  const berriesDuration = CONFIG.BasicGathering.berries_auto.duration;
  const berriesYield = CONFIG.BasicGathering.berries_auto.yield;
  DOM.berriesAutoInfo.textContent = `+${(state.jobs.berries * (berriesYield / berriesDuration)).toFixed(0)}/d`;

  // Renderizar y actualizar los edificios individuales en tab-production
  renderHouses();
  renderLumberMills();
  renderQuarries();
  renderFarms();
  renderBonfires();
  renderMarkets();

  // Viviendas construidas
  if (DOM.countBasicHouses) DOM.countBasicHouses.textContent = `Construidas: ${state.basicHouses}`;

  // Contadores en Construcción
  document.getElementById('count-lumbermills').innerText = `Construidos: ${state.lumberMills.length}`;
  document.getElementById('count-quarries').innerText = `Construidas: ${state.quarries.length}`;
  document.getElementById('count-farms').innerText = `Construidas: ${state.farms ? state.farms.length : 0}`;
  if (DOM.countBonfires) DOM.countBonfires.innerText = `Construidas: ${state.bonfires ? state.bonfires.length : 0}`;
  document.getElementById('count-markets').innerText = `Construidos: ${state.markets ? state.markets.length : 0}`;

  // Sincronizar inputs de auto-venta en Comercio y controlar visibilidad
  const marketControls = document.getElementById('market-active-controls');
  const countMarkets = state.markets ? state.markets.length : 0;
  
  if (countMarkets > 0) {
    if (marketControls) marketControls.style.display = 'flex';
    if (document.activeElement !== DOM.autoSellFoodMin) DOM.autoSellFoodMin.value = state.autoSellFoodMin;
    if (document.activeElement !== DOM.autoSellCookedMin) DOM.autoSellCookedMin.value = state.autoSellCookedMin;
    if (document.activeElement !== DOM.autoSellWoodMin) DOM.autoSellWoodMin.value = state.autoSellWoodMin;
    if (document.activeElement !== DOM.autoSellStoneMin) DOM.autoSellStoneMin.value = state.autoSellStoneMin;
    
    DOM.autoSellFoodChk.checked = state.autoSellFood;
    if (DOM.autoSellCookedChk) DOM.autoSellCookedChk.checked = state.autoSellCooked;
    DOM.autoSellWoodChk.checked = state.autoSellWood;
    DOM.autoSellStoneChk.checked = state.autoSellStone;
    
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
    if (marketControls) marketControls.style.display = 'none';
    const indicator = document.getElementById('market-indicator');
    const statusText = document.getElementById('market-status-text');
    const globalProgressBar = document.getElementById('market-progress');
    if (indicator) indicator.classList.remove('active');
    if (statusText) statusText.innerText = 'Inactivo';
    if (globalProgressBar) globalProgressBar.style.width = '0%';
  }

  // Sincronizar el asignador de mercaderes del Commerce tab
  const allocMarket = document.getElementById('alloc-market');
  if (allocMarket) {
    allocMarket.textContent = state.markets ? state.markets.filter(m => m.workerAssigned > 0).length : 0;
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
  DOM.btnBuildMarket.disabled = !thBuilt || !(state.wood >= bMarket.cost_wood && state.stone >= bMarket.cost_stone);

  // Botón contratar colono (Condición: colonos actuales < maxPopulation)
  const spaceAvailable = state.currentColonists < state.maxPopulation;
  DOM.btnHireColonist.disabled = !(spaceAvailable && state.gold >= bHire.cost_gold);

  // Marketplace - Ventas manuales habilitadas según stock, SIEMPRE disponibles
  const sellWoodConsume = CONFIG.Sales.sell_wood_manual.consume_amount;
  const sellStoneConsume = CONFIG.Sales.sell_stone_manual.consume_amount;
  const sellFoodConsume = CONFIG.Sales.sell_food_manual.consume_amount;
  const sellCookedConsume = CONFIG.Sales.sell_cooked_manual.consume_amount;

  DOM.btnSellWood.disabled = state.wood < sellWoodConsume;
  DOM.btnSellStone.disabled = state.stone < sellStoneConsume;
  DOM.btnSellFood.disabled = state.food < sellFoodConsume;
  if (DOM.btnSellCooked) DOM.btnSellCooked.disabled = (state.cookedFood || 0) < sellCookedConsume;

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
  const dDuration = CONFIG.System && CONFIG.System.day_duration ? CONFIG.System.day_duration.duration : 30.0;
  const nDuration = CONFIG.System && CONFIG.System.night_duration ? CONFIG.System.night_duration.duration : 20.0;
  
  keys.forEach(k => {
    const btn = document.getElementById(`btn-gather-${k}`);
    const container = document.getElementById(`gather-cooldown-container-${k}`);
    const bar = document.getElementById(`gather-cooldown-bar-${k}`);
    
    if (cooldown > 0) {
      if (btn) {
        btn.disabled = true;
        const hourDuration = state.timePhase === 'day' ? (dDuration / 14) : (nDuration / 10);
        const secs = Math.ceil(cooldown * hourDuration);
        btn.innerHTML = `⏳ ${secs}s`;
      }
      if (container) container.style.display = 'block';
      if (bar) {
        const pct = (1.0 - cooldown) * 100;
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
  
  document.getElementById('cost-market-wood').innerHTML = `🪵 ${CONFIG.Building.market.cost_wood} Madera`;
  document.getElementById('cost-market-stone').innerHTML = `🪨 ${CONFIG.Building.market.cost_stone} Piedra`;

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

  // Comercio - Ventas manuales
  const foodSaleVal = document.getElementById('btn-sell-food').parentElement.querySelector('span[style*="hsl(var(--color-gold))"]');
  if (foodSaleVal) foodSaleVal.innerHTML = `+${CONFIG.Sales.sell_food_manual.yield} 🪙`;
  document.getElementById('btn-sell-food').innerHTML = `Vender x${CONFIG.Sales.sell_food_manual.consume_amount} Comida`;

  const cookedSaleVal = document.getElementById('btn-sell-cooked').parentElement.querySelector('span[style*="hsl(var(--color-gold))"]');
  if (cookedSaleVal) cookedSaleVal.innerHTML = `+${CONFIG.Sales.sell_cooked_manual.yield} 🪙`;
  document.getElementById('btn-sell-cooked').innerHTML = `Vender x${CONFIG.Sales.sell_cooked_manual.consume_amount} Cocinada`;
  
  const woodSaleVal = document.getElementById('btn-sell-wood').parentElement.querySelector('span[style*="hsl(var(--color-gold))"]');
  if (woodSaleVal) woodSaleVal.innerHTML = `+${CONFIG.Sales.sell_wood_manual.yield} 🪙`;
  document.getElementById('btn-sell-wood').innerHTML = `Vender x${CONFIG.Sales.sell_wood_manual.consume_amount} Madera`;
  
  const stoneSaleVal = document.getElementById('btn-sell-stone').parentElement.querySelector('span[style*="hsl(var(--color-gold))"]');
  if (stoneSaleVal) stoneSaleVal.innerHTML = `+${CONFIG.Sales.sell_stone_manual.yield} 🪙`;
  document.getElementById('btn-sell-stone').innerHTML = `Vender x${CONFIG.Sales.sell_stone_manual.consume_amount} Piedra`;
}


function renderFoodPriorityList() {
  const container = document.getElementById('food-priority-list');
  if (!container) return;
  
  const priority = state.foodPriority || ['cooked', 'raw'];
  
  const foodLabels = {
    cooked: '🍲 Cocinada (2/aldeano al día)',
    raw: '🌾 Comida Cruda (4/aldeano al día)'
  };
  
  const allowConsume = {
    cooked: state.allowConsumeCooked !== false,
    raw: state.allowConsumeRaw !== false
  };
  
  let html = '';
  priority.forEach((type, idx) => {
    const label = foodLabels[type];
    const isFirst = idx === 0;
    const isLast = idx === priority.length - 1;
    const checked = allowConsume[type];
    
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 0.5rem 0.75rem; border-radius: 6px; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" style="cursor: pointer; width: 14px; height: 14px;" onchange="toggleConsumeType('${type}', this.checked)" ${checked ? 'checked' : ''}>
          <span style="font-size: 0.85rem; font-weight: 500; color: ${checked ? '#fff' : 'var(--color-text-muted)'}; text-decoration: ${checked ? 'none' : 'line-through'};">${idx + 1}. ${label}</span>
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
