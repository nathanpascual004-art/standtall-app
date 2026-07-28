import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initPurchases } from '@/lib/purchases';
import { useOnboardingStore } from '@/lib/store';
import { colors } from '@/lib/theme';

/**
 * Tant que l'onboarding n'est pas terminé, seul le quiz est accessible ;
 * une fois terminé, l'app bascule sur les tabs (et le quiz disparaît).
 * L'URL « / » résout vers le premier écran disponible du Stack.
 */
export default function RootLayout() {
  const onboardingDone = useOnboardingStore((state) => state.onboardingDone);

  useEffect(() => {
    initPurchases();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Protected guard={!onboardingDone}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={onboardingDone}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Screen name="paywall" />
      </Stack>
    </SafeAreaProvider>
  );
}
