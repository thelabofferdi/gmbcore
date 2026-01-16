import React from 'react';
import { ExternalLink, ShoppingCart } from 'lucide-react';

interface ProductRecommendationProps {
  recommendation: {
    product: string;
    sku: string;
    dosage: string;
    reason: string;
    price: number;
    order_url: string;
  };
  sellerId: string;
}

export const ProductRecommendation: React.FC<ProductRecommendationProps> = ({ 
  recommendation, 
  sellerId 
}) => {
  const handleOrderClick = () => {
    // Tracking de clic pour analytics
    console.log(`Order clicked: ${recommendation.sku} by seller ${sellerId}`);
    window.open(recommendation.order_url, '_blank');
  };

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-white font-bold">{recommendation.product}</h4>
        <span className="text-emerald-400 font-bold">${recommendation.price}</span>
      </div>
      
      <p className="text-slate-400 text-sm mb-2">{recommendation.reason}</p>
      <p className="text-[#00d4ff] text-xs mb-3">Dosage: {recommendation.dosage}</p>
      
      <button
        onClick={handleOrderClick}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <ShoppingCart size={16} />
        Commander via {sellerId}
        <ExternalLink size={14} />
      </button>
    </div>
  );
};
