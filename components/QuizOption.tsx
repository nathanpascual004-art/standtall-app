import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/lib/theme';

type QuizOptionProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** Illustration optionnelle affichée à gauche du label. */
  icon?: ReactNode;
};

/** Option tappable du quiz — état sélectionné : bordure accent + fond cardActive. */
export function QuizOption({ label, selected = false, onPress, icon }: QuizOptionProps) {
  return (
    <Pressable
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionSelected: {
    backgroundColor: colors.cardActive,
    borderColor: colors.accent,
  },
  optionPressed: {
    opacity: 0.85,
  },
  icon: {
    marginRight: 14,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  labelSelected: {
    fontFamily: fonts.bodyMedium,
  },
});
