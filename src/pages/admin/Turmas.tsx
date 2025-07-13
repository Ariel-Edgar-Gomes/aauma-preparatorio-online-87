import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTurmaData } from "@/hooks/useTurmaData";
import { TurmaPairGrid } from "@/components/admin/TurmaPairGrid";
import { TurmaManagementArea } from "@/components/admin/TurmaManagementArea";
import { TurmaIndividualManagement } from "@/components/admin/TurmaIndividualManagement";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminTurmas = () => {
  const { 
    turmaPairs, 
    loading, 
    handleUpdateTurmaPair,
    handleDeleteTurmaPair,
    handleToggleStatus,
    handleDuplicatePair
  } = useTurmaData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-aauma-light-gray via-white to-aauma-light-gray flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-aauma-navy mx-auto mb-4" />
          <p className="text-aauma-dark-gray">Carregando pares de turmas...</p>
        </div>
      </div>
    );
  }

  const activePairs = turmaPairs.filter(t => t.ativo).length;
  const totalStudents = turmaPairs.reduce((total, pair) => 
    total + pair.turmaA.alunosInscritos + pair.turmaB.alunosInscritos, 0
  );
  const totalCapacity = turmaPairs.reduce((total, pair) => 
    total + pair.turmaA.capacidade + pair.turmaB.capacidade, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-aauma-light-gray via-white to-aauma-light-gray">
      {/* Header */}
      <header className="bg-white shadow border-b-2 border-aauma-red">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
                alt="AAUMA Logo" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-aauma-navy">Admin - Gestão de Turmas</h1>
                <p className="text-xs text-aauma-dark-gray">Preparatório AAUMA 2025-2026</p>
              </div>
            </Link>
            
            <div className="flex gap-1">
              <Link to="/admin/horarios">
                <Button variant="outline" className="h-8 px-3 text-sm">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Horários
                </Button>
              </Link>

              <Link to="/admin/financeiro">
                <Button variant="outline" className="h-8 px-3 text-sm">
                  Financeiro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-2">
        {/* Estatísticas */}
        <div className="bg-gradient-to-r from-primary to-destructive text-white p-3 rounded mb-3">
          <h2 className="text-base font-bold mb-1">Gestão de Pares de Turmas</h2>
          <p className="opacity-90 mb-2 text-xs">
            Gerencie os pares de turmas do preparatório AAUMA
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-white/20 text-white text-xs px-2 py-0">
              <Users className="w-3 h-3 mr-1" />
              {turmaPairs.length} pares
            </Badge>
            <Badge className="bg-white/20 text-white text-xs px-2 py-0">
              {activePairs} ativos
            </Badge>
            <Badge className="bg-white/20 text-white text-xs px-2 py-0">
              {totalStudents} alunos
            </Badge>
            <Badge className="bg-white/20 text-white text-xs px-2 py-0">
              {totalCapacity} capacidade
            </Badge>
          </div>
        </div>

        {/* Botões para duplicar pares existentes */}
        <div className="mb-4 flex gap-3">
          <Button 
            onClick={() => handleDuplicatePair('manha')}
            className="bg-aauma-navy hover:bg-aauma-navy/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Par de Manhã
          </Button>
          <Button 
            onClick={() => handleDuplicatePair('tarde')}
            className="bg-aauma-red hover:bg-aauma-red/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Par de Tarde
          </Button>
        </div>

        {/* Área de Navegação */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold mb-4 text-primary">Área de Navegação</h3>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted rounded-lg p-1">
              <TabsTrigger value="overview" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary">
                📊 Visão Geral
              </TabsTrigger>
              <TabsTrigger value="management" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary">
                ⚙️ Gestão de Pares
              </TabsTrigger>
              <TabsTrigger value="individual" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary">
                👥 Gestão Individual
              </TabsTrigger>
            </TabsList>
          
            
            <TabsContent value="overview" className="mt-6">
              <TurmaPairGrid
                turmaPairs={turmaPairs}
                onDeleteTurmaPair={handleDeleteTurmaPair}
                onToggleStatus={handleToggleStatus}
              />
            </TabsContent>
            
            <TabsContent value="management" className="mt-6">
              <TurmaManagementArea
                turmaPairs={turmaPairs}
                onUpdateTurmaPair={handleUpdateTurmaPair}
                onDeleteTurmaPair={handleDeleteTurmaPair}
                onToggleStatus={handleToggleStatus}
              />
            </TabsContent>
            
            <TabsContent value="individual" className="mt-6">
              <TurmaIndividualManagement
                turmaPairs={turmaPairs}
                onUpdateTurmaPair={handleUpdateTurmaPair}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminTurmas;
