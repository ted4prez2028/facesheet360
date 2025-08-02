
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
  Stethoscope,
  FileText,
  Pill,
  CreditCard,
  BarChart3,
  UserCheck,
  Phone,
  BellRing,
  Shield,
  Briefcase,
  Package,
  DollarSign,
  Zap,
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
          title: "Patients",
          icon: Users,
          path: "/patients",
        },
        {
          title: "Appointments",
          icon: Calendar,
          path: "/appointments",
        },
        {
          title: "Charting",
          icon: ClipboardList,
          path: "/charting",
        },
      ],
    },
    {
      group: "Clinical",
      items: [
        {
          title: "Wound Care",
          icon: Stethoscope,
          path: "/patients", // Navigate to patients list to select a patient
        },
        {
          title: "Pharmacy",
          icon: Pill,
          path: "/pharmacy",
        },
        {
          title: "Analytics",
          icon: BarChart3,
          path: "/analytics",
        },
      ],
    },
    {
      group: "Financial",
      items: [
        {
          title: "Wallet",
          icon: CreditCard,
          path: "/wallet-dashboard",
        },
        {
          title: "Subscription",
          icon: Package,
          path: "/subscription",
        },
      ],
    },
    {
      group: "Administration",
      items: [
        {
          title: "Doctor Accounts",
          icon: UserCheck,
          path: "/doctor-accounts",
        },
        {
          title: "Menu Sync",
          icon: Package,
          path: "/menu-sync",
        },
        {
          title: "Settings",
          icon: Settings,
          path: "/settings",
        },
        {
          title: "Profile",
          icon: Users,
          path: "/profile",
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon">
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
                        onClick={() => navigate(item.path)}
                      >
                        <item.icon className="h-5 w-5 mr-2" />
                        <span>{item.title}</span>
                        <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
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
