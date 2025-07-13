import { NavLink, useLocation, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  DollarSign, 
  GraduationCap,
  ArrowLeft
} from "lucide-react";
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

const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "Turmas",
    url: "/admin/turmas",
    icon: Users
  },
  {
    title: "Gestão Individual",
    url: "/admin/gestao-individual",
    icon: Users
  },
  {
    title: "Horários",
    url: "/admin/horarios",
    icon: Clock
  },
  {
    title: "Financeiro",
    url: "/admin/financeiro",
    icon: DollarSign
  },
  {
    title: "Nova Inscrição",
    url: "/inscricao",
    icon: GraduationCap
  },
  {
    title: "Site Principal",
    url: "/",
    icon: ArrowLeft
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
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-4">
            <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-primary" />
            <h1 className="font-semibold text-lg text-foreground">Painel Administrativo</h1>
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