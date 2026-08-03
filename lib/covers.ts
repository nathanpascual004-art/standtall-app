/**
 * Couvertures visuelles (BrandImage) — mapping central des images.
 * Un cover à null retombe sur le placeholder de marque (rien ne casse).
 */

/** Hero de la carte niveau du Parcours. */
export const HERO_PARCOURS: number | null = require('@/assets/images/hero-parcours.webp');

/** Couverture par séance (ids de lib/program.ts). */
export const SESSION_COVERS: Record<string, number | null> = {
  'redressement-base': require('@/assets/images/seance-redressement.webp'),
  'anti-tete-avant': require('@/assets/images/seance-anti-tete.webp'),
  'mobilite-complete': require('@/assets/images/seance-mobilite.webp'),
};

/** Cover d'une séance (null = placeholder de marque). */
export function sessionCover(sessionId: string): number | null {
  return SESSION_COVERS[sessionId] ?? null;
}
