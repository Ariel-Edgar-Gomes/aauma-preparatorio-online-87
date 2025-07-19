import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  Edit, 
  Trash2, 
  User,
  Calendar,
  RefreshCw
} from "lucide-react";
import { useAuditData, AuditLog } from "@/hooks/useAuditData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AuditLogsListProps {
  selectedUserId?: string;
}

export const AuditLogsList: React.FC<AuditLogsListProps> = ({ selectedUserId }) => {
  const { auditLogs, loading, fetchAuditLogs } = useAuditData();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchAuditLogs(100, selectedUserId);
  }, [selectedUserId]);

  const handleRefresh = () => {
    fetchAuditLogs(100, selectedUserId);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT': return <Badge variant="default" className="bg-green-500">Criação</Badge>;
      case 'UPDATE': return <Badge variant="default" className="bg-blue-500">Edição</Badge>;
      case 'DELETE': return <Badge variant="destructive">Exclusão</Badge>;
      default: return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getTableDisplayName = (tableName: string) => {
    switch (tableName) {
      case 'alunos': return 'Alunos';
      case 'user_roles': return 'Privilégios';
      case 'profiles': return 'Usuários';
      case 'turmas': return 'Turmas';
      case 'turma_pairs': return 'Pares de Turmas';
      case 'cursos': return 'Cursos';
      case 'salas': return 'Salas';
      case 'horarios': return 'Horários';
      default: return tableName;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesTable = tableFilter === 'all' || log.table_name === tableFilter;
    
    return matchesSearch && matchesAction && matchesTable;
  });

  const uniqueTables = [...new Set(auditLogs.map(log => log.table_name))];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Auditoria
          </CardTitle>
          <CardDescription>
            Filtre os logs de auditoria por usuário, ação ou tabela
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por usuário, email ou tabela..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="INSERT">Criação</SelectItem>
                <SelectItem value="UPDATE">Edição</SelectItem>
                <SelectItem value="DELETE">Exclusão</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tabelas</SelectItem>
                {uniqueTables.map(table => (
                  <SelectItem key={table} value={table}>
                    {getTableDisplayName(table)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Logs de Auditoria ({filteredLogs.length})
          </CardTitle>
          <CardDescription>
            Histórico detalhado de todas as ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {log.user?.full_name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.user?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        {getActionBadge(log.action)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTableDisplayName(log.table_name)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(log.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Ação de Auditoria</DialogTitle>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">Usuário</h4>
                                  <p>{selectedLog.user?.full_name}</p>
                                  <p className="text-sm text-gray-500">{selectedLog.user?.email}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">Ação</h4>
                                  <div className="flex items-center gap-2">
                                    {getActionIcon(selectedLog.action)}
                                    {getActionBadge(selectedLog.action)}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">Tabela</h4>
                                  <Badge variant="outline">
                                    {getTableDisplayName(selectedLog.table_name)}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">Data/Hora</h4>
                                  <p>{new Date(selectedLog.created_at).toLocaleString('pt-PT')}</p>
                                </div>
                              </div>
                              
                              {selectedLog.old_values && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Valores Anteriores</h4>
                                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(selectedLog.old_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              {selectedLog.new_values && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Valores Novos</h4>
                                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(selectedLog.new_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredLogs.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Nenhum log de auditoria encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};