import { supabase } from './supabaseService';

export interface NeoLifeProduct {
  sku: string;
  title: string;
  subtitle: string;
  image: string;
  pv: number;
  bv: number;
  retail: {
    singles: number;
    cases: number;
  };
  member: {
    singles: number;
    cases: number;
  };
  benefits: string[];
  category: string;
  guid: string;
}

export interface ProductRecommendation {
  product: NeoLifeProduct;
  reason: string;
  dosage: string;
  priority: number;
}

class NeoLifeAPIService {
  private baseUrl = 'https://api.neolife.com/v1';
  private session: { uid?: string; usession?: string } = {};

  // Cache des produits pour éviter les appels répétés
  private productsCache: Map<string, NeoLifeProduct[]> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24h

  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        this.session = { uid: data.uid, usession: data.usession };
        return true;
      }
    } catch (error) {
      console.error('NeoLife auth error:', error);
    }
    return false;
  }

  async getProductsByCategory(category: string = 'NeoLifeClubApp'): Promise<NeoLifeProduct[]> {
    const cacheKey = `products_${category}`;
    const cached = this.productsCache.get(cacheKey);
    
    if (cached) return cached;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'localization': 'fr-fr'
      };

      if (this.session.uid && this.session.usession) {
        headers['Authorization'] = `Basic ${btoa(`${this.session.uid}:${this.session.usession}`)}`;
      }

      const response = await fetch(`${this.baseUrl}/shopping/catalog/${category}.json`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        const products = await this.extractProductsFromCategory(data);
        this.productsCache.set(cacheKey, products);
        return products;
      }
    } catch (error) {
      console.error('Error fetching NeoLife products:', error);
    }

    return this.getFallbackProducts();
  }

  private async extractProductsFromCategory(categoryData: any): Promise<NeoLifeProduct[]> {
    const products: NeoLifeProduct[] = [];

    // Extraire les produits directs
    if (categoryData.Products) {
      categoryData.Products.forEach((product: any) => {
        products.push(this.mapToNeoLifeProduct(product, categoryData));
      });
    }

    // Extraire les produits des sous-catégories
    if (categoryData.SubCategories) {
      for (const subCat of categoryData.SubCategories) {
        try {
          const subResponse = await fetch(`https://api.neolife.com${subCat.Url}`);
          if (subResponse.ok) {
            const subData = await subResponse.json();
            if (subData.Products) {
              subData.Products.forEach((product: any) => {
                products.push(this.mapToNeoLifeProduct(product, subData));
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching subcategory ${subCat.Title}:`, error);
        }
      }
    }

    return products;
  }

  // Générer l'URL de commande avec tracking vendeur
  generateOrderUrl(products: string[], sellerId: string, customerInfo?: any): string {
    const baseUrl = 'https://shopneolife.com/startupforworld/shop/atoz';
    const params = new URLSearchParams({
      id: sellerId, // ID du vendeur pour commission
      products: products.join(','),
      source: 'axioma-ai', // Tracking source
      ...(customerInfo && { customer: JSON.stringify(customerInfo) })
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Créer un lien de commande directe depuis les recommandations
  createDirectOrderLink(recommendations: ProductRecommendation[], sellerId: string): string {
    const skus = recommendations.map(rec => rec.product.sku);
    return this.generateOrderUrl(skus, sellerId, {
      recommended_by: 'jose-ai',
      analysis_date: new Date().toISOString()
    });
  }

  private mapToNeoLifeProduct(apiProduct: any, categoryData: any): NeoLifeProduct {
    return {
      sku: apiProduct.SKU,
      title: apiProduct.Title,
      subtitle: apiProduct.Subtitle || '',
      image: apiProduct.Image,
      pv: apiProduct.Pv,
      bv: apiProduct.Bv,
      retail: {
        singles: apiProduct.Retail?.Singles || 0,
        cases: apiProduct.Retail?.Cases || 0
      },
      member: {
        singles: apiProduct.Member?.Singles || 0,
        cases: apiProduct.Member?.Cases || 0
      },
      benefits: this.extractBenefits(categoryData.Details),
      category: categoryData.Title,
      guid: categoryData.Guid || ''
    };
  }

  private extractBenefits(details: any[]): string[] {
    if (!details) return [];
    
    return details
      .filter(detail => detail.Key?.includes('Health') || detail.Key?.includes('Benefits'))
      .map(detail => detail.Expanded?.Body || detail.Html)
      .filter(Boolean);
  }

  // Produits de fallback si l'API n'est pas accessible
  private getFallbackProducts(): NeoLifeProduct[] {
    return [
      {
        sku: '3143',
        title: 'Pro Vitality Plus',
        subtitle: '30 packets',
        image: 'https://s3.amazonaws.com/static.gnld.com/us/category/neolifeclubapp/bestsellers/provitalityplus/landingpage_m.png',
        pv: 34,
        bv: 43,
        retail: { singles: 50.95, cases: 305.7 },
        member: { singles: 43.5, cases: 261 },
        benefits: ['Santé cardiaque et cérébrale', 'Énergie cellulaire', 'Force immunitaire'],
        category: 'Best Sellers',
        guid: 'NeoLifeClubApp/BestSellers/ProVitalityPlus'
      },
      {
        sku: 'TRE001',
        title: 'Tré - Nutritional Essence',
        subtitle: 'Fluidité membranaire',
        image: 'https://s3.amazonaws.com/static.gnld.com/us/category/neolifeclubapp/bestsellers/tre/landingpage_m.png',
        pv: 28,
        bv: 35,
        retail: { singles: 42.95, cases: 257.7 },
        member: { singles: 36.5, cases: 219 },
        benefits: ['Restaure la fluidité membranaire', 'Optimise la nutrition cellulaire'],
        category: 'Best Sellers',
        guid: 'NeoLifeClubApp/BestSellers/Tre'
      }
    ];
  }

  // Recommandations basées sur les biomarqueurs
  getRecommendationsForBiomarkers(biomarkers: any): ProductRecommendation[] {
    const products = this.getFallbackProducts();
    const recommendations: ProductRecommendation[] = [];

    // Logique de recommandation basée sur les biomarqueurs
    if (biomarkers.cholesterol_total_mmol_l > 5.2) {
      recommendations.push({
        product: products.find(p => p.title.includes('Omega')) || products[0],
        reason: 'Cholestérol élevé - Omega-3 pour la santé cardiovasculaire',
        dosage: '2 capsules par jour',
        priority: 1
      });
    }

    if (biomarkers.glycemia_mmol_l > 6.1) {
      recommendations.push({
        product: products.find(p => p.title.includes('Pro Vitality')) || products[0],
        reason: 'Glycémie élevée - Antioxydants pour la régulation métabolique',
        dosage: '1 packet par jour',
        priority: 2
      });
    }

    // Toujours recommander Tré pour la base cellulaire
    recommendations.push({
      product: products.find(p => p.title.includes('Tré')) || products[1],
      reason: 'Base nutritionnelle - Fluidité membranaire optimale',
      dosage: '1 capsule matin et soir',
      priority: 3
    });

    return recommendations.sort((a, b) => a.priority - b.priority);
  }
}

export const neoLifeAPI = new NeoLifeAPIService();

// Fonction utilitaire pour sauvegarder les recommandations
export const saveProductRecommendations = async (
  userId: string,
  clinicalDataId: string,
  recommendations: ProductRecommendation[]
) => {
  try {
    const { error } = await supabase
      .from('clinical_data')
      .update({
        protocol: recommendations.map(rec => ({
          product: rec.product.title,
          sku: rec.product.sku,
          dosage: rec.dosage,
          reason: rec.reason,
          priority: rec.priority,
          price_member: rec.product.member.singles
        }))
      })
      .eq('id', clinicalDataId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving recommendations:', error);
    return false;
  }
};
