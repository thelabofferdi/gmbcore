import React from 'react';
import { Shield, X } from 'lucide-react';

interface ConsentBannerProps {
    onAccept: () => void;
    onDecline: () => void;
    distributorName?: string;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
    onAccept,
    onDecline,
    distributorName = "votre conseiller"
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl border-t-4 border-blue-400 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-6xl mx-auto p-4 md:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <Shield className="w-8 h-8 text-blue-200" />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                            💬 Sauvegarde de Conversation & Suivi Personnalisé
                        </h3>
                        <p className="text-sm text-blue-100 leading-relaxed mb-3">
                            Pour vous offrir un meilleur suivi, {distributorName} souhaite sauvegarder votre conversation avec Coach JOSÉ.
                            Cela lui permettra de :
                        </p>
                        <ul className="text-sm text-blue-100 space-y-1 mb-4 ml-4">
                            <li>✅ Reprendre la conversation où vous l'avez laissée</li>
                            <li>✅ Vous proposer des recommandations personnalisées</li>
                            <li>✅ Vous recontacter avec des conseils adaptés à vos besoins</li>
                        </ul>
                        <p className="text-xs text-blue-200 mb-4">
                            🔒 <strong>Vos données sont protégées</strong> : Seul {distributorName} aura accès à votre historique.
                            Vous pouvez demander la suppression de vos données à tout moment.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={onAccept}
                                className="flex-1 bg-white text-blue-600 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                ✅ J'accepte le suivi personnalisé
                            </button>
                            <button
                                onClick={onDecline}
                                className="flex-1 bg-blue-800 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-900 transition-all border border-blue-600"
                            >
                                ❌ Continuer en mode anonyme
                            </button>
                        </div>

                        <p className="text-[10px] text-blue-300 mt-3">
                            En acceptant, vous consentez au traitement de vos données conformément au RGPD.
                            <a href="/privacy" className="underline ml-1" target="_blank">Politique de confidentialité</a>
                        </p>
                    </div>

                    <button
                        onClick={onDecline}
                        className="flex-shrink-0 p-2 hover:bg-blue-600 rounded-lg transition-colors"
                        aria-label="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
