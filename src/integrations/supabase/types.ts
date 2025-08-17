export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ajustes_financeiros: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          tipo: string
          turma_pair_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          tipo: string
          turma_pair_id?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          tipo?: string
          turma_pair_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "ajustes_financeiros_turma_pair_id_fkey"
            columns: ["turma_pair_id"]
            isOneToOne: false
            referencedRelation: "turma_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos: {
        Row: {
          comprovativo_pagamento_url: string | null
          copia_bi_url: string | null
          created_at: string
          created_by: string | null
          curso_codigo: string
          data_inicio: string
          data_inscricao: string
          data_nascimento: string | null
          declaracao_certificado_url: string | null
          duracao: string
          email: string | null
          endereco: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento_type"]
          foto_url: string | null
          id: string
          nome: string
          numero_bi: string
          numero_estudante: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["status_aluno_type"]
          telefone: string
          turma_id: string
          turma_pair_id: string
          turno: string
          updated_at: string
          valor_pago: number
        }
        Insert: {
          comprovativo_pagamento_url?: string | null
          copia_bi_url?: string | null
          created_at?: string
          created_by?: string | null
          curso_codigo: string
          data_inicio: string
          data_inscricao?: string
          data_nascimento?: string | null
          declaracao_certificado_url?: string | null
          duracao?: string
          email?: string | null
          endereco?: string | null
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento_type"]
          foto_url?: string | null
          id?: string
          nome: string
          numero_bi: string
          numero_estudante?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_aluno_type"]
          telefone: string
          turma_id: string
          turma_pair_id: string
          turno: string
          updated_at?: string
          valor_pago?: number
        }
        Update: {
          comprovativo_pagamento_url?: string | null
          copia_bi_url?: string | null
          created_at?: string
          created_by?: string | null
          curso_codigo?: string
          data_inicio?: string
          data_inscricao?: string
          data_nascimento?: string | null
          declaracao_certificado_url?: string | null
          duracao?: string
          email?: string | null
          endereco?: string | null
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento_type"]
          foto_url?: string | null
          id?: string
          nome?: string
          numero_bi?: string
          numero_estudante?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_aluno_type"]
          telefone?: string
          turma_id?: string
          turma_pair_id?: string
          turno?: string
          updated_at?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_turma_pair_id_fkey"
            columns: ["turma_pair_id"]
            isOneToOne: false
            referencedRelation: "turma_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          resource_type: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          resource_type?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          resource_type?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
          view_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          view_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          view_type?: string
        }
        Relationships: []
      }
      bd_ativo: {
        Row: {
          created_at: string | null
          id: number
          num: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          num: number
        }
        Update: {
          created_at?: string | null
          id?: number
          num?: number
        }
        Relationships: []
      }
      cursos: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          disciplinas: string[]
          grupo_cursos: Database["public"]["Enums"]["grupo_cursos_type"]
          horario_semanal: Json
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          disciplinas?: string[]
          grupo_cursos: Database["public"]["Enums"]["grupo_cursos_type"]
          horario_semanal?: Json
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          disciplinas?: string[]
          grupo_cursos?: Database["public"]["Enums"]["grupo_cursos_type"]
          horario_semanal?: Json
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      horarios: {
        Row: {
          created_at: string
          curso_codigo: string
          dia_semana: string
          disciplina: string
          horario_fim: string
          horario_inicio: string
          id: string
          periodo: Database["public"]["Enums"]["periodo_type"]
          professor: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_codigo: string
          dia_semana: string
          disciplina: string
          horario_fim: string
          horario_inicio: string
          id?: string
          periodo: Database["public"]["Enums"]["periodo_type"]
          professor?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_codigo?: string
          dia_semana?: string
          disciplina?: string
          horario_fim?: string
          horario_inicio?: string
          id?: string
          periodo?: Database["public"]["Enums"]["periodo_type"]
          professor?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      salas: {
        Row: {
          ativo: boolean
          capacidade: number
          codigo: string
          created_at: string
          id: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          capacidade?: number
          codigo: string
          created_at?: string
          id?: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          capacidade?: number
          codigo?: string
          created_at?: string
          id?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      turma_pairs: {
        Row: {
          ativo: boolean
          created_at: string
          cursos: string[]
          disciplinas_comuns: string[]
          horario_periodo: string
          horario_semanal: Json
          id: string
          nome: string
          periodo: Database["public"]["Enums"]["periodo_type"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          cursos?: string[]
          disciplinas_comuns?: string[]
          horario_periodo: string
          horario_semanal?: Json
          id?: string
          nome: string
          periodo: Database["public"]["Enums"]["periodo_type"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          cursos?: string[]
          disciplinas_comuns?: string[]
          horario_periodo?: string
          horario_semanal?: Json
          id?: string
          nome?: string
          periodo?: Database["public"]["Enums"]["periodo_type"]
          updated_at?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          alunos_inscritos: number
          capacidade: number
          created_at: string
          horario_semanal: Json
          id: string
          sala_id: string
          tipo: string
          turma_pair_id: string
          updated_at: string
        }
        Insert: {
          alunos_inscritos?: number
          capacidade?: number
          created_at?: string
          horario_semanal?: Json
          id?: string
          sala_id: string
          tipo: string
          turma_pair_id: string
          updated_at?: string
        }
        Update: {
          alunos_inscritos?: number
          capacidade?: number
          created_at?: string
          horario_semanal?: Json
          id?: string
          sala_id?: string
          tipo?: string
          turma_pair_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_turma_pair_id_fkey"
            columns: ["turma_pair_id"]
            isOneToOne: false
            referencedRelation: "turma_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_audit_stats: {
        Args: { target_user_id?: string }
        Returns: {
          alunos_created: number
          alunos_deleted: number
          alunos_updated: number
          last_activity: string
          role_changes: number
          total_actions: number
          total_views: number
          user_email: string
          user_id: string
          user_name: string
          users_created: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_view_audit: {
        Args: {
          p_ip_address?: unknown
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_user_agent?: string
          p_view_type: string
        }
        Returns: string
      }
      manter_bd_ativo: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "inscricao_simples"
        | "inscricao_completa"
        | "visualizador"
        | "financeiro"
        | "gestor_turmas"
      forma_pagamento_type: "Cash" | "Transferencia" | "Cartao"
      grupo_cursos_type: "engenharias" | "saude" | "ciencias-sociais-humanas"
      periodo_type: "manha" | "tarde"
      status_aluno_type: "inscrito" | "confirmado" | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "inscricao_simples",
        "inscricao_completa",
        "visualizador",
        "financeiro",
        "gestor_turmas",
      ],
      forma_pagamento_type: ["Cash", "Transferencia", "Cartao"],
      grupo_cursos_type: ["engenharias", "saude", "ciencias-sociais-humanas"],
      periodo_type: ["manha", "tarde"],
      status_aluno_type: ["inscrito", "confirmado", "cancelado"],
    },
  },
} as const
