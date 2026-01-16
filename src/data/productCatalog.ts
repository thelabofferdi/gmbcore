export interface Product {
    id: string;
    name: string;
    category: 'base' | 'targeted' | 'weight' | 'home' | 'beauty';
    description: string;
    benefits: string[];
}

// Mapping enrichi pour les produits clés avec vraies descriptions
const ENRICHED_DATA: Record<string, Partial<Product>> = {
    "3145": {
        category: "base",
        description: "Le trio essentiel en sachets pratiques : Tre-en-en + Carotenoid + Omega-3",
        benefits: ["Énergie cellulaire", "Immunité renforcée", "Protection antioxydante complète"]
    },
    "3130": {
        category: "base",
        description: "L'unique supplément au monde à base de lipides et stérols de grains entiers",
        benefits: ["Perméabilité membranaire", "Absorption optimale des nutriments", "Vitalité cellulaire"]
    },
    "3300": {
        category: "base",
        description: "Le premier et le seul supplément de caroténoïdes à base d'aliments complets",
        benefits: ["Immunité boostée de 37% en 20 jours", "Protection antioxydante puissante"]
    },
    "3504": {
        category: "base",
        description: "Huile de poisson ultra-pure avec les 8 oméga-3 essentiels",
        benefits: ["Anti-inflammatoire naturel", "Santé cardiovasculaire", "Fonction cérébrale optimale"]
    },
    "3105": {
        category: "targeted",
        description: "Formule multi-vitaminée complète avec Tre-en-en, sans fer",
        benefits: ["Combat la fatigue chronique", "Récupération métabolique", "Énergie durable"]
    },
    "3405": {
        category: "targeted",
        description: "Magnésium à biodisponibilité maximale",
        benefits: ["Gestion du stress", "Amélioration du sommeil", "Réduction des crampes musculaires"]
    },
    "3524": {
        category: "targeted",
        description: "Probiotiques protégés pour la santé intestinale",
        benefits: ["Digestion optimale", "Réduction des ballonnements", "Équilibre de la flore intestinale"]
    },
    "3665": {
        category: "targeted",
        description: "Toute la puissance de l'ail sans l'haleine",
        benefits: ["Régulation de la tension artérielle", "Renforcement immunitaire naturel"]
    },
    "3505": {
        category: "targeted",
        description: "Glucosamine pour la santé articulaire",
        benefits: ["Soulagement des douleurs articulaires", "Amélioration de la mobilité", "Protection du cartilage"]
    },
    "3430": {
        category: "targeted",
        description: "Support naturel de la glycémie",
        benefits: ["Gestion du sucre sanguin", "Support pour diabétiques", "Équilibre métabolique"]
    },
    "3333": {
        category: "targeted",
        description: "Vitamine C à diffusion lente sur 6 heures",
        benefits: ["Immunité renforcée", "Énergie immédiate", "Protection antioxydante continue"]
    },
    "38043809": {
        category: "weight",
        description: "Shake protéiné complet pour gestion du poids",
        benefits: ["Contrôle de l'appétit", "Nutrition complète", "Perte de poids saine"]
    },
    "3860": {
        category: "targeted",
        description: "Thé énergisant naturel aux extraits de plantes",
        benefits: ["Boost d'énergie naturel", "Métabolisme accéléré", "Concentration améliorée"]
    }
};

export const PRODUCT_CATALOG: Product[] = [
    {
        id: "3602",
        name: "3-Day Detox",
        category: "targeted",
        description: "Programme de détoxification de 3 jours pour nettoyer l'organisme",
        benefits: ["Détoxification rapide", "Regain d'énergie", "Purification du système digestif"]
    },
    {
        id: "3524",
        name: "Acidophilus Plus",
        category: "targeted",
        description: "Probiotiques protégés pour la santé intestinale",
        benefits: ["Digestion optimale", "Réduction des ballonnements", "Équilibre de la flore intestinale"]
    },
    {
        id: "3707",
        name: "All Natural Fiber",
        category: "targeted",
        description: "Fibres naturelles pour la santé digestive",
        benefits: ["Transit régulier", "Satiété prolongée", "Santé intestinale"]
    },
    {
        id: "3332",
        name: "All-C Chewable",
        category: "targeted",
        description: "Vitamine C à croquer pour toute la famille",
        benefits: ["Immunité", "Goût agréable", "Absorption rapide"]
    },
    {
        id: "3006",
        name: "Aloe Vera Plus",
        category: "targeted",
        description: "Aloe vera pur pour la santé digestive",
        benefits: ["Apaisement digestif", "Hydratation interne", "Détoxification douce"]
    },
    {
        id: "3530",
        name: "Betagard",
        category: "targeted",
        description: "Protection cellulaire avancée",
        benefits: ["Antioxydants puissants", "Protection ADN", "Vieillissement cellulaire ralenti"]
    },
    {
        id: "3521",
        name: "Beta-Gest",
        category: "targeted",
        description: "Aide digestive enzymatique",
        benefits: ["Digestion facilitée", "Réduction des inconforts", "Absorption optimale"]
    },
    {
        id: "3280",
        name: "Bio-Tone",
        category: "targeted",
        description: "Tonique énergétique naturel",
        benefits: ["Vitalité accrue", "Résistance au stress", "Endurance améliorée"]
    },
    {
        id: "3300",
        name: "Carotenoid Complex",
        category: "base",
        description: "Le premier et le seul supplément de caroténoïdes à base d'aliments complets",
        benefits: ["Immunité boostée de 37% en 20 jours", "Protection antioxydante puissante"]
    },
    {
        id: "3404",
        name: "Chelated Cal-Mag with 1000 IU Vitamin D",
        category: "targeted",
        description: "Calcium et magnésium chélatés avec vitamine D",
        benefits: ["Santé osseuse", "Fonction musculaire", "Absorption optimale"]
    },
    {
        id: "3523",
        name: "CoQ10 Complex",
        category: "targeted",
        description: "Coenzyme Q10 pour l'énergie mitochondriale",
        benefits: ["Énergie cellulaire", "Santé cardiaque", "Anti-âge"]
    },
    {
        id: "3301",
        name: "Cruciferous Plus",
        category: "targeted",
        description: "Concentré de légumes crucifères",
        benefits: ["Détoxification hépatique", "Protection cellulaire", "Équilibre hormonal"]
    },
    {
        id: "3865",
        name: "Elevate",
        category: "targeted",
        description: "Boisson énergisante nootropique",
        benefits: ["Focus mental", "Énergie propre", "Performance cognitive"]
    },
    {
        id: "3100",
        name: "Formula IV",
        category: "targeted",
        description: "Multi-vitaminé complet",
        benefits: ["Nutrition complète", "Vitalité quotidienne", "Combler les carences"]
    },
    {
        id: "3105",
        name: "Formula IV Plus",
        category: "targeted",
        description: "Formule multi-vitaminée complète avec Tre-en-en, sans fer",
        benefits: ["Combat la fatigue chronique", "Récupération métabolique", "Énergie durable"]
    },
    {
        id: "3505",
        name: "Full Motion",
        category: "targeted",
        description: "Glucosamine pour la santé articulaire",
        benefits: ["Soulagement des douleurs articulaires", "Amélioration de la mobilité", "Protection du cartilage"]
    },
    {
        id: "3665",
        name: "Garlic Allium Complex",
        category: "targeted",
        description: "Toute la puissance de l'ail sans l'haleine",
        benefits: ["Régulation de la tension artérielle", "Renforcement immunitaire naturel"]
    },
    {
        id: "3430",
        name: "Glucose Balance",
        category: "targeted",
        description: "Support naturel de la glycémie",
        benefits: ["Gestion du sucre sanguin", "Support pour diabétiques", "Équilibre métabolique"]
    },
    {
        id: "3405",
        name: "Magnesium Complex",
        category: "targeted",
        description: "Magnésium à biodisponibilité maximale",
        benefits: ["Gestion du stress", "Amélioration du sommeil", "Réduction des crampes musculaires"]
    },
    {
        id: "3625",
        name: "Masculine Herbal Complex",
        category: "targeted",
        description: "Formule pour la vitalité masculine",
        benefits: ["Énergie masculine", "Équilibre hormonal", "Vitalité"]
    },
    {
        id: "3675",
        name: "Mind Enhancement Complex",
        category: "targeted",
        description: "Support cognitif et mémoire",
        benefits: ["Mémoire améliorée", "Concentration", "Clarté mentale"]
    },
    {
        id: "38043809",
        name: "NeoLifeShake",
        category: "weight",
        description: "Shake protéiné complet pour gestion du poids",
        benefits: ["Contrôle de l'appétit", "Nutrition complète", "Perte de poids saine"]
    },
    {
        id: "3860",
        name: "NeoLifeTea",
        category: "targeted",
        description: "Thé énergisant naturel aux extraits de plantes",
        benefits: ["Boost d'énergie naturel", "Métabolisme accéléré", "Concentration améliorée"]
    },
    {
        id: "3504",
        name: "Omega-3 Plus (Salmon Oil Plus)",
        category: "base",
        description: "Huile de poisson ultra-pure avec les 8 oméga-3 essentiels",
        benefits: ["Anti-inflammatoire naturel", "Santé cardiovasculaire", "Fonction cérébrale optimale"]
    },
    {
        id: "3111",
        name: "Performance Pack",
        category: "targeted",
        description: "Pack complet pour sportifs",
        benefits: ["Performance athlétique", "Récupération rapide", "Endurance"]
    },
    {
        id: "3212",
        name: "Performance Protein",
        category: "weight",
        description: "Protéine de haute qualité pour sportifs",
        benefits: ["Construction musculaire", "Récupération", "Performance"]
    },
    {
        id: "3309",
        name: "PhytoDefense",
        category: "targeted",
        description: "Défense immunitaire aux phytonutriments",
        benefits: ["Immunité renforcée", "Protection cellulaire", "Antioxydants"]
    },
    {
        id: "3145",
        name: "Pro Vitality",
        category: "base",
        description: "Le trio essentiel en sachets pratiques : Tre-en-en + Carotenoid + Omega-3",
        benefits: ["Énergie cellulaire", "Immunité renforcée", "Protection antioxydante complète"]
    },
    {
        id: "3110",
        name: "Stress Pack",
        category: "targeted",
        description: "Formule anti-stress complète",
        benefits: ["Gestion du stress", "Calme mental", "Équilibre nerveux"]
    },
    {
        id: "3321",
        name: "Super B",
        category: "targeted",
        description: "Complexe B à libération contrôlée",
        benefits: ["Énergie mentale", "Métabolisme", "Système nerveux"]
    },
    {
        id: "3333",
        name: "Super C",
        category: "targeted",
        description: "Vitamine C à diffusion lente sur 6 heures",
        benefits: ["Immunité renforcée", "Énergie immédiate", "Protection antioxydante continue"]
    },
    {
        id: "3130",
        name: "Tre-en-en",
        category: "base",
        description: "L'unique supplément au monde à base de lipides et stérols de grains entiers",
        benefits: ["Perméabilité membranaire", "Absorption optimale des nutriments", "Vitalité cellulaire"]
    },
    {
        id: "3216",
        name: "UPBEET",
        category: "targeted",
        description: "Boost d'oxyde nitrique à base de betterave",
        benefits: ["Circulation sanguine", "Endurance", "Performance cardiovasculaire"]
    },
    {
        id: "3335",
        name: "Vegan D",
        category: "targeted",
        description: "Vitamine D végane",
        benefits: ["Santé osseuse", "Immunité", "Humeur"]
    },
    {
        id: "3125",
        name: "Vita-Gard",
        category: "targeted",
        description: "Protection antioxydante avancée",
        benefits: ["Anti-âge", "Protection cellulaire", "Vitalité"]
    },
    {
        id: "3310",
        name: "Vitamin A",
        category: "targeted",
        description: "Vitamine A pour la vision et l'immunité",
        benefits: ["Santé oculaire", "Peau saine", "Immunité"]
    },
    {
        id: "3340",
        name: "Vitamin E Plus",
        category: "targeted",
        description: "Vitamine E naturelle à haute puissance",
        benefits: ["Antioxydant puissant", "Santé cardiovasculaire", "Protection cellulaire"]
    }
];

export const getProductLink = (sku: string, webAlias: string) => {
    return `https://shopneolife.com/${webAlias}/shop/product/${sku}`;
};

export const getShopLink = (webAlias: string) => {
    return `https://shopneolife.com/${webAlias}/shop/atoz`;
};

// Fonction helper pour trouver un produit par ID
export const findProductById = (id: string): Product | undefined => {
    return PRODUCT_CATALOG.find(p => p.id === id);
};

// Fonction helper pour trouver des produits par catégorie
export const findProductsByCategory = (category: Product['category']): Product[] => {
    return PRODUCT_CATALOG.filter(p => p.category === category);
};
