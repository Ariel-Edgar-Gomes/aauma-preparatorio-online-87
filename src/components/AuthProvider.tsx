import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'inscricao_simples' | 'inscricao_completa' | 'visualizador' | 'financeiro' | 'gestor_turmas';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  canAccess: (permission: string) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data?.map(r => r.role as UserRole) || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id).then(setRoles);
          }, 0);
        } else {
          setRoles([]);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoles(session.user.id).then(setRoles);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return roles.includes('admin');
  };

  const canAccess = (permission: string): boolean => {
    if (isAdmin()) return true;
    
    const permissions: Record<string, UserRole[]> = {
      'inscricao': ['inscricao_simples', 'inscricao_completa'],
      'edit_alunos': ['inscricao_completa'],
      'view_financeiro': ['financeiro', 'visualizador', 'inscricao_completa'],
      'manage_turmas': ['gestor_turmas'],
      'view_data': ['visualizador', 'financeiro', 'inscricao_simples', 'inscricao_completa', 'gestor_turmas']
    };
    
    const requiredRoles = permissions[permission] || [];
    return requiredRoles.some(role => hasRole(role));
  };

  const signOut = async () => {
    setRoles([]);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    roles,
    hasRole,
    isAdmin,
    canAccess,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};