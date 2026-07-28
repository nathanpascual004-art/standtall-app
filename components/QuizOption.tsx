import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontWeight, radius } from '@/lib/theme';

type QuizOptionProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

/** Option tappable du quiz — état sélectionné : bordure accent + fond cardActive. */
export function QuizOption({ label, selected = false, onPress }: QuizOptionProps) {
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
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
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
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: fontWeight.regular,
  },
  labelSelected: {
    fontWeight: fontWeight.medium,
  },
});
