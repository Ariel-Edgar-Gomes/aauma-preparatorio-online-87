import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, UserRole } from "@/components/AuthProvider";
import { Plus, UserPlus, Edit, Trash2 } from "lucide-react";

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

const roleDescriptions: Record<UserRole, string> = {
  admin: "Acesso total ao sistema",
  inscricao_simples: "Pode fazer inscrições e ver alunos que inscreveu",
  inscricao_completa: "Pode fazer inscrições, ver e editar alunos",
  visualizador: "Pode apenas visualizar dados sem editar",
  financeiro: "Acesso aos dados financeiros",
  gestor_turmas: "Pode gerenciar turmas e pares de turmas"
};

const GestaoUsuarios = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    roles: [] as UserRole[]
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        toast.error("Erro ao carregar usuários: " + profilesError.message);
        return;
      }

      // Fetch roles for each user
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

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name || newUser.roles.length === 0) {
      toast.error("Preencha todos os campos e selecione pelo menos um papel");
      return;
    }

    try {
      setLoading(true);

      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        user_metadata: {
          full_name: newUser.full_name
        }
      });

      if (error) {
        toast.error("Erro ao criar usuário: " + error.message);
        return;
      }

      // Add roles
      if (data.user) {
        for (const role of newUser.roles) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: role
            });
        }
      }

      toast.success("Usuário criado com sucesso!");
      setShowCreateDialog(false);
      setNewUser({ email: "", password: "", full_name: "", roles: [] });
      fetchUsers();
    } catch (error: any) {
      toast.error("Erro ao criar usuário: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
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
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Criar Usuário
            </Button>
          </DialogTrigger>
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
    </div>
  );
};

export default GestaoUsuarios;