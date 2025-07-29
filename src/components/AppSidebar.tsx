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
    isActive 
      ? "bg-aauma-navy text-white font-semibold shadow-lg border-l-4 border-aauma-red" 
      : "text-black font-medium hover:bg-aauma-light-gray hover:text-black transition-all duration-200 hover-scale";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} bg-white border-r-2 border-aauma-light-gray shadow-lg`} collapsible="icon">
      <SidebarHeader className="bg-gradient-to-r from-aauma-navy to-aauma-red p-4">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
            alt="AAUMA Logo" 
            className="w-10 h-10 object-contain rounded-lg bg-white p-1"
          />
          {!collapsed && (
            <div className="text-white">
              <h2 className="text-lg font-bold">AAUMA</h2>
              <p className="text-sm opacity-90">Sistema Preparatório</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white p-2">
        {/* Botão de Voltar */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="w-full justify-start gap-3 text-aauma-navy border-aauma-light-gray hover:bg-aauma-light-gray transition-all duration-200 mb-4"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    {!collapsed && <span className="font-medium">Voltar</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navegação Principal */}
        <SidebarGroup className="mb-4">
          <SidebarGroupLabel className="text-aauma-navy font-bold text-sm uppercase tracking-wide mb-2">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Inscrições */}
        <SidebarGroup className="mb-4">
          <SidebarGroupLabel className="text-aauma-navy font-bold text-sm uppercase tracking-wide mb-2">Inscrições</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {inscricaoItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração */}
        <SidebarGroup className="mb-4">
          <SidebarGroupLabel className="text-aauma-navy font-bold text-sm uppercase tracking-wide mb-2">Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-aauma-light-gray border-t-2 border-aauma-navy">
        {!collapsed && user && (
          <div className="p-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs font-medium text-aauma-dark-gray uppercase tracking-wide">Logado como:</p>
              <p className="text-sm font-bold text-aauma-navy truncate mt-1">{user.email}</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}