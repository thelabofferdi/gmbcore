import { neoLifeAPI } from '../src/services/neolifeService';

// Test de l'intégration NeoLife API
export const testNeoLifeIntegration = async () => {
  console.log('🧪 Test NeoLife API Integration...');
  
  try {
    // Test 1: Récupération des produits sans authentification
    console.log('📦 Test 1: Récupération catalogue produits...');
    const products = await neoLifeAPI.getProductsByCategory('NeoLifeClubApp');
    console.log(`✅ ${products.length} produits récupérés:`, products.slice(0, 2));

    // Test 2: Recommandations basées sur biomarqueurs mock
    console.log('🩺 Test 2: Recommandations biomarqueurs...');
    const mockBiomarkers = {
      cholesterol_total_mmol_l: 6.2, // Élevé
      glycemia_mmol_l: 7.1, // Élevé
      hdl_mmol_l: 1.1,
      systolic_bp: 140
    };
    
    const recommendations = neoLifeAPI.getRecommendationsForBiomarkers(mockBiomarkers);
    console.log(`✅ ${recommendations.length} recommandations générées:`, recommendations);

    // Test 3: Vérification structure produit
    console.log('🔍 Test 3: Structure produit...');
    if (products.length > 0) {
      const product = products[0];
      console.log('✅ Structure produit valide:', {
        sku: product.sku,
        title: product.title,
        price: product.member.singles,
        benefits: product.benefits.length
      });
    }

    return {
      success: true,
      productsCount: products.length,
      recommendationsCount: recommendations.length,
      message: 'Intégration NeoLife fonctionnelle'
    };

  } catch (error) {
    console.error('❌ Erreur test NeoLife:', error);
    return {
      success: false,
      error: error.message,
      message: 'Échec test intégration'
    };
  }
};

// Test rapide des recommandations
export const quickRecommendationTest = () => {
  const testCases = [
    { name: 'Cholestérol élevé', biomarkers: { cholesterol_total_mmol_l: 6.5 } },
    { name: 'Diabète', biomarkers: { glycemia_mmol_l: 8.2 } },
    { name: 'Hypertension', biomarkers: { systolic_bp: 160 } },
    { name: 'Normal', biomarkers: { cholesterol_total_mmol_l: 4.5, glycemia_mmol_l: 5.1 } }
  ];

  console.log('🧪 Test rapide recommandations:');
  testCases.forEach(testCase => {
    const recs = neoLifeAPI.getRecommendationsForBiomarkers(testCase.biomarkers);
    console.log(`${testCase.name}: ${recs.length} recommandations`);
  });
};
