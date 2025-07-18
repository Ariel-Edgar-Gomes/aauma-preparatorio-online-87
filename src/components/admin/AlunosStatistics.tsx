
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertCircle,
  GraduationCap,
  MapPin,
  Clock,
  TrendingUp,
  PieChart
} from "lucide-react";
import { TurmaPair, Aluno } from "@/types/turma";

interface AlunosStatisticsProps {
  turmaPairs: TurmaPair[];
}

export const AlunosStatistics = ({ turmaPairs }: AlunosStatisticsProps) => {
  console.log('[AlunosStatistics] Calculando estatísticas para pares:', turmaPairs.length);
  
  // Calcular estatísticas gerais usando dados consistentes dos pares
  const getAllAlunos = (): Aluno[] => {
    const alunos = turmaPairs.flatMap(pair => [
      ...pair.turmaA.alunos,
      ...pair.turmaB.alunos
    ]);
    console.log('[AlunosStatistics] Total de alunos encontrados:', alunos.length);
    return alunos;
  };

  const allAlunos = getAllAlunos();
  
  // Usar contagem real dos alunos das turmas
  const totalAlunos = turmaPairs.reduce((total, pair) => {
    const alunosPar = pair.turmaA.alunosInscritos + pair.turmaB.alunosInscritos;
    console.log(`[AlunosStatistics] ${pair.nome}: TurmaA=${pair.turmaA.alunosInscritos}, TurmaB=${pair.turmaB.alunosInscritos}, Total=${alunosPar}`);
    return total + alunosPar;
  }, 0);
  
  console.log('[AlunosStatistics] Total de alunos calculado:', totalAlunos);

  // Estatísticas por status usando dados reais dos alunos
  const alunosConfirmados = allAlunos.filter(a => a.status === 'confirmado').length;
  const alunosInscritos = allAlunos.filter(a => a.status === 'inscrito').length;
  const alunosCancelados = allAlunos.filter(a => a.status === 'cancelado').length;

  // Estatísticas por curso - contar alunos reais por curso
  const alunosPorCurso = allAlunos.reduce((acc, aluno) => {
    acc[aluno.curso] = (acc[aluno.curso] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Garantir que todos os cursos apareçam, mesmo com 0 alunos
  const todosCursos = [...new Set(turmaPairs.flatMap(pair => pair.cursos))];
  todosCursos.forEach(curso => {
    if (!alunosPorCurso[curso]) {
      alunosPorCurso[curso] = 0;
    }
  });

  // Estatísticas por período usando dados reais
  const alunosManha = turmaPairs
    .filter(pair => pair.periodo === 'manha')
    .reduce((total, pair) => total + pair.turmaA.alunosInscritos + pair.turmaB.alunosInscritos, 0);
  
  const alunosTarde = turmaPairs
    .filter(pair => pair.periodo === 'tarde')
    .reduce((total, pair) => total + pair.turmaA.alunosInscritos + pair.turmaB.alunosInscritos, 0);

  // Estatísticas por turma (A vs B) usando dados reais
  const alunosTurmaA = turmaPairs.reduce((total, pair) => total + pair.turmaA.alunosInscritos, 0);
  const alunosTurmaB = turmaPairs.reduce((total, pair) => total + pair.turmaB.alunosInscritos, 0);

  // Capacidade total e ocupação
  const capacidadeTotal = turmaPairs.reduce((total, pair) => 
    total + pair.turmaA.capacidade + pair.turmaB.capacidade, 0
  );
  const taxaOcupacao = capacidadeTotal > 0 ? (totalAlunos / capacidadeTotal * 100) : 0;

  // Top 5 cursos com mais alunos
  const topCursos = Object.entries(alunosPorCurso)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  console.log('[AlunosStatistics] Estatísticas calculadas:', {
    totalAlunos,
    alunosConfirmados,
    alunosInscritos,
    alunosCancelados,
    alunosManha,
    alunosTarde,
    alunosTurmaA,
    alunosTurmaB,
    taxaOcupacao
  });

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Estatísticas Gerais dos Alunos</h2>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalAlunos}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(taxaOcupacao)}% de ocupação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alunosConfirmados}</div>
            <p className="text-xs text-muted-foreground">
              {totalAlunos > 0 ? Math.round((alunosConfirmados / totalAlunos) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Inscritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{alunosInscritos}</div>
            <p className="text-xs text-muted-foreground">
              {totalAlunos > 0 ? Math.round((alunosInscritos / totalAlunos) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-600" />
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alunosCancelados}</div>
            <p className="text-xs text-muted-foreground">
              {totalAlunos > 0 ? Math.round((alunosCancelados / totalAlunos) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Período e Turma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Distribuição por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Manhã</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{alunosManha}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalAlunos > 0 ? Math.round((alunosManha / totalAlunos) * 100) : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">Tarde</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{alunosTarde}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalAlunos > 0 ? Math.round((alunosTarde / totalAlunos) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Distribuição por Turma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Turma A</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{alunosTurmaA}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalAlunos > 0 ? Math.round((alunosTurmaA / totalAlunos) * 100) : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Turma B</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{alunosTurmaB}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalAlunos > 0 ? Math.round((alunosTurmaB / totalAlunos) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Cursos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Top 5 Cursos com Mais Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCursos.map(([curso, quantidade], index) => (
              <div key={curso} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">
                      {curso.replace('-', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {totalAlunos > 0 ? Math.round((quantidade / totalAlunos) * 100) : 0}% do total
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {quantidade} alunos
                </Badge>
              </div>
            ))}
          </div>

          {topCursos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aluno registrado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacidade e Ocupação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Capacidade e Ocupação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{capacidadeTotal}</div>
              <div className="text-sm text-muted-foreground">Capacidade Total</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalAlunos}</div>
              <div className="text-sm text-muted-foreground">Alunos Registrados</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{capacidadeTotal - totalAlunos}</div>
              <div className="text-sm text-muted-foreground">Vagas Disponíveis</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Taxa de Ocupação</span>
              <span>{Math.round(taxaOcupacao)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(taxaOcupacao, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
