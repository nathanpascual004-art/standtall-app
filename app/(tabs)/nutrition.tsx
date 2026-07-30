import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandImage } from '@/components/BrandImage';
import { Card } from '@/components/Card';
import { MacroBars } from '@/components/MacroBars';
import { Mascot } from '@/components/Mascot';
import { PressableScale } from '@/components/PressableScale';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionLabel } from '@/components/SectionLabel';
import { analyzeMeal } from '@/lib/foodScan';
import { useOnboardingStore, todayKey } from '@/lib/store';
import {
  borderWidth,
  color,
  duration,
  radius,
  space,
  staggerDelay,
  type,
  webNoOutline,
} from '@/theme/tokens';

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const formatToday = () => {
  const now = new Date();
  return `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
};

/** Layout local (pas des tokens de design) : vignette et image du scan. */
const SCAN_IMAGE_HEIGHT = 120;
const MEAL_THUMB_SIZE = 44;
const MEAL_THUMB_RADIUS = 9;
const MASCOT_SIZE = 80;

/**
 * Heure du repas, décodée de l'id (`AAAA-MM-JJ-<timestamp base36>`) —
 * affichage uniquement, aucune donnée supplémentaire persistée.
 */
const mealTime = (id: string): string | null => {
  const stamp = Number.parseInt(id.slice(id.lastIndexOf('-') + 1), 36);
  if (!Number.isFinite(stamp)) return null;
  const date = new Date(stamp);
  if (date.getFullYear() < 2020) return null;
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/** Apparition en cascade des blocs principaux (sobre, respecte reduce motion). */
const cascade = (index: number) =>
  FadeInDown.delay(index * staggerDelay)
    .duration(duration.base)
    .reduceMotion(ReduceMotion.System);

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
          <Animated.View entering={cascade(0)}>
            <Card style={styles.introCard}>
              <View style={styles.introMascot}>
                <Mascot state="encourage" size={MASCOT_SIZE} />
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
          </Animated.View>
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

        <Animated.View entering={cascade(0)}>
          <Card style={styles.todayCard}>
            <MacroBars
              proteines={{ value: consumed.proteinesG, target: targets.proteinesG }}
              glucides={{ value: consumed.glucidesG, target: targets.glucidesG }}
              lipides={{ value: consumed.lipidesG, target: targets.lipidesG }}
              kcal={{ value: consumed.calories, target: targets.calories }}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={cascade(1)}>
          <PrimaryButton
            label={scanning ? 'Analyse en cours…' : 'Scanner un repas'}
            disabled={scanning}
            onPress={handleScan}
            style={styles.scanButton}
          />
        </Animated.View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {draft ? (
          <Animated.View
            entering={FadeInDown.duration(duration.base).reduceMotion(ReduceMotion.System)}
          >
            <Card style={styles.resultCard}>
              {/* Placeholder de marque — la photo scannée n'est pas persistée. */}
              <BrandImage
                height={SCAN_IMAGE_HEIGHT}
                icon="restaurant-outline"
                borderRadius={radius.tile}
              />
              <SectionLabel>Résultat du scan — estimation</SectionLabel>
              <TextInput
                style={[styles.nameInput, webNoOutline]}
                value={draft.nom}
                onChangeText={(nom) => setDraft({ ...draft, nom })}
                placeholder="Nom du repas"
                placeholderTextColor={color.textMuted}
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
              <PrimaryButton
                label="Annuler"
                variant="secondary"
                onPress={() => setDraft(null)}
              />
            </Card>
          </Animated.View>
        ) : null}

        <Animated.View entering={cascade(2)}>
          <SectionLabel style={styles.journalLabel}>Repas du jour</SectionLabel>
          {todayMeals.length === 0 ? (
            <Text style={styles.empty}>Aucun repas enregistré aujourd'hui.</Text>
          ) : (
            <View style={styles.mealList}>
              {todayMeals.map((meal) => {
                const time = mealTime(meal.id);
                return (
                  <Card key={meal.id} style={styles.mealCard}>
                    <BrandImage
                      height={MEAL_THUMB_SIZE}
                      icon="restaurant-outline"
                      borderRadius={MEAL_THUMB_RADIUS}
                      style={styles.mealThumb}
                    />
                    <View style={styles.flex}>
                      <Text style={styles.mealName}>{meal.nom}</Text>
                      <Text style={styles.mealMacros}>
                        {meal.calories} kcal · P {meal.proteinesG} g · G {meal.glucidesG} g ·
                        L {meal.lipidesG} g
                      </Text>
                    </View>
                    {time ? <Text style={styles.mealTimeText}>{time}</Text> : null}
                    <PressableScale
                      onPress={() => removeMeal(meal.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Supprimer ${meal.nom}`}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={color.textMuted} />
                    </PressableScale>
                  </Card>
                );
              })}
            </View>
          )}

          <Text style={styles.disclaimer}>
            Estimations basées sur l'image. Ajuste si besoin.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.screen,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  introContent: {
    paddingHorizontal: space.screen,
    paddingTop: space.md,
  },
  title: {
    ...type.screenTitle,
  },
  date: {
    ...type.meta,
    marginTop: space.xs / 2,
  },
  introCard: {
    marginTop: space.xl,
    padding: space.xl,
    gap: space.md,
  },
  introMascot: {
    alignItems: 'center',
  },
  introTitle: {
    ...type.cardTitle,
  },
  introText: {
    ...type.body,
  },
  todayCard: {
    marginTop: space.lg,
    padding: space.lg,
  },
  scanButton: {
    marginTop: space.md,
  },
  error: {
    ...type.body,
    color: color.textMuted,
    textAlign: 'center',
    marginTop: space.sm,
  },
  resultCard: {
    marginTop: space.md,
    padding: space.lg,
    gap: space.md,
  },
  nameInput: {
    ...type.cardTitle,
    backgroundColor: color.bg,
    borderRadius: radius.tile,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  field: {
    flex: 1,
    gap: space.xs,
  },
  fieldLabel: {
    ...type.meta,
  },
  fieldInput: {
    ...type.bodyMedium,
    backgroundColor: color.bg,
    borderRadius: radius.tile,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  confidence: {
    ...type.meta,
  },
  journalLabel: {
    marginTop: space.xl,
  },
  empty: {
    ...type.body,
    color: color.textMuted,
    marginTop: space.sm,
  },
  mealList: {
    marginTop: space.sm,
    gap: space.sm,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
  },
  mealThumb: {
    width: MEAL_THUMB_SIZE,
  },
  mealName: {
    ...type.bodyMedium,
  },
  mealMacros: {
    ...type.meta,
    marginTop: space.xs / 2,
    fontVariant: ['tabular-nums'],
  },
  mealTimeText: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  disclaimer: {
    ...type.meta,
    textAlign: 'center',
    marginTop: space.xl,
  },
});
