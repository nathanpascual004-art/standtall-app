// Paramètres business du programme d'affiliation — LE seul endroit à
// modifier pour changer la prime ou le délai de versement.

/** Prime par abonné payant activé (forfaitaire — jamais un %). */
export const BOUNTY_EUR = 3;

/**
 * Délai avant qu'une prime 'held' devienne 'payable', le temps que la
 * fenêtre de remboursement des stores passe. C'est cette attente qui
 * garantit qu'on ne paie jamais une vente remboursée.
 */
export const HOLD_DAYS = 30;

/** Format accepté pour un code affilié (déjà normalisé en MAJUSCULES). */
export const CODE_PATTERN = /^[A-Z0-9_-]{3,24}$/;

/** Headers CORS renvoyés sur TOUTES les réponses des fonctions publiques. */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}

/** Requête PostgREST avec le service role (jamais exposé au client). */
export async function restFetch(
  path: string,
  init: RequestInit,
): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants');
  }
  const headers = new Headers(init.headers);
  headers.set('apikey', serviceKey);
  headers.set('authorization', `Bearer ${serviceKey}`);
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  return await fetch(`${supabaseUrl}/rest/v1${path}`, { ...init, headers });
}
