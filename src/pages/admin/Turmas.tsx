import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Users, BookOpen } from "lucide-react";
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
    handleDuplicatePair,
    handleCreateAluno,
    handleUpdateAluno,
    handleDeleteAluno,
    handleUpdateAlunoStatus
  } = useTurmaData();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
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
    <div className="p-6">
      {/* Title and Statistics */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-aauma-navy mb-2">Gestão de Turmas</h2>
        <p className="text-aauma-dark-gray mb-4">Gerencie pares de turmas e alunos do preparatório</p>
        
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Pares Ativos</p>
                <p className="text-2xl font-bold text-blue-700">{activePairs}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total de Alunos</p>
                <p className="text-2xl font-bold text-green-700">{totalStudents}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Capacidade Total</p>
                <p className="text-2xl font-bold text-purple-700">{totalCapacity}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex gap-3">
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

      {/* Navigation Tabs */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              📊 Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="management" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              ⚙️ Gestão de Pares
            </TabsTrigger>
            <TabsTrigger 
              value="individual" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary"
            >
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
              onCreateAluno={handleCreateAluno}
              onUpdateAluno={handleUpdateAluno}
              onDeleteAluno={handleDeleteAluno}
              onUpdateAlunoStatus={handleUpdateAlunoStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminTurmas;