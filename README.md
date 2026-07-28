# StandTall

App mobile de posture & stature (iOS + Android) — Expo / React Native / TypeScript, design premium sombre.

## Lancer le projet

```bash
npm install
npm start          # Expo Dev Server (scanner le QR avec Expo Go)
npm run ios        # simulateur iOS (macOS)
npm run android    # émulateur Android
npm run web        # aperçu web
npm run typecheck  # vérification TypeScript
```

## Structure

```
app/                 Écrans (Expo Router)
  onboarding/        Quiz d'onboarding (14 étapes)
  (tabs)/            Dashboard : Stature, Nutrition, Programme, Profil
  paywall/           Paywall
components/          Composants réutilisables (Card, StatCard, ProgressBar,
                     ScoreGauge, QuizOption, PrimaryButton, OnboardingProgress)
lib/                 Thème, store zustand, calcul posture
assets/              Icônes & images
```

## Conventions

- Thème centralisé dans `lib/theme.ts` — aucune couleur en dur dans les écrans.
- Police système uniquement, poids 400 et 500.
- Radius : 14 (cartes), 13 (boutons).
- État du quiz dans `lib/store.ts` (zustand) — une clé de `QuizAnswers` par écran.
- Imports via l'alias `@/` (racine du projet).
