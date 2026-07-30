import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Card } from '@/components/Card';
import { borderWidth, color, radius, space, type } from '@/theme/tokens';

type StatCardProps = ViewProps & {
  label: string;
  /**
   * Quand `locked` est actif, passe une valeur MASQUÉE (ex. « •••,• cm »),
   * jamais la vraie : rien de verrouillé ne doit exister dans le rendu.
   */
  value: string | number;
  /** Carte verrouillée : masque flouté + surcouche semi-opaque + cadenas. */
  locked?: boolean;
};

/** Carte statistique : label capitales + gros chiffre 700. */
export function StatCard({ label, value, locked = false, style, ...props }: StatCardProps) {
  return (
    <Card style={[styles.card, locked && styles.cardLocked, style]} {...props}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, locked && styles.valueBlurred]}>{value}</Text>
      {locked ? (
        <View style={styles.lockOverlay} pointerEvents="none">
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={16} color={color.textPrimary} />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.xs,
  },
  cardLocked: {
    borderWidth: borderWidth.hairline,
    borderColor: color.accent,
  },
  label: {
    ...type.sectionLabel,
    fontSize: 10,
  },
  value: {
    ...type.statNumberSmall,
    fontVariant: ['tabular-nums'],
  },
  // Flou du masque (jamais de la vraie valeur — voir prop `value`).
  valueBlurred: {
    color: 'transparent',
    textShadowColor: color.textSecond,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  // Surcouche semi-opaque : le contenu sous le cadenas reste illisible
  // quelle que soit la taille d'écran.
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.lockVeil,
    borderRadius: radius.card,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: color.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
