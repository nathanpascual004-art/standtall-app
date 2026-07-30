import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { borderWidth, color, radius, space, type } from '@/theme/tokens';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** primary : fond accent. secondary : surface + hairline. */
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
};

/**
 * CTA de l'app — libellé en capitales (via textTransform), scale 0.97 +
 * haptique au tap (PressableScale).
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const secondary = variant === 'secondary';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic="impact"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        pressed && !disabled && (secondary ? styles.pressedSecondary : styles.pressedPrimary),
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, secondary && styles.labelSecondary]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: color.accent,
    borderRadius: radius.button,
    paddingVertical: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: color.surface,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
  },
  pressedPrimary: {
    backgroundColor: color.accentPress,
  },
  pressedSecondary: {
    backgroundColor: color.surfaceAlt,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...type.button,
    color: color.onAccent,
  },
  labelSecondary: {
    color: color.textPrimary,
  },
});
