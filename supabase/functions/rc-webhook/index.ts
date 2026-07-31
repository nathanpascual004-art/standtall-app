// Edge Function — webhook RevenueCat : le cœur de l'attribution.
//
// RevenueCat POste ici chaque événement d'abonnement. On attribue les
// 1ers paiements réels à l'affilié dont le code est posé en subscriber
// attribute `referral_code`, et on annule la prime si l'argent repart
// (remboursement) — voir logic.ts pour les règles exactes.
//
// Sécurité :
// - Header Authorization comparé au secret RC_WEBHOOK_SECRET (configuré
//   à l'identique côté dashboard RevenueCat). Rejet sinon.
// - Écrit en base via le service role : rien n'est exposé au client.
// - Idempotent : la contrainte unique (rc_app_user_id, event_type,
//   event_time) absorbe les renvois de RevenueCat (on conflict ignore).
//
// Déploiement :
//   supabase functions deploy rc-webhook --no-verify-jwt
//   supabase secrets set RC_WEBHOOK_SECRET=...
// (--no-verify-jwt : RevenueCat n'envoie pas de JWT Supabase ; c'est
//  notre header secret qui authentifie.)

import { BOUNTY_EUR, restFetch } from '../_shared/referral.ts';
import { buildConversionRow, decide, extractReferralCode, type RcEvent } from './logic.ts';

function reply(payload: unknown, status = 200): Response {
  // Pas de CORS ici : appelé serveur → serveur par RevenueCat uniquement.
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** L'affilié existe et est actif ? (un code inconnu n'attribue rien) */
async function affiliateIsActive(code: string): Promise<boolean> {
  const response = await restFetch(
    `/affiliates?select=code&code=eq.${encodeURIComponent(code)}&status=eq.active&limit=1`,
    { method: 'GET' },
  );
  if (!response.ok) throw new Error(`affiliates HTTP ${response.status}`);
  const rows = (await response.json()) as unknown[];
  return Array.isArray(rows) && rows.length > 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return reply({ error: 'method_not_allowed' }, 405);
  }

  // ── Authentification du webhook ──────────────────────────────────────
  const secret = Deno.env.get('RC_WEBHOOK_SECRET');
  if (!secret) {
    console.error('[rc-webhook] RC_WEBHOOK_SECRET non défini — événement rejeté');
    return reply({ error: 'webhook_secret_missing' }, 500);
  }
  if (req.headers.get('authorization') !== secret) {
    return reply({ error: 'unauthorized' }, 401);
  }

  let event: RcEvent;
  try {
    const body = (await req.json()) as { event?: RcEvent };
    if (!body.event || typeof body.event !== 'object') {
      return reply({ error: 'event_missing' }, 400);
    }
    event = body.event;
  } catch {
    return reply({ error: 'invalid_json' }, 400);
  }

  try {
    const decision = decide(event, Deno.env.get('RC_ALLOW_SANDBOX') === '1');
    if (decision.kind === 'ignore') {
      console.log(`[rc-webhook] ${event.type} ignoré — ${decision.reason}`);
      return reply({ ok: true, action: 'ignored', reason: decision.reason });
    }

    const code = extractReferralCode(event);

    if (decision.kind === 'activation') {
      // Vente non parrainée ou code fantaisiste → rien à journaliser.
      if (!code) {
        console.log(`[rc-webhook] ${event.type} sans referral_code — non parrainé`);
        return reply({ ok: true, action: 'ignored', reason: 'no_referral_code' });
      }
      if (!(await affiliateIsActive(code))) {
        console.log(`[rc-webhook] code ${code} inconnu ou en pause — non attribué`);
        return reply({ ok: true, action: 'ignored', reason: 'unknown_affiliate' });
      }
      const row = buildConversionRow(event, decision, code, BOUNTY_EUR);
      const response = await restFetch('/referral_conversions', {
        method: 'POST',
        // Idempotence : un event renvoyé par RevenueCat tombe sur la
        // contrainte unique et est simplement ignoré.
        headers: { prefer: 'resolution=ignore-duplicates' },
        body: JSON.stringify(row),
      });
      if (!response.ok) throw new Error(`insert HTTP ${response.status} ${await response.text()}`);
      console.log(
        `[rc-webhook] +${row.bounty_eur} € pour ${code} (${row.event_type}, ${row.rc_app_user_id})`,
      );
      return reply({ ok: true, action: 'activation', affiliate: code });
    }

    // ── decision.kind === 'void' : l'argent est reparti ────────────────
    // 1. La prime de cet abonné saute (held/payable → void). Une prime
    //    déjà 'paid' n'est pas réécrite : on marque juste is_refunded
    //    pour que Nate la voie dans le journal.
    const appUserId = encodeURIComponent(event.app_user_id ?? '');
    const voided = await restFetch(
      `/referral_conversions?rc_app_user_id=eq.${appUserId}&bounty_eur=gt.0&payout_status=in.(held,payable)`,
      {
        method: 'PATCH',
        headers: { prefer: 'return=representation' },
        body: JSON.stringify({ payout_status: 'void', is_refunded: true }),
      },
    );
    if (!voided.ok) throw new Error(`void HTTP ${voided.status} ${await voided.text()}`);
    const voidedRows = (await voided.json()) as { affiliate_code?: string }[];

    await restFetch(
      `/referral_conversions?rc_app_user_id=eq.${appUserId}&bounty_eur=gt.0&payout_status=eq.paid`,
      { method: 'PATCH', body: JSON.stringify({ is_refunded: true }) },
    );

    // 2. Ligne d'audit (0 €) pour tracer l'événement lui-même — le code
    //    vient des attributs, sinon de la conversion annulée.
    const auditCode = code ?? voidedRows[0]?.affiliate_code ?? null;
    if (auditCode) {
      const row = buildConversionRow(event, decision, auditCode, BOUNTY_EUR);
      await restFetch('/referral_conversions', {
        method: 'POST',
        headers: { prefer: 'resolution=ignore-duplicates' },
        body: JSON.stringify(row),
      });
    }
    console.log(
      `[rc-webhook] ${event.type} → ${voidedRows.length} prime(s) annulée(s) pour ${event.app_user_id}`,
    );
    return reply({ ok: true, action: 'void', voided: voidedRows.length });
  } catch (error) {
    // 500 → RevenueCat re-tentera l'envoi ; l'idempotence absorbe le rejeu.
    console.error(`[rc-webhook] erreur: ${error instanceof Error ? error.message : String(error)}`);
    return reply({ error: 'internal_error' }, 500);
  }
});
