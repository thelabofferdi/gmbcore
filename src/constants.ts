
import { PricingZone, Language } from './types/types';

export const I18N = {
  fr: {
    dashboard: "Cockpit de Direction",
    jose: "Coach JOSÉ AI",
    academy: "Academy Leadership",
    social: "Social Sync Engine",
    finance: "Flux & Commissions",
    admin: "Master Console",
    welcome: "Bonjour. Je suis Coach JOSÉ.",
    cta_health: "Diagnostic Santé",
    cta_business: "Startup Business",
    status_stable: "Bio-Sync : Stable",
    propulsion: "Propulser Success",
    medical_scan: "Bio-Scan Médical",
    analyzing: "Analyse des données cliniques...",
    report_ready: "Rapport de Restauration Prêt",
    legal_title: "Conformité & Protection Juridique",
    legal_accept: "Accepter les Protocoles de Sécurité",
    legal_disclaimer: "L'IA José ne remplace pas votre médecin. AXIOMA OS est une plateforme d'aide à la décision nutritionnelle. Les données sont traitées localement pour votre confidentialité."
  },
  en: {
    dashboard: "Command Cockpit",
    jose: "AI Coach JOSÉ",
    academy: "Leadership Academy",
    social: "Social Sync Engine",
    finance: "Flows & Commissions",
    admin: "Master Console",
    welcome: "Hello. I am Coach JOSÉ.",
    cta_health: "Health Diagnostic",
    cta_business: "Business Startup",
    status_stable: "Bio-Sync: Stable",
    propulsion: "Push Success",
    medical_scan: "Medical Bio-Scan",
    analyzing: "Analyzing clinical data...",
    report_ready: "Restoration Report Ready",
    legal_title: "Legal Compliance & Protection",
    legal_accept: "Accept Security Protocols",
    legal_disclaimer: "AI José does not replace your doctor. AXIOMA OS is a nutritional decision support platform. Data is processed locally for your privacy."
  },
  it: {
    dashboard: "Cabina di Comando",
    jose: "Coach JOSÉ AI",
    academy: "Academy Leadership",
    social: "Motore Social Sync",
    finance: "Flussi e Commissioni",
    admin: "Master Console",
    welcome: "Buongiorno. Sono il Coach JOSÉ.",
    cta_health: "Diagnosi Salute",
    cta_business: "Startup Business",
    status_stable: "Bio-Sync: Stabile",
    propulsion: "Propulsa Successo",
    medical_scan: "Bio-Scan Medico",
    analyzing: "Analisi dati clinici...",
    report_ready: "Rapporto Restauro Pronto",
    legal_title: "Conformità Legale",
    legal_accept: "Accetta Protocolli di Sicurezza",
    legal_disclaimer: "AXIOMA OS è una piattaforma di supporto nutrizionale. L'IA José non è un medico certificato."
  },
  es: {
    dashboard: "Cabina de Mando",
    jose: "Coach JOSÉ AI",
    academy: "Academy Leadership",
    social: "Motor Social Sync",
    finance: "Flujos y Comisiones",
    admin: "Consola Maestra",
    welcome: "Hola. Soy el Coach JOSÉ.",
    cta_health: "Diagnóstico de Salud",
    cta_business: "Startup de Negocios",
    status_stable: "Bio-Sync: Estable",
    propulsion: "Propulsar Éxito",
    medical_scan: "Bio-Scan Médico",
    analyzing: "Analizando datos clínicos...",
    report_ready: "Informe de Restauración Listo",
    legal_title: "Cumplimiento Legal",
    legal_accept: "Aceptar Protocolos",
    legal_disclaimer: "AXIOMA OS es una plataforma de apoyo nutricional. IA José no es un médico."
  }
};

export const SYSTEM_CONFIG = {
  brand: "NDSA GMBC OS",
  version: "6.5.0-IMPERIUM",
  founder: {
    name: "ABADA M. José Gaétan",
    id: "067-2922111",
    webAlias: "startupforworld",
    officialShopUrl: "https://shopneolife.com/startupforworld/shop/products",
    status: "Fondateur Visionnaire"
  },
  legal: {
    tos_url: "https://axioma-os.com/terms",
    privacy_url: "https://axioma-os.com/privacy",
    medical_disclaimer: "ATTENTION : JOSÉ est une IA d'analyse de données. En aucun cas ses rapports ne constituent une prescription médicale officielle."
  },
  ai: {
    name: "Coach José",
    role: "Expert en Nutrition Cellulaire & Psychiatrie Cellulaire",
    business_mentor: {
      name: "The Master Mentor",
      role: "Conférencier International & Expert en Leadership MLM",
      specialty: "Duplication Massive & Psychologie de la Vente Directe"
    },
    professor: {
      name: "Pr. NDSA",
      role: "Tuteur IA Bio-Sync V4",
      philosophy: "Maïeutique digitale et validation des acquis par l'expérience."
    },
    disclaimer: "⚠️ Je suis Coach José. Je décode vos bio-données. Consultez toujours un médecin pour un avis clinique officiel."
  },
  ui: {
    backgroundGradient: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
    primaryColor: "#00d4ff",
    accentColor: "#fbbf24"
  },
  billing: {
    pricing: {
      [PricingZone.AFRICA]: { amount: 10, currency: "USD", label: "Plan Émergence" },
      [PricingZone.EUROPE]: { amount: 15, currency: "EUR", label: "Plan Excellence" },
      [PricingZone.GLOBAL]: { amount: 20, currency: "USD", label: "Plan Empire" }
    }
  },
  academy: {
    modules: [
      {
        id: "m1-bio-restauration",
        title: "Restauration Biologique",
        description: "Les 5 piliers de la revitalisation cellulaire profonde.",
        lessons: [
          {
            id: "CH-01",
            title: "La Révolution Cellulaire",
            content: "Focus : Membrane & Tre-en-en. Certification : Spécialiste en Perméabilité Cellulaire.",
            sections: [
              "La Cellule : L'unité fondamentale du chèque et de la santé.",
              "La Membrane : Pourquoi 90% des compléments finissent aux toilettes sans Tre-en-en.",
              "Fluidité vs Rigidité : L'impact sur l'absorption et l'élimination des toxines.",
              "Validation : Quiz sur le rôle du Tre-en-en."
            ],
            starkInsight: "Si la porte est verrouillée, personne n'entre. Le Tre-en-en est la clé universelle.",
            practicalExercise: "Expliquer le concept de perméabilité à un prospect en 3 images."
          },
          {
            id: "CH-02",
            title: "L'Équilibre Acido-Basique",
            content: "Focus : pH & Terrain. Certification : Expert en Équilibre des Terrains.",
            sections: [
              "Le Terrain : Comprendre pourquoi l'acidité fige le métabolisme.",
              "Acidose : Quand le corps puise ses minéraux dans vos os.",
              "Alcalinisation : Préparer un terrain fertile pour les nutriments.",
              "Validation : Quiz sur l'action du corps en acidose."
            ],
            starkInsight: "On ne plante pas de fleurs dans du goudron. Nettoyez le terrain d'abord.",
            practicalExercise: "Calculer son score d'acidité via le questionnaire JOSÉ."
          },
          {
            id: "CH-03",
            title: "Le Trio de Relance",
            content: "Focus : Synergie des 3 piliers. Certification : Spécialiste en Synergie Nutritionnelle.",
            sections: [
              "Ouvrir : Le rôle de base du Tre-en-en.",
              "Protéger : L'immunité boostée de 37% par le Carotenoid Complex.",
              "Équilibrer : La force des acides gras Omega-3.",
              "Validation : Pourquoi l'action doit être simultanée."
            ],
            starkInsight: "1+1+1 = 10. La synergie NDSA dépasse la simple addition de produits.",
            practicalExercise: "Présenter le pack Trio de Relance."
          }
        ]
      },
      {
        id: "m2-performance-leadership",
        title: "Performance & Leadership",
        description: "Maîtriser l'esprit et la structure pour une duplication massive.",
        lessons: [
          {
            id: "CH-06",
            title: "Performance Cognitive & Stress",
            content: "Focus : Psychiatrie Cellulaire. Certification : Praticien en Performance Cognitive.",
            sections: [
              "Le Cerveau Gras : Pourquoi les lipides sont la clé de l'humeur.",
              "Omega-3 Salmon Oil : Fluidité de la transmission nerveuse.",
              "Gestion du Stress : Calmer l'inflammation neuronale.",
              "Validation : Quiz sur les composants majeurs du cerveau."
            ],
            starkInsight: "Un leader serein décide mieux. Nourrissez vos neurones.",
            practicalExercise: "Test de focus mental pré et post Omega-3."
          }
        ]
      }
    ],
    premiumModules: []
  },
  socialViral: {
    template: "J'utilise NDSA GMBC OS et l'IA JOSÉ pour ma santé cellulaire. Rejoins mon équipe ! 🧬🚀",
    responseScript: "Bonjour ! Utilisez ce lien pour votre diagnostic : ",
    structure: "HOOK / BRIDGE / CTA"
  }
};

// Configuration des voix Gemini TTS
export const VOICES = [
  { id: 'Zephyr', name: 'Sérieux & Calme (H)', description: 'Idéal pour les analyses médicales' },
  { id: 'Kore', name: 'Dynamique (F)', description: 'Idéal pour l\'opportunité business' },
  { id: 'Puck', name: 'Amical (H)', description: 'Approche chaleureuse' },
  { id: 'Charon', name: 'Profond (H)', description: 'Autorité et expertise' }
];
