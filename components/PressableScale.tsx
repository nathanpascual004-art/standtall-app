import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { duration, pressScale } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PressableProps & {
  /** Retour haptique au tap (natif uniquement, jamais sur web). */
  haptic?: 'selection' | 'impact' | 'none';
};

/**
 * Pressable signature de l'app : scale 0.97 + haptique léger au tap.
 * Respecte useReducedMotion (pas de scale si animations réduites).
 */
export function PressableScale({
  haptic = 'selection',
  onPressIn,
  onPressOut,
  onPress,
  style,
  children,
  ...rest
}: PressableScaleProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  // Les styles-fonctions ({ pressed }) => … sont résolus ici : un tableau de
  // styles ne peut pas contenir de fonction (elle serait ignorée en silence).
  const [pressed, setPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const resolvedStyle =
    typeof style === 'function'
      ? style({ pressed } as Parameters<typeof style>[0])
      : style;

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(event) => {
        setPressed(true);
        if (!reducedMotion) {
          scale.value = withTiming(pressScale, { duration: duration.tap });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        scale.value = withTiming(1, { duration: duration.tap });
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (haptic !== 'none' && Platform.OS !== 'web') {
          if (haptic === 'impact') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          } else {
            Haptics.selectionAsync().catch(() => {});
          }
        }
        onPress?.(event);
      }}
      style={[resolvedStyle, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
