import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Eye, 
  Edit, 
  Users, 
  Activity, 
  Clock, 
  Filter,
  UserCheck,
  FileText,
  RefreshCw
} from "lucide-react";
import { useAuditData } from "@/hooks/useAuditData";
import { AuditLogsList } from "./AuditLogsList";
import { AuditViewsList } from "./AuditViewsList";
import { UserAuditReport } from "./UserAuditReport";
import { UserDetailedAuditReport } from "./UserDetailedAuditReport";

export const AuditDashboard: React.FC = () => {
  const { userStats, loading, fetchUserAuditStats } = useAuditData();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [detailedUserId, setDetailedUserId] = useState<string | null>(null);
  const [detailedUserName, setDetailedUserName] = useState<string>('');

  useEffect(() => {
    fetchUserAuditStats();
  }, []);

  const handleRefresh = () => {
    fetchUserAuditStats();
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  // Calcular estatísticas totais
  const totalStats = userStats.reduce((acc, user) => ({
    totalActions: acc.totalActions + Number(user.total_actions),
    totalViews: acc.totalViews + Number(user.total_views),
    totalUsers: acc.totalUsers + 1,
    totalAlunos: acc.totalAlunos + Number(user.alunos_created)
  }), { totalActions: 0, totalViews: 0, totalUsers: 0, totalAlunos: 0 });

  const mostActiveUser = userStats.length > 0 ? userStats[0] : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-aauma-navy">Sistema de Auditoria</h2>
          <p className="text-aauma-dark-gray">
            Monitoramento completo de todas as ações dos usuários
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStats.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              Todas as operações registradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Páginas e recursos acessados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com atividade registrada
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Inscritos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalStats.totalAlunos}</div>
            <p className="text-xs text-muted-foreground">
              Total de inscrições realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usuário Mais Ativo */}
      {mostActiveUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Usuário Mais Ativo
            </CardTitle>
            <CardDescription>Usuário com maior atividade no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-aauma-navy">{mostActiveUser.user_name}</p>
                <p className="text-sm text-gray-600">{mostActiveUser.user_email}</p>
              </div>
              <div className="text-right">
                <Badge variant="default" className="mb-1">
                  {mostActiveUser.total_actions} ações
                </Badge>
                <br />
                <Badge variant="secondary">
                  {mostActiveUser.total_views} visualizações
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abas de Auditoria */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="views">Visualizações</TabsTrigger>
          <TabsTrigger value="users">Por Usuário</TabsTrigger>
          <TabsTrigger value="detailed">Controle Detalhado</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Usuários por Ações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 5 Usuários - Ações</CardTitle>
                <CardDescription>Usuários mais ativos por número de ações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.slice(0, 5).map((user, index) => (
                    <div key={user.user_id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{user.user_name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{user.user_email}</p>
                        </div>
                      </div>
                      <Badge variant="default">{user.total_actions} ações</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividades por Tipo</CardTitle>
                <CardDescription>Distribuição das ações por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alunos Criados</span>
                    <Badge variant="default">
                      {userStats.reduce((sum, user) => sum + Number(user.alunos_created), 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alunos Editados</span>
                    <Badge variant="secondary">
                      {userStats.reduce((sum, user) => sum + Number(user.alunos_updated), 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Usuários Criados</span>
                    <Badge variant="outline">
                      {userStats.reduce((sum, user) => sum + Number(user.users_created), 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mudanças de Privilégios</span>
                    <Badge variant="destructive">
                      {userStats.reduce((sum, user) => sum + Number(user.role_changes), 0)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <AuditLogsList selectedUserId={selectedUserId} />
        </TabsContent>

        <TabsContent value="views">
          <AuditViewsList selectedUserId={selectedUserId} />
        </TabsContent>

        <TabsContent value="users">
          <UserAuditReport 
            userStats={userStats} 
            onUserSelect={handleUserSelect}
            selectedUserId={selectedUserId}
            onDetailedView={(userId, userName) => {
              setDetailedUserId(userId);
              setDetailedUserName(userName);
            }}
          />
        </TabsContent>

        <TabsContent value="detailed">
          {detailedUserId ? (
            <UserDetailedAuditReport 
              userId={detailedUserId} 
              userName={detailedUserName}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Selecione um usuário na aba "Por Usuário" para ver os detalhes completos
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};