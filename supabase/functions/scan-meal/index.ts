// Supabase Edge Function — scan repas fiabilisé.
//
// Le modèle de vision IDENTIFIE le plat, les ingrédients et les portions ;
// les MACROS viennent de la base nutrition_foods (CIQUAL) via match_food().
// Produits emballés : chemin code-barres → Open Food Facts (quasi exact).
//
// La clé de l'API vision ne vit QUE côté serveur (secret Supabase) :
//   supabase functions deploy scan-meal
//   supabase secrets set VISION_API_KEY=...
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY sont injectées automatiquement.)
//
// Reçoit  : POST { imageBase64?, mediaType?, userHint?, barcode? }
// Renvoie : { dish, totals, items[], overallConfidence, source }
//           + champs hérités (nom, calories, …) pour un client pas à jour.

import {
  buildItem,
  computeTotals,
  legacyFields,
  normFoodName,
  offToResult,
  overallConfidence,
  parseVisionJson,
  sniffImageMediaType,
  type FoodMatch,
  type ImageMediaType,
  type ScanResult,
} from './logic.ts';

// Renvoyés sur TOUTES les réponses (succès, erreurs, preflight) via json().
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
// Sonnet 5 : largement suffisant pour identifier plat + portions, et
// nettement moins cher qu'Opus pour un scan répété. Mêmes restrictions
// API que les modèles 5 : pas de sampling non par défaut, pas de prefill.
const MODEL = 'claude-sonnet-5';
const OFF_URL = 'https://world.openfoodfacts.org/api/v2/product';
const VISION_TIMEOUT_MS = 30000;
const OFF_TIMEOUT_MS = 10000;
const DB_TIMEOUT_MS = 8000;

/** Schéma imposé à la passe vision — identifier, PAS chiffrer les macros.
 *  Les champs *100Est ne servent que de repli si la base ne matche pas. */
const VISION_SCHEMA = {
  type: 'object',
  properties: {
    dish: { type: 'string', description: 'Nom court du plat, en français' },
    ingredients: {
      // Pas de maxItems : les contraintes de tableau ne sont pas supportées
      // par les structured outputs (400) — la limite est dans le prompt et
      // parseVisionJson tronque à MAX_INGREDIENTS de toute façon.
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Libellé lisible (ex. « Filet de poulet grillé »)' },
          canonical: {
            type: 'string',
            description:
              'Aliment générique simple pour une base nutritionnelle française (ex. « riz blanc cuit », « blanc de poulet cuit »)',
          },
          grams: { type: 'number', description: 'Portion estimée en grammes' },
          confidence: { type: 'number', description: 'Confiance 0-1 sur cet ingrédient' },
          kcal100Est: { type: 'number', description: 'Estimation kcal/100 g (repli seulement)' },
          protein100Est: { type: 'number', description: 'Estimation protéines g/100 g (repli)' },
          carb100Est: { type: 'number', description: 'Estimation glucides g/100 g (repli)' },
          fat100Est: { type: 'number', description: 'Estimation lipides g/100 g (repli)' },
        },
        required: [
          'name', 'canonical', 'grams', 'confidence',
          'kcal100Est', 'protein100Est', 'carb100Est', 'fat100Est',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['dish', 'ingredients'],
  additionalProperties: false,
};

const VISION_PROMPT = `Analyse la photo de ce repas.

Méthode :
1. Identifie le plat et chaque ingrédient visible (10 ingrédients maximum, les principaux).
2. Raisonne d'abord sur les PORTIONS en te servant de l'assiette, des couverts et des repères visibles comme échelle, PUIS estime les grammes de chaque ingrédient.
3. Pour "canonical", donne un nom d'aliment SIMPLE et GÉNÉRIQUE destiné à matcher une base nutritionnelle française (CIQUAL) : « riz blanc cuit », « blanc de poulet cuit », « brocoli cuit », « pain baguette »…
4. Donne une confiance 0-1 par ingrédient.
5. Les champs kcal100Est/protein100Est/carb100Est/fat100Est sont des estimations pour 100 g utilisées seulement en repli — remplis-les au mieux, sans les gonfler.

Réponds STRICTEMENT avec le JSON demandé, sans texte autour.

Exemple de sortie attendue :
{"dish":"Poulet rôti et haricots verts","ingredients":[{"name":"Cuisse de poulet rôtie","canonical":"cuisse de poulet cuite","grams":150,"confidence":0.85,"kcal100Est":215,"protein100Est":26,"carb100Est":0,"fat100Est":12},{"name":"Haricots verts","canonical":"haricot vert cuit","grams":120,"confidence":0.8,"kcal100Est":33,"protein100Est":1.9,"carb100Est":4.6,"fat100Est":0.4}]}`;

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Passe 2 (déterministe) : meilleure correspondance base via match_food. */
async function matchFood(canonical: string): Promise<FoodMatch> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return null; // pas de base → repli modèle
  try {
    const response = await fetchWithTimeout(
      `${supabaseUrl}/rest/v1/rpc/match_food`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          apikey: serviceKey,
          authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: normFoodName(canonical) }),
      },
      DB_TIMEOUT_MS,
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as Record<string, unknown>[];
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return null;
    // PostgREST renvoie les numeric en chaînes — conversion explicite.
    const match = {
      name: String(row.name ?? ''),
      kcal_100g: Number(row.kcal_100g),
      protein_100g: Number(row.protein_100g),
      carb_100g: Number(row.carb_100g),
      fat_100g: Number(row.fat_100g),
      sim: Number(row.sim),
    };
    return Number.isFinite(match.kcal_100g) && Number.isFinite(match.sim) ? match : null;
  } catch {
    return null;
  }
}

/** Chemin A — produit emballé via Open Food Facts. */
async function handleBarcode(barcode: string): Promise<Response> {
  if (!/^\d{6,14}$/.test(barcode)) {
    return json({ error: 'barcode_invalid' }, 400);
  }
  let payload: { status?: number; product?: Parameters<typeof offToResult>[0] };
  try {
    const response = await fetchWithTimeout(
      `${OFF_URL}/${barcode}.json?fields=product_name,serving_quantity,nutriments`,
      { headers: { 'user-agent': 'StandTall/1.0 (scan repas)' } },
      OFF_TIMEOUT_MS,
    );
    if (!response.ok && response.status !== 404) {
      return json({ error: 'off_unreachable' }, 502);
    }
    payload = await response.json();
  } catch {
    return json({ error: 'off_unreachable' }, 502);
  }

  if (payload.status !== 1 || !payload.product) {
    return json({ error: 'barcode_not_found' }, 404);
  }
  const result = offToResult(payload.product, `Produit ${barcode}`);
  if (!result) {
    return json({ error: 'barcode_no_nutriments' }, 404);
  }
  return json({ ...result, ...legacyFields(result) });
}

/** Chemin B — photo : passe vision (identification) puis chiffrage base. */
async function handlePhoto(
  apiKey: string,
  imageBase64: string,
  mediaType: ImageMediaType,
  userHint: string | null,
): Promise<Response> {
  const hintBlock = userHint
    ? `\n\nIndication de l'utilisateur (PRIORITAIRE pour l'identification et les portions) : « ${userHint.slice(0, 300)} »`
    : '';

  let response: Response;
  try {
    response = await fetchWithTimeout(
      ANTHROPIC_URL,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          // Le thinking (actif par défaut sur ce modèle) compte dans
          // max_tokens, et le tokenizer de Sonnet 5 est ~30 % plus dense :
          // marge large pour ne pas tronquer le JSON (~800 tokens utiles).
          max_tokens: 8000,
          output_config: {
            effort: 'low',
            format: { type: 'json_schema', schema: VISION_SCHEMA },
          },
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: { type: 'base64', media_type: mediaType, data: imageBase64 },
                },
                { type: 'text', text: VISION_PROMPT + hintBlock },
              ],
            },
          ],
        }),
      },
      VISION_TIMEOUT_MS,
    );
  } catch {
    return json({ error: 'vision_api_unreachable' }, 502);
  }
  if (!response.ok) {
    // Diagnostic TEMPORAIRE : logge le vrai status + corps renvoyé par
    // l'API vision (401 clé invalide, 404 modèle inconnu, 400 requête…)
    // pour qu'il apparaisse dans les logs Supabase de la fonction.
    const detail = await response.text().catch(() => '(corps illisible)');
    console.error(
      `[scan-meal] vision API HTTP ${response.status} — ${detail.slice(0, 1000)}`,
    );
    return json(
      { error: 'vision_api_error', status: response.status, detail: detail.slice(0, 500) },
      502,
    );
  }

  const payload = (await response.json()) as {
    stop_reason?: string;
    content?: { type: string; text?: string }[];
  };
  if (payload.stop_reason === 'refusal') {
    return json({ error: 'analysis_refused' }, 422);
  }
  const text = payload.content?.find((block) => block.type === 'text')?.text;
  const vision = text ? parseVisionJson(text) : null;
  if (!vision) {
    return json({ error: 'analysis_failed' }, 502);
  }

  // Passe 2 — chiffrage déterministe : une requête base par ingrédient
  // (indexée trigram, quasi gratuite), estimation modèle en repli.
  const matches = await Promise.all(
    vision.ingredients.map((ingredient) => matchFood(ingredient.canonical)),
  );
  const items = vision.ingredients.map((ingredient, index) =>
    buildItem(ingredient, matches[index]),
  );

  const result: ScanResult = {
    dish: vision.dish,
    totals: computeTotals(items),
    items,
    overallConfidence: overallConfidence(items),
    source: 'photo',
  };
  return json({ ...result, ...legacyFields(result) });
}

async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const barcode = typeof body.barcode === 'string' ? body.barcode.trim() : '';
  if (barcode) {
    return handleBarcode(barcode);
  }

  const apiKey = Deno.env.get('VISION_API_KEY');
  if (!apiKey) {
    // Secret non défini : `supabase secrets set VISION_API_KEY=...`
    return json({ error: 'vision_api_key_missing' }, 500);
  }

  const imageBase64 = body.imageBase64;
  if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
    return json({ error: 'image_or_barcode_required' }, 400);
  }
  // L'API vision refuse les images > 5 Mo (400 immédiat) : on borne AVANT
  // l'appel, avec une erreur claire côté client. 4/3 = ratio base64.
  const approxBytes = Math.floor((imageBase64.length * 3) / 4);
  if (approxBytes > 5_000_000) {
    return json({ error: 'image_too_large', maxBytes: 5_000_000, bytes: approxBytes }, 413);
  }
  // Le format DÉTECTÉ dans les octets prime sur le format déclaré : un
  // media_type qui ne correspond pas aux octets = 400 immédiat côté API.
  const declared: ImageMediaType = body.mediaType === 'image/png' ? 'image/png' : 'image/jpeg';
  const sniffed = sniffImageMediaType(imageBase64);
  if (sniffed === 'heic') {
    return json(
      { error: 'image_format_unsupported', detail: 'HEIC/HEIF non supporté — réencode en JPEG ou PNG.' },
      415,
    );
  }
  const mediaType = sniffed ?? declared;
  const userHint =
    typeof body.userHint === 'string' && body.userHint.trim() ? body.userHint.trim() : null;

  return handlePhoto(apiKey, imageBase64, mediaType, userHint);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  try {
    return await handle(req);
  } catch {
    // Filet de sécurité : même un crash inattendu répond avec les
    // headers CORS — sinon le navigateur masque l'erreur réelle.
    return json({ error: 'internal_error' }, 500);
  }
});
