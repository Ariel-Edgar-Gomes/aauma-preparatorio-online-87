
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
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="border-aauma-navy text-aauma-navy">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-aauma-navy">Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-6">
            <Link to="/inscricao" onClick={handleLinkClick}>
              <Button className="w-full bg-aauma-red hover:bg-aauma-red/90 text-white justify-start">
                Fazer Inscrição
              </Button>
            </Link>
            <Link to="/admin/horarios" onClick={handleLinkClick}>
              <Button variant="outline" className="w-full border-aauma-navy text-aauma-navy hover:bg-aauma-navy hover:text-white justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Horários
              </Button>
            </Link>
            <Link to="/admin/financeiro" onClick={handleLinkClick}>
              <Button variant="outline" className="w-full border-aauma-navy text-aauma-navy hover:bg-aauma-navy hover:text-white justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
