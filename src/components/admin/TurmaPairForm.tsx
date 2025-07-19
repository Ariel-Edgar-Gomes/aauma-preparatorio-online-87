
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Users, MapPin, BookOpen } from "lucide-react";
import { CreateTurmaPairData } from "@/types/turma";
import { courseNames } from "@/types/schedule";
import { cursosService, salasService } from "@/services/supabaseService";
import { useEffect } from "react";

interface TurmaPairFormProps {
  onSave: (data: CreateTurmaPairData) => boolean;
  onClose: () => void;
}

export const TurmaPairForm = ({ onSave, onClose }: TurmaPairFormProps) => {
  const [formData, setFormData] = useState<CreateTurmaPairData>({
    periodo: "manha",
    cursos: [],
    salaA: "",
    capacidadeA: 30,
    salaB: "",
    capacidadeB: 30
  });

  const handleInputChange = (field: keyof CreateTurmaPairData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCursoChange = (cursoId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      cursos: checked 
        ? [...prev.cursos, cursoId]
        : prev.cursos.filter(c => c !== cursoId)
    }));
  };

  const handleSubmit = () => {
    if (!formData.salaA || !formData.salaB || formData.cursos.length === 0) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.salaA === formData.salaB) {
      alert("As turmas A e B devem ter salas diferentes");
      return;
    }

    const success = onSave(formData);
    if (success) {
      onClose();
    }
  };

  // Buscar todos os cursos ativos do sistema
  const [cursosDisponiveis, setCursosDisponiveis] = useState<string[]>([]);
  const [salasDisponiveis, setSalasDisponiveis] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar cursos
        const cursos = await cursosService.getAll();
        const cursosAtivos = cursos.filter(curso => curso.ativo).map(curso => curso.codigo);
        setCursosDisponiveis(cursosAtivos);

        // Carregar salas
        const salas = await salasService.getAll();
        setSalasDisponiveis(salas);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Fallback para lista estática de cursos
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
    
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Label>Período</Label>
        <Select 
          value={formData.periodo} 
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
                checked={formData.cursos.includes(cursoId)}
                onCheckedChange={(checked) => handleCursoChange(cursoId, !!checked)}
              />
              <label htmlFor={cursoId} className="text-sm font-medium cursor-pointer">
                {courseNames[cursoId]}
              </label>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Selecione os cursos que terão disciplinas em comum neste par de turmas
        </p>
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
            <Select value={formData.salaA} onValueChange={(value) => handleInputChange('salaA', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma sala" />
              </SelectTrigger>
              <SelectContent>
                {salasDisponiveis.map((sala) => (
                  <SelectItem key={sala.codigo} value={sala.codigo}>
                    {sala.codigo} (Cap: {sala.capacidade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Capacidade da Turma A</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={formData.capacidadeA}
              onChange={(e) => handleInputChange('capacidadeA', parseInt(e.target.value) || 30)}
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
            <Select value={formData.salaB} onValueChange={(value) => handleInputChange('salaB', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma sala" />
              </SelectTrigger>
              <SelectContent>
                {salasDisponiveis.map((sala) => (
                  <SelectItem key={sala.codigo} value={sala.codigo}>
                    {sala.codigo} (Cap: {sala.capacidade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Capacidade da Turma B</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={formData.capacidadeB}
              onChange={(e) => handleInputChange('capacidadeB', parseInt(e.target.value) || 30)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} className="flex-1 bg-aauma-navy hover:bg-aauma-navy/90">
          <Save className="w-4 h-4 mr-2" />
          Criar Par de Turmas
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};
