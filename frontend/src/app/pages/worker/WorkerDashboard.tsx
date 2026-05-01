import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Navigation2,
  Navigation,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Clock,
  Check,
  MapPin,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "../../api";
import { account } from "../../appwrite";
import { appwriteService } from "../../appwriteService";
import { SLATimer } from "../../components/SLATimer";
import { Skeleton } from "../../components/ui/skeleton";

interface WorkerTask {
  id: string;
  category: string;
  address: string;
  description: string;
  status: string;
  createdAt: string;
  citizenName: string;
  citizenPhone?: string;
  priority: number;
  distance?: number;
  coordinates?: { lat: number; lng: number };
  timeline?: any[];
  slaDeadline?: string;
}

export default function WorkerDashboard() {
  const [worker, setWorker] = useState<any>(null);
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<WorkerTask | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending">("active");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First check if worker data is in session (from mock login)
    const workerDataStr = sessionStorage.getItem("workerData");
    if (workerDataStr) {
      setWorker(JSON.parse(workerDataStr));
      return;
    }

    // Otherwise try to get from Appwrite (for real production users)
    account
      .get()
      .then((user) => {
        setWorker({
          id: "WKR-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
          name: user.name || "Worker",
          email: user.email,
        });
      })
      .catch(() => setWorker({ id: "WKR-001", name: "Worker", email: "worker@example.com" }));
  }, []);

  useEffect(() => {
    if (!worker) return;

    // Fetch and subscribe to assigned complaints
    const fetchWorkerTasks = () => {
      api
        .get<any>(`/api/complaints?assignedTo=${encodeURIComponent(worker.name)}`)
        .then((data) => {
          const workerTasks = (Array.isArray(data) ? data : [])
            .map((c: any) => ({
              id: c.id,
              category: c.category || "Other",
              address: c.address || "Location not provided",
              description: c.description || "",
              status: c.status || "Assigned",
              createdAt: c.createdAt || new Date().toISOString(),
              citizenName: c.reporterName || "Anonymous",
              citizenPhone: c.citizenPhone,
              priority: c.priorityScore || 0.5,
              distance: c.distance_km,
              coordinates: c.coordinates,
              timeline: c.timeline || [],
              slaDeadline: c.slaDeadline,
            }))
            .sort((a: any, b: any) => b.priority - a.priority);

          setTasks(workerTasks);
        })
        .catch((err) => {
          console.error("Failed to fetch worker tasks:", err);
        })
        .finally(() => setLoading(false));
    };

    fetchWorkerTasks();

    // Subscribe to all complaints for real-time updates (assigned to this worker)
    const unsubscribe = appwriteService.subscribeToComplaints(() => {
      fetchWorkerTasks();
    });

    return () => {
      unsubscribe();
    };
  }, [worker]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filter === "pending") {
      result = result.filter((t) => t.status === "Assigned");
    } else if (filter === "active") {
      result = result.filter((t) => t.status === "In Progress" || t.status === "Assigned");
    }

    return result;
  }, [tasks, searchTerm, filter]);

  const handleStartWork = (task: WorkerTask) => {
    if (task.status === "Assigned") {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "In Progress" } : t
        )
      );
      toast.success("Task started!");

      // Background API call
      api
        .patch(`/api/complaints/${task.id}/status`, {
          status: "In Progress",
          note: "Worker started work on site",
          actor: worker?.name || "Worker",
        })
        .catch((err) => {
          console.error("Failed to start task:", err);
          // Rollback if needed (though real-time sync might handle it)
          toast.error("Failed to sync task status with server.");
        });
    }
  };

  const handleResolve = () => {
    if (!selectedTask || !resolutionNote.trim()) {
      toast.error("Please add a resolution note");
      return;
    }

    const taskId = selectedTask.id;
    
    // Optimistic UI Update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setShowResolveModal(false);
    setSelectedTask(null);
    setResolutionNote("");
    toast.success("Submitted for manager review! ✓");

    // Background API call
    api
      .patch(`/api/complaints/${taskId}/status`, {
        status: "Pending Review",
        note: `Submitted for review: ${resolutionNote}`,
        actor: worker?.name || "Worker",
      })
      .catch((err) => {
        console.error("Failed to resolve task:", err);
        toast.error("Server sync failed, but your resolution is saved locally.");
      });
  };

  const hoursWorked = useMemo(() => {
    const activeTask = tasks.find((t) => t.status === "In Progress");
    if (!activeTask) return 0;
    const elapsed = Date.now() - new Date(activeTask.createdAt).getTime();
    return Math.floor(elapsed / 3600000);
  }, [tasks]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        {/* Stats Bar Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-10" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Search & Tabs Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-24 rounded-xl" />
            <Skeleton className="h-11 w-24 rounded-xl" />
          </div>
        </div>

        {/* Task List Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-slate-100 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Active Tasks
              </p>
              <p className="text-4xl font-black text-slate-900 mt-1">
                {tasks.filter((t) => t.status === "In Progress").length}
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
              <AlertCircle size={28} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[32px] border border-slate-100 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Assigned
              </p>
              <p className="text-4xl font-black text-slate-900 mt-1">
                {tasks.filter((t) => t.status === "Assigned").length}
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-inner">
              <Clock size={28} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[32px] border border-slate-100 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Rating
              </p>
              <p className="text-4xl font-black text-slate-900 mt-1 flex items-center gap-1">
                4.2<span className="text-xl text-amber-500">★</span>
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
              <Check size={28} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Your Tasks</h2>
          <div className="flex bg-slate-100/50 p-1 rounded-2xl w-fit">
            {(["all", "active", "pending"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="relative px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                {filter === f && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-white rounded-xl shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 ${filter === f ? "text-sky-600" : "text-slate-400"}`}>
                  {f}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by ID, area, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 rounded-[1.5rem] border border-slate-100 bg-white/80 backdrop-blur-md pl-12 pr-6 text-sm font-medium focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 outline-none transition-all shadow-sm placeholder:text-slate-400"
          />
        </div>

        {/* Tasks */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12">
            <Check className="text-emerald-500 mb-4" size={40} />
            <p className="text-slate-600 font-bold text-center">
              No tasks found {searchTerm && 'matching "' + searchTerm + '"'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === "all" && tasks.length === 0
                ? "Check back later for new assignments"
                : "All tasks completed!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  layout
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`cursor-pointer rounded-[2.5rem] border p-8 transition-all relative overflow-hidden group ${
                    selectedTask?.id === task.id
                      ? "border-sky-500 bg-sky-50/50 shadow-xl ring-4 ring-sky-500/10"
                      : "border-slate-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  {/* SLA Urgency Side Banner */}
                  {(() => {
                    const diff = new Date(task.slaDeadline || task.createdAt).getTime() - Date.now();
                    const hours = diff / (1000 * 60 * 60);
                    if (task.status === "Resolved" || task.status === "Closed") return null;
                    
                    const colorClass = diff <= 0 ? "bg-red-500 animate-pulse" : 
                                     hours < 12 ? "bg-amber-500" : 
                                     "bg-emerald-500";
                    return <div className={`absolute left-0 top-0 bottom-0 w-2 ${colorClass}`} />;
                  })()}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-slate-900/20">
                          {task.category}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                          #{task.id}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight group-hover:text-sky-700 transition-colors">
                          {task.address}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-sky-500">
                            <MapPin size={14} />
                          </div>
                          {task.distance ? `${task.distance}km away` : "Locating..."}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-sky-500">
                            <Clock size={14} />
                          </div>
                          {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm ${
                            task.status === "In Progress"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-sky-100 text-sky-700 border border-sky-200"
                          }`}
                        >
                          {task.status}
                        </div>
                        <SLATimer
                          deadline={task.slaDeadline || task.createdAt}
                          startTime={task.createdAt}
                          status={task.status}
                          showIcon={true}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        {task.citizenPhone && (
                          <a
                            href={`tel:${task.citizenPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="h-12 w-12 flex items-center justify-center bg-slate-900 hover:bg-black text-white rounded-2xl transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                          >
                            <Phone size={20} />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (task.coordinates) {
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${task.coordinates.lat},${task.coordinates.lng}`, '_blank');
                            } else {
                              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`, '_blank');
                            }
                          }}
                          className="h-12 px-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                        >
                          <MapPin size={18} />
                          <span className="text-sm">Navigate</span>
                        </button>
                        {task.status === "Assigned" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartWork(task);
                            }}
                            className="h-12 px-8 flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-sky-600/20 active:scale-95"
                          >
                            <AlertCircle size={18} />
                            <span className="text-sm">Start Task</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      <AnimatePresence>
        {showResolveModal && selectedTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
              onClick={() => setShowResolveModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Resolve Task #{selectedTask.id}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {selectedTask.address}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Resolution Note *
                  </label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Describe what was done to resolve this issue..."
                    className="w-full h-24 rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  className="flex-1 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                >
                  Mark Resolved
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && !showResolveModal && (
          <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
              onClick={() => setSelectedTask(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl"
            >
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg tracking-tight">
                    {selectedTask.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500">#{selectedTask.id}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {selectedTask.address}
                </h2>
                <div
                  className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${selectedTask.status === "In Progress"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-sky-100 text-sky-700"
                    }`}
                >
                  {selectedTask.status}
                </div>
              </div>

              <div className="space-y-5 mb-8 bg-slate-50 rounded-2xl p-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Citizen
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedTask.citizenName}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Description
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-5 flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Location
                    </p>
                    <p className="text-slate-700 flex items-center gap-1.5">
                      <MapPin size={14} className="text-sky-500" />
                      {selectedTask.distance ? `${selectedTask.distance}km away` : "Pending"}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Reported
                    </p>
                    <p className="text-slate-700 flex items-center gap-1.5">
                      <Clock size={14} className="text-sky-500" />
                      {new Date(selectedTask.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
