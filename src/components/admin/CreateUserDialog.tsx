
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/components/AuthProvider";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  inscricao_simples: "Inscrição Simples",
  inscricao_completa: "Inscrição Completa",
  visualizador: "Visualizador",
  financeiro: "Financeiro",
  gestor_turmas: "Gestor de Turmas"
};

const roleDescriptions: Record<UserRole, string> = {
  admin: "Acesso total ao sistema",
  inscricao_simples: "Pode fazer inscrições e ver alunos que inscreveu",
  inscricao_completa: "Pode fazer inscrições, ver e editar alunos",
  visualizador: "Pode apenas visualizar dados sem editar",
  financeiro: "Acesso aos dados financeiros",
  gestor_turmas: "Pode gerenciar turmas e pares de turmas"
};

export const CreateUserDialog = ({ open, onOpenChange, onUserCreated }: CreateUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    roles: [] as UserRole[]
  });

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name || newUser.roles.length === 0) {
      toast.error("Preencha todos os campos e selecione pelo menos um papel");
      return;
    }

    try {
      setLoading(true);

      // Criar usuário usando signup normal (não admin API)
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast.error("Erro ao criar usuário: " + error.message);
        return;
      }

      if (data.user) {
        // Aguardar um pouco para garantir que o perfil foi criado
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Adicionar roles usando edge function (será criada)
        const { error: roleError } = await supabase.functions.invoke('assign-user-roles', {
          body: {
            userId: data.user.id,
            roles: newUser.roles
          }
        });

        if (roleError) {
          console.error("Erro ao atribuir roles:", roleError);
          toast.error("Usuário criado, mas erro ao atribuir permissões");
        } else {
          toast.success("Usuário criado com sucesso!");
        }
      }

      onOpenChange(false);
      setNewUser({ email: "", password: "", full_name: "", roles: [] });
      onUserCreated();
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário e defina suas permissões
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="usuario@exemplo.com"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={newUser.full_name}
              onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
              placeholder="Nome do usuário"
            />
          </div>
          
          <div>
            <Label>Papéis/Permissões</Label>
            <div className="space-y-2 mt-2">
              {Object.entries(roleLabels).map(([role, label]) => (
                <div key={role} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={role}
                    checked={newUser.roles.includes(role as UserRole)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewUser({
                          ...newUser,
                          roles: [...newUser.roles, role as UserRole]
                        });
                      } else {
                        setNewUser({
                          ...newUser,
                          roles: newUser.roles.filter(r => r !== role)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={role} className="text-sm">
                    {label}
                    <span className="block text-xs text-muted-foreground">
                      {roleDescriptions[role as UserRole]}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={createUser} className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar Usuário"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
