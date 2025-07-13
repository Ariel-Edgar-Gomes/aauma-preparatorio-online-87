
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, RefreshCw } from "lucide-react";
import { Schedule } from "@/types/schedule";
import { useScheduleData } from "@/hooks/useScheduleData";
import { ScheduleForm } from "@/components/admin/ScheduleForm";
import { ScheduleGrid } from "@/components/admin/ScheduleGrid";

const AdminHorarios = () => {
  const { 
    schedules, 
    loading, 
    handleSaveSchedule, 
    handleDeleteSchedule 
  } = useScheduleData();
  
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule({ ...schedule });
    setIsDialogOpen(true);
  };

  const handleSave = (scheduleData: Omit<Schedule, 'id'>, editingSchedule?: Schedule) => {
    const success = handleSaveSchedule(scheduleData, editingSchedule);
    if (success) {
      setEditingSchedule(null);
      setIsDialogOpen(false);
    }
    return success;
  };

  const handleCloseDialog = () => {
    setEditingSchedule(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando horários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Gestão de Horários</h2>
        <p className="text-muted-foreground">Configure os horários das disciplinas do preparatório</p>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSchedule(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Horário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Editar Horário' : 'Novo Horário'}
              </DialogTitle>
              <DialogDescription>
                {editingSchedule 
                  ? 'Modifique os dados do horário abaixo.'
                  : 'Preencha os dados para criar um novo horário.'
                }
              </DialogDescription>
            </DialogHeader>
            <ScheduleForm
              editingSchedule={editingSchedule}
              onSave={handleSave}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <ScheduleGrid
        schedules={schedules}
        onEditSchedule={handleEditSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />
    </div>
  );
};

export default AdminHorarios;
