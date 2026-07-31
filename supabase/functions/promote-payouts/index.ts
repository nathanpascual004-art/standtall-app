// Edge Function — job « held → payable ».
//
// Passe en 'payable' toute prime 'held', non remboursée, dont la fenêtre
// de remboursement (HOLD_DAYS, constante dans _shared/referral.ts) est
// écoulée. C'est ce délai qui garantit qu'on ne paie jamais un abo qui
// sera remboursé.
//
// À planifier (une fois par jour suffit) :
//   Dashboard Supabase → Integrations → Cron → nouvelle tâche qui
//   invoque cette fonction (voir checklist du récap), ou en SQL pg_cron.
// Appel manuel possible :
//   curl -X POST https://<projet>.supabase.co/functions/v1/promote-payouts \
//     -H "Authorization: Bearer <service_role_key>"
//
// Déploiement : supabase functions deploy promote-payouts

import { HOLD_DAYS, restFetch } from '../_shared/referral.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const response = await restFetch('/rpc/promote_payable_conversions', {
      method: 'POST',
      body: JSON.stringify({ hold_days: HOLD_DAYS }),
    });
    if (!response.ok) {
      throw new Error(`rpc HTTP ${response.status} ${await response.text()}`);
    }
    const promoted = (await response.json()) as number;
    console.log(`[promote-payouts] ${promoted} prime(s) passée(s) en payable (hold ${HOLD_DAYS} j)`);
    return new Response(JSON.stringify({ ok: true, promoted, holdDays: HOLD_DAYS }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(
      `[promote-payouts] erreur: ${error instanceof Error ? error.message : String(error)}`,
    );
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
