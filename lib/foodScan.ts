/**
 * Scan repas — via l'Edge Function Supabase `scan-meal`.
 *
 * Nouvelle architecture : le modèle de vision IDENTIFIE (plat,
 * ingrédients, portions) et les MACROS viennent de la base
 * nutrition_foods (CIQUAL) côté serveur ; produits emballés par
 * code-barres via Open Food Facts. La clé de l'API vision ne quitte
 * JAMAIS le serveur.
 *
 * Ordre des chemins (voir les logs [foodScan] dans la console) :
 *   1. EXPO_PUBLIC_FAKE_SCAN=1  → résultat mocké. SEUL déclencheur du
 *      mock, toujours explicite — jamais par défaut, même en dev.
 *   2. URL ou clé en placeholder « REMPLACER » → échec explicite (null).
 *   3. Sinon → appel réel de l'Edge Function, en dev comme en prod.
 *
 * Les valeurs renvoyées sont des ESTIMATIONS (confiance affichée telle
 * quelle) — l'écran doit toujours laisser l'utilisateur les ajuster.
 */
import { SUPABASE_ANON_KEY, SUPABASE_FUNCTION_URL } from './config';

export type ScanItem = {
  name: string;
  grams: number;
  /** Aliment de la base ayant servi au chiffrage (null = estimation modèle). */
  matchedFood: string | null;
  matchScore: number;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  confidence: number;
};

export type ScanTotals = { kcal: number; protein: number; carb: number; fat: number };

export type MealScanResult = {
  dish: string;
  totals: ScanTotals;
  items: ScanItem[];
  /** Confiance globale honnête (0-1) — affichée telle quelle. */
  overallConfidence: number;
  source: 'photo' | 'barcode';
};

export type ScanRequest = {
  imageBase64?: string;
  mediaType?: 'image/jpeg' | 'image/png';
  /** Indication utilisateur (« poulet riz ~300 g ») — prioritaire côté vision. */
  userHint?: string;
  /** Code-barres EAN d'un produit emballé (chemin Open Food Facts). */
  barcode?: string;
};

const TIMEOUT_MS = 45000;
const PLACEHOLDER_PREFIX = 'REMPLACER';

/** Scan photo mocké (préview sans backend) — mêmes ordres de grandeur que CIQUAL. */
const MOCK_PHOTO: MealScanResult = {
  dish: 'Poulet, riz et brocoli',
  totals: { kcal: 440, protein: 42.4, carb: 53.7, fat: 4.6 },
  items: [
    { name: 'Blanc de poulet', grams: 120, matchedFood: 'Poulet, blanc, cuit', matchScore: 0.84, kcal: 176.4, protein: 35.5, carb: 0, fat: 3.8, confidence: 0.85 },
    { name: 'Riz blanc', grams: 180, matchedFood: 'Riz blanc, cuit', matchScore: 0.9, kcal: 235.8, protein: 4.8, carb: 51.1, fat: 0.5, confidence: 0.8 },
    { name: 'Brocoli', grams: 100, matchedFood: 'Brocoli, cuit', matchScore: 0.95, kcal: 28.2, protein: 2.1, carb: 2.6, fat: 0.3, confidence: 0.75 },
  ],
  overallConfidence: 0.78,
  source: 'photo',
};

/** Scan code-barres mocké. */
const MOCK_BARCODE: MealScanResult = {
  dish: 'Pâte à tartiner noisettes',
  totals: { kcal: 81, protein: 0.9, carb: 8.6, fat: 4.6 },
  items: [
    { name: 'Pâte à tartiner noisettes', grams: 15, matchedFood: 'Pâte à tartiner noisettes', matchScore: 1, kcal: 80.9, protein: 0.9, carb: 8.6, fat: 4.6, confidence: 0.9 },
  ],
  overallConfidence: 0.9,
  source: 'barcode',
};

const clampNumber = (value: unknown, min: number, max: number): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(max, Math.max(min, parsed));
};

const round1 = (v: number) => Math.round(v * 10) / 10;

/** Validation défensive d'un item serveur — null si inexploitable. */
function validateItem(data: unknown): ScanItem | null {
  if (typeof data !== 'object' || data === null) return null;
  const record = data as Record<string, unknown>;
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const grams = clampNumber(record.grams, 1, 2000);
  const kcal = clampNumber(record.kcal, 0, 5000);
  if (!name || grams === null || kcal === null) return null;
  return {
    name,
    grams: Math.round(grams),
    matchedFood: typeof record.matchedFood === 'string' ? record.matchedFood : null,
    matchScore: clampNumber(record.matchScore, 0, 1) ?? 0,
    kcal: round1(kcal),
    protein: round1(clampNumber(record.protein, 0, 500) ?? 0),
    carb: round1(clampNumber(record.carb, 0, 1000) ?? 0),
    fat: round1(clampNumber(record.fat, 0, 500) ?? 0),
    confidence: clampNumber(record.confidence, 0, 1) ?? 0.5,
  };
}

/**
 * Validation défensive de la réponse serveur. Les totaux sont recalculés
 * depuis les items (cohérence garantie côté client).
 */
export function validateScan(data: unknown): MealScanResult | null {
  if (typeof data !== 'object' || data === null) return null;
  const record = data as Record<string, unknown>;
  const dish = typeof record.dish === 'string' ? record.dish.trim() : '';
  if (!dish || !Array.isArray(record.items)) return null;

  const items = record.items
    .slice(0, 12)
    .map(validateItem)
    .filter((item): item is ScanItem => item !== null);
  if (items.length === 0) return null;

  return {
    dish,
    totals: computeScanTotals(items),
    items,
    overallConfidence: clampNumber(record.overallConfidence, 0, 1) ?? 0.5,
    source: record.source === 'barcode' ? 'barcode' : 'photo',
  };
}

/** Totaux recalculés depuis les items — utilisé aussi par l'édition UI. */
export function computeScanTotals(items: ScanItem[]): ScanTotals {
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
 * Analyse un repas (photo base64 et/ou indication texte, ou code-barres)
 * et renvoie l'estimation détaillée, ou null si l'analyse échoue.
 */
export async function analyzeMeal(request: ScanRequest): Promise<MealScanResult | null> {
  // 1) Mock UNIQUEMENT sur demande explicite — jamais par défaut en dev.
  if (process.env.EXPO_PUBLIC_FAKE_SCAN === '1') {
    console.log(
      `[foodScan] MOCK ${request.barcode ? 'code-barres' : 'photo'} — EXPO_PUBLIC_FAKE_SCAN=1`,
    );
    await new Promise((resolve) => setTimeout(resolve, 700));
    return request.barcode ? { ...MOCK_BARCODE } : { ...MOCK_PHOTO };
  }

  // 2) Backend configuré ? Sinon, échec explicite — pas de mock silencieux.
  const urlOk =
    !!SUPABASE_FUNCTION_URL && !SUPABASE_FUNCTION_URL.startsWith(PLACEHOLDER_PREFIX);
  const keyOk =
    !!SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith(PLACEHOLDER_PREFIX);
  if (!urlOk || !keyOk) {
    console.log(
      `[foodScan] NON CONFIGURÉ (url=${urlOk ? 'ok' : 'placeholder'}, clé=${
        keyOk ? 'ok' : 'placeholder'
      }) → renseigne lib/config.ts. Scan refusé.`,
    );
    return null;
  }

  if (!request.imageBase64 && !request.barcode) {
    console.log('[foodScan] REAL refusé — ni image ni code-barres fournis');
    return null;
  }

  // 3) Appel réel de l'Edge Function — en dev comme en prod.
  console.log(
    `[foodScan] REAL fetch → ${SUPABASE_FUNCTION_URL} (${
      request.barcode
        ? `code-barres ${request.barcode}`
        : `${request.mediaType ?? 'image/jpeg'}, ${request.imageBase64?.length ?? 0} car. base64`
    }${request.userHint ? ', avec aide utilisateur' : ''})`,
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        imageBase64: request.imageBase64,
        mediaType: request.mediaType ?? 'image/jpeg',
        userHint: request.userHint || undefined,
        barcode: request.barcode || undefined,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.log(`[foodScan] REAL error → HTTP ${response.status} ${body.slice(0, 200)}`);
      return null;
    }

    const scan = validateScan(await response.json());
    if (scan) {
      console.log(
        `[foodScan] REAL ok → « ${scan.dish} », ${scan.totals.kcal} kcal, ${scan.items.length} ingrédient(s), confiance ${scan.overallConfidence}`,
      );
    } else {
      console.log('[foodScan] REAL error → réponse 200 mais JSON inexploitable (validateScan)');
    }
    return scan;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.log(`[foodScan] REAL error → ${reason} (réseau coupé ou timeout 45 s)`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
