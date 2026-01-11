import React, { useState } from 'react';
import { X, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseService';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Nouveau mot de passe</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 px-4 py-3 rounded-2xl text-white outline-none focus:border-[#00d4ff] transition-all"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 px-4 py-3 rounded-2xl text-white outline-none focus:border-[#00d4ff] transition-all"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-rose-500 text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#00d4ff] text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Mise à jour...
              </>
            ) : (
              <>
                <Lock size={16} />
                Mettre à jour
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
