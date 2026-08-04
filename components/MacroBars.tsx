import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/SectionLabel';
import { formatInt, useAppLanguage } from '@/lib/i18n';
import { color, radius, space, type } from '@/theme/tokens';

const BAR_HEIGHT = 64;
const BAR_WIDTH = 22;


type Macro = { value: number; target: number };

type MacroBarsProps = {
  proteines: Macro;
  glucides: Macro;
  lipides: Macro;
  kcal: Macro;
};

function Bar({ macro, fill, label }: { macro: Macro; fill: string; label: string }) {
  const lang = useAppLanguage();
  const ratio = macro.target > 0 ? Math.min(1, macro.value / macro.target) : 0;
  return (
    <View style={styles.barBlock}>
      <View style={styles.barTrack}>
        <View
          style={[styles.barFill, { height: ratio * BAR_HEIGHT, backgroundColor: fill }]}
        />
      </View>
      <SectionLabel style={styles.barLabel}>{label}</SectionLabel>
      <Text style={styles.barValue}>
        {formatInt(macro.value, lang)}/{formatInt(macro.target, lang)} g
      </Text>
    </View>
  );
}

/**
 * Barres macro — mini-barres verticales Protéines / Glucides / Lipides
 * (pas de camembert) + total kcal du jour.
 */
export function MacroBars({ proteines, glucides, lipides, kcal }: MacroBarsProps) {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  return (
    <View style={styles.row}>
      <View style={styles.bars}>
        <Bar macro={proteines} fill={color.macro1} label={t('nutrition.protein')} />
        <Bar macro={glucides} fill={color.macro2} label={t('nutrition.carbs')} />
        <Bar macro={lipides} fill={color.macro3} label={t('nutrition.fats')} />
      </View>
      <View style={styles.kcalBlock}>
        <Text style={styles.kcalValue}>{formatInt(kcal.value, lang)}</Text>
        <Text style={styles.kcalTarget}>/ {formatInt(kcal.target, lang)} kcal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.lg,
  },
  bars: {
    flexDirection: 'row',
    gap: space.xl,
  },
  barBlock: {
    alignItems: 'center',
    gap: space.xs,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: radius.segment,
    backgroundColor: color.railOff,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: radius.segment,
  },
  barLabel: {
    fontSize: 9,
    color: color.textMuted,
  },
  barValue: {
    ...type.meta,
    fontSize: 10.5,
    fontVariant: ['tabular-nums'],
  },
  kcalBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  kcalValue: {
    ...type.statNumberSmall,
    fontVariant: ['tabular-nums'],
  },
  kcalTarget: {
    ...type.meta,
  },
});
