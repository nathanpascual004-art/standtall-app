import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { CaloriesRing } from '@/components/CaloriesRing';
import { Card } from '@/components/Card';
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
import { formatWater, waterRatio } from '@/lib/hydration';
import { formatLongDate, useAppLanguage } from '@/lib/i18n';
import { GOAL_TITLES } from '@/lib/meal-ideas';
import { tipOfDay } from '@/lib/nutrition-tips';
import { useOnboardingStore, todayKey, type NutriIntent, type SavedMeal } from '@/lib/store';
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
const mealDate = (id: string): Date | null => {
  const stamp = Number.parseInt(id.slice(id.lastIndexOf('-') + 1), 36);
  if (!Number.isFinite(stamp)) return null;
  const date = new Date(stamp);
  return date.getFullYear() < 2020 ? null : date;
};

const mealTime = (id: string): string | null => {
  const date = mealDate(id);
  if (!date) return null;
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/** Créneau du repas selon l'heure — pour grouper le journal du jour. */
const mealSlot = (id: string): string => {
  const date = mealDate(id);
  if (!date) return 'Aujourd\'hui';
  const hour = date.getHours();
  if (hour < 11) return 'Petit-déj';
  if (hour < 16) return 'Déjeuner';
  return 'Dîner';
};

const MEAL_SLOTS = ['Petit-déj', 'Déjeuner', 'Dîner', 'Aujourd\'hui'];

/** Libellés localisés des créneaux (les valeurs internes restent stables). */
const SLOT_LABEL_KEYS: Record<string, string> = {
  'Petit-déj': 'nutrition.slotBreakfast',
  Déjeuner: 'nutrition.slotLunch',
  Dîner: 'nutrition.slotDinner',
  "Aujourd'hui": 'nutrition.slotToday',
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



/** Onglet Nutrition — cibles du jour, scan de repas, journal. */
export default function NutritionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const lang = useAppLanguage();

  const macroLine = (kcal: number, protein: number, carb: number, fat: number) =>
    t('nutrition.macroLine', {
      kcal: Math.round(kcal),
      p: Math.round(protein),
      c: Math.round(carb),
      f: Math.round(fat),
    });
  const profile = useOnboardingStore((state) => state.nutritionProfile);
  const targets = useOnboardingStore((state) => state.nutritionTargets);
  const meals = useOnboardingStore((state) => state.meals);
  const addMeal = useOnboardingStore((state) => state.addMeal);
  const removeMeal = useOnboardingStore((state) => state.removeMeal);
  const favoriteMeals = useOnboardingStore((state) => state.favoriteMeals);
  const toggleFavoriteMeal = useOnboardingStore((state) => state.toggleFavoriteMeal);
  const water = useOnboardingStore((state) => state.water);
  const addWater = useOnboardingStore((state) => state.addWater);
  const mealIdeaDraft = useOnboardingStore((state) => state.mealIdeaDraft);
  const setMealIdeaDraft = useOnboardingStore((state) => state.setMealIdeaDraft);

  const [scanning, setScanning] = useState(false);
  const [draft, setDraft] = useState<DraftMeal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userHint, setUserHint] = useState('');
  const [descOpen, setDescOpen] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ nom: '', kcal: '', p: '', g: '', l: '' });

  // Bonus « Idées de repas » : une idée tapée pré-remplit l'ajout manuel.
  useEffect(() => {
    if (!mealIdeaDraft) return;
    setManual({
      nom: mealIdeaDraft.nom,
      kcal: String(mealIdeaDraft.calories),
      p: String(mealIdeaDraft.proteinesG),
      g: String(mealIdeaDraft.glucidesG),
      l: String(mealIdeaDraft.lipidesG),
    });
    setManualOpen(true);
    setMealIdeaDraft(null);
  }, [mealIdeaDraft, setMealIdeaDraft]);

  const todayMeals = meals[todayKey()] ?? [];
  const glasses = water[todayKey()] ?? 0;
  const tip = tipOfDay(todayKey());
  // Objectif de contenu des idées de repas (onboarding, sinon profil).
  const answersGoal = useOnboardingStore.getState().answers.nutriGoal;
  const ideasGoal: NutriIntent =
    answersGoal ??
    (profile?.goal === 'masse' ? 'masse' : profile?.goal === 'seche' ? 'perte' : 'maintien');

  // Suivi rapide : repas vs objectif déclaré, le surplus compte en collations.
  const mealsTarget = useOnboardingStore.getState().answers.mealsPerDay ?? 3;
  const mealsCount = Math.min(todayMeals.length, mealsTarget);
  const snacksCount = Math.min(2, Math.max(0, todayMeals.length - mealsTarget));
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
      setError(t('nutrition.imageReadError'));
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
      setError(t('nutrition.scanUnavailable'));
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
      setError(t('nutrition.scanUnavailable'));
      return;
    }
    openDraft(scan);
  };

  const handleManualAdd = () => {
    const kcal = toInt(manual.kcal);
    if (!manual.nom.trim() || kcal <= 0) return;
    addMeal({
      nom: manual.nom.trim(),
      calories: kcal,
      proteinesG: toInt(manual.p),
      glucidesG: toInt(manual.g),
      lipidesG: toInt(manual.l),
    });
    setManual({ nom: '', kcal: '', p: '', g: '', l: '' });
    setManualOpen(false);
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
          <Text style={styles.title}>{t('common.tabNutrition')}</Text>
          <Text style={styles.date}>{formatLongDate(lang)}</Text>
          <Animated.View entering={cascade(0)}>
            <Card style={styles.introCard}>
              <View style={styles.introMascot}>
                <Mascot state="encourage" size={MASCOT_SIZE} />
              </View>
              <Text style={styles.introTitle}>{t('nutrition.introTitle')}</Text>
              <Text style={styles.introText}>{t('nutrition.introText')}</Text>
              <PrimaryButton
                label={t('nutrition.introCta')}
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('common.tabNutrition')}</Text>
          <PressableScale
            onPress={() => router.push('/(tabs)/profil')}
            accessibilityRole="button"
            accessibilityLabel={t('program.settingsA11y')}
            hitSlop={8}
            style={styles.iconButton}
          >
            <Ionicons name="options-outline" size={20} color={color.textMuted} />
          </PressableScale>
        </View>
        <Text style={styles.date}>{formatLongDate(lang)}</Text>

        {/* Aperçu du jour : anneau calories restantes + macros — vraies données. */}
        <Animated.View entering={cascade(0)}>
          <Card style={styles.heroCard}>
            <SectionLabel>{t('nutrition.todayOverview')}</SectionLabel>
            <View style={styles.heroRow}>
              <CaloriesRing consumed={consumed.calories} target={targets.calories} />
              <View style={styles.macroColumn}>
                {(
                  [
                    [t('nutrition.protein'), consumed.proteinesG, targets.proteinesG, color.accent],
                    [t('nutrition.carbs'), consumed.glucidesG, targets.glucidesG, color.macro2],
                    [t('nutrition.fats'), consumed.lipidesG, targets.lipidesG, color.macro3],
                  ] as const
                ).map(([label, value, target, barColor]) => (
                  <View key={label} style={styles.macroBlock}>
                    <View style={styles.macroHead}>
                      <Text style={styles.macroLabel}>{label}</Text>
                      <Text style={styles.macroValue}>
                        {Math.round(value)}/{target} g
                      </Text>
                    </View>
                    <View style={styles.macroRail}>
                      <View
                        style={[
                          styles.macroFill,
                          {
                            backgroundColor: barColor,
                            width: `${Math.round(Math.min(1, target > 0 ? value / target : 0) * 100)}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.heroHint}>{t('nutrition.heroHint')}</Text>
          </Card>
        </Animated.View>

        {/* Conseil du jour — statique, honnête, tourne chaque jour. */}
        <Animated.View entering={cascade(1)}>
          <Card style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb-outline" size={17} color={color.accent} />
            </View>
            <View style={styles.tipText}>
              <SectionLabel>{t('nutrition.tipOfDay')}</SectionLabel>
              <Text style={styles.tipBody}>{tip[lang]}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={color.textMuted} />
          </Card>
        </Animated.View>

        {/* Idées de repas — contenu curé statique adapté à l'objectif. */}
        <Animated.View entering={cascade(1)}>
          <PressableScale
            onPress={() => router.push('/idees-repas')}
            accessibilityRole="button"
            accessibilityLabel={t('nutrition.mealIdeasA11y')}
          >
            <Card style={styles.ideasCard}>
              <View style={styles.tipIcon}>
                <Ionicons name="restaurant-outline" size={17} color={color.accent} />
              </View>
              <Text style={styles.ideasLabel}>{GOAL_TITLES[ideasGoal][lang]} →</Text>
            </Card>
          </PressableScale>
        </Animated.View>

        {/* Suivi rapide : hydratation (tap = +1 verre), repas, collations. */}
        <Animated.View entering={cascade(2)}>
          <SectionLabel style={styles.sectionGap}>{t('nutrition.quickTracking')}</SectionLabel>
          <View style={styles.quickRow}>
            <PressableScale
              onPress={() => addWater(1)}
              accessibilityRole="button"
              accessibilityLabel={t('nutrition.addGlassA11y')}
              style={styles.quickTileWrap}
            >
              <Card style={styles.quickTile}>
                <Ionicons name="water-outline" size={17} color={color.accent} />
                <Text style={styles.quickLabel}>{t('nutrition.hydration')}</Text>
                <Text style={styles.quickValue}>{formatWater(glasses, lang)}</Text>
                <View style={styles.quickRail}>
                  <View
                    style={[styles.quickFill, { width: `${Math.round(waterRatio(glasses) * 100)}%` }]}
                  />
                </View>
              </Card>
            </PressableScale>
            <Card style={[styles.quickTile, styles.quickTileWrap]}>
              <Ionicons name="restaurant-outline" size={17} color={color.accent} />
              <Text style={styles.quickLabel}>{t('nutrition.mealsTile')}</Text>
              <Text style={styles.quickValue}>
                {mealsCount} / {mealsTarget}
              </Text>
              <View style={styles.quickRail}>
                <View
                  style={[
                    styles.quickFill,
                    { width: `${Math.round((mealsCount / mealsTarget) * 100)}%` },
                  ]}
                />
              </View>
            </Card>
            <Card style={[styles.quickTile, styles.quickTileWrap]}>
              <Ionicons name="cafe-outline" size={17} color={color.accent} />
              <Text style={styles.quickLabel}>{t('nutrition.snacksTile')}</Text>
              <Text style={styles.quickValue}>{snacksCount} / 2</Text>
              <View style={styles.quickRail}>
                <View
                  style={[styles.quickFill, { width: `${Math.round((snacksCount / 2) * 100)}%` }]}
                />
              </View>
            </Card>
          </View>
        </Animated.View>

        {/* Ajouter un repas — le scan CIQUAL reste le moteur derrière. */}
        <Animated.View entering={cascade(3)}>
          <SectionLabel style={styles.sectionGap}>{t('nutrition.addMeal')}</SectionLabel>
          <View style={styles.addList}>
            <PressableScale
              onPress={handleScan}
              accessibilityRole="button"
              accessibilityLabel={t('nutrition.photographMeal')}
              disabled={scanning}
            >
              <Card style={styles.addRow}>
                <Ionicons name="camera-outline" size={19} color={color.accent} />
                <Text style={styles.addLabel}>
                  {scanning ? t('nutrition.scanning') : t('nutrition.photographMeal')}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={color.textMuted} />
              </Card>
            </PressableScale>

            <PressableScale
              onPress={() => setBarcodeOpen((open) => !open)}
              accessibilityRole="button"
              accessibilityLabel={t('nutrition.scanBarcode')}
            >
              <Card style={styles.addRow}>
                <Ionicons name="barcode-outline" size={19} color={color.accent} />
                <Text style={styles.addLabel}>{t('nutrition.scanBarcode')}</Text>
                <Ionicons
                  name={barcodeOpen ? 'chevron-down' : 'chevron-forward'}
                  size={16}
                  color={color.textMuted}
                />
              </Card>
            </PressableScale>
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
                  accessibilityLabel={t('nutrition.barcodeA11y')}
                />
                <PrimaryButton
                  label={t('nutrition.search')}
                  disabled={!barcode.trim() || scanning}
                  onPress={handleBarcodeSearch}
                  style={styles.barcodeSearch}
                />
              </View>
            ) : null}

            <PressableScale
              onPress={() => setDescOpen((open) => !open)}
              accessibilityRole="button"
              accessibilityLabel={t('nutrition.describeMeal')}
            >
              <Card style={styles.addRow}>
                <Ionicons name="create-outline" size={19} color={color.accent} />
                <Text style={styles.addLabel}>{t('nutrition.describeMeal')}</Text>
                <Ionicons
                  name={descOpen ? 'chevron-down' : 'chevron-forward'}
                  size={16}
                  color={color.textMuted}
                />
              </Card>
            </PressableScale>
            {descOpen ? (
              <View style={styles.descBlock}>
                <TextInput
                  style={[styles.hintInput, webNoOutline]}
                  value={userHint}
                  onChangeText={setUserHint}
                  placeholder={t('nutrition.describePlaceholder')}
                  placeholderTextColor={color.textMuted}
                  selectionColor={color.accent}
                  accessibilityLabel={t('nutrition.hintA11y')}
                />
                <Text style={styles.descHint}>{t('nutrition.describeHint')}</Text>
              </View>
            ) : null}

            <PressableScale
              onPress={() => setManualOpen((open) => !open)}
              accessibilityRole="button"
              accessibilityLabel={t('nutrition.addManually')}
            >
              <Card style={styles.addRow}>
                <Ionicons name="add-circle-outline" size={19} color={color.accent} />
                <Text style={styles.addLabel}>{t('nutrition.addManually')}</Text>
                <Ionicons
                  name={manualOpen ? 'chevron-down' : 'chevron-forward'}
                  size={16}
                  color={color.textMuted}
                />
              </Card>
            </PressableScale>
            {manualOpen ? (
              <Card style={styles.manualCard}>
                <TextInput
                  style={[styles.hintInput, webNoOutline]}
                  value={manual.nom}
                  onChangeText={(nom) => setManual({ ...manual, nom })}
                  placeholder={t('nutrition.mealNamePlaceholder')}
                  placeholderTextColor={color.textMuted}
                  selectionColor={color.accent}
                  accessibilityLabel={t('nutrition.manualNameA11y')}
                />
                <View style={styles.manualRow}>
                  {(
                    [
                      ['kcal', 'kcal'],
                      ['p', t('nutrition.manualP')],
                      ['g', t('nutrition.manualC')],
                      ['l', t('nutrition.manualF')],
                    ] as const
                  ).map(([key, label]) => (
                    <TextInput
                      key={key}
                      style={[styles.manualInput, webNoOutline]}
                      value={manual[key]}
                      onChangeText={(text) =>
                        setManual({ ...manual, [key]: text.replace(/[^0-9]/g, '').slice(0, 4) })
                      }
                      keyboardType="number-pad"
                      placeholder={label}
                      placeholderTextColor={color.textMuted}
                      selectionColor={color.accent}
                      accessibilityLabel={t('nutrition.manualFieldA11y', { label })}
                    />
                  ))}
                </View>
                <PrimaryButton
                  label={t('nutrition.addToJournal')}
                  disabled={!manual.nom.trim() || toInt(manual.kcal) <= 0}
                  onPress={handleManualAdd}
                />
              </Card>
            ) : null}
          </View>
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
              <SectionLabel>{t('nutrition.scanResult')}</SectionLabel>
              <TextInput
                style={[styles.nameInput, webNoOutline]}
                value={draft.nom}
                onChangeText={(nom) => setDraft({ ...draft, nom })}
                placeholder={t('nutrition.mealNamePlaceholder')}
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
                            accessibilityLabel={t('nutrition.gramsOfA11y', { name: item.base.name })}
                          />
                          <Text style={styles.gramsSuffix}>g</Text>
                        </View>
                        <PressableScale
                          onPress={() => removeDraftItem(index)}
                          accessibilityRole="button"
                          accessibilityLabel={t('nutrition.removeItemA11y', { name: item.base.name })}
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
                          : t('nutrition.modelEstimate')}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalKcal}>{draftTotals.kcal}</Text>
                <Text style={styles.totalMacros}>
                  {t('nutrition.totalMacros', {
                    p: Math.round(draftTotals.protein),
                    c: Math.round(draftTotals.carb),
                    f: Math.round(draftTotals.fat),
                  })}
                </Text>
              </View>
              <Text style={styles.confidence}>
                {t('nutrition.confidence', { pct: Math.round(draft.confiance * 100) })}
              </Text>
              <PrimaryButton label={t('common.add')} onPress={handleAddMeal} />
              <PrimaryButton
                label={t('common.cancel')}
                variant="secondary"
                onPress={() => setDraft(null)}
              />
            </Card>
          </Animated.View>
        ) : null}

        {reuseMeals.length > 0 ? (
          <Animated.View entering={cascade(2)}>
            <SectionLabel style={styles.reuseLabel}>{t('nutrition.reuse')}</SectionLabel>
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
                  accessibilityLabel={t('nutrition.reuseA11y', { name: meal.nom })}
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
          <SectionLabel style={styles.journalLabel}>{t('nutrition.todayMeals')}</SectionLabel>
          {todayMeals.length === 0 ? (
            <Text style={styles.empty}>{t('nutrition.emptyJournal')}</Text>
          ) : (
            <View style={styles.mealList}>
              {MEAL_SLOTS.map((slot) => {
                const slotMeals = todayMeals.filter((meal) => mealSlot(meal.id) === slot);
                if (slotMeals.length === 0) return null;
                return (
                  <View key={slot} style={styles.slotBlock}>
                    <Text style={styles.slotLabel}>{t(SLOT_LABEL_KEYS[slot])}</Text>
                    {slotMeals.map((meal) => {
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
                        {t('nutrition.mealMacros', {
                          kcal: meal.calories,
                          p: meal.proteinesG,
                          c: meal.glucidesG,
                          f: meal.lipidesG,
                        })}
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
                      accessibilityLabel={t('nutrition.favoriteA11y', { name: meal.nom })}
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
                      accessibilityLabel={t('nutrition.deleteA11y', { name: meal.nom })}
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
                );
              })}
            </View>
          )}

        </Animated.View>

        <Text style={styles.disclaimer}>{t('nutrition.disclaimer')}</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginTop: space.lg,
    padding: space.lg,
    gap: space.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  macroColumn: {
    flex: 1,
    gap: space.md,
  },
  macroBlock: {
    gap: space.xs,
  },
  macroHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  macroLabel: {
    ...type.meta,
  },
  macroValue: {
    ...type.meta,
    fontVariant: ['tabular-nums'],
  },
  macroRail: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: color.railOff,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  heroHint: {
    ...type.body,
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
    gap: space.md,
  },
  slotBlock: {
    gap: space.sm,
  },
  slotLabel: {
    ...type.sectionLabel,
    color: color.textMuted,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
    padding: space.lg,
  },
  tipIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    gap: space.xs / 2,
  },
  tipBody: {
    ...type.body,
    color: color.textPrimary,
  },
  ideasCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
    padding: space.lg,
  },
  ideasLabel: {
    ...type.bodyMedium,
    color: color.accent,
    flex: 1,
  },
  sectionGap: {
    marginTop: space.xl,
    marginBottom: space.md,
  },
  quickRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  quickTileWrap: {
    flex: 1,
  },
  quickTile: {
    gap: space.xs,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
  },
  quickLabel: {
    ...type.sectionLabel,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  quickValue: {
    ...type.bodyMedium,
    fontVariant: ['tabular-nums'],
  },
  quickRail: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: color.railOff,
    overflow: 'hidden',
  },
  quickFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: color.accent,
  },
  addList: {
    gap: space.sm,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  addLabel: {
    ...type.bodyMedium,
    flex: 1,
  },
  descBlock: {
    gap: space.xs,
  },
  descHint: {
    ...type.meta,
  },
  manualCard: {
    padding: space.md,
    gap: space.sm,
  },
  manualRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  manualInput: {
    ...type.bodyMedium,
    flex: 1,
    backgroundColor: color.bg,
    borderRadius: radius.tile,
    borderWidth: borderWidth.hairline,
    borderColor: color.border,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
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
