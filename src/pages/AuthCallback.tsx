import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user && profile) {
        // Usuário confirmou email e tem perfil
        if (profile.registration_flow === 'inaugural') {
          if (profile.onboarding_completed === false) {
            // Primeiro acesso após confirmação de email
            navigate('/inaugural-class', { replace: true });
          } else {
            // Já completou o onboarding
            navigate('/inaugural-dashboard', { replace: true });
          }
        } else {
          // Outros tipos de usuário
          navigate('/', { replace: true });
        }
      } else if (!user) {
        // Não logado ou erro na confirmação
        navigate('/login?error=confirmation', { replace: true });
      }
    }
  }, [user, profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Confirmando sua conta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <p className="text-foreground text-lg">Redirecionando...</p>
      </div>
    </div>
  );
};

export default AuthCallback;