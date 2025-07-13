
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, RefreshCw, Users, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
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
      <div className="min-h-screen bg-gradient-to-br from-aauma-light-gray via-white to-aauma-light-gray flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-aauma-navy mx-auto mb-4" />
          <p className="text-aauma-dark-gray">Carregando horários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aauma-light-gray via-white to-aauma-light-gray">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-aauma-red">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
                alt="AAUMA Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-aauma-navy">Admin - Gestão de Horários</h1>
                <p className="text-sm text-aauma-dark-gray">Preparatório AAUMA 2025-2026</p>
              </div>
            </Link>
            
            <div className="flex gap-2">
              <Link to="/admin/turmas">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Gestão de Turmas
                </Button>
              </Link>

              <Link to="/admin/financeiro">
                <Button variant="outline">
                  Gestão Financeira
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <ScheduleGrid
          schedules={schedules}
          onEditSchedule={handleEditSchedule}
          onDeleteSchedule={handleDeleteSchedule}
        />
      </div>
    </div>
  );
};

export default AdminHorarios;
