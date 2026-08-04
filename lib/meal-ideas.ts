/**
 * Idées de repas — contenu CURÉ STATIQUE par objectif nutrition (v1,
 * pas d'IA). Aliments simples et réels, portions raisonnables, repas
 * variés — aucun régime extrême, aucune macro rigide.
 *
 * Honnêteté : le « pourquoi » parle muscle / énergie / récupération /
 * satiété — JAMAIS « mange ça pour grandir / faire pousser les os ».
 * Les macros sont des ordres de grandeur pour pré-remplir l'ajout
 * manuel — l'utilisateur ajuste toujours.
 */
import type { Localized } from './i18n';
import type { NutriIntent } from './store';

export type MealIdea = {
  nom: Localized;
  /** Composition / portions indicatives. */
  description: Localized;
  /** La ligne « pourquoi » — honnête, jamais culpabilisante. */
  pourquoi: Localized;
  kcal: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
};

/** Clés internes stables (l'affichage passe par MOMENT_LABELS). */
export const MEAL_MOMENTS = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'] as const;
export type MealMoment = (typeof MEAL_MOMENTS)[number];

export const MOMENT_LABELS: Record<MealMoment, Localized> = {
  'Petit-déjeuner': { fr: 'Petit-déjeuner', en: 'Breakfast' },
  Déjeuner: { fr: 'Déjeuner', en: 'Lunch' },
  Dîner: { fr: 'Dîner', en: 'Dinner' },
  Collation: { fr: 'Collation', en: 'Snack' },
};

/** Libellé de l'objectif pour la carte d'entrée (« pour ta/ton … »). */
export const GOAL_TITLES: Record<NutriIntent, Localized> = {
  masse: { fr: 'Idées de repas pour ta prise de masse', en: 'Meal ideas for building muscle' },
  maintien: { fr: 'Idées de repas pour ton maintien', en: 'Meal ideas for maintenance' },
  perte: { fr: 'Idées de repas pour ta recomposition', en: 'Meal ideas for body recomposition' },
  'mieux-manger': { fr: 'Idées de repas pour mieux manger', en: 'Meal ideas for eating better' },
};

export const GOAL_SUBTITLES: Record<NutriIntent, Localized> = {
  masse: {
    fr: 'De quoi soutenir le muscle et tes séances.',
    en: 'Fuel for your muscles and your sessions.',
  },
  maintien: {
    fr: 'Équilibré, simple, sans prise de tête.',
    en: 'Balanced, simple, no fuss.',
  },
  perte: {
    fr: 'Rassasiant et riche en protéines — le muscle reste, l’énergie aussi.',
    en: 'Filling and protein-rich — the muscle stays, so does the energy.',
  },
  'mieux-manger': {
    fr: 'Des bases simples pour bien manger au quotidien.',
    en: 'Simple foundations for eating well every day.',
  },
};

export const MEAL_IDEAS: Record<NutriIntent, Record<MealMoment, MealIdea[]>> = {
  masse: {
    'Petit-déjeuner': [
      {
        nom: {
          fr: 'Porridge banane & beurre de cacahuète',
          en: 'Banana & peanut butter porridge',
        },
        description: {
          fr: "80 g d'avoine, 300 ml de lait, 1 banane, 1 c. à s. de beurre de cacahuète.",
          en: '80 g oats, 300 ml milk, 1 banana, 1 tbsp peanut butter.',
        },
        pourquoi: {
          fr: "Glucides pour l'énergie, protéines et bonnes graisses pour le muscle.",
          en: 'Carbs for energy, protein and good fats for your muscles.',
        },
        kcal: 650, proteinesG: 25, glucidesG: 85, lipidesG: 22,
      },
      {
        nom: {
          fr: 'Œufs brouillés, pain complet & avocat',
          en: 'Scrambled eggs, whole-grain bread & avocado',
        },
        description: {
          fr: '3 œufs, 2 tranches de pain complet, ½ avocat.',
          en: '3 eggs, 2 slices of whole-grain bread, ½ avocado.',
        },
        pourquoi: {
          fr: 'Protéines complètes pour la construction musculaire.',
          en: 'Complete protein for building muscle.',
        },
        kcal: 560, proteinesG: 28, glucidesG: 40, lipidesG: 30,
      },
      {
        nom: {
          fr: 'Skyr, granola & fruits rouges',
          en: 'Skyr, granola & berries',
        },
        description: {
          fr: '250 g de skyr, 40 g de granola, une poignée de fruits rouges.',
          en: '250 g skyr, 40 g granola, a handful of berries.',
        },
        pourquoi: {
          fr: 'Protéines + glucides pour bien démarrer la journée.',
          en: 'Protein + carbs to start the day right.',
        },
        kcal: 450, proteinesG: 35, glucidesG: 55, lipidesG: 10,
      },
    ],
    Déjeuner: [
      {
        nom: {
          fr: 'Poulet, riz & légumes rôtis',
          en: 'Chicken, rice & roasted vegetables',
        },
        description: {
          fr: '180 g de poulet, 200 g de riz cuit, légumes rôtis.',
          en: '180 g chicken, 200 g cooked rice, roasted vegetables.',
        },
        pourquoi: {
          fr: 'Protéines pour le muscle, glucides pour la récupération.',
          en: 'Protein for your muscles, carbs for recovery.',
        },
        kcal: 700, proteinesG: 45, glucidesG: 80, lipidesG: 15,
      },
      {
        nom: {
          fr: 'Bœuf 5 %, pâtes complètes & sauce tomate',
          en: 'Lean beef, whole-wheat pasta & tomato sauce',
        },
        description: {
          fr: '150 g de bœuf haché 5 %, 220 g de pâtes cuites, sauce tomate.',
          en: '150 g lean ground beef (5%), 220 g cooked pasta, tomato sauce.',
        },
        pourquoi: {
          fr: "Fer et protéines, glucides pour l'énergie des séances.",
          en: 'Iron and protein, plus carbs to fuel your sessions.',
        },
        kcal: 750, proteinesG: 42, glucidesG: 90, lipidesG: 18,
      },
      {
        nom: {
          fr: 'Saumon, patate douce & brocoli',
          en: 'Salmon, sweet potato & broccoli',
        },
        description: {
          fr: '150 g de saumon, 250 g de patate douce, brocoli.',
          en: '150 g salmon, 250 g sweet potato, broccoli.',
        },
        pourquoi: {
          fr: 'Oméga-3 et protéines pour la récupération musculaire.',
          en: 'Omega-3s and protein for muscle recovery.',
        },
        kcal: 680, proteinesG: 38, glucidesG: 65, lipidesG: 25,
      },
    ],
    Dîner: [
      {
        nom: {
          fr: 'Omelette, pommes de terre & salade',
          en: 'Omelette, potatoes & salad',
        },
        description: {
          fr: '3 œufs, 250 g de pommes de terre, salade assaisonnée.',
          en: '3 eggs, 250 g potatoes, dressed salad.',
        },
        pourquoi: {
          fr: 'Protéines du soir pour la réparation musculaire nocturne.',
          en: 'Evening protein for overnight muscle repair.',
        },
        kcal: 600, proteinesG: 30, glucidesG: 55, lipidesG: 25,
      },
      {
        nom: {
          fr: 'Dinde, quinoa & courgettes',
          en: 'Turkey, quinoa & zucchini',
        },
        description: {
          fr: '160 g de dinde, 180 g de quinoa cuit, courgettes poêlées.',
          en: '160 g turkey, 180 g cooked quinoa, pan-fried zucchini.',
        },
        pourquoi: {
          fr: 'Protéines maigres + glucides complets pour récupérer.',
          en: 'Lean protein + complex carbs to recover.',
        },
        kcal: 620, proteinesG: 40, glucidesG: 60, lipidesG: 18,
      },
      {
        nom: {
          fr: 'Chili con carne & riz',
          en: 'Chili con carne & rice',
        },
        description: {
          fr: 'Bœuf 5 %, haricots rouges, tomates, 150 g de riz cuit.',
          en: 'Lean beef, kidney beans, tomatoes, 150 g cooked rice.',
        },
        pourquoi: {
          fr: 'Protéines + fibres, et des glucides pour recharger.',
          en: 'Protein + fibre, and carbs to refuel.',
        },
        kcal: 680, proteinesG: 35, glucidesG: 85, lipidesG: 18,
      },
    ],
    Collation: [
      {
        nom: {
          fr: 'Fromage blanc, miel & amandes',
          en: 'Fromage blanc, honey & almonds',
        },
        description: {
          fr: '250 g de fromage blanc, 1 c. à c. de miel, 15 amandes.',
          en: '250 g fromage blanc (or Greek yogurt), 1 tsp honey, 15 almonds.',
        },
        pourquoi: {
          fr: 'Caséine à digestion lente — bien avant le coucher.',
          en: 'Slow-digesting casein — great before bed.',
        },
        kcal: 320, proteinesG: 25, glucidesG: 25, lipidesG: 12,
      },
      {
        nom: {
          fr: 'Banane & beurre de cacahuète',
          en: 'Banana & peanut butter',
        },
        description: {
          fr: '1 banane, 1 c. à s. de beurre de cacahuète.',
          en: '1 banana, 1 tbsp peanut butter.',
        },
        pourquoi: {
          fr: 'Énergie rapide + bonnes graisses entre deux repas.',
          en: 'Quick energy + good fats between meals.',
        },
        kcal: 300, proteinesG: 8, glucidesG: 35, lipidesG: 14,
      },
      {
        nom: {
          fr: "Shaker lait & flocons d'avoine",
          en: 'Milk & oat shake',
        },
        description: {
          fr: '300 ml de lait, 40 g de flocons mixés, 1 fruit.',
          en: '300 ml milk, 40 g blended oats, 1 piece of fruit.',
        },
        pourquoi: {
          fr: 'Un apport simple à boire quand la faim manque.',
          en: 'Easy calories to drink when your appetite is low.',
        },
        kcal: 350, proteinesG: 25, glucidesG: 45, lipidesG: 8,
      },
    ],
  },
  maintien: {
    'Petit-déjeuner': [
      {
        nom: {
          fr: 'Yaourt grec, muesli & fruit',
          en: 'Greek yogurt, muesli & fruit',
        },
        description: {
          fr: '200 g de yaourt grec, 40 g de muesli, 1 fruit de saison.',
          en: '200 g Greek yogurt, 40 g muesli, 1 piece of seasonal fruit.',
        },
        pourquoi: {
          fr: 'Protéines et fibres pour une énergie stable le matin.',
          en: 'Protein and fibre for steady morning energy.',
        },
        kcal: 380, proteinesG: 20, glucidesG: 45, lipidesG: 12,
      },
      {
        nom: {
          fr: 'Tartines complètes & œuf',
          en: 'Whole-grain toast & egg',
        },
        description: {
          fr: '2 tranches de pain complet, 1 œuf, 1 orange.',
          en: '2 slices of whole-grain bread, 1 egg, 1 orange.',
        },
        pourquoi: {
          fr: "Un classique équilibré qui tient jusqu'au déjeuner.",
          en: 'A balanced classic that holds you until lunch.',
        },
        kcal: 400, proteinesG: 18, glucidesG: 50, lipidesG: 14,
      },
    ],
    Déjeuner: [
      {
        nom: {
          fr: 'Poulet, semoule & ratatouille',
          en: 'Chicken, couscous & ratatouille',
        },
        description: {
          fr: '150 g de poulet, 180 g de semoule cuite, ratatouille.',
          en: '150 g chicken, 180 g cooked couscous, ratatouille.',
        },
        pourquoi: {
          fr: 'Protéines pour le muscle, légumes pour les micronutriments.',
          en: 'Protein for your muscles, vegetables for micronutrients.',
        },
        kcal: 550, proteinesG: 38, glucidesG: 60, lipidesG: 14,
      },
      {
        nom: {
          fr: 'Buddha bowl pois chiches & riz',
          en: 'Chickpea & rice buddha bowl',
        },
        description: {
          fr: 'Pois chiches, 150 g de riz cuit, crudités, sauce yaourt.',
          en: 'Chickpeas, 150 g cooked rice, raw vegetables, yogurt dressing.',
        },
        pourquoi: {
          fr: 'Protéines végétales + fibres : rassasiant et varié.',
          en: 'Plant protein + fibre: filling and varied.',
        },
        kcal: 520, proteinesG: 20, glucidesG: 75, lipidesG: 15,
      },
      {
        nom: {
          fr: 'Poisson blanc, pommes de terre & haricots',
          en: 'White fish, potatoes & green beans',
        },
        description: {
          fr: '160 g de poisson blanc, 220 g de pommes de terre, haricots verts.',
          en: '160 g white fish, 220 g potatoes, green beans.',
        },
        pourquoi: {
          fr: 'Léger en graisses, riche en protéines de qualité.',
          en: 'Low in fat, rich in quality protein.',
        },
        kcal: 480, proteinesG: 35, glucidesG: 55, lipidesG: 10,
      },
    ],
    Dîner: [
      {
        nom: {
          fr: 'Soupe de légumes, œufs durs & pain complet',
          en: 'Vegetable soup, boiled eggs & whole-grain bread',
        },
        description: {
          fr: 'Grand bol de soupe, 2 œufs durs, 1 tranche de pain complet.',
          en: 'A big bowl of soup, 2 boiled eggs, 1 slice of whole-grain bread.',
        },
        pourquoi: {
          fr: 'Un dîner léger qui laisse le sommeil faire son travail.',
          en: 'A light dinner that lets sleep do its job.',
        },
        kcal: 420, proteinesG: 22, glucidesG: 40, lipidesG: 16,
      },
      {
        nom: {
          fr: 'Tofu sauté, nouilles & légumes',
          en: 'Stir-fried tofu, noodles & vegetables',
        },
        description: {
          fr: '150 g de tofu, 150 g de nouilles cuites, légumes croquants.',
          en: '150 g tofu, 150 g cooked noodles, crunchy vegetables.',
        },
        pourquoi: {
          fr: 'Protéines végétales + légumes pour varier les plaisirs.',
          en: 'Plant protein + vegetables to keep things varied.',
        },
        kcal: 500, proteinesG: 25, glucidesG: 60, lipidesG: 16,
      },
    ],
    Collation: [
      {
        nom: {
          fr: 'Pomme & poignée de noix',
          en: 'Apple & a handful of walnuts',
        },
        description: {
          fr: '1 pomme, 20 g de noix.',
          en: '1 apple, 20 g walnuts.',
        },
        pourquoi: {
          fr: 'Fibres + bonnes graisses : le combo coupe-faim simple.',
          en: 'Fibre + good fats: the simple hunger-buster combo.',
        },
        kcal: 220, proteinesG: 4, glucidesG: 25, lipidesG: 12,
      },
      {
        nom: {
          fr: 'Fromage blanc nature',
          en: 'Plain fromage blanc',
        },
        description: {
          fr: '150 g de fromage blanc, éventuellement un filet de citron.',
          en: '150 g fromage blanc (or Greek yogurt), a squeeze of lemon if you like.',
        },
        pourquoi: {
          fr: 'Des protéines simples pour patienter sans excès.',
          en: 'Simple protein to hold you over without excess.',
        },
        kcal: 120, proteinesG: 12, glucidesG: 8, lipidesG: 4,
      },
    ],
  },
  perte: {
    'Petit-déjeuner': [
      {
        nom: {
          fr: 'Fromage blanc, avoine & fruits rouges',
          en: 'Fromage blanc, oats & berries',
        },
        description: {
          fr: '200 g de fromage blanc, 30 g de flocons, fruits rouges.',
          en: '200 g fromage blanc (or Greek yogurt), 30 g oats, berries.',
        },
        pourquoi: {
          fr: 'Protéines rassasiantes pour tenir la matinée sans grignoter.',
          en: 'Filling protein to get through the morning without snacking.',
        },
        kcal: 320, proteinesG: 25, glucidesG: 35, lipidesG: 6,
      },
      {
        nom: {
          fr: 'Œufs pochés & pain complet',
          en: 'Poached eggs & whole-grain bread',
        },
        description: {
          fr: '2 œufs pochés, 1 tranche de pain complet, tomates cerises.',
          en: '2 poached eggs, 1 slice of whole-grain bread, cherry tomatoes.',
        },
        pourquoi: {
          fr: 'Protéines + fibres : satiété durable dès le matin.',
          en: 'Protein + fibre: lasting fullness from the morning on.',
        },
        kcal: 300, proteinesG: 18, glucidesG: 25, lipidesG: 13,
      },
    ],
    Déjeuner: [
      {
        nom: {
          fr: 'Salade de poulet, quinoa & crudités',
          en: 'Chicken salad with quinoa & raw vegetables',
        },
        description: {
          fr: '140 g de poulet, 120 g de quinoa cuit, grandes crudités.',
          en: '140 g chicken, 120 g cooked quinoa, plenty of raw vegetables.',
        },
        pourquoi: {
          fr: 'Le muscle est préservé, la faim est calée — sans excès.',
          en: 'Muscle preserved, hunger handled — without excess.',
        },
        kcal: 450, proteinesG: 38, glucidesG: 45, lipidesG: 12,
      },
      {
        nom: {
          fr: 'Poisson blanc, légumes rôtis & riz',
          en: 'White fish, roasted vegetables & rice',
        },
        description: {
          fr: '160 g de poisson, légumes rôtis, 100 g de riz cuit.',
          en: '160 g fish, roasted vegetables, 100 g cooked rice.',
        },
        pourquoi: {
          fr: 'Volumineux et léger : rassasié avec moins de calories.',
          en: 'High volume, light: full on fewer calories.',
        },
        kcal: 430, proteinesG: 35, glucidesG: 45, lipidesG: 9,
      },
      {
        nom: {
          fr: 'Omelette aux légumes & salade verte',
          en: 'Vegetable omelette & green salad',
        },
        description: {
          fr: '3 œufs, légumes de saison, grande salade verte.',
          en: '3 eggs, seasonal vegetables, a large green salad.',
        },
        pourquoi: {
          fr: "Protéines complètes, énergie stable tout l'après-midi.",
          en: 'Complete protein, steady energy all afternoon.',
        },
        kcal: 380, proteinesG: 24, glucidesG: 12, lipidesG: 26,
      },
    ],
    Dîner: [
      {
        nom: {
          fr: 'Soupe & filet de poisson, légumes verts',
          en: 'Soup & fish fillet with green vegetables',
        },
        description: {
          fr: 'Bol de soupe, 140 g de poisson, légumes verts vapeur.',
          en: 'A bowl of soup, 140 g fish, steamed green vegetables.',
        },
        pourquoi: {
          fr: 'Léger le soir : le corps récupère sans surcharge.',
          en: 'Light in the evening: your body recovers without overload.',
        },
        kcal: 380, proteinesG: 32, glucidesG: 30, lipidesG: 10,
      },
      {
        nom: {
          fr: 'Poêlée de dinde & légumes, yaourt',
          en: 'Turkey & vegetable stir-fry, yogurt',
        },
        description: {
          fr: '140 g de dinde, grande poêlée de légumes, 1 yaourt nature.',
          en: '140 g turkey, a big pan of vegetables, 1 plain yogurt.',
        },
        pourquoi: {
          fr: 'Protéines maigres pour préserver le muscle en déficit.',
          en: 'Lean protein to preserve muscle while in a deficit.',
        },
        kcal: 400, proteinesG: 38, glucidesG: 25, lipidesG: 12,
      },
    ],
    Collation: [
      {
        nom: {
          fr: 'Yaourt nature & fruit',
          en: 'Plain yogurt & fruit',
        },
        description: {
          fr: '1 yaourt nature, 1 fruit de saison.',
          en: '1 plain yogurt, 1 piece of seasonal fruit.',
        },
        pourquoi: {
          fr: 'Un vrai en-cas qui coupe la faim sans casser la journée.',
          en: 'A real snack that curbs hunger without derailing your day.',
        },
        kcal: 150, proteinesG: 8, glucidesG: 22, lipidesG: 3,
      },
      {
        nom: {
          fr: 'Bâtonnets de légumes & houmous',
          en: 'Vegetable sticks & hummus',
        },
        description: {
          fr: 'Carotte et concombre, 2 c. à s. de houmous.',
          en: 'Carrot and cucumber, 2 tbsp hummus.',
        },
        pourquoi: {
          fr: 'Croquant, fibres et bonnes graisses — satiété maligne.',
          en: 'Crunch, fibre and good fats — smart satiety.',
        },
        kcal: 180, proteinesG: 5, glucidesG: 15, lipidesG: 11,
      },
    ],
  },
  'mieux-manger': {
    'Petit-déjeuner': [
      {
        nom: {
          fr: 'Porridge nature & fruit frais',
          en: 'Plain porridge & fresh fruit',
        },
        description: {
          fr: "50 g d'avoine, lait ou boisson végétale, 1 fruit coupé.",
          en: '50 g oats, milk or a plant-based drink, 1 chopped fruit.',
        },
        pourquoi: {
          fr: 'Des glucides complets pour une énergie qui dure.',
          en: 'Complex carbs for energy that lasts.',
        },
        kcal: 350, proteinesG: 12, glucidesG: 55, lipidesG: 8,
      },
      {
        nom: {
          fr: 'Pain complet, œuf & orange pressée',
          en: 'Whole-grain bread, egg & fresh orange juice',
        },
        description: {
          fr: '2 tranches de pain complet, 1 œuf, 1 orange pressée.',
          en: '2 slices of whole-grain bread, 1 egg, 1 freshly squeezed orange.',
        },
        pourquoi: {
          fr: 'Simple, complet, sans produits ultra-transformés.',
          en: 'Simple, complete, no ultra-processed foods.',
        },
        kcal: 380, proteinesG: 16, glucidesG: 48, lipidesG: 12,
      },
    ],
    Déjeuner: [
      {
        nom: {
          fr: 'Assiette équilibrée maison',
          en: 'Balanced home plate',
        },
        description: {
          fr: '½ légumes, ¼ protéines (viande, poisson, œufs, légumineuses), ¼ féculents.',
          en: '½ vegetables, ¼ protein (meat, fish, eggs, legumes), ¼ starches.',
        },
        pourquoi: {
          fr: 'La répartition simple qui couvre tous les besoins.',
          en: 'The simple split that covers all your needs.',
        },
        kcal: 500, proteinesG: 30, glucidesG: 50, lipidesG: 16,
      },
      {
        nom: {
          fr: 'Poulet rôti, légumes de saison & riz complet',
          en: 'Roast chicken, seasonal vegetables & brown rice',
        },
        description: {
          fr: '150 g de poulet, légumes de saison, 150 g de riz complet cuit.',
          en: '150 g chicken, seasonal vegetables, 150 g cooked brown rice.',
        },
        pourquoi: {
          fr: 'Protéines pour le muscle, fibres pour la digestion.',
          en: 'Protein for your muscles, fibre for digestion.',
        },
        kcal: 550, proteinesG: 38, glucidesG: 55, lipidesG: 14,
      },
      {
        nom: {
          fr: 'Lentilles, riz & salade',
          en: 'Lentils, rice & salad',
        },
        description: {
          fr: '150 g de lentilles cuites, 120 g de riz, salade croquante.',
          en: '150 g cooked lentils, 120 g rice, crunchy salad.',
        },
        pourquoi: {
          fr: 'Le duo lentilles-riz : protéines végétales complètes.',
          en: 'The lentil-rice duo: complete plant protein.',
        },
        kcal: 520, proteinesG: 22, glucidesG: 80, lipidesG: 8,
      },
    ],
    Dîner: [
      {
        nom: {
          fr: 'Poisson, légumes vapeur & pommes de terre',
          en: 'Fish, steamed vegetables & potatoes',
        },
        description: {
          fr: '150 g de poisson, légumes vapeur, 180 g de pommes de terre.',
          en: '150 g fish, steamed vegetables, 180 g potatoes.',
        },
        pourquoi: {
          fr: 'Un dîner doux qui prépare une bonne nuit de récupération.',
          en: 'A gentle dinner that sets up a good night of recovery.',
        },
        kcal: 450, proteinesG: 32, glucidesG: 45, lipidesG: 12,
      },
      {
        nom: {
          fr: 'Omelette, salade & pain complet',
          en: 'Omelette, salad & whole-grain bread',
        },
        description: {
          fr: '2-3 œufs, grande salade, 1 tranche de pain complet.',
          en: '2-3 eggs, a large salad, 1 slice of whole-grain bread.',
        },
        pourquoi: {
          fr: "Rapide, vrai et équilibré — mieux qu'un plat préparé.",
          en: 'Fast, real and balanced — better than a ready meal.',
        },
        kcal: 420, proteinesG: 24, glucidesG: 30, lipidesG: 22,
      },
    ],
    Collation: [
      {
        nom: {
          fr: "Fruit & poignée d'amandes",
          en: 'Fruit & a handful of almonds',
        },
        description: {
          fr: '1 fruit, 15 amandes.',
          en: '1 piece of fruit, 15 almonds.',
        },
        pourquoi: {
          fr: 'Le réflexe simple qui remplace les biscuits.',
          en: 'The simple reflex that replaces the cookie jar.',
        },
        kcal: 200, proteinesG: 5, glucidesG: 22, lipidesG: 10,
      },
      {
        nom: {
          fr: 'Yaourt & carré de chocolat noir',
          en: 'Yogurt & a square of dark chocolate',
        },
        description: {
          fr: '1 yaourt nature, 2 carrés de chocolat noir 70 %.',
          en: '1 plain yogurt, 2 squares of 70% dark chocolate.',
        },
        pourquoi: {
          fr: 'Le plaisir a sa place — en portion maîtrisée.',
          en: 'Pleasure has its place — in a controlled portion.',
        },
        kcal: 180, proteinesG: 7, glucidesG: 15, lipidesG: 9,
      },
    ],
  },
};

export const MEAL_IDEAS_DISCLAIMER: Localized = {
  fr: "Des idées pour t'inspirer — adapte à ta faim et à tes besoins ; en cas de doute, consulte un professionnel.",
  en: 'Ideas to inspire you — adapt them to your hunger and your needs; when in doubt, ask a professional.',
};
