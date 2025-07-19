import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2, AlertCircle } from "lucide-react";
import { DBSala } from "@/services/supabaseService";
import { useSalasData } from "@/hooks/useSalasData";

type Sala = DBSala;

export function SalasManagement() {
  const { salas, loading, createSala, updateSala, deleteSala } = useSalasData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    capacidade: 30,
    tipo: "sala",
    ativo: true
  });


  const handleOpenDialog = (sala?: Sala) => {
    if (sala) {
      setEditingSala(sala);
      setFormData({
        codigo: sala.codigo,
        capacidade: sala.capacidade,
        tipo: sala.tipo,
        ativo: sala.ativo
      });
    } else {
      setEditingSala(null);
      setFormData({
        codigo: "",
        capacidade: 30,
        tipo: "sala",
        ativo: true
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validações
      if (!formData.codigo.trim()) {
        return;
      }

      if (formData.capacidade < 1) {
        return;
      }

      if (editingSala) {
        await updateSala(editingSala.id, formData);
      } else {
        await createSala(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta sala?")) return;
    
    try {
      await deleteSala(id);
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Salas</CardTitle>
          <CardDescription>Carregando salas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestão de Salas</CardTitle>
            <CardDescription>Gerir salas disponíveis no sistema</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Sala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSala ? "Editar Sala" : "Adicionar Nova Sala"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados da sala
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código da Sala</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: U107, Lab01, Auditório"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    value={formData.capacidade}
                    onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sala">Sala</SelectItem>
                      <SelectItem value="laboratorio">Laboratório</SelectItem>
                      <SelectItem value="auditorio">Auditório</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingSala ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                    <p>Nenhuma sala encontrada</p>
                    <p className="text-sm">Adicione uma sala para começar</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              salas.map((sala) => (
                <TableRow key={sala.id}>
                  <TableCell className="font-medium">{sala.codigo}</TableCell>
                  <TableCell>{sala.capacidade}</TableCell>
                  <TableCell className="capitalize">{sala.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={sala.ativo ? "default" : "secondary"}>
                      {sala.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenDialog(sala)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(sala.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}