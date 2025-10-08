import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectPath = '/login' 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Enquanto carrega, exibe loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderiza o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;