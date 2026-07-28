import { StyleSheet, Text, type ViewProps } from 'react-native';

import { colors, fontWeight } from '@/lib/theme';
import { Card } from './Card';

type StatCardProps = ViewProps & {
  label: string;
  value: string | number;
};

/** Carte statistique : label muted 11px + valeur 24px/500. */
export function StatCard({ label, value, style, ...props }: StatCardProps) {
  return (
    <Card style={[styles.card, style]} {...props}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: fontWeight.regular,
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: fontWeight.medium,
  },
});
