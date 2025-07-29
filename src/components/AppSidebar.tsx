import { useState } from "react";
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
  DollarSign,
  ChevronLeft,
  Settings
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

const mainItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Inscrições", url: "/inscricoes", icon: FileText },
];

const inscricaoItems = [
  { title: "Nova Inscrição", url: "/inscricao", icon: UserPlus },
];

const adminItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Home },
  { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign },
  { title: "Horários", url: "/admin/horarios", icon: Calendar },
  { title: "Turmas", url: "/admin/turmas", icon: GraduationCap },
  { title: "Gestão Individual", url: "/admin/gestao-individual", icon: User },
  { title: "Pesquisa Global", url: "/admin/pesquisa-global", icon: Search },
  { title: "Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Auditoria", url: "/admin/auditoria", icon: FileBarChart },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentPath = location.pathname;
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-aauma-navy text-white font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <img 
            src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
            alt="AAUMA Logo" 
            className="w-8 h-8 object-contain"
          />
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-aauma-navy">AAUMA</h2>
              <p className="text-xs text-aauma-dark-gray">Preparatório</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Botão de Voltar */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    className="w-full justify-start gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {!collapsed && <span>Voltar</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Inscrições */}
        <SidebarGroup>
          <SidebarGroupLabel>Inscrições</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {inscricaoItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração */}
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && user && (
          <div className="p-2 border-t">
            <p className="text-xs text-muted-foreground">Logado como:</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}