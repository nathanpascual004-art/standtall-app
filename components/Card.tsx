import { StyleSheet, View, type ViewProps } from 'react-native';

import { borderWidth, color, radius, space } from '@/theme/tokens';

/** Carte standard : surface, hairline `border`, rayon card. */
export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    padding: space.md,
  },
});
