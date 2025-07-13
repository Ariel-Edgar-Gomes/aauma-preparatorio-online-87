import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, User, CreditCard, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { alunosService } from "@/services/supabaseService";

interface AlunoFinanceiroEdit {
  id: string;
  nome: string;
  email?: string;
  numeroEstudante?: string;
  status: 'inscrito' | 'confirmado' | 'cancelado';
  formaPagamento?: 'Cash' | 'Transferencia' | 'Cartao';
  valorMensalidade: number;
  valorPago: number;
  valorPendente: number;
  statusPagamento: 'pago' | 'pendente' | 'atrasado';
  nomeParTurma: string;
  turmaTipo: 'A' | 'B';
  salaTurma: string;
}

interface EditPaymentDialogProps {
  aluno: AlunoFinanceiroEdit | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditPaymentDialog = ({ aluno, isOpen, onClose, onUpdate }: EditPaymentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: 'inscrito' as 'inscrito' | 'confirmado' | 'cancelado',
    formaPagamento: 'Cash' as 'Cash' | 'Transferencia' | 'Cartao',
    valorPago: 0
  });
  const { toast } = useToast();

  // Atualizar form data quando aluno muda
  useEffect(() => {
    if (aluno) {
      setFormData({
        status: aluno.status,
        formaPagamento: aluno.formaPagamento || 'Cash',
        valorPago: aluno.valorPago
      });
    }
  }, [aluno]);

  const VALOR_MENSALIDADE = 40000; // 400.00 AOA

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'atrasado': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleSave = async () => {
    if (!aluno) return;

    setLoading(true);
    try {
      // Atualizar status e forma de pagamento
      await alunosService.update(aluno.id, {
        status: formData.status as 'inscrito' | 'confirmado' | 'cancelado',
        forma_pagamento: formData.formaPagamento as 'Cash' | 'Transferencia' | 'Cartao',
        valor_pago: formData.status === 'confirmado' ? VALOR_MENSALIDADE : 0
      });

      toast({
        title: "Dados atualizados",
        description: "Os dados de pagamento foram atualizados com sucesso.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados de pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNewStatus = () => {
    if (formData.status === 'confirmado') return 'pago';
    if (formData.status === 'cancelado') return 'pendente';
    return aluno?.statusPagamento || 'pendente';
  };

  const calculateNewValues = () => {
    if (formData.status === 'confirmado') {
      return { valorPago: VALOR_MENSALIDADE, valorPendente: 0 };
    }
    return { valorPago: 0, valorPendente: VALOR_MENSALIDADE };
  };

  const newStatus = calculateNewStatus();
  const newValues = calculateNewValues();

  if (!aluno) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Editar Dados de Pagamento
          </DialogTitle>
          <DialogDescription>
            Altere o status de pagamento e forma de pagamento do aluno
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Aluno */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{aluno.nome}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Nº Estudante: {aluno.numeroEstudante}</div>
              <div>Turma: {aluno.turmaTipo} - {aluno.salaTurma}</div>
              <div>Par: {aluno.nomeParTurma}</div>
              <div>Valor: {formatCurrency(VALOR_MENSALIDADE)}</div>
            </div>
          </div>

          {/* Status Atual */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status Atual</Label>
            <div className="flex items-center gap-3">
              <Badge variant={aluno.status === 'confirmado' ? 'default' : aluno.status === 'inscrito' ? 'secondary' : 'destructive'}>
                {aluno.status.charAt(0).toUpperCase() + aluno.status.slice(1)}
              </Badge>
              <Badge className={getStatusColor(aluno.statusPagamento)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(aluno.statusPagamento)}
                  {aluno.statusPagamento.charAt(0).toUpperCase() + aluno.statusPagamento.slice(1)}
                </div>
              </Badge>
            </div>
          </div>

          {/* Formulário de Edição */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Novo Status de Inscrição</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inscrito">Inscrito (Pendente)</SelectItem>
                  <SelectItem value="confirmado">Confirmado (Pago)</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
              <Select 
                value={formData.formaPagamento} 
                onValueChange={(value) => setFormData({...formData, formaPagamento: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Transferencia">Transferência</SelectItem>
                  <SelectItem value="Cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview das Mudanças */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Após as Alterações
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Status Pagamento:</span>
                <Badge className={getStatusColor(newStatus)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(newStatus)}
                    {newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                  </div>
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Valor Pago:</span>
                <span className="font-bold text-green-600">{formatCurrency(newValues.valorPago)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Valor Pendente:</span>
                <span className="font-bold text-red-600">{formatCurrency(newValues.valorPendente)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentDialog;