import { Link, useLocation } from "wouter";
import { Home, Calendar, Briefcase, Users, Wallet, HeartPulse } from "lucide-react";
import { cn } from "@/components/ui-elements";

const NAV_ITEMS = [
  { path: "/", label: "ホーム", icon: Home },
  { path: "/daily", label: "日課", icon: Calendar },
  { path: "/work", label: "仕事", icon: Briefcase },
  { path: "/consulting", label: "コンサル", icon: Users },
  { path: "/money", label: "お金", icon: Wallet },
  { path: "/health", label: "健康", icon: HeartPulse },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background relative flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-card/50 backdrop-blur-xl border-r border-white/60 p-6 z-40">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-inner">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">LifeDash</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium",
                isActive 
                  ? "bg-white shadow-sm text-primary" 
                  : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
              )}>
                <item.icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-8 p-4 md:p-8 min-h-screen">
        <div className="max-w-5xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/60 pb-safe z-50">
        <div className="flex justify-around items-center p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path} className="flex flex-col items-center justify-center w-full py-2">
                <div className={cn(
                  "flex items-center justify-center w-12 h-8 rounded-full mb-1 transition-all duration-300",
                  isActive ? "bg-primary/15 text-primary" : "text-muted-foreground"
                )}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
