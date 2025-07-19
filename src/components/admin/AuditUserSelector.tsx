import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Search, Eye, Activity, Calendar } from 'lucide-react';
import { useAuditData, UserAuditStats } from '@/hooks/useAuditData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditUserSelectorProps {
  onUserSelect: (userId: string, userName: string) => void;
  selectedUserId?: string;
}

export const AuditUserSelector: React.FC<AuditUserSelectorProps> = ({
  onUserSelect,
  selectedUserId
}) => {
  const { userStats, loading, fetchUserAuditStats } = useAuditData();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUserAuditStats();
  }, []);

  const filteredUsers = userStats.filter(user => {
    return !searchTerm || 
      user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const topActiveUsers = filteredUsers.slice(0, 5);
  const otherUsers = filteredUsers.slice(5);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityLevel = (totalActions: number) => {
    if (totalActions >= 50) return { level: 'Muito Ativo', color: 'bg-green-500' };
    if (totalActions >= 20) return { level: 'Ativo', color: 'bg-blue-500' };
    if (totalActions >= 5) return { level: 'Moderado', color: 'bg-yellow-500' };
    return { level: 'Baixo', color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando usuários...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Usuário para Auditoria Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar usuário por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Usuários Mais Ativos */}
      {topActiveUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Usuários Mais Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topActiveUsers.map((user) => {
                const activity = getActivityLevel(Number(user.total_actions));
                const isSelected = selectedUserId === user.user_id;
                
                return (
                  <Card 
                    key={user.user_id} 
                    className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => onUserSelect(user.user_id, user.user_name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                            {getUserInitials(user.user_name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{user.user_name || 'N/A'}</h3>
                          <p className="text-sm text-gray-600 truncate">{user.user_email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className={`${activity.color} text-white border-0`}
                            >
                              {activity.level}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                            <div className="text-center bg-gray-50 rounded p-1">
                              <div className="font-bold text-blue-600">{user.total_actions}</div>
                              <div className="text-gray-600">Ações</div>
                            </div>
                            <div className="text-center bg-gray-50 rounded p-1">
                              <div className="font-bold text-green-600">{user.alunos_created}</div>
                              <div className="text-gray-600">Inscrições</div>
                            </div>
                          </div>
                          {user.last_activity && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(user.last_activity), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant={isSelected ? "default" : "outline"} 
                        size="sm" 
                        className="w-full mt-3"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {isSelected ? 'Selecionado' : 'Ver Detalhes'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outros Usuários */}
      {otherUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outros Usuários ({otherUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {otherUsers.map((user) => {
                const isSelected = selectedUserId === user.user_id;
                
                return (
                  <div 
                    key={user.user_id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border-2 ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'
                    }`}
                    onClick={() => onUserSelect(user.user_id, user.user_name)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-500 text-white text-sm">
                          {getUserInitials(user.user_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.user_name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{user.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <p className="font-medium">{user.total_actions} ações</p>
                        <p className="text-gray-600">{user.alunos_created} inscrições</p>
                      </div>
                      <Button variant={isSelected ? "default" : "outline"} size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum usuário encontrado com os filtros aplicados.
          </CardContent>
        </Card>
      )}
    </div>
  );
};