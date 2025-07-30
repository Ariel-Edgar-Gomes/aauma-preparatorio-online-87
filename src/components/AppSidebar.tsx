import { 
  Home, 
  UserPlus, 
  FileText, 
  Users, 
  Calendar,
  GraduationCap,
  User,
  Search,
  FileBarChart,
  DollarSign
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Início", url: "/", icon: Home, section: "main" },
  { title: "Inscrições", url: "/inscricoes", icon: FileText, section: "main" },
  { title: "Nova Inscrição", url: "/inscricao", icon: UserPlus, section: "main" },
  { title: "Dashboard", url: "/admin/dashboard", icon: Home, section: "admin" },
  { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign, section: "admin" },
  { title: "Horários", url: "/admin/horarios", icon: Calendar, section: "admin" },
  { title: "Turmas", url: "/admin/turmas", icon: GraduationCap, section: "admin" },
  { title: "Gestão Individual", url: "/admin/gestao-individual", icon: User, section: "admin" },
  { title: "Pesquisa Global", url: "/admin/pesquisa-global", icon: Search, section: "admin" },
  { title: "Usuários", url: "/admin/usuarios", icon: Users, section: "admin" },
  { title: "Auditoria", url: "/admin/auditoria", icon: FileBarChart, section: "admin" },
];

const mainItems = navigationItems.filter(item => item.section === "main");
const adminItems = navigationItems.filter(item => item.section === "admin");

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const NavItem = ({ item }: { item: typeof navigationItems[0] }) => {
    const active = isActive(item.url);
    
    return (
      <NavLink
        to={item.url}
        end={item.url === "/"}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
          active 
            ? "bg-aauma-navy text-white shadow-md" 
            : "text-black hover:bg-aauma-light-gray hover:shadow-sm"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium">{item.title}</span>
      </NavLink>
    );
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-xs font-bold text-aauma-navy uppercase tracking-wider px-4 mb-2 mt-6 first:mt-0">
      {title}
    </h3>
  );

  return (
    <Sidebar className="w-64 bg-white border-r border-border shadow-sm">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
            alt="AAUMA Logo" 
            className="w-8 h-8 object-contain"
          />
          <div>
            <h2 className="text-lg font-bold text-aauma-navy">AAUMA</h2>
            <p className="text-xs text-muted-foreground">Sistema Preparatório</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-1">
        <SectionTitle title="Principal" />
        {mainItems.map((item) => (
          <NavItem key={item.url} item={item} />
        ))}

        <SectionTitle title="Administração" />
        {adminItems.map((item) => (
          <NavItem key={item.url} item={item} />
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border mt-auto">
        {user && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Logado como:
            </p>
            <p className="text-sm font-semibold text-foreground truncate mt-1">
              {user.email}
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}