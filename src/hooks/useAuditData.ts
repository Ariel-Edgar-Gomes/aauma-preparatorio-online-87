import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  resource_type?: string;
  details?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface AuditView {
  id: string;
  user_id: string;
  view_type: string;
  resource_id?: string;
  resource_type?: string;
  metadata: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface UserAuditStats {
  user_id: string;
  user_name: string;
  user_email: string;
  total_actions: number;
  alunos_created: number;
  alunos_updated: number;
  alunos_deleted: number;
  users_created: number;
  role_changes: number;
  last_activity: string;
  total_views: number;
}

export const useAuditData = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditViews, setAuditViews] = useState<AuditView[]>([]);
  const [userStats, setUserStats] = useState<UserAuditStats[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async (limit = 50, userId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setAuditLogs((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditViews = async (limit = 50, userId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setAuditViews((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar visualizações de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAuditStats = async (targetUserId?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_audit_stats', {
        target_user_id: targetUserId || null
      });

      if (error) throw error;

      setUserStats(data || []);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const logViewAudit = async (
    viewType: string,
    resourceId?: string,
    resourceType?: string,
    metadata: any = {}
  ) => {
    try {
      await supabase.rpc('log_view_audit', {
        p_view_type: viewType,
        p_resource_id: resourceId,
        p_resource_type: resourceType,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

  return {
    auditLogs,
    auditViews,
    userStats,
    loading,
    fetchAuditLogs,
    fetchAuditViews,
    fetchUserAuditStats,
    logViewAudit
  };
};