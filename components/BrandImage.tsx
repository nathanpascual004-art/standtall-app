import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageContentPosition, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color, radius, space } from '@/theme/tokens';

type BrandImageProps = {
  /** Image réelle — placeholder surfaceAlt + icône si absente. */
  source?: ImageSource | number | null;
  /** Ratio largeur/hauteur (défaut 16/10). Ignoré si height est fourni. */
  aspectRatio?: number;
  height?: number;
  /** Icône du placeholder. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Voile sombre en bas — obligatoire quand du texte se superpose. */
  scrim?: boolean;
  /** Rayon (tuile par défaut). */
  borderRadius?: number;
  /** Ancrage du recadrage cover (défaut : centre). */
  contentPosition?: ImageContentPosition;
  /** Contenu superposé en bas (titre, méta…). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Image de marque — traitement unifié : léger voile sombre + pointe de
 * lime sur toutes les photos, scrim bas pour la lisibilité du texte.
 * Sans source : placeholder surfaceAlt + icône (rien ne casse).
 */
export function BrandImage({
  source = null,
  aspectRatio = 16 / 10,
  height,
  icon = 'image-outline',
  scrim = false,
  borderRadius = radius.tile,
  contentPosition = 'center',
  children,
  style,
}: BrandImageProps) {
  const frame = height ? { height } : { aspectRatio };

  return (
    <View style={[styles.frame, frame, { borderRadius }, style]}>
      {source ? (
        <>
          <Image
            source={source}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition={contentPosition}
          />
          {/* Grade unifié : voile sombre + teinte lime discrète. */}
          <View style={[StyleSheet.absoluteFill, styles.veil]} />
          <View style={[StyleSheet.absoluteFill, styles.lime]} />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <Ionicons name={icon} size={28} color={color.textMuted} />
        </View>
      )}
      {scrim ? (
        <LinearGradient
          colors={['transparent', color.scrim]}
          style={styles.scrim}
          pointerEvents="none"
        />
      ) : null}
      {children ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: color.surfaceAlt,
  },
  veil: {
    backgroundColor: color.photoVeil,
  },
  lime: {
    backgroundColor: color.photoLime,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: space.md,
  },
});
