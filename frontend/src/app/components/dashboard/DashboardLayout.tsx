import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import { ChevronDown, LogOut, Menu, Plus, Shield, X } from "lucide-react";
import { account } from "../../appwrite";
import { authService } from "../../appwriteService";
import { motion, AnimatePresence } from "framer-motion";
import CivicAIAssistant from "./CivicAIAssistant";

const navItems = [
  { to: "/dashboard", label: "Home", end: true },
  { to: "/dashboard/report", label: "Report Issue" },
  { to: "/dashboard/complaints", label: "My Complaints" },
  { to: "/dashboard/profile", label: "Profile" },
];

function LogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-700 text-sm font-semibold text-white shadow-sm">
      CP
    </div>
  );
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications] = useState(3);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    account
      .get()
      .then((user) => {
        setCurrentUser({
          name: user.name || user.email?.split("@")[0] || "Citizen",
          email: user.email || "",
          uid: user.$id,
        });
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user && (user.labels?.includes("admin") || !user.email)) {
        setIsAdmin(true);
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSessions();
    } catch (_) {
      try {
        await account.deleteSession("current");
      } catch (_) { }
    }
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${isActive
      ? "bg-sky-700 text-white"
      : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
    }`;

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-slate-50"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-200/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-base font-semibold text-slate-900">
                CivicPulse
              </div>
              <div className="text-xs text-slate-500">
                Public service dashboard
              </div>
            </div>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard/report")}
              className="hidden items-center gap-2 rounded-full bg-sky-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-800 sm:inline-flex shadow-lg shadow-sky-700/20"
            >
              <Plus className="h-4 w-4" />
              Report
            </motion.button>

            <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="max-w-[160px]">
                <div className="truncate text-sm font-medium text-slate-900">
                  {currentUser?.name || "Loading..."}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {currentUser?.email || "Citizen account"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                      ? "bg-sky-700 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/admin");
                  }}
                  className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  <span className="inline-flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </span>
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/dashboard/report");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                Report issue
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <CivicAIAssistant />
    </div>
  );
}
