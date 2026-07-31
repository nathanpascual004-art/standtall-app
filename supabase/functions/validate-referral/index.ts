// Edge Function — validation d'un code de parrainage pour l'onboarding.
//
// Reçoit  : POST { code }
// Renvoie : { valid: true | false } — RIEN d'autre. La table affiliates
// n'est jamais exposée : le client ne peut ni lister les codes, ni lire
// le moindre champ (nom, email, payout…).
//
// Déploiement : supabase functions deploy validate-referral

import { CODE_PATTERN, CORS_HEADERS, json, restFetch } from '../_shared/referral.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  let code = '';
  try {
    const body = await req.json();
    code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  // Format invalide → même réponse qu'un code inconnu (pas d'oracle).
  if (!CODE_PATTERN.test(code)) {
    return json({ valid: false });
  }

  try {
    const response = await restFetch(
      `/affiliates?select=code&code=eq.${encodeURIComponent(code)}&status=eq.active&limit=1`,
      { method: 'GET' },
    );
    if (!response.ok) return json({ error: 'internal_error' }, 500);
    const rows = (await response.json()) as unknown[];
    return json({ valid: Array.isArray(rows) && rows.length > 0 });
  } catch {
    return json({ error: 'internal_error' }, 500);
  }
});
