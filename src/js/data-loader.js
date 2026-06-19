// DEFAULT_CSV_DATA fallbacks
const DEFAULT_CSV_DATA = {
  buildings: `Category;Type;Name;Cost_Gold;Cost_Wood;Cost_Stone;Duration;Yield_Amount;Yield_Type;Extra_Info;
Building;basic_house;Choza;0;5;3;1;1;maxPopulation;;
Building;upgraded_house;Mejorar Choza;0;40;30;2;1;maxPopulationUpgrade;;
Building;lumbermill;Cabaña de Leñador;80;0;40;5;0;;;
Building;quarry;Foso de Piedra;100;40;0;5;0;;;
Building;farm;Granja;0;30;20;5;0;;;
Building;market;Puesto de Mercado;0;60;50;5;0;;;
Building;hire_colonist;Contratar Aldeano;5;0;0;0;1;colonist;;
Building;bonfire;Fogata;0;40;20;5;0;;;
Building;pot_upgrade;Mejorar a Caldero;50;0;30;0;0;;;
Building;kitchen_upgrade;Mejorar a Cocina de Taberna;100;50;0;0;0;;;
Building;townhall;Ayuntamiento T1;0;10;5;1;0;;;
Building;townhall_t2;Mejorar Ayuntamiento T2;0;60;80;2;0;;;
Building;townhall_t3;Mejorar Ayuntamiento T3;200;120;150;3;0;;`,
  prices: `Category;Type;Name;Cost_Gold;Cost_Wood;Cost_Stone;Duration;Yield_Amount;Yield_Type;Extra_Info;
Sales;sell_food_manual;Venta Manual Comida;0;0;0;0;3;gold;Consumes:1:food;
Sales;sell_wood_manual;Venta Manual Madera;0;0;0;0;1;gold;Consumes:1:wood;
Sales;sell_stone_manual;Venta Manual Piedra;0;0;0;0;1;gold;Consumes:1:stone;
Sales;market_food;Venta Automática Comida;0;0;0;0.1;3;gold;Consumes:1:food;
Sales;market_wood;Venta Automática Madera;0;0;0;0.1;1;gold;Consumes:1:wood;
Sales;market_stone;Venta Automática Piedra;0;0;0;0.1;1;gold;Consumes:1:stone;
Sales;sell_cooked_manual;Venta Manual Cocinada;0;0;0;0;5;gold;Consumes:1:cookedFood;
Sales;market_cooked;Venta Automática Cocinada;0;0;0;0.1;4;gold;Consumes:1;cookedFood`,
  production: `Category;Type;Name;Cost_Gold;Cost_Wood;Cost_Stone;Duration;Yield_Amount;Yield_Type;Extra_Info;
BasicGathering;wood_manual;Recolección de Madera;0;0;0;0;1;wood;;
BasicGathering;stone_manual;Recolección de Piedra;0;0;0;0;1;stone;;
BasicGathering;berries_manual;Recolección de Frutos;0;0;0;0;1;food;;
BasicGathering;wood_auto;Leñador;0;0;0;1;5;wood;;
BasicGathering;stone_auto;Cantero;0;0;0;1;5;stone;;
BasicGathering;berries_auto;Recolector de Frutos;0;0;0;1;8;food;;
Crop;wheat;Trigo;5;0;0;3;30;food;;
Crop;potato;Patata;10;0;0;5;100;food;;
Crop;carrot;Zanahoria;20;0;0;10;300;food;;
Processing;bonfire_auto;Cocinar Automático Fogata;0;0;0;0.2;1;cookedFood;Consumes:1:food;
Processing;bonfire_manual;Cocinar Manual Fogata;0;0;0;0.2;1;cookedFood;Consumes:1:food;
Processing;pot_auto;Cocinar Automático Caldero;0;0;0;0.1;1;cookedFood;Consumes:1:food;
Processing;pot_manual;Cocinar Manual Caldero;0;0;0;0.1;1;cookedFood;Consumes:1:food;
Processing;kitchen_auto;Cocinar Automático Cocina de Taberna;0;0;0;0.05;1;cookedFood;Consumes:1:food;
Processing;kitchen_manual;Cocinar Manual Cocina de Taberna;0;0;0;0.05;1;cookedFood;Consumes:1:food;
ProductionRate;lumbermill_prod;Producción Cabaña de Leñador;0;0;0;1;5;wood;;
ProductionRate;quarry_prod;Producción Foso de Piedra;0;0;0;1;5;stone;;
System;day_duration;Duración del Día;0;0;0;3;0;;;
System;night_duration;Duración de la Noche;0;0;0;3;0;;`,
  timings: `Category;Type;Name;Cost_Gold;Cost_Wood;Cost_Stone;Duration;Yield_Amount;Yield_Type;Extra_Info;`
};

// Variable CONFIG global (se inicializará con fallbacks inmediatamente)
var CONFIG = {};

// Parsear un texto CSV a objeto estructurado
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const parsedConfig = {};
  
  // Auto-detectar delimitador en base a la primera línea no vacía
  let delimiter = ',';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      if (line.includes(';')) {
        delimiter = ';';
      }
      break;
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const columns = line.split(delimiter);
    if (columns.length < 9) continue;
    
    const category = columns[0];
    if (category === 'Category') continue;
    const type = columns[1];
    const name = columns[2];
    const cost_gold = parseFloat(columns[3]) || 0;
    const cost_wood = parseFloat(columns[4]) || 0;
    const cost_stone = parseFloat(columns[5]) || 0;
    const duration = parseFloat(columns[6]) || 0;
    const yield_amount = parseFloat(columns[7]) || 0;
    const yield_type = columns[8];
    
    // Recomponer extra_info si contenía delimitadores internamente
    const extra_info = columns.slice(9).join(delimiter) || '';
    
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
        consume_type: consume_type
      };
    }
  }
  return parsedConfig;
}

// Inicialización síncrona inmediata con los datos por defecto
function initDefaultConfig() {
  const testConfig = {};
  const files = ['buildings', 'prices', 'production', 'timings'];
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
}

// Ejecutar inicialización síncrona por defecto inmediatamente al cargar el script
initDefaultConfig();

// Carga asíncrona de todos los archivos CSV desde el servidor local
async function loadAllCSVs() {
  const files = ['buildings', 'prices', 'production', 'timings'];
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
  
  const expectedNames = ['buildings', 'prices', 'production', 'timings'];
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
    if (typeof CROPS !== 'undefined') {
      Object.assign(CROPS, CONFIG.Crop);
    }
    
    if (typeof updateStaticTextsFromConfig === 'function') updateStaticTextsFromConfig();
    if (typeof recalculateRates === 'function') recalculateRates();
    if (typeof updateUI === 'function') updateUI();
    showToast("¡Carpeta de balance importada con éxito!", "success");
  });
}
