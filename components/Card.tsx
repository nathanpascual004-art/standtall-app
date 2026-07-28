import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius } from '@/lib/theme';

/** Carte de base : fond `card`, radius 14, padding 12. */
export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 12,
  },
});
