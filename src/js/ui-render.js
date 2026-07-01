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
function getBuildingAttributeDetails(type) {
  const attrMap = {
    lumbermills: { key: 'woodcutting', name: 'Leñador', emoji: '🪓' },
    lumberMills: { key: 'woodcutting', name: 'Leñador', emoji: '🪓' },
    quarries: { key: 'mining', name: 'Cantero', emoji: '⛏️' },
    farms: { key: 'farming', name: 'Agricultor', emoji: '🌾' },
    granaries: { key: 'farming', name: 'Agricultor', emoji: '🌾' },
    bonfires: { key: 'cooking', name: 'Cocinero', emoji: '🍳' },
    markets: { key: 'trading', name: 'Mercader', emoji: '📈' },
    houses: { key: 'construction', name: 'Constructor', emoji: '🔨' },
    townhall: { key: 'construction', name: 'Constructor', emoji: '🔨' },
    townHall: { key: 'construction', name: 'Constructor', emoji: '🔨' }
  };
  return attrMap[type] || { key: 'woodcutting', name: 'Trabajador', emoji: '👷' };
}

function renderBuildingWorkerDropdowns(type, index, maxWorkers) {
  const jobString = type === 'townHall' ? 'townHall' : `${type.toLowerCase()}_${index}`;
  const assigned = state.colonists ? state.colonists.filter(c => c.job === jobString) : [];
  const freeColonists = state.colonists ? state.colonists.filter(c => c.job === null) : [];
  const attrInfo = getBuildingAttributeDetails(type);

  let html = '<div style="display: flex; flex-direction: column; gap: 0.35rem; width: 100%; margin-top: 0.35rem;">';
  for (let slotIdx = 0; slotIdx < maxWorkers; slotIdx++) {
    const currentOccupant = assigned[slotIdx] || null;
    
    let selectHtml = `<select class="worker-select" style="width: 100%; font-size: 0.75rem; padding: 0.2rem; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 4px; outline: none; cursor: pointer;" onchange="assignColonistToBuildingSlot('${type}', ${index}, ${slotIdx}, this.value)">`;
    selectHtml += `<option value="">[Sin Asignar]</option>`;
    
    if (currentOccupant) {
      const val = currentOccupant.attributes[attrInfo.key] || 3;
      selectHtml += `<option value="${currentOccupant.id}" selected>${currentOccupant.name} (${attrInfo.emoji} ${val})</option>`;
    }
    
    freeColonists.forEach(c => {
      const val = c.attributes[attrInfo.key] || 3;
      selectHtml += `<option value="${c.id}">${c.name} (${attrInfo.emoji} ${val})</option>`;
    });
    
    selectHtml += `</select>`;
    
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; width: 100%;">
        <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">Puesto #${slotIdx + 1}:</span>
        <div style="flex: 1; max-width: 160px;">${selectHtml}</div>
      </div>
    `;
  }
  html += '</div>';
  return html;
}

const basicJobAttrMap = {
  wood: { key: 'woodcutting', name: 'Leñador', emoji: '🪓' },
  stone: { key: 'mining', name: 'Cantero', emoji: '⛏️' },
  berries: { key: 'exploration', name: 'Recolector', emoji: '🍓' }
};

let lastWoodStatusKey = '';
let lastStoneStatusKey = '';
let lastBerriesStatusKey = '';

function renderBasicJobDropdowns(jobType) {
  const containerId = `alloc-container-${jobType}`;
  const container = document.getElementById(containerId);
  if (!container) return;

  const attrInfo = basicJobAttrMap[jobType];
  if (!attrInfo) return;

  const assigned = state.colonists ? state.colonists.filter(c => c.job === jobType) : [];
  const freeColonists = state.colonists ? state.colonists.filter(c => c.job === null) : [];

  const assignedStr = assigned.map(c => `${c.id}:${c.attributes[attrInfo.key] || 3}`).join(',');
  const freeStr = freeColonists.map(c => `${c.id}:${c.attributes[attrInfo.key] || 3}`).join(',');
  const currentStatusKey = `assigned:${assignedStr}|free:${freeStr}`;

  if (jobType === 'wood') {
    if (currentStatusKey === lastWoodStatusKey && container.innerHTML !== '') return;
    lastWoodStatusKey = currentStatusKey;
  } else if (jobType === 'stone') {
    if (currentStatusKey === lastStoneStatusKey && container.innerHTML !== '') return;
    lastStoneStatusKey = currentStatusKey;
  } else if (jobType === 'berries') {
    if (currentStatusKey === lastBerriesStatusKey && container.innerHTML !== '') return;
    lastBerriesStatusKey = currentStatusKey;
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 0.35rem; width: 100%;">';

  assigned.forEach((col, slotIdx) => {
    let selectHtml = `<select class="worker-select" style="width: 100%; font-size: 0.75rem; padding: 0.2rem; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 4px; outline: none; cursor: pointer;" onchange="assignBasicJobSlot('${jobType}', ${slotIdx}, this.value)">`;
    selectHtml += `<option value="">[Sin Asignar]</option>`;
    
    const val = col.attributes[attrInfo.key] || 3;
    selectHtml += `<option value="${col.id}" selected>${col.name} (${attrInfo.emoji} ${val})</option>`;
    
    freeColonists.forEach(c => {
      const valC = c.attributes[attrInfo.key] || 3;
      selectHtml += `<option value="${c.id}">${c.name} (${attrInfo.emoji} ${valC})</option>`;
    });
    
    selectHtml += `</select>`;
    
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; width: 100%;">
        <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">Puesto #${slotIdx + 1}:</span>
        <div style="flex: 1; max-width: 160px;">${selectHtml}</div>
      </div>
    `;
  });

  if (freeColonists.length > 0) {
    const nextSlotIdx = assigned.length;
    let selectHtml = `<select class="worker-select" style="width: 100%; font-size: 0.75rem; padding: 0.2rem; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 4px; outline: none; cursor: pointer; border-style: dashed;" onchange="assignBasicJobSlot('${jobType}', ${nextSlotIdx}, this.value)">`;
    selectHtml += `<option value="" selected>➕ [Asignar Trabajador]</option>`;
    
    freeColonists.forEach(c => {
      const valC = c.attributes[attrInfo.key] || 3;
      selectHtml += `<option value="${c.id}">${c.name} (${attrInfo.emoji} ${valC})</option>`;
    });
    
    selectHtml += `</select>`;
    
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; width: 100%;">
        <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">Nuevo puesto:</span>
        <div style="flex: 1; max-width: 160px;">${selectHtml}</div>
      </div>
    `;
  } else if (assigned.length === 0) {
    html += `
      <div style="font-size: 0.75rem; color: var(--color-text-muted); font-style: italic; text-align: right; padding-right: 0.5rem;">
        No hay colonos libres
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

function renderHouseResidentDropdowns(houseIdx, capacity) {
  const residents = state.colonists ? state.colonists.filter(c => c.houseIdx === houseIdx) : [];
  const homelessColonists = state.colonists ? state.colonists.filter(c => c.houseIdx === null || c.houseIdx === undefined) : [];

  let html = '<div style="display: flex; flex-direction: column; gap: 0.35rem; width: 100%; margin-top: 0.35rem;">';
  for (let slotIdx = 0; slotIdx < capacity; slotIdx++) {
    const currentOccupant = residents[slotIdx] || null;
    
    let selectHtml = `<select class="resident-select" style="width: 100%; font-size: 0.75rem; padding: 0.2rem; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 4px; outline: none; cursor: pointer;" onchange="assignColonistToHouseSlot(${houseIdx}, ${slotIdx}, this.value)">`;
    selectHtml += `<option value="">[Cama Vacía]</option>`;
    
    if (currentOccupant) {
      selectHtml += `<option value="${currentOccupant.id}" selected>${currentOccupant.name}</option>`;
    }
    
    homelessColonists.forEach(c => {
      selectHtml += `<option value="${c.id}">${c.name}</option>`;
    });
    
    selectHtml += `</select>`;
    
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; width: 100%;">
        <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">Cama #${slotIdx + 1}:</span>
        <div style="flex: 1; max-width: 160px;">${selectHtml}</div>
      </div>
    `;
  }
  html += '</div>';
  return html;
}

let lastLumberMillsConstructionStatus = '';
function renderLumberMills() {
  const container = document.getElementById('active-lumbermills-list');
  if (!container) return;
  const count = state.lumberMills ? state.lumberMills.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  
  const assignedIds = state.colonists ? state.colonists.filter(c => c.job && c.job.startsWith('lumbermills_')).map(c => `${c.id}:${c.job}`).join(',') : '';
  const freeColonistsStr = state.colonists ? state.colonists.filter(c => c.job === null).map(c => c.id).join(',') : '';
  const currentStatus = (state.lumberMills ? state.lumberMills.map(m => (m.isUnderConstruction ? '1' : '0') + '_' + (m.isUpgrading ? '1' : '0') + '_' + (m.tier || 1) + '_' + (m.isPaused ? '1' : '0') + '_' + (m.workerAssigned || 0)).join(',') : '') + `_assigned:${assignedIds}_free:${freeColonistsStr}`;
  
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
      const maxWorkers = mill.isUnderConstruction || mill.isUpgrading ? 2 : (mill.tier || 1);
      if (mill.isUnderConstruction || mill.isUpgrading) {
        const isPaused = mill.isPaused || false;
        const pauseBtnText = isPaused ? '▶️' : '⏸️';
        const badgeText = mill.isUpgrading ? 'Mejorando' : 'Construyendo';
        const titleText = mill.isUpgrading ? 
          `Cabaña de Leñador #${idx + 1} (Mejorando...)` : 
          `Cabaña de Leñador #${idx + 1} (En construcción)`;
        const statusTextVal = mill.isUpgrading ? 'Mejorando...' : 'En construcción';
        html += `
          <div class="building-box" id="mill-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="mill-tier-badge-${idx}">${badgeText}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="mill-title-${idx}">🏗️ ${titleText}</span>
              <span class="building-box-prod" id="mill-prod-${idx}">${statusTextVal}</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="mill-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; color: #a78bfa; font-weight: 600;">👷 ${mill.workerAssigned || 0} / 2 Constructores auto</span>
                <div style="display: flex; gap: 0.25rem;">
                  <button class="btn btn-danger" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('lumberMills', ${idx})">
                    🗑️
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};" onclick="togglePauseConstruction('lumberMills', ${idx})">
                    ${pauseBtnText}
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;" id="mill-btn-${idx}" onclick="togglePlayerConstruct('lumberMills', ${idx})">
                    🔨 Iniciar Construcción
                  </button>
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
            <div style="display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.25rem;">
              <span style="font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600;">Trabajadores:</span>
              ${renderBuildingWorkerDropdowns('lumberMills', idx, maxWorkers)}
            </div>
            <div style="margin-top: 0.4rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span id="mill-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel 1</span>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-danger" style="font-size: 0.65rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('lumberMills', ${idx})">
                  🗑️
                </button>
                <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="mill-upgrade-btn-${idx}" onclick="upgradeLumberMill(${idx})">
                  Mejorar
                </button>
              </div>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.lumberMills.forEach((mill, idx) => {
      if (mill.isUnderConstruction || mill.isUpgrading) {
        const isUpgrading = mill.isUpgrading;
        const pBar = document.getElementById(`mill-progress-${idx}`);
        const duration = mill.constructionDuration || 5;
        const pct = Math.min(100, (mill.constructionElapsed / duration) * 100);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const statusText = document.getElementById(`mill-prod-${idx}`);
        if (statusText) {
          statusText.innerText = isUpgrading ? `Mejorando a Tier ${mill.upgradingToTier || 2} (${pct.toFixed(0)}%)` : `Construyendo (${pct.toFixed(0)}%)`;
        }

        const titleText = document.getElementById(`mill-title-${idx}`);
        if (titleText) {
          titleText.innerHTML = isUpgrading ? `🪵 Cabaña de Leñador #${idx + 1} (Mejorando...)` : `🪵 Cabaña de Leñador #${idx + 1} (En construcción)`;
        }
        
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
        const prodKey = `lumbermill_t${tier}`;
        const prodCfg = CONFIG.ProductionRate && CONFIG.ProductionRate[prodKey];
        const baseYield = prodCfg ? prodCfg.yield : (tier === 1 ? 5.0 : (tier === 2 ? 10.0 : 15.0));
        const duration = (prodCfg && prodCfg.duration) ? prodCfg.duration : 1.0;
        const workers = state.colonists ? state.colonists.filter(c => c.job === `lumbermills_${idx}`) : [];
        let mult = 0;
        workers.forEach(c => {
          const lvl = c.attributes.woodcutting || 3;
          mult += getAttributeMult(lvl) * getColonistEfficiency(c);
        });
        const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
        
        const baseMin = prodCfg && prodCfg.output_min !== undefined ? prodCfg.output_min : baseYield;
        const baseMax = prodCfg && prodCfg.output_max !== undefined ? prodCfg.output_max : baseYield;
        const yieldMin = (baseMin / duration) * mult * dayDuration;
        const yieldMax = (baseMax / duration) * mult * dayDuration;
        
        let displayYield = '';
        if (Math.abs(yieldMax - yieldMin) > 0.01) {
          displayYield = `${yieldMin.toFixed(yieldMin % 1 === 0 ? 0 : 1)}-${yieldMax.toFixed(yieldMax % 1 === 0 ? 0 : 1)}`;
        } else {
          displayYield = yieldMin.toFixed(yieldMin % 1 === 0 ? 0 : 2);
        }
        
        const titleText = document.getElementById(`mill-title-${idx}`);
        const prodText = document.getElementById(`mill-prod-${idx}`);
        const tierBadge = document.getElementById(`mill-tier-badge-${idx}`);
        const tierText = document.getElementById(`mill-tier-text-${idx}`);
        const upgradeBtn = document.getElementById(`mill-upgrade-btn-${idx}`);
        
        let bName = tier === 1 ? 'Cabaña de Leñador' : (tier === 2 ? 'Aserradero' : 'Gremio de Leñadores');
        
        if (titleText) titleText.innerHTML = `🪵 ${bName} #${idx + 1}`;
        if (prodText) {
          prodText.innerText = isWorking ? `+${displayYield} Madera/dia` : '0 Madera/dia';
          prodText.title = "por día de juego";
        }
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
  
  const assignedIds = state.colonists ? state.colonists.filter(c => c.job && c.job.startsWith('quarries_')).map(c => `${c.id}:${c.job}`).join(',') : '';
  const freeColonistsStr = state.colonists ? state.colonists.filter(c => c.job === null).map(c => c.id).join(',') : '';
  const currentStatus = (state.quarries ? state.quarries.map(q => (q.isUnderConstruction ? '1' : '0') + '_' + (q.isUpgrading ? '1' : '0') + '_' + (q.tier || 1) + '_' + (q.isPaused ? '1' : '0') + '_' + (q.workerAssigned || 0)).join(',') : '') + `_assigned:${assignedIds}_free:${freeColonistsStr}`;
  
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
      const maxWorkers = quarry.isUnderConstruction || quarry.isUpgrading ? 2 : (quarry.tier || 1);
      if (quarry.isUnderConstruction || quarry.isUpgrading) {
        const isPaused = quarry.isPaused || false;
        const pauseBtnText = isPaused ? '▶️' : '⏸️';
        const badgeText = quarry.isUpgrading ? 'Mejorando' : 'Construyendo';
        const titleText = quarry.isUpgrading ? 
          `Foso de Piedra #${idx + 1} (Mejorando...)` : 
          `Foso de Piedra #${idx + 1} (En construcción)`;
        const statusTextVal = quarry.isUpgrading ? 'Mejorando...' : 'En construcción';
        html += `
          <div class="building-box" id="quarry-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="quarry-tier-badge-${idx}">${badgeText}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="quarry-title-${idx}">🏗️ ${titleText}</span>
              <span class="building-box-prod" id="quarry-prod-${idx}">${statusTextVal}</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="quarry-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; color: #a78bfa; font-weight: 600;">👷 ${quarry.workerAssigned || 0} / 2 Constructores auto</span>
                <div style="display: flex; gap: 0.25rem;">
                  <button class="btn btn-danger" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('quarries', ${idx})">
                    🗑️
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};" onclick="togglePauseConstruction('quarries', ${idx})">
                    ${pauseBtnText}
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;" id="quarry-btn-${idx}" onclick="togglePlayerConstruct('quarries', ${idx})">
                    🔨 Iniciar Construcción
                  </button>
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
            <div style="display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.25rem;">
              <span style="font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600;">Trabajadores:</span>
              ${renderBuildingWorkerDropdowns('quarries', idx, maxWorkers)}
            </div>
            <div style="margin-top: 0.4rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span id="quarry-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel 1</span>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-danger" style="font-size: 0.65rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('quarries', ${idx})">
                  🗑️
                </button>
                <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="quarry-upgrade-btn-${idx}" onclick="upgradeQuarry(${idx})">
                  Mejorar
                </button>
              </div>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.quarries.forEach((quarry, idx) => {
      if (quarry.isUnderConstruction || quarry.isUpgrading) {
        const isUpgrading = quarry.isUpgrading;
        const pBar = document.getElementById(`quarry-progress-${idx}`);
        const duration = quarry.constructionDuration || 5;
        const pct = Math.min(100, (quarry.constructionElapsed / duration) * 100);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const statusText = document.getElementById(`quarry-prod-${idx}`);
        if (statusText) {
          statusText.innerText = isUpgrading ? `Mejorando a Tier ${quarry.upgradingToTier || 2} (${pct.toFixed(0)}%)` : `Construyendo (${pct.toFixed(0)}%)`;
        }

        const titleText = document.getElementById(`quarry-title-${idx}`);
        if (titleText) {
          titleText.innerHTML = isUpgrading ? `🪨 Foso de Piedra #${idx + 1} (Mejorando...)` : `🪨 Foso de Piedra #${idx + 1} (En construcción)`;
        }
        
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
        const prodKey = `quarry_t${tier}`;
        const prodCfg = CONFIG.ProductionRate && CONFIG.ProductionRate[prodKey];
        const baseYield = prodCfg ? prodCfg.yield : (tier === 1 ? 5.0 : (tier === 2 ? 10.0 : 15.0));
        const duration = (prodCfg && prodCfg.duration) ? prodCfg.duration : 1.0;
        const workers = state.colonists ? state.colonists.filter(c => c.job === `quarries_${idx}`) : [];
        let mult = 0;
        workers.forEach(c => {
          const lvl = c.attributes.mining || 3;
          mult += getAttributeMult(lvl) * getColonistEfficiency(c);
        });
        const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
        
        const baseMin = prodCfg && prodCfg.output_min !== undefined ? prodCfg.output_min : baseYield;
        const baseMax = prodCfg && prodCfg.output_max !== undefined ? prodCfg.output_max : baseYield;
        const yieldMin = (baseMin / duration) * mult * dayDuration;
        const yieldMax = (baseMax / duration) * mult * dayDuration;
        
        let displayYield = '';
        if (Math.abs(yieldMax - yieldMin) > 0.01) {
          displayYield = `${yieldMin.toFixed(yieldMin % 1 === 0 ? 0 : 1)}-${yieldMax.toFixed(yieldMax % 1 === 0 ? 0 : 1)}`;
        } else {
          displayYield = yieldMin.toFixed(yieldMin % 1 === 0 ? 0 : 2);
        }
        
        const titleText = document.getElementById(`quarry-title-${idx}`);
        const prodText = document.getElementById(`quarry-prod-${idx}`);
        const tierBadge = document.getElementById(`quarry-tier-badge-${idx}`);
        const tierText = document.getElementById(`quarry-tier-text-${idx}`);
        const upgradeBtn = document.getElementById(`quarry-upgrade-btn-${idx}`);
        
        let bName = tier === 1 ? 'Foso de Piedra' : (tier === 2 ? 'Cantera' : 'Gran Mina de Piedra');
        
        if (titleText) titleText.innerHTML = `🪨 ${bName} #${idx + 1}`;
        if (prodText) {
          prodText.innerText = isWorking ? `+${displayYield} Piedra/dia` : '0 Piedra/dia';
          prodText.title = "por día de juego";
        }
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
  
  const assignedIds = state.colonists ? state.colonists.filter(c => c.job && c.job.startsWith('farms_')).map(c => `${c.id}:${c.job}`).join(',') : '';
  const freeColonistsStr = state.colonists ? state.colonists.filter(c => c.job === null).map(c => c.id).join(',') : '';
  const currentStatus = (state.farms ? state.farms.map(f => (f.isUnderConstruction ? '1' : '0') + '_' + f.stage + '_' + (f.needsWatering ? '1' : '0') + '_' + (f.isPaused ? '1' : '0') + '_' + (f.workerAssigned || 0)).join(',') : '') + `_assigned:${assignedIds}_free:${freeColonistsStr}`;
  
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
      const maxWorkers = farm.isUnderConstruction || farm.isUpgrading ? 2 : 1;
      if (farm.isUnderConstruction) {
        const isPaused = farm.isPaused || false;
        const pauseBtnText = isPaused ? '▶️' : '⏸️';
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
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; color: #a78bfa; font-weight: 600;">👷 ${farm.workerAssigned || 0} / 2 Constructores auto</span>
                <div style="display: flex; gap: 0.25rem;">
                  <button class="btn btn-danger" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('farms', ${idx})">
                    🗑️
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};" onclick="togglePauseConstruction('farms', ${idx})">
                    ${pauseBtnText}
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;" id="farm-btn-${idx}" onclick="togglePlayerConstruct('farms', ${idx})">
                    🔨 Iniciar Construcción
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        const dayDurationVal = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 100.0;
        let cropsOptionsHtml = '';
        for (let key in CROPS) {
          const crop = CROPS[key];
          const isSelected = farm.crop === key ? 'selected' : '';
          const emoji = key === 'wheat' ? '🌾' : (key === 'potato' ? '🥔' : '🥕');
          const cropDays = (crop.duration / dayDurationVal).toFixed(1).replace('.0', '');
          const daysText = cropDays === '1' ? '1 día' : `${cropDays} días`;
          cropsOptionsHtml += `<option value="${key}" ${isSelected}>${emoji} ${crop.name} (Costo: 1 Semilla, Duración: ${daysText}, Rend: ${crop.yield} Comida)</option>`;
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

            <div style="display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.25rem; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">Trabajador:</span>
              ${renderBuildingWorkerDropdowns('farms', idx, maxWorkers)}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.25rem; margin-top: 0.4rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem; width: 100%;">
              <button class="btn btn-danger" style="font-size: 0.75rem; padding: 0.4rem 0.6rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('farms', ${idx})">
                🗑️
              </button>
              <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.4rem 0.6rem; flex: 1;" id="farm-btn-${idx}" onclick="startFarmCycle(${idx})">
                Sembrar
              </button>
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
        
        // Multiplicador de agricultura del colono asignado
        const worker = state.colonists ? state.colonists.find(c => c.job === `farms_${idx}`) : null;
        const farmingLvl = worker ? (worker.attributes.farming || 3) : 3;
        const farmingMult = getAttributeMult(farmingLvl);

        const cycleTotal = crop ? getFarmCycleTotal(crop) : 1;
        const workerEff = worker ? getColonistEfficiency(worker) : 1.0;
        const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
        const rate = crop ? ((crop.yield * tierMultiplier * farmingMult * workerEff) / cycleTotal) * dayDuration : 0;
        const isWorking = farm.stage !== 'idle' && farm.workerAssigned > 0;
        const yieldVal = rate;
        const displayYield = yieldVal.toFixed(yieldVal % 1 === 0 ? 0 : 2);
        const prodText = isWorking ? `+${displayYield} Comida/dia` : '0 Comida/dia';
        
        const farmProd = document.getElementById(`farm-prod-${idx}`);
        if (farmProd) {
          farmProd.innerText = prodText;
          farmProd.title = "por día de juego";
        }

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
            const progressRem = Math.max(waterDailyDur - (farm.waterElapsed || 0), 0).toFixed(1);
            if (farm.workerAssigned === 0) {
              text = `💧 Regar (Pausado: Asigna aldeano) (Faltan ${progressRem}s)`;
            } else {
              const worker = state.colonists ? state.colonists.find(c => c.job === `farms_${idx}`) : null;
              const farmingLvl = worker ? (worker.attributes.farming || 3) : 3;
              const speedMultiplier = getAttributeMult(farmingLvl) * (worker ? getColonistEfficiency(worker) : 1.0);
              const rem = (speedMultiplier > 0) ? Math.max((waterDailyDur - (farm.waterElapsed || 0)) / speedMultiplier, 0).toFixed(1) : '—';
              text = `💧 Regando (Faltan ${rem}s)`;
            }
          } else {
            pct = Math.min(100, ((farm.stageElapsed || 0) / stageDuration) * 100);
            const progressRem = Math.max(stageDuration - (farm.stageElapsed || 0), 0).toFixed(1);
            if (farm.workerAssigned === 0) {
              text = `${stageEmoji} ${stageName} (Pausado: Asigna aldeano) (${progressRem}s)`;
            } else {
              let speedMultiplier = 1.0;
              if (requiresWorker) {
                const worker = state.colonists ? state.colonists.find(c => c.job === `farms_${idx}`) : null;
                const farmingLvl = worker ? (worker.attributes.farming || 3) : 3;
                speedMultiplier = getAttributeMult(farmingLvl) * (worker ? getColonistEfficiency(worker) : 1.0);
              }
              const rem = (speedMultiplier > 0) ? Math.max((stageDuration - (farm.stageElapsed || 0)) / speedMultiplier, 0).toFixed(1) : '—';
              text = `${stageEmoji} ${stageName} (Faltan ${rem}s)`;
            }
          }
          
          if (pBar) pBar.style.width = `${pct}%`;
          
          let waterWarning = '';
          if ((farm.stage === 'water' || farm.stage === 'water2') && !farm.waterPaid) {
            waterWarning = ' <span style="background-color: #ef4444; color: #fff; font-size: 0.65rem; padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 700; margin-left: 0.25rem;">⚠️ Sin agua hoy</span>';
          }
          if (statusText) {
            statusText.innerHTML = `[${activeCropObj.name}] ${text}${waterWarning}`;
          }
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
            btn.disabled = !state.seeds || (state.seeds[farm.crop] || 0) < 1;
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
  
  const residentsStr = state.colonists ? state.colonists.map(c => `${c.id}:${c.houseIdx}:${c.job}`).join(',') : '';
  const freeColonistsStr = state.colonists ? state.colonists.filter(c => c.job === null).map(c => c.id).join(',') : '';
  const currentStatus = (state.houses ? state.houses.map(h => (h.isUnderConstruction ? '1' : '0') + '_' + (h.isUpgrading ? '1' : '0') + '_' + h.tier + '_' + (h.isPaused ? '1' : '0') + '_' + (h.workerAssigned || 0)).join(',') : '') + `_residents:${residentsStr}_free:${freeColonistsStr}`;
  
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
          (house.upgradingToTier === 2 ? `Cabaña #${idx + 1} (Mejorando...)` : `Casa Grande #${idx + 1} (Mejorando...)`) : 
          `Choza #${idx + 1} (En construcción)`;
        const prodText = house.isUpgrading ? 'Mejorando...' : 'En construcción';
        const isPaused = house.isPaused || false;
        const pauseBtnText = isPaused ? '▶️' : '⏸️';
        
        html += `
          <div class="building-box" id="house-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="house-tier-badge-${idx}">${badgeText}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="house-title-${idx}">🏗️ ${titleText}</span>
              <span class="building-box-prod" id="house-prod-${idx}">${prodText}</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="house-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; color: #a78bfa; font-weight: 600;">👷 ${house.workerAssigned || 0} / 2 Constructores auto</span>
                <div style="display: flex; gap: 0.25rem;">
                  <button class="btn btn-danger" style="font-size: 0.75rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('houses', ${idx})">
                    🗑️
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};" onclick="togglePauseConstruction('houses', ${idx})">
                    ${pauseBtnText}
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;" id="house-btn-${idx}" onclick="togglePlayerConstruct('houses', ${idx})">
                    🔨 Iniciar Construcción
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        const basicHouseCfg = CONFIG.Building && CONFIG.Building.basic_house;
        const cap1 = basicHouseCfg ? basicHouseCfg.yield_amount : 1;
        const upgradedHouseCfg = CONFIG.Building && CONFIG.Building.upgraded_house;
        const cap2 = cap1 + (upgradedHouseCfg ? upgradedHouseCfg.yield_amount : 1);
        const luxuryHouseCfg = CONFIG.Building && CONFIG.Building.luxury_house;
        const cap3 = cap2 + (luxuryHouseCfg ? luxuryHouseCfg.yield_amount : 2);
        const capacity = house.tier === 1 ? cap1 : (house.tier === 2 ? cap2 : cap3);
        html += `
          <div class="building-box" id="house-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="house-tier-badge-${idx}">Tier ${house.tier}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="house-title-${idx}">🏠 Choza #${idx + 1}</span>
              <span class="building-box-prod" id="house-prod-${idx}">+${capacity} Capacidad</span>
            </div>
            
            <div style="margin-top: 0.4rem; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 0.4rem; display: flex; flex-direction: column; gap: 0.25rem;">
              <span style="font-size: 0.75rem; font-weight: 600; color: #fff;">Residentes:</span>
              ${renderHouseResidentDropdowns(idx, capacity)}
            </div>
            
            <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span id="house-tier-text-${idx}" style="font-size: 0.75rem; color: #a5b4fc; font-weight: 500;">Nivel 1 (Choza)</span>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-danger" style="font-size: 0.65rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('houses', ${idx})">
                  🗑️
                </button>
                <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="house-upgrade-btn-${idx}" onclick="upgradeHouseItem(${idx})">
                  Mejorar
                </button>
              </div>
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
        const basicHouseCfg = CONFIG.Building && CONFIG.Building.basic_house;
        const cap1 = basicHouseCfg ? basicHouseCfg.yield_amount : 1;
        
        const upgradedHouseCfg = CONFIG.Building && CONFIG.Building.upgraded_house;
        const cap2 = cap1 + (upgradedHouseCfg ? upgradedHouseCfg.yield_amount : 1);
        
        const luxuryHouseCfg = CONFIG.Building && CONFIG.Building.luxury_house;
        const cap3 = cap2 + (luxuryHouseCfg ? luxuryHouseCfg.yield_amount : 2);
        
        if (house.tier === 1) {
          if (titleText) titleText.innerHTML = `🏠 Choza #${idx + 1}`;
          if (prodText) prodText.innerText = `+${cap1} Capacidad`;
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
          if (prodText) prodText.innerText = `+${cap2} Capacidad`;
          if (tierText) tierText.innerText = `Nivel 2 (Cabaña)`;
          if (tierBadge) tierBadge.innerText = `Tier 2`;
          if (upgradeBtn) {
            const hLuxury = CONFIG.Building && CONFIG.Building.luxury_house ? CONFIG.Building.luxury_house : { cost_gold: 50, cost_wood: 80, cost_stone: 60 };
            upgradeBtn.innerText = `Mejorar (🪙${hLuxury.cost_gold}, 🪵${hLuxury.cost_wood}, 🪨${hLuxury.cost_stone})`;
            const canAfford = state.gold >= hLuxury.cost_gold && state.wood >= hLuxury.cost_wood && state.stone >= hLuxury.cost_stone;
            upgradeBtn.disabled = !canAfford;
            upgradeBtn.style.display = 'block';
          }
        } else {
          if (titleText) titleText.innerHTML = `🏰 Casa Grande #${idx + 1}`;
          if (prodText) prodText.innerText = `+${cap3} Capacidad`;
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
  if (!CONFIG || !CONFIG.Processing) return;
  const count = state.bonfires ? state.bonfires.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  
  const assignedIds = state.colonists ? state.colonists.filter(c => c.job && c.job.startsWith('bonfires_')).map(c => `${c.id}:${c.job}`).join(',') : '';
  const freeColonistsStr = state.colonists ? state.colonists.filter(c => c.job === null).map(c => c.id).join(',') : '';
  const currentStatus = (state.bonfires ? state.bonfires.map(b => (b.isUnderConstruction ? '1' : '0') + '_' + (b.isUpgrading ? '1' : '0') + '_' + (b.tier || 1) + '_' + (b.selectedRecipe || 'wheat') + '_' + (b.isPaused ? '1' : '0') + '_' + (b.workerAssigned || 0)).join(',') : '') + `_assigned:${assignedIds}_free:${freeColonistsStr}`;
  
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
      const maxWorkers = bonfire.isUnderConstruction || bonfire.isUpgrading ? 2 : (bonfire.tier || 1);
      if (bonfire.isUnderConstruction) {
        const isPaused = bonfire.isPaused || false;
        const pauseBtnText = isPaused ? '▶️' : '⏸️';
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
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; color: #a78bfa; font-weight: 600;">👷 ${bonfire.workerAssigned || 0} / 2 Constructores auto</span>
                <div style="display: flex; gap: 0.25rem;">
                  <button class="btn btn-danger" style="font-size: 0.75rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('bonfires', ${idx})">
                    🗑️
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};" onclick="togglePauseConstruction('bonfires', ${idx})">
                    ${pauseBtnText}
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.4rem;" id="bonfire-construct-btn-${idx}" onclick="togglePlayerConstruct('bonfires', ${idx})">
                    🔨 Iniciar Construcción
                  </button>
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
              <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">Siguiente receta (próxima iteración):</span>
              <select id="bonfire-recipe-${idx}" onchange="changeBonfireRecipe(${idx}, this.value)" style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; padding: 0.25rem; font-family: var(--font-primary); font-size: 0.75rem; outline: none; cursor: pointer;">
                <option value="wheat" ${recipe === 'wheat' ? 'selected' : ''}>🍞 Trigo -> Pan</option>
                <option value="potato" ${recipe === 'potato' ? 'selected' : ''}>🥔 Patata -> Patata Asada</option>
                <option value="carrot" ${recipe === 'carrot' ? 'selected' : ''}>🥕 Zanahoria -> Zanahoria Asada</option>
                <option value="berries" ${recipe === 'berries' ? 'selected' : ''}>🍯 Frutos -> Mermelada</option>
              </select>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.25rem; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">Trabajadores:</span>
              ${renderBuildingWorkerDropdowns('bonfires', idx, maxWorkers)}
            </div>
 
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: 0.4rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.4rem 0.6rem; width: 100%;" id="bonfire-btn-${idx}" onclick="cookManually(${idx})">
                Cocinar Manual
              </button>
            </div>
 
            <div style="margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
              <span id="bonfire-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel 1 (Fogata)</span>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-danger" style="font-size: 0.65rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('bonfires', ${idx})">
                  🗑️
                </button>
                <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="bonfire-upgrade-btn-${idx}" onclick="upgradeBonfire(${idx})">
                  Mejorar
                </button>
              </div>
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
          recipeSelect.disabled = false;
        }

        const minFood = autoRec ? autoRec.consume_amount : 1;
        if (btn) btn.disabled = bonfire.isRunning || (state[recipe] || 0) < minFood;

        if (bonfire.isRunning) {
          const targetDuration = bonfire.mode === 'manual' ? manualRec.duration : autoRec.duration;
          const pct = Math.min(100, (bonfire.elapsed / targetDuration) * 100);
          if (pBar) pBar.style.width = `${pct}%`;
          
          let speedMultiplier = 1.0;
          if (bonfire.mode === 'auto') {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `bonfires_${idx}`) : [];
            let mult = 0;
            workers.forEach(c => {
              const lvl = c.attributes.cooking || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
            speedMultiplier = mult;
          }
          
          const rem = (speedMultiplier > 0) ? Math.max((targetDuration - bonfire.elapsed) / speedMultiplier, 0).toFixed(0) : '—';
          const runningRecipe = bonfire.activeRecipe || recipe;
          const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria', berries: 'Frutos' };
          const ingredientName = rawNames[runningRecipe] || runningRecipe;
          if (statusText) {
            if (bonfire.mode === 'auto' && bonfire.workerAssigned === 0) {
              const progressRem = Math.max(targetDuration - bonfire.elapsed, 0).toFixed(0);
              statusText.innerText = `Cocinando ${ingredientName} (Pausado: Sin Cocinero) (${progressRem}s)`;
            } else {
              statusText.innerText = `Cocinando ${ingredientName} (Faltan ${rem}s)`;
            }
          }
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
  
  const assignedIds = state.colonists ? state.colonists.filter(c => c.job && c.job.startsWith('granaries_')).map(c => `${c.id}:${c.job}`).join(',') : '';
  const freeColonistsStr = state.colonists ? state.colonists.filter(c => c.job === null).map(c => c.id).join(',') : '';
  const currentStatus = (state.granaries ? state.granaries.map(g => (g.isUnderConstruction ? '1' : '0') + '_' + (g.isUpgrading ? '1' : '0') + '_' + (g.tier || 1) + '_' + (g.selectedCrop || 'wheat') + '_' + (g.isPaused ? '1' : '0') + '_' + (g.workerAssigned || 0)).join(',') : '') + `_assigned:${assignedIds}_free:${freeColonistsStr}`;
  
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
      const maxWorkers = granary.isUnderConstruction || granary.isUpgrading ? 2 : (granary.tier || 1);
      if (granary.isUnderConstruction || granary.isUpgrading) {
        const badgeText = granary.isUpgrading ? 'Mejorando' : 'Construyendo';
        const titleText = granary.isUpgrading ? 
          `Granero #${idx + 1} (Mejorando...)` : 
          `Granero #${idx + 1} (En construcción)`;
        const statusTextVal = granary.isUpgrading ? 'Mejorando...' : 'En construcción';
        const isPaused = granary.isPaused || false;
        const pauseBtnText = isPaused ? '▶️' : '⏸️';
        html += `
          <div class="building-box" id="granary-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="granary-tier-badge-${idx}">${badgeText}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="granary-title-${idx}">🏗️ ${titleText}</span>
              <span class="building-box-prod" id="granary-status-${idx}">${statusTextVal}</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="granary-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; color: #a78bfa; font-weight: 600;">👷 ${granary.workerAssigned || 0} / 2 Constructores auto</span>
                <div style="display: flex; gap: 0.25rem;">
                  <button class="btn btn-danger" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('granaries', ${idx})">
                    🗑️
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};" onclick="togglePauseConstruction('granaries', ${idx})">
                    ${pauseBtnText}
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;" id="granary-construct-btn-${idx}" onclick="togglePlayerConstruct('granaries', ${idx})">
                    🔨 Iniciar Construcción
                  </button>
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
              <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">Siguiente semilla (próxima iteración):</span>
              <select id="granary-crop-${idx}" onchange="changeGranaryRecipe(${idx}, this.value)" style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; padding: 0.25rem; font-family: var(--font-primary); font-size: 0.75rem; outline: none; cursor: pointer;">
                <option value="wheat" ${crop === 'wheat' ? 'selected' : ''}>🌾 Trigo -> Semillas Trigo</option>
                <option value="potato" ${crop === 'potato' ? 'selected' : ''}>🥔 Patata -> Semillas Patata</option>
                <option value="carrot" ${crop === 'carrot' ? 'selected' : ''}>🥕 Zanahoria -> Semillas Zanahoria</option>
              </select>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.25rem; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">Trabajadores:</span>
              ${renderBuildingWorkerDropdowns('granaries', idx, maxWorkers)}
            </div>
 
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: 0.4rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.4rem 0.6rem; width: 100%;" id="granary-btn-${idx}" onclick="processGranaryManually(${idx})">
                Procesar Manual
              </button>
            </div>
 
            <div style="margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
              <span id="granary-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel 1 (Granero)</span>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-danger" style="font-size: 0.65rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('granaries', ${idx})">
                  🗑️
                </button>
                <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="granary-upgrade-btn-${idx}" onclick="upgradeGranary(${idx})">
                  Mejorar
                </button>
              </div>
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
          cropSelect.disabled = false;
        }
        
        const minFood = recipe ? recipe.consume_amount : 5;
        if (btn) btn.disabled = granary.isRunning || (state[cropKey] || 0) < minFood;
        
        if (granary.isRunning) {
          const runningCrop = granary.activeCrop || cropKey;
          const runningRecipeKey = `granary_${runningCrop}_t${tier}`;
          const runningRecipe = CONFIG.Processing && CONFIG.Processing[runningRecipeKey];
          const targetDuration = runningRecipe ? runningRecipe.duration : 3.0;
          const pct = Math.min(100, (granary.elapsed / targetDuration) * 100);
          if (pBar) pBar.style.width = `${pct}%`;
          
          let speedMultiplier = 1.0;
          if (granary.mode === 'auto') {
            const workers = state.colonists ? state.colonists.filter(c => c.job === `granaries_${idx}`) : [];
            let mult = 0;
            workers.forEach(c => {
              const lvl = c.attributes.farming || 3;
              mult += getAttributeMult(lvl) * getColonistEfficiency(c);
            });
            speedMultiplier = mult;
          }
          
          const rem = (speedMultiplier > 0) ? Math.max((targetDuration - granary.elapsed) / speedMultiplier, 0).toFixed(0) : '—';
          const rawNames = { wheat: 'Trigo', potato: 'Patata', carrot: 'Zanahoria' };
          const ingredientName = rawNames[runningCrop] || runningCrop;
          if (statusText) {
            if (granary.mode === 'auto' && granary.workerAssigned === 0) {
              const progressRem = Math.max(targetDuration - granary.elapsed, 0).toFixed(0);
              statusText.innerText = `Procesando ${ingredientName} (Pausado: Sin Trabajador) (${progressRem}s)`;
            } else {
              statusText.innerText = `Procesando ${ingredientName} (Faltan ${rem}s)`;
            }
          }
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
  const isPaused = count > 0 ? (state.markets[0].isPaused || false) : false;
  const workerAssigned = count > 0 ? (state.markets[0].workerAssigned || 0) : 0;

  // Render container if state changed
  if (lastMarketUIBuilt !== built || lastMarketUIUnderConst !== underConst || window.lastMarketUIPaused !== isPaused || window.lastMarketUIWorkerAssigned !== workerAssigned || container.children.length === 0) {
    lastMarketUIBuilt = built;
    lastMarketUIUnderConst = underConst;
    window.lastMarketUIPaused = isPaused;
    window.lastMarketUIWorkerAssigned = workerAssigned;

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
      const pauseBtnText = isPaused ? '▶️ Reanudar Obra' : '⏸️ Pausar Obra';
      html = `
        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          <span style="font-size: 0.85rem; color: var(--color-text-muted);">Construyendo el Puesto de Mercado para habilitar el comercio.</span>
          <div class="progress-bar-container" style="height: 10px; margin: 0.5rem 0; background: rgba(25, 25, 25, 0.1); border-radius: 4px; overflow: hidden; width: 100%;">
            <div class="progress-bar-fill" id="market-build-progress-bar" style="height: 100%; background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%); transition: width 0.1s ease-out; width: 0%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <span id="market-build-progress-text" style="font-size: 0.8rem; color: var(--color-text-muted);">Progreso: 0%</span>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span style="font-size: 0.8rem; color: #a78bfa; font-weight: 600;">👷 ${state.markets[0].workerAssigned || 0} / 2 Constructores auto</span>
              <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('markets', 0)">
                🗑️ Demoler
              </button>
              <button class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};" onclick="togglePauseConstruction('markets', 0)">
                ${pauseBtnText}
              </button>
              <button class="btn" id="btn-construct-market" onclick="togglePlayerConstruct('markets', 0)" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                Iniciar Construcción
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      html = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%;">
          <div style="display: flex; align-items: center; gap: 0.75rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.75rem 1rem; border-radius: 8px;">
            <span style="font-size: 1.5rem;">✅</span>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.9rem; font-weight: 700; color: #34d399;">Edificio Construido y Operativo</span>
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">El Puesto de Mercado está activo. Puedes gestionar mercaderes y automatización desde la pestaña de <strong>Comercio</strong>.</span>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; display: flex; align-items: center; gap: 0.25rem;" onclick="destroyBuildingPrompt('markets', 0)">
              🗑️ Demoler Mercado
            </button>
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
    if (Math.abs(rateVal) > 0.001) {
      const formatted = rateVal.toFixed(rateVal % 1 === 0 ? 0 : 2);
      return rateVal > 0 ? `+${formatted}/dia` : `${formatted}/dia`;
    } else {
      return `0/dia`;
    }
  }

  if (DOM.rateGold) {
    DOM.rateGold.textContent = formatRate(calculatedRates.gold);
    DOM.rateGold.className = (calculatedRates.gold > 0.001) ? 'resource-rate rate-positive' : 'resource-rate rate-neutral';
    DOM.rateGold.title = "por día de juego";
  }

  if (DOM.rateWood) {
    DOM.rateWood.textContent = formatRate(calculatedRates.wood);
    DOM.rateWood.className = (calculatedRates.wood > 0.001) ? 'resource-rate rate-positive' : 'resource-rate rate-neutral';
    DOM.rateWood.title = "por día de juego";
  }

  if (DOM.rateStone) {
    DOM.rateStone.textContent = formatRate(calculatedRates.stone);
    DOM.rateStone.className = (calculatedRates.stone > 0.001) ? 'resource-rate rate-positive' : 'resource-rate rate-neutral';
    DOM.rateStone.title = "por día de juego";
  }

  DOM.rateFood.textContent = formatRate(calculatedRates.food);
  DOM.rateFood.title = "por día de juego";
  if (calculatedRates.food > 0.001) {
    DOM.rateFood.className = 'resource-rate rate-positive';
  } else if (calculatedRates.food < -0.001) {
    DOM.rateFood.className = 'resource-rate rate-negative';
  } else {
    DOM.rateFood.className = 'resource-rate rate-neutral';
  }

  if (DOM.rateCooked) {
    DOM.rateCooked.textContent = formatRate(calculatedRates.cooked);
    DOM.rateCooked.title = "por día de juego";
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
  if (!CONFIG || !CONFIG.BasicGathering || !CONFIG.Building) return;
  if (typeof recalculateStorageCapacity === 'function') recalculateStorageCapacity();
  renderDetailedFoodInventory();
  renderDetailedResourcesInventory();
  renderWarehouses();
  DOM.resGold.textContent = Math.floor(state.gold);
  if (DOM.resWood) DOM.resWood.textContent = Math.floor(state.wood);
  if (DOM.resStone) DOM.resStone.textContent = Math.floor(state.stone);
  
  const foodOcc = typeof getFoodOccupation === 'function' ? getFoodOccupation() : 0;
  const foodCap = state.maxFoodCapacity || 100;
  const foodNutri = Math.floor(state.food);
  if (DOM.resFood) {
    DOM.resFood.textContent = `${Math.floor(foodOcc)} / ${foodCap}`;
    
    let nutriEl = document.getElementById('res-food-nutrition');
    if (!nutriEl) {
      nutriEl = document.createElement('div');
      nutriEl.id = 'res-food-nutrition';
      nutriEl.style.fontSize = '0.7rem';
      nutriEl.style.color = 'var(--color-text-muted)';
      nutriEl.style.fontWeight = '500';
      nutriEl.style.marginTop = '0.2rem';
      DOM.resFood.parentNode.insertBefore(nutriEl, document.getElementById('rate-food'));
    }
    nutriEl.textContent = `Nutrición: ${foodNutri}`;
  }
  
  const resourcesCardVal = document.querySelector('#card-resources .resource-value');
  if (resourcesCardVal) {
    const resOcc = typeof getResourcesOccupation === 'function' ? getResourcesOccupation() : 0;
    const resCap = state.maxResourcesCapacity || 100;
    
    resourcesCardVal.style.fontSize = '';
    resourcesCardVal.style.color = '';
    resourcesCardVal.style.fontWeight = '';
    resourcesCardVal.style.marginTop = '';
    resourcesCardVal.textContent = `${Math.round(resOcc)} / ${resCap}`;
    
    let subEl = document.getElementById('res-detail-subtitle');
    if (!subEl) {
      subEl = document.createElement('div');
      subEl.id = 'res-detail-subtitle';
      subEl.style.fontSize = '0.7rem';
      subEl.style.color = 'var(--color-text-muted)';
      subEl.style.fontWeight = '500';
      subEl.style.marginTop = '0.2rem';
      subEl.textContent = 'Ver detalles';
      resourcesCardVal.parentNode.appendChild(subEl);
    }
  }
  if (DOM.resCooked) DOM.resCooked.textContent = Math.floor(state.cookedFood || 0);
  if (DOM.resWheat) DOM.resWheat.textContent = Math.floor(state.wheat || 0);
  if (DOM.resPotato) DOM.resPotato.textContent = Math.floor(state.potato || 0);
  if (DOM.resCarrot) DOM.resCarrot.textContent = Math.floor(state.carrot || 0);
  if (DOM.resBerries) DOM.resBerries.textContent = Math.floor(state.berries || 0);
  const totalColonists = state.colonists ? state.colonists.length : 0;
  const freeColonists = state.colonists ? state.colonists.filter(c => c.job === null).length : 0;
  if (state.starvingColonists > 0) {
    DOM.resColonists.innerHTML = `${totalColonists} / ${state.maxPopulation} <span style="font-size: 0.8rem; color: #f87171; font-weight: bold; margin-left: 0.25rem;">(⚠️${state.starvingColonists})</span>`;
  } else {
    DOM.resColonists.textContent = `${totalColonists} / ${state.maxPopulation}`;
  }
  DOM.resFreeColonists.textContent = `Libres: ${freeColonists}`;

  // Actualizar tarjeta de Alimentación
  const starvingVal = document.getElementById('starving-count-val');
  if (starvingVal) starvingVal.textContent = state.starvingColonists || 0;
  
  const effVal = document.getElementById('colony-efficiency-val');
  if (effVal) {
    const effPercent = (getWorkEfficiency() * 100).toFixed(0);
    effVal.textContent = `${effPercent}%`;
    effVal.style.color = getWorkEfficiency() === 1 ? '#4ade80' : (getWorkEfficiency() > 0.5 ? '#facc15' : '#f87171');
  }

  // Asignación de leñadores/mineros/foragers con desplegables
  renderBasicJobDropdowns('wood');
  renderBasicJobDropdowns('stone');
  renderBasicJobDropdowns('berries');
  
  const dayDuration = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;

  const woodDuration = CONFIG.BasicGathering.wood_auto.duration;
  const woodYield = CONFIG.BasicGathering.wood_auto.yield;
  const woodcutters = state.colonists ? state.colonists.filter(c => c.job === 'wood') : [];
  let woodMult = 0;
  woodcutters.forEach(c => {
    const lvl = c.attributes.woodcutting || 3;
    woodMult += getAttributeMult(lvl) * getColonistEfficiency(c);
  });
  const woodRateVal = woodMult * (woodYield / woodDuration) * dayDuration;
  DOM.woodAutoInfo.textContent = `+${woodRateVal.toFixed(woodRateVal % 1 === 0 ? 0 : 2)}/dia`;
  
  const stoneDuration = CONFIG.BasicGathering.stone_auto.duration;
  const stoneYield = CONFIG.BasicGathering.stone_auto.yield;
  const miners = state.colonists ? state.colonists.filter(c => c.job === 'stone') : [];
  let stoneMult = 0;
  miners.forEach(c => {
    const lvl = c.attributes.mining || 3;
    stoneMult += getAttributeMult(lvl) * getColonistEfficiency(c);
  });
  const stoneRateVal = stoneMult * (stoneYield / stoneDuration) * dayDuration;
  DOM.stoneAutoInfo.textContent = `+${stoneRateVal.toFixed(stoneRateVal % 1 === 0 ? 0 : 2)}/dia`;

  const berriesDuration = CONFIG.BasicGathering.berries_auto.duration;
  const berriesYield = CONFIG.BasicGathering.berries_auto.yield;
  const foragers = state.colonists ? state.colonists.filter(c => c.job === 'berries') : [];
  let berriesMult = 0;
  foragers.forEach(c => {
    const lvl = c.attributes.exploration || 3;
    berriesMult += getAttributeMult(lvl) * getColonistEfficiency(c);
  });
  const berriesRateVal = berriesMult * (berriesYield / berriesDuration) * dayDuration;
  DOM.berriesAutoInfo.textContent = `+${berriesRateVal.toFixed(berriesRateVal % 1 === 0 ? 0 : 2)}/dia`;

  // Renderizar y actualizar los edificios individuales en tab-production
  renderHouses();
  renderLumberMills();
  renderQuarries();
  renderFarms();
  renderBonfires();
  renderGranaries();
  renderWells();
  renderMarketBuildingUI();

  // Actualizar display de Agua Diaria
  const cardWater = document.getElementById('card-water');
  if (cardWater) {
    if (state.waterMax > 0) {
      cardWater.style.display = 'flex';
      const resWater = document.getElementById('res-water');
      if (resWater) {
        resWater.textContent = `${Math.floor(state.waterToday)} / ${Math.floor(state.waterMax)}`;
      }
    } else {
      cardWater.style.display = 'none';
    }
  }

  // Viviendas construidas
  if (DOM.countBasicHouses) DOM.countBasicHouses.textContent = `Construidas: ${state.basicHouses}`;

  // Contadores en Construcción
  const countLumbermillsEl = document.getElementById('count-lumbermills');
  if (countLumbermillsEl) countLumbermillsEl.innerText = `Construidos: ${state.lumberMills.length}`;
  const countQuarriesEl = document.getElementById('count-quarries');
  if (countQuarriesEl) countQuarriesEl.innerText = `Construidas: ${state.quarries.length}`;
  const countFarmsEl = document.getElementById('count-farms');
  if (countFarmsEl) countFarmsEl.innerText = `Construidas: ${state.farms ? state.farms.length : 0}`;
  if (DOM.countBonfires) DOM.countBonfires.innerText = `Construidas: ${state.bonfires ? state.bonfires.length : 0}`;
  const countMarketsEl = document.getElementById('count-markets');
  if (countMarketsEl) countMarketsEl.innerText = `Construidos: ${state.markets ? state.markets.length : 0}`;
  if (DOM.countGranaries) DOM.countGranaries.innerText = `Construidos: ${state.granaries ? state.granaries.length : 0}`;
  const countWellsEl = document.getElementById('count-wells');
  if (countWellsEl) countWellsEl.innerText = `Construidos: ${state.wells ? state.wells.length : 0}`;

  // Contadores de almacenes construidos
  const countWoodW = document.getElementById('count-warehouse-wood');
  if (countWoodW) countWoodW.innerText = `Construidos: ${state.warehouses ? state.warehouses.filter(w => w.type === 'wood' && !w.isUnderConstruction).length : 0}`;
  const countStoneW = document.getElementById('count-warehouse-stone');
  if (countStoneW) countStoneW.innerText = `Construidos: ${state.warehouses ? state.warehouses.filter(w => w.type === 'stone' && !w.isUnderConstruction).length : 0}`;
  const countFoodW = document.getElementById('count-warehouse-food');
  if (countFoodW) countFoodW.innerText = `Construidos: ${state.warehouses ? state.warehouses.filter(w => w.type === 'food' && !w.isUnderConstruction).length : 0}`;
  const countSeedsW = document.getElementById('count-warehouse-seeds');
  if (countSeedsW) countSeedsW.innerText = `Construidos: ${state.warehouses ? state.warehouses.filter(w => w.type === 'seeds' && !w.isUnderConstruction).length : 0}`;

  // Renderizado de Comercio (Comercio Personal siempre abierto, Caravanas requiere mercado)
  if (typeof renderTradeTab === 'function') {
    renderTradeTab();
  }
  if (typeof updatePlayerTravelOverlay === 'function') {
    updatePlayerTravelOverlay();
  }

  // Actualizar estadísticas de colonos y desglose de trabajos
  if (DOM.statsFreeColonists) DOM.statsFreeColonists.textContent = freeColonists;
  if (DOM.statsTotalColonists) DOM.statsTotalColonists.textContent = `${totalColonists} / ${state.maxPopulation}`;
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
  renderHiringCandidates();
  renderColonistsDetailList();
  renderColonistsSummaryJobs();
  updateButtonStates();
  renderDevPanel();
  renderPlayerConstructionBanner();

  // Actualizar tarjeta de reputación y tablón de pedidos (PASO I - REP-TABL)
  const resReputationEl = document.getElementById('res-reputation');
  if (resReputationEl) {
    resReputationEl.textContent = state.reputation || 0;
  }
  renderOrders();
  renderMissions();
}

if (typeof window.lastRenderedTownHallAssigned === 'undefined') {
  window.lastRenderedTownHallAssigned = null;
  window.lastRenderedTownHallFree = null;
}

function renderTownHallUI() {
  const container = document.getElementById('townhall-ui-container');
  if (!container) return;
  
  const built = state.townHall.built;
  const tier = state.townHall.tier;
  const underConst = state.townHall.isUnderConstruction;
  const upgrading = state.townHall.isUpgrading;
  const isPaused = state.townHall.isPaused || false;
  const workerAssigned = state.townHall.workerAssigned || 0;
  
  if (lastRenderedTownHallBuilt === built && lastRenderedTownHallTier === tier && lastRenderedTownHallUnderConst === underConst && lastRenderedTownHallUpgrading === upgrading && window.lastRenderedTownHallIsPaused === isPaused && window.lastRenderedTownHallWorkerAssigned === workerAssigned) {
    if (underConst || upgrading) {
      const pBar = document.getElementById('townhall-progress-bar');
      const duration = state.townHall.constructionDuration || 1;
      const pct = Math.min(100, ((state.townHall.constructionElapsed || 0) / duration) * 100);
      if (pBar) pBar.style.width = pct + '%';
      const pText = document.getElementById('townhall-progress-text');
      if (pText) pText.innerText = 'Progreso: ' + pct.toFixed(0) + '%';
      
      const isPlayerOnTH = state.playerConstructing && state.playerConstructing.type === 'townHall';
      const btn = document.getElementById('btn-construct-townhall');
      if (btn) {
        btn.className = 'btn ' + (isPlayerOnTH ? 'btn-primary' : 'btn-secondary');
        btn.innerHTML = isPlayerOnTH ? '🔨 Construyendo...' : '🔨 Iniciar Construcción';
      }
    }
    return;
  }
  
  lastRenderedTownHallBuilt = built;
  lastRenderedTownHallTier = tier;
  lastRenderedTownHallUnderConst = underConst;
  lastRenderedTownHallUpgrading = upgrading;
  window.lastRenderedTownHallIsPaused = isPaused;
  window.lastRenderedTownHallWorkerAssigned = workerAssigned;
  
  const titleSpan = document.getElementById('townhall-module-title-text');
  if (titleSpan) {
    let moduleTitle = "🏛️ Casa del Jugador";
    if (built) {
      if (tier === 2) moduleTitle = "🏛️ Centro Comunitario";
      else if (tier === 3) moduleTitle = "🏛️ Ayuntamiento";
    }
    titleSpan.innerHTML = moduleTitle;
  }
  
  const cfg = CONFIG.Building.townhall;
  const cfg_t2 = CONFIG.Building.townhall_t2;
  const cfg_t3 = CONFIG.Building.townhall_t3;
  
  if (!state.townHall.built) {
    container.innerHTML = `
      <div class="building-item" style="border: 1px dashed #f87171; background: rgba(239, 68, 68, 0.05); padding: 1rem; border-radius: 8px;">
        <div class="building-info">
          <span class="building-name" style="font-size: 1.1rem; font-weight: 700; color: #f87171;">Casa del Jugador (No Construida)</span>
          <span class="building-desc" style="margin-top: 0.25rem;">Establece la residencia del líder de la colonia. Permite desbloquear y construir otros edificios.</span>
          <div class="costs-list" style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <span class="cost-badge" id="cost-townhall-wood">🪵 ${cfg.cost_wood} Madera</span>
            <span class="cost-badge" id="cost-townhall-stone">🪨 ${cfg.cost_stone} Piedra</span>
          </div>
          <div style="margin-top: 0.75rem; color: #f87171; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem;">
            <span>⚠️ Debes construir la Casa del Jugador antes de construir cualquier otra cosa.</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
          <button class="btn btn-secondary" id="btn-build-townhall" onclick="buildTownHall()" style="background: hsl(var(--color-primary)); color: #fff; border-color: hsl(var(--color-primary));">
            Construir Casa del Jugador
          </button>
        </div>
      </div>
    `;
  } else if (state.townHall.isUnderConstruction || state.townHall.isUpgrading) {
    const pct = Math.min(100, ((state.townHall.constructionElapsed || 0) / (state.townHall.constructionDuration || 1)) * 100);
    const isPlayerOnTH = state.playerConstructing && state.playerConstructing.type === 'townHall';
    const thNames = { 1: "Casa del Jugador", 2: "Centro Comunitario", 3: "Ayuntamiento" };
    const titleText = state.townHall.isUpgrading ? 
      `${thNames[state.townHall.tier]} (Mejorando a ${thNames[state.townHall.upgradingToTier]})` : 
      `Casa del Jugador (En construcción)`;
    const pauseBtnText = isPaused ? '▶️ Reanudar Obra' : '⏸️ Pausar Obra';
    const descText = state.townHall.isUpgrading ? 
      `Mejorando la sede central de la colonia.` : 
      `Se está construyendo la residencia del líder.`;
    
    container.innerHTML = `
      <div class="building-item" style="border: 1px dashed #3b82f6; background: rgba(59, 130, 246, 0.05); padding: 1rem; border-radius: 8px;">
        <div class="building-info" style="width: 100%;">
          <span class="building-name" style="font-size: 1.1rem; font-weight: 700; color: #60a5fa;">${titleText}</span>
          <span class="building-desc" style="margin-top: 0.25rem;">
            ${descText}
          </span>
          <div class="progress-bar-container" style="height: 10px; margin: 0.75rem 0; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; width: 100%;">
            <div class="progress-bar-fill" id="townhall-progress-bar" style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%); transition: width 0.1s ease-out;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <span id="townhall-progress-text" style="font-size: 0.8rem; color: var(--color-text-muted);">Progreso: ${pct.toFixed(0)}%</span>
            
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <span style="font-size: 0.8rem; color: #a78bfa; font-weight: 600;">👷 ${state.townHall.workerAssigned || 0} / 2 Constructores auto</span>
              
              <button class="btn" onclick="togglePauseConstruction('townHall')" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};">
                ${pauseBtnText}
              </button>
              
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
    const thNames = { 1: "Casa del Jugador", 2: "Centro Comunitario", 3: "Ayuntamiento" };
    const currentName = thNames[tier] || "Casa del Jugador";
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
          Mejorar a Centro Comunitario
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
          Mejorar a Ayuntamiento
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
          <span class="building-name" style="font-size: 1.1rem; font-weight: 700; color: #a5b4fc;">${currentName} (Nivel ${tier})</span>
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

function getCostsListContainer(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return null;
  const item = btn.closest('.building-item');
  if (item) {
    return item.querySelector('.costs-list');
  }
  return null;
}

function getBuildingCostBadgesHTML(cfg) {
  if (!cfg) return '';
  let html = '';
  if (cfg.cost_gold) html += `<span class="cost-badge" data-resource="gold">🪙 ${cfg.cost_gold} Oro</span>`;
  if (cfg.cost_wood) html += `<span class="cost-badge" data-resource="wood">🪵 ${cfg.cost_wood} Madera</span>`;
  if (cfg.cost_stone) html += `<span class="cost-badge" data-resource="stone">🪨 ${cfg.cost_stone} Piedra</span>`;
  if (cfg.cost_iron) html += `<span class="cost-badge" data-resource="iron">⛓️ ${cfg.cost_iron} Hierro</span>`;
  if (cfg.cost_reputation) html += `<span class="cost-badge" data-resource="reputation">🏆 ${cfg.cost_reputation} Rep.</span>`;
  return html;
}

function updateBuildingCostDisplays(btnId, cfg) {
  const container = getCostsListContainer(btnId);
  if (container) {
    container.innerHTML = getBuildingCostBadgesHTML(cfg);
  }
}

function updateCostBadgesAffordability(btnId, cfg) {
  const container = getCostsListContainer(btnId);
  if (!container || !cfg) return;
  const badges = container.querySelectorAll('.cost-badge');
  badges.forEach(badge => {
    const resource = badge.getAttribute('data-resource');
    let amount = 0;
    if (resource === 'gold') amount = cfg.cost_gold;
    else if (resource === 'wood') amount = cfg.cost_wood;
    else if (resource === 'stone') amount = cfg.cost_stone;
    else if (resource === 'iron') amount = cfg.cost_iron;
    else if (resource === 'reputation') amount = cfg.cost_reputation;
    
    const userStock = resource === 'reputation' ? (state.reputation || 0) : (state[resource] || 0);
    const canAfford = userStock >= amount;
    
    if (canAfford) {
      badge.classList.remove('insufficient');
      badge.style.color = '';
    } else {
      badge.classList.add('insufficient');
      badge.style.color = '#fb923c';
    }
  });
}

// Controla habilitado/deshabilitado de botones
function updateButtonStates() {
  if (!CONFIG || !CONFIG.Building) return;

  const bHire = CONFIG.Building.hire_colonist || (CONFIG.Sales && CONFIG.Sales.hire_colonist) || { cost_gold: 50 };

  const thBuilt = state.townHall.built && !state.townHall.isUnderConstruction;
  
  const updateBtnState = (btnId, cfg, needsTh = true) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.disabled = (needsTh && !thBuilt) || !canAffordBuilding(cfg) || state.playerOnMission;
      updateCostBadgesAffordability(btnId, cfg);
    }
  };
  
  updateBtnState('btn-build-basic', CONFIG.Building.basic_house);
  updateBtnState('btn-build-lumbermill', CONFIG.Building.lumbermill);
  updateBtnState('btn-build-quarry', CONFIG.Building.quarry);
  updateBtnState('btn-build-farm', CONFIG.Building.farm);
  updateBtnState('btn-build-bonfire', CONFIG.Building.bonfire);
  updateBtnState('btn-build-market', CONFIG.Building.market);
  updateBtnState('btn-build-granary', CONFIG.Building.granary);
  updateBtnState('btn-build-well', CONFIG.Building.well);
  
  if (!state.townHall.built) {
    updateBtnState('btn-build-townhall', CONFIG.Building.townhall, false);
  } else {
    const tier = state.townHall.tier;
    if (tier === 1) {
      updateBtnState('btn-upgrade-townhall', CONFIG.Building.townhall_t2, false);
    } else if (tier === 2) {
      updateBtnState('btn-upgrade-townhall', CONFIG.Building.townhall_t3, false);
    }
  }

  // Repurpose wood warehouse card to Resource Warehouse
  const btnWood = document.getElementById('btn-build-warehouse-wood');
  if (btnWood) {
    const item = btnWood.closest('.building-item');
    if (item) {
      const nameEl = item.querySelector('.building-name');
      if (nameEl) nameEl.textContent = 'Almacén de Recursos';
      const descEl = item.querySelector('.building-desc');
      if (descEl) descEl.textContent = 'Aumenta la capacidad máxima de recursos (Madera, Piedra, Oro, Semillas) en +200.';
      
      const countEl = document.getElementById('count-warehouse-wood');
      if (countEl) {
        const builtCount = state.warehouses ? state.warehouses.filter(w => w.type === 'resource' && !w.isUnderConstruction).length : 0;
        countEl.textContent = `Construidos: ${builtCount}`;
      }
    }
  }

  // Repurpose food warehouse card to Food Granary
  const btnFood = document.getElementById('btn-build-warehouse-food');
  if (btnFood) {
    const item = btnFood.closest('.building-item');
    if (item) {
      const nameEl = item.querySelector('.building-name');
      if (nameEl) nameEl.textContent = 'Almacén de Comida';
      const descEl = item.querySelector('.building-desc');
      if (descEl) descEl.textContent = 'Aumenta la capacidad máxima de alimentos en +200.';
      
      const countEl = document.getElementById('count-warehouse-food');
      if (countEl) {
        const builtCount = state.warehouses ? state.warehouses.filter(w => w.type === 'food' && !w.isUnderConstruction).length : 0;
        countEl.textContent = `Construidos: ${builtCount}`;
      }
    }
  }

  // Hide stone and seeds warehouse cards
  const btnStone = document.getElementById('btn-build-warehouse-stone');
  if (btnStone) {
    const item = btnStone.closest('.building-item');
    if (item) item.style.display = 'none';
  }
  const btnSeeds = document.getElementById('btn-build-warehouse-seeds');
  if (btnSeeds) {
    const item = btnSeeds.closest('.building-item');
    if (item) item.style.display = 'none';
  }

  // Costos almacenes
  const resWarehouseCfg = CONFIG.Storage?.resource_warehouse || { cost_gold: 20, cost_wood: 10, cost_stone: 10 };
  const foodGranaryCfg = CONFIG.Storage?.food_granary || { cost_gold: 25, cost_wood: 15, cost_stone: 15 };

  updateBtnState('btn-build-warehouse-wood', resWarehouseCfg);
  updateBtnState('btn-build-warehouse-food', foodGranaryCfg);

  // Botón contratar colono obsoleto (gestionado individualmente por candidato)
  if (DOM.btnHireColonist) {
    const spaceAvailable = (state.colonists ? state.colonists.length : 0) < state.maxPopulation;
    DOM.btnHireColonist.disabled = !(spaceAvailable && state.gold >= bHire.cost_gold);
  }

  // Descarte manual - Habilitación de botones según stock
  const selectEl = document.getElementById('sell-resource-select');
  if (selectEl) {
    const type = selectEl.value;
    const currentStock = getResourceStock(type);
    
    const btnDiscard10 = document.getElementById('btn-discard-10');
    if (btnDiscard10) btnDiscard10.disabled = currentStock < 10;
    
    const btnDiscard100 = document.getElementById('btn-discard-100');
    if (btnDiscard100) btnDiscard100.disabled = currentStock < 100;
    
    const btnDiscardAll = document.getElementById('btn-discard-all');
    if (btnDiscardAll) btnDiscardAll.disabled = currentStock <= 0;
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



  // Cooldown de Recolección Manual (Global)
  const cooldown = state.gatherCooldown || 0;
  const isBuilding = state.playerBuilding !== null;
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
    
    if (isBuilding) {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `🔨 Construyendo...`;
      }
      if (container) container.style.display = 'none';
      if (bar) bar.style.width = '0%';
    } else if (cooldown > 0) {
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
  if (!CONFIG) return;

  const safeSetHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  const getGatherVal = (type, prop, fallback) => {
    if (CONFIG.BasicGathering && CONFIG.BasicGathering[type]) {
      return CONFIG.BasicGathering[type][prop] !== undefined ? CONFIG.BasicGathering[type][prop] : fallback;
    }
    return fallback;
  };

  const getProdRateVal = (type, prop, fallback) => {
    if (CONFIG.ProductionRate && CONFIG.ProductionRate[type]) {
      return CONFIG.ProductionRate[type][prop] !== undefined ? CONFIG.ProductionRate[type][prop] : fallback;
    }
    return fallback;
  };

  // Costes de Edificios dinámicos en sus contenedores
  updateBuildingCostDisplays('btn-build-basic', CONFIG.Building.basic_house);
  updateBuildingCostDisplays('btn-build-lumbermill', CONFIG.Building.lumbermill);
  updateBuildingCostDisplays('btn-build-quarry', CONFIG.Building.quarry);
  updateBuildingCostDisplays('btn-build-farm', CONFIG.Building.farm);
  updateBuildingCostDisplays('btn-build-bonfire', CONFIG.Building.bonfire);
  updateBuildingCostDisplays('btn-build-market', CONFIG.Building.market);
  updateBuildingCostDisplays('btn-build-granary', CONFIG.Building.granary);
  updateBuildingCostDisplays('btn-build-well', CONFIG.Building.well);
  
  if (!state.townHall.built) {
    updateBuildingCostDisplays('btn-build-townhall', CONFIG.Building.townhall);
  } else {
    const tier = state.townHall.tier;
    if (tier === 1) {
      updateBuildingCostDisplays('btn-upgrade-townhall', CONFIG.Building.townhall_t2);
    } else if (tier === 2) {
      updateBuildingCostDisplays('btn-upgrade-townhall', CONFIG.Building.townhall_t3);
    }
  }

  // Costes de Almacenes dinámicos
  const resWarehouseCfg = CONFIG.Storage?.resource_warehouse || { cost_gold: 20, cost_wood: 10, cost_stone: 10 };
  const foodGranaryCfg = CONFIG.Storage?.food_granary || { cost_gold: 25, cost_wood: 15, cost_stone: 15 };

  updateBuildingCostDisplays('btn-build-warehouse-wood', resWarehouseCfg);
  updateBuildingCostDisplays('btn-build-warehouse-food', foodGranaryCfg);

  // Aldeanos
  const bHire = (CONFIG.Building && CONFIG.Building.hire_colonist) || (CONFIG.Sales && CONFIG.Sales.hire_colonist) || { cost_gold: 50 };
  const costHireGoldEl = document.getElementById('cost-hire-gold');
  if (costHireGoldEl) costHireGoldEl.innerHTML = `🪙 ${bHire.cost_gold} Oro`;
  const btnHireColonistEl = document.getElementById('btn-hire-colonist');
  if (btnHireColonistEl) btnHireColonistEl.innerHTML = `🧑‍🌾 Contratar Aldeano (${bHire.cost_gold}🪙)`;

  // Recolección Manual
  const gatherWoodBtn = document.getElementById('btn-gather-wood');
  if (gatherWoodBtn) gatherWoodBtn.innerHTML = `🪵 Recolectar Madera (+${getGatherVal('wood_manual', 'yield', 1)})`;
  const gatherStoneBtn = document.getElementById('btn-gather-stone');
  if (gatherStoneBtn) gatherStoneBtn.innerHTML = `🪨 Recolectar Piedra (+${getGatherVal('stone_manual', 'yield', 1)})`;
  const gatherBerriesBtn = document.getElementById('btn-gather-berries');
  if (gatherBerriesBtn) gatherBerriesBtn.innerHTML = `🍓 Recolectar Frutos (+${getGatherVal('berries_manual', 'yield', 1)})`;

  // Descripciones de Edificios
  const dayDurationVal = CONFIG.Timing && CONFIG.Timing.day_duration ? CONFIG.Timing.day_duration.duration : 30.0;
  const lumberDesc = document.querySelector('#btn-build-lumbermill') ? document.getElementById('btn-build-lumbermill').closest('.building-item').querySelector('.building-desc') : null;
  if (lumberDesc) {
    const yieldT1 = getProdRateVal('lumbermill_t1', 'yield', 5);
    const durT1 = getProdRateVal('lumbermill_t1', 'duration', 1) || 1.0;
    const dailyProd = (yieldT1 / durT1) * dayDurationVal;
    lumberDesc.innerHTML = `Habilita leñadores industriales (+${dailyProd.toFixed(0)} Madera/día por trabajador).`;
  }
  const quarryDesc = document.querySelector('#btn-build-quarry') ? document.getElementById('btn-build-quarry').closest('.building-item').querySelector('.building-desc') : null;
  if (quarryDesc) {
    const yieldT1 = getProdRateVal('quarry_t1', 'yield', 5);
    const durT1 = getProdRateVal('quarry_t1', 'duration', 1) || 1.0;
    const dailyProd = (yieldT1 / durT1) * dayDurationVal;
    quarryDesc.innerHTML = `Habilita mineros industriales (+${dailyProd.toFixed(0)} Piedra/día por trabajador).`;
  }

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

  // Descartar Recursos - Inicialización del selector
  const sellSelect = document.getElementById('sell-resource-select');
  if (sellSelect) {
    const prevVal = sellSelect.value;
    sellSelect.innerHTML = '';
    const discardable = ['wood', 'stone', 'wheat', 'potato', 'carrot', 'berries', 'cooked_wheat', 'cooked_potato', 'cooked_carrot', 'cooked_berries', 'wheat_seeds', 'potato_seeds', 'carrot_seeds'];
    discardable.forEach(type => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.text = `${icons[type] || ''} ${rawNames[type] || type}`;
      sellSelect.appendChild(opt);
    });
    if (prevVal) sellSelect.value = prevVal;
    if (!sellSelect.value && sellSelect.options.length > 0) {
      sellSelect.selectedIndex = 0;
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
window.renderFoodPriorityList = renderFoodPriorityList;

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
        <div class="subresource-item" style="display: flex; flex-direction: column; gap: 0.25rem; background: rgba(255, 255, 255, 0.03); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); min-width: 140px; flex: 1; position: relative; overflow: hidden;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">${f.icon}</span>
            <div style="display: flex; flex-direction: column; flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">${f.name}</span>
                <div style="display: flex; gap: 0.2rem; align-items: center;">
                  <span style="font-size: 0.65rem; color: #a5b4fc; font-weight: 600;">x${mult}</span>
                  <span id="res-badge-${f.key}" style="font-size: 0.6rem; font-weight: 700; padding: 0.1rem 0.25rem; border-radius: 4px; display: none;"></span>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <div style="display: flex; gap: 0.25rem; align-items: baseline;">
                  <span id="res-detail-${f.key}" style="font-size: 0.95rem; font-weight: 700; color: ${f.color};">0</span>
                  <span id="res-val-${f.key}" style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">(0)</span>
                </div>
                <span id="res-rate-${f.key}" style="font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted);">+0/s</span>
              </div>
            </div>
          </div>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; margin-top: 0.25rem;">
            <div id="res-cap-bar-${f.key}" style="width: 0%; height: 100%; transition: width 0.2s, background-color 0.2s;"></div>
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
    if (qtyEl) {
      qtyEl.innerText = qty.toFixed(0);
    }
    const valEl = document.getElementById(`res-val-${key}`);
    if (valEl) valEl.innerText = `(${value.toFixed(0)})`;
    
    const rateEl = document.getElementById(`res-rate-${key}`);
    if (rateEl && typeof calculatedRates !== 'undefined' && calculatedRates[key] !== undefined) {
      const rateVal = calculatedRates[key];
      const rateMin = window.calculatedRatesMin?.[key] ?? rateVal;
      const rateMax = window.calculatedRatesMax?.[key] ?? rateVal;
      
      if (Math.abs(rateMax - rateMin) > 0.01) {
        const minSign = rateMin >= 0 ? '+' : '';
        const maxSign = rateMax >= 0 ? '+' : '';
        let minText = rateMin.toFixed(rateMin % 1 === 0 ? 0 : 1);
        let maxText = rateMax.toFixed(rateMax % 1 === 0 ? 0 : 1);
        rateEl.innerText = `${minSign}${minText} a ${maxSign}${maxText}/día`;
        rateEl.style.color = rateMax > 0 ? '#4ade80' : '#f87171';
      } else if (rateVal > 0.001) {
        rateEl.innerText = `+${rateVal.toFixed(rateVal % 1 === 0 ? 0 : 2)}/día`;
        rateEl.style.color = '#4ade80';
      } else if (rateVal < -0.001) {
        rateEl.innerText = `${rateVal.toFixed(rateVal % 1 === 0 ? 0 : 2)}/día`;
        rateEl.style.color = '#f87171';
      } else {
        rateEl.innerText = '+0/día';
        rateEl.style.color = 'var(--color-text-muted)';
      }
    }

    const barEl = document.getElementById(`res-cap-bar-${key}`);
    const badgeEl = document.getElementById(`res-badge-${key}`);
    if (barEl) {
      const globalCap = state.maxFoodCapacity || 100;
      const globalQty = typeof getFoodOccupation === 'function' ? getFoodOccupation() : 0;
      
      barEl.parentElement.style.display = 'block';
      const pct = Math.min(100, (globalQty / globalCap) * 100);
      barEl.style.width = `${pct}%`;
      if (pct < 75) {
        barEl.style.backgroundColor = '#94a3b8';
      } else if (pct < 90) {
        barEl.style.backgroundColor = '#eab308';
      } else {
        barEl.style.backgroundColor = '#ef4444';
      }
      if (badgeEl) {
        if (pct >= 100) {
          badgeEl.innerText = 'LLENO';
          badgeEl.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          badgeEl.style.color = '#f87171';
          badgeEl.style.display = 'inline-block';
        } else {
          badgeEl.style.display = 'none';
        }
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
        <div class="subresource-item" style="display: flex; flex-direction: column; gap: 0.25rem; background: rgba(255, 255, 255, 0.03); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); min-width: 140px; flex: 1; position: relative; overflow: hidden;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">${r.icon}</span>
            <div style="display: flex; flex-direction: column; flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;">${r.name}</span>
                <span id="res-badge-${r.key}" style="font-size: 0.6rem; font-weight: 700; padding: 0.1rem 0.25rem; border-radius: 4px; display: none;"></span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span id="res-detail-${r.key}" style="font-size: 0.95rem; font-weight: 700; color: ${r.color};">0</span>
                <span id="res-rate-${r.key}" style="font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted);"></span>
              </div>
            </div>
          </div>
          <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; margin-top: 0.25rem;">
            <div id="res-cap-bar-${r.key}" style="width: 0%; height: 100%; transition: width 0.2s, background-color 0.2s;"></div>
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
    if (qtyEl) {
      qtyEl.innerText = qty.toFixed(0);
    }

    const rateEl = document.getElementById(`res-rate-${item.key}`);
    if (rateEl) {
      if (!item.isSeed && typeof calculatedRates !== 'undefined' && calculatedRates[item.stateKey] !== undefined) {
        const rateVal = calculatedRates[item.stateKey];
        const rateMin = window.calculatedRatesMin?.[item.stateKey] ?? rateVal;
        const rateMax = window.calculatedRatesMax?.[item.stateKey] ?? rateVal;
        
        if (Math.abs(rateMax - rateMin) > 0.01) {
          const minSign = rateMin >= 0 ? '+' : '';
          const maxSign = rateMax >= 0 ? '+' : '';
          let minText = rateMin.toFixed(rateMin % 1 === 0 ? 0 : 1);
          let maxText = rateMax.toFixed(rateMax % 1 === 0 ? 0 : 1);
          rateEl.innerText = `${minSign}${minText} a ${maxSign}${maxText}/día`;
          rateEl.style.color = rateMax > 0 ? '#4ade80' : '#f87171';
        } else if (rateVal > 0.001) {
          rateEl.innerText = `+${rateVal.toFixed(rateVal % 1 === 0 ? 0 : 2)}/día`;
          rateEl.style.color = '#4ade80';
        } else if (rateVal < -0.001) {
          rateEl.innerText = `${rateVal.toFixed(rateVal % 1 === 0 ? 0 : 2)}/día`;
          rateEl.style.color = '#f87171';
        } else {
          rateEl.innerText = '+0/día';
          rateEl.style.color = 'var(--color-text-muted)';
        }
      } else {
        rateEl.innerText = '';
      }
    }

    const barEl = document.getElementById(`res-cap-bar-${item.key}`);
    const badgeEl = document.getElementById(`res-badge-${item.key}`);
    if (barEl) {
      const globalCap = state.maxResourcesCapacity || 100;
      const globalQty = typeof getResourcesOccupation === 'function' ? getResourcesOccupation() : 0;
      
      barEl.parentElement.style.display = 'block';
      const pct = Math.min(100, (globalQty / globalCap) * 100);
      barEl.style.width = `${pct}%`;
      if (pct < 75) {
        barEl.style.backgroundColor = '#94a3b8';
      } else if (pct < 90) {
        barEl.style.backgroundColor = '#eab308';
      } else {
        barEl.style.backgroundColor = '#ef4444';
      }
      if (badgeEl) {
        if (pct >= 100) {
          badgeEl.innerText = 'LLENO';
          badgeEl.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          badgeEl.style.color = '#f87171';
          badgeEl.style.display = 'inline-block';
        } else {
          badgeEl.style.display = 'none';
        }
      }
    }
  });
}

var lastRenderedCandidatesKey = null;
var lastRenderedColonistsDetailKey = null;
var lastRenderedColonistsSummaryKey = null;
var expandedSummaryJobs = new Set();

function getHouseForColonist(colonistIdx) {
  if (!state.houses || state.houses.length === 0) return 'Sin hogar';
  
  let currentColonistCount = 0;
  for (let i = 0; i < state.houses.length; i++) {
    const house = state.houses[i];
    if (house.isUnderConstruction) continue;
    const basicHouseCfg = CONFIG.Building && CONFIG.Building.basic_house;
    const cap1 = basicHouseCfg ? basicHouseCfg.yield_amount : 1;
    const upgradedHouseCfg = CONFIG.Building && CONFIG.Building.upgraded_house;
    const cap2 = cap1 + (upgradedHouseCfg ? upgradedHouseCfg.yield_amount : 1);
    const luxuryHouseCfg = CONFIG.Building && CONFIG.Building.luxury_house;
    const cap3 = cap2 + (luxuryHouseCfg ? luxuryHouseCfg.yield_amount : 2);
    const capacity = house.tier === 1 ? cap1 : (house.tier === 2 ? cap2 : cap3);
    
    if (colonistIdx < currentColonistCount + capacity) {
      const tierNames = { 1: 'Choza', 2: 'Cabaña', 3: 'Casa Grande' };
      return `${tierNames[house.tier || 1]} #${i + 1}`;
    }
    currentColonistCount += capacity;
  }
  return 'Sin hogar (Sobrecarga)';
}

function renderOrders() {
  const container = document.getElementById('active-orders-list');
  if (!container) return;
  
  if (!state.orders || state.orders.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-color); border-radius: 12px; padding: 2rem; text-align: center; color: var(--color-text-muted); font-size: 0.9rem;">
        <span style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem;">📋</span>
        No hay pedidos disponibles hoy. Regresarán al amanecer.
      </div>
    `;
    return;
  }
  
  const refreshInterval = CONFIG?.Economy?.orders_refresh_interval?.value ?? 2;
  const nextRefresh = (state.ordersRefreshDay || 0) + refreshInterval;
  
  let html = `
    <div style="grid-column: 1 / -1; font-size: 0.85rem; color: #ffd700; background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.15); padding: 0.6rem 0.8rem; border-radius: 8px; margin-bottom: 0.5rem; text-align: center; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.35rem; width: 100%;">
      <span>ℹ️ Los pedidos de la aldea se renuevan cada <strong>${refreshInterval} días</strong>. Próxima renovación al amanecer del día <strong>${nextRefresh}</strong>.</span>
    </div>
  `;
  
  state.orders.forEach(order => {
    const resConfig = CONFIG?.resources?.[order.resource];
    const emoji = resConfig?.Emoji || '📦';
    const name = resConfig?.Name || order.resource;
    
    const currentStock = getResourceStock(order.resource);
    const roundedStock = Math.floor(currentStock);
    const hasEnough = roundedStock >= order.amount;
    
    let statusHtml = '';
    let btnDisabled = '';
    
    if (order.completed) {
      statusHtml = `<span style="font-size: 0.8rem; font-weight: bold; color: #4ade80; background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.2); padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.25rem;">✅ Entregado</span>`;
      btnDisabled = 'disabled style="opacity: 0.5; cursor: not-allowed;"';
    } else {
      statusHtml = `
        <span style="font-size: 0.8rem; font-weight: 600; color: ${hasEnough ? '#60a5fa' : '#fb923c'}; background: ${hasEnough ? 'rgba(96, 165, 250, 0.1)' : 'rgba(251, 146, 60, 0.1)'}; border: 1px solid ${hasEnough ? 'rgba(96, 165, 250, 0.2)' : 'rgba(251, 146, 60, 0.2)'}; padding: 0.2rem 0.5rem; border-radius: 4px;">
          ${hasEnough ? 'Listo para entregar' : 'Faltan recursos'}
        </span>
      `;
      if (!hasEnough) {
        btnDisabled = 'disabled';
      }
    }
    
    let rewardsHtml = '';
    if (Array.isArray(order.rewards)) {
      rewardsHtml = order.rewards.map(reward => {
        let emoji = '📦';
        let name = reward.type;
        if (reward.type === 'reputation') {
          emoji = '🏆';
          name = 'Reputación';
        } else if (reward.type === 'gold') {
          emoji = '🪙';
          name = 'Oro';
        } else {
          const resCfg = CONFIG?.resources?.[reward.type];
          if (resCfg) {
            emoji = resCfg.Emoji || '📦';
            name = resCfg.Name || reward.type;
          }
        }
        return `<span class="reward-badge" style="display: inline-flex; align-items: center; gap: 0.15rem; color: #c084fc; font-weight: bold;">${emoji} +${reward.amount}</span>`;
      }).join(' ');
    } else if (order.reward) {
      rewardsHtml = `<span class="reward-badge" style="display: inline-flex; align-items: center; gap: 0.15rem; color: #c084fc; font-weight: bold;">🏆 +${order.reward} Rep</span>`;
    }
    
    html += `
      <div class="building-item" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; padding: 1.2rem; border-radius: 12px; background: rgba(0, 0, 0, 0.2); border: 1px solid ${order.completed ? 'rgba(74, 222, 128, 0.2)' : 'var(--border-color)'}; transition: border-color 0.2s; opacity: ${order.completed ? '0.35' : '1'}; filter: ${order.completed ? 'grayscale(30%)' : 'none'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 2rem;">${emoji}</span>
            <div style="display: flex; flex-direction: column; gap: 0.15rem;">
              <span style="font-size: 0.95rem; font-weight: 700; color: #fff;">${name}</span>
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">Pedido diario</span>
            </div>
          </div>
          ${statusHtml}
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 0.6rem 0.8rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
            <span style="color: var(--color-text-muted);">Requerido:</span>
            <strong style="color: #fff;">${order.amount}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
            <span style="color: var(--color-text-muted);">Stock actual:</span>
            <strong style="color: ${hasEnough ? '#4ade80' : '#fb923c'};">${roundedStock}</strong>
          </div>
          <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin: 0.2rem 0;"></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; align-items: center;">
            <span style="color: var(--color-text-muted);">Recompensa:</span>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">${rewardsHtml}</div>
          </div>
        </div>
        
        <button class="btn btn-accent-gold btn-fulfill-order" 
                data-order-id="${order.id}" 
                style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.4rem; padding: 0.5rem;" 
                ${btnDisabled}>
          <span>${order.completed ? 'Completado' : 'Entregar recursos'}</span>
        </button>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderHiringCandidates() {
  const container = document.getElementById('hiring-candidates-container');
  if (!container) return;

  const bHire = (CONFIG.Building && CONFIG.Building.hire_colonist) || (CONFIG.Sales && CONFIG.Sales.hire_colonist) || { cost_gold: 50 };
  const cost = bHire.cost_gold;
  const goldAfford = state.gold >= cost;
  
  // Reputación requerida paramétrica
  const coste_rep = typeof getColonistHiringRepCost === 'function' ? getColonistHiringRepCost() : Math.max(0, (state.colonists.length - 2) * 5);
  const repAfford = (state.reputation || 0) >= coste_rep;
  
  const canHire = goldAfford && repAfford;

  const rotationDuration = CONFIG.Timing && CONFIG.Timing.candidate_rotation ? CONFIG.Timing.candidate_rotation.duration : 210.0;
  const secsRemaining = Math.max(0, rotationDuration - (state.candidateRotationElapsed || 0)).toFixed(0);
  const rotateCost = CONFIG.Sales && CONFIG.Sales.rotate_candidates ? CONFIG.Sales.rotate_candidates.cost_gold : 15;
  const canAffordRotate = state.gold >= rotateCost;

  // Caching key to prevent rebuilding DOM nodes on every game tick loop (resolving multi-click bug)
  const candidatesNames = state.candidates ? state.candidates.map(c => c.name).join(',') : '';
  const currentKey = `${candidatesNames}_${canHire}_${state.gold >= cost}_rep:${state.reputation}_costRep:${coste_rep}_secs:${secsRemaining}_gold:${Math.floor(state.gold)}`;
  if (lastRenderedCandidatesKey === currentKey) {
    return;
  }
  lastRenderedCandidatesKey = currentKey;

  const isHousingFull = state.colonists.length >= (state.maxPopulation || 0);

  let html = `
    <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.2rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; width: 100%;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <span style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 500;">
          ⏳ Rotación automática en: <strong style="color: #60a5fa; font-size: 0.95rem;">${secsRemaining}s</strong>
        </span>
        <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.6rem; display: flex; align-items: center; gap: 0.25rem;" onclick="rotateCandidatesPool()" ${canAffordRotate ? '' : 'disabled'}>
          🔄 Rotar Candidatos (Costo: 🪙${rotateCost})
        </button>
      </div>
  `;

  if (isHousingFull) {
    html += `
      <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 0.6rem 0.8rem; font-size: 0.8rem; color: #fbbf24; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
        <span>⛺</span>
        <span>Viviendas completas. Los colonos adicionales serán contratados sin hogar, lo que reduce su producción en un 40%.</span>
      </div>
    `;
  }

  if (!state.candidates || state.candidates.length === 0) {
    html += `
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 0.6rem 0.8rem; font-size: 0.8rem; color: #f87171; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
        <span>⚠️</span>
        <span>Has contratado a todos los candidatos de esta semana. Espera a la rotación automática o rota la lista pagando oro.</span>
      </div>
    </div>`;
  } else {
    state.candidates.forEach((cand, idx) => {
      const attrBadges = [
        { name: '🪓 Leñ', val: cand.attributes.woodcutting, color: '#facc15' },
        { name: '⛏️ Min', val: cand.attributes.mining, color: '#60a5fa' },
        { name: '🌾 Agr', val: cand.attributes.farming, color: '#4ade80' },
        { name: '🍳 Coc', val: cand.attributes.cooking, color: '#f87171' },
        { name: '🔨 Con', val: cand.attributes.construction, color: '#a78bfa' },
        { name: '📈 Com', val: cand.attributes.trading, color: '#fb923c' },
        { name: '🧭 Exp', val: cand.attributes.exploration, color: '#c084fc' },
        { name: '⚔️ Cba', val: cand.attributes.combat, color: '#f472b6' }
      ].map(a => `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 0.25rem 0.4rem; display: flex; justify-content: space-between; align-items: center; gap: 0.25rem; font-size: 0.75rem;">
          <span style="color: var(--color-text-muted); font-weight: 500;">${a.name}</span>
          <span style="font-weight: 700; color: ${a.color};">${a.val}</span>
        </div>
      `).join('');

      html += `
        <div class="building-item" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 12px; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.08); transition: transform 0.2s, border-color 0.2s; margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; width: 100%;">
            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
              <span style="font-size: 0.95rem; font-weight: 700; color: #a5b4fc; letter-spacing: 0.2px;">${cand.name}</span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">Aldeano de Aetheria disponible para reclutar.</span>
            </div>
            <span style="font-size: 0.8rem; font-weight: 600; color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); padding: 0.15rem 0.4rem; border-radius: 4px; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <span>🪙 ${cost} Oro</span>
              ${coste_rep > 0 ? `<span style="color: #c084fc; display: flex; align-items: center; gap: 0.15rem;">🏆 ${coste_rep} Rep</span>` : ''}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; width: 100%;">
            ${attrBadges}
          </div>
          
          ${(() => {
            let btnText = `<span>🧑‍🌾 Reclutar a ${cand.name.split(' ')[0]}</span>`;
            if (!goldAfford) {
              btnText = `<span>Oro Insuficiente (Req: 🪙${cost})</span>`;
            } else if (!repAfford) {
              btnText = `<span>Reputación Insuficiente (Req: 🏆${coste_rep})</span>`;
            }
            return `
              <button class="btn btn-accent-gold" 
                      style="width: 100%; margin-top: 0.25rem; display: flex; justify-content: center; align-items: center; gap: 0.4rem;" 
                      onclick="hireColonist(${idx})" 
                      ${canHire ? '' : 'disabled'}>
                ${btnText}
              </button>
            `;
          })()}
        </div>
      `;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

function renderColonistHouseSelector(colonist) {
  const disabledAttr = colonist.onMission ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : '';
  let selectHtml = `<select ${disabledAttr} style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; padding: 0.35rem 0.5rem; font-family: var(--font-primary); font-size: 0.8rem; cursor: pointer; outline: none;" onchange="changeColonistHouseDirectly(${colonist.id}, this.value)">`;
  selectHtml += `<option value="" ${colonist.houseIdx === null || colonist.houseIdx === undefined ? 'selected' : ''}>❌ Sin hogar</option>`;
  
  if (Array.isArray(state.houses)) {
    state.houses.forEach((house, idx) => {
      if (house.isUnderConstruction) return;
      
      const basicHouseCfg = CONFIG.Building && CONFIG.Building.basic_house;
      const cap1 = basicHouseCfg ? basicHouseCfg.yield_amount : 1;
      const upgradedHouseCfg = CONFIG.Building && CONFIG.Building.upgraded_house;
      const cap2 = cap1 + (upgradedHouseCfg ? upgradedHouseCfg.yield_amount : 1);
      const luxuryHouseCfg = CONFIG.Building && CONFIG.Building.luxury_house;
      const cap3 = cap2 + (luxuryHouseCfg ? luxuryHouseCfg.yield_amount : 2);
      const capacity = house.tier === 1 ? cap1 : (house.tier === 2 ? cap2 : cap3);
      const currentOccupants = state.colonists.filter(x => x.houseIdx === idx && x.id !== colonist.id).length;
      const isCurrentHouse = colonist.houseIdx === idx;
      const displayOccupants = isCurrentHouse ? currentOccupants + 1 : currentOccupants;
      
      const isFull = displayOccupants >= capacity && !isCurrentHouse;
      const tierNames = { 1: 'Choza', 2: 'Cabaña', 3: 'Casa Grande' };
      const label = `${tierNames[house.tier || 1]} #${idx + 1} (${displayOccupants}/${capacity})`;
      
      selectHtml += `<option value="${idx}" ${isCurrentHouse ? 'selected' : ''} ${isFull ? 'disabled' : ''}>${label}</option>`;
    });
  }
  
  selectHtml += `</select>`;
  return selectHtml;
}

function renderColonistsDetailList() {
  const container = document.getElementById('colonists-detail-list-container');
  if (!container) return;

  if (!state.colonists || state.colonists.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; margin: 1rem 0;">No tienes aldeanos contratados todavía.</p>`;
    lastRenderedColonistsDetailKey = 'empty';
    return;
  }

  // Key check to prevent dropdown close on game tick loops
  const colonistsKey = state.colonists.map(c => `${c.id}:${c.job}:${c.houseIdx}:${c.isStarving ? 1 : 0}`).join(',') + `_houses:${state.houses.length}:${state.houses.map(h => h.tier).join(',')}`;
  if (lastRenderedColonistsDetailKey === colonistsKey) {
    return;
  }
  lastRenderedColonistsDetailKey = colonistsKey;

  // Build the list of job options
  const jobOptions = [
    { value: "", label: "❌ Sin Trabajo (Libre)" },
    { value: "wood", label: "🪵 Leñador Básico" },
    { value: "stone", label: "🪨 Cantero Básico" },
    { value: "berries", label: "🍓 Forrajeador de Frutos" },
    { value: "construction", label: "🔨 Constructor (Auto)" }
  ];

  const addBuildingJobs = (list, prefix, label) => {
    if (Array.isArray(list)) {
      list.forEach((b, idx) => {
        if (!b.isUnderConstruction && !b.isUpgrading) {
          jobOptions.push({ value: `${prefix}_${idx}`, label: `${label} #${idx + 1}` });
        }
      });
    }
  };

  addBuildingJobs(state.lumberMills, 'lumbermills', '🪵 Aserradero');
  addBuildingJobs(state.quarries, 'quarries', '🪨 Cantera');
  addBuildingJobs(state.farms, 'farms', '🌾 Granja');
  addBuildingJobs(state.markets, 'markets', '📈 Mercader');
  addBuildingJobs(state.bonfires, 'bonfires', '🔥 Cocinero/Hoguera');
  addBuildingJobs(state.granaries, 'granaries', '🌾 Granero');

  let html = '';
  state.colonists.forEach((c, idx) => {
    const attrBadges = [
      { key: 'woodcutting', name: '🪓', val: c.attributes.woodcutting, color: '#facc15', title: 'Leñador' },
      { key: 'mining', name: '⛏️', val: c.attributes.mining, color: '#60a5fa', title: 'Cantero' },
      { key: 'farming', name: '🌾', val: c.attributes.farming, color: '#4ade80', title: 'Agricultor' },
      { key: 'cooking', name: '🍳', val: c.attributes.cooking, color: '#f87171', title: 'Cocinero' },
      { key: 'construction', name: '🔨', val: c.attributes.construction, color: '#a78bfa', title: 'Constructor' },
      { key: 'trading', name: '📈', val: c.attributes.trading, color: '#fb923c', title: 'Mercader' },
      { key: 'exploration', name: '🧭', val: c.attributes.exploration, color: '#c084fc', title: 'Explorador' },
      { key: 'combat', name: '⚔️', val: c.attributes.combat, color: '#f472b6', title: 'Combatiente' }
    ].map(a => {
      const currentXP = (c.attributeXP && c.attributeXP[a.key]) || 0;
      const xpReq = getXPThreshold(a.key, a.val);
      const xpText = a.val < 10 ? ` (${currentXP.toFixed(1)}/${xpReq.toFixed(0)}d)` : ' (Máx)';
      return `<span title="${a.title}${xpText}" style="cursor:help; font-weight:700; color:${a.color}; background:rgba(255,255,255,0.04); padding:0.15rem 0.3rem; border-radius:4px; border:1px solid rgba(255,255,255,0.06);">${a.name}${a.val}</span>`;
    }).join(' ');

    const optionsHtml = jobOptions.map(opt => `
      <option value="${opt.value}" ${c.job === (opt.value === "" ? null : opt.value) ? 'selected' : ''}>
        ${opt.label}
      </option>
    `).join('');

    const isStarving = c.isStarving;
    const isHomeless = c.houseIdx === null || c.houseIdx === undefined || c.houseIdx < 0 || !state.houses || c.houseIdx >= state.houses.length;
    const eff = getColonistEfficiency(c);
    const effPercent = Math.round(eff * 100);
    
    let badgesHtml = '';
    if (isHomeless) {
      badgesHtml += `
        <span style="font-size: 0.7rem; color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.15rem;">
          ⛺ Sin hogar
        </span>
      `;
    }
    if (isStarving) {
      badgesHtml += `
        <span style="font-size: 0.7rem; color: #f87171; background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.2); padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.15rem;">
          🥩 Hambriento
        </span>
      `;
    }
    
    if (c.onMission) {
      badgesHtml += `
        <span style="font-size: 0.7rem; color: #94a3b8; background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.2); padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.15rem;">
          🗺️ En misión
        </span>
      `;
    }
    
    if (c.specialist) {
      badgesHtml += `
        <span style="font-size: 0.7rem; color: #ffd700; background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.2); padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.15rem;">
          ⭐ Especialista
        </span>
      `;
    }
    
    let effColor = '#38bdf8'; // Default blueish
    if (effPercent >= 100) effColor = '#4ade80'; // Green
    else if (effPercent >= 50) effColor = '#fbbf24'; // Yellow/Orange
    else effColor = '#f87171'; // Red

    badgesHtml += `
      <span style="font-size: 0.7rem; color: ${effColor}; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.15rem;">
        ⚡ ${effPercent}%
      </span>
    `;

    // Estilo del card según especialista
    const borderStyle = c.specialist 
      ? 'border: 2px solid gold; box-shadow: 0 0 10px rgba(255, 215, 0, 0.25);' 
      : 'border: 1px solid rgba(255, 255, 255, 0.08);';
      
    // Nombre e indicación de especialista
    const nameDisplay = c.specialist 
      ? `<span style="font-size: 0.95rem; font-weight: 700; color: #ffd700;">${c.name}</span> <span style="font-size: 0.8rem; font-style: italic; color: #fcd34d; font-weight: 600;">(${c.title})</span>` 
      : `<span style="font-size: 0.95rem; font-weight: 700; color: #a5b4fc;">${c.name}</span>`;

    html += `
      <div class="building-item" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 12px; background: rgba(0, 0, 0, 0.2); ${borderStyle}">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.1rem;">
              ${nameDisplay}
              ${badgesHtml}
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--color-text-muted);">
              <span>🏠 Residencia:</span>
              ${renderColonistHouseSelector(c)}
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 500;">Trabajo:</span>
              <select ${c.onMission ? 'disabled style="background:rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: #888; border-radius: 6px; padding: 0.35rem 0.5rem; font-family: var(--font-primary); font-size: 0.8rem; cursor: not-allowed;"' : 'style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; padding: 0.35rem 0.5rem; font-family: var(--font-primary); font-size: 0.8rem; cursor: pointer;"'}
                      onchange="changeColonistJobDirectly(${c.id}, this.value)">
                ${optionsHtml}
              </select>
            </div>
            <button class="btn" 
                    ${c.onMission ? 'disabled style="font-size: 0.75rem; padding: 0.35rem 0.6rem; border: 1px solid rgba(128,128,128,0.2); color: #888; background: rgba(128,128,128,0.05); cursor: not-allowed; border-radius: 6px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem; outline: none; box-shadow: none; opacity:0.5;"' : 'style="font-size: 0.75rem; padding: 0.35rem 0.6rem; border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; background: rgba(239, 68, 68, 0.05); cursor: pointer; border-radius: 6px; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem; transition: background 0.2s, border-color 0.2s; outline: none; box-shadow: none;" onmouseover="this.style.background=\'rgba(239, 68, 68, 0.15)\'; this.style.borderColor=\'rgba(239, 68, 68, 0.5)\';" onmouseout="this.style.background=\'rgba(239, 68, 68, 0.05)\'; this.style.borderColor=\'rgba(239, 68, 68, 0.3)\';" onclick="dismissColonist(' + c.id + ')"'}
                    >
              👋 Despedir
            </button>
          </div>
        </div>
        
        <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; width: 100%; margin-top: 0.1rem; font-size: 0.75rem;">
          <span style="color: var(--color-text-muted); align-self: center; margin-right: 0.3rem;">Atributos:</span>
          ${attrBadges}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderColonistsSummaryJobs() {
  const container = document.getElementById('colonists-summary-jobs-container');
  if (!container) return;

  if (!state.colonists || state.colonists.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; margin: 1rem 0;">No tienes aldeanos contratados todavía.</p>`;
    lastRenderedColonistsSummaryKey = 'empty';
    return;
  }

  const summaryKey = state.colonists.map(c => `${c.id}:${c.job}:${c.houseIdx}:${c.isStarving ? 1 : 0}`).join(',') + `_exp:${Array.from(expandedSummaryJobs).join(',')}`;
  if (lastRenderedColonistsSummaryKey === summaryKey) {
    return;
  }
  lastRenderedColonistsSummaryKey = summaryKey;

  const categories = [
    { key: 'wood', label: '🪵 Leñadores Básicos', attrName: 'woodcutting', attrLabel: 'Corte de Madera' },
    { key: 'stone', label: '🪨 Canteros Básicos', attrName: 'mining', attrLabel: 'Minería' },
    { key: 'berries', label: '🍓 Recolectores de Frutos', attrName: 'exploration', attrLabel: 'Exploración' },
    { key: 'construction', label: '🔨 Constructores (Auto)', attrName: 'construction', attrLabel: 'Construcción' },
    { key: 'lumbermills', label: '🪵 Trabajadores en Aserraderos', attrName: 'woodcutting', attrLabel: 'Corte de Madera' },
    { key: 'quarries', label: '🪨 Trabajadores en Canteras', attrName: 'mining', attrLabel: 'Minería' },
    { key: 'farms', label: '🌾 Trabajadores en Granjas', attrName: 'farming', attrLabel: 'Agricultura' },
    { key: 'markets', label: '📈 Mercaderes', attrName: 'trading', attrLabel: 'Comercio' },
    { key: 'bonfires', label: '🔥 Cocineros en Fogatas/Cocinas', attrName: 'cooking', attrLabel: 'Cocinado' },
    { key: 'granaries', label: '🌾 Trabajadores en Graneros', attrName: 'farming', attrLabel: 'Agricultura' }
  ];

  let html = '';
  categories.forEach(cat => {
    const list = state.colonists.filter(c => {
      if (!c.job) return false;
      if (cat.key === 'wood' || cat.key === 'stone' || cat.key === 'berries' || cat.key === 'construction') {
        return c.job === cat.key;
      }
      return c.job.startsWith(`${cat.key}_`);
    });

    const isIndustrial = ['lumbermills', 'quarries', 'farms', 'markets', 'bonfires', 'granaries'].includes(cat.key);
    if (isIndustrial) {
      const listKey = cat.key === 'lumbermills' ? 'lumberMills' : cat.key;
      if ((!state[listKey] || state[listKey].length === 0) && list.length === 0) {
        return;
      }
    }

    const isExpanded = expandedSummaryJobs.has(cat.key);
    const count = list.length;

    let subListHtml = '';
    if (isExpanded) {
      if (count === 0) {
        subListHtml = `<div style="padding: 0.5rem 0.75rem; font-size: 0.8rem; color: var(--color-text-muted); font-style: italic;">No hay aldeanos asignados a esta tarea.</div>`;
      } else {
        subListHtml = list.map(c => {
          const attrVal = c.attributes[cat.attrName] || 1;
          
          let jobDetail = '';
          if (c.job.includes('_')) {
            const idx = parseInt(c.job.split('_')[1]) + 1;
            const singularNames = {
              lumbermills: 'Aserradero', quarries: 'Cantera', farms: 'Granja',
              markets: 'Mercado', bonfires: 'Cocina', granaries: 'Granero',
              houses: 'Vivienda'
            };
            jobDetail = ` en ${singularNames[cat.key] || 'Edificio'} #${idx}`;
          }

          const currentXP = (c.attributeXP && c.attributeXP[cat.attrName]) || 0;
          const xpReq = getXPThreshold(cat.attrName, attrVal);
          const xpText = attrVal < 10 ? ` <span style="font-size:0.7rem; color:var(--color-text-muted);">(${currentXP.toFixed(1)}/${xpReq.toFixed(0)}d)</span>` : ' <span style="font-size:0.7rem; color:var(--color-text-muted);">(Máx)</span>';

          const eff = getColonistEfficiency(c);
          const effPercent = Math.round(eff * 100);
          let effColor = '#4ade80'; // Green
          if (effPercent < 50) effColor = '#f87171'; // Red
          else if (effPercent < 100) effColor = '#fbbf24'; // Yellow

          const effText = ` <span style="color: ${effColor}; font-weight: 600; font-size: 0.75rem; margin-left: 0.25rem;">⚡ ${effPercent}%</span>`;

          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.75rem; border-top: 1px dashed rgba(255,255,255,0.06); font-size: 0.8rem;">
              <span style="color: #c7d2fe; font-weight: 500; display: inline-flex; align-items: center;">
                <span>${c.name}${jobDetail}</span>
                ${effText}
              </span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">
                Atributo (${cat.attrLabel}): <strong style="color: #38bdf8; font-size: 0.85rem;">${attrVal}</strong>${xpText}
              </span>
            </div>
          `;
        }).join('');
      }
    }

    html += `
      <div style="background: rgba(0, 0, 0, 0.15); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: 0.4rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem; cursor: pointer; user-select: none;" 
             onclick="toggleSummaryJobExpand('${cat.key}')">
          <span style="font-size: 0.85rem; font-weight: 600; color: #fff;">${cat.label}</span>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge" style="background: rgba(165, 180, 252, 0.15); color: #c7d2fe; font-size: 0.75rem; padding: 0.15rem 0.45rem; border-radius: 99px;">
              ${count} Asignados
            </span>
            <span style="font-size: 0.8rem; color: var(--color-text-muted); transition: transform 0.2s; transform: ${isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};">▶</span>
          </div>
        </div>
        
        ${isExpanded ? `<div style="background: rgba(0,0,0,0.1); display: flex; flex-direction: column;">${subListHtml}</div>` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

function toggleSummaryJobExpand(jobKey) {
  if (expandedSummaryJobs.has(jobKey)) {
    expandedSummaryJobs.delete(jobKey);
  } else {
    expandedSummaryJobs.add(jobKey);
  }
  // Force reset key to force re-render
  lastRenderedColonistsSummaryKey = null;
  renderColonistsSummaryJobs();
}

function renderDevPanel() {
  const panel = document.getElementById('dev-panel');
  if (!panel) return;
  
  const mult = window.devSpeedMultiplier || 1;
  const buttons = panel.querySelectorAll('button');
  
  buttons.forEach(btn => {
    const onclickAttr = btn.getAttribute('onclick') || '';
    if (onclickAttr.includes('devSpeedMultiplier=')) {
      const match = onclickAttr.match(/devSpeedMultiplier\s*=\s*(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val === mult) {
          btn.className = 'btn btn-primary';
          btn.style.background = 'hsl(var(--color-primary))';
          btn.style.borderColor = 'hsl(var(--color-primary))';
          btn.style.color = '#fff';
        } else {
          btn.className = 'btn btn-secondary';
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }
      }
    }
  });
}
window.renderDevPanel = renderDevPanel;

function getPlayerBuildingName() {
  if (!state.playerBuilding) return '';
  const type = state.playerBuilding.buildingType;
  const index = state.playerBuilding.buildingIdx;
  
  if (type === 'townHall') {
    const tier = state.townHall.tier;
    if (state.townHall.isUpgrading) {
      const targetTier = state.townHall.upgradingToTier || (tier + 1);
      return targetTier === 2 ? 'Centro Comunitario' : 'Ayuntamiento';
    } else {
      return 'Casa del Jugador';
    }
  } else if (type === 'houses') {
    const house = state.houses[index];
    const tierNames = { 1: 'Choza', 2: 'Cabaña', 3: 'Casa Grande' };
    return (house ? tierNames[house.tier || 1] : 'Choza') + ` #${index + 1}`;
  } else {
    const names = {
      lumberMills: 'Aserradero',
      quarries: 'Cantera',
      farms: 'Granja',
      bonfires: 'Fogata',
      markets: 'Puesto de Mercado',
      granaries: 'Granero',
      wells: 'Pozo'
    };
    return `${names[type] || 'Edificio'} #${(index || 0) + 1}`;
  }
}

function renderPlayerConstructionBanner() {
  const banner = document.getElementById('player-construction-banner');
  if (!banner) return;
  
  if (state.playerBuilding) {
    const bName = getPlayerBuildingName();
    banner.innerHTML = `
      <div style="padding: 1rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; backdrop-filter: blur(8px); display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.5rem; animation: pulse 2s infinite alternate;">🔨</span>
          <div>
            <div style="font-weight: 700; color: #fff; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
              Estás construyendo: <span style="color: #a5b4fc; background: rgba(99, 102, 241, 0.2); padding: 0.1rem 0.5rem; border-radius: 6px; font-size: 0.85rem;">${bName}</span>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.2rem;">
              No puedes realizar recolección manual mientras estás construyendo. Sigue de noche al 25% de velocidad.
            </div>
          </div>
        </div>
        <button onclick="stopPlayerConstruction()" class="btn btn-secondary" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border-radius: 6px;">
          ❌ Retirarme
        </button>
      </div>
    `;
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
}
window.renderPlayerConstructionBanner = renderPlayerConstructionBanner;

let lastWellsConstructionStatus = '';
function renderWells() {
  const container = document.getElementById('active-wells-list');
  if (!container) return;
  const count = state.wells ? state.wells.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  
  const currentStatus = (state.wells ? state.wells.map(w => (w.isUnderConstruction ? '1' : '0') + '_' + (w.isUpgrading ? '1' : '0') + '_' + (w.tier || 1) + '_' + (w.isPaused ? '1' : '0')).join(',') : '');
  
  if (container.children.length !== count || hasPlaceholder || count === 0 || currentStatus !== lastWellsConstructionStatus) {
    lastWellsConstructionStatus = currentStatus;
    if (count === 0) {
      if (!container.querySelector('.placeholder-text')) {
        container.innerHTML = `<div class="placeholder-text" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">Ningún Pozo construido</div>`;
      }
      return;
    }
    let html = '';
    state.wells.forEach((well, idx) => {
      if (well.isUnderConstruction || well.isUpgrading) {
        const isPaused = well.isPaused || false;
        const pauseBtnText = isPaused ? '▶️' : '⏸️';
        const badgeText = well.isUpgrading ? 'Mejorando' : 'Construyendo';
        const titleText = well.isUpgrading ? 
          `Pozo #${idx + 1} (Mejorando...)` : 
          `Pozo #${idx + 1} (En construcción)`;
        const statusTextVal = well.isUpgrading ? 'Mejorando...' : 'En construcción';
        html += `
          <div class="building-box" id="well-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="well-tier-badge-${idx}">${badgeText}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="well-title-${idx}">🏗️ ${titleText}</span>
              <span class="building-box-prod" id="well-prod-${idx}">${statusTextVal}</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="well-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; color: #a78bfa; font-weight: 600;">👷 ${well.workerAssigned || 0} / 2 Constructores auto</span>
                <div style="display: flex; gap: 0.25rem;">
                  <button class="btn btn-danger" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('wells', ${idx})">
                    🗑️
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};" onclick="togglePauseConstruction('wells', ${idx})">
                    ${pauseBtnText}
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;" id="well-btn-${idx}" onclick="togglePlayerConstruct('wells', ${idx})">
                    🔨 Iniciar Construcción
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        const cap = well.tier === 2 ? (CONFIG?.Water?.well_t2_capacity?.value ?? 120) : (CONFIG?.Water?.well_t1_capacity?.value ?? 50);
        html += `
          <div class="building-box" id="well-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="well-tier-badge-${idx}">Tier ${well.tier || 1}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="well-title-${idx}">💧 Pozo #${idx + 1}</span>
              <span class="building-box-prod" id="well-prod-${idx}">+${cap} Agua/día</span>
            </div>
            <div style="margin-top: 0.4rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span id="well-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel ${well.tier || 1}</span>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-danger" style="font-size: 0.65rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('wells', ${idx})">
                  🗑️
                </button>
                <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="well-upgrade-btn-${idx}" onclick="upgradeWell(${idx})">
                  Mejorar
                </button>
              </div>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
  
  if (count > 0) {
    state.wells.forEach((well, idx) => {
      if (well.isUnderConstruction || well.isUpgrading) {
        const pBar = document.getElementById(`well-progress-${idx}`);
        const pct = Math.min(100, (well.constructionElapsed / well.constructionDuration) * 100);
        if (pBar) pBar.style.width = `${pct}%`;
        
        const btn = document.getElementById(`well-btn-${idx}`);
        const isPlayerOnIt = state.playerConstructing && state.playerConstructing.type === 'wells' && state.playerConstructing.index === idx;
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
      }
    });
  }
}
window.renderWells = renderWells;

let lastWarehousesConstructionStatus = '';
function renderWarehouses() {
  const container = document.getElementById('active-warehouses-list');
  if (!container) return;
  const count = state.warehouses ? state.warehouses.length : 0;
  const hasPlaceholder = container.querySelector('.placeholder-text') !== null;
  
  const currentStatus = (state.warehouses ? state.warehouses.map(w => (w.isUnderConstruction ? '1' : '0') + '_' + (w.isUpgrading ? '1' : '0') + '_' + (w.tier || 1) + '_' + (w.isPaused ? '1' : '0') + '_' + w.type).join(',') : '');
  
  if (container.children.length !== count || hasPlaceholder || count === 0 || currentStatus !== lastWarehousesConstructionStatus) {
    lastWarehousesConstructionStatus = currentStatus;
    if (count === 0) {
      if (!container.querySelector('.placeholder-text')) {
        container.innerHTML = `<div class="placeholder-text" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; padding: 0.5rem 0;">Ningún Almacén construido</div>`;
      }
      return;
    }
    let html = '';
    state.warehouses.forEach((warehouse, idx) => {
      const typeNames = { resource: 'Recursos', food: 'Comida' };
      const typeEmojis = { resource: '📦', food: '🌾' };
      const name = typeNames[warehouse.type] || warehouse.type;
      const emoji = typeEmojis[warehouse.type] || '📦';
      
      if (warehouse.isUnderConstruction || warehouse.isUpgrading) {
        const isPaused = warehouse.isPaused || false;
        const pauseBtnText = isPaused ? '▶️' : '⏸️';
        const badgeText = warehouse.isUpgrading ? 'Mejorando' : 'Construyendo';
        const titleText = warehouse.isUpgrading ? 
          `Almacén de ${name} (Mejorando...)` : 
          `Almacén de ${name} (En construcción)`;
        const statusTextVal = warehouse.isUpgrading ? 'Mejorando...' : 'En construcción';
        html += `
          <div class="building-box" id="warehouse-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="warehouse-tier-badge-${idx}">${badgeText}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="warehouse-title-${idx}">${emoji} ${titleText}</span>
              <span class="building-box-prod" id="warehouse-prod-${idx}">${statusTextVal}</span>
            </div>
            <div class="progress-bar-container" style="height: 6px; margin: 0.5rem 0;">
              <div class="progress-bar-fill" id="warehouse-progress-${idx}" style="background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);"></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; color: #a78bfa; font-weight: 600;">👷 ${warehouse.workerAssigned || 0} / 2 Constructores auto</span>
                <div style="display: flex; gap: 0.25rem;">
                  <button class="btn btn-danger" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('warehouses', ${idx})">
                    🗑️
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem; background: ${isPaused ? '#10b981' : '#f59e0b'}; color: #fff; border-color: ${isPaused ? '#10b981' : '#f59e0b'};" onclick="togglePauseConstruction('warehouses', ${idx})">
                    ${pauseBtnText}
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;" id="warehouse-btn-${idx}" onclick="togglePlayerConstruct('warehouses', ${idx})">
                    🔨 Iniciar Construcción
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        let bonus = warehouse.tier === 1 ? 200 : (warehouse.tier === 2 ? 500 : 1000);
        if (typeof CONFIG !== 'undefined' && CONFIG.Storage) {
          const bonusKey = `warehouse_t${warehouse.tier}_bonus`;
          bonus = CONFIG.Storage[bonusKey]?.value ?? bonus;
        }
        html += `
          <div class="building-box" id="warehouse-box-${idx}" style="position: relative;">
            <div class="building-tier-badge" id="warehouse-tier-badge-${idx}">Tier ${warehouse.tier || 1}</div>
            <div class="building-box-header">
              <span class="building-box-title" id="warehouse-title-${idx}">${emoji} Almacén de ${name}</span>
              <span class="building-box-prod" id="warehouse-prod-${idx}">+${bonus} Capacidad</span>
            </div>
            <div style="margin-top: 0.4rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
              <span id="warehouse-tier-text-${idx}" style="font-size: 0.7rem; color: #a5b4fc; font-weight: 500;">Nivel ${warehouse.tier || 1}</span>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-danger" style="font-size: 0.65rem; padding: 0.2rem 0.4rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="destroyBuildingPrompt('warehouses', ${idx})">
                  🗑️
                </button>
                <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;" id="warehouse-upgrade-btn-${idx}" onclick="upgradeWarehouse(${idx})">
                  Mejorar
                </button>
              </div>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }
}
window.renderWarehouses = renderWarehouses;

function claimMissionReward(idx) {
  if (state.availableMissions && state.availableMissions[idx]) {
    state.availableMissions[idx].status = 'claimed';
    showToast("✅ Recompensa de la expedición reclamada correctamente", "success");
    if (typeof updateUI === 'function') updateUI();
  }
}
window.claimMissionReward = claimMissionReward;

// Dibuja las misiones de la aldea en paralelo y gestiona sus estados
function renderMissions() {
  const activeEl = document.activeElement;
  if (activeEl && activeEl.tagName === 'SELECT' && activeEl.className.includes('mission-colonist-dropdown-')) {
    return;
  }

  const banner = document.getElementById('missions-refresh-banner');
  const gridContainer = document.getElementById('missions-grid-container');
  if (!gridContainer) return;

  const refreshInterval = CONFIG?.Raid?.missions_refresh_interval?.value ?? 30;
  const nextRefresh = (state.missionsRefreshDay || 1) + refreshInterval;

  // 1. Renderizar banner informativo
  if (banner) {
    banner.innerHTML = `<span>ℹ️ Las expediciones disponibles se renuevan cada <strong>${refreshInterval} días</strong>. Próxima renovación al amanecer del día <strong>${nextRefresh}</strong>.</span>`;
  }

  // Asegurar que existan las misiones
  if (typeof generateAvailableMissions === 'function' && (!state.availableMissions || state.availableMissions.length === 0)) {
    generateAvailableMissions();
  }

  let html = '';
  const availableColonistsForMissions = (state.colonists || []).filter(c => !c.onMission);

  (state.availableMissions || []).forEach((m, idx) => {
    if (m.status === 'claimed') {
      // Slot de misión ya completada y reclamada
      html += `
        <div class="building-item" style="padding:2.5rem 1.5rem; border-radius:12px; background:rgba(255,255,255,0.01); border:1px dashed var(--border-color); display:flex; flex-direction:column; justify-content:center; align-items:center; gap:0.5rem; min-height:220px; text-align:center; position:relative;">
          <span style="font-size:2rem; opacity:0.3;">🗺️</span>
          <span style="font-size:0.85rem; color:var(--color-text-muted); font-weight:600;">Expedición Completada</span>
          <span style="font-size:0.75rem; color:var(--color-text-muted); opacity:0.6;">Este slot se renovará automáticamente al amanecer del día ${nextRefresh}</span>
        </div>
      `;
      return;
    }

    const difficultyEmojis = { 1: '🟢 Fácil', 2: '🟡 Media', 3: '🔴 Difícil' };
    const diffLabel = difficultyEmojis[m.difficulty] || '🟢';
    const attrLabel = typeof getAttrLabel === 'function' ? getAttrLabel(m.attribute) : m.attribute;

    // Configuración visual según el estado
    let opacityStyle = '1';
    let filterStyle = 'none';
    let overlayHtml = '';

    if (m.status === 'completed') {
      opacityStyle = '0.35';
      filterStyle = 'grayscale(40%)';
      
      const isSuccess = m.success;
      overlayHtml = `
        <div class="expeditions-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:${isSuccess ? 'rgba(34, 197, 94, 0.96)' : 'rgba(239, 68, 68, 0.96)'}; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:0.75rem; padding:1.2rem; text-align:center; z-index:10; border-radius:12px; color:#fff; box-sizing:border-box;">
          <span style="font-size:2.2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">${isSuccess ? '🎉' : '⚠️'}</span>
          <strong style="font-size:1.15rem; text-transform:uppercase; letter-spacing:1px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${isSuccess ? '¡Expedición Exitosa!' : '¡Expedición Fallida!'}</strong>
          <span style="font-size:0.8rem; font-weight:600; opacity:0.9;">${m.name}</span>
          <div style="font-size:0.8rem; background:rgba(0,0,0,0.25); padding:0.4rem 0.6rem; border-radius:6px; margin:0.2rem 0; font-weight:bold; box-shadow:inset 0 1px 3px rgba(0,0,0,0.2); width:90%; word-break:break-word;">
            ${m.rewardsText}
          </div>
          <button class="btn" onclick="claimMissionReward(${idx})" style="padding:0.45rem 1.2rem; font-size:0.8rem; font-weight:800; background:#fff; color:#000; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.3); transition:transform 0.1s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            Aceptar y Reclamar
          </button>
        </div>
      `;
    }

    // Recompensas
    let rewardsList = [];
    if (m.rewardRep > 0) rewardsList.push(`🏆 +${m.rewardRep} Rep`);
    if (m.rewardGold > 0) rewardsList.push(`🪙 +${m.rewardGold} Oro`);
    if (m.rewardSeedsType !== 'none' && m.rewardSeedsAmt > 0) {
      const seedEmojis = { wheat: '🌾 Semillas Trigo', potato: '🥔 Semillas Patata', carrot: '🥕 Semillas Zanahoria' };
      rewardsList.push(`${seedEmojis[m.rewardSeedsType] || '🌱'} x${m.rewardSeedsAmt}`);
    }
    if (m.rewardSpecialist !== 'none') {
      const specialistLabels = { random: 'Especialista', mining: 'Minero', farming: 'Agricultor', combat: 'Guerrero' };
      rewardsList.push(`🌟 Maestro ${specialistLabels[m.rewardSpecialist] || m.rewardSpecialist}`);
    }
    const rewardsText = rewardsList.join(' • ') || 'Ninguna';

    // Controles dinámicos según estado de disponibles ('available') o activa ('active')
    let actionControlsHtml = '';
    if (m.status === 'available') {
      let colonistsDropdownsHtml = '';
      if (availableColonistsForMissions.length === 0) {
        colonistsDropdownsHtml = `<span style="font-size:0.75rem; color:#f87171; font-weight:600; display:block; margin:0.4rem 0;">⚠️ Todos los aldeanos están ocupados en misiones.</span>`;
      } else {
        colonistsDropdownsHtml = `
          <div style="font-size:0.75rem; color:var(--color-text-muted); font-weight:600; margin-bottom:0.4rem;">Seleccionar participantes:</div>
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
        `;
        
        for (let s = 0; s < m.colonistsMax; s++) {
          let options = `<option value="">❌ Ninguno (Vacío)</option>`;
          availableColonistsForMissions.forEach(c => {
            const attrVal = c.attributes[m.attribute] || 1;
            const specialistBadge = c.specialist ? ' ⭐' : '';
            const currentJobLabel = c.job 
              ? (c.job === 'wood' ? 'Leñador' : c.job === 'stone' ? 'Cantero' : c.job === 'berries' ? 'Recolector' : c.job === 'construction' ? 'Constructor' : c.job.split('_')[0].toUpperCase())
              : 'Libre';
            options += `<option value="${c.id}">${c.name}${specialistBadge} (${attrLabel}: ${attrVal}) [${currentJobLabel}]</option>`;
          });
          
          colonistsDropdownsHtml += `
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:600; width:60px;">Slot #${s + 1}:</span>
              <select class="mission-colonist-dropdown-${idx}" onchange="updateMissionProbability(${idx})" style="flex:1; background:rgba(0,0,0,0.5); border:1px solid var(--border-color); color:#fff; border-radius:6px; padding:0.35rem 0.5rem; font-family:var(--font-primary); font-size:0.8rem; cursor:pointer; outline:none;">
                ${options}
              </select>
            </div>
          `;
        }
        
        colonistsDropdownsHtml += `
          </div>
          <div id="mission-prob-display-${idx}" style="font-size:0.8rem; font-weight:600; margin-top:0.5rem; padding:0.35rem 0.5rem; border-radius:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); display:inline-block; width:100%;">
            Probabilidad: <span style="color:#f87171; font-weight:bold;">Imposible (0%)</span>
          </div>
          <div id="mission-job-alert-${idx}" style="font-size:0.75rem; color:#ffd700; background:rgba(255,215,0,0.04); border:1px dashed rgba(255,215,0,0.2); padding:0.4rem 0.6rem; border-radius:6px; margin-top:0.4rem; display:none; flex-direction:column; gap:0.25rem;"></div>
        `;
      }

      actionControlsHtml = `
        <div style="margin-top:0.25rem;">
          ${colonistsDropdownsHtml}
        </div>
        <button class="btn btn-secondary btn-launch-mission" data-idx="${idx}" style="width:100%; margin-top:0.6rem; font-size:0.8rem; font-weight:700; background:rgba(192,132,252,0.15); border-color:rgba(192,132,252,0.3); color:#e9d5ff; padding:0.45rem; cursor:pointer;">
          Enviar a Misión →
        </button>
      `;
    } else if (m.status === 'active') {
      const remaining = Math.max(0, m.durationDays - m.elapsedDays);
      const progressPct = Math.min(100, (m.elapsedDays / m.durationDays) * 100);
      
      const participantNames = m.assignedColonistIds.map(id => {
        const col = state.colonists.find(c => c.id === id);
        return col ? col.name : `Aldeano #${id}`;
      }).join(', ');

      actionControlsHtml = `
        <div style="margin-top:0.5rem; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:0.8rem; border-radius:8px; display:flex; flex-direction:column; gap:0.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
            <span style="color:#c084fc; font-weight:bold;">⚔️ En Progreso...</span>
            <span style="color:var(--color-text-muted); font-weight:600;">⏱️ ${remaining.toFixed(1)} días rest.</span>
          </div>
          <div style="font-size:0.75rem; color:var(--color-text-muted);">
            👥 <strong>Participantes:</strong> ${participantNames}
          </div>
          <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden; margin-top:0.25rem;">
            <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg, #c084fc, #818cf8); border-radius:3px;"></div>
          </div>
        </div>
      `;
    }

    html += `
      <div class="building-item" style="padding:1.2rem; border-radius:12px; background:rgba(0,0,0,0.25); border:1px solid ${m.status === 'active' ? 'rgba(192,132,252,0.25)' : 'rgba(255,255,255,0.08)'}; display:flex; flex-direction:column; gap:0.6rem; position:relative; overflow:hidden; min-height:280px;">
        ${overlayHtml}
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; opacity:${opacityStyle}; filter:${filterStyle};">
          <span style="font-size:0.95rem; font-weight:700; color:#c084fc;">🗺️ ${m.name}</span>
          <span style="font-size:0.75rem; font-weight:600; color: #a5b4fc; background:rgba(165,180,252,0.1); padding:0.1rem 0.35rem; border-radius:4px;">${diffLabel}</span>
        </div>
        <div style="opacity:${opacityStyle}; filter:${filterStyle}; display:flex; flex-direction:column; gap:0.5rem; flex:1;">
          <p style="font-size:0.8rem; color:var(--color-text-muted); margin:0;">${m.description}</p>
          <div style="font-size:0.75rem; color:#fff;">
            ⏱️ <strong>Duración:</strong> ${m.duration} días • 📊 <strong>Habilidad Clave:</strong> ${attrLabel}
          </div>
          <div style="font-size:0.75rem; color:#ffd700;">
            🎁 <strong>Recompensas:</strong> ${rewardsText}
          </div>
          <div style="font-size:0.75rem; color:#94a3b8; border-top:1px dashed rgba(255,255,255,0.06); padding-top:0.5rem; margin-top:0.25rem;">
            👥 <strong>Requisito de Aldeanos:</strong> Mínimo: ${m.colonistsMin} | Máximo: ${m.colonistsMax}
          </div>
        </div>
        <div style="opacity:${opacityStyle}; filter:${filterStyle}; margin-top:auto;">
          ${actionControlsHtml}
        </div>
      </div>
    `;
  });

  gridContainer.innerHTML = html;

  // Inicializar probabilidades para las misiones que estén en estado 'available'
  (state.availableMissions || []).forEach((m, idx) => {
    if (m.status === 'available') {
      if (typeof updateMissionProbability === 'function') {
        updateMissionProbability(idx);
      }
    }
  });
}
window.renderMissions = renderMissions;

function updateMissionsDropdownsExclusivity(idx) {
  const m = state.availableMissions[idx];
  if (!m) return;
  
  const dropdowns = document.querySelectorAll(`.mission-colonist-dropdown-${idx}`);
  if (dropdowns.length === 0) return;
  
  // Guardar los IDs actualmente seleccionados
  const selectedValues = Array.from(dropdowns).map(sel => sel.value);
  
  const availableColonistsForMissions = (state.colonists || []).filter(c => !c.onMission);
  const attrLabel = typeof getAttrLabel === 'function' ? getAttrLabel(m.attribute) : m.attribute;
  
  dropdowns.forEach((sel, currentSlotIdx) => {
    const currentValue = sel.value;
    let optionsHtml = `<option value="">❌ Ninguno (Vacío)</option>`;
    
    availableColonistsForMissions.forEach(c => {
      // Un colono es elegible si es el actual de este slot O si no está seleccionado en ningún otro slot
      const isSelectedElsewhere = selectedValues.some((val, slotIdx) => slotIdx !== currentSlotIdx && val === String(c.id));
      
      if (!isSelectedElsewhere) {
        const attrVal = c.attributes[m.attribute] || 1;
        const specialistBadge = c.specialist ? ' ⭐' : '';
        const currentJobLabel = c.job 
          ? (c.job === 'wood' ? 'Leñador' : c.job === 'stone' ? 'Cantero' : c.job === 'berries' ? 'Recolector' : c.job === 'construction' ? 'Constructor' : c.job.split('_')[0].toUpperCase())
          : 'Libre';
        optionsHtml += `<option value="${c.id}" ${currentValue === String(c.id) ? 'selected' : ''}>${c.name}${specialistBadge} (${attrLabel}: ${attrVal}) [${currentJobLabel}]</option>`;
      }
    });
    
    sel.innerHTML = optionsHtml;
  });
}
window.updateMissionsDropdownsExclusivity = updateMissionsDropdownsExclusivity;

function updateMissionProbability(idx) {
  const m = state.availableMissions[idx];
  const def = window.GAME_MISSIONS ? GAME_MISSIONS.find(dm => dm.id === m.defId) : null;
  const displayEl = document.getElementById(`mission-prob-display-${idx}`);
  const btn = document.querySelector(`.btn-launch-mission[data-idx="${idx}"]`);
  const alertEl = document.getElementById(`mission-job-alert-${idx}`);
  if (!m || !displayEl || !btn) return;
  
  // 1. Forzar exclusividad en los desplegables (re-poblar opciones para ocultar lo ya seleccionado)
  if (typeof window.isUpdatingDropdownsExclusivity === 'undefined') {
    window.isUpdatingDropdownsExclusivity = false;
  }
  
  if (!window.isUpdatingDropdownsExclusivity) {
    window.isUpdatingDropdownsExclusivity = true;
    updateMissionsDropdownsExclusivity(idx);
    window.isUpdatingDropdownsExclusivity = false;
  }
  
  const dropdowns = document.querySelectorAll(`.mission-colonist-dropdown-${idx}`);
  const selectedIds = Array.from(dropdowns)
    .map(sel => sel.value)
    .filter(val => val !== "")
    .map(val => parseInt(val));
    
  const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;
  
  // 2. Generar alertas de reincorporación de trabajo si hay colonos asignados
  let alertMessages = [];
  selectedIds.forEach(id => {
    const col = state.colonists.find(c => c.id === id);
    if (col && col.job) {
      let jobLabel = col.job;
      if (col.job === 'wood') jobLabel = 'Leñador';
      else if (col.job === 'stone') jobLabel = 'Cantero';
      else if (col.job === 'berries') jobLabel = 'Recolector';
      else if (col.job === 'construction') jobLabel = 'Constructor';
      else if (col.job.startsWith('lumbermills_')) jobLabel = `Aserradero #${parseInt(col.job.split('_')[1]) + 1}`;
      else if (col.job.startsWith('quarries_')) jobLabel = `Cantera #${parseInt(col.job.split('_')[1]) + 1}`;
      else if (col.job.startsWith('farms_')) jobLabel = `Granja #${parseInt(col.job.split('_')[1]) + 1}`;
      else if (col.job.startsWith('markets_')) jobLabel = `Mercader #${parseInt(col.job.split('_')[1]) + 1}`;
      else if (col.job.startsWith('bonfires_')) jobLabel = `Hoguera/Cocina #${parseInt(col.job.split('_')[1]) + 1}`;
      else if (col.job.startsWith('granaries_')) jobLabel = `Granero #${parseInt(col.job.split('_')[1]) + 1}`;
      
      alertMessages.push(`ℹ️ <strong>${col.name}</strong> volverá automáticamente a su puesto de <strong>${jobLabel}</strong> tras la misión.`);
    }
  });
  
  if (alertEl) {
    if (alertMessages.length > 0) {
      alertEl.innerHTML = alertMessages.join('<br>');
      alertEl.style.display = 'flex';
    } else {
      alertEl.innerHTML = '';
      alertEl.style.display = 'none';
    }
  }
  
  if (selectedIds.length < m.colonistsMin) {
    displayEl.innerHTML = `Probabilidad: <span style="color:#f87171; font-weight:bold;">Imposible (requiere mín. ${m.colonistsMin} aldeanos)</span>`;
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
    return;
  }
  
  if (hasDuplicates) {
    displayEl.innerHTML = `Probabilidad: <span style="color:#f87171; font-weight:bold;">⚠️ Aldeanos duplicados</span>`;
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
    return;
  }
  
  // Calcular probabilidad dinámica
  const scalingFactor = CONFIG?.Raid?.success_scaling_factor?.value ?? 0.4;
  const maxAttrCap = CONFIG?.Raid?.max_attribute_cap?.value ?? 10;
  
  let sumAttr = 0;
  selectedIds.forEach(id => {
    const col = state.colonists.find(c => c.id === id);
    if (col && def) {
      const val = col.attributes[def.attribute] || 1;
      sumAttr += Math.min(val, maxAttrCap);
    }
  });
  
  const baseRate = def ? def.baseSuccessRate : 0.5;
  const prob = Math.min(1.0, baseRate + (sumAttr * scalingFactor));
  const probPercent = Math.round(prob * 100);
  
  let desc = 'Imposible';
  let color = '#f87171';
  if (probPercent < 30) {
    desc = 'Muy poco probable';
    color = '#f87171';
  } else if (probPercent < 50) {
    desc = 'Poco probable';
    color = '#f97316';
  } else if (probPercent < 75) {
    desc = 'Probable';
    color = '#eab308';
  } else if (probPercent < 95) {
    desc = 'Muy probable';
    color = '#22c55e';
  } else {
    desc = 'Casi seguro';
    color = '#10b981';
  }
  
  displayEl.innerHTML = `Probabilidad: <span style="color:${color}; font-weight:bold;">${desc} (${probPercent}%)</span>`;
  btn.disabled = false;
  btn.style.opacity = '1';
  btn.style.cursor = 'pointer';
}
window.updateMissionProbability = updateMissionProbability;

function renderTradeTab() {
  const activeEl = document.activeElement;
  if (activeEl && activeEl.tagName === 'SELECT') {
    if (activeEl.id.startsWith('market-slot-') || activeEl.id === 'trade-colonist-select' || activeEl.id === 'trade-route-select' || activeEl.id === 'player-trade-route-select') {
      return;
    }
  }

  if (!window.GAME_VILLAGES) return;

  // ----------------------------------------------------
  // SUBSECCIÓN 1: COMERCIO PERSONAL
  // ----------------------------------------------------
  const playerRouteSelect = document.getElementById('player-trade-route-select');
  if (playerRouteSelect && playerRouteSelect.options.length === 0) {
    let optionsHtml = '';
    window.GAME_VILLAGES.forEach(v => {
      if (v.sellsResource && v.sellsResource !== 'none') {
        const rawNames = {
          wood: 'Madera 🪵', stone: 'Piedra 🪨', food: 'Comida 🍓',
          wheat_seeds: 'Semillas Trigo 🌾🌱', potato_seeds: 'Semillas Patata 🥔🌱', carrot_seeds: 'Semillas Zanahoria 🥕🌱'
        };
        optionsHtml += `<option value="${v.id}|buy|${v.sellsResource}">🛒 Comprar ${rawNames[v.sellsResource] || v.sellsResource} de ${v.name} (${v.sellsPrice}🪙/u)</option>`;
      }
      if (v.buysResource && v.buysResource !== 'none') {
        const rawNames = {
          wood: 'Madera 🪵', stone: 'Piedra 🪨', food: 'Comida 🍓',
        };
        optionsHtml += `<option value="${v.id}|sell|${v.buysResource}">💰 Vender ${rawNames[v.buysResource] || v.buysResource} a ${v.name} (${v.buysPrice}🪙/u)</option>`;
      }
    });
    playerRouteSelect.innerHTML = optionsHtml;
  }

  updatePlayerTradeDetails();

  // ----------------------------------------------------
  // SUBSECCIÓN 2: MERCADOS (Caravanas de Aldeanos)
  // ----------------------------------------------------
  const countMarkets = state.markets ? state.markets.length : 0;
  const isMarketBuilt = countMarkets > 0 && !state.markets[0].isUnderConstruction;

  const marketLockedMsg = document.getElementById('market-locked-msg');
  const marketCaravansContainer = document.getElementById('market-caravans-container');

  if (isMarketBuilt) {
    if (marketLockedMsg) marketLockedMsg.style.display = 'none';
    if (marketCaravansContainer) marketCaravansContainer.style.display = 'flex';

    // Renderizar los 2 slots de mercaderes
    for (let slotIdx = 0; slotIdx <= 1; slotIdx++) {
      const selectEl = document.getElementById(`market-slot-${slotIdx}-select`);
      const unassignBtn = document.getElementById(`btn-unassign-slot-${slotIdx}`);
      if (selectEl) {
        const currentAssigned = state.colonists ? state.colonists.find(c => c.job === 'merchant_slot_' + slotIdx) : null;
        
        let html = '';
        if (currentAssigned) {
          const statusText = currentAssigned.onMission ? ' (EN VIAJE)' : '';
          const trLvl = currentAssigned.attributes.trading || 3;
          html = `<option value="${currentAssigned.id}" selected>${currentAssigned.name} (Comercio Nv.${trLvl})${statusText}</option>`;
          selectEl.disabled = true;
          if (unassignBtn) {
            unassignBtn.disabled = currentAssigned.onMission || state.playerOnMission;
            unassignBtn.style.opacity = (currentAssigned.onMission || state.playerOnMission) ? '0.5' : '1';
            unassignBtn.style.cursor = (currentAssigned.onMission || state.playerOnMission) ? 'not-allowed' : 'pointer';
          }
        } else {
          selectEl.disabled = state.playerOnMission;
          html = '<option value="">-- Slot Vacío (Asigna un aldeano libre) --</option>';
          const freeColonists = state.colonists ? state.colonists.filter(c => c.job === null && !c.onMission && !c.isStarving) : [];
          freeColonists.forEach(c => {
            const trLvl = c.attributes.trading || 3;
            html += `<option value="${c.id}">${c.name} (Comercio Nv.${trLvl})</option>`;
          });
          if (unassignBtn) {
            unassignBtn.disabled = true;
            unassignBtn.style.opacity = '0.5';
            unassignBtn.style.cursor = 'not-allowed';
          }
        }
        selectEl.innerHTML = html;
      }
    }

    // Rellenar el selector de mercaderes del formulario de envío de caravana
    const colonistSelect = document.getElementById('trade-colonist-select');
    if (colonistSelect) {
      const prevVal = colonistSelect.value;
      const assignedMerchants = state.colonists ? state.colonists.filter(c => c.job && c.job.startsWith('merchant_slot_')) : [];
      const availableMerchants = assignedMerchants.filter(c => !c.onMission && !c.isStarving);

      if (availableMerchants.length === 0) {
        colonistSelect.innerHTML = '<option value="">-- No hay mercaderes libres en slots --</option>';
        colonistSelect.disabled = true;
      } else {
        colonistSelect.disabled = false;
        let html = '';
        availableMerchants.forEach(c => {
          const slot = c.job.replace('merchant_slot_', '');
          html += `<option value="${slot}">Slot ${parseInt(slot) + 1}: ${c.name}</option>`;
        });
        colonistSelect.innerHTML = html;
        if (prevVal && availableMerchants.some(c => c.job === 'merchant_slot_' + prevVal)) {
          colonistSelect.value = prevVal;
        }
      }
    }

    // Rellenar las rutas en mercados
    const routeSelect = document.getElementById('trade-route-select');
    if (routeSelect && routeSelect.options.length === 0) {
      let optionsHtml = '';
      window.GAME_VILLAGES.forEach(v => {
        if (v.sellsResource && v.sellsResource !== 'none') {
          const rawNames = {
            wood: 'Madera 🪵', stone: 'Piedra 🪨', food: 'Comida 🍓',
            wheat_seeds: 'Semillas Trigo 🌾🌱', potato_seeds: 'Semillas Patata 🥔🌱', carrot_seeds: 'Semillas Zanahoria 🥕🌱'
          };
          optionsHtml += `<option value="${v.id}|buy|${v.sellsResource}">🛒 Comprar ${rawNames[v.sellsResource] || v.sellsResource} de ${v.name} (${v.sellsPrice}🪙/u)</option>`;
        }
        if (v.buysResource && v.buysResource !== 'none') {
          const rawNames = {
            wood: 'Madera 🪵', stone: 'Piedra 🪨', food: 'Comida 🍓',
          };
          optionsHtml += `<option value="${v.id}|sell|${v.buysResource}">💰 Vender ${rawNames[v.buysResource] || v.buysResource} a ${v.name} (${v.buysPrice}🪙/u)</option>`;
        }
      });
      routeSelect.innerHTML = optionsHtml;
    }

    updateTradeDetails();

  } else {
    if (marketLockedMsg) marketLockedMsg.style.display = 'block';
    if (marketCaravansContainer) marketCaravansContainer.style.display = 'none';
  }

  // ----------------------------------------------------
  // DIRECTORIO DE PUEBLOS
  // ----------------------------------------------------
  const directoryContainer = document.getElementById('villages-directory-list');
  if (directoryContainer) {
    const grouped = {};
    window.GAME_VILLAGES.forEach(v => {
      if (!grouped[v.name]) {
        grouped[v.name] = {
          name: v.name,
          distanceDays: v.distanceDays,
          sells: [],
          buys: []
        };
      }
      const rawNames = {
        wood: 'Madera 🪵', stone: 'Piedra 🪨', food: 'Comida 🍓',
        wheat_seeds: 'Semillas Trigo 🌾🌱', potato_seeds: 'Semillas Patata 🥔🌱', carrot_seeds: 'Semillas Zanahoria 🥕🌱'
      };
      if (v.sellsResource && v.sellsResource !== 'none') {
        grouped[v.name].sells.push(`${rawNames[v.sellsResource] || v.sellsResource} (${v.sellsPrice}🪙)`);
      }
      if (v.buysResource && v.buysResource !== 'none') {
        grouped[v.name].buys.push(`${rawNames[v.buysResource] || v.buysResource} (${v.buysPrice}🪙)`);
      }
    });

    let directoryHtml = '';
    for (let name in grouped) {
      const g = grouped[name];
      directoryHtml += `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; font-size: 0.85rem;">
          <div style="font-weight: 700; color: #a5b4fc; display: flex; justify-content: space-between; align-items: center;">
            <span>🏡 ${g.name}</span>
            <span style="font-weight: 500; font-size: 0.75rem; color: var(--color-text-muted);">📍 Distancia: ${g.distanceDays} día(s)</span>
          </div>
          <div style="margin-top: 0.4rem; display: flex; flex-direction: column; gap: 0.2rem; color: var(--color-text);">
            <div><span style="color: #34d399; font-weight: 600; font-size: 0.75rem;">🛒 Vende:</span> ${g.sells.join(', ')}</div>
            <div><span style="color: #f87171; font-weight: 600; font-size: 0.75rem;">💰 Compra:</span> ${g.buys.join(', ')}</div>
          </div>
        </div>
      `;
    }
    directoryContainer.innerHTML = directoryHtml;
  }

  // ----------------------------------------------------
  // VIAJES ACTIVOS / EN RUTA (Colonos)
  // ----------------------------------------------------
  const activeTradesList = document.getElementById('active-trades-list');
  if (activeTradesList) {
    if (!state.activeTrades || state.activeTrades.length === 0) {
      activeTradesList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--color-text-muted); font-size: 0.9rem; background: rgba(0,0,0,0.1); border-radius: 8px; border: 1px dashed var(--border-color);">
          No hay caravanas en ruta actualmente.
        </div>
      `;
    } else {
      let html = '';
      state.activeTrades.forEach(trade => {
        const pct = Math.min(100, Math.max(0, (1 - trade.timeLeftDays / trade.durationDays) * 100));
        const rawNames = {
          wood: 'Madera 🪵', stone: 'Piedra 🪨', food: 'Comida 🍓',
          wheat_seeds: 'Semillas Trigo 🌾🌱', potato_seeds: 'Semillas Patata 🥔🌱', carrot_seeds: 'Semillas Zanahoria 🥕🌱'
        };
        const resourceLabel = rawNames[trade.resource] || trade.resource;
        
        let timeText = '';
        if (trade.timeLeftDays > 0.1) {
          timeText = `${trade.timeLeftDays.toFixed(1)} días`;
        } else {
          timeText = `${Math.round(trade.timeLeftDays * 24)}h`;
        }

        html += `
          <div style="background: rgba(30, 41, 59, 0.3); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">
                🚚 Caravana a ${trade.villageName}
              </div>
              <div style="font-size: 0.75rem; background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4); color: #a5b4fc; padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 600;">
                ${trade.type === 'buy' ? 'Comprar' : 'Vender'} x${trade.amount}
              </div>
            </div>
            
            <div style="font-size: 0.8rem; color: var(--color-text-muted); display: flex; justify-content: space-between;">
              <span>Aldeano: <strong style="color: #fff;">${trade.colonistName}</strong></span>
              <span>Tiempo restante: <strong style="color: #fbbf24;">${timeText}</strong></span>
            </div>

            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
              Intercambio: ${trade.type === 'buy' ? `${trade.totalPrice}🪙 por ${resourceLabel}` : `${trade.amount} ${resourceLabel} por ${trade.totalPrice}🪙`}
            </div>

            <div class="progress-bar-container" style="height: 6px; margin: 0.2rem 0 0 0; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
              <div class="progress-bar-fill" style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #7c3aed 0%, #a5b4fc 100%); transition: width 0.2s ease;"></div>
            </div>
          </div>
        `;
      });
      activeTradesList.innerHTML = html;
    }
  }
}

function updateTradeDetails() {
  const routeSelect = document.getElementById('trade-route-select');
  const amountInput = document.getElementById('trade-amount-input');
  const detailsPanel = document.getElementById('trade-details-panel');
  const btnStart = document.getElementById('btn-start-trade');
  const colonistSelect = document.getElementById('trade-colonist-select');

  if (!routeSelect || !amountInput || !detailsPanel || !btnStart) return;

  const val = routeSelect.value;
  const amount = parseInt(amountInput.value) || 0;

  if (!val || amount <= 0) {
    detailsPanel.innerHTML = '<span style="color: var(--color-text-muted);">Configura la caravana para ver los detalles.</span>';
    btnStart.disabled = true;
    btnStart.style.opacity = '0.5';
    return;
  }

  const parts = val.split('|');
  const villageId = parts[0];
  const type = parts[1];
  const resource = parts[2];

  const village = window.GAME_VILLAGES ? window.GAME_VILLAGES.find(v => v.id === villageId) : null;
  if (!village) {
    detailsPanel.innerHTML = '<span style="color: var(--color-text-muted);">Error al cargar pueblo.</span>';
    btnStart.disabled = true;
    btnStart.style.opacity = '0.5';
    return;
  }

  let text = '';
  let isAffordable = true;
  const rawNames = {
    wood: 'Madera 🪵', stone: 'Piedra 🪨', food: 'Comida 🍓',
    wheat_seeds: 'Semillas Trigo 🌾🌱', potato_seeds: 'Semillas Patata 🥔🌱', carrot_seeds: 'Semillas Zanahoria 🥕🌱'
  };
  const resourceLabel = rawNames[resource] || resource;

  if (type === 'buy') {
    const totalGoldCost = village.sellsPrice * amount;
    const hasGold = state.gold >= totalGoldCost;
    isAffordable = hasGold;
    
    text = `
      <div style="display: flex; justify-content: space-between;">
        <span>Operación:</span>
        <span style="font-weight: 700; color: #34d399;">🛒 Comprar</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Pagar:</span>
        <span style="font-weight: 700; color: ${hasGold ? '#fbbf24' : '#ef4444'};">${totalGoldCost} 🪙 ${hasGold ? '' : '(No disponible)'}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Recibir al regresar:</span>
        <span style="font-weight: 700; color: #fff;">x${amount} ${resourceLabel}</span>
      </div>
    `;
  } else {
    const totalResourceCost = amount;
    const currentStock = resource.endsWith('_seeds')
      ? (state.seeds ? state.seeds[resource.replace('_seeds', '')] || 0 : 0)
      : (state[resource] || 0);
    const hasResource = currentStock >= totalResourceCost;
    isAffordable = hasResource;

    text = `
      <div style="display: flex; justify-content: space-between;">
        <span>Operación:</span>
        <span style="font-weight: 700; color: #fbbf24;">💰 Vender</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Entregar ahora:</span>
        <span style="font-weight: 700; color: ${hasResource ? '#fff' : '#ef4444'};">${totalResourceCost} de ${resourceLabel} ${hasResource ? '' : '(Stock insuficiente)'}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Recibir al regresar:</span>
        <span style="font-weight: 700; color: #34d399;">+${village.buysPrice * amount} 🪙</span>
      </div>
    `;
  }

  const durationDays = (village.distanceDays || 1) * 2;
  text += `
    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.4rem; margin-top: 0.2rem;">
      <span>Duración viaje:</span>
      <span style="font-weight: 700; color: #a5b4fc;">${durationDays} días de juego (ida/vuelta)</span>
    </div>
  `;

  detailsPanel.innerHTML = text;
  
  const colVal = colonistSelect ? colonistSelect.value : '';
  const hasColonistSelected = colVal !== '';

  if (isAffordable && hasColonistSelected && !state.playerOnMission) {
    btnStart.disabled = false;
    btnStart.style.opacity = '1';
    btnStart.style.cursor = 'pointer';
  } else {
    btnStart.disabled = true;
    btnStart.style.opacity = '0.5';
    btnStart.style.cursor = 'not-allowed';
  }
}

function updatePlayerTradeDetails() {
  const routeSelect = document.getElementById('player-trade-route-select');
  const amountInput = document.getElementById('player-trade-amount-input');
  const detailsPanel = document.getElementById('player-trade-details-panel');
  const btnStart = document.getElementById('btn-start-player-trade');

  if (!routeSelect || !amountInput || !detailsPanel || !btnStart) return;

  const val = routeSelect.value;
  const amount = parseInt(amountInput.value) || 0;

  if (!val || amount <= 0) {
    detailsPanel.innerHTML = '<span style="color: var(--color-text-muted);">Configura el viaje para ver los detalles.</span>';
    btnStart.disabled = true;
    btnStart.style.opacity = '0.5';
    return;
  }

  const parts = val.split('|');
  const villageId = parts[0];
  const type = parts[1];
  const resource = parts[2];

  const village = window.GAME_VILLAGES ? window.GAME_VILLAGES.find(v => v.id === villageId) : null;
  if (!village) {
    detailsPanel.innerHTML = '<span style="color: var(--color-text-muted);">Error al cargar pueblo.</span>';
    btnStart.disabled = true;
    btnStart.style.opacity = '0.5';
    return;
  }

  let text = '';
  let isAffordable = true;
  const rawNames = {
    wood: 'Madera 🪵', stone: 'Piedra 🪨', food: 'Comida 🍓',
    wheat_seeds: 'Semillas Trigo 🌾🌱', potato_seeds: 'Semillas Patata 🥔🌱', carrot_seeds: 'Semillas Zanahoria 🥕🌱'
  };
  const resourceLabel = rawNames[resource] || resource;

  if (type === 'buy') {
    const totalGoldCost = village.sellsPrice * amount;
    const hasGold = state.gold >= totalGoldCost;
    isAffordable = hasGold;
    
    text = `
      <div style="display: flex; justify-content: space-between;">
        <span>Operación:</span>
        <span style="font-weight: 700; color: #34d399;">🛒 Comprar</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Pagar:</span>
        <span style="font-weight: 700; color: ${hasGold ? '#fbbf24' : '#ef4444'};">${totalGoldCost} 🪙 ${hasGold ? '' : '(No disponible)'}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Recibir al regresar:</span>
        <span style="font-weight: 700; color: #fff;">x${amount} ${resourceLabel}</span>
      </div>
    `;
  } else {
    const totalResourceCost = amount;
    const currentStock = resource.endsWith('_seeds')
      ? (state.seeds ? state.seeds[resource.replace('_seeds', '')] || 0 : 0)
      : (state[resource] || 0);
    const hasResource = currentStock >= totalResourceCost;
    isAffordable = hasResource;

    text = `
      <div style="display: flex; justify-content: space-between;">
        <span>Operación:</span>
        <span style="font-weight: 700; color: #fbbf24;">💰 Vender</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Entregar ahora:</span>
        <span style="font-weight: 700; color: ${hasResource ? '#fff' : '#ef4444'};">${totalResourceCost} de ${resourceLabel} ${hasResource ? '' : '(Stock insuficiente)'}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Recibir al regresar:</span>
        <span style="font-weight: 700; color: #34d399;">+${village.buysPrice * amount} 🪙</span>
      </div>
    `;
  }

  const durationDays = (village.distanceDays || 1) * 2;
  text += `
    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.4rem; margin-top: 0.2rem;">
      <span>Duración viaje:</span>
      <span style="font-weight: 700; color: #a5b4fc;">${durationDays} días de juego (ida/vuelta)</span>
    </div>
  `;

  detailsPanel.innerHTML = text;
  
  if (isAffordable && !state.playerOnMission) {
    btnStart.disabled = false;
    btnStart.style.opacity = '1';
    btnStart.style.cursor = 'pointer';
  } else {
    btnStart.disabled = true;
    btnStart.style.opacity = '0.5';
    btnStart.style.cursor = 'not-allowed';
  }
}

function updatePlayerTravelOverlay() {
  const banner = document.getElementById('player-travel-banner');
  if (!banner) return;

  if (state.playerOnMission && state.playerMission) {
    banner.style.display = 'flex';
    
    const trade = state.playerMission;
    const descEl = document.getElementById('player-travel-banner-desc');
    const timeEl = document.getElementById('player-travel-banner-time');
    const progressFill = document.getElementById('player-travel-banner-progress-bar');
    
    const rawNames = {
      wood: 'Madera', stone: 'Piedra', food: 'Comida',
      wheat_seeds: 'Semillas Trigo', potato_seeds: 'Semillas Patata', carrot_seeds: 'Semillas Zanahoria'
    };
    const actionLabel = trade.type === 'buy' ? 'Comprar' : 'Vender';
    const resourceLabel = rawNames[trade.resource] || trade.resource;
    
    if (descEl) {
      descEl.textContent = `Viajando a ${trade.villageName} para ${actionLabel.toLowerCase()} x${trade.amount} de ${resourceLabel}`;
    }
    
    if (timeEl) {
      let timeText = '';
      if (trade.timeLeftDays > 0.1) {
        timeText = `${trade.timeLeftDays.toFixed(1)} días`;
      } else {
        timeText = `${Math.round(trade.timeLeftDays * 24)}h`;
      }
      timeEl.textContent = `Faltan: ${timeText}`;
    }
    
    if (progressFill) {
      const pct = Math.min(100, Math.max(0, (1 - trade.timeLeftDays / trade.durationDays) * 100));
      progressFill.style.width = `${pct}%`;
    }
  } else {
    banner.style.display = 'none';
  }

  // Deshabilitar/Habilitar botones de recolección manual de recursos durante el viaje del jugador
  const keys = ['wood', 'stone', 'berries'];
  keys.forEach(k => {
    const btn = document.getElementById(`btn-gather-${k}`);
    if (btn) {
      if (state.playerOnMission) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        // En estado normal, updateButtonStates se encargará del cooldown, pero aseguramos re-habilitar el cursor
        btn.style.cursor = 'pointer';
      }
    }
  });
}

window.renderTradeTab = renderTradeTab;
window.updateTradeDetails = updateTradeDetails;
window.updatePlayerTradeDetails = updatePlayerTradeDetails;
window.updatePlayerTravelOverlay = updatePlayerTravelOverlay;



