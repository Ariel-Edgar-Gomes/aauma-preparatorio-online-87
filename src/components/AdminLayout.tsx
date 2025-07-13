import { useState } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Clock, 
  DollarSign, 
  Home, 
  GraduationCap,
  BarChart3,
  Settings,
  Menu,
  X
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
    description: "Visão geral do sistema"
  },
  {
    title: "Gestão de Turmas",
    url: "/admin/turmas",
    icon: Users,
    description: "Gerenciar pares de turmas e alunos"
  },
  {
    title: "Horários",
    url: "/admin/horarios",
    icon: Clock,
    description: "Configurar horários das disciplinas"
  },
  {
    title: "Financeiro",
    url: "/admin/financeiro",
    icon: DollarSign,
    description: "Relatórios e análises financeiras"
  }
];

const quickActions = [
  {
    title: "Nova Inscrição",
    url: "/inscricao",
    icon: GraduationCap,
    description: "Inscrever novo aluno"
  },
  {
    title: "Página Inicial",
    url: "/",
    icon: Home,
    description: "Voltar ao site principal"
  }
];

function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin" || currentPath === "/admin/dashboard";
    }
    return currentPath === path;
  };

  const getNavCls = (isActive: boolean) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 transition-colors";

  return (
    <Sidebar 
      className={collapsed ? "w-16" : "w-64"} 
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarContent className="bg-white border-r border-border">
        {/* Logo/Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
              alt="AAUMA Logo" 
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            {!collapsed && (
              <div>
                <h2 className="font-bold text-sm text-aauma-navy">Admin AAUMA</h2>
                <p className="text-xs text-muted-foreground">2025-2026</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {!collapsed ? "Navegação Principal" : "Nav"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${getNavCls(isActive(item.url))}`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {!collapsed ? "Ações Rápidas" : "Ações"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${getNavCls(isActive(item.url))}`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              © 2025 AAUMA
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Top Bar com Sidebar Toggle */}
          <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1">
              <h1 className="font-semibold text-lg">Painel Administrativo</h1>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}