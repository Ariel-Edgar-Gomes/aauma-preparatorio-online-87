
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Calendar, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[280px] sm:w-[300px]">
          <SheetHeader>
            <SheetTitle className="text-left">Menu de Navegação</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-3 mt-6">
            <Link to="/inscricao" onClick={handleLinkClick}>
              <Button className="w-full bg-aauma-red hover:bg-aauma-red/90 text-white justify-start">
                Fazer Inscrição
              </Button>
            </Link>
            <Link to="/admin" onClick={handleLinkClick}>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Painel Admin
              </Button>
            </Link>
            <Link to="/admin/turmas" onClick={handleLinkClick}>
              <Button variant="ghost" className="w-full justify-start">
                Turmas
              </Button>
            </Link>
            <Link to="/admin/horarios" onClick={handleLinkClick}>
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Horários
              </Button>
            </Link>
            <Link to="/admin/financeiro" onClick={handleLinkClick}>
              <Button variant="ghost" className="w-full justify-start">
                Financeiro
              </Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
