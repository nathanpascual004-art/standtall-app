import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { borderWidth, color, radius, space, type } from '@/theme/tokens';

type QuizOptionProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** Illustration optionnelle affichée à gauche du label. */
  icon?: ReactNode;
};

/** Option tappable du quiz — sélection : bordure accent + fond surfaceAlt. */
export function QuizOption({ label, selected = false, onPress, icon }: QuizOptionProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
  },
  optionSelected: {
    backgroundColor: color.surfaceAlt,
    borderColor: color.accent,
  },
  optionPressed: {
    opacity: 0.9,
  },
  icon: {
    marginRight: space.md,
  },
  label: {
    flex: 1,
    ...type.bodyMedium,
    fontSize: 15,
    color: color.textPrimary,
  },
  labelSelected: {
    fontFamily: type.cardTitle.fontFamily,
  },
});
