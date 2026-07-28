import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const onboardingDone = useOnboardingStore((state) => state.onboardingDone);

  useEffect(() => {
    initPurchases();
  }, []);

  // Tant que le store n'est pas rechargé depuis le disque, écran neutre :
  // évite le flash qui renverrait un utilisateur déjà onboardé vers le quiz.
  if (!hasHydrated) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentLight} />
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
          contentStyle: { backgroundColor: colors.bg },
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
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
