import React, { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  GraduationCap,
  Layers,
  CreditCard,
  Calendar,
  MessageSquare,
  CheckSquare,
  FileText,
  BarChart3,
  UserCog,
  Settings,
  ClipboardList,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RefreshCw,
  Bell,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  roles?: Array<"owner" | "admin" | "admissions" | "instructor" | "accountant">;
  subItems?: Array<{
    name: string;
    href: string;
    filterParam?: string;
  }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["owner", "admin", "admissions", "instructor", "accountant"],
  },
  {
    name: "Admissions CRM",
    href: "/admin/admissions",
    icon: UserPlus,
    roles: ["owner", "admin", "admissions"],
    subItems: [
      { name: "All Leads", href: "/admin/admissions" },
      { name: "New Applications", href: "/admin/admissions?status=new" },
      { name: "Demo Requests", href: "/admin/demos" },
      { name: "Follow-ups Due", href: "/admin/admissions?view=followups" },
      { name: "Enrolled", href: "/admin/admissions?status=enrolled" },
      { name: "Archived / Closed", href: "/admin/admissions?status=closed" },
    ],
  },
  {
    name: "Students",
    href: "/admin/students",
    icon: Users,
    roles: ["owner", "admin", "admissions", "instructor"],
    subItems: [
      { name: "All Students", href: "/admin/students" },
      { name: "Active Students", href: "/admin/students?status=active" },
      { name: "Paused Students", href: "/admin/students?status=paused" },
      { name: "Completed", href: "/admin/students?status=completed" },
      { name: "Import CSV", href: "/admin/students?action=import" },
    ],
  },
  {
    name: "Programs",
    href: "/admin/programs",
    icon: GraduationCap,
    roles: ["owner", "admin", "admissions"],
  },
  {
    name: "Batches & Enroll",
    href: "/admin/batches",
    icon: Layers,
    roles: ["owner", "admin", "admissions", "instructor"],
  },
  {
    name: "Fees & Payments",
    href: "/admin/fees",
    icon: CreditCard,
    roles: ["owner", "admin", "accountant"],
    subItems: [
      { name: "Monthly Dues", href: "/admin/fees?tab=dues" },
      { name: "Overdue", href: "/admin/fees?tab=overdue" },
      { name: "Paid Records", href: "/admin/fees?tab=paid" },
      { name: "Payment History", href: "/admin/fees?tab=history" },
    ],
  },
  {
    name: "Timetable & Classes",
    href: "/admin/timetable",
    icon: Calendar,
    roles: ["owner", "admin", "instructor"],
    subItems: [
      { name: "Calendar View", href: "/admin/timetable?view=calendar" },
      { name: "Today's Classes", href: "/admin/timetable?view=today" },
      { name: "Upcoming", href: "/admin/timetable?view=upcoming" },
      { name: "Availability", href: "/admin/timetable?view=availability" },
    ],
  },
  {
    name: "Communications",
    href: "/admin/communications",
    icon: MessageSquare,
    roles: ["owner", "admin", "admissions"],
    subItems: [
      { name: "Email Broadcast", href: "/admin/communications?channel=email" },
      { name: "WhatsApp Context", href: "/admin/communications?channel=whatsapp" },
      { name: "Templates", href: "/admin/communications?channel=templates" },
      { name: "Delivery Logs", href: "/admin/communications?channel=logs" },
    ],
  },
  {
    name: "Tasks & Follow-ups",
    href: "/admin/tasks",
    icon: CheckSquare,
    roles: ["owner", "admin", "admissions", "instructor"],
  },
  {
    name: "Content CMS",
    href: "/admin/content",
    icon: FileText,
    roles: ["owner", "admin"],
  },
  {
    name: "Reports & Analytics",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["owner", "admin", "accountant"],
  },
  {
    name: "Users & Roles",
    href: "/admin/users",
    icon: UserCog,
    roles: ["owner", "admin"],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["owner", "admin"],
  },
  {
    name: "Audit Log",
    href: "/admin/audit",
    icon: ClipboardList,
    roles: ["owner", "admin"],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminLayout({
  children,
  title,
  description,
  actions,
  onRefresh,
  isRefreshing = false,
}: AdminLayoutProps) {
  const { admin, logout, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    is_read: boolean;
    created_at: string;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    type: "lead" | "student" | "batch";
    id: string;
    title: string;
    subtitle: string;
    link: string;
  }>>([]);

  // Filter items by role
  const userRole = admin?.role || "admin";
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole as any),
  );

  // Fetch notifications
  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const res = await fetch("/api/admin/notifications", {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.ok) {
            setNotifications(data.notifications || []);
          }
        }
      } catch {
        // Silently ignore notification fetch error on offline/dev
      }
    }
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, [getAuthHeader]);

  // Global search handler
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/admissions?q=${encodeURIComponent(query)}&limit=5`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        const leads = (data.admissions || []).map((lead: any) => ({
          type: "lead" as const,
          id: lead.id,
          title: lead.student_name,
          subtitle: `Lead: ${lead.selected_program_title} (${lead.status})`,
          link: `/admin/admissions?selectedId=${lead.id}`,
        }));
        setSearchResults(leads);
      }
    } catch {
      // Ignore
    } finally {
      setIsSearching(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-[#070F2B] text-white shadow-md flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((v) => !v)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* TBOS Brand */}
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-[#008DDA] to-[#41B3A2] text-white shadow-sm shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-base text-white leading-tight">
                TBOS Academy
              </span>
              <span className="text-[10px] font-semibold text-[#41B3A2] uppercase tracking-wider">
                Management CRM
              </span>
            </div>
          </Link>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            className="hidden lg:grid ml-4 h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Global Search & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads, students..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#008DDA]"
              />
            </div>
            {/* Search dropdown results */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 rounded-lg border border-slate-700 bg-[#0B192C] shadow-xl p-2 z-50 text-xs">
                {searchResults.map((res) => (
                  <Link
                    key={res.id}
                    to={res.link}
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="block p-2 rounded hover:bg-white/10 transition-colors text-slate-200"
                  >
                    <div className="font-semibold text-white">{res.title}</div>
                    <div className="text-[11px] text-slate-400">{res.subtitle}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Refresh button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-slate-300 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications((v) => !v)}
              className="relative text-slate-300 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-[#0B192C] p-3 shadow-2xl z-50 text-xs text-slate-200">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                  <span className="font-semibold text-white">Notifications ({unreadCount} new)</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-slate-400">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg border transition-colors ${
                          n.is_read
                            ? "border-slate-800 bg-white/5"
                            : "border-blue-500/30 bg-blue-500/10 text-white"
                        }`}
                      >
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-[11px] text-slate-300 mt-0.5">{n.message}</div>
                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => setShowNotifications(false)}
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#008DDA] hover:underline"
                          >
                            View details <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role */}
          <div className="hidden sm:flex flex-col text-right pl-2 border-l border-slate-700">
            <span className="text-xs font-medium text-white truncate max-w-[150px]">
              {admin?.email}
            </span>
            <span className="text-[10px] font-semibold text-[#41B3A2] uppercase tracking-wider font-mono">
              {admin?.role}
            </span>
          </div>

          {/* Sign Out Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout();
              navigate({ to: "/admin/login" });
            }}
            className="border-white/10 bg-white/5 text-slate-200 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 h-8 px-2.5 text-xs font-medium gap-1.5"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r border-slate-200 bg-[#0B192C] text-slate-300 transition-all duration-200 select-none ${
            isSidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.href ||
                (item.href !== "/admin/dashboard" && currentPath.startsWith(item.href));

              return (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#008DDA] text-white shadow-sm font-semibold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                    {!isSidebarCollapsed && item.badge && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer info */}
          {!isSidebarCollapsed && (
            <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>TBOS CRM v16.0</span>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">Asia/Karachi (UTC+5)</p>
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer with Backdrop */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative flex flex-col w-72 max-w-[80vw] bg-[#0B192C] text-white shadow-2xl z-10">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#008DDA] to-[#41B3A2]">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm">TBOS Admin CRM</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    currentPath === item.href ||
                    (item.href !== "/admin/dashboard" && currentPath.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[#008DDA] text-white font-semibold"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Signout in drawer */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                <div className="truncate">
                  <div className="text-xs font-semibold">{admin?.email}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">{admin?.role}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await logout();
                    navigate({ to: "/admin/login" });
                  }}
                  className="text-red-400 hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {/* Header section with Title and Action buttons */}
          {(title || actions) && (
            <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {title && (
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">{description}</p>
                  )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            </div>
          )}

          {/* Child content container */}
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

