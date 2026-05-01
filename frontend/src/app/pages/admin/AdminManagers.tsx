import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appwriteService } from "../../appwriteService";
import {
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  ChevronRight,
  MapPin,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { MOCK_ADMIN_MANAGERS } from "../../utils/adminInsights";

const STATUS_COLORS: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-600",
  Assigned: "bg-sky-100 text-sky-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-400",
  Escalated: "bg-red-100 text-red-700",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminManagers() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMgr, setSelectedMgr] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const unsub = appwriteService.subscribeToComplaints((data) => {
      setComplaints(data);
      setLoading(false);
    });

    appwriteService.getManagers()
      .then(setManagers)
      .catch(console.error);

    return () => unsub();
  }, []);

  const managerStats = useMemo(() => {
    return managers.map((mgr) => {
      const mine = complaints.filter((c) => c.assignedManagerId === mgr.id);
      const active = mine.filter(
        (c) => !["Resolved", "Closed"].includes(c.status),
      ).length;
      const resolved = mine.filter((c) =>
        ["Resolved", "Closed"].includes(c.status),
      ).length;
      const escalated = mine.filter((c) => c.escalated).length;
      const slaBreached = mine.filter(
        (c) =>
          (c.slaRemainingHours ?? 1) < 0 &&
          !["Resolved", "Closed"].includes(c.status),
      ).length;
      return {
        ...mgr,
        total: mine.length,
        active,
        resolved,
        escalated,
        slaBreached,
      };
    });
  }, [complaints, managers]);

  const selectedMgrComplaints = useMemo(() => {
    if (!selectedMgr) return [];
    return complaints
      .filter((c) => c.assignedManagerId === selectedMgr.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [complaints, selectedMgr]);

  const openDrawer = (mgr: any) => {
    setSelectedMgr(mgr);
    setDrawerOpen(true);
  };

  const totalManaged = complaints.filter(
    (c) => c.assignedManagerId && c.assignedManagerId !== "SYSTEM",
  ).length;

  if (loading && managers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-10 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-[2rem]" />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Manager Force
            </h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
            Workload Distribution · Performance Oversight
          </p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Force Strength",
            value: managers.length,
            icon: Users,
            color: "text-slate-900",
            border: "border-slate-900",
            desc: "Active Personnel"
          },
          {
            label: "Active Load",
            value: totalManaged,
            icon: Zap,
            color: "text-emerald-600",
            border: "border-emerald-500",
            desc: "Assigned Registry"
          },
          {
            label: "Critical Breach",
            value: complaints.filter(c => (c.slaRemainingHours || 0) < 0 && !["Resolved", "Closed"].includes(c.status)).length,
            icon: AlertTriangle,
            color: "text-rose-600",
            border: "border-rose-500",
            desc: "Immediate Action"
          },
          {
            label: "Force Velocity",
            value: complaints.filter(c => ["Resolved", "Closed"].includes(c.status)).length,
            icon: TrendingUp,
            color: "text-violet-600",
            border: "border-violet-600",
            desc: "Cycle Completion"
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-[2rem] p-6 border border-slate-100 border-l-[6px] ${stat.border} shadow-lg shadow-slate-200/40 group hover:scale-[1.02] transition-all`}
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {stat.label}
              </p>
              <stat.icon size={16} className="text-slate-200" />
            </div>
            <p className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Manager Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {managerStats.map((mgr, i) => {
          const resolutionRate = mgr.total > 0 ? Math.round((mgr.resolved / mgr.total) * 100) : 0;
          return (
            <motion.div
              key={mgr.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => openDrawer(mgr)}
              className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-6 cursor-pointer hover:shadow-2xl hover:shadow-indigo-600/10 hover:-translate-y-1 transition-all group overflow-hidden relative"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-50/30 rounded-bl-[4rem] -mr-8 -mt-8 transition-all group-hover:bg-indigo-600 group-hover:scale-110" />

              {/* Header */}
              <div className="flex items-center gap-4 mb-6 relative">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  {initials(mgr.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
                    {mgr.name}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {mgr.zone} · {mgr.id}
                  </p>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {mgr.slaBreached > 0 ? (
                  <div className="h-7 px-3 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-rose-600 animate-pulse" />
                    {mgr.slaBreached} Breaches
                  </div>
                ) : (
                  <div className="h-7 px-3 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-emerald-600" />
                    Clean Slate
                  </div>
                )}
                {mgr.escalated > 0 && (
                  <div className="h-7 px-3 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    {mgr.escalated} Escalations
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Active", value: mgr.active, color: "text-indigo-600" },
                  { label: "Resolved", value: mgr.resolved, color: "text-emerald-600" },
                  { label: "Total", value: mgr.total, color: "text-slate-900" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50/50 rounded-2xl p-3 text-center">
                    <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Efficiency</span>
                  <span className="text-xs font-black text-indigo-600">{resolutionRate}%</span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${resolutionRate}%` }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Complaint Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedMgr && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-[−24px_0_60px_rgba(15,23,42,0.25)] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-sm font-[800]">
                  {initials(selectedMgr.name)}
                </div>
                <div className="flex-1">
                  <div className="text-base font-[700] text-slate-900">
                    {selectedMgr.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedMgr.zone} · {selectedMgr.id}
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Stats */}
              {(() => {
                const stats = managerStats.find(
                  (m) => m.id === selectedMgr.id,
                )!;
                return (
                  <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-100">
                    <div className="text-center">
                      <div className="text-lg font-[800] text-amber-600">
                        {stats.active}
                      </div>
                      <div className="text-[10px] text-slate-400 font-[600] uppercase">
                        Active
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-[800] text-emerald-600">
                        {stats.resolved}
                      </div>
                      <div className="text-[10px] text-slate-400 font-[600] uppercase">
                        Resolved
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-[800] text-red-500">
                        {stats.slaBreached}
                      </div>
                      <div className="text-[10px] text-slate-400 font-[600] uppercase">
                        SLA Breached
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Complaints List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 pb-2 flex items-center justify-between">
                  <span className="text-xs font-[700] text-slate-500 uppercase tracking-wider">
                    Assigned Complaints ({selectedMgrComplaints.length})
                  </span>
                </div>

                {selectedMgrComplaints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <UserCheck className="w-10 h-10 mb-3 text-slate-200" />
                    <div className="text-sm">No complaints assigned yet</div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {selectedMgrComplaints.map((c) => (
                      <div
                        key={c.id}
                        className="px-4 py-3.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${c.escalated
                                ? "bg-red-500"
                                : (c.slaRemainingHours ?? 1) < 0
                                  ? "bg-amber-500"
                                  : ["Resolved", "Closed"].includes(c.status)
                                    ? "bg-emerald-500"
                                    : "bg-sky-400"
                              }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-[700] text-slate-700 font-mono">
                                {c.id}
                              </span>
                              <span
                                className={`text-[10px] font-[600] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[c.status] || "bg-slate-100 text-slate-600"}`}
                              >
                                {c.status}
                              </span>
                              {c.escalated && (
                                <span className="text-[10px] font-[700] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                                  🔴 Escalated
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-slate-500">
                                {c.category}
                              </span>
                              {c.subcategory && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-xs text-slate-400">
                                    {c.subcategory}
                                  </span>
                                </>
                              )}
                            </div>
                            {c.address && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                <span className="text-xs text-slate-400 truncate">
                                  {c.address}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 mt-1.5">
                              {(c.slaRemainingHours ?? 1) < 0 &&
                                !["Resolved", "Closed"].includes(c.status) ? (
                                <span className="flex items-center gap-0.5 text-[10px] font-[700] text-red-500">
                                  <AlertTriangle className="w-2.5 h-2.5" />{" "}
                                  {Math.abs(c.slaRemainingHours)}h overdue
                                </span>
                              ) : ["Resolved", "Closed"].includes(c.status) ? (
                                <span className="flex items-center gap-0.5 text-[10px] font-[600] text-emerald-600">
                                  <CheckCircle className="w-2.5 h-2.5" /> Done
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                                  <Clock className="w-2.5 h-2.5" />{" "}
                                  {c.slaRemainingHours}h left
                                </span>
                              )}
                              <span className="text-[10px] text-slate-300">
                                {new Date(c.createdAt).toLocaleDateString(
                                  "en-IN",
                                  { day: "numeric", month: "short" },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
