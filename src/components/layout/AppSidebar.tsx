
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
  Database,
  DollarSign,
  Zap,
  Wallet,
  Utensils,
  Shield as ShieldIcon,
  Lock,
  Car,
  TrendingUp,
  Video,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/lib/sidebar";
import { SidebarContent } from "@/lib/sidebar-content";
import { SidebarFooter } from "@/lib/sidebar-footer";
import { SidebarGroup } from "@/lib/sidebar-group";
import { SidebarGroupContent } from "@/lib/sidebar-group-content";
import { SidebarGroupLabel } from "@/lib/sidebar-group-label";
import { SidebarMenu } from "@/lib/sidebar-menu";
import { SidebarMenuItem } from "@/lib/sidebar-menu-item";
import { SidebarMenuButton } from "@/lib/sidebar-menu-button";
import { useAuth } from "@/hooks/useAuth";
import { useRolePermissions } from "@/hooks/useRolePermissions";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const { hasRole } = useRolePermissions();
  const isPatient = hasRole('patient');

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

  const staffMenuItems = [
    {
      group: "Core",
      items: [
        { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { title: "Patients", icon: Users, path: "/patients" },
        { title: "Appointments", icon: Calendar, path: "/appointments" },
        { title: "Communication", icon: Phone, path: "/communication" },
      ],
    },
    {
      group: "Clinical",
      items: [
        { title: "Patient Monitoring", icon: Activity, path: "/patient-monitoring" },
        { title: "Decision Support", icon: Stethoscope, path: "/clinical-decision-support" },
        { title: "Care Coordination", icon: Users, path: "/care-coordination" },
        { title: "Pharmacy", icon: Pill, path: "/pharmacy" },
        { title: "Analytics", icon: BarChart3, path: "/analytics" },
        { title: "Predictive Analytics", icon: TrendingUp, path: "/predictive-analytics" },
      ],
    },
    {
      group: "Transportation",
      items: [
        { title: "Taxi Service", icon: Car, path: "/taxi" },
        { title: "Ride History", icon: BarChart3, path: "/ride-history" },
        { title: "Driver Dashboard", icon: Car, path: "/driver" },
      ],
    },
    {
      group: "Financial",
      items: [
        { title: "CareCoin Wallet", icon: Wallet, path: "/wallet-dashboard" },
        { title: "CareCoin Ecosystem", icon: TrendingUp, path: "/carecoin-ecosystem" },
        { title: "Wallet Management", icon: Settings, path: "/wallet-management" },
        { title: "Transaction History", icon: BarChart3, path: "/carecoins-transactions" },
        { title: "CareCoin Analytics", icon: DollarSign, path: "/carecoins-analytics" },
        { title: "Cash-Out Requests", icon: CreditCard, path: "/admin/cashout-requests" },
        { title: "Subscription", icon: Package, path: "/subscription" },
      ],
    },
    {
      group: "Healthcare Services",
      items: [
        { title: "Telemedicine", icon: Video, path: "/telemedicine" },
        { title: "Patient Education", icon: BookOpen, path: "/patient-education" },
        { title: "Inventory", icon: Package, path: "/inventory" },
        { title: "Reports & Analytics", icon: BarChart3, path: "/reports" },
      ],
    },
    {
      group: "Administration",
      items: [
        { title: "Food", icon: Utensils, path: "/food" },
        { title: "Driver Management", icon: Car, path: "/admin/drivers" },
        { title: "Compliance Center", icon: Shield, path: "/compliance-center" },
        { title: "EHR Import", icon: Database, path: "/ehr-import" },
        { title: "Audit Logs", icon: ShieldIcon, path: "/audit-logs" },
        { title: "Security & Compliance", icon: Lock, path: "/security" },
        { title: "Security Settings", icon: Lock, path: "/security-settings" },
        { title: "Settings", icon: Settings, path: "/settings" },
        { title: "Profile", icon: Users, path: "/profile" },
      ],
    },
  ];

  const patientMenuItems = [
    {
      group: "Patient",
      items: [
        { title: "Patient Portal", icon: Heart, path: "/patient-portal" },
        { title: "My Chart", icon: FileText, path: "/my-chart" },
        { title: "Appointments", icon: Calendar, path: "/appointments" },
        { title: "CareCoin Wallet", icon: Wallet, path: "/wallet-dashboard" },
        { title: "Taxi Service", icon: Car, path: "/taxi" },
        { title: "Food", icon: Utensils, path: "/food" },
        { title: "Profile", icon: Users, path: "/profile" },
      ],
    },
  ];

  const menuItems = isPatient ? patientMenuItems : staffMenuItems;

  return (
    <Sidebar collapsible="offcanvas">
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
                          "w-full justify-start",
                          location.pathname === item.path && "bg-accent text-accent-foreground"
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
