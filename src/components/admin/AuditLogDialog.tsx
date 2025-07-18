
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string;
  user_name: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
}

interface AuditLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuditLogDialog = ({ open, onOpenChange }: AuditLogDialogProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Buscar logs de auditoria
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditError) {
        console.error("Erro ao carregar logs de auditoria:", auditError);
        toast.error("Erro ao carregar logs de auditoria");
        return;
      }

      // Buscar informações dos usuários para os logs que têm user_id
      const userIds = auditData
        ?.filter(log => log.user_id)
        .map(log => log.user_id)
        .filter((value, index, self) => self.indexOf(value) === index) || [];

      let userProfiles: Record<string, { email: string; full_name: string }> = {};

      if (userIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (!profileError && profileData) {
          userProfiles = profileData.reduce((acc, profile) => {
            acc[profile.id] = {
              email: profile.email || 'Email não disponível',
              full_name: profile.full_name || 'Nome não disponível'
            };
            return acc;
          }, {} as Record<string, { email: string; full_name: string }>);
        }
      }

      // Combinar logs com informações dos usuários
      const formattedLogs: AuditLog[] = auditData?.map(log => {
        const userInfo = log.user_id ? userProfiles[log.user_id] : null;
        
        return {
          id: log.id,
          user_id: log.user_id,
          user_email: userInfo?.email || 'Sistema',
          user_name: userInfo?.full_name || 'Sistema',
          action: log.action,
          table_name: log.table_name,
          record_id: log.record_id,
          old_values: log.old_values,
          new_values: log.new_values,
          created_at: log.created_at
        };
      }) || [];

      setLogs(formattedLogs);
    } catch (error: any) {
      console.error("Erro ao carregar logs:", error);
      toast.error("Erro ao carregar logs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAuditLogs();
    }
  }, [open]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'INSERT': return 'Criação';
      case 'UPDATE': return 'Atualização';
      case 'DELETE': return 'Exclusão';
      default: return action;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Log de Auditoria do Sistema</DialogTitle>
          <DialogDescription>
            Histórico de todas as alterações feitas no sistema
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <p className="text-center">Carregando logs...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Registro ID</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{log.user_name}</span>
                        <span className="text-xs text-muted-foreground">{log.user_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.table_name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.record_id ? `${log.record_id.substring(0, 8)}...` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log('Log completo:', log);
                          console.log('Valores antigos:', log.old_values);
                          console.log('Valores novos:', log.new_values);
                          toast.info("Detalhes logados no console");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum log de auditoria encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
