import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mascot } from '@/components/Mascot';
import { PrimaryButton } from '@/components/PrimaryButton';
import { color, duration, font, space, staggerDelay, type } from '@/theme/tokens';

const MASCOT_SIZE = 132;

const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

/** Écran 1 — splash / hook : logo, promesse honnête, COMMENCER. */
export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Animated.Text entering={cascade(0)} style={styles.logo}>
          StandTall
        </Animated.Text>
        <Animated.View entering={cascade(1)}>
          <Mascot state="neutral" size={MASCOT_SIZE} />
        </Animated.View>
        <Animated.Text entering={cascade(2)} style={styles.hook}>
          {t('onboarding.splashHook')}
        </Animated.Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label={t('common.start')}
          onPress={() => router.push('/onboarding/intention')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
    paddingHorizontal: space.screen,
    paddingTop: space.md,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxl,
  },
  logo: {
    fontFamily: font.bold,
    fontSize: 30,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: color.textPrimary,
  },
  hook: {
    ...type.question,
    textAlign: 'center',
    // La promesse reste en phrase (pas en capitales) : ton direct, honnête.
    textTransform: 'none',
    letterSpacing: 0,
  },
  footer: {
    paddingBottom: space.sm,
  },
});
