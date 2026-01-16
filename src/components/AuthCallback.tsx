import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=callback_error');
        return;
      }

      if (data.session) {
        // User is confirmed and logged in
        navigate('/');
      } else {
        navigate('/auth?message=email_confirmed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1418]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4ff] mx-auto mb-4"></div>
        <p className="text-white">Confirmation en cours...</p>
      </div>
    </div>
  );
};
