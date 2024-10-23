import { ReactNode } from "react";
import { NavBar } from "./_components/nav-bar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FxSidebar} from "./_components/fx-sidebar";

const DashboardLayout = ({ children }:{children: ReactNode}) => {
  return (
      <SidebarProvider>
          <FxSidebar />
          <SidebarInset>
              <main className="m-2">
                  <NavBar />
                  {children}
              </main>
          </SidebarInset>
      </SidebarProvider>
  );
}
export default DashboardLayout