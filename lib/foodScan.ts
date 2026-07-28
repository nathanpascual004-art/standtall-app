/**
 * Analyse d'un repas en photo via l'API vision (Claude / Anthropic).
 *
 * Comme pour RevenueCat : tant que VISION_API_KEY garde son préfixe
 * « REMPLACER », le scan renvoie un repas mocké réaliste en développement
 * (ou si EXPO_PUBLIC_FAKE_SCAN=1) pour tester le funnel, et null en
 * production. Les valeurs renvoyées sont des ESTIMATIONS — l'écran doit
 * toujours laisser l'utilisateur les ajuster.
 *
 * Note prod : à terme, cet appel devrait passer par un petit backend
 * (proxy) plutôt que d'embarquer la clé API dans l'app.
 */
import { VISION_API_KEY } from './config';

export type MealScanResult = {
  nom: string;
  calories: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  /** Confiance de l'estimation, entre 0 et 1. */
  confiance: number;
};

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-5';
const TIMEOUT_MS = 30000;
const PLACEHOLDER_PREFIX = 'REMPLACER';

/** Schéma JSON imposé à l'API — la réponse est STRICTEMENT ce JSON. */
const MEAL_SCHEMA = {
  type: 'object',
  properties: {
    nom: { type: 'string', description: 'Nom court du plat, en français' },
    calories: { type: 'number', description: 'Calories totales estimées (kcal)' },
    proteinesG: { type: 'number', description: 'Protéines en grammes' },
    glucidesG: { type: 'number', description: 'Glucides en grammes' },
    lipidesG: { type: 'number', description: 'Lipides en grammes' },
    confiance: { type: 'number', description: 'Confiance de 0 à 1' },
  },
  required: ['nom', 'calories', 'proteinesG', 'glucidesG', 'lipidesG', 'confiance'],
  additionalProperties: false,
} as const;

const PROMPT =
  "Analyse la photo de ce repas. Estime le plat et ses macros pour la portion visible. " +
  'Réponds uniquement avec le JSON demandé : nom (court, en français), calories (kcal), ' +
  'proteinesG, glucidesG, lipidesG (grammes), et confiance (0 à 1 selon la lisibilité de la photo).';

/** Repas mocké pour le mode dev sans clé. */
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
  return Math.min(max, Math.max(min, Math.round(parsed * 100) / 100));
};

/** Parse défensif de la réponse — null si le JSON n'est pas exploitable. */
function parseMeal(raw: string): MealScanResult | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const nom = typeof data.nom === 'string' ? data.nom.trim() : '';
    const calories = clampNumber(data.calories, 0, 5000);
    const proteinesG = clampNumber(data.proteinesG, 0, 500);
    const glucidesG = clampNumber(data.glucidesG, 0, 1000);
    const lipidesG = clampNumber(data.lipidesG, 0, 500);
    const confiance = clampNumber(data.confiance, 0, 1);
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
  } catch {
    return null;
  }
}

/**
 * Analyse une photo de repas (base64, sans préfixe data:) et renvoie
 * l'estimation, ou null si l'analyse échoue.
 */
export async function analyzeMeal(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' = 'image/jpeg',
): Promise<MealScanResult | null> {
  if (!VISION_API_KEY || VISION_API_KEY.startsWith(PLACEHOLDER_PREFIX)) {
    // Pas de clé : repas mocké en dev / préview pour tester le funnel.
    if (__DEV__ || process.env.EXPO_PUBLIC_FAKE_SCAN === '1') {
      await new Promise((resolve) => setTimeout(resolve, 700));
      return { ...MOCK_MEAL };
    }
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': VISION_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: MEAL_SCHEMA },
        },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: imageBase64 },
              },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      stop_reason?: string;
      content?: { type: string; text?: string }[];
    };
    if (payload.stop_reason === 'refusal') return null;

    const text = payload.content?.find((block) => block.type === 'text')?.text;
    return text ? parseMeal(text) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
