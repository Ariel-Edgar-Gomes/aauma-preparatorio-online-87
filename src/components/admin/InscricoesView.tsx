import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Calendar,
  Eye,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface AlunoWithCreator {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  numero_bi: string;
  numero_estudante: string;
  curso_codigo: string;
  status: string;
  valor_pago: number;
  forma_pagamento: string;
  data_inscricao: string;
  created_at: string;
  created_by: string | null;
  creator_name: string | null;
  creator_email: string | null;
}

export const InscricoesView = () => {
  const [minhasInscricoes, setMinhasInscricoes] = useState<AlunoWithCreator[]>([]);
  const [todasInscricoes, setTodasInscricoes] = useState<AlunoWithCreator[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [cursoFilter, setCursoFilter] = useState('todos');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    fetchInscricoes();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchInscricoes = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar minhas inscrições (sem foreign key relationship)
      const { data: minhas, error: minhasError } = await supabase
        .from('alunos')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (minhasError) throw minhasError;

      // Buscar todas as inscrições (sem foreign key relationship)
      const { data: todas, error: todasError } = await supabase
        .from('alunos')
        .select('*')
        .order('created_at', { ascending: false });

      if (todasError) throw todasError;

      // Buscar perfis dos criadores para todas as inscrições
      const criadoresIds = [...new Set(todas?.map(aluno => aluno.created_by).filter(Boolean))] as string[];
      
      let profiles: any[] = [];
      if (criadoresIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', criadoresIds);

        if (!profilesError) {
          profiles = profilesData || [];
        }
      }

      // Processar dados combinando com perfis
      const processarAlunos = (alunos: any[]) => 
        alunos.map(aluno => {
          const creator = profiles.find(p => p.id === aluno.created_by);
          return {
            ...aluno,
            creator_name: creator?.full_name || (aluno.created_by ? 'Usuário Removido' : 'Sistema Antigo'),
            creator_email: creator?.email || 'N/A'
          };
        });

      setMinhasInscricoes(processarAlunos(minhas || []));
      setTodasInscricoes(processarAlunos(todas || []));

    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar inscrições",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filtrarAlunos = (alunos: AlunoWithCreator[]) => {
    return alunos.filter(aluno => {
      const matchSearch = !searchTerm || 
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.numero_estudante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.creator_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.curso_codigo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'todos' || aluno.status === statusFilter;
      const matchCurso = cursoFilter === 'todos' || aluno.curso_codigo === cursoFilter;

      return matchSearch && matchStatus && matchCurso;
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-500';
      case 'inscrito': return 'bg-blue-500';
      case 'pendente': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const cursos = [...new Set(todasInscricoes.map(a => a.curso_codigo))];
  const minhasFiltradas = filtrarAlunos(minhasInscricoes);
  const todasFiltradas = filtrarAlunos(todasInscricoes);

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando inscrições...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-aauma-navy">Inscrições de Alunos</h2>
          <p className="text-aauma-dark-gray">
            Visualize suas inscrições e pesquise todas as inscrições do sistema
          </p>
        </div>
        <Button onClick={fetchInscricoes} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email, criador, curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="inscrito">Inscrito</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cursoFilter} onValueChange={setCursoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os cursos</SelectItem>
                {cursos.map(curso => (
                  <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('todos');
              setCursoFilter('todos');
            }}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{minhasInscricoes.length}</div>
            <p className="text-xs text-muted-foreground">Minhas Inscrições</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{todasInscricoes.length}</div>
            <p className="text-xs text-muted-foreground">Total de Inscrições</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {todasInscricoes.filter(a => a.status === 'confirmado').length}
            </div>
            <p className="text-xs text-muted-foreground">Confirmados</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="text-lg font-bold text-orange-600">
              {formatCurrency(minhasInscricoes.reduce((sum, a) => sum + a.valor_pago, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Valor das Minhas Inscrições</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="minhas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="minhas" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Minhas Inscrições ({minhasFiltradas.length})
          </TabsTrigger>
          <TabsTrigger value="todas" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Todas as Inscrições ({todasFiltradas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="minhas" className="space-y-4">
          {minhasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {searchTerm || statusFilter !== 'todos' || cursoFilter !== 'todos'
                  ? 'Nenhuma inscrição encontrada com os filtros aplicados'
                  : 'Você ainda não fez nenhuma inscrição'
                }
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {minhasFiltradas.map((aluno) => (
                <Card key={aluno.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header do Aluno com Quem Inscreveu */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{aluno.nome}</h3>
                            <p className="text-sm text-gray-600">{aluno.numero_estudante}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Inscrito por: <strong>Você</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          className={`${getStatusColor(aluno.status)} text-white border-0`}
                        >
                          {aluno.status}
                        </Badge>
                      </div>

                      {/* Informações do Aluno */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{aluno.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{aluno.telefone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{aluno.curso_codigo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-green-600">
                            {formatCurrency(aluno.valor_pago)}
                          </span>
                        </div>
                      </div>

                      {/* Data de Inscrição */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Inscrito em {format(new Date(aluno.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todas" className="space-y-4">
          {todasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma inscrição encontrada com os filtros aplicados
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {todasFiltradas.map((aluno) => (
                <Card key={aluno.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header do Aluno com Criador */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 text-purple-700 p-2 rounded-full">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{aluno.nome}</h3>
                            <p className="text-sm text-gray-600">{aluno.numero_estudante}</p>
                          </div>
                        </div>
                        <Badge 
                          className={`${getStatusColor(aluno.status)} text-white border-0`}
                        >
                          {aluno.status}
                        </Badge>
                      </div>

                      {/* Quem Inscreveu - DESTAQUE PRINCIPAL */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border-2 border-blue-300">
                            <AvatarFallback className="bg-blue-500 text-white text-sm font-bold">
                              {getUserInitials(aluno.creator_name || 'S')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Inscrito por:</span>
                            </div>
                            <p className="font-semibold text-blue-800">{aluno.creator_name}</p>
                            <p className="text-xs text-blue-600">{aluno.creator_email}</p>
                          </div>
                          {aluno.created_by === currentUser?.id && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              Você
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Informações do Aluno */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{aluno.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{aluno.telefone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{aluno.curso_codigo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-green-600">
                            {formatCurrency(aluno.valor_pago)}
                          </span>
                        </div>
                      </div>

                      {/* Data de Inscrição */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Inscrito em {format(new Date(aluno.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
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