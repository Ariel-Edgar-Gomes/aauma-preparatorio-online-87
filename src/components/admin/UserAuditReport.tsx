import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  User, 
  Activity, 
  Eye, 
  Plus, 
  Edit, 
  Trash2,
  Users,
  Settings,
  Calendar,
  FileText
} from "lucide-react";
import { UserAuditStats } from "@/hooks/useAuditData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserAuditReportProps {
  userStats: UserAuditStats[];
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
  onDetailedView?: (userId: string, userName: string) => void;
}

export const UserAuditReport: React.FC<UserAuditReportProps> = ({ 
  userStats, 
  onUserSelect, 
  selectedUserId,
  onDetailedView 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = userStats.filter(user => {
    return !searchTerm || 
      user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUserClick = (userId: string) => {
    onUserSelect(userId === selectedUserId ? '' : userId);
  };

  const exportUserReport = (user: UserAuditStats) => {
    const report = {
      usuario: {
        nome: user.user_name,
        email: user.user_email,
        id: user.user_id
      },
      atividade: {
        total_acoes: user.total_actions,
        total_visualizacoes: user.total_views,
        ultima_atividade: user.last_activity
      },
      detalhes: {
        alunos_criados: user.alunos_created,
        alunos_editados: user.alunos_updated,
        alunos_excluidos: user.alunos_deleted,
        usuarios_criados: user.users_created,
        mudancas_privilegios: user.role_changes
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_auditoria_${user.user_name || 'usuario'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Relatório de Atividade por Usuário
          </CardTitle>
          <CardDescription>
            Visualize a atividade detalhada de cada usuário no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email do usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Resumidas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {filteredUsers.reduce((sum, user) => sum + Number(user.alunos_created), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total de Inscrições</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredUsers.reduce((sum, user) => sum + Number(user.alunos_updated), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Edições de Alunos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {filteredUsers.reduce((sum, user) => sum + Number(user.users_created), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Usuários Criados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {filteredUsers.reduce((sum, user) => sum + Number(user.role_changes), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Mudanças de Privilégios</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Usuários ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            Clique em um usuário para filtrar os logs de auditoria específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ações Totais</TableHead>
                  <TableHead>Visualizações</TableHead>
                  <TableHead>Inscrições</TableHead>
                  <TableHead>Privilégios</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.user_id}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedUserId === user.user_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleUserClick(user.user_id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">
                            {user.user_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.user_email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <Badge variant="default" className="bg-blue-500">
                          {user.total_actions}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-600" />
                        <Badge variant="default" className="bg-green-500">
                          {user.total_views}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Plus className="w-3 h-3 text-green-600" />
                          <span className="text-sm">{user.alunos_created} criadas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Edit className="w-3 h-3 text-blue-600" />
                          <span className="text-sm">{user.alunos_updated} editadas</span>
                        </div>
                        {Number(user.alunos_deleted) > 0 && (
                          <div className="flex items-center gap-1">
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span className="text-sm">{user.alunos_deleted} excluídas</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-600" />
                        <Badge variant="default" className="bg-purple-500">
                          {user.role_changes}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.last_activity ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(user.last_activity), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sem atividade</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportUserReport(user);
                          }}
                          className="h-8 px-2"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Exportar
                        </Button>
                        {onDetailedView && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDetailedView(user.user_id, user.user_name);
                            }}
                            className="h-8 px-2"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detalhes
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUserId && (
        <div className="mt-4">
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">
                    Filtrando por: {filteredUsers.find(u => u.user_id === selectedUserId)?.user_name}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onUserSelect('')}
                >
                  Limpar Filtro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};