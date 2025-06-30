
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
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
  ChevronDown,
  ChevronUp,
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
import { useAuth } from "@/context/AuthContext";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");  // Redirect to homepage after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleSubMenu = (title: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
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
          title: "Charts",
          icon: ClipboardList,
          path: "/charting",
          subItems: [
            {
              title: "Patient List",
              path: "/patients",
            },
            {
              title: "Patient Details",
              path: "/patients/:id",
            },
          ],
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
                  <div key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={cn(
                          location.pathname === item.path && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                        onClick={() => item.subItems ? toggleSubMenu(item.title) : navigate(item.path)}
                      >
                        <item.icon className="h-5 w-5 mr-2" />
                        <span>{item.title}</span>
                        {item.subItems ? (
                          openSubMenus[item.title] ? (
                            <ChevronUp className="h-4 w-4 ml-auto opacity-50" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-auto opacity-50" />
                          )
                        ) : (
                          <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {item.subItems && openSubMenus[item.title] && (
                      <div className="ml-8 border-l border-gray-200 dark:border-gray-700">
                        {item.subItems.map((subItem) => (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton
                              className={cn(
                                "pl-4", // Indent sub-items
                                location.pathname === subItem.path && "bg-sidebar-accent text-sidebar-accent-foreground"
                              )}
                              onClick={() => navigate(subItem.path)}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    )}
                  </div>
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
