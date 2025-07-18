import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Aluno } from "@/types/turma";
import { useState } from "react";

interface AlunosListProps {
  alunos: Aluno[];
  turmaLabel: string;
  turmaColor: 'blue' | 'red';
}

export const AlunosList = ({ alunos, turmaLabel, turmaColor }: AlunosListProps) => {
  const [expanded, setExpanded] = useState(false);

  if (alunos.length === 0) {
    return (
      <div className="text-center py-2 text-muted-foreground text-xs">
        Nenhum aluno inscrito
      </div>
    );
  }

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      hover: 'hover:bg-blue-100'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200', 
      text: 'text-red-800',
      hover: 'hover:bg-red-100'
    }
  };

  const colors = colorClasses[turmaColor];

  return (
    <div className={`border rounded-lg ${colors.border} ${colors.bg}`}>
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className={`w-full justify-between p-2 h-auto ${colors.hover}`}
      >
        <div className="flex items-center gap-2">
          <Eye className="w-3 h-3" />
          <span className={`text-xs font-medium ${colors.text}`}>
            {turmaLabel} - {alunos.length} aluno{alunos.length !== 1 ? 's' : ''}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </Button>
      
      {expanded && (
        <div className="p-2 pt-0 space-y-2">
          {alunos.map((aluno) => (
            <div key={aluno.id} className="bg-white rounded border p-2 text-xs">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {aluno.nome}
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {aluno.numeroEstudante}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {aluno.telefone}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={
                      aluno.status === 'confirmado'
                        ? 'default'
                        : aluno.status === 'inscrito'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-[9px] px-1 py-0"
                  >
                    {aluno.status}
                  </Badge>
                </div>
              </div>
              
              {/* Informações do criador */}
              {aluno.criador && (
                <div className="mt-1 pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <User className="w-2 h-2" />
                    <span>Inscrito por:</span>
                    <span className="font-medium text-gray-700">
                      {aluno.criador.nome}
                    </span>
                  </div>
                  {aluno.criador.email && (
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Mail className="w-2 h-2" />
                      <span className="truncate">{aluno.criador.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};