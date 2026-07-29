import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { analyzeMeal } from '@/lib/foodScan';
import { useOnboardingStore, todayKey } from '@/lib/store';
import { colors, fonts, radius, spacing } from '@/lib/theme';

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const formatToday = () => {
  const now = new Date();
  return `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
};

const webNoOutline: TextStyle | null =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

const SCAN_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.5,
  base64: true,
};

type DraftMeal = {
  nom: string;
  calories: string;
  proteinesG: string;
  glucidesG: string;
  lipidesG: string;
  confiance: number;
};

const toInt = (raw: string) => {
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

function MacroRow({
  label,
  value,
  target,
  unit,
  height = 8,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  height?: number;
}) {
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          {value} / {target} {unit}
        </Text>
      </View>
      <ProgressBar progress={target > 0 ? value / target : 0} height={height} />
    </View>
  );
}

function MacroField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, webNoOutline]}
        value={value}
        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, 4))}
        keyboardType="number-pad"
      />
    </View>
  );
}

/** Onglet Nutrition — cibles du jour, scan de repas, journal. */
export default function NutritionScreen() {
  const router = useRouter();
  const profile = useOnboardingStore((state) => state.nutritionProfile);
  const targets = useOnboardingStore((state) => state.nutritionTargets);
  const meals = useOnboardingStore((state) => state.meals);
  const addMeal = useOnboardingStore((state) => state.addMeal);
  const removeMeal = useOnboardingStore((state) => state.removeMeal);

  const [scanning, setScanning] = useState(false);
  const [draft, setDraft] = useState<DraftMeal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayMeals = meals[todayKey()] ?? [];
  const consumed = todayMeals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.calories,
      proteinesG: total.proteinesG + meal.proteinesG,
      glucidesG: total.glucidesG + meal.glucidesG,
      lipidesG: total.lipidesG + meal.lipidesG,
    }),
    { calories: 0, proteinesG: 0, glucidesG: 0, lipidesG: 0 },
  );

  const handleScan = async () => {
    setError(null);
    let result: ImagePicker.ImagePickerResult | null = null;

    if (Platform.OS === 'web') {
      result = await ImagePicker.launchImageLibraryAsync(SCAN_PICKER_OPTIONS);
    } else {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.granted) {
        try {
          result = await ImagePicker.launchCameraAsync(SCAN_PICKER_OPTIONS);
        } catch {
          result = null;
        }
      }
      if (!result) {
        result = await ImagePicker.launchImageLibraryAsync(SCAN_PICKER_OPTIONS);
      }
    }

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const base64 =
      asset.base64 ??
      (asset.uri.startsWith('data:') ? asset.uri.split(',')[1] : undefined);
    if (!base64) {
      setError("Impossible de lire l'image. Réessaie.");
      return;
    }

    setScanning(true);
    const mediaType = asset.uri.includes('png') ? 'image/png' : 'image/jpeg';
    const scan = await analyzeMeal(base64, mediaType);
    setScanning(false);

    if (!scan) {
      setError('Analyse indisponible pour le moment. Réessaie dans un instant.');
      return;
    }
    setDraft({
      nom: scan.nom,
      calories: String(scan.calories),
      proteinesG: String(scan.proteinesG),
      glucidesG: String(scan.glucidesG),
      lipidesG: String(scan.lipidesG),
      confiance: scan.confiance,
    });
  };

  const handleAddMeal = () => {
    if (!draft || !draft.nom.trim()) return;
    addMeal({
      nom: draft.nom.trim(),
      calories: toInt(draft.calories),
      proteinesG: toInt(draft.proteinesG),
      glucidesG: toInt(draft.glucidesG),
      lipidesG: toInt(draft.lipidesG),
    });
    setDraft(null);
  };

  if (!profile || !targets) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.introContent}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.date}>{formatToday()}</Text>
          <Card style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons name="nutrition-outline" size={24} color={colors.accentLight} />
            </View>
            <Text style={styles.introTitle}>Configure ton suivi</Text>
            <Text style={styles.introText}>
              Quelques questions pour calculer tes besoins en calories et en
              macros, adaptés à ton objectif.
            </Text>
            <PrimaryButton
              label="Configurer"
              onPress={() => router.push('/nutrition-setup')}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.date}>{formatToday()}</Text>

        <Card style={styles.todayCard}>
          <MacroRow
            label="Calories"
            value={consumed.calories}
            target={targets.calories}
            unit="kcal"
          />
          <MacroRow
            label="Protéines"
            value={consumed.proteinesG}
            target={targets.proteinesG}
            unit="g"
          />
          <View style={styles.secondaryRow}>
            <View style={styles.flex}>
              <MacroRow
                label="Glucides"
                value={consumed.glucidesG}
                target={targets.glucidesG}
                unit="g"
                height={4}
              />
            </View>
            <View style={styles.flex}>
              <MacroRow
                label="Lipides"
                value={consumed.lipidesG}
                target={targets.lipidesG}
                unit="g"
                height={4}
              />
            </View>
          </View>
        </Card>

        <Pressable
          onPress={handleScan}
          disabled={scanning}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.scanButton,
            (pressed || scanning) && { opacity: 0.85 },
          ]}
        >
          {scanning ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons name="camera-outline" size={20} color={colors.text} />
          )}
          <Text style={styles.scanLabel}>
            {scanning ? 'Analyse en cours…' : 'Scanner un repas'}
          </Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {draft ? (
          <Card style={styles.resultCard}>
            <Text style={styles.cardLabel}>Résultat du scan — estimation</Text>
            <TextInput
              style={[styles.nameInput, webNoOutline]}
              value={draft.nom}
              onChangeText={(nom) => setDraft({ ...draft, nom })}
              placeholder="Nom du repas"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.fieldRow}>
              <MacroField
                label="kcal"
                value={draft.calories}
                onChange={(calories) => setDraft({ ...draft, calories })}
              />
              <MacroField
                label="Prot. (g)"
                value={draft.proteinesG}
                onChange={(proteinesG) => setDraft({ ...draft, proteinesG })}
              />
              <MacroField
                label="Gluc. (g)"
                value={draft.glucidesG}
                onChange={(glucidesG) => setDraft({ ...draft, glucidesG })}
              />
              <MacroField
                label="Lip. (g)"
                value={draft.lipidesG}
                onChange={(lipidesG) => setDraft({ ...draft, lipidesG })}
              />
            </View>
            <Text style={styles.confidence}>
              Confiance de l'estimation : {Math.round(draft.confiance * 100)} %
            </Text>
            <PrimaryButton label="Ajouter" onPress={handleAddMeal} />
            <Pressable
              onPress={() => setDraft(null)}
              accessibilityRole="button"
              style={styles.cancel}
            >
              <Text style={styles.cancelLabel}>Annuler</Text>
            </Pressable>
          </Card>
        ) : null}

        <Text style={styles.sectionLabel}>Repas du jour</Text>
        {todayMeals.length === 0 ? (
          <Text style={styles.empty}>Aucun repas enregistré aujourd'hui.</Text>
        ) : (
          <View style={styles.mealList}>
            {todayMeals.map((meal) => (
              <Card key={meal.id} style={styles.mealCard}>
                <View style={styles.flex}>
                  <Text style={styles.mealName}>{meal.nom}</Text>
                  <Text style={styles.mealMacros}>
                    {meal.calories} kcal · P {meal.proteinesG} g · G {meal.glucidesG} g ·
                    L {meal.lipidesG} g
                  </Text>
                </View>
                <Pressable
                  onPress={() => removeMeal(meal.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Supprimer ${meal.nom}`}
                  hitSlop={8}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </Pressable>
              </Card>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          Estimations basées sur l'image. Ajuste si besoin.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  introContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontFamily: fonts.display,
  },
  date: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  introCard: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  introIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    backgroundColor: colors.cardActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.medium,
  },
  introText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  todayCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  macroRow: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  macroValue: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    fontVariant: ['tabular-nums'],
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 16,
    marginTop: spacing.md,
  },
  scanLabel: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  error: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  resultCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
  },
  nameInput: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.medium,
    backgroundColor: colors.bg,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
  },
  fieldInput: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.medium,
    backgroundColor: colors.bg,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  confidence: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  cancelLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: spacing.xl,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body,
    marginTop: spacing.sm,
  },
  mealList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  mealName: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  mealMacros: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
