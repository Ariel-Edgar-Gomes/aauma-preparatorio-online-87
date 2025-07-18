
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, UserRole } from "@/components/AuthProvider";
import { UserPlus, Trash2, FileText } from "lucide-react";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { AuditLogDialog } from "@/components/admin/AuditLogDialog";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  roles: UserRole[];
}

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  inscricao_simples: "Inscrição Simples",
  inscricao_completa: "Inscrição Completa",
  visualizador: "Visualizador",
  financeiro: "Financeiro",
  gestor_turmas: "Gestor de Turmas"
};

const GestaoUsuarios = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      // Buscar perfis
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        toast.error("Erro ao carregar usuários: " + profilesError.message);
        return;
      }

      // Buscar roles para cada usuário
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            roles: roles?.map(r => r.role as UserRole) || []
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Erro ao carregar usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      // Excluir roles do usuário primeiro
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Excluir perfil (isso também excluirá o usuário da auth devido ao CASCADE)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        toast.error("Erro ao excluir usuário: " + error.message);
        return;
      }

      toast.success("Usuário excluído com sucesso!");
      fetchUsers();
    } catch (error: any) {
      toast.error("Erro ao excluir usuário: " + error.message);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Acesso negado. Apenas administradores podem gerenciar usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie usuários e suas permissões no sistema</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAuditDialog(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Log de Auditoria
          </Button>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Criar Usuário
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Lista de todos os usuários e suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papéis</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="secondary">
                            {roleLabels[role]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={fetchUsers}
      />

      <AuditLogDialog
        open={showAuditDialog}
        onOpenChange={setShowAuditDialog}
      />
    </div>
  );
};

export default GestaoUsuarios;
