import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Users, MapPin, BookOpen } from "lucide-react";
import { TurmaPair } from "@/types/turma";
import { courseNames } from "@/types/schedule";
import { cursosService } from "@/services/supabaseService";

interface TurmaPairEditDialogProps {
  turmaPair: TurmaPair | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<TurmaPair>) => void;
}

export const TurmaPairEditDialog = ({ 
  turmaPair, 
  open, 
  onOpenChange, 
  onSave 
}: TurmaPairEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<TurmaPair>>({});
  const [cursosDisponiveis, setCursosDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    if (turmaPair) {
      setFormData({
        nome: turmaPair.nome,
        periodo: turmaPair.periodo,
        cursos: [...turmaPair.cursos],
        turmaA: {
          ...turmaPair.turmaA
        },
        turmaB: {
          ...turmaPair.turmaB
        }
      });
    }
  }, [turmaPair]);

  useEffect(() => {
    const loadCursos = async () => {
      try {
        const cursos = await cursosService.getAll();
        const cursosAtivos = cursos.filter(curso => curso.ativo).map(curso => curso.codigo);
        setCursosDisponiveis(cursosAtivos);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        setCursosDisponiveis([
          'engenharia-informatica', 'engenharia-civil', 'engenharia-mecatronica',
          'engenharia-industrial-sistemas-electricos', 'engenharia-agropecuaria',
          'arquitectura-urbanismo', 'medicina', 'analises-clinicas', 'enfermagem',
          'cardiopneumologia', 'fisioterapia', 'psicologia', 'direito',
          'gestao-administracao', 'lingua-portuguesa', 'economia',
          'turismo-gestao-hoteleira'
        ]);
      }
    };
    
    if (open) {
      loadCursos();
    }
  }, [open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTurmaChange = (turma: 'A' | 'B', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [turma === 'A' ? 'turmaA' : 'turmaB']: {
        ...prev[turma === 'A' ? 'turmaA' : 'turmaB'],
        [field]: value
      }
    }));
  };

  const handleCursoChange = (cursoId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      cursos: checked 
        ? [...(prev.cursos || []), cursoId]
        : (prev.cursos || []).filter(c => c !== cursoId)
    }));
  };

  const handleSubmit = () => {
    if (!turmaPair || !formData.turmaA?.sala || !formData.turmaB?.sala || !formData.cursos?.length) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.turmaA.sala === formData.turmaB.sala) {
      alert("As turmas A e B devem ter salas diferentes");
      return;
    }

    onSave(turmaPair.id, formData);
    onOpenChange(false);
  };

  if (!turmaPair) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Par de Turmas - {turmaPair.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Par</Label>
              <Input
                value={formData.nome || ''}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Par 1 - Manhã"
              />
            </div>
            
            <div>
              <Label>Período</Label>
              <Select 
                value={formData.periodo || 'manha'} 
                onValueChange={(value: 'manha' | 'tarde') => handleInputChange('periodo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">🌅 Manhã (08h00 - 12h00)</SelectItem>
                  <SelectItem value="tarde">🌇 Tarde (13h00 - 17h00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Cursos do Par de Turmas
            </Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-3 bg-gray-50">
              {cursosDisponiveis.map((cursoId) => (
                <div key={cursoId} className="flex items-center space-x-2">
                  <Checkbox
                    id={cursoId}
                    checked={formData.cursos?.includes(cursoId) || false}
                    onCheckedChange={(checked) => handleCursoChange(cursoId, !!checked)}
                  />
                  <label htmlFor={cursoId} className="text-sm font-medium cursor-pointer">
                    {courseNames[cursoId]}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Turma A */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Turma A</h3>
              </div>
              
              <div>
                <Label>Sala da Turma A</Label>
                <Input
                  type="text"
                  placeholder="Digite o número da sala (ex: 101, A1, U10)"
                  value={formData.turmaA?.sala || ''}
                  onChange={(e) => handleTurmaChange('A', 'sala', e.target.value)}
                />
              </div>

              <div>
                <Label>Capacidade da Turma A</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.turmaA?.capacidade || 30}
                  onChange={(e) => handleTurmaChange('A', 'capacidade', parseInt(e.target.value) || 30)}
                />
              </div>
            </div>

            {/* Turma B */}
            <div className="space-y-4 p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                <h3 className="font-semibold text-red-800">Turma B</h3>
              </div>
              
              <div>
                <Label>Sala da Turma B</Label>
                <Input
                  type="text"
                  placeholder="Digite o número da sala (ex: 102, B1, U11)"
                  value={formData.turmaB?.sala || ''}
                  onChange={(e) => handleTurmaChange('B', 'sala', e.target.value)}
                />
              </div>

              <div>
                <Label>Capacidade da Turma B</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.turmaB?.capacidade || 30}
                  onChange={(e) => handleTurmaChange('B', 'capacidade', parseInt(e.target.value) || 30)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSubmit} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};