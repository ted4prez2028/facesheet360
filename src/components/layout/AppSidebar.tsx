
import { useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  Calendar,
  ChevronRight,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem("healthcareAuth");
    navigate("/login");
  };

  const menuItems = [
    {
      group: "Core",
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          path: "/dashboard",
        },
        {
          title: "Patients",
          icon: Users,
          path: "/patients",
        },
        {
          title: "Charting",
          icon: ClipboardList,
          path: "/charting",
        },
        {
          title: "Appointments",
          icon: Calendar,
          path: "/appointments",
        },
      ],
    },
    {
      group: "Analysis",
      items: [
        {
          title: "Analytics",
          icon: Activity,
          path: "/analytics",
        },
      ],
    },
    {
      group: "System",
      items: [
        {
          title: "Settings",
          icon: Settings,
          path: "/settings",
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="py-6">
        <div className="flex items-center px-4">
          <Heart className="h-6 w-6 text-health-600 mr-2" />
          <h1 className="text-xl font-semibold">Facesheet360</h1>
        </div>
        <div className="lg:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className={cn(
                        location.pathname === item.path && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.title}</span>
                      <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
