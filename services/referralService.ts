
/**
 * NDSA GMBC OS V5 - BLOC MAÎTRE INTÉGRAL (MLM & IA)
 * Version : 5.1 (Optimisation Master 2026)
 * Fondateur : ABADA M. José Gaétan
 */

export const NDSA_CORE_CONFIG = {
    FOUNDER: {
        name: "ABADA M. José Gaétan",
        id: "067-2922111",
        shop: "https://shopneolife.com/startupforworld/shop/atoz"
    },
    ACADEMY_CONTENT: [
        {
            category: "Nutrition",
            title: "Nutrition Cellulaire (NeoLife)",
            description: "La science derrière le SAB et la vitalité cellulaire.",
            lessons: [
                { t: "Le secret du Tre-en-en", d: "Comment fluidifier la membrane cellulaire." },
                { t: "Nourrir la membrane", d: "L'absorption maximale des nutriments." },
                { t: "Vitalité 3-2-1", d: "Le programme complet pour une santé de fer." }
            ]
        },
        {
            category: "Business",
            title: "Réussir le MLM Digital",
            description: "Devenir un pro du réseautage grâce à l'IA.",
            lessons: [
                { t: "Prospection automatique", d: "Laisser José filtrer vos prospects." },
                { t: "Attraction Marketing", d: "Attirer plutôt que chasser." },
                { t: "Duplication d'équipe", d: "Former 1000 personnes avec un clic." }
            ]
        },
        {
            category: "Outils",
            title: "Adoption NDSA OS",
            description: "Maîtriser votre système d'exploitation business.",
            lessons: [
                { t: "Configurer son lien", d: "Générer son lien magique personnel." },
                { t: "Suivi en temps réel", d: "Analyser les clics et conversions." }
            ]
        }
    ]
};

export const getCurrentSponsor = () => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const shop = params.get('shop');

    // Priorité 1: Lien avec shop encodé (lien magique complet)
    if (ref && shop) {
        try {
            const decodedShop = atob(shop);
            if (decodedShop.includes('neolife.com')) {
                return { 
                    id: ref, 
                    shop: decodedShop, 
                    name: `Leader ${ref}`,
                    isReferral: true 
                };
            }
        } catch (e) {
            console.warn("Lien mal formé, analyse du ref simple.");
        }
    }

    // Priorité 2: Lien simple avec ref (parrainage direct)
    if (ref && ref !== NDSA_CORE_CONFIG.FOUNDER.id) {
        return {
            id: ref,
            shop: `https://shopneolife.com/startupforworld/shop/atoz?id=${ref}`,
            name: `Leader ${ref}`,
            isReferral: true
        };
    }

    // Priorité 3: Hash ref (fallback)
    const hashRef = window.location.hash.split('ref=')[1]?.split('&')[0];
    if (hashRef && hashRef !== NDSA_CORE_CONFIG.FOUNDER.id) {
        return {
            id: hashRef,
            shop: `https://shopneolife.com/startupforworld/shop/atoz?id=${hashRef}`,
            name: `Leader ${hashRef}`,
            isReferral: true
        };
    }

    // Par défaut: Fondateur
    return { 
        ...NDSA_CORE_CONFIG.FOUNDER, 
        isFounder: true,
        isReferral: false
    };
};

export const getAIPrompt = (visitorFirstName: string = "mon ami") => {
    const sponsor = getCurrentSponsor();
    
    return `
    IDENTITÉ : Tu es JOSÉ, un humain virtuel ultra-sympathique et expert en succès.
    TON TON : Chaleureux, enthousiaste, rassurant. Tu es un mentor bienveillant.
    
    MISSIONS DE CONVERSATION :
    1. ACCUEIL : "Bonjour ${visitorFirstName} ! Je suis José, ton assistant personnel chez NDSA. Je suis ravi de t'accueillir ! ✨"
    2. VALEUR : "Cette application est ton OS de liberté. Elle gère ton business NeoLife pendant que tu profites de la vie."
    3. PRODUIT : "Ici, nous parlons de Nutrition Cellulaire. On aide tes cellules à vibrer d'énergie grâce au Tre-en-en et aux solutions du SAB. 🌱"
    4. CLOSING : "Si tu veux booster ta santé ou tes revenus, j'ai préparé ta porte d'entrée ici : ${sponsor.shop}"
    
    STYLE : Utilise des emojis, sois bref mais percutant. Ne sois jamais un robot froid.
    `;
};

export const createMagicLink = (userId: string, userShop?: string) => {
    const base = window.location.origin;
    
    // Lien simple avec ref (recommandé)
    if (!userShop) {
        return `${base}?ref=${userId}`;
    }
    
    // Lien complet avec shop encodé (pour compatibilité)
    const cleanShop = userShop.trim();
    const encodedShop = btoa(cleanShop); 
    return `${base}?ref=${userId}&shop=${encodedShop}&mode=welcome`;
};

// Nouvelle fonction pour créer des liens prospects
export const createProspectLink = (sellerId: string, prospectId: string) => {
    const base = window.location.origin;
    return `${base}?prospect=${prospectId}&ref=${sellerId}`;
};

// Fonction pour valider un ID NeoLife
export const validateNeoLifeId = (id: string): boolean => {
    // Format attendu: XXX-XXXXXXX (3 chiffres, tiret, 7 chiffres)
    const pattern = /^\d{3}-\d{7}$/;
    return pattern.test(id);
};
