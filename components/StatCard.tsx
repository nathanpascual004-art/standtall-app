import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { colors, fonts, radius } from '@/lib/theme';
import { Card } from './Card';

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

/** Carte statistique : label muted 11px + valeur 24px display. */
export function StatCard({ label, value, locked = false, style, ...props }: StatCardProps) {
  return (
    <Card style={[styles.card, locked && styles.cardLocked, style]} {...props}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, locked && styles.valueBlurred]}>{value}</Text>
      {locked ? (
        <View style={styles.lockOverlay} pointerEvents="none">
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={16} color={colors.text} />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 4,
  },
  cardLocked: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontFamily: fonts.display,
  },
  // Flou « réel » sans dépendance : texte transparent + ombre portée rayon 7.
  valueBlurred: {
    color: 'transparent',
    textShadowColor: 'rgba(238, 242, 247, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  // Surcouche semi-opaque (ton du fond) : le contenu sous le cadenas reste
  // illisible quelle que soit la taille d'écran.
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 13, 19, 0.45)',
    borderRadius: radius.card,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 13, 19, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
