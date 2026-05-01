import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { appwriteService } from "../../appwriteService";
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Activity,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  Pothole: "#EF4444",
  Garbage: "#F59E0B",
  Streetlight: "#3B82F6",
  Water: "#06B6D4",
  Sanitation: "#8B5CF6",
  Safety: "#EC4899",
  Construction: "#10B981",
  Other: "#6B7280",
};

const KPICard = ({
  label,
  value,
  suffix,
  subtext,
  color,
  accent,
  icon: Icon,
  trend,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-[2rem] p-7 border border-slate-100 border-l-[6px] ${accent} shadow-lg shadow-slate-200/40 group hover:scale-[1.02] transition-all`}
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-sm ${color}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
            trend > 0
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <div className="text-5xl font-black text-slate-900 tracking-tighter">
      {value}
      <span className="text-2xl font-bold text-slate-300 ml-0.5">{suffix}</span>
    </div>
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
      {label}
    </div>
    {subtext && <div className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-wider">{subtext}</div>}
  </motion.div>
);

export default function AdminOverview() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = appwriteService.subscribeToComplaints((data) => {
      setComplaints(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Live KPIs ---
  const liveKpis = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) =>
      ["Resolved", "Closed"].includes(c.status),
    ).length;
    const active = complaints.filter(
      (c) => !["Resolved", "Closed", "Rejected"].includes(c.status),
    ).length;
    const escalated = complaints.filter((c) => c.escalated).length;
    const slaMet = complaints.filter((c) => {
      if (!["Resolved", "Closed"].includes(c.status)) return false;
      return (c.slaRemainingHours ?? 1) >= 0;
    }).length;
    const slaCompliance =
      resolved > 0 ? Math.round((slaMet / resolved) * 100) : 0;
    return { total, resolved, active, escalated, slaCompliance };
  }, [complaints]);

  // --- Category breakdown from live data ---
  const liveCategoryBreakdown = useMemo(() => {
    if (complaints.length === 0) return [];
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value: Math.round((value / complaints.length) * 100),
        color: CATEGORY_COLORS[name] || "#6B7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [complaints]);

  // --- 7-day trend from live data ---
  const liveTrendData = useMemo(() => {
    const days: {
      day: string;
      submitted: number;
      resolved: number;
      escalated: number;
    }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        day: label,
        submitted: complaints.filter(
          (c) => c.createdAt?.slice(0, 10) === dateStr,
        ).length,
        resolved: complaints.filter(
          (c) =>
            ["Resolved", "Closed"].includes(c.status) &&
            c.updatedAt?.slice(0, 10) === dateStr,
        ).length,
        escalated: complaints.filter(
          (c) => c.escalated && c.updatedAt?.slice(0, 10) === dateStr,
        ).length,
      });
    }
    return days;
  }, [complaints]);

  // --- Manager workload from live data ---
  const managerWorkload = useMemo(() => {
    const map: Record<
      string,
      { name: string; active: number; resolved: number }
    > = {};
    complaints.forEach((c) => {
      if (!c.assignedManagerName) return;
      if (!map[c.assignedManagerName])
        map[c.assignedManagerName] = {
          name: c.assignedManagerName,
          active: 0,
          resolved: 0,
        };
      if (["Resolved", "Closed"].includes(c.status))
        map[c.assignedManagerName].resolved++;
      else map[c.assignedManagerName].active++;
    });
    return Object.values(map)
      .sort((a, b) => b.active - a.active)
      .slice(0, 5);
  }, [complaints]);

  const breachedCount = complaints.filter(
    (c) =>
      (c.slaRemainingHours ?? 1) < 0 &&
      !["Resolved", "Closed"].includes(c.status),
  ).length;

  if (loading && complaints.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <Skeleton className="h-20 w-full rounded-[2rem]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-[2rem]" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-[2rem]" />
          <Skeleton className="h-80 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Operational Matrix
            </h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
            Real-time Systems Oversight · Global Registry
          </p>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1 mt-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/admin/queue")}
            className="group flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
          >
            Manage Queue
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Alerts Banner */}
      {breachedCount > 0 || liveKpis.escalated > 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-50/80 backdrop-blur-md border border-rose-100 rounded-[2rem] p-6 flex items-center gap-6 shadow-[0_20px_40px_rgba(225,29,72,0.05)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-7 h-7 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Critical Intervention Required</div>
            <div className="text-xl font-black text-rose-900 tracking-tight">
              {breachedCount} Breach Alerts · {liveKpis.escalated} Escalations
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/queue")}
            className="px-6 py-3 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 border border-rose-100 hover:bg-rose-50 transition-colors shadow-sm"
          >
            Resolve Now
          </button>
        </motion.div>
      ) : (
        <div className="bg-emerald-50/80 backdrop-blur-md border border-emerald-100 rounded-[2rem] p-6 flex items-center gap-6 shadow-[0_20px_40px_rgba(16,185,129,0.05)]">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Operational Health</div>
            <div className="text-xl font-black text-emerald-900 tracking-tight">
              All Systems Nominal · No Breaches
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Load"
          value={liveKpis.total}
          suffix=""
          icon={Activity}
          color="bg-slate-900 text-white"
          accent="border-slate-900"
          subtext="Registry Sync"
        />
        <KPICard
          label="Resolved Cycle"
          value={liveKpis.resolved}
          suffix=""
          icon={CheckCircle}
          color="bg-emerald-600 text-white"
          accent="border-emerald-500"
          subtext="Processed"
        />
        <KPICard
          label="SLA Compliance"
          value={liveKpis.slaCompliance}
          suffix="%"
          icon={TrendingUp}
          color="bg-violet-600 text-white"
          accent="border-violet-600"
          subtext="Protocol Fidelity"
        />
        <KPICard
          label="Backlog"
          value={liveKpis.active}
          suffix=""
          icon={Clock}
          color="bg-rose-600 text-white"
          accent="border-rose-500"
          subtext={`${liveKpis.escalated} escalated`}
        />
      </div>

      {/* Secondary KPIs — computed from live data */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Active Complaints",
            value: liveKpis.active,
            suffix: "",
            desc: "Not yet resolved",
          },
          {
            label: "SLA Compliance",
            value: `${liveKpis.slaCompliance}%`,
            suffix: "",
            desc: "Resolved within SLA",
          },
          {
            label: "Escalated",
            value: liveKpis.escalated,
            suffix: "",
            desc: "Needs urgent attention",
          },
        ].map(({ label, value, desc }) => (
          <div
            key={label}
            className="bg-white/85 backdrop-blur-xl rounded-[1.75rem] p-4 border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)]"
          >
            <div className="text-xs font-[600] text-slate-500 mb-2">{desc}</div>
            <div className="text-xl font-[800] text-slate-900">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend Chart - live 7-day */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Performance Dynamics</div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Operational Velocity
              </h3>
            </div>
            <div className="flex gap-6">
              {[
                { color: "bg-sky-500", label: "Inflow" },
                { color: "bg-emerald-500", label: "Resolved" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={liveTrendData}>
              <defs>
                <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              />
              <Area
                type="monotone"
                dataKey="submitted"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#colorSubmitted)"
                dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#10B981"
                strokeWidth={3}
                fill="url(#colorResolved)"
                dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
              />
              <Bar
                dataKey="escalated"
                fill="#EF4444"
                barSize={8}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie - live */}
        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8 flex flex-col">
          <div className="mb-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Issue Distribution</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Focus Areas</h3>
          </div>
          {liveCategoryBreakdown.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
              Waiting for Data...
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={liveCategoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={4}
                    >
                      {liveCategoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-2">
                {liveCategoryBreakdown
                  .slice(0, 4)
                  .map(({ name, value, color }) => (
                    <div key={name} className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex-1">
                        {name}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {value}%
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Manager Workload (live) + Escalations */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Manager Workload */}
        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-8 border-b border-slate-50">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Human Capital</div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Staff Utilization</h3>
            </div>
            <button
              onClick={() => navigate("/admin/managers")}
              className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-all flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {managerWorkload.length === 0 ? (
              <div className="py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                Awaiting Assignments
              </div>
            ) : (
              managerWorkload.map((mgr) => (
                <div
                  key={mgr.name}
                  onClick={() => navigate("/admin/managers")}
                  className="flex items-center gap-4 px-8 py-5 cursor-pointer hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-sm font-black shadow-sm group-hover:bg-sky-600 group-hover:text-white transition-all">
                    {mgr.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-slate-800">
                      {mgr.name}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Field Officer</div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <div className="text-sm font-black text-amber-600">{mgr.active}</div>
                      <div className="text-[9px] font-black text-slate-300 uppercase">Load</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-600">{mgr.resolved}</div>
                      <div className="text-[9px] font-black text-slate-300 uppercase">Fixed</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Escalated / Overdue (live) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-8 border-b border-slate-50">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1">Operational Risks</div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Escalations</h3>
            </div>
            <button
              onClick={() => navigate("/admin/queue")}
              className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {complaints.filter(
              (c) => c.escalated || (c.slaRemainingHours ?? 1) < 0,
            ).length === 0 ? (
              <div className="py-16 text-center text-[10px] font-black uppercase tracking-widest text-emerald-500">
                Operational Stability Confirmed
              </div>
            ) : (
              complaints
                .filter((c) => c.escalated || (c.slaRemainingHours ?? 1) < 0)
                .slice(0, 5)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 px-8 py-5 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/complaint/${c.id}`)}
                  >
                    <div
                      className={`w-1.5 h-12 rounded-full ${c.escalated ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-slate-800 tracking-tight">
                        #{c.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {c.category} · {c.address}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-[10px] font-black uppercase tracking-widest ${c.escalated ? "text-rose-600" : "text-amber-600"}`}
                      >
                        {c.escalated
                          ? "Escalated"
                          : `${Math.abs(c.slaRemainingHours || 0)}h Overdue`}
                      </div>
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        {c.area || "NCT Zone"}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
