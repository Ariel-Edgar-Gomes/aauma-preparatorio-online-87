import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Aluno } from "@/types/turma";

interface SendFilesDialogProps {
  aluno: Aluno | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SendFilesDialog: React.FC<SendFilesDialogProps> = ({
  aluno,
  open,
  onOpenChange
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendFiles = async () => {
    if (!aluno) return;

    setLoading(true);
    try {
      // Get file URLs from the student record
      const fileUrls = [
        aluno.foto_url,
        aluno.copia_bi_url,
        aluno.declaracao_certificado_url,
        aluno.comprovativo_pagamento_url
      ].filter(Boolean);

      if (fileUrls.length === 0) {
        toast({
          title: "Nenhum ficheiro encontrado",
          description: "Este aluno não possui ficheiros anexados.",
          variant: "destructive"
        });
        return;
      }

      // Download and convert files to base64
      const files = [];
      for (const url of fileUrls) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              resolve(base64String.split(',')[1]); // Remove data:type;base64, prefix
            };
            reader.readAsDataURL(blob);
          });

          const fileName = url.split('/').pop() || 'file';
          files.push({
            name: fileName,
            content: base64,
            type: blob.type
          });
        } catch (error) {
          console.error('Error processing file:', url, error);
        }
      }

      // Send email with files
      const { error } = await supabase.functions.invoke('send-files-email', {
        body: {
          studentName: aluno.nome,
          studentInfo: {
            curso: aluno.curso,
            numeroEstudante: aluno.numeroEstudante,
            dataInscricao: aluno.dataInscricao,
            turno: aluno.turno,
            par: aluno.par,
            turma: aluno.turma,
            telefone: aluno.telefone,
            email: aluno.email
          },
          files: files
        }
      });

      if (error) throw error;

      toast({
        title: "Email enviado com sucesso",
        description: `Os ficheiros de ${aluno.nome} foram enviados por email.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error sending files:', error);
      toast({
        title: "Erro ao enviar email",
        description: "Ocorreu um erro ao enviar os ficheiros por email.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!aluno) return null;

  const fileCount = [
    aluno.foto_url,
    aluno.copia_bi_url,
    aluno.declaracao_certificado_url,
    aluno.comprovativo_pagamento_url
  ].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-aauma-navy">
            Enviar Ficheiros por Email
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-aauma-light-gray p-4 rounded-lg">
            <p className="font-medium text-aauma-navy">Aluno:</p>
            <p className="text-gray-700">{aluno.nome}</p>
            
            <p className="font-medium text-aauma-navy mt-2">Ficheiros disponíveis:</p>
            <p className="text-gray-700">{fileCount} ficheiro(s)</p>
            
            <p className="font-medium text-aauma-navy mt-2">Destino:</p>
            <p className="text-gray-700">arieledgargomes02@gmail.com</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendFiles}
              disabled={loading || fileCount === 0}
              className="flex-1 bg-aauma-navy hover:bg-aauma-navy/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Enviar Email
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};