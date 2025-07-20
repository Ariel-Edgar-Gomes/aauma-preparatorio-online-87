import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/components/AuthProvider";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string;
    roles: UserRole[];
  } | null;
  onUserUpdated: () => void;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  inscricao_simples: "Inscrição Simples",
  inscricao_completa: "Inscrição Completa",
  visualizador: "Visualizador",
  financeiro: "Financeiro",
  gestor_turmas: "Gestor de Turmas"
};

export const EditUserDialog = ({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: ""
  });
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        password: ""
      });
      setSelectedRoles(user.roles);
    }
  }, [user]);

  const handleRoleChange = (role: UserRole, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Atualizar roles
      // Primeiro, deletar todas as roles existentes
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      // Inserir as novas roles
      if (selectedRoles.length > 0) {
        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(
            selectedRoles.map(role => ({
              user_id: user.id,
              role
            }))
          );

        if (rolesError) throw rolesError;
      }

      toast.success("Usuário atualizado com sucesso!");
      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao atualizar usuário: " + error.message);
    }
  };

  const resetPassword = async () => {
    if (!user || !formData.password) {
      toast.error("Digite uma nova senha");
      return;
    }

    try {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: formData.password
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (error: any) {
      toast.error("Erro ao alterar senha: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    await updateProfile();
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Altere as informações do usuário e suas permissões
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Perfil & Permissões</TabsTrigger>
            <TabsTrigger value="password">Alterar Senha</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Papéis do Usuário</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={selectedRoles.includes(role as UserRole)}
                        onCheckedChange={(checked) => 
                          handleRoleChange(role as UserRole, checked as boolean)
                        }
                      />
                      <Label htmlFor={role} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">Nova Senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite a nova senha"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={resetPassword}
                  disabled={!formData.password || loading}
                >
                  Alterar Senha
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};