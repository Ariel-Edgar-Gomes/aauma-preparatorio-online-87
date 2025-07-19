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
  Calendar,
  RefreshCw,
  Monitor
} from "lucide-react";
import { useAuditData, AuditView } from "@/hooks/useAuditData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AuditViewsListProps {
  selectedUserId?: string;
}

export const AuditViewsList: React.FC<AuditViewsListProps> = ({ selectedUserId }) => {
  const { auditViews, loading, fetchAuditViews } = useAuditData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewTypeFilter, setViewTypeFilter] = useState('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [selectedView, setSelectedView] = useState<AuditView | null>(null);

  useEffect(() => {
    fetchAuditViews(100, selectedUserId);
  }, [selectedUserId]);

  const handleRefresh = () => {
    fetchAuditViews(100, selectedUserId);
  };

  const getViewTypeDisplayName = (viewType: string) => {
    const mapping: { [key: string]: string } = {
      'aluno_list': 'Lista de Alunos',
      'aluno_detail': 'Detalhes do Aluno',
      'turma_list': 'Lista de Turmas',
      'turma_detail': 'Detalhes da Turma',
      'user_list': 'Lista de Usuários',
      'user_detail': 'Detalhes do Usuário',
      'dashboard': 'Dashboard',
      'financial_report': 'Relatório Financeiro',
      'audit_logs': 'Logs de Auditoria',
      'settings': 'Configurações'
    };
    return mapping[viewType] || viewType;
  };

  const getResourceTypeDisplayName = (resourceType?: string) => {
    if (!resourceType) return 'N/A';
    
    const mapping: { [key: string]: string } = {
      'aluno': 'Aluno',
      'turma': 'Turma',
      'user': 'Usuário',
      'curso': 'Curso',
      'sala': 'Sala',
      'turma_pair': 'Par de Turmas'
    };
    return mapping[resourceType] || resourceType;
  };

  const filteredViews = auditViews.filter(view => {
    const matchesSearch = !searchTerm || 
      view.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      view.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      view.view_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesViewType = viewTypeFilter === 'all' || view.view_type === viewTypeFilter;
    const matchesResourceType = resourceTypeFilter === 'all' || view.resource_type === resourceTypeFilter;
    
    return matchesSearch && matchesViewType && matchesResourceType;
  });

  const uniqueViewTypes = [...new Set(auditViews.map(view => view.view_type))];
  const uniqueResourceTypes = [...new Set(auditViews.map(view => view.resource_type).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Visualizações
          </CardTitle>
          <CardDescription>
            Filtre as visualizações por usuário, tipo de página ou recurso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por usuário, email ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={viewTypeFilter} onValueChange={setViewTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {uniqueViewTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {getViewTypeDisplayName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os recursos</SelectItem>
                {uniqueResourceTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {getResourceTypeDisplayName(type)}
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

      {/* Lista de Visualizações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Registro de Visualizações ({filteredViews.length})
          </CardTitle>
          <CardDescription>
            Histórico de todas as páginas e recursos acessados pelos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo de Visualização</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViews.map((view) => (
                  <TableRow key={view.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {view.user?.full_name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {view.user?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-blue-600" />
                        <Badge variant="default" className="bg-blue-500">
                          {getViewTypeDisplayName(view.view_type)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getResourceTypeDisplayName(view.resource_type)}
                      </Badge>
                      {view.resource_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {view.resource_id.substring(0, 8)}...
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(view.created_at), { 
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
                            onClick={() => setSelectedView(view)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Visualização</DialogTitle>
                          </DialogHeader>
                          {selectedView && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">Usuário</h4>
                                  <p>{selectedView.user?.full_name}</p>
                                  <p className="text-sm text-gray-500">{selectedView.user?.email}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">Tipo</h4>
                                  <Badge variant="default" className="bg-blue-500">
                                    {getViewTypeDisplayName(selectedView.view_type)}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">Recurso</h4>
                                  <Badge variant="outline">
                                    {getResourceTypeDisplayName(selectedView.resource_type)}
                                  </Badge>
                                  {selectedView.resource_id && (
                                    <p className="text-sm text-gray-500">ID: {selectedView.resource_id}</p>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">Data/Hora</h4>
                                  <p>{new Date(selectedView.created_at).toLocaleString('pt-PT')}</p>
                                </div>
                              </div>
                              
                              {selectedView.ip_address && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">Endereço IP</h4>
                                  <p className="text-sm font-mono">{selectedView.ip_address}</p>
                                </div>
                              )}
                              
                              {selectedView.user_agent && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700">User Agent</h4>
                                  <p className="text-sm text-gray-600 break-all">{selectedView.user_agent}</p>
                                </div>
                              )}
                              
                              {selectedView.metadata && Object.keys(selectedView.metadata).length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Metadados</h4>
                                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(selectedView.metadata, null, 2)}
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
          
          {filteredViews.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma visualização encontrada com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};