import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Users,
  MoreHorizontal,
  RefreshCw,
  Download,
  ChevronDown,
  UserCheck,
  Loader2,
  Inbox,
  Filter as FilterIcon,
  LayoutGrid,
  X
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { appwriteService } from "../../appwriteService";
import { api } from "../../api";
import { exportDataToPDF } from "../../utils/pdfExport";
import { Complaint } from "../../data/mockData";
import { toast } from "sonner";

const MOCK_MANAGERS = [
  { id: "MGR-DEL-S01", name: "Sanjay Sharma", state: "South Delhi" },
  { id: "MGR-DEL-C01", name: "Meena Kumari", state: "Central & New Delhi" },
  { id: "MGR-DEL-E01", name: "Rajesh Tyagi", state: "East Delhi & Shahdara" },
  { id: "MGR-DEL-W01", name: "Anita Singh", state: "West Delhi" },
  { id: "MGR-DEL-N01", name: "Amit Goel", state: "North & North-West Delhi" },
];

const slaStatus = (remaining: number, status: string) => {
  if (["Resolved", "Closed"].includes(status))
    return {
      label: "Resolved",
      class: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  if (remaining < 0)
    return {
      label: "⚠ Breached",
      class: "bg-red-100 text-red-700 border-red-200",
    };
  if (remaining < 12)
    return {
      label: "🟡 At Risk",
      class: "bg-amber-100 text-amber-700 border-amber-200",
    };
  return {
    label: "🟢 On Track",
    class: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
};

const priorityBadge = (score: number) => {
  if (score >= 0.75) return { label: "High", class: "bg-red-50 text-red-600" };
  if (score >= 0.4)
    return { label: "Med", class: "bg-amber-50 text-amber-600" };
  return { label: "Low", class: "bg-slate-100 text-slate-500" };
};

export default function AdminQueue() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSLA, setFilterSLA] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterWard, setFilterWard] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedRejectedComplaint, setSelectedRejectedComplaint] =
    useState<Complaint | null>(null);
  const [selectedReassignManager, setSelectedReassignManager] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await appwriteService.getAllComplaints();
        setComplaints(data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Real-time subscription
    const unsubscribe = appwriteService.subscribeToComplaints((data) => {
      setComplaints(data);
    });

    return () => unsubscribe();
  }, []);

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchSLA =
      filterSLA === "All" ||
      (filterSLA === "Breached" && c.slaRemainingHours < 0) ||
      (filterSLA === "At Risk" &&
        c.slaRemainingHours >= 0 &&
        c.slaRemainingHours < 12) ||
      (filterSLA === "On Track" && c.slaRemainingHours >= 12);
    const matchCat = filterCategory === "All" || c.category === filterCategory;
    const matchWard = filterWard === "All" || c.area === filterWard;
    return matchSearch && matchSLA && matchCat && matchWard;
  });

  if (loading)
    return (
      <div className="space-y-5 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-2xl" />
            <Skeleton className="h-10 w-24 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-16 w-full rounded-[1.85rem]" />
        <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === filtered.length ? [] : filtered.map((c) => c.id),
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDataToPDF(filtered, "Central_Queue_Export");
      toast.success("Registry Exported: PDF document is ready");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Export Failed: Could not generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const categories = [
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
  const wards = [
    "All",
    "South Delhi",
    "Central & New Delhi",
    "East Delhi & Shahdara",
    "West Delhi",
    "North & North-West Delhi",
  ];

  if (loading && complaints.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-48 rounded-2xl" />
        </div>
        <Skeleton className="h-20 w-full rounded-[2rem]" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-[2rem]" />
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
              <Inbox size={20} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Central Registry</h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
            Dispatch Operations · Real-time Control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            disabled={isExporting}
            className="h-12 px-6 rounded-2xl bg-white border border-slate-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
            Export PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAssignModalOpen(true)}
            disabled={selectedIds.length === 0}
            className="h-12 px-8 rounded-2xl bg-slate-900 text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <UserCheck size={16} />
            Assign Batch ({selectedIds.length})
          </motion.button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Pending Load", value: complaints.filter(c => !["Resolved", "Closed"].includes(c.status)).length, color: "text-slate-900", bg: "bg-white", border: "border-slate-900" },
          { label: "SLA Breached", value: complaints.filter(c => c.slaRemainingHours < 0 && !["Resolved", "Closed"].includes(c.status)).length, color: "text-rose-600", bg: "bg-white", border: "border-rose-500" },
          { label: "At Risk", value: complaints.filter(c => c.slaRemainingHours >= 0 && c.slaRemainingHours < 12 && !["Resolved", "Closed"].includes(c.status)).length, color: "text-amber-600", bg: "bg-white", border: "border-amber-500" },
          { label: "Priority Escalated", value: complaints.filter(c => c.escalated).length, color: "text-violet-600", bg: "bg-white", border: "border-violet-600" }
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-[2rem] border border-l-[6px] border-slate-100 ${stat.border} ${stat.bg} shadow-lg shadow-slate-200/40`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-3 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px] group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Filter queue by location, identifier, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-14 pr-6 text-sm font-bold bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-50/50 rounded-[1.25rem] border border-slate-100">
          {[
            { id: "All", label: "Registry" },
            { id: "Risk", label: "At Risk" },
            { id: "Breached", label: "Breached" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterSLA(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterSLA === tab.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] overflow-hidden">
        {/* Table Header */}
      {/* Complaint List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <LayoutGrid size={18} className="text-slate-400" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Dispatch Registry</h2>
          </div>
          <div className="flex items-center gap-2">
             <input
              type="checkbox"
              checked={selectedIds.length === filtered.length && filtered.length > 0}
              onChange={toggleAll}
              className="w-4 h-4 rounded cursor-pointer accent-indigo-600"
            />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select All</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[3rem] border-4 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center p-20 text-center">
            <div className="h-20 w-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-6 text-slate-200">
              <Inbox size={40} />
            </div>
            <p className="text-lg font-black text-slate-900 tracking-tight">
              Queue is Clear
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              No pending complaints matching your filters
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((c, i) => {
              const sla = slaStatus(c.slaRemainingHours, c.status);
              const prio = priorityBadge(c.priorityScore);
              const isSelected = selectedIds.includes(c.id);

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => toggleSelect(c.id)}
                  className={`group relative rounded-[2rem] border transition-all cursor-pointer p-6 flex items-center gap-6 overflow-hidden ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-600/5"
                      : "border-slate-50 bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/50"
                  }`}
                >
                  {/* SLA Urgency Indicator */}
                  {!["Resolved", "Closed"].includes(c.status) && (
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        c.slaRemainingHours < 0 ? "bg-rose-600 animate-pulse" : 
                        c.slaRemainingHours < 12 ? "bg-amber-500" : 
                        "bg-emerald-500"
                      }`} 
                    />
                  )}

                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                  }`}>
                    {isSelected ? <CheckCircle size={20} /> : <div className="h-5 w-5 rounded-md border-2 border-slate-200" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">#{c.id.slice(-6).toUpperCase()}</span>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${prio.class} px-2 py-0.5 rounded-md`}>
                        {prio.label} Priority
                      </span>
                      {c.escalated && (
                        <>
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest animate-pulse">Escalated</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
                      {c.address}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin size={12} className="text-slate-300" />
                        {c.ward || "Global Ward"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock size={12} className="text-slate-300" />
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${sla.class}`}>
                      {sla.label} · {c.slaRemainingHours}h
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                       {c.status === "Rejected" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRejectedComplaint(c);
                            setReassignModalOpen(true);
                          }}
                          className="h-9 px-4 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                          Reassign Rejected
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/complaint/${c.id}`);
                        }}
                        className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Reassign Rejected Complaint Modal */}
      {reassignModalOpen && selectedRejectedComplaint && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-slate-50 relative"
          >
            <div className="absolute top-8 right-8">
               <button
                onClick={() => {
                  setReassignModalOpen(false);
                  setSelectedRejectedComplaint(null);
                  setSelectedReassignManager("");
                }}
                className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 mb-2">Operational Protocol</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Reassign Rejected</h3>
                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  ID: #{selectedRejectedComplaint.id.slice(-6).toUpperCase()}
                </p>
              </div>

              <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-sm">
                     <AlertTriangle size={20} />
                   </div>
                   <div className="text-sm font-black text-rose-900 tracking-tight">Rejection Override Required</div>
                 </div>
                 <p className="text-xs font-bold text-rose-700/60 leading-relaxed uppercase tracking-widest">
                   Complaint for {selectedRejectedComplaint.address} was returned by the previous officer. Select a new dispatch manager to resume resolution.
                 </p>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {MOCK_MANAGERS.map((mgr) => (
                  <label
                    key={mgr.id}
                    className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer ${
                      selectedReassignManager === mgr.id
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reassign-manager"
                      value={mgr.id}
                      checked={selectedReassignManager === mgr.id}
                      onChange={() => setSelectedReassignManager(mgr.id)}
                      className="hidden"
                    />
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
                      selectedReassignManager === mgr.id ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {mgr.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-black tracking-tight ${selectedReassignManager === mgr.id ? "text-white" : "text-slate-900"}`}>
                        {mgr.name}
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${selectedReassignManager === mgr.id ? "text-white/60" : "text-slate-400"}`}>
                        {mgr.state}
                      </div>
                    </div>
                    {selectedReassignManager === mgr.id && <CheckCircle size={20} />}
                  </label>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (!selectedReassignManager || !selectedRejectedComplaint) return;
                  setReassignLoading(true);
                  try {
                    const manager = MOCK_MANAGERS.find(m => m.id === selectedReassignManager);
                    if (!manager) return;
                    await api.patch(`/api/complaints/${selectedRejectedComplaint.id}/assign`, {
                      managerId: selectedReassignManager,
                      managerName: manager.name,
                    });
                    toast.success(`Protocol Updated: Reassigned to ${manager.name}`);
                    const data = await appwriteService.getAllComplaints();
                    setComplaints(data);
                    setReassignModalOpen(false);
                    setSelectedRejectedComplaint(null);
                    setSelectedReassignManager("");
                  } catch (error) {
                    toast.error("Protocol Error: Reassignment failed");
                  } finally {
                    setReassignLoading(false);
                  }
                }}
                className="w-full h-16 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-40"
                disabled={!selectedReassignManager || reassignLoading}
              >
                {reassignLoading ? "Processing Protocol..." : "Confirm Reassignment"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-slate-50 relative"
          >
            <div className="absolute top-8 right-8">
               <button
                onClick={() => {
                  setAssignModalOpen(false);
                  setSelectedOfficer("");
                }}
                className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">Batch Operations</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Assign {selectedIds.length} Tickets</h3>
                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                  Targets: {selectedIds.length > 3 ? `${selectedIds.length} Complaints` : selectedIds.join(", ")}
                </p>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {MOCK_MANAGERS.map((mgr) => (
                  <label
                    key={mgr.id}
                    className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer ${
                      selectedOfficer === mgr.id
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="officer"
                      value={mgr.id}
                      checked={selectedOfficer === mgr.id}
                      onChange={() => setSelectedOfficer(mgr.id)}
                      className="hidden"
                    />
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
                      selectedOfficer === mgr.id ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {mgr.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-black tracking-tight ${selectedOfficer === mgr.id ? "text-white" : "text-slate-900"}`}>
                        {mgr.name}
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${selectedOfficer === mgr.id ? "text-white/60" : "text-slate-400"}`}>
                        {mgr.state}
                      </div>
                    </div>
                    {selectedOfficer === mgr.id && <CheckCircle size={20} />}
                  </label>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (!selectedOfficer || selectedIds.length === 0) return;
                  setAssignLoading(true);
                  try {
                    const officer = MOCK_MANAGERS.find(m => m.id === selectedOfficer);
                    if (!officer) return;
                    await Promise.all(selectedIds.map(id => 
                      api.patch(`/api/complaints/${id}/assign`, {
                        managerId: selectedOfficer,
                        managerName: officer.name,
                      })
                    ));
                    toast.success(`Success: ${selectedIds.length} tickets assigned to ${officer.name}`);
                    const data = await appwriteService.getAllComplaints();
                    setComplaints(data);
                    setAssignModalOpen(false);
                    setSelectedOfficer("");
                    setSelectedIds([]);
                  } catch (error) {
                    toast.error("Assignment Error: Batch operation failed");
                  } finally {
                    setAssignLoading(false);
                  }
                }}
                className="w-full h-16 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-40"
                disabled={!selectedOfficer || assignLoading}
              >
                {assignLoading ? "Processing Batch..." : "Authorize Dispatch"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
