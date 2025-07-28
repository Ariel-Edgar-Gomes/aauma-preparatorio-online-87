import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header com trigger da sidebar */}
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger className="mr-2" />
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/9e56fb52-9dc2-4075-8e3e-8b20fd589107.png" 
                alt="AAUMA Logo" 
                className="w-6 h-6 object-contain"
              />
              <h1 className="text-lg font-semibold text-aauma-navy">Preparatório AAUMA</h1>
            </div>
          </header>
          
          {/* Conteúdo principal */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}