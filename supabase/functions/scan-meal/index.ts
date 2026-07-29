// Supabase Edge Function — analyse d'un repas en photo via l'API vision.
//
// La clé de l'API vision ne vit QUE côté serveur (secret Supabase),
// jamais dans le code ni dans l'app :
//   Déployer avec `supabase functions deploy scan-meal`
//   et définir le secret avec `supabase secrets set VISION_API_KEY=...`
//
// Reçoit  : POST { imageBase64: string, mediaType?: 'image/jpeg' | 'image/png' }
// Renvoie : { nom, calories, proteinesG, glucidesG, lipidesG, confiance }
//           (même schéma que lib/foodScan.ts côté app)

// Renvoyés sur TOUTES les réponses (succès, erreurs, preflight) via json().
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-5';

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
};

const PROMPT =
  "Analyse la photo de ce repas. Estime le plat et ses macros pour la portion visible. " +
  'Réponds uniquement avec le JSON demandé : nom (court, en français), calories (kcal), ' +
  'proteinesG, glucidesG, lipidesG (grammes), et confiance (0 à 1 selon la lisibilité de la photo).';

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}

function clampNumber(value: unknown, min: number, max: number): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(max, Math.max(min, parsed));
}

/** Parse défensif de la réponse du modèle — null si inexploitable. */
function parseMeal(raw: string) {
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
      confiance: Math.round((confiance ?? 0.5) * 100) / 100,
    };
  } catch {
    return null;
  }
}

async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  const apiKey = Deno.env.get('VISION_API_KEY');
  if (!apiKey) {
    // Secret non défini : `supabase secrets set VISION_API_KEY=...`
    return json({ error: 'vision_api_key_missing' }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const imageBase64 = body.imageBase64;
  if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
    return json({ error: 'image_required' }, 400);
  }
  if (imageBase64.length > 8_000_000) {
    return json({ error: 'image_too_large' }, 413);
  }
  const mediaType = body.mediaType === 'image/png' ? 'image/png' : 'image/jpeg';

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
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

    if (!response.ok) {
      return json({ error: 'vision_api_error' }, 502);
    }

    const payload = (await response.json()) as {
      stop_reason?: string;
      content?: { type: string; text?: string }[];
    };
    if (payload.stop_reason === 'refusal') {
      return json({ error: 'analysis_refused' }, 422);
    }

    const text = payload.content?.find((block) => block.type === 'text')?.text;
    const meal = text ? parseMeal(text) : null;
    if (!meal) {
      return json({ error: 'analysis_failed' }, 502);
    }
    return json(meal);
  } catch {
    return json({ error: 'vision_api_unreachable' }, 502);
  }
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
