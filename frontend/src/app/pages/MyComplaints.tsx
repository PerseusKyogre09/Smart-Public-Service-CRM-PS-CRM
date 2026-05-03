import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Clock3, MapPin, Search, Clock, FileText, CheckCircle2 } from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";
import { Skeleton } from "../components/ui/skeleton";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-700",
  Assigned: "bg-sky-100 text-sky-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
  Escalated: "bg-red-100 text-red-700",
};

const priorityLabel = (score: number) => {
  if (score >= 0.75)
    return { label: "High", className: "bg-red-50 text-red-700" };
  if (score >= 0.4)
    return { label: "Medium", className: "bg-amber-50 text-amber-700" };
  return { label: "Low", className: "bg-slate-100 text-slate-700" };
};

function formatDate(value: any) {
  if (!value) return "Just now";
  const date =
    typeof value === "string"
      ? new Date(value)
      : new Date((value.seconds || 0) * 1000);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyComplaints() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "sla" | "priority">("date");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    account
      .get()
      .then((user) => {
        if (!user.$id) {
          setLoading(false);
          return;
        }

        unsubscribe = appwriteService.subscribeToUserComplaints(
          user.$id,
          (data) => {
            setComplaints(data);
            setLoading(false);
          },
        );
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const allStatuses = [
    "All",
    "Submitted",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed",
    "Escalated",
  ];

  const allCategories = [
    "All",
    "Garbage",
    "Streetlight",
    "Pothole",
    "Water",
    "Sanitation",
    "Construction",
    "Safety",
    "Other",
  ];

  const filtered = complaints
    .filter((complaint) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        complaint.id?.toLowerCase().includes(query) ||
        complaint.category?.toLowerCase().includes(query) ||
        complaint.address?.toLowerCase().includes(query);

      const matchesStatus =
        filterStatus === "All" || complaint.status === filterStatus;
      const matchesCategory =
        filterCategory === "All" || complaint.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((left, right) => {
      if (sortBy === "sla") {
        return (left.slaRemainingHours || 0) - (right.slaRemainingHours || 0);
      }
      if (sortBy === "priority") {
        return (right.priorityScore || 0) - (left.priorityScore || 0);
      }

      const leftDate = left.createdAt?.seconds
        ? left.createdAt.seconds * 1000
        : new Date(left.createdAt || 0).getTime();
      const rightDate = right.createdAt?.seconds
        ? right.createdAt.seconds * 1000
        : new Date(right.createdAt || 0).getTime();
      return rightDate - leftDate;
    });

  const summary = {
    total: complaints.length,
    active: complaints.filter(
      (complaint) =>
        !["Resolved", "Closed", "Rejected"].includes(complaint.status),
    ).length,
    resolved: complaints.filter((complaint) =>
      ["Resolved", "Closed"].includes(complaint.status),
    ).length,
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse px-2">
        {/* Header Skeleton */}
        <section className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-4 flex-1">
              <Skeleton className="h-4 w-32 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-3/4 rounded-2xl" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-32 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex flex-col items-center justify-center gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-8 w-10" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters Skeleton */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <Skeleton className="h-14 rounded-[1.25rem]" />
            <Skeleton className="h-14 rounded-[1.25rem]" />
            <Skeleton className="h-14 rounded-[1.25rem]" />
            <Skeleton className="h-14 rounded-[1.25rem]" />
          </div>
        </div>

        {/* List Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm relative overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-8 justify-between">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-64 rounded-xl" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-48 rounded-lg" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-40 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="w-full lg:w-64 space-y-4 pt-4 lg:pt-0">
                  <div className="flex justify-between items-center px-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-2 w-1/3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-100 bg-gradient-to-br from-white via-sky-50 to-blue-50/50 px-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-700 ring-1 ring-sky-100 shadow-sm">
          Citizen Portal
        </span>
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Track your complaints
            </h1>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
              Your personal record of service requests. Monitor progress, check SLAs, and stay updated on local improvements.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 shrink-0">
            {[
              { label: "Total", value: summary.total, color: "text-slate-900" },
              { label: "Active", value: summary.active, color: "text-amber-600" },
              { label: "Resolved", value: summary.resolved, color: "text-emerald-600" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl bg-white px-6 py-4 text-center border border-slate-100 shadow-sm min-w-[100px]"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {item.label}
                </div>
                <div className={`mt-1 text-3xl font-black ${item.color} tracking-tighter`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-100 bg-white/80 backdrop-blur-md p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ID, category, or address..."
              className="w-full rounded-[1.25rem] border border-slate-50 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
          >
            {allStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
          >
            {allCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as "date" | "sla" | "priority")
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
          >
            <option value="date">Latest first</option>
            <option value="sla">SLA urgency</option>
            <option value="priority">Priority score</option>
          </select>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-sm font-medium text-slate-700">
              No complaints found
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Try a different search or filter.
            </div>
          </div>
        ) : (
          filtered.map((complaint) => {
            const isOverdue =
              complaint.slaRemainingHours < 0 &&
              !["Resolved", "Closed"].includes(complaint.status);
            const priority =
              complaint.priorityScore != null
                ? priorityLabel(complaint.priorityScore)
                : null;

            return (
              <motion.button
                key={complaint.id}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() =>
                  navigate(`/dashboard/complaints/${complaint.id}`)
                }
                className="group w-full rounded-[32px] border border-slate-100 bg-white p-8 text-left shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-sky-100"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-xl font-black text-slate-900 tracking-tight group-hover:text-sky-700 transition-colors">
                        {complaint.category || "Complaint"}
                        {complaint.subcategory
                          ? ` - ${complaint.subcategory}`
                          : ""}
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusColors[complaint.status] || "bg-slate-100 text-slate-700 shadow-sm"}`}
                      >
                        {complaint.status}
                      </span>
                      {priority && (
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${priority.className} shadow-sm`}
                        >
                          {priority.label}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-sky-500 shadow-inner group-hover:bg-sky-50 group-hover:shadow-lg transition-all">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="truncate max-w-[250px]">{complaint.address || "Address unavailable"}</span>
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-sky-500 shadow-inner group-hover:bg-sky-50 group-hover:shadow-lg transition-all">
                          <Clock3 className="h-4 w-4" />
                        </div>
                        {formatDate(complaint.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                      <span>ID: {complaint.id}</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Confirmations: {complaint.confirmations || 0}
                      </span>
                      {complaint.slaRemainingHours != null && (
                        <span className={isOverdue ? "text-red-400" : ""}>
                          {isOverdue
                            ? `${Math.abs(complaint.slaRemainingHours)}h overdue`
                            : `${complaint.slaRemainingHours}h left`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-56 shrink-0">
                    {!["Resolved", "Closed"].includes(complaint.status) &&
                      complaint.slaHours != null && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>SLA Status</span>
                            <span>{complaint.slaHours}h Target</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-slate-50 shadow-inner overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ 
                                width: isOverdue
                                  ? "100%"
                                  : `${Math.min(
                                      ((complaint.slaHours -
                                        complaint.slaRemainingHours) /
                                        complaint.slaHours) *
                                        100,
                                      100,
                                    )}%`
                              }}
                              className={`h-full rounded-full ${
                                isOverdue
                                  ? "bg-red-500 animate-pulse"
                                  : complaint.slaRemainingHours <
                                      complaint.slaHours * 0.2
                                    ? "bg-amber-500"
                                    : "bg-sky-600 shadow-[0_0_10px_rgba(2,132,199,0.5)]"
                              }`}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </section>
    </div>
  );
}
