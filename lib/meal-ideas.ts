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
import type { NutriIntent } from './store';

export type MealIdea = {
  nom: string;
  /** Composition / portions indicatives. */
  description: string;
  /** La ligne « pourquoi » — honnête, jamais culpabilisante. */
  pourquoi: string;
  kcal: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
};

export const MEAL_MOMENTS = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'] as const;
export type MealMoment = (typeof MEAL_MOMENTS)[number];

/** Libellé de l'objectif pour la carte d'entrée (« pour ta/ton … »). */
export const GOAL_TITLES: Record<NutriIntent, string> = {
  masse: 'Idées de repas pour ta prise de masse',
  maintien: 'Idées de repas pour ton maintien',
  perte: 'Idées de repas pour ta perte de poids',
  'mieux-manger': 'Idées de repas pour mieux manger',
};

export const GOAL_SUBTITLES: Record<NutriIntent, string> = {
  masse: 'De quoi soutenir le muscle et tes séances.',
  maintien: 'Équilibré, simple, sans prise de tête.',
  perte: 'Rassasiant et doux — le muscle reste, l’énergie aussi.',
  'mieux-manger': 'Des bases simples pour bien manger au quotidien.',
};

export const MEAL_IDEAS: Record<NutriIntent, Record<MealMoment, MealIdea[]>> = {
  masse: {
    'Petit-déjeuner': [
      {
        nom: 'Porridge banane & beurre de cacahuète',
        description: "80 g d'avoine, 300 ml de lait, 1 banane, 1 c. à s. de beurre de cacahuète.",
        pourquoi: "Glucides pour l'énergie, protéines et bonnes graisses pour le muscle.",
        kcal: 650, proteinesG: 25, glucidesG: 85, lipidesG: 22,
      },
      {
        nom: 'Œufs brouillés, pain complet & avocat',
        description: '3 œufs, 2 tranches de pain complet, ½ avocat.',
        pourquoi: 'Protéines complètes pour la construction musculaire.',
        kcal: 560, proteinesG: 28, glucidesG: 40, lipidesG: 30,
      },
      {
        nom: 'Skyr, granola & fruits rouges',
        description: '250 g de skyr, 40 g de granola, une poignée de fruits rouges.',
        pourquoi: 'Protéines + glucides pour bien démarrer la journée.',
        kcal: 450, proteinesG: 35, glucidesG: 55, lipidesG: 10,
      },
    ],
    Déjeuner: [
      {
        nom: 'Poulet, riz & légumes rôtis',
        description: '180 g de poulet, 200 g de riz cuit, légumes rôtis.',
        pourquoi: 'Protéines pour le muscle, glucides pour la récupération.',
        kcal: 700, proteinesG: 45, glucidesG: 80, lipidesG: 15,
      },
      {
        nom: 'Bœuf 5 %, pâtes complètes & sauce tomate',
        description: '150 g de bœuf haché 5 %, 220 g de pâtes cuites, sauce tomate.',
        pourquoi: "Fer et protéines, glucides pour l'énergie des séances.",
        kcal: 750, proteinesG: 42, glucidesG: 90, lipidesG: 18,
      },
      {
        nom: 'Saumon, patate douce & brocoli',
        description: '150 g de saumon, 250 g de patate douce, brocoli.',
        pourquoi: 'Oméga-3 et protéines pour la récupération musculaire.',
        kcal: 680, proteinesG: 38, glucidesG: 65, lipidesG: 25,
      },
    ],
    Dîner: [
      {
        nom: 'Omelette, pommes de terre & salade',
        description: '3 œufs, 250 g de pommes de terre, salade assaisonnée.',
        pourquoi: 'Protéines du soir pour la réparation musculaire nocturne.',
        kcal: 600, proteinesG: 30, glucidesG: 55, lipidesG: 25,
      },
      {
        nom: 'Dinde, quinoa & courgettes',
        description: '160 g de dinde, 180 g de quinoa cuit, courgettes poêlées.',
        pourquoi: 'Protéines maigres + glucides complets pour récupérer.',
        kcal: 620, proteinesG: 40, glucidesG: 60, lipidesG: 18,
      },
      {
        nom: 'Chili con carne & riz',
        description: 'Bœuf 5 %, haricots rouges, tomates, 150 g de riz cuit.',
        pourquoi: 'Protéines + fibres, et des glucides pour recharger.',
        kcal: 680, proteinesG: 35, glucidesG: 85, lipidesG: 18,
      },
    ],
    Collation: [
      {
        nom: 'Fromage blanc, miel & amandes',
        description: '250 g de fromage blanc, 1 c. à c. de miel, 15 amandes.',
        pourquoi: 'Caséine à digestion lente — bien avant le coucher.',
        kcal: 320, proteinesG: 25, glucidesG: 25, lipidesG: 12,
      },
      {
        nom: 'Banane & beurre de cacahuète',
        description: '1 banane, 1 c. à s. de beurre de cacahuète.',
        pourquoi: 'Énergie rapide + bonnes graisses entre deux repas.',
        kcal: 300, proteinesG: 8, glucidesG: 35, lipidesG: 14,
      },
      {
        nom: "Shaker lait & flocons d'avoine",
        description: '300 ml de lait, 40 g de flocons mixés, 1 fruit.',
        pourquoi: 'Un apport simple à boire quand la faim manque.',
        kcal: 350, proteinesG: 25, glucidesG: 45, lipidesG: 8,
      },
    ],
  },
  maintien: {
    'Petit-déjeuner': [
      {
        nom: 'Yaourt grec, muesli & fruit',
        description: '200 g de yaourt grec, 40 g de muesli, 1 fruit de saison.',
        pourquoi: 'Protéines et fibres pour une énergie stable le matin.',
        kcal: 380, proteinesG: 20, glucidesG: 45, lipidesG: 12,
      },
      {
        nom: 'Tartines complètes & œuf',
        description: '2 tranches de pain complet, 1 œuf, 1 orange.',
        pourquoi: "Un classique équilibré qui tient jusqu'au déjeuner.",
        kcal: 400, proteinesG: 18, glucidesG: 50, lipidesG: 14,
      },
    ],
    Déjeuner: [
      {
        nom: 'Poulet, semoule & ratatouille',
        description: '150 g de poulet, 180 g de semoule cuite, ratatouille.',
        pourquoi: 'Protéines pour le muscle, légumes pour les micronutriments.',
        kcal: 550, proteinesG: 38, glucidesG: 60, lipidesG: 14,
      },
      {
        nom: 'Buddha bowl pois chiches & riz',
        description: 'Pois chiches, 150 g de riz cuit, crudités, sauce yaourt.',
        pourquoi: 'Protéines végétales + fibres : rassasiant et varié.',
        kcal: 520, proteinesG: 20, glucidesG: 75, lipidesG: 15,
      },
      {
        nom: 'Poisson blanc, pommes de terre & haricots',
        description: '160 g de poisson blanc, 220 g de pommes de terre, haricots verts.',
        pourquoi: 'Léger en graisses, riche en protéines de qualité.',
        kcal: 480, proteinesG: 35, glucidesG: 55, lipidesG: 10,
      },
    ],
    Dîner: [
      {
        nom: 'Soupe de légumes, œufs durs & pain complet',
        description: 'Grand bol de soupe, 2 œufs durs, 1 tranche de pain complet.',
        pourquoi: 'Un dîner léger qui laisse le sommeil faire son travail.',
        kcal: 420, proteinesG: 22, glucidesG: 40, lipidesG: 16,
      },
      {
        nom: 'Tofu sauté, nouilles & légumes',
        description: '150 g de tofu, 150 g de nouilles cuites, légumes croquants.',
        pourquoi: 'Protéines végétales + légumes pour varier les plaisirs.',
        kcal: 500, proteinesG: 25, glucidesG: 60, lipidesG: 16,
      },
    ],
    Collation: [
      {
        nom: 'Pomme & poignée de noix',
        description: '1 pomme, 20 g de noix.',
        pourquoi: 'Fibres + bonnes graisses : le combo coupe-faim simple.',
        kcal: 220, proteinesG: 4, glucidesG: 25, lipidesG: 12,
      },
      {
        nom: 'Fromage blanc nature',
        description: '150 g de fromage blanc, éventuellement un filet de citron.',
        pourquoi: 'Des protéines simples pour patienter sans excès.',
        kcal: 120, proteinesG: 12, glucidesG: 8, lipidesG: 4,
      },
    ],
  },
  perte: {
    'Petit-déjeuner': [
      {
        nom: 'Fromage blanc, avoine & fruits rouges',
        description: '200 g de fromage blanc, 30 g de flocons, fruits rouges.',
        pourquoi: 'Protéines rassasiantes pour tenir la matinée sans grignoter.',
        kcal: 320, proteinesG: 25, glucidesG: 35, lipidesG: 6,
      },
      {
        nom: 'Œufs pochés & pain complet',
        description: '2 œufs pochés, 1 tranche de pain complet, tomates cerises.',
        pourquoi: 'Protéines + fibres : satiété durable dès le matin.',
        kcal: 300, proteinesG: 18, glucidesG: 25, lipidesG: 13,
      },
    ],
    Déjeuner: [
      {
        nom: 'Salade de poulet, quinoa & crudités',
        description: '140 g de poulet, 120 g de quinoa cuit, grandes crudités.',
        pourquoi: 'Le muscle est préservé, la faim est calée — sans excès.',
        kcal: 450, proteinesG: 38, glucidesG: 45, lipidesG: 12,
      },
      {
        nom: 'Poisson blanc, légumes rôtis & riz',
        description: '160 g de poisson, légumes rôtis, 100 g de riz cuit.',
        pourquoi: 'Volumineux et léger : rassasié avec moins de calories.',
        kcal: 430, proteinesG: 35, glucidesG: 45, lipidesG: 9,
      },
      {
        nom: 'Omelette aux légumes & salade verte',
        description: '3 œufs, légumes de saison, grande salade verte.',
        pourquoi: "Protéines complètes, énergie stable tout l'après-midi.",
        kcal: 380, proteinesG: 24, glucidesG: 12, lipidesG: 26,
      },
    ],
    Dîner: [
      {
        nom: 'Soupe & filet de poisson, légumes verts',
        description: 'Bol de soupe, 140 g de poisson, légumes verts vapeur.',
        pourquoi: 'Léger le soir : le corps récupère sans surcharge.',
        kcal: 380, proteinesG: 32, glucidesG: 30, lipidesG: 10,
      },
      {
        nom: 'Poêlée de dinde & légumes, yaourt',
        description: '140 g de dinde, grande poêlée de légumes, 1 yaourt nature.',
        pourquoi: 'Protéines maigres pour préserver le muscle en déficit.',
        kcal: 400, proteinesG: 38, glucidesG: 25, lipidesG: 12,
      },
    ],
    Collation: [
      {
        nom: 'Yaourt nature & fruit',
        description: '1 yaourt nature, 1 fruit de saison.',
        pourquoi: 'Un vrai en-cas qui coupe la faim sans casser la journée.',
        kcal: 150, proteinesG: 8, glucidesG: 22, lipidesG: 3,
      },
      {
        nom: 'Bâtonnets de légumes & houmous',
        description: 'Carotte et concombre, 2 c. à s. de houmous.',
        pourquoi: 'Croquant, fibres et bonnes graisses — satiété maligne.',
        kcal: 180, proteinesG: 5, glucidesG: 15, lipidesG: 11,
      },
    ],
  },
  'mieux-manger': {
    'Petit-déjeuner': [
      {
        nom: 'Porridge nature & fruit frais',
        description: "50 g d'avoine, lait ou boisson végétale, 1 fruit coupé.",
        pourquoi: 'Des glucides complets pour une énergie qui dure.',
        kcal: 350, proteinesG: 12, glucidesG: 55, lipidesG: 8,
      },
      {
        nom: 'Pain complet, œuf & orange pressée',
        description: '2 tranches de pain complet, 1 œuf, 1 orange pressée.',
        pourquoi: 'Simple, complet, sans produits ultra-transformés.',
        kcal: 380, proteinesG: 16, glucidesG: 48, lipidesG: 12,
      },
    ],
    Déjeuner: [
      {
        nom: 'Assiette équilibrée maison',
        description: '½ légumes, ¼ protéines (viande, poisson, œufs, légumineuses), ¼ féculents.',
        pourquoi: 'La répartition simple qui couvre tous les besoins.',
        kcal: 500, proteinesG: 30, glucidesG: 50, lipidesG: 16,
      },
      {
        nom: 'Poulet rôti, légumes de saison & riz complet',
        description: '150 g de poulet, légumes de saison, 150 g de riz complet cuit.',
        pourquoi: 'Protéines pour le muscle, fibres pour la digestion.',
        kcal: 550, proteinesG: 38, glucidesG: 55, lipidesG: 14,
      },
      {
        nom: 'Lentilles, riz & salade',
        description: '150 g de lentilles cuites, 120 g de riz, salade croquante.',
        pourquoi: 'Le duo lentilles-riz : protéines végétales complètes.',
        kcal: 520, proteinesG: 22, glucidesG: 80, lipidesG: 8,
      },
    ],
    Dîner: [
      {
        nom: 'Poisson, légumes vapeur & pommes de terre',
        description: '150 g de poisson, légumes vapeur, 180 g de pommes de terre.',
        pourquoi: 'Un dîner doux qui prépare une bonne nuit de récupération.',
        kcal: 450, proteinesG: 32, glucidesG: 45, lipidesG: 12,
      },
      {
        nom: 'Omelette, salade & pain complet',
        description: '2-3 œufs, grande salade, 1 tranche de pain complet.',
        pourquoi: "Rapide, vrai et équilibré — mieux qu'un plat préparé.",
        kcal: 420, proteinesG: 24, glucidesG: 30, lipidesG: 22,
      },
    ],
    Collation: [
      {
        nom: "Fruit & poignée d'amandes",
        description: '1 fruit, 15 amandes.',
        pourquoi: 'Le réflexe simple qui remplace les biscuits.',
        kcal: 200, proteinesG: 5, glucidesG: 22, lipidesG: 10,
      },
      {
        nom: 'Yaourt & carré de chocolat noir',
        description: '1 yaourt nature, 2 carrés de chocolat noir 70 %.',
        pourquoi: 'Le plaisir a sa place — en portion maîtrisée.',
        kcal: 180, proteinesG: 7, glucidesG: 15, lipidesG: 9,
      },
    ],
  },
};

export const MEAL_IDEAS_DISCLAIMER =
  "Des idées pour t'inspirer — adapte à ta faim et à tes besoins ; en cas de doute, consulte un professionnel.";
