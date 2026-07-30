import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { color, duration, spring } from '@/theme/tokens';

const PARTICLES = 8;

type CheckBurstProps = {
  size?: number;
};

/**
 * Check animé de fin de séance : le rond accent « pop » (spring) + burst
 * de particules. Statique si animations réduites.
 * (Équivalent Reanimated du Lottie prévu — un .json pourra le remplacer.)
 */
export function CheckBurst({ size = 72 }: CheckBurstProps) {
  const reducedMotion = useReducedMotion();
  const pop = useSharedValue(reducedMotion ? 1 : 0);
  const burst = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    pop.value = withSpring(1, spring);
    burst.value = withDelay(120, withTiming(1, { duration: duration.slow }));
  }, [reducedMotion, pop, burst]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  return (
    <View style={{ width: size * 1.8, height: size * 1.8, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: PARTICLES }, (_, index) => (
        <Particle key={index} index={index} radius={size} progress={burst} />
      ))}
      <Animated.View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
          circleStyle,
        ]}
      >
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
          <Path
            d="M4 12.5 L9.5 18 L20 6.5"
            stroke={color.onAccent}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

function Particle({
  index,
  radius,
  progress,
}: {
  index: number;
  radius: number;
  progress: SharedValue<number>;
}) {
  const angle = (index / PARTICLES) * Math.PI * 2;

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: Math.cos(angle) * progress.value * radius },
      { translateY: Math.sin(angle) * progress.value * radius },
      { scale: 1 - progress.value * 0.5 },
    ],
  }));

  return <Animated.View style={[styles.particle, style]} />;
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.accent,
  },
});
