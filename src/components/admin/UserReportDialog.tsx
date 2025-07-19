import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Printer, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';

interface UserReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface StudentStats {
  total: number;
  inscrito: number;
  confirmado: number;
  cancelado: number;
  students: Array<{
    nome: string;
    curso: string;
    status: string;
    data_inscricao: string;
    numero_estudante: string;
  }>;
}

export const UserReportDialog: React.FC<UserReportDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserStats = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          nome,
          curso_codigo,
          status,
          data_inscricao,
          numero_estudante
        `)
        .eq('created_by', userId);

      if (error) throw error;

      const students = data || [];
      const stats = {
        total: students.length,
        inscrito: students.filter(s => s.status === 'inscrito').length,
        confirmado: students.filter(s => s.status === 'confirmado').length,
        cancelado: students.filter(s => s.status === 'cancelado').length,
        students: students.map(s => ({
          nome: s.nome,
          curso: s.curso_codigo,
          status: s.status,
          data_inscricao: s.data_inscricao,
          numero_estudante: s.numero_estudante || 'N/A'
        }))
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas do usuário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!stats || !selectedUserId) return;

    const selectedUser = users.find(u => u.id === selectedUserId);
    if (!selectedUser) return;

    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(16);
    pdf.text('RELATÓRIO INDIVIDUAL DE INSCRIÇÕES', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Usuário: ${selectedUser.full_name}`, 20, 35);
    pdf.text(`Email: ${selectedUser.email}`, 20, 45);
    pdf.text(`Data do Relatório: ${new Date().toLocaleDateString('pt-AO')}`, 20, 55);
    
    // Statistics
    pdf.setFontSize(14);
    pdf.text('ESTATÍSTICAS', 20, 75);
    
    pdf.setFontSize(10);
    pdf.text(`Total de Alunos: ${stats.total}`, 20, 90);
    pdf.text(`Inscritos: ${stats.inscrito}`, 20, 100);
    pdf.text(`Confirmados: ${stats.confirmado}`, 20, 110);
    pdf.text(`Cancelados: ${stats.cancelado}`, 20, 120);
    
    // Students list
    pdf.setFontSize(14);
    pdf.text('LISTA DE ALUNOS', 20, 140);
    
    pdf.setFontSize(8);
    let yPos = 155;
    
    // Headers
    pdf.text('Nome', 20, yPos);
    pdf.text('Nº Estudante', 80, yPos);
    pdf.text('Curso', 120, yPos);
    pdf.text('Status', 160, yPos);
    pdf.text('Data Inscrição', 180, yPos);
    
    yPos += 10;
    pdf.line(20, yPos - 5, 200, yPos - 5);
    
    // Student rows
    stats.students.forEach((student) => {
      if (yPos > 280) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.text(student.nome.substring(0, 25), 20, yPos);
      pdf.text(student.numero_estudante, 80, yPos);
      pdf.text(student.curso, 120, yPos);
      pdf.text(student.status, 160, yPos);
      pdf.text(new Date(student.data_inscricao).toLocaleDateString('pt-AO'), 180, yPos);
      
      yPos += 8;
    });
    
    pdf.save(`relatorio-${selectedUser.full_name.replace(/\s+/g, '-')}.pdf`);
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-aauma-navy">
            Relatório Individual de Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Selecionar Usuário:</label>
            <Select value={selectedUserId} onValueChange={(value) => {
              setSelectedUserId(value);
              if (value) {
                fetchUserStats(value);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Carregando dados...</span>
            </div>
          )}

          {stats && selectedUser && (
            <div className="bg-aauma-light-gray p-4 rounded-lg">
              <h3 className="font-medium text-aauma-navy mb-3">
                Estatísticas - {selectedUser.full_name}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total de Alunos:</span>
                  <span className="ml-2 text-aauma-navy">{stats.total}</span>
                </div>
                <div>
                  <span className="font-medium">Inscritos:</span>
                  <span className="ml-2 text-blue-600">{stats.inscrito}</span>
                </div>
                <div>
                  <span className="font-medium">Confirmados:</span>
                  <span className="ml-2 text-green-600">{stats.confirmado}</span>
                </div>
                <div>
                  <span className="font-medium">Cancelados:</span>
                  <span className="ml-2 text-red-600">{stats.cancelado}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={generatePDF}
              disabled={!stats}
              className="flex-1 bg-aauma-navy hover:bg-aauma-navy/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              disabled={!stats}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};