import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserIcon, BookIcon, CreditCardIcon, EditIcon, Eye, Calendar, Search, Filter, ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [selectedPeriod, setSelectedPeriod] = useState('todos');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filterData = (data: any[], type: string) => {
    let filtered = data;
    
    // Filtro por período
    if (selectedPeriod !== 'todos') {
      const now = new Date();
      let startDate: Date;
      
      switch (selectedPeriod) {
        case '7dias':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30dias':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90dias':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(item => new Date(item.created_at) >= startDate);
    }
    
    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchText = searchTerm.toLowerCase();
        return (
          item.nome?.toLowerCase().includes(searchText) ||
          item.aluno_nome?.toLowerCase().includes(searchText) ||
          item.email?.toLowerCase().includes(searchText) ||
          item.numero_estudante?.toLowerCase().includes(searchText) ||
          item.curso_codigo?.toLowerCase().includes(searchText)
        );
      });
    }
    
    return filtered;
  };

  const getChangeDescription = (field: string, oldValue: any, newValue: any) => {
    const fieldLabels: { [key: string]: string } = {
      nome: 'Nome',
      email: 'Email',
      telefone: 'Telefone',
      endereco: 'Endereço',
      status: 'Status',
      valor_pago: 'Valor Pago',
      data_inicio: 'Data de Início',
      observacoes: 'Observações',
      forma_pagamento: 'Forma de Pagamento'
    };
    
    const label = fieldLabels[field] || field;
    
    if (field === 'valor_pago') {
      return `${label}: ${formatCurrency(oldValue || 0)} → ${formatCurrency(newValue || 0)}`;
    }
    
    return `${label}: "${oldValue || 'vazio'}" → "${newValue || 'vazio'}"`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  };

  // Dados filtrados
  const filteredAlunos = filterData(alunosCreated, 'alunos');
  const filteredPayments = filterData(paymentHistory, 'pagamentos');
  const filteredEdits = filterData(editHistory, 'edicoes');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando dados detalhados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com informações do usuário */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">{userName}</h2>
              <p className="text-sm text-blue-600">Relatório Detalhado de Atividades</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{alunosCreated.length}</div>
              <div className="text-xs text-gray-600">Alunos Inscritos</div>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{paymentHistory.length}</div>
              <div className="text-xs text-gray-600">Pagamentos Processados</div>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{editHistory.length}</div>
              <div className="text-xs text-gray-600">Edições Realizadas</div>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(paymentHistory.reduce((sum, p) => sum + p.new_value, 0))}
              </div>
              <div className="text-xs text-gray-600">Total Processado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email, número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os períodos</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                <SelectItem value="90dias">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedPeriod('todos');
            }}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="alunos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alunos" className="flex items-center gap-2">
            <BookIcon className="h-4 w-4" />
            Alunos Inscritos ({filteredAlunos.length})
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Pagamentos ({filteredPayments.length})
          </TabsTrigger>
          <TabsTrigger value="edicoes" className="flex items-center gap-2">
            <EditIcon className="h-4 w-4" />
            Edições ({filteredEdits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alunos" className="space-y-4">
          {filteredAlunos.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {searchTerm || selectedPeriod !== 'todos' 
                  ? 'Nenhum aluno encontrado com os filtros aplicados'
                  : 'Nenhum aluno criado por este usuário'
                }
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAlunos.map((aluno) => (
                <Card key={aluno.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                            <BookIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{aluno.nome}</h3>
                            <p className="text-sm text-gray-600">{aluno.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <span className="text-xs text-gray-500">Número do Estudante:</span>
                            <p className="font-medium">{aluno.numero_estudante}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Curso:</span>
                            <p className="font-medium">{aluno.curso_codigo}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <Badge 
                          variant={aluno.status === 'confirmado' ? 'default' : 'secondary'}
                          className={aluno.status === 'confirmado' ? 'bg-green-500' : ''}
                        >
                          {aluno.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {format(new Date(aluno.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(aluno.valor_pago)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {searchTerm || selectedPeriod !== 'todos' 
                  ? 'Nenhum pagamento encontrado com os filtros aplicados'
                  : 'Nenhum pagamento processado por este usuário'
                }
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment, index) => (
                <Card key={`${payment.id}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-green-700 p-2 rounded-full">
                          <CreditCardIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{payment.aluno_nome}</h3>
                          <p className="text-sm text-gray-600">
                            {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="text-center">
                            <span className="text-sm text-gray-500">Valor Anterior</span>
                            <p className="text-lg font-medium text-red-600">
                              {formatCurrency(payment.old_value)}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                          <div className="text-center">
                            <span className="text-sm text-gray-500">Novo Valor</span>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(payment.new_value)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Diferença: {formatCurrency(payment.new_value - payment.old_value)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="edicoes" className="space-y-4">
          {filteredEdits.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {searchTerm || selectedPeriod !== 'todos' 
                  ? 'Nenhuma edição encontrada com os filtros aplicados'
                  : 'Nenhuma edição realizada por este usuário'
                }
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEdits.map((edit, index) => (
                <Card key={`${edit.id}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 text-purple-700 p-2 rounded-full">
                            <EditIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{edit.aluno_nome}</h3>
                            <p className="text-sm text-gray-600">
                              {format(new Date(edit.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(`${edit.id}-${index}`)}
                          className="flex items-center gap-1"
                        >
                          {expandedItems.has(`${edit.id}-${index}`) ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Ver Alterações
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {expandedItems.has(`${edit.id}-${index}`) && (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Alterações Realizadas:</h4>
                          {Object.entries(edit.changes).map(([field, change]: [string, any]) => (
                            <div key={field} className="bg-white rounded-md p-2 border-l-4 border-l-blue-400">
                              <div className="text-sm">
                                <span className="font-medium text-blue-700">
                                  {getChangeDescription(field, change.from, change.to)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {Object.keys(edit.changes).length} campo(s) alterado(s)
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};