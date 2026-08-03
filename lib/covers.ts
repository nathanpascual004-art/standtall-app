/**
 * Couvertures visuelles (BrandImage) — mapping central des images.
 *
 * ⚠️ Les 4 PNG ne sont PAS ENCORE dans le repo (assets/images/ ne
 * contient que les icônes Expo). Metro exige que les fichiers d'un
 * require() existent au build : les lignes sont donc en attente.
 * Dès que hero-parcours.png, seance-redressement.png,
 * seance-anti-tete.png et seance-mobilite.png sont poussés dans
 * assets/images/, remplacer les `null` par les require() ci-dessous.
 * Tant qu'un cover vaut null, l'écran garde le placeholder de marque.
 */

/** Hero de la carte niveau du Parcours. */
export const HERO_PARCOURS: number | null = null;
// = require('@/assets/images/hero-parcours.png');

/** Couverture par séance (ids de lib/program.ts). */
export const SESSION_COVERS: Record<string, number | null> = {
  'redressement-base': null, // require('@/assets/images/seance-redressement.png')
  'anti-tete-avant': null, // require('@/assets/images/seance-anti-tete.png')
  'mobilite-complete': null, // require('@/assets/images/seance-mobilite.png')
};

/** Cover d'une séance (null = placeholder de marque). */
export function sessionCover(sessionId: string): number | null {
  return SESSION_COVERS[sessionId] ?? null;
}
