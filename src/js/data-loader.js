// DEFAULT_CSV_DATA fallbacks
const DEFAULT_CSV_DATA = {
  buildings: `Category;Type;Name;Cost_Gold;Cost_Wood;Cost_Stone;Yield_Amount;Yield_Type;Extra_Info;
Building;basic_house;Choza;0;5;3;1;maxPopulation;;
Building;upgraded_house;Mejorar Choza;0;40;30;1;maxPopulationUpgrade;;
Building;luxury_house;Mejorar a Casa Grande;50;80;60;2;maxPopulationUpgrade;;
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
Building;granary_t3;Mejorar Granero T3;150;120;80;0;0;;;
Building;lumbermill_t2;Mejorar Aserradero T2;100;80;50;0;0;;;
Building;lumbermill_t3;Mejorar Aserradero T3;200;150;100;0;0;;;
Building;quarry_t2;Mejorar Cantera T2;120;60;80;0;0;;;
Building;quarry_t3;Mejorar Cantera T3;240;120;150;0;0;;;`,
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
Sales;buy_cooked_berries;Comprar Mermelada;15;0;0;1;cooked_berries;;
Sales;rotate_candidates;Rotación de Candidatos;15;0;0;0;;`,
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
ProductionRate;lumbermill_t1;Producción Cabaña de Leñador T1;0;0;0;5;wood;;
ProductionRate;lumbermill_t2;Producción Aserradero T2;0;0;0;10;wood;;
ProductionRate;lumbermill_t3;Producción Gremio de Leñadores T3;0;0;0;15;wood;;
ProductionRate;quarry_t1;Producción Foso de Piedra T1;0;0;0;5;stone;;
ProductionRate;quarry_t2;Producción Cantera T2;0;0;0;10;stone;;
ProductionRate;quarry_t3;Producción Gran Mina T3;0;0;0;15;stone;;
Processing;granary_wheat_t1;Producir Semillas de Trigo T1;0;0;0;1;wheat_seeds;Consumes:5:wheat
Processing;granary_wheat_t2;Producir Semillas de Trigo T2;0;0;0;1;wheat_seeds;Consumes:5:wheat
Processing;granary_wheat_t3;Producir Semillas de Trigo T3;0;0;0;2;wheat_seeds;Consumes:10:wheat
Processing;granary_potato_t1;Producir Semillas de Patata T1;0;0;0;1;potato_seeds;Consumes:5:potato
Processing;granary_potato_t2;Producir Semillas de Patata T2;0;0;0;1;potato_seeds;Consumes:5:potato
Processing;granary_potato_t3;Producir Semillas de Patata T3;0;0;0;2;potato_seeds;Consumes:10:potato
Processing;granary_carrot_t1;Producir Semillas de Zanahoria T1;0;0;0;1;carrot_seeds;Consumes:5:carrot
Processing;granary_carrot_t2;Producir Semillas de Zanahoria T2;0;0;0;1;carrot_seeds;Consumes:5:carrot
Processing;granary_carrot_t3;Producir Semillas de Zanahoria T3;0;0;0;2;carrot_seeds;Consumes:10:carrot;
EfficiencyPenalty;no_house;Penalización por Falta de Casa;0;0;0;0.40;;
EfficiencyPenalty;no_food;Penalización por Falta de Comida;0;0;0;0.45;;`,
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
Timing;lumbermill_t1;Tiempo Producción Cabaña T1;1;
Timing;lumbermill_t2;Tiempo Producción Aserradero T2;1;
Timing;lumbermill_t3;Tiempo Producción Gremio T3;1;
Timing;quarry_t1;Tiempo Producción Foso T1;1;
Timing;quarry_t2;Tiempo Producción Cantera T2;1;
Timing;quarry_t3;Tiempo Producción Gran Mina T3;1;
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
Timing;granary_carrot_t3;Tiempo Semillas Zanahoria T3;10;
Timing;candidate_rotation;Rotación Automática de Candidatos;210;
Timing;lumbermill_t2;Mejora Aserradero T2;20;
Timing;lumbermill_t3;Mejora Aserradero T3;30;
Timing;quarry_t2;Mejora Cantera T2;20;
Timing;quarry_t3;Mejora Cantera T3;30;`,
  equivalences: `Category;Type;Name;Yield_Amount
FoodEquivalence;wheat;Trigo;1
FoodEquivalence;potato;Patata;1
FoodEquivalence;carrot;Zanahoria;1
FoodEquivalence;berries;Frutos;1
FoodEquivalence;cooked_wheat;Pan;5
FoodEquivalence;cooked_potato;Patata Asada;5
FoodEquivalence;cooked_carrot;Zanahoria Asada;5
FoodEquivalence;cooked_berries;Mermelada;5
FoodNeed;colonist_need;Necesidad de Comida de Aldeano;5`,
  weights: `Category;Type;Name;Yield_Amount
AttributeWeight;1;Peso de Atributo 1;10
AttributeWeight;2;Peso de Atributo 2;20
AttributeWeight;3;Peso de Atributo 3;35
AttributeWeight;4;Peso de Atributo 4;30
AttributeWeight;5;Peso de Atributo 5;4
AttributeWeight;6;Peso de Atributo 6;1`,
  levelling: `Category;Type;Name;Yield_Amount
AttributeXP;woodcutting_t1;XP Leñador 1 a 2;10
AttributeXP;woodcutting_t2;XP Leñador 2 a 3;20
AttributeXP;woodcutting_t3;XP Leñador 3 a 4;40
AttributeXP;woodcutting_t4;XP Leñador 4 a 5;80
AttributeXP;woodcutting_t5;XP Leñador 5 a 6;160
AttributeXP;woodcutting_t6;XP Leñador 6 a 7;320
AttributeXP;woodcutting_t7;XP Leñador 7 a 8;640
AttributeXP;woodcutting_t8;XP Leñador 8 a 9;1280
AttributeXP;woodcutting_t9;XP Leñador 9 a 10;2560
AttributeXP;mining_t1;XP Cantero 1 a 2;10
AttributeXP;mining_t2;XP Cantero 2 a 3;20
AttributeXP;mining_t3;XP Cantero 3 a 4;40
AttributeXP;mining_t4;XP Cantero 4 a 5;80
AttributeXP;mining_t5;XP Cantero 5 a 6;160
AttributeXP;mining_t6;XP Cantero 6 a 7;320
AttributeXP;mining_t7;XP Cantero 7 a 8;640
AttributeXP;mining_t8;XP Cantero 8 a 9;1280
AttributeXP;mining_t9;XP Cantero 9 a 10;2560
AttributeXP;farming_t1;XP Agricultor 1 a 2;10
AttributeXP;farming_t2;XP Agricultor 2 a 3;20
AttributeXP;farming_t3;XP Agricultor 3 a 4;40
AttributeXP;farming_t4;XP Agricultor 4 a 5;80
AttributeXP;farming_t5;XP Agricultor 5 a 6;160
AttributeXP;farming_t6;XP Agricultor 6 a 7;320
AttributeXP;farming_t7;XP Agricultor 7 a 8;640
AttributeXP;farming_t8;XP Agricultor 8 a 9;1280
AttributeXP;farming_t9;XP Agricultor 9 a 10;2560
AttributeXP;cooking_t1;XP Cocinero 1 a 2;10
AttributeXP;cooking_t2;XP Cocinero 2 a 3;20
AttributeXP;cooking_t3;XP Cocinero 3 a 4;40
AttributeXP;cooking_t4;XP Cocinero 4 a 5;80
AttributeXP;cooking_t5;XP Cocinero 5 a 6;160
AttributeXP;cooking_t6;XP Cocinero 6 a 7;320
AttributeXP;cooking_t7;XP Cocinero 7 a 8;640
AttributeXP;cooking_t8;XP Cocinero 8 a 9;1280
AttributeXP;cooking_t9;XP Cocinero 9 a 10;2560
AttributeXP;trading_t1;XP Mercader 1 a 2;10
AttributeXP;trading_t2;XP Mercader 2 a 3;20
AttributeXP;trading_t3;XP Mercader 3 a 4;40
AttributeXP;trading_t4;XP Mercader 4 a 5;80
AttributeXP;trading_t5;XP Mercader 5 a 6;160
AttributeXP;trading_t6;XP Mercader 6 a 7;320
AttributeXP;trading_t7;XP Mercader 7 a 8;640
AttributeXP;trading_t8;XP Mercader 8 a 9;1280
AttributeXP;trading_t9;XP Mercader 9 a 10;2560
AttributeXP;exploration_t1;XP Explorador 1 a 2;10
AttributeXP;exploration_t2;XP Explorador 2 a 3;20
AttributeXP;exploration_t3;XP Explorador 3 a 4;40
AttributeXP;exploration_t4;XP Explorador 4 a 5;80
AttributeXP;exploration_t5;XP Explorador 5 a 6;160
AttributeXP;exploration_t6;XP Explorador 6 a 7;320
AttributeXP;exploration_t7;XP Explorador 7 a 8;640
AttributeXP;exploration_t8;XP Explorador 8 a 9;1280
AttributeXP;exploration_t9;XP Explorador 9 a 10;2560
AttributeXP;construction_t1;XP Constructor 1 a 2;10
AttributeXP;construction_t2;XP Constructor 2 a 3;20
AttributeXP;construction_t3;XP Constructor 3 a 4;40
AttributeXP;construction_t4;XP Constructor 4 a 5;80
AttributeXP;construction_t5;XP Constructor 5 a 6;160
AttributeXP;construction_t6;XP Constructor 6 a 7;320
AttributeXP;construction_t7;XP Constructor 7 a 8;640
AttributeXP;construction_t8;XP Constructor 8 a 9;1280
AttributeXP;construction_t9;XP Constructor 9 a 10;2560
AttributeXP;combat_t1;XP Combatiente 1 a 2;10
AttributeXP;combat_t2;XP Combatiente 2 a 3;20
AttributeXP;combat_t3;XP Combatiente 3 a 4;40
AttributeXP;combat_t4;XP Combatiente 4 a 5;80
AttributeXP;combat_t5;XP Combatiente 5 a 6;160
AttributeXP;combat_t6;XP Combatiente 6 a 7;320
AttributeXP;combat_t7;XP Combatiente 7 a 8;640
AttributeXP;combat_t8;XP Combatiente 8 a 9;1280
AttributeXP;combat_t9;XP Combatiente 9 a 10;2560
XPYield;wood;XP por día Leñador Manual;0.5
XPYield;lumbermill_t1;XP por día Aserradero T1;1.0
XPYield;lumbermill_t2;XP por día Aserradero T2;1.5
XPYield;lumbermill_t3;XP por día Aserradero T3;2.0
XPYield;stone;XP por día Cantero Manual;0.5
XPYield;quarry_t1;XP por día Cantera T1;1.0
XPYield;quarry_t2;XP por día Cantera T2;1.5
XPYield;quarry_t3;XP por día Cantera T3;2.0
XPYield;berries;XP por día Recolector Manual;0.8
XPYield;farm_t1;XP por día Granja T1;1.0
XPYield;farm_t2;XP por día Granja T2;1.5
XPYield;farm_t3;XP por día Granja T3;2.0
XPYield;granary_t1;XP por día Granero T1;1.0
XPYield;granary_t2;XP por día Granero T2;1.5
XPYield;granary_t3;XP por día Granero T3;2.0
XPYield;bonfire_t1;XP por día Fogata T1;1.0
XPYield;bonfire_t2;XP por día Caldero T2;1.5
XPYield;bonfire_t3;XP por día Cocina T3;2.0
XPYield;market_t1;XP por día Mercado T1;1.0
XPYield;construction;XP por día Constructor;1.2`,
  mechanics: `Category;ID;Name;Value;Notes
Colonist;attr_base;Nivel base de atributo;3;
Colonist;attr_scale;Escala de produccion por nivel;0.1;
Colonist;attr_min;Nivel minimo posible;1;
Colonist;attr_max;Nivel maximo posible;10;
Colonist;efficiency_min;Eficiencia minima de colono;0.15;
Colonist;candidates_pool;Candidatos disponibles;3;
Colonist;specialist_attr_main;Atributo principal especialista;9;
Colonist;specialist_attr_secondary;Atributos secundarios especialista;2;
Efficiency;no_house;Penalizacion sin casa;0.40;
Efficiency;no_food;Penalizacion por hambre;0.45;
Efficiency;player_build_speed;Velocidad jugador construyendo;0.25;
Efficiency;worker_build_speed;Velocidad colono construyendo;0.5;
TierMult;lumbermill_t1;Mult Aserradero T1;1.0;
TierMult;lumbermill_t2;Mult Aserradero T2;1.1;
TierMult;lumbermill_t3;Mult Aserradero T3;1.2;
TierMult;quarry_t1;Mult Cantera T1;1.0;
TierMult;quarry_t2;Mult Cantera T2;1.1;
TierMult;quarry_t3;Mult Cantera T3;1.2;
TierMult;bonfire_t1;Mult Fogata T1;1.0;
TierMult;bonfire_t2;Mult Caldero T2;1.1;
TierMult;bonfire_t3;Mult Cocina T3;1.3;
TierMult;farm_t1;Mult Granja T1;1.0;
TierMult;farm_t2;Mult Granja T2;1.5;
TierMult;farm_t3;Mult Granja T3;2.5;
Economy;demolish_refund;Reembolso al demoler;0.5;
Economy;rotation_cost_gold;Coste rotar candidatos;15;
Economy;hire_rep_base_colonists;Colonos libres de coste rep;2;
Economy;hire_rep_per_colonist;Reputacion extra por colono;5;
Economy;orders_refresh_interval;Frecuencia de renovacion de pedidos;2;
Raid;base_prob_per_day;Prob base raid por dia;0.003;
Raid;scaling_per_day;Incremento prob por dia;0.0001;
Raid;base_strength;Fuerza base raid;5;
Raid;resource_loss_pct;Recursos perdidos al fallar;0.2;
Raid;success_scaling_factor;Factor exito misiones;0.4;
Raid;max_attribute_cap;Cap maximo atributo formula exito;10;
Raid;missions_refresh_interval;Frecuencia de renovacion de misiones;30;
Tool;durability_max;Durabilidad maxima herramienta;100;
Tool;durability_loss_t1;Perdida durabilidad dia T1;1.5;
Tool;durability_loss_t2;Perdida durabilidad dia T2;0.8;
Tool;production_penalty_no_tool;Multiplicador sin herramienta;0.0;
Colonist;specialist_min;Nivel minimo especialidad;8;
Colonist;specialist_max;Nivel maximo especialidad;10;
SpecialistTitle;woodcutting;Maestro Leñador,Talabosques,Veterano Maderero;0;
SpecialistTitle;mining;Maestro Minero,Excavador Experto,Veterano de la Fosa;0;
SpecialistTitle;farming;Maestro Agricultor,Cultivador Experto,Veterano del Arado;0;
SpecialistTitle;cooking;Maestro Cocinero,Chef de la Colonia,Veterano del Fogón;0;
SpecialistTitle;trading;Maestro Mercader,Negociante Experto,Caravanero Veterano;0;
SpecialistTitle;exploration;Maestro Explorador,Rastreador Experto,Veterano del Sendero;0;
SpecialistTitle;combat;Maestro de Armas,Guerrero Experto,Veterano de Guardia;0;
SpecialistTitle;construction;Maestro Constructor,Edificador Experto,Veterano de la Obra;0;`,
  resources: `Category;ID;Name;Emoji;Food_Value;Sellable;AutoSell_Def;AutoBuy_Def;Min_Stock_Def;Max_Stock_Def
Currency;gold;Oro;🪙;0;false;false;false;0;0
Material;wood;Madera;🪵;0;true;false;false;100;100
Material;stone;Piedra;🪨;0;true;false;false;100;100
Raw;wheat;Trigo;🌾;1;true;false;false;50;50
Raw;potato;Patata;🥔;1;true;false;false;50;50
Raw;carrot;Zanahoria;🥕;1;true;false;false;50;50
Raw;berries;Frutos;🍓;2;true;false;false;20;50
Cooked;cooked_wheat;Pan;🍞;5;true;false;false;0;20
Cooked;cooked_potato;Patata Asada;🍠;5;true;false;false;0;20
Cooked;cooked_carrot;Zanahoria Asada;🥕;5;true;false;false;0;20
Cooked;cooked_berries;Mermelada;🪼;5;true;false;false;0;10
Seed;wheat_seeds;Semillas Trigo;🌱;0;true;false;false;0;10
Seed;potato_seeds;Semillas Patata;🌱;0;true;false;false;0;10
Seed;carrot_seeds;Semillas Zanahoria;🌱;0;true;false;false;0;10
Currency;reputation;Reputacion;🏆;0;false;false;false;0;0`,
  orders: `Category;ID;Name;Req_Resource;Req_Min;Req_Max;Reward_1_Type;Reward_1_Min;Reward_1_Max;Reward_2_Type;Reward_2_Min;Reward_2_Max;Reward_3_Type;Reward_3_Min;Reward_3_Max;Weight
Order;order_wood;Pedido de Madera;wood;20;100;reputation;4;12;gold;5;15;none;0;0;20
Order;order_stone;Pedido de Piedra;stone;20;100;reputation;4;12;gold;5;15;none;0;0;20
Order;order_wheat;Pedido de Trigo;wheat;20;80;reputation;2;8;gold;2;8;none;0;0;15
Order;order_potato;Pedido de Patata;potato;20;80;reputation;2;8;gold;2;8;none;0;0;15
Order;order_carrot;Pedido de Zanahoria;carrot;20;80;reputation;2;8;gold;2;8;none;0;0;15
Order;order_berries;Pedido de Bayas;berries;15;60;reputation;2;6;gold;1;5;none;0;0;15
Order;order_cooked_wheat;Pedido de Trigo Cocinado;cooked_wheat;10;30;reputation;6;16;gold;10;25;wheat_seeds;1;3;10
Order;order_cooked_potato;Pedido de Patata Cocinada;cooked_potato;10;30;reputation;6;16;gold;10;25;potato_seeds;1;3;10
Order;order_cooked_carrot;Pedido de Zanahoria Cocinada;cooked_carrot;10;30;reputation;6;16;gold;10;25;carrot_seeds;1;3;10
Order;order_wheat_seeds;Pedido de Semillas de Trigo;wheat_seeds;15;50;reputation;4;10;gold;5;15;none;0;0;5
Order;order_potato_seeds;Pedido de Semillas de Patata;potato_seeds;15;50;reputation;4;10;gold;5;15;none;0;0;5
Order;order_carrot_seeds;Pedido de Semillas de Zanahoria;carrot_seeds;15;50;reputation;4;10;gold;5;15;none;0;0;5`,
  missiondata: `Category;ID;Name;Description;Weight;MinDays;MaxDays;Difficulty;Attribute;BaseSuccessRate;RewardRep;RewardGold;RewardSeedsType;RewardSeedsAmt;RewardSpecialist;ColMin;ColMax
Mission;gather_wood;Buscar Madera;La aldea necesita madera urgentemente.;20;2;5;1;woodcutting;0.75;8;0;none;0;none;1;3
Mission;gather_stone;Extraer Piedra;Las canteras necesitan refuerzo.;20;2;5;1;mining;0.75;8;0;none;0;none;1;3
Mission;gather_food;Buscar Provisiones;Los almacenes se agotan.;20;2;5;1;farming;0.80;10;0;none;0;none;1;3
Mission;explore_ruins;Explorar Ruinas;Ruinas avistadas al norte.;12;4;8;2;exploration;0.60;15;5;none;0;none;1;2
Mission;explore_deep;Expedición Profunda;Tierras desconocidas.;5;8;14;3;exploration;0.40;30;20;none;0;none;2;4
Mission;trade_convoy;Escoltar Caravana;Una caravana necesita protección.;12;3;7;2;trading;0.65;12;20;none;0;none;2;3
Mission;gold_delivery;Entrega Especial;Un mercader paga bien.;6;4;8;2;trading;0.70;5;100;none;0;none;1;2
Mission;defend_village;Defender Aldea;Una aldea pide ayuda.;10;3;6;2;combat;0.55;20;10;none;0;none;2;4
Mission;seeds_rare;Buscar Semillas Raras;Plantas únicas en el bosque.;10;5;10;2;farming;0.60;5;0;wheat;2;none;1;3
Mission;seeds_potato;Conseguir Tubérculos;Semillas de un agricultor.;6;4;8;2;farming;0.65;5;0;potato;2;none;1;2
Mission;seeds_carrot;Rastrear Semillas;Jardín abandonado.;6;4;8;2;farming;0.65;5;0;carrot;2;none;1;2
Mission;headhunt_any;Reclutar Especialista;Localizar a un experto.;8;8;15;3;exploration;0.45;0;0;none;0;random;2;4
Mission;headhunt_miner;Reclutar Maestro Minero;Un legendario minero.;4;10;15;3;exploration;0.40;0;0;none;0;mining;2;4
Mission;headhunt_farmer;Reclutar Maestro Agricultor;Un experto en colinas.;4;10;15;3;farming;0.40;0;0;none;0;farming;2;4
Mission;headhunt_warrior;Reclutar Guerrero;Un veterano busca causa.;4;10;15;3;combat;0.40;0;0;none;0;combat;2;4`
};

// Parsear el CSV de misiones al array global GAME_MISSIONS
function parseMissions(csvText) {
  const lines = csvText.split('\n');
  if (lines.length <= 1) return [];
  
  let delimiter = ';';
  let headerLine = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#') && /[a-zA-Z0-9]/.test(line)) {
      if (line.includes(';')) delimiter = ';';
      else if (line.includes(',')) delimiter = ',';
      headerLine = line;
      break;
    }
  }
  if (!headerLine) return [];
  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase());
  
  const idxCategory = headers.indexOf('category');
  const idxId = headers.indexOf('id');
  const idxName = headers.indexOf('name');
  const idxDescription = headers.indexOf('description');
  const idxWeight = headers.indexOf('weight');
  const idxMinDays = headers.indexOf('mindays');
  const idxMaxDays = headers.indexOf('maxdays');
  const idxDifficulty = headers.indexOf('difficulty');
  const idxAttribute = headers.indexOf('attribute');
  const idxBaseSuccessRate = headers.indexOf('basesuccessrate');
  const idxRewardRep = headers.indexOf('rewardrep');
  const idxRewardGold = headers.indexOf('rewardgold');
  const idxRewardSeedsType = headers.indexOf('rewardseedstype');
  const idxRewardSeedsAmt = headers.indexOf('rewardseedsamt');
  const idxRewardSpecialist = headers.indexOf('rewardspecialist');
  const idxColMin = headers.indexOf('colmin');
  const idxColMax = headers.indexOf('colmax');

  const missions = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const cols = line.split(delimiter);
    if (cols.length < 3) continue;
    if (cols[idxCategory] === 'Category' || cols[idxCategory] === 'category') continue;
    if (cols[idxCategory].trim().toLowerCase() !== 'mission') continue;
    
    missions.push({
      id: cols[idxId] || '',
      name: cols[idxName] || '',
      description: cols[idxDescription] || '',
      weight: parseFloat(cols[idxWeight]) || 0,
      minDays: parseInt(cols[idxMinDays]) || 1,
      maxDays: parseInt(cols[idxMaxDays]) || 1,
      difficulty: parseInt(cols[idxDifficulty]) || 1,
      attribute: cols[idxAttribute] || 'exploration',
      baseSuccessRate: parseFloat(cols[idxBaseSuccessRate]) || 0.5,
      rewardRep: parseInt(cols[idxRewardRep]) || 0,
      rewardGold: parseInt(cols[idxRewardGold]) || 0,
      rewardSeedsType: cols[idxRewardSeedsType] || 'none',
      rewardSeedsAmt: parseInt(cols[idxRewardSeedsAmt]) || 0,
      rewardSpecialist: cols[idxRewardSpecialist] || 'none',
      colonistsMin: parseInt(cols[idxColMin]) || 1,
      colonistsMax: parseInt(cols[idxColMax]) || 1
    });
  }
  return missions;
}

// Variable CONFIG global (se inicializará con fallbacks inmediatamente)
var CONFIG = {};

// Parsear un texto CSV a objeto estructurado
function parseCSV(csvText, fileName = '') {
  const lines = csvText.split('\n');
  const parsedConfig = {};
  
  if (lines.length === 0) return parsedConfig;
  
  // Auto-detectar delimitador en base a la primera línea no vacía que no sea un comentario y tenga caracteres alfanuméricos
  let delimiter = ';';
  let headerLine = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#') && /[a-zA-Z0-9]/.test(line)) {
      if (line.includes(';')) {
        delimiter = ';';
      } else if (line.includes(',')) {
        delimiter = ',';
      }
      headerLine = line;
      break;
    }
  }
  
  if (!headerLine) return parsedConfig;
  
  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase());
  const idxCategory = headers.indexOf('category');
  const idxType = headers.indexOf('type') !== -1 ? headers.indexOf('type')
    : headers.indexOf('id') !== -1 ? headers.indexOf('id')
    : headers.indexOf('level');
  const idxName = headers.indexOf('name');
  const idxCostGold = headers.indexOf('cost_gold') !== -1 ? headers.indexOf('cost_gold') : headers.indexOf('gold_each');
  const idxCostWood = headers.indexOf('cost_wood');
  const idxCostStone = headers.indexOf('cost_stone');
  const idxDuration = headers.indexOf('duration');
  const idxYieldAmount = headers.indexOf('yield_amount') !== -1 ? headers.indexOf('yield_amount')
    : headers.indexOf('yield_pop') !== -1 ? headers.indexOf('yield_pop')
    : headers.indexOf('value') !== -1 ? headers.indexOf('value')
    : headers.indexOf('weight') !== -1 ? headers.indexOf('weight')
    : headers.indexOf('output_amt') !== -1 ? headers.indexOf('output_amt')
    : headers.indexOf('amount') !== -1 ? headers.indexOf('amount')
    : headers.indexOf('food_value');
  const idxYieldType = headers.indexOf('yield_type') !== -1 ? headers.indexOf('yield_type')
    : headers.indexOf('output') !== -1 ? headers.indexOf('output')
    : headers.indexOf('resource');
  const idxExtraInfo = headers.indexOf('extra_info') !== -1 ? headers.indexOf('extra_info') : headers.indexOf('notes');
  const idxInput = headers.indexOf('input');
  const idxInputAmt = headers.indexOf('input_amt');
  const idxAttr = headers.indexOf('attr');
  const emojiIdx = headers.indexOf('emoji');
  const idxEmoji = emojiIdx !== -1 ? emojiIdx : headers.indexOf('emoji');
  const idxFoodValue = headers.indexOf('food_value');
  const idxSellable = headers.indexOf('sellable');
  const idxMinStock = headers.indexOf('min_stock_def') !== -1 ? headers.indexOf('min_stock_def') : headers.indexOf('min_stock');
  const idxMaxStock = headers.indexOf('max_stock_def');
  const idxTier = headers.indexOf('tier');
  const idxReqTH = headers.indexOf('req_th');
  const idxCostIron = headers.indexOf('cost_iron');
  const idxYieldPop = headers.indexOf('yield_pop');
  const idxOutputMin = headers.indexOf('output_min');
  const idxOutputMax = headers.indexOf('output_max');
  const idxCostReputation = headers.indexOf('cost_reputation') !== -1 ? headers.indexOf('cost_reputation') : headers.indexOf('cost_rep');
  const idxReqResource = headers.indexOf('req_resource');
  const idxReqMin = headers.indexOf('req_min');
  const idxReqMax = headers.indexOf('req_max');
  const idxReward1Type = headers.indexOf('reward_1_type');
  const idxReward1Min = headers.indexOf('reward_1_min');
  const idxReward1Max = headers.indexOf('reward_1_max');
  const idxReward2Type = headers.indexOf('reward_2_type');
  const idxReward2Min = headers.indexOf('reward_2_min');
  const idxReward2Max = headers.indexOf('reward_2_max');
  const idxReward3Type = headers.indexOf('reward_3_type');
  const idxReward3Min = headers.indexOf('reward_3_min');
  const idxReward3Max = headers.indexOf('reward_3_max');
  const idxWeight = headers.indexOf('weight');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#') || !/[a-zA-Z0-9]/.test(line)) continue;
    const columns = line.split(delimiter);
    if (columns.length < 3) continue;
    
    let category = columns[idxCategory] || '';
    if (category === 'Category' || category.toLowerCase() === 'category') continue;
    
    const originalCategory = category;
    
    // Normalizar categorías basadas en el archivo CSV para mantener compatibilidad con el código JS
    const catLower = category.trim().toLowerCase();
    if (fileName === 'production') {
      if (catLower === 'gathering') category = 'BasicGathering';
      else if (catLower === 'building') category = 'ProductionRate';
    } else if (fileName === 'prices') {
      if (catLower === 'buy' || catLower === 'sell' || catLower === 'action') category = 'Sales';
    } else if (fileName === 'buildings') {
      if (catLower === 'upgrade' || catLower === 'building') category = 'Building';
    } else if (fileName === 'timings') {
      category = 'Timing';
    } else if (fileName === 'orders') {
      category = 'Order';
    }

    // Normalizaciones generales adicionales de categoría para blindaje contra cualquier tipo de letra
    const currentCatLower = category.trim().toLowerCase();
    if (currentCatLower === 'basicgathering') category = 'BasicGathering';
    else if (currentCatLower === 'productionrate') category = 'ProductionRate';
    else if (currentCatLower === 'sales') category = 'Sales';
    else if (currentCatLower === 'building') category = 'Building';
    else if (currentCatLower === 'timing') category = 'Timing';
    else if (currentCatLower === 'foodequivalence') category = 'FoodEquivalence';
    else if (currentCatLower === 'foodneed') category = 'FoodNeed';
    else if (currentCatLower === 'crop') category = 'Crop';
    else if (currentCatLower === 'processing') category = 'Processing';
    else if (currentCatLower === 'attributeweight') category = 'AttributeWeight';
    else if (currentCatLower === 'attributexp') category = 'AttributeXP';
    else if (currentCatLower === 'xpyield') category = 'XPYield';
    else if (currentCatLower === 'efficiency') category = 'Efficiency';
    else if (currentCatLower === 'efficiencypenalty') category = 'EfficiencyPenalty';
    else if (currentCatLower === 'order') category = 'Order';
    
    const type = columns[idxType] || '';
    const name = columns[idxName] || '';
    const cost_gold = idxCostGold !== -1 ? Math.abs(parseFloat(columns[idxCostGold]) || 0) : 0;
    const cost_wood = idxCostWood !== -1 ? (parseFloat(columns[idxCostWood]) || 0) : 0;
    const cost_stone = idxCostStone !== -1 ? (parseFloat(columns[idxCostStone]) || 0) : 0;
    const duration = idxDuration !== -1 ? (parseFloat(columns[idxDuration]) || 0) : 0;
    const yield_amount = idxYieldAmount !== -1 ? (parseFloat(columns[idxYieldAmount]) || 0) : 0;
    const yield_type = idxYieldType !== -1 ? (columns[idxYieldType] || '') : '';
    const cost_reputation = idxCostReputation !== -1 ? (parseFloat(columns[idxCostReputation]) || 0) : 0;
    
    // Campos para orders.csv
    const req_resource = idxReqResource !== -1 ? (columns[idxReqResource] || '').trim() : '';
    const req_min = idxReqMin !== -1 ? (parseFloat(columns[idxReqMin]) || 0) : 0;
    const req_max = idxReqMax !== -1 ? (parseFloat(columns[idxReqMax]) || 0) : 0;
    const reward_1_type = idxReward1Type !== -1 ? (columns[idxReward1Type] || '').trim() : '';
    const reward_1_min = idxReward1Min !== -1 ? (parseFloat(columns[idxReward1Min]) || 0) : 0;
    const reward_1_max = idxReward1Max !== -1 ? (parseFloat(columns[idxReward1Max]) || 0) : 0;
    const reward_2_type = idxReward2Type !== -1 ? (columns[idxReward2Type] || '').trim() : '';
    const reward_2_min = idxReward2Min !== -1 ? (parseFloat(columns[idxReward2Min]) || 0) : 0;
    const reward_2_max = idxReward2Max !== -1 ? (parseFloat(columns[idxReward2Max]) || 0) : 0;
    const reward_3_type = idxReward3Type !== -1 ? (columns[idxReward3Type] || '').trim() : '';
    const reward_3_min = idxReward3Min !== -1 ? (parseFloat(columns[idxReward3Min]) || 0) : 0;
    const reward_3_max = idxReward3Max !== -1 ? (parseFloat(columns[idxReward3Max]) || 0) : 0;
    const weight = idxWeight !== -1 ? (parseFloat(columns[idxWeight]) || 0) : 0;
    
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
    
    // Campos extra de los nuevos CSVs
    let input = idxInput !== -1 ? (columns[idxInput] || 'none') : consume_type || 'none';
    let input_amt = idxInputAmt !== -1 ? (parseFloat(columns[idxInputAmt]) || 0) : consume_amount || 0;
    const attr = idxAttr !== -1 ? (columns[idxAttr] || 'none') : 'none';
    const emoji = idxEmoji !== -1 ? (columns[idxEmoji] || '') : '';
    const food_value = idxFoodValue !== -1 ? (parseFloat(columns[idxFoodValue]) || 0) : yield_amount;
    const sellable = idxSellable !== -1 ? (columns[idxSellable] || 'false') === 'true' : false;
    const min_stock = idxMinStock !== -1 ? (parseFloat(columns[idxMinStock]) || 0) : 0;
    const max_stock = idxMaxStock !== -1 ? (parseFloat(columns[idxMaxStock]) || 0) : 0;
    const tier = idxTier !== -1 ? (parseInt(columns[idxTier]) || 1) : 1;
    const req_th = idxReqTH !== -1 ? (parseInt(columns[idxReqTH]) || 0) : 0;
    const cost_iron = idxCostIron !== -1 ? (parseFloat(columns[idxCostIron]) || 0) : 0;
    const yield_pop = idxYieldPop !== -1 ? (parseFloat(columns[idxYieldPop]) || 0) : 0;
    
    let final_yield_amount = yield_amount;
    let final_yield_type = yield_type;
    let final_consume_amount = input_amt;
    let final_consume_type = input;
    let final_cost_gold = cost_gold;
    
    // Si es prices.csv y es una venta (Sell), entonces consume el recurso y da oro
    if (fileName === 'prices' && originalCategory === 'Sell') {
      final_consume_amount = yield_amount; // Amount (e.g. 1)
      final_consume_type = yield_type;     // Resource (e.g. wood)
      final_yield_amount = cost_gold;      // Gold_Each (e.g. 1)
      final_yield_type = 'gold';
      final_cost_gold = 0;
    }

    const output_min = idxOutputMin !== -1 && columns[idxOutputMin] !== undefined && columns[idxOutputMin] !== '' ? parseFloat(columns[idxOutputMin]) : final_yield_amount;
    const output_max = idxOutputMax !== -1 && columns[idxOutputMax] !== undefined && columns[idxOutputMax] !== '' ? parseFloat(columns[idxOutputMax]) : final_yield_amount;
    
    if (category === 'Crop') {
      parsedConfig[category][type] = {
        name: name,
        cost: final_cost_gold,
        duration: duration,
        yield: final_yield_amount,
        output_min: output_min,
        output_max: output_max
      };
    } else if (category === 'Building' || category === 'Upgrade') {
      parsedConfig[category][type] = {
        name, cost_gold: final_cost_gold, cost_wood, cost_stone, cost_iron, cost_reputation,
        duration, yield_type: final_yield_type, yield_amount: final_yield_amount, yield_pop,
        tier, req_th, output_min: output_min, output_max: output_max
      };
    } else if (category === 'Order') {
      parsedConfig[category][type] = {
        name, req_resource, req_min, req_max,
        reward_1_type, reward_1_min, reward_1_max,
        reward_2_type, reward_2_min, reward_2_max,
        reward_3_type, reward_3_min, reward_3_max,
        weight
      };
    } else {
      parsedConfig[category][type] = {
        name, duration,
        yield: final_yield_amount, yield_type: final_yield_type,
        output_min: output_min, output_max: output_max,
        consume_amount: final_consume_amount, consume_type: final_consume_type,
        input: final_consume_type, input_amt: final_consume_amount, attr,
        emoji, food_value, sellable, min_stock, max_stock,
        cost_gold: final_cost_gold, cost_wood, cost_stone, cost_iron, cost_reputation,
        // 'value' alias para mechanics.csv
        value: final_yield_amount
      };
    }
  }
  return parsedConfig;
}

function applyTimingsFromConfig() {
  if (typeof CONFIG !== 'undefined') {
    if (CONFIG.Sales && CONFIG.Sales.hire_colonist && CONFIG.Building && !CONFIG.Building.hire_colonist) {
      CONFIG.Building.hire_colonist = CONFIG.Sales.hire_colonist;
    }
  }

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

    // 3. Compatibilidad para recetas de fogatas (bonfire_t1/t2/t3 -> bonfire_auto/manual, etc.)
    if (CONFIG.Processing) {
      const mappings = [
        { tier: 1, autoKey: 'bonfire_auto', manualKey: 'bonfire_manual', baseKey: 'bonfire_t1' },
        { tier: 2, autoKey: 'pot_auto', manualKey: 'pot_manual', baseKey: 'bonfire_t2' },
        { tier: 3, autoKey: 'kitchen_auto', manualKey: 'kitchen_manual', baseKey: 'bonfire_t3' }
      ];
      
      mappings.forEach(m => {
        const baseRec = CONFIG.Processing[m.baseKey];
        if (baseRec) {
          const autoTiming = CONFIG.Timing && CONFIG.Timing[`${m.baseKey}_auto`];
          const manualTiming = CONFIG.Timing && CONFIG.Timing[`${m.baseKey}_manual`];
          
          CONFIG.Processing[m.autoKey] = {
            ...baseRec,
            duration: autoTiming ? autoTiming.duration : (m.tier === 1 ? 5.0 : (m.tier === 2 ? 4.0 : 3.0))
          };
          
          CONFIG.Processing[m.manualKey] = {
            ...baseRec,
            duration: manualTiming ? manualTiming.duration : (m.tier === 1 ? 3.0 : (m.tier === 2 ? 2.0 : 1.5))
          };
        }
      });
    }
  }
}

// Inicialización síncrona inmediata con los datos por defecto
function initDefaultConfig() {
  const testConfig = {};
  const files = ['buildings', 'prices', 'production', 'timings', 'equivalences', 'weights', 'levelling', 'mechanics', 'resources', 'orders', 'missiondata'];
  for (const name of files) {
    const text = DEFAULT_CSV_DATA[name] || '';
    const parsed = parseCSV(text, name);
    if (name === 'missiondata') {
      window.GAME_MISSIONS = parseMissions(text);
    }
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
  const files = ['buildings', 'prices', 'production', 'timings', 'equivalences', 'weights', 'levelling', 'mechanics', 'resources', 'orders', 'missiondata'];
  const results = {};
  for (const name of files) {
    try {
      const res = await fetch(`src/data/${name}.csv?t=${Date.now()}`);
      if (!res.ok) throw new Error('not found');
      const text = await res.text();
      results[name] = parseCSV(text, name);
      if (name === 'missiondata') {
        window.GAME_MISSIONS = parseMissions(text);
      }
    } catch (e) {
      console.warn(`No se pudo cargar ${name}.csv, usando datos por defecto:`, e);
      const text = DEFAULT_CSV_DATA[name] || '';
      results[name] = parseCSV(text, name);
      if (name === 'missiondata') {
        window.GAME_MISSIONS = parseMissions(text);
      }
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
    if (!testConfig.Building || !testConfig.Crop) {
      throw new Error("Formato de configuración inválido. Faltan categorías críticas (Building, Crop).");
    }
    
    CONFIG = testConfig;
    applyTimingsFromConfig();
    if (typeof CROPS !== 'undefined') {
      Object.assign(CROPS, CONFIG.Crop);
    }
    if (typeof recalculateMaxPopulation === 'function') recalculateMaxPopulation();
    if (typeof initializeHousingAssignments === 'function') initializeHousingAssignments();
    
    if (typeof updateStaticTextsFromConfig === 'function') updateStaticTextsFromConfig();
    if (typeof recalculateRates === 'function') recalculateRates();
    
    // Regenerate candidates on new game to reflect CSV weights
    if (typeof state !== 'undefined' && state && (!state.colonists || state.colonists.length === 0) && (state.currentDay || 1) === 1) {
      if (typeof replenishCandidates === 'function') {
        state.candidates = [];
        replenishCandidates();
      }
    }
    
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
  
  const expectedNames = ['buildings', 'prices', 'production', 'timings', 'equivalences', 'weights', 'levelling', 'mechanics', 'resources'];
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
            results[nameWithoutExt] = parseCSV(e.target.result, nameWithoutExt);
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
    if (typeof recalculateMaxPopulation === 'function') recalculateMaxPopulation();
    if (typeof initializeHousingAssignments === 'function') initializeHousingAssignments();
    
    if (typeof updateStaticTextsFromConfig === 'function') updateStaticTextsFromConfig();
    if (typeof recalculateRates === 'function') recalculateRates();
    
    // Regenerate candidates on new game to reflect CSV weights
    if (typeof state !== 'undefined' && state && (!state.colonists || state.colonists.length === 0) && (state.currentDay || 1) === 1) {
      if (typeof replenishCandidates === 'function') {
        state.candidates = [];
        replenishCandidates();
      }
    }
    
    if (typeof updateUI === 'function') updateUI();
    showToast("¡Carpeta de balance importada con éxito!", "success");
  });
}
