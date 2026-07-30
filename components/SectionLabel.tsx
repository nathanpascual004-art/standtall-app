import { StyleSheet, Text, type TextProps } from 'react-native';

import { type } from '@/theme/tokens';

/**
 * Label de section — 700, capitales, letter-spacing 1.2.
 * Le texte source reste en casse normale (capitales via textTransform).
 */
export function SectionLabel({ style, ...props }: TextProps) {
  return <Text style={[styles.label, style]} {...props} />;
}

const styles = StyleSheet.create({
  label: {
    ...type.sectionLabel,
  },
});
