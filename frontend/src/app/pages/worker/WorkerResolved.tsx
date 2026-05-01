import { useState, useEffect } from "react";
import { CheckCircle2, Award, TrendingUp, History, LayoutGrid } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { motion } from "framer-motion";
import { api } from "../../api";
import { Complaint } from "../../data/mockData";

export default function WorkerResolved() {
  const [resolvedTasks, setResolvedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch resolved complaints
    api
      .get<any>("/api/complaints")
      .then((data) => {
        const resolved = (Array.isArray(data) ? data : [])
          .filter((c: any) => c.status === "Resolved" || c.status === "Closed")
          .map((c: any) => ({
            id: c.id,
            category: c.category || "Other",
            address: c.address || "Location not provided",
            status: c.status,
            createdAt: c.createdAt,
            resolvedAt: c.resolvedAt || c.updatedAt,
            citizenName: c.reporterName || "Anonymous",
          }))
          .sort(
            (a, b) =>
              new Date(b.resolvedAt).getTime() -
              new Date(a.resolvedAt).getTime()
          );
        setResolvedTasks(resolved);
      })
      .catch(() => setResolvedTasks([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-pulse px-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 rounded-2xl" />
            <Skeleton className="h-3 w-40 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        {/* List Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-lg" />
            <Skeleton className="h-6 w-48 rounded-xl" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-6">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-2/3 rounded-lg" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
                <div className="text-right space-y-2 hidden sm:block">
                  <Skeleton className="h-3 w-24 ml-auto" />
                  <Skeleton className="h-6 w-20 ml-auto rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Impact History</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">
            Archived Resolutions · Verified Outcomes
          </p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center text-emerald-600">
          <History size={24} />
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-600 rounded-[2rem] p-8 shadow-xl shadow-emerald-600/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
            <Award size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60 mb-2">
              Resolution Velocity
            </p>
            <p className="text-5xl font-black text-white tracking-tighter">
              {resolvedTasks.filter((t) =>
                new Date(t.resolvedAt).getMonth() === new Date().getMonth()
              ).length}
            </p>
            <p className="text-xs font-bold text-emerald-100 mt-2 uppercase tracking-widest">Fixed This Month</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-sky-600 rounded-[2rem] p-8 shadow-xl shadow-sky-600/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
            <TrendingUp size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-100/60 mb-2">
              Career Milestone
            </p>
            <p className="text-5xl font-black text-white tracking-tighter">
              {resolvedTasks.length}
            </p>
            <p className="text-xs font-bold text-sky-100 mt-2 uppercase tracking-widest">Lifetime Impact</p>
          </div>
        </motion.div>
      </div>

      {/* Resolved List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <LayoutGrid size={18} className="text-slate-400" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Resolution Archive</h2>
        </div>

        {resolvedTasks.length === 0 ? (
          <div className="rounded-[3rem] border-4 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center p-20 text-center">
            <div className="h-20 w-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-6 text-slate-200">
              <Award size={40} />
            </div>
            <p className="text-lg font-black text-slate-900 tracking-tight">
              Awaiting First Resolution
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              Start processing tasks to build history
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resolvedTasks.map((task, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={task.id}
                className="rounded-[2rem] border border-slate-50 bg-white p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex items-center gap-6"
              >
                <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">#{task.id.slice(-6).toUpperCase()}</span>
                    <div className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{task.category}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 truncate tracking-tight group-hover:text-emerald-600 transition-colors">
                    {task.address}
                  </h3>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Resolved for {task.citizenName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Authenticated On</div>
                  <div className="text-sm font-black text-slate-900">
                    {new Date(task.resolvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
