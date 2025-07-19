import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserIcon, BookIcon, CreditCardIcon, EditIcon, Eye, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog } from '@/hooks/useAuditData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserDetailedAuditReportProps {
  userId: string;
  userName: string;
}

interface AlunoCreatedData {
  id: string;
  nome: string;
  email: string;
  numero_estudante: string;
  created_at: string;
  valor_pago: number;
  status: string;
  curso_codigo: string;
}

interface PaymentHistory {
  id: string;
  aluno_nome: string;
  old_value: number;
  new_value: number;
  created_at: string;
}

interface EditHistory {
  id: string;
  aluno_nome: string;
  changes: any;
  created_at: string;
}

export const UserDetailedAuditReport: React.FC<UserDetailedAuditReportProps> = ({
  userId,
  userName
}) => {
  const [alunosCreated, setAlunosCreated] = useState<AlunoCreatedData[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserDetailedData();
  }, [userId]);

  const fetchUserDetailedData = async () => {
    try {
      setLoading(true);

      // Buscar alunos criados por este usuário
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('action', 'INSERT')
        .eq('table_name', 'alunos')
        .order('created_at', { ascending: false });

      if (auditLogs) {
        const alunosData = auditLogs.map(log => {
          const newValues = log.new_values as any;
          return {
            id: log.record_id,
            nome: newValues?.nome || 'N/A',
            email: newValues?.email || 'N/A',
            numero_estudante: newValues?.numero_estudante || 'N/A',
            created_at: log.created_at,
            valor_pago: newValues?.valor_pago || 0,
            status: newValues?.status || 'N/A',
            curso_codigo: newValues?.curso_codigo || 'N/A'
          };
        });
        setAlunosCreated(alunosData);
      }

      // Buscar histórico de pagamentos (atualizações de valor_pago)
      const { data: paymentLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('action', 'UPDATE')
        .eq('table_name', 'alunos')
        .order('created_at', { ascending: false });

      if (paymentLogs) {
        const payments = paymentLogs
          .filter(log => {
            const oldValues = log.old_values as any;
            const newValues = log.new_values as any;
            return oldValues?.valor_pago !== newValues?.valor_pago;
          })
          .map(log => {
            const oldValues = log.old_values as any;
            const newValues = log.new_values as any;
            return {
              id: log.record_id,
              aluno_nome: newValues?.nome || 'N/A',
              old_value: oldValues?.valor_pago || 0,
              new_value: newValues?.valor_pago || 0,
              created_at: log.created_at
            };
          });
        setPaymentHistory(payments);
      }

      // Buscar histórico de edições (excluindo apenas mudanças de pagamento)
      if (paymentLogs) {
        const edits = paymentLogs
          .filter(log => {
            const changes = getChanges(log.old_values, log.new_values);
            return Object.keys(changes).length > 0;
          })
          .map(log => {
            const newValues = log.new_values as any;
            return {
              id: log.record_id,
              aluno_nome: newValues?.nome || 'N/A',
              changes: getChanges(log.old_values, log.new_values),
              created_at: log.created_at
            };
          });
        setEditHistory(edits);
      }

    } catch (error) {
      console.error('Erro ao buscar dados detalhados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChanges = (oldValues: any, newValues: any) => {
    const changes: any = {};
    if (!oldValues || !newValues) return changes;

    Object.keys(newValues).forEach(key => {
      if (oldValues[key] !== newValues[key] && key !== 'updated_at') {
        changes[key] = {
          from: oldValues[key],
          to: newValues[key]
        };
      }
    });

    return changes;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Relatório Detalhado: {userName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{alunosCreated.length}</div>
              <div className="text-sm text-muted-foreground">Alunos Criados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{paymentHistory.length}</div>
              <div className="text-sm text-muted-foreground">Pagamentos Processados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{editHistory.length}</div>
              <div className="text-sm text-muted-foreground">Edições Realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(paymentHistory.reduce((sum, p) => sum + p.new_value, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Processado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="alunos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alunos" className="flex items-center gap-2">
            <BookIcon className="h-4 w-4" />
            Alunos Criados
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="edicoes" className="flex items-center gap-2">
            <EditIcon className="h-4 w-4" />
            Edições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alunos" className="space-y-4">
          {alunosCreated.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhum aluno criado por este usuário
              </CardContent>
            </Card>
          ) : (
            alunosCreated.map((aluno) => (
              <Card key={aluno.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{aluno.nome}</h3>
                      <p className="text-sm text-muted-foreground">{aluno.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Nº: {aluno.numero_estudante} | Curso: {aluno.curso_codigo}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={aluno.status === 'confirmado' ? 'default' : 'secondary'}>
                        {aluno.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(aluno.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(aluno.valor_pago)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-4">
          {paymentHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhum pagamento processado por este usuário
              </CardContent>
            </Card>
          ) : (
            paymentHistory.map((payment, index) => (
              <Card key={`${payment.id}-${index}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{payment.aluno_nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600">
                          {formatCurrency(payment.old_value)}
                        </span>
                        <span>→</span>
                        <span className="text-sm text-green-600 font-medium">
                          {formatCurrency(payment.new_value)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="edicoes" className="space-y-4">
          {editHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma edição realizada por este usuário
              </CardContent>
            </Card>
          ) : (
            editHistory.map((edit, index) => (
              <Card key={`${edit.id}-${index}`}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{edit.aluno_nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(edit.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(edit.changes).map(([field, change]: [string, any]) => (
                        <div key={field} className="text-sm">
                          <span className="font-medium">{field}:</span>
                          <span className="text-red-600 ml-2">{String(change.from)}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">{String(change.to)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};