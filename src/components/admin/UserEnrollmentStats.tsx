import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck, AlertCircle, UserX } from "lucide-react";
import { alunosService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

interface UserEnrollmentStatsProps {
  refreshTrigger?: number;
}

export const UserEnrollmentStats = ({ refreshTrigger }: UserEnrollmentStatsProps) => {
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const stats = await alunosService.getStatisticsByUser();
      setUserStats(stats.sort((a, b) => b.totalInscricoes - a.totalInscricoes));
    } catch (error) {
      console.error('[UserEnrollmentStats] Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as estatísticas por usuário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserStats();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando estatísticas dos usuários...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = userStats.length;
  const totalEnrollments = userStats.reduce((sum, user) => sum + user.totalInscricoes, 0);
  const mostActiveUser = userStats[0];

  return (
    <div className="space-y-6">
      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários que fizeram inscrições
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              Total de Inscrições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Por todos os usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              Usuário Mais Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-orange-600">
              {mostActiveUser?.userName || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostActiveUser?.totalInscricoes || 0} inscrições
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Estatísticas por Usuário
          </CardTitle>
          <CardDescription>
            Desempenho de inscrições por usuário do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma inscrição encontrada com usuário identificado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Inscritos</TableHead>
                  <TableHead className="text-center">Confirmados</TableHead>
                  <TableHead className="text-center">Cancelados</TableHead>
                  <TableHead className="text-center">Taxa de Sucesso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userStats.map((user, index) => {
                  const successRate = user.totalInscricoes > 0 
                    ? Math.round(((user.confirmados + user.inscritos) / user.totalInscricoes) * 100)
                    : 0;
                  
                  return (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          {user.userName}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.userEmail}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-bold">
                          {user.totalInscricoes}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {user.inscritos}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-500">
                          {user.confirmados}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive">
                          {user.cancelados}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={successRate >= 80 ? "default" : successRate >= 60 ? "secondary" : "destructive"}
                            className="min-w-[50px]"
                          >
                            {successRate}%
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};