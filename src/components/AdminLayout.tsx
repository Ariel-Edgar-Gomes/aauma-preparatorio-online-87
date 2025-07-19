import { NavLink, useLocation, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  DollarSign, 
  GraduationCap,
  ArrowLeft,
  LogOut,
  User,
  UserCog,
  Shield,
  Eye,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const getAllNavigationItems = () => [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    permissions: []
  },
  {
    title: "Inscrições",
    url: "/inscricoes",
    icon: Eye,
    permissions: []
  },
  {
    title: "Usuários",
    url: "/admin/usuarios",
    icon: UserCog,
    permissions: ['admin']
  },
  {
    title: "Turmas",
    url: "/admin/turmas",
    icon: Users,
    permissions: ['admin', 'gestor_turmas']
  },
  {
    title: "Gestão Individual",
    url: "/admin/gestao-individual",
    icon: Users,
    permissions: ['admin', 'inscricao_simples', 'inscricao_completa', 'visualizador']
  },
  {
    title: "Pesquisa Global",
    url: "/admin/pesquisa-global",
    icon: Search,
    permissions: []
  },
  {
    title: "Horários",
    url: "/admin/horarios",
    icon: Clock,
    permissions: ['admin']
  },
  {
    title: "Financeiro",
    url: "/admin/financeiro",
    icon: DollarSign,
    permissions: ['admin', 'financeiro', 'visualizador']
  },
  {
    title: "Auditoria",
    url: "/admin/auditoria",
    icon: Shield,
    permissions: ['admin']
  },
  {
    title: "Nova Inscrição",
    url: "/inscricao",
    icon: GraduationCap,
    permissions: ['admin', 'inscricao_simples', 'inscricao_completa']
  }
];

function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { hasRole, isAdmin } = useAuth();
  
  const navigationItems = getAllNavigationItems().filter(item => {
    if (item.permissions.length === 0) return true;
    if (isAdmin()) return true;
    return item.permissions.some(permission => hasRole(permission as any));
  });

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin" || currentPath === "/admin/dashboard";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar 
      className={collapsed ? "w-16" : "w-64"} 
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">{/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
              alt="AAUMA" 
              className="w-8 h-8 object-contain"
            />
            {!collapsed && (
              <span className="font-semibold text-sidebar-foreground">Admin AAUMA</span>
            )}
          </div>
        </div>

        {/* Navegação */}
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${isActive(item.url) 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                          : "text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
                        }
                      `}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout() {
  const { user, signOut, roles } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-primary" />
              <h1 className="font-semibold text-lg text-foreground">Painel Administrativo</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{user?.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {roles.length > 0 ? roles.join(', ') : 'Usuário'}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </header>

          {/* Conteúdo */}
          <div className="flex-1 overflow-auto p-6 bg-muted/30">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}