import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
// Importação PADRÃO correta (sem chaves), como o editor sugeriu.
import supabase from '@/lib/supabaseClient';

// A interface que define o "contrato" do nosso contexto
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
  isLoading: boolean;
  signUp: (email: string, password: string, options?: { data: { [key: string]: any } }) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (profileData: any) => Promise<{ error: any }>;
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para facilitar o uso do contexto em outros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// O componente Provedor que encapsula toda a lógica de autenticação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Todos os estados (useState) devem estar no topo da função do componente
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Função para verificar e lidar com novos usuários inaugural
  const checkAndHandleNewInauguralUser = async (user: any, profile: any) => {
    // Verificar se é um usuário com onboarding_completed = false (característico de inaugural)
    if (profile.onboarding_completed === false) {
      // Verificar se não há alunos provisórios associados ao email
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('guardian->>email', user.email)
        .eq('status', 'provisional');

      if (!students || students.length === 0) {
        // Não tem aluno ainda, é inaugural que precisa cadastrar
        // Garantir que o registration_flow está correto
        if (profile.registration_flow !== 'inaugural') {
          await updateProfile({
            registration_flow: 'inaugural'
          });
        }
        navigate('/inaugural-class', { replace: true });
        return;
      } else {
        // Já tem aluno provisório, vai para dashboard inaugural
        navigate('/inaugural-dashboard', { replace: true });
        return;
      }
    }

    // Se onboarding_completed = true ou null, assumir admin
    navigate('/', { replace: true });
  };

  useEffect(() => {
    // Verificação inicial da sessão para remover a tela de loading
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Ouvinte para futuras mudanças de estado (login, logout) com roteamento condicional
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      // Só fazer roteamento automático em eventos específicos de login/logout
      if (event === 'SIGNED_IN' && session?.user) {
        // Se o usuário fez login, buscamos seu perfil na tabela 'profiles'
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('onboarding_completed, registration_flow')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          setProfile(userProfile);

          // LÓGICA DE ROTEAMENTO BASEADA NO REGISTRATION_FLOW
          const onboardingCompleted = userProfile.onboarding_completed;
          const registrationFlow = userProfile.registration_flow;

          if (registrationFlow === 'inaugural') {
            // Usuário responsável (aula inaugural)
            if (onboardingCompleted === false) {
              // Ainda não cadastrou o aluno -> vai para cadastro do aluno
              navigate('/inaugural-class', { replace: true });
            } else {
              // Já cadastrou o aluno -> dashboard inaugural
              navigate('/inaugural-dashboard', { replace: true });
            }
          } else if (registrationFlow === 'enrollment') {
            // Usuário aluno efetivado (matrícula direta) - implementação futura
            navigate('/student-dashboard', { replace: true });
          } else {
            // Para usuários sem registration_flow definido, verificar se podem ser inaugural
            await checkAndHandleNewInauguralUser(session.user, userProfile);
          }
        } else {
          // Se não houver perfil, assumir que é admin e ir para dashboard principal
          navigate('/', { replace: true });
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        navigate('/login', { replace: true });
      }
      // Não fazer roteamento automático para outros eventos (como TOKEN_REFRESHED, INITIAL_SESSION, etc.)

      setIsLoading(false);
    });

    // Limpa o ouvinte quando o componente é desmontado para evitar vazamentos de memória
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Todas as funções de autenticação devem estar dentro do componente para ter acesso a 'user' e 'setUser'
  const signUp = async (email: string, password: string, options?: { data: { [key: string]: any } }) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: options
    });

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const updateProfile = async (profileData: any) => {
    // Assumindo que você terá uma tabela 'profiles' para dados do usuário no futuro
    if (!user) {
      return { error: 'Nenhum usuário logado para atualizar o perfil' };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      // Se o perfil ainda não existir, cria um novo registro
      if (error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ ...profileData, id: user.id }]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return { error: insertError };
        }
        
        // Atualiza o estado do usuário com os novos dados
        setUser({ ...user, ...profileData });
        return { error: null };
      }
      
      console.error('Error updating profile:', error);
      return { error };
    }
    
    // Atualiza o estado do usuário com os novos dados
    setUser(data as User);
    
    return { error: null };
  };

  // O objeto de valor que será compartilhado via contexto
  const value = {
    user,
    session,
    profile,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile
  };

  // O retorno do JSX que provê o contexto para os componentes filhos
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}; // <--- Este é o único e correto fecha-chaves que finaliza o componente AuthProvider.