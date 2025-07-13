import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  BookOpen,
  CreditCard,
  FileText,
  AlertTriangle,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { alunosService } from "@/services/supabaseService";
import { Aluno } from "@/types/turma";

interface AlunoEditDialogProps {
  aluno: Aluno | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete?: (alunoId: string) => void;
  availableCursos: string[];
}

const AlunoEditDialog = ({ 
  aluno, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete, 
  availableCursos 
}: AlunoEditDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState<Aluno | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Sincronizar dados do aluno com o formulário
  useEffect(() => {
    if (aluno) {
      setFormData({ ...aluno });
      setHasChanges(false);
    }
  }, [aluno]);

  // Detectar mudanças no formulário
  useEffect(() => {
    if (aluno && formData) {
      const hasModifications = JSON.stringify(aluno) !== JSON.stringify(formData);
      setHasChanges(hasModifications);
    }
  }, [formData, aluno]);

  const handleInputChange = (field: keyof Aluno, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!formData || !aluno) return;

    setLoading(true);
    try {
      // Preparar dados para atualização na base de dados
      const updateData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        numero_bi: formData.numeroBI || '',
        data_nascimento: formData.dataNascimento || null,
        endereco: formData.endereco || '',
        curso_codigo: formData.curso,
        status: formData.status as 'inscrito' | 'confirmado' | 'cancelado',
        forma_pagamento: formData.formaPagamento as 'Cash' | 'Transferencia' | 'Cartao',
        duracao: formData.duracao || '3 Meses',
        data_inicio: formData.dataInicio || '2025-02-15',
        turno: formData.turno || '',
        observacoes: formData.observacoes || '',
        // Lógica de valor pago baseada no status
        valor_pago: formData.status === 'confirmado' ? 40000 : 0
      };

      await alunosService.update(aluno.id, updateData);

      toast({
        title: "Aluno atualizado",
        description: "Os dados do aluno foram atualizados com sucesso.",
      });

      setHasChanges(false);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados do aluno.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!aluno || !onDelete) return;

    if (!confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await alunosService.delete(aluno.id);
      
      toast({
        title: "Aluno excluído",
        description: "O aluno foi excluído com sucesso.",
      });

      onDelete(aluno.id);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o aluno.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelado': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Editar Dados do Aluno
          </DialogTitle>
          <DialogDescription>
            Edite os dados pessoais, acadêmicos e de pagamento do aluno.
          </DialogDescription>
        </DialogHeader>

        {/* Status atual */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status atual:</span>
            <Badge className={getStatusColor(formData.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(formData.status)}
                {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
              </div>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Nº Estudante:</span>
            <Badge variant="outline">{formData.numeroEstudante}</Badge>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Alterações não salvas</span>
            </div>
          )}
        </div>

        <Tabs defaultValue="pessoais" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pessoais" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="academicos" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Dados Acadêmicos
            </TabsTrigger>
            <TabsTrigger value="pagamento" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pagamento
            </TabsTrigger>
          </TabsList>

          {/* Aba Dados Pessoais */}
          <TabsContent value="pessoais" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome completo do aluno"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroBI" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Número do BI
                </Label>
                <Input
                  id="numeroBI"
                  value={formData.numeroBI || ''}
                  onChange={(e) => handleInputChange('numeroBI', e.target.value)}
                  placeholder="000000000LA000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="912345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Nascimento
                </Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento || ''}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço
                </Label>
                <Input
                  id="endereco"
                  value={formData.endereco || ''}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Endereço completo"
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba Dados Acadêmicos */}
          <TabsContent value="academicos" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="curso">Curso *</Label>
                <Select
                  value={formData.curso}
                  onValueChange={(value) => handleInputChange('curso', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCursos.map(curso => (
                      <SelectItem key={curso} value={curso}>
                        {curso.replace(/[-_]/g, ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroEstudante">Número do Estudante</Label>
                <Input
                  id="numeroEstudante"
                  value={formData.numeroEstudante || ''}
                  readOnly
                  className="bg-muted"
                  placeholder="Gerado automaticamente"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInscricao">Data de Inscrição</Label>
                <Input
                  id="dataInscricao"
                  type="date"
                  value={formData.dataInscricao}
                  onChange={(e) => handleInputChange('dataInscricao', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio || '2025-02-15'}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração do Curso</Label>
                <Input
                  id="duracao"
                  value={formData.duracao || '3 Meses'}
                  onChange={(e) => handleInputChange('duracao', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                <Input
                  id="turno"
                  value={formData.turno || ''}
                  onChange={(e) => handleInputChange('turno', e.target.value)}
                  placeholder="Ex: 08h00 - 12h00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações adicionais sobre o aluno"
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Aba Pagamento */}
          <TabsContent value="pagamento" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <CreditCard className="w-5 h-5" />
                <span className="font-semibold">Valor do Preparatório</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(40000)}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Pagamento único do curso preparatório
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Select
                  value={formData.formaPagamento || 'Cash'}
                  onValueChange={(value) => handleInputChange('formaPagamento', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">
                      <div className="flex items-center gap-2">
                        <span>💵</span>
                        <span>Dinheiro (Cash)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Transferencia">
                      <div className="flex items-center gap-2">
                        <span>🏦</span>
                        <span>Transferência Bancária</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Cartao">
                      <div className="flex items-center gap-2">
                        <span>💳</span>
                        <span>Cartão</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status do Pagamento</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inscrito">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span>Inscrito (Pendente)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="confirmado">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Confirmado (Pago)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelado">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Cancelado</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview dos valores */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Status Financeiro</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Valor Pago:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(formData.status === 'confirmado' ? 40000 : 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Valor Pendente:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(formData.status === 'confirmado' ? 0 : 40000)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Botões de ação */}
        <div className="flex justify-between">
          <div>
            {onDelete && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Excluir Aluno
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || !hasChanges}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlunoEditDialog;