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
import {
  analyzeMeal,
  computeScanTotals,
  type MealScanResult,
  type ScanItem,
} from '@/lib/foodScan';
import { useOnboardingStore, todayKey, type SavedMeal } from '@/lib/store';
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
/** Layout local : icônes d'action (journal, retrait d'ingrédient). */
const ACTION_ICON_SIZE = 18;
/** Layout local : icône étoile des chips favoris. */
const CHIP_ICON_SIZE = 13;
/** Layout local : largeur de l'input grammes (4 chiffres max). */
const GRAMS_INPUT_WIDTH = 52;
/** Nombre max de repas récents proposés dans la rangée « Réutiliser ». */
const MAX_RECENT_MEALS = 6;

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

/** Ingrédient éditable du brouillon — `base` garde l'item d'origine pour les ratios. */
type DraftItem = {
  name: string;
  grams: string;
  base: ScanItem;
};

type DraftMeal = {
  nom: string;
  items: DraftItem[];
  confiance: number;
  source: MealScanResult['source'];
};

const toInt = (raw: string) => {
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

/** Macros d'un item affiché = macros d'origine × (grammes saisis / grammes d'origine). */
const scaleDraftItem = (item: DraftItem): ScanItem => {
  const grams = toInt(item.grams);
  const ratio = item.base.grams > 0 ? grams / item.base.grams : 0;
  return {
    ...item.base,
    name: item.name,
    grams,
    kcal: item.base.kcal * ratio,
    protein: item.base.protein * ratio,
    carb: item.base.carb * ratio,
    fat: item.base.fat * ratio,
  };
};

const macroLine = (kcal: number, protein: number, carb: number, fat: number) =>
  `${Math.round(kcal)} kcal · P ${Math.round(protein)} · G ${Math.round(carb)} · L ${Math.round(fat)}`;

/** Onglet Nutrition — cibles du jour, scan de repas, journal. */
export default function NutritionScreen() {
  const router = useRouter();
  const profile = useOnboardingStore((state) => state.nutritionProfile);
  const targets = useOnboardingStore((state) => state.nutritionTargets);
  const meals = useOnboardingStore((state) => state.meals);
  const addMeal = useOnboardingStore((state) => state.addMeal);
  const removeMeal = useOnboardingStore((state) => state.removeMeal);
  const favoriteMeals = useOnboardingStore((state) => state.favoriteMeals);
  const toggleFavoriteMeal = useOnboardingStore((state) => state.toggleFavoriteMeal);

  const [scanning, setScanning] = useState(false);
  const [draft, setDraft] = useState<DraftMeal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userHint, setUserHint] = useState('');
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcode, setBarcode] = useState('');

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

  // Totaux du brouillon recalculés à CHAQUE rendu depuis les grammes saisis.
  const draftItems = draft ? draft.items.map(scaleDraftItem) : [];
  const draftTotals = computeScanTotals(draftItems);

  const favoriteNames = new Set(favoriteMeals.map((meal) => meal.nom));

  // Repas récents : toutes les clés de `meals` triées par jour décroissant,
  // distincts par nom, hors favoris, max MAX_RECENT_MEALS.
  const recentMeals: SavedMeal[] = [];
  const seenNames = new Set<string>();
  const dayKeys = Object.keys(meals).sort().reverse();
  for (const day of dayKeys) {
    if (recentMeals.length >= MAX_RECENT_MEALS) break;
    const entries = meals[day] ?? [];
    for (let i = entries.length - 1; i >= 0; i -= 1) {
      if (recentMeals.length >= MAX_RECENT_MEALS) break;
      const meal = entries[i];
      if (favoriteNames.has(meal.nom) || seenNames.has(meal.nom)) continue;
      seenNames.add(meal.nom);
      recentMeals.push({
        nom: meal.nom,
        calories: meal.calories,
        proteinesG: meal.proteinesG,
        glucidesG: meal.glucidesG,
        lipidesG: meal.lipidesG,
      });
    }
  }
  const reuseMeals = [
    ...favoriteMeals.map((meal) => ({ meal, favorite: true })),
    ...recentMeals.map((meal) => ({ meal, favorite: false })),
  ];

  const openDraft = (scan: MealScanResult) => {
    setDraft({
      nom: scan.dish,
      items: scan.items.map((item) => ({
        name: item.name,
        grams: String(item.grams),
        base: item,
      })),
      confiance: scan.overallConfidence,
      source: scan.source,
    });
  };

  const updateDraftItem = (
    index: number,
    patch: Partial<Pick<DraftItem, 'name' | 'grams'>>,
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item, i) =>
              i === index ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );
  };

  const removeDraftItem = (index: number) => {
    setDraft((current) =>
      current
        ? { ...current, items: current.items.filter((_, i) => i !== index) }
        : current,
    );
  };

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
    const scan = await analyzeMeal({
      imageBase64: base64,
      mediaType,
      userHint: userHint.trim() || undefined,
    });
    setScanning(false);

    if (!scan) {
      setError('Analyse indisponible pour le moment. Réessaie dans un instant.');
      return;
    }
    openDraft(scan);
  };

  const handleBarcodeSearch = async () => {
    const code = barcode.trim();
    if (!code || scanning) return;
    setError(null);
    setScanning(true);
    const scan = await analyzeMeal({ barcode: code });
    setScanning(false);

    if (!scan) {
      setError('Analyse indisponible pour le moment. Réessaie dans un instant.');
      return;
    }
    openDraft(scan);
  };

  const handleAddMeal = () => {
    if (!draft || !draft.nom.trim() || draft.items.length === 0) return;
    const totals = computeScanTotals(draft.items.map(scaleDraftItem));
    addMeal({
      nom: draft.nom.trim(),
      calories: Math.round(totals.kcal),
      proteinesG: Math.round(totals.protein),
      glucidesG: Math.round(totals.carb),
      lipidesG: Math.round(totals.fat),
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
          <SectionLabel style={styles.hintLabel}>Aide l'IA (optionnel)</SectionLabel>
          <TextInput
            style={[styles.hintInput, webNoOutline]}
            value={userHint}
            onChangeText={setUserHint}
            placeholder="ex. poulet riz ~300 g"
            placeholderTextColor={color.textMuted}
            selectionColor={color.accent}
            accessibilityLabel="Aide l'IA"
          />
          <PrimaryButton
            label={scanning ? 'Analyse en cours…' : 'Scanner un repas'}
            disabled={scanning}
            onPress={handleScan}
            style={styles.scanButton}
          />
          <PrimaryButton
            label="Code-barres"
            variant="secondary"
            onPress={() => setBarcodeOpen((open) => !open)}
            style={styles.barcodeToggle}
          />
          {barcodeOpen ? (
            <View style={styles.barcodeRow}>
              <TextInput
                style={[styles.barcodeInput, webNoOutline]}
                value={barcode}
                onChangeText={(text) => setBarcode(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="3017624010701"
                placeholderTextColor={color.textMuted}
                selectionColor={color.accent}
                accessibilityLabel="Code-barres EAN"
              />
              <PrimaryButton
                label="Rechercher"
                disabled={!barcode.trim() || scanning}
                onPress={handleBarcodeSearch}
                style={styles.barcodeSearch}
              />
            </View>
          ) : null}
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
                selectionColor={color.accent}
              />
              <View style={styles.itemList}>
                {draft.items.map((item, index) => {
                  const scaled = draftItems[index];
                  return (
                    <View key={`${item.base.name}-${index}`} style={styles.itemBlock}>
                      <View style={styles.itemRow}>
                        <TextInput
                          style={[styles.itemNameInput, webNoOutline]}
                          value={item.name}
                          onChangeText={(name) => updateDraftItem(index, { name })}
                        />
                        <View style={styles.gramsBox}>
                          <TextInput
                            style={[styles.gramsInput, webNoOutline]}
                            value={item.grams}
                            onChangeText={(text) =>
                              updateDraftItem(index, {
                                grams: text.replace(/[^0-9]/g, '').slice(0, 4),
                              })
                            }
                            keyboardType="number-pad"
                            accessibilityLabel={`Grammes de ${item.base.name}`}
                          />
                          <Text style={styles.gramsSuffix}>g</Text>
                        </View>
                        <PressableScale
                          onPress={() => removeDraftItem(index)}
                          accessibilityRole="button"
                          accessibilityLabel={`Retirer ${item.base.name}`}
                          hitSlop={8}
                        >
                          <Ionicons
                            name="close-outline"
                            size={ACTION_ICON_SIZE}
                            color={color.textMuted}
                          />
                        </PressableScale>
                      </View>
                      <Text style={styles.itemMacros}>
                        {macroLine(scaled.kcal, scaled.protein, scaled.carb, scaled.fat)}
                      </Text>
                      <Text style={styles.itemMatch}>
                        {item.base.matchedFood
                          ? `≈ ${item.base.matchedFood}`
                          : 'estimation modèle'}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalKcal}>{draftTotals.kcal}</Text>
                <Text style={styles.totalMacros}>
                  kcal · P {Math.round(draftTotals.protein)} · G{' '}
                  {Math.round(draftTotals.carb)} · L {Math.round(draftTotals.fat)}
                </Text>
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

        {reuseMeals.length > 0 ? (
          <Animated.View entering={cascade(2)}>
            <SectionLabel style={styles.reuseLabel}>Réutiliser</SectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.reuseScroll}
              contentContainerStyle={styles.reuseRow}
            >
              {reuseMeals.map(({ meal, favorite }) => (
                <PressableScale
                  key={meal.nom}
                  onPress={() => addMeal({ ...meal })}
                  accessibilityRole="button"
                  accessibilityLabel={`Réutiliser ${meal.nom}`}
                  style={styles.chip}
                >
                  {favorite ? (
                    <Ionicons name="star" size={CHIP_ICON_SIZE} color={color.accent} />
                  ) : null}
                  <Text style={styles.chipText}>
                    {meal.nom} · {meal.calories} kcal
                  </Text>
                </PressableScale>
              ))}
            </ScrollView>
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
                const isFavorite = favoriteNames.has(meal.nom);
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
                      onPress={() =>
                        toggleFavoriteMeal({
                          nom: meal.nom,
                          calories: meal.calories,
                          proteinesG: meal.proteinesG,
                          glucidesG: meal.glucidesG,
                          lipidesG: meal.lipidesG,
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Favori ${meal.nom}`}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={isFavorite ? 'star' : 'star-outline'}
                        size={ACTION_ICON_SIZE}
                        color={isFavorite ? color.accent : color.textMuted}
                      />
                    </PressableScale>
                    <PressableScale
                      onPress={() => removeMeal(meal.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Supprimer ${meal.nom}`}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={ACTION_ICON_SIZE}
                        color={color.textMuted}
                      />
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
  hintLabel: {
    marginTop: space.lg,
  },
  hintInput: {
    ...type.bodyMedium,
    backgroundColor: color.bg,
    borderRadius: radius.tile,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginTop: space.sm,
  },
  scanButton: {
    marginTop: space.md,
  },
  barcodeToggle: {
    marginTop: space.sm,
  },
  barcodeRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.sm,
  },
  barcodeInput: {
    ...type.bodyMedium,
    flex: 1,
    backgroundColor: color.bg,
    borderRadius: radius.tile,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontVariant: ['tabular-nums'],
  },
  barcodeSearch: {
    paddingHorizontal: space.lg,
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
  itemList: {
    gap: space.md,
  },
  itemBlock: {
    gap: space.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  itemNameInput: {
    ...type.bodyMedium,
    flex: 1,
    backgroundColor: color.bg,
    borderRadius: radius.tile,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
  },
  gramsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: color.bg,
    borderRadius: radius.tile,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.sm,
  },
  gramsInput: {
    ...type.bodyMedium,
    width: GRAMS_INPUT_WIDTH,
    paddingVertical: space.sm,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  gramsSuffix: {
    ...type.meta,
  },
  itemMacros: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  itemMatch: {
    ...type.meta,
    color: color.textMuted,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xs,
  },
  totalKcal: {
    ...type.statNumberSmall,
    fontVariant: ['tabular-nums'],
  },
  totalMacros: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  confidence: {
    ...type.meta,
  },
  reuseLabel: {
    marginTop: space.xl,
  },
  reuseScroll: {
    marginTop: space.sm,
  },
  reuseRow: {
    gap: space.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: color.surface,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  chipText: {
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
