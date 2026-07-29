/**
 * Analyse d'un repas en photo — via l'Edge Function Supabase `scan-meal`
 * (supabase/functions/scan-meal/index.ts).
 *
 * La clé de l'API vision ne quitte JAMAIS le serveur : l'app n'embarque
 * que l'URL de la fonction et la clé anon Supabase (publique par
 * conception).
 *
 * Ordre des chemins (voir les logs [foodScan] dans la console) :
 *   1. EXPO_PUBLIC_FAKE_SCAN=1  → repas mocké. SEUL déclencheur du mock,
 *      toujours explicite — jamais par défaut, même en dev.
 *   2. URL ou clé en placeholder « REMPLACER » → échec explicite (null),
 *      le message invite à renseigner lib/config.ts.
 *   3. Sinon → appel réel de l'Edge Function, en dev comme en prod.
 *
 * Les valeurs renvoyées sont des ESTIMATIONS — l'écran doit toujours
 * laisser l'utilisateur les ajuster.
 */
import { SUPABASE_ANON_KEY, SUPABASE_FUNCTION_URL } from './config';

export type MealScanResult = {
  nom: string;
  calories: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  /** Confiance de l'estimation, entre 0 et 1. */
  confiance: number;
};

const TIMEOUT_MS = 30000;
const PLACEHOLDER_PREFIX = 'REMPLACER';

/** Repas mocké pour le mode dev sans backend. */
const MOCK_MEAL: MealScanResult = {
  nom: 'Poulet, riz et brocoli',
  calories: 620,
  proteinesG: 48,
  glucidesG: 68,
  lipidesG: 14,
  confiance: 0.62,
};

const clampNumber = (value: unknown, min: number, max: number): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(max, Math.max(min, parsed));
};

/** Validation défensive de la réponse serveur — null si inexploitable. */
function validateMeal(data: unknown): MealScanResult | null {
  if (typeof data !== 'object' || data === null) return null;
  const record = data as Record<string, unknown>;
  const nom = typeof record.nom === 'string' ? record.nom.trim() : '';
  const calories = clampNumber(record.calories, 0, 5000);
  const proteinesG = clampNumber(record.proteinesG, 0, 500);
  const glucidesG = clampNumber(record.glucidesG, 0, 1000);
  const lipidesG = clampNumber(record.lipidesG, 0, 500);
  const confiance = clampNumber(record.confiance, 0, 1);
  if (!nom || calories === null || proteinesG === null || glucidesG === null || lipidesG === null) {
    return null;
  }
  return {
    nom,
    calories: Math.round(calories),
    proteinesG: Math.round(proteinesG),
    glucidesG: Math.round(glucidesG),
    lipidesG: Math.round(lipidesG),
    confiance: confiance ?? 0.5,
  };
}

/**
 * Analyse une photo de repas (base64, sans préfixe data:) et renvoie
 * l'estimation, ou null si l'analyse échoue.
 */
export async function analyzeMeal(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' = 'image/jpeg',
): Promise<MealScanResult | null> {
  // 1) Mock UNIQUEMENT sur demande explicite — jamais par défaut en dev.
  if (process.env.EXPO_PUBLIC_FAKE_SCAN === '1') {
    console.log('[foodScan] MOCK — EXPO_PUBLIC_FAKE_SCAN=1 (préview sans backend)');
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { ...MOCK_MEAL };
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

  if (!imageBase64) {
    console.log('[foodScan] REAL refusé — image base64 vide (le picker doit fournir base64)');
    return null;
  }

  // 3) Appel réel de l'Edge Function — en dev comme en prod.
  console.log(
    `[foodScan] REAL fetch → ${SUPABASE_FUNCTION_URL} (${mediaType}, ${imageBase64.length} car. base64)`,
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
      body: JSON.stringify({ imageBase64, mediaType }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.log(`[foodScan] REAL error → HTTP ${response.status} ${body.slice(0, 200)}`);
      return null;
    }

    const meal = validateMeal(await response.json());
    if (meal) {
      console.log(`[foodScan] REAL ok → « ${meal.nom} », ${meal.calories} kcal`);
    } else {
      console.log('[foodScan] REAL error → réponse 200 mais JSON inexploitable (validateMeal)');
    }
    return meal;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.log(`[foodScan] REAL error → ${reason} (réseau coupé ou timeout 30 s)`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
