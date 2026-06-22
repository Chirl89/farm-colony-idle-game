// DEFAULT_CSV_DATA fallbacks
const DEFAULT_CSV_DATA = {
  buildings: `Category;Type;Name;Cost_Gold;Cost_Wood;Cost_Stone;Yield_Amount;Yield_Type;Extra_Info;
Building;basic_house;Choza;0;5;3;1;maxPopulation;;
Building;upgraded_house;Mejorar Choza;0;40;30;1;maxPopulationUpgrade;;
Building;lumbermill;Cabaña de Leñador;80;0;40;0;;;
Building;quarry;Foso de Piedra;100;40;0;0;;;
Building;farm;Granja;0;30;20;0;;;
Building;market;Puesto de Mercado;0;60;50;0;;;
Building;hire_colonist;Contratar Aldeano;5;0;0;1;colonist;;
Building;bonfire;Fogata;0;40;20;0;;;
Building;pot_upgrade;Mejorar a Caldero;50;0;30;0;;;
Building;kitchen_upgrade;Mejorar a Cocina de Taberna;100;50;0;0;;;
Building;townhall;Ayuntamiento T1;0;10;5;0;;;
Building;townhall_t2;Mejorar Ayuntamiento T2;0;60;80;0;;;
Building;townhall_t3;Mejorar Ayuntamiento T3;200;120;150;0;;;
Building;granary;Granero;0;50;30;0;0;;;
Building;granary_t2;Mejorar Granero T2;80;80;50;0;0;;;
Building;granary_t3;Mejorar Granero T3;150;120;80;0;0;;;`,
  prices: `Category;Type;Name;Cost_Gold;Cost_Wood;Cost_Stone;Yield_Amount;Yield_Type;Extra_Info;
Sales;sell_food_manual;Venta Manual Comida;0;0;0;3;gold;Consumes:1:food;
Sales;sell_wood_manual;Venta Manual Madera;0;0;0;1;gold;Consumes:1:wood;
Sales;sell_stone_manual;Venta Manual Piedra;0;0;0;1;gold;Consumes:1:stone;
Sales;market_food;Venta Automática Comida;0;0;0;3;gold;Consumes:1:food;
Sales;market_wood;Venta Automática Madera;0;0;0;1;gold;Consumes:1:wood;
Sales;market_stone;Venta Automática Piedra;0;0;0;1;gold;Consumes:1:stone;
Sales;sell_cooked_manual;Venta Manual Cocinada;0;0;0;5;gold;Consumes:1:cookedFood;
Sales;market_cooked;Venta Automática Cocinada;0;0;0;4;gold;Consumes:1:cookedFood;
Sales;buy_wheat_seeds;Comprar Granos de Trigo;5;0;0;0;1;wheatSeeds;;
Sales;buy_potato_seeds;Comprar Semillas de Patata;8;0;0;0;1;potatoSeeds;;
Sales;buy_carrot_seeds;Comprar Semillas de Zanahoria;12;0;0;0;1;carrotSeeds;;
Sales;sell_wheat_seeds_manual;Venta Manual Semillas Trigo;0;0;0;3;gold;Consumes:1:wheat_seeds;;
Sales;sell_potato_seeds_manual;Venta Manual Semillas Patata;0;0;0;5;gold;Consumes:1:potato_seeds;;
Sales;sell_carrot_seeds_manual;Venta Manual Semillas Zanahoria;0;0;0;8;gold;Consumes:1:carrot_seeds;;
Sales;market_wheat_seeds;Venta Automática Semillas Trigo;0;0;0;3;gold;Consumes:1:wheat_seeds;;
Sales;market_potato_seeds;Venta Automática Semillas Patata;0;0;0;5;gold;Consumes:1:potato_seeds;;
Sales;market_carrot_seeds;Venta Automática Semillas Zanahoria;0;0;0;8;gold;Consumes:1:carrot_seeds;;
Sales;buy_wood;Comprar Madera;2;0;0;1;wood;;
Sales;buy_stone;Comprar Piedra;2;0;0;1;stone;;
Sales;buy_wheat;Comprar Trigo;5;0;0;1;wheat;;
Sales;buy_potato;Comprar Patata;6;0;0;1;potato;;
Sales;buy_carrot;Comprar Zanahoria;8;0;0;1;carrot;;
Sales;buy_berries;Comprar Frutos;3;0;0;1;berries;;
Sales;buy_cooked_wheat;Comprar Pan;20;0;0;1;cooked_wheat;;
Sales;buy_cooked_potato;Comprar Patata Asada;24;0;0;1;cooked_potato;;
Sales;buy_cooked_carrot;Comprar Zanahoria Asada;30;0;0;1;cooked_carrot;;
Sales;buy_cooked_berries;Comprar Mermelada;15;0;0;1;cooked_berries;;`,
  production: `Category;Type;Name;Cost_Gold;Cost_Wood;Cost_Stone;Yield_Amount;Yield_Type;Extra_Info;
BasicGathering;wood_manual;Recolección de Madera;0;0;0;1;wood;;
BasicGathering;stone_manual;Recolección de Piedra;0;0;0;1;stone;;
BasicGathering;berries_manual;Recolección de Frutos;0;0;0;1;food;;
BasicGathering;wood_auto;Leñador;0;0;0;5;wood;;
BasicGathering;stone_auto;Cantero;0;0;0;5;stone;;
BasicGathering;berries_auto;Recolector de Frutos;0;0;0;8;food;;
Crop;wheat;Trigo;5;0;0;30;food;;
Crop;potato;Patata;10;0;0;100;food;;
Crop;carrot;Zanahoria;20;0;0;300;food;;
Processing;bonfire_auto;Cocinar Automático Fogata;0;0;0;1;cookedFood;Consumes:1:food;
Processing;bonfire_manual;Cocinar Manual Fogata;0;0;0;1;cookedFood;Consumes:1:food;
Processing;pot_auto;Cocinar Automático Caldero;0;0;0;1;cookedFood;Consumes:1:food;
Processing;pot_manual;Cocinar Manual Caldero;0;0;0;1;cookedFood;Consumes:1:food;
Processing;kitchen_auto;Cocinar Automático Cocina de Taberna;0;0;0;1;cookedFood;Consumes:1:food;
Processing;kitchen_manual;Cocinar Manual Cocina de Taberna;0;0;0;1;cookedFood;Consumes:1:food;
ProductionRate;lumbermill_prod;Producción Cabaña de Leñador;0;0;0;5;wood;;
ProductionRate;quarry_prod;Producción Foso de Piedra;0;0;0;5;stone;;
Processing;granary_wheat_t1;Producir Semillas de Trigo T1;0;0;0;1;wheat_seeds;Consumes:5:wheat
Processing;granary_wheat_t2;Producir Semillas de Trigo T2;0;0;0;1;wheat_seeds;Consumes:5:wheat
Processing;granary_wheat_t3;Producir Semillas de Trigo T3;0;0;0;2;wheat_seeds;Consumes:10:wheat
Processing;granary_potato_t1;Producir Semillas de Patata T1;0;0;0;1;potato_seeds;Consumes:5:potato
Processing;granary_potato_t2;Producir Semillas de Patata T2;0;0;0;1;potato_seeds;Consumes:5:potato
Processing;granary_potato_t3;Producir Semillas de Patata T3;0;0;0;2;potato_seeds;Consumes:10:potato
Processing;granary_carrot_t1;Producir Semillas de Zanahoria T1;0;0;0;1;carrot_seeds;Consumes:5:carrot
Processing;granary_carrot_t2;Producir Semillas de Zanahoria T2;0;0;0;1;carrot_seeds;Consumes:5:carrot
Processing;granary_carrot_t3;Producir Semillas de Zanahoria T3;0;0;0;2;carrot_seeds;Consumes:10:carrot;`,
  timings: `Category;Type;Name;Duration;
Timing;day_duration;Duración del Día;30;
Timing;night_duration;Duración de la Noche;20;
Timing;basic_house;Construcción Choza;10;
Timing;upgraded_house;Mejora Choza a Cabaña;20;
Timing;upgraded_house_t3;Mejora Cabaña a Casa Grande;30;
Timing;lumbermill;Construcción Cabaña de Leñador;15;
Timing;quarry;Construcción Foso de Piedra;15;
Timing;farm;Construcción Granja;15;
Timing;market;Construcción Puesto de Mercado;20;
Timing;bonfire;Construcción Fogata;15;
Timing;townhall;Construcción Ayuntamiento T1;10;
Timing;townhall_t2;Mejora Ayuntamiento T2;25;
Timing;townhall_t3;Mejora Ayuntamiento T3;40;
Timing;wood_auto;Tiempo Leñador;1;
Timing;stone_auto;Tiempo Cantero;1;
Timing;berries_auto;Tiempo Recolector de Frutos;1;
Timing;lumbermill_prod;Producción Cabaña de Leñador;1;
Timing;quarry_prod;Producción Foso de Piedra;1;
Timing;wheat;Tiempo Crecimiento Trigo;30;
Timing;potato;Tiempo Crecimiento Patata;50;
Timing;carrot;Tiempo Crecimiento Zanahoria;100;
Timing;bonfire_auto;Tiempo Cocinar Automático Fogata;5;
Timing;bonfire_manual;Tiempo Cocinar Manual Fogata;3;
Timing;pot_auto;Tiempo Cocinar Automático Caldero;4;
Timing;pot_manual;Tiempo Cocinar Manual Caldero;2;
Timing;kitchen_auto;Tiempo Cocinar Automático Cocina;3;
Timing;kitchen_manual;Tiempo Cocinar Manual Cocina;1.5;
Timing;farm_plow;Tiempo de Arar Granja;3;
Timing;farm_sow;Tiempo de Sembrar Granja;3;
Timing;farm_water;Tiempo de Riego Inicial;2;
Timing;farm_water_daily;Tiempo de Riego Diario;1.5;
Timing;global_buy;Tiempo Compra Mercado;3;
Timing;global_sell;Tiempo Venta Mercado;3;
Timing;gather_cooldown;Cooldown de Recolección Manual;2;
Timing;granary;Construcción Granero;15;
Timing;granary_t2;Mejora Granero T2;25;
Timing;granary_t3;Mejora Granero T3;40;
Timing;granary_wheat_t1;Tiempo Semillas Trigo T1;3;
Timing;granary_wheat_t2;Tiempo Semillas Trigo T2;2;
Timing;granary_wheat_t3;Tiempo Semillas Trigo T3;3;
Timing;granary_potato_t1;Tiempo Semillas Patata T1;5;
Timing;granary_potato_t2;Tiempo Semillas Patata T2;3;
Timing;granary_potato_t3;Tiempo Semillas Patata T3;5;
Timing;granary_carrot_t1;Tiempo Semillas Zanahoria T1;10;
Timing;granary_carrot_t2;Tiempo Semillas Zanahoria T2;7;
Timing;granary_carrot_t3;Tiempo Semillas Zanahoria T3;10;`,
  equivalences: `Category;Type;Name;Yield_Amount
FoodEquivalence;wheat;Trigo;1
FoodEquivalence;potato;Patata;1
FoodEquivalence;carrot;Zanahoria;1
FoodEquivalence;berries;Frutos;1
FoodEquivalence;cooked_wheat;Pan;5
FoodEquivalence;cooked_potato;Patata Asada;5
FoodEquivalence;cooked_carrot;Zanahoria Asada;5
FoodEquivalence;cooked_berries;Mermelada;5
FoodNeed;colonist_need;Necesidad de Comida de Aldeano;5`
};

// Variable CONFIG global (se inicializará con fallbacks inmediatamente)
var CONFIG = {};

// Parsear un texto CSV a objeto estructurado
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const parsedConfig = {};
  
  if (lines.length === 0) return parsedConfig;
  
  // Auto-detectar delimitador en base a la primera línea no vacía
  let delimiter = ',';
  let headerLine = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      if (line.includes(';')) {
        delimiter = ';';
      }
      headerLine = line;
      break;
    }
  }
  
  if (!headerLine) return parsedConfig;
  
  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase());
  const idxCategory = headers.indexOf('category');
  const idxType = headers.indexOf('type');
  const idxName = headers.indexOf('name');
  const idxCostGold = headers.indexOf('cost_gold');
  const idxCostWood = headers.indexOf('cost_wood');
  const idxCostStone = headers.indexOf('cost_stone');
  const idxDuration = headers.indexOf('duration');
  const idxYieldAmount = headers.indexOf('yield_amount');
  const idxYieldType = headers.indexOf('yield_type');
  const idxExtraInfo = headers.indexOf('extra_info');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const columns = line.split(delimiter);
    if (columns.length < 3) continue;
    
    const category = columns[idxCategory] || '';
    if (category === 'Category' || category.toLowerCase() === 'category') continue;
    
    const type = columns[idxType] || '';
    const name = columns[idxName] || '';
    const cost_gold = idxCostGold !== -1 ? (parseFloat(columns[idxCostGold]) || 0) : 0;
    const cost_wood = idxCostWood !== -1 ? (parseFloat(columns[idxCostWood]) || 0) : 0;
    const cost_stone = idxCostStone !== -1 ? (parseFloat(columns[idxCostStone]) || 0) : 0;
    const duration = idxDuration !== -1 ? (parseFloat(columns[idxDuration]) || 0) : 0;
    const yield_amount = idxYieldAmount !== -1 ? (parseFloat(columns[idxYieldAmount]) || 0) : 0;
    const yield_type = idxYieldType !== -1 ? (columns[idxYieldType] || '') : '';
    
    // Recomponer extra_info si contenía delimitadores internamente
    let extra_info = '';
    if (idxExtraInfo !== -1) {
      extra_info = columns.slice(idxExtraInfo).join(delimiter) || '';
    }
    
    let consume_amount = 0;
    let consume_type = '';
    if (extra_info.startsWith('Consumes:')) {
      const normalized = extra_info.split(delimiter).join(':');
      const parts = normalized.split(':');
      if (parts.length >= 3) {
        consume_amount = parseFloat(parts[1]) || 0;
        consume_type = parts[2];
      }
    }
    
    if (!parsedConfig[category]) parsedConfig[category] = {};
    
    if (category === 'Crop') {
      parsedConfig[category][type] = {
        name: name,
        cost: cost_gold,
        duration: duration,
        yield: yield_amount
      };
    } else if (category === 'Building') {
      parsedConfig[category][type] = {
        name: name,
        cost_gold: cost_gold,
        cost_wood: cost_wood,
        cost_stone: cost_stone,
        duration: duration,
        yield_type: yield_type,
        yield_amount: yield_amount
      };
    } else {
      parsedConfig[category][type] = {
        name: name,
        duration: duration,
        yield: yield_amount,
        yield_type: yield_type,
        consume_amount: consume_amount,
        consume_type: consume_type,
        cost_gold: cost_gold,
        cost_wood: cost_wood,
        cost_stone: cost_stone
      };
    }
  }
  return parsedConfig;
}

function applyTimingsFromConfig() {
  if (typeof CONFIG !== 'undefined' && CONFIG.Timing) {
    // 1. Aplicar todos los tiempos específicos que coincidan exactamente en tipo
    for (let type in CONFIG.Timing) {
      const duration = CONFIG.Timing[type].duration;
      for (let category in CONFIG) {
        if (category !== 'Timing' && CONFIG[category] && CONFIG[category][type]) {
          CONFIG[category][type].duration = duration;
        }
      }
    }
    
    // 2. Aplicar los tiempos globales de compra/venta a las transacciones de mercado
    const globalBuy = CONFIG.Timing.global_buy ? CONFIG.Timing.global_buy.duration : 3.0;
    const globalSell = CONFIG.Timing.global_sell ? CONFIG.Timing.global_sell.duration : 3.0;
    
    if (CONFIG.Sales) {
      for (let type in CONFIG.Sales) {
        if (type.startsWith('buy_')) {
          CONFIG.Sales[type].duration = globalBuy;
        } else if (type.startsWith('market_') || type.startsWith('sell_')) {
          CONFIG.Sales[type].duration = globalSell;
        }
      }
    }
  }
}

// Inicialización síncrona inmediata con los datos por defecto
function initDefaultConfig() {
  const testConfig = {};
  const files = ['buildings', 'prices', 'production', 'timings', 'equivalences'];
  for (const name of files) {
    const parsed = parseCSV(DEFAULT_CSV_DATA[name] || '');
    for (const category in parsed) {
      if (!testConfig[category]) {
        testConfig[category] = {};
      }
      Object.assign(testConfig[category], parsed[category]);
    }
  }
  CONFIG = testConfig;
  applyTimingsFromConfig();
}

// Ejecutar inicialización síncrona por defecto inmediatamente al cargar el script
initDefaultConfig();

// Carga asíncrona de todos los archivos CSV desde el servidor local
async function loadAllCSVs() {
  const files = ['buildings', 'prices', 'production', 'timings', 'equivalences'];
  const results = {};
  for (const name of files) {
    try {
      const res = await fetch(`src/data/${name}.csv?t=${Date.now()}`);
      if (!res.ok) throw new Error('not found');
      results[name] = parseCSV(await res.text());
    } catch (e) {
      console.warn(`No se pudo cargar ${name}.csv, usando datos por defecto:`, e);
      results[name] = parseCSV(DEFAULT_CSV_DATA[name] || '');
    }
  }
  return results;
}

// Función global unificada para inicializar o recargar la configuración del juego
async function initGameData(isManual = false) {
  try {
    const results = await loadAllCSVs();
    
    const testConfig = {};
    for (const fileKey in results) {
      const fileConfig = results[fileKey];
      for (const category in fileConfig) {
        if (!testConfig[category]) {
          testConfig[category] = {};
        }
        Object.assign(testConfig[category], fileConfig[category]);
      }
    }
    
    // Validar categorías críticas obligatorias para el arranque
    if (!testConfig.Building || !testConfig.Crop || !testConfig.Sales) {
      throw new Error("Formato de configuración inválido. Faltan categorías críticas.");
    }
    
    CONFIG = testConfig;
    applyTimingsFromConfig();
    if (typeof CROPS !== 'undefined') {
      Object.assign(CROPS, CONFIG.Crop);
    }
    
    if (typeof updateStaticTextsFromConfig === 'function') updateStaticTextsFromConfig();
    if (typeof recalculateRates === 'function') recalculateRates();
    if (typeof updateUI === 'function') updateUI();
    
    if (isManual) {
      showToast("¡Configuración recargada con éxito!", "success");
    }
  } catch (err) {
    console.error("Error al inicializar la configuración del juego:", err);
    if (isManual) {
      alert(`Error al inicializar la configuración:\n\n${err.message}`);
    }
  }
}

// Función para manejar la importación de una carpeta de archivos CSV
function importCSVFolder(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  const expectedNames = ['buildings', 'prices', 'production', 'timings', 'equivalences'];
  const pendingReads = [];
  const results = {};
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").toLowerCase();
    
    if (expectedNames.includes(nameWithoutExt) && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      const promise = new Promise((resolve) => {
        reader.onload = function(e) {
          try {
            results[nameWithoutExt] = parseCSV(e.target.result);
          } catch (err) {
            console.error(`Error al parsear el archivo importado ${file.name}:`, err);
          }
          resolve();
        };
        reader.readAsText(file, 'UTF-8');
      });
      pendingReads.push(promise);
    }
  }
  
  if (pendingReads.length === 0) {
    showToast("No se encontraron archivos CSV válidos (buildings.csv, prices.csv, production.csv, timings.csv).", "warning");
    return;
  }
  
  Promise.all(pendingReads).then(() => {
    const testConfig = {};
    // Copiar el estado actual de CONFIG por si falta algún archivo
    for (const category in CONFIG) {
      testConfig[category] = Object.assign({}, CONFIG[category]);
    }
    
    // Sobreescribir con los datos importados
    for (const fileKey in results) {
      const fileConfig = results[fileKey];
      for (const category in fileConfig) {
        if (!testConfig[category]) {
          testConfig[category] = {};
        }
        Object.assign(testConfig[category], fileConfig[category]);
      }
    }
    
    if (!testConfig.Building || !testConfig.Crop || !testConfig.Sales) {
      showToast("La importación falló: Faltan categorías críticas (Building, Crop, Sales).", "danger");
      return;
    }
    
    CONFIG = testConfig;
    applyTimingsFromConfig();
    if (typeof CROPS !== 'undefined') {
      Object.assign(CROPS, CONFIG.Crop);
    }
    
    if (typeof updateStaticTextsFromConfig === 'function') updateStaticTextsFromConfig();
    if (typeof recalculateRates === 'function') recalculateRates();
    if (typeof updateUI === 'function') updateUI();
    showToast("¡Carpeta de balance importada con éxito!", "success");
  });
}
