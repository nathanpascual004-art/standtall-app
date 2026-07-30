// Logique PURE du scan repas — aucun accès réseau ni API Deno ici.
// Testée sous Node (scripts de test) et importée par index.ts (Deno).
//
// Architecture : le modèle de vision IDENTIFIE (plat, ingrédients,
// portions) ; les MACROS viennent de la base nutrition_foods via
// match_food(). Le modèle ne chiffre qu'en dernier recours (item sans
// match), marqué basse confiance.

/** Ingrédient renvoyé par la passe vision. */
export type VisionIngredient = {
  name: string;
  canonical: string;
  grams: number;
  confidence: number;
  /** Estimations /100 g du modèle — utilisées UNIQUEMENT sans match base. */
  kcal100Est: number;
  protein100Est: number;
  carb100Est: number;
  fat100Est: number;
};

export type VisionResult = {
  dish: string;
  ingredients: VisionIngredient[];
};

/** Ligne renvoyée par la fonction SQL match_food (null = pas de match). */
export type FoodMatch = {
  name: string;
  kcal_100g: number;
  protein_100g: number;
  carb_100g: number;
  fat_100g: number;
  sim: number;
} | null;

export type ScanItem = {
  name: string;
  grams: number;
  matchedFood: string | null;
  matchScore: number;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  confidence: number;
};

export type ScanTotals = { kcal: number; protein: number; carb: number; fat: number };

export type ScanResult = {
  dish: string;
  totals: ScanTotals;
  items: ScanItem[];
  overallConfidence: number;
  source: 'photo' | 'barcode';
};

/** En dessous de cette similarité, un match base est considéré absent. */
export const MATCH_THRESHOLD = 0.3;
export const MAX_INGREDIENTS = 10;

const round1 = (v: number) => Math.round(v * 10) / 10;
const round2 = (v: number) => Math.round(v * 100) / 100;
const clamp = (v: unknown, min: number, max: number, fallback = 0): number => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

/** Même convention que public.norm_food_name (lower + sans accents). */
export function normFoodName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Parse défensif de la sortie vision : strip d'éventuelles clôtures de
 * code, extraction du premier objet JSON équilibré, clamps de toutes les
 * valeurs. null si inexploitable.
 */
export function parseVisionJson(raw: string): VisionResult | null {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) text = fenced[1].trim();
  const start = text.indexOf('{');
  if (start === -1) return null;
  // Extraction de l'objet équilibré (ignore le texte autour).
  let depth = 0;
  let end = -1;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (c === '\\') i++;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return null;

  let data: unknown;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const record = data as Record<string, unknown>;
  const dish = typeof record.dish === 'string' ? record.dish.trim() : '';
  if (!dish || !Array.isArray(record.ingredients)) return null;

  const ingredients: VisionIngredient[] = [];
  for (const entry of record.ingredients.slice(0, MAX_INGREDIENTS)) {
    if (typeof entry !== 'object' || entry === null) continue;
    const e = entry as Record<string, unknown>;
    const name = typeof e.name === 'string' ? e.name.trim() : '';
    const canonical = typeof e.canonical === 'string' ? e.canonical.trim() : name;
    // Un ingrédient sans grammes exploitables (absent, 0, négatif) est écarté.
    const gramsRaw = typeof e.grams === 'number' ? e.grams : Number(e.grams);
    if (!name || !Number.isFinite(gramsRaw) || gramsRaw <= 0) continue;
    ingredients.push({
      name,
      canonical: canonical || name,
      grams: Math.max(1, Math.round(Math.min(2000, gramsRaw))),
      confidence: clamp(e.confidence, 0, 1, 0.5),
      kcal100Est: clamp(e.kcal100Est, 0, 900),
      protein100Est: clamp(e.protein100Est, 0, 100),
      carb100Est: clamp(e.carb100Est, 0, 100),
      fat100Est: clamp(e.fat100Est, 0, 100),
    });
  }
  if (ingredients.length === 0) return null;
  return { dish, ingredients };
}

/**
 * Chiffrage déterministe d'un ingrédient : macros de la base si match
 * correct, sinon estimation du modèle marquée basse confiance.
 */
export function buildItem(ingredient: VisionIngredient, match: FoodMatch): ScanItem {
  const factor = ingredient.grams / 100;
  if (match && match.sim >= MATCH_THRESHOLD) {
    return {
      name: ingredient.name,
      grams: ingredient.grams,
      matchedFood: match.name,
      matchScore: round2(match.sim),
      kcal: round1(match.kcal_100g * factor),
      protein: round1(match.protein_100g * factor),
      carb: round1(match.carb_100g * factor),
      fat: round1(match.fat_100g * factor),
      confidence: round2(ingredient.confidence),
    };
  }
  // Pas de match base : estimation modèle, confiance abaissée (jamais gonflée).
  return {
    name: ingredient.name,
    grams: ingredient.grams,
    matchedFood: null,
    matchScore: 0,
    kcal: round1(ingredient.kcal100Est * factor),
    protein: round1(ingredient.protein100Est * factor),
    carb: round1(ingredient.carb100Est * factor),
    fat: round1(ingredient.fat100Est * factor),
    confidence: round2(Math.max(0.2, ingredient.confidence * 0.5)),
  };
}

export function computeTotals(items: ScanItem[]): ScanTotals {
  const totals = items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein: acc.protein + item.protein,
      carb: acc.carb + item.carb,
      fat: acc.fat + item.fat,
    }),
    { kcal: 0, protein: 0, carb: 0, fat: 0 },
  );
  return {
    kcal: Math.round(totals.kcal),
    protein: round1(totals.protein),
    carb: round1(totals.carb),
    fat: round1(totals.fat),
  };
}

/**
 * Confiance globale honnête : moyenne pondérée par les grammes de
 * (confiance d'identification × qualité du match base). Une portion bien
 * identifiée mais mal matchée fait BAISSER la confiance. Plafond 0.95 —
 * jamais de « 99 % ».
 */
export function overallConfidence(items: ScanItem[]): number {
  if (items.length === 0) return 0;
  let weighted = 0;
  let weight = 0;
  for (const item of items) {
    const matchQuality =
      item.matchedFood === null
        ? 0.4
        : item.matchScore >= 0.6
          ? 1
          : item.matchScore / 0.6;
    weighted += item.grams * item.confidence * matchQuality;
    weight += item.grams;
  }
  const value = weight > 0 ? weighted / weight : 0;
  return round2(Math.min(0.95, Math.max(0.05, value)));
}

/** Produit Open Food Facts (champs utiles uniquement). */
export type OffProduct = {
  product_name?: string;
  serving_quantity?: number | string;
  nutriments?: Record<string, number | string | undefined>;
};

/**
 * Chemin code-barres : macros OFF /100 g × portion. Portion = quantité
 * par portion si plausible (5–1000 g), sinon 100 g par défaut.
 */
export function offToResult(product: OffProduct, fallbackName: string): ScanResult | null {
  const n = product.nutriments ?? {};
  const per100 = {
    kcal: clamp(n['energy-kcal_100g'], 0, 900, NaN),
    protein: clamp(n['proteins_100g'], 0, 100),
    carb: clamp(n['carbohydrates_100g'], 0, 100),
    fat: clamp(n['fat_100g'], 0, 100),
  };
  if (!Number.isFinite(per100.kcal)) return null; // produit sans macros exploitables

  const serving = clamp(product.serving_quantity, 5, 1000, NaN);
  const grams = Number.isFinite(serving) ? Math.round(serving) : 100;
  const name = (product.product_name ?? '').trim() || fallbackName;
  const factor = grams / 100;

  const item: ScanItem = {
    name,
    grams,
    matchedFood: name,
    matchScore: 1,
    kcal: round1(per100.kcal * factor),
    protein: round1(per100.protein * factor),
    carb: round1(per100.carb * factor),
    fat: round1(per100.fat * factor),
    confidence: 0.9,
  };
  return {
    dish: name,
    totals: computeTotals([item]),
    items: [item],
    overallConfidence: 0.9,
    source: 'barcode',
  };
}

/**
 * Champs hérités de l'ancien schéma — transition douce pour un client
 * pas encore à jour (mêmes clés que l'ancien MealScanResult).
 */
export function legacyFields(result: ScanResult) {
  return {
    nom: result.dish,
    calories: Math.round(result.totals.kcal),
    proteinesG: Math.round(result.totals.protein),
    glucidesG: Math.round(result.totals.carb),
    lipidesG: Math.round(result.totals.fat),
    confiance: result.overallConfidence,
  };
}
