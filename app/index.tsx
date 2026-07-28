import { Redirect } from 'expo-router';

/** Point d'entrée : tant que l'onboarding n'est pas terminé, on démarre sur le quiz. */
export default function Index() {
  return <Redirect href="/onboarding" />;
}
