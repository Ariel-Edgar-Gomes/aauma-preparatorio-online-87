import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { salasService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

interface Sala {
  id: string;
  codigo: string;
  capacidade: number;
  tipo: string;
  ativo: boolean;
}

export function SalasManagement() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    capacidade: 30,
    tipo: "sala",
    ativo: true
  });
  const { toast } = useToast();

  const loadSalas = async () => {
    try {
      setLoading(true);
      const data = await salasService.getAll();
      setSalas(data || []);
    } catch (error) {
      console.error('Erro ao carregar salas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar salas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalas();
  }, []);

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
      if (editingSala) {
        await salasService.update(editingSala.id, formData);
        toast({
          title: "Sucesso",
          description: "Sala atualizada com sucesso",
        });
      } else {
        await salasService.create(formData);
        toast({
          title: "Sucesso", 
          description: "Sala criada com sucesso",
        });
      }
      setDialogOpen(false);
      loadSalas();
    } catch (error) {
      console.error('Erro ao salvar sala:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar sala",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta sala?")) return;
    
    try {
      await salasService.delete(id);
      toast({
        title: "Sucesso",
        description: "Sala deletada com sucesso",
      });
      loadSalas();
    } catch (error) {
      console.error('Erro ao deletar sala:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar sala",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando salas...</div>;
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
            {salas.map((sala) => (
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}