# Dette technique

Suivi des chantiers volontairement reportés — à traiter dans des passes
dédiées, pas au fil de l'eau.

## Migrer l'onglet Nutrition dans le Parcours (validé le 02/08/2026)

**Contexte.** La tab bar a 5 onglets (Accueil · Parcours · Nutrition ·
Habitudes · Profil). La cible produit est 4 onglets : le contenu de
l'onglet Nutrition (scan de repas, journal, favoris, objectifs) doit
migrer dans le toggle NUTRITION de l'écran Parcours, qui n'affiche pour
l'instant que le suivi léger des 7 derniers jours.

**Pourquoi reporté.** Déplacer le scan/journal touche la navigation, les
retours d'écran (`router.push('/(tabs)/nutrition')` un peu partout) et le
walkthrough de test — trop de risque de régression pour le faire en même
temps que la refonte Parcours. Décision : on garde 5 onglets tant que la
migration n'a pas sa passe dédiée.

**Périmètre de la passe à venir.**
- Déplacer scan, journal, favoris/récents et objectifs dans la vue
  NUTRITION du Parcours (ou un écran poussé depuis celle-ci).
- Rediriger toutes les navigations vers `/(tabs)/nutrition`.
- Supprimer l'onglet Nutrition de la tab bar (retour à 4 onglets).
- Mettre à jour le parcours de test Playwright.
