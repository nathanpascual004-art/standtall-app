import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initPurchases } from '@/lib/purchases';
import { useOnboardingStore } from '@/lib/store';
import { color } from '@/theme/tokens';

/**
 * Tant que l'onboarding n'est pas terminé, seul le quiz est accessible ;
 * une fois terminé, l'app bascule sur les tabs (et le quiz disparaît).
 * L'URL « / » résout vers le premier écran disponible du Stack.
 */
export default function RootLayout() {
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const onboardingDone = useOnboardingStore((state) => state.onboardingDone);
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    initPurchases();
  }, []);

  // Tant que le store n'est pas rechargé depuis le disque et que les polices
  // ne sont pas prêtes, écran neutre : évite le flash qui renverrait un
  // utilisateur déjà onboardé vers le quiz. En cas d'échec de chargement des
  // polices, on affiche quand même l'app (police système en secours).
  if (!hasHydrated || (!fontsLoaded && !fontError)) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.loading}>
          <ActivityIndicator color={color.accent} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Protected guard={!onboardingDone}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={onboardingDone}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="session/[id]" />
          <Stack.Screen name="nutrition-setup" />
        </Stack.Protected>
        <Stack.Screen name="paywall" />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
