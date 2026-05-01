import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Edit2,
  ShieldCheck,
  Activity,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { account } from "../../appwrite";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton";

export default function WorkerProfile() {
  const [worker, setWorker] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    account
      .get()
      .then((user) => {
        const workerData = {
          id: "WKR-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
          name: user.name || "Field Worker",
          email: user.email,
          phone: user.phone || "+919876543210",
          area: "North Delhi",
          state: "Delhi",
          rating: 4.5,
          status: "Available",
          tasksCompleted: 42,
          joinDate: "2024-01-15",
        };
        setWorker(workerData);
        setFormData(workerData);
      })
      .catch(() => {
        const fallback = {
          id: "WKR-001",
          name: "Field Worker",
          email: "worker@example.com",
          phone: "+919876543210",
          area: "North Delhi",
          state: "Delhi",
          rating: 4.5,
          status: "Available",
          tasksCompleted: 42,
          joinDate: "2024-01-15",
        };
        setWorker(fallback);
        setFormData(fallback);
      });
  }, []);

  const handleSave = () => {
    setWorker(formData);
    setIsEditing(false);
    toast.success("Profile updated!");
  };

  if (!worker) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-pulse px-4">
        {/* Header Skeleton */}
        <div className="rounded-[40px] border border-slate-100 bg-white p-10 flex flex-col lg:flex-row gap-10 items-center lg:items-end justify-between shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <Skeleton className="h-28 w-28 rounded-[2rem] shadow-lg" />
            <div className="space-y-4 text-center md:text-left">
              <Skeleton className="h-5 w-32 rounded-full mx-auto md:mx-0" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-64 rounded-2xl" />
                <Skeleton className="h-5 w-40 rounded-lg" />
              </div>
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-9 w-40 rounded-full" />
                <Skeleton className="h-9 w-32 rounded-full" />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-80 relative z-10">
            <div className="rounded-[2.5rem] bg-slate-50/50 p-6 border border-slate-100 space-y-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
          <div className="space-y-10">
             {/* Info Grid Skeleton */}
             <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-sm space-y-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
             </div>
             {/* Protocols Skeleton */}
             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-8">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
             </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <div className="space-y-4">
                 <Skeleton className="h-24 w-full rounded-2xl" />
                 <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 px-4">
      {/* Header Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[40px] border border-slate-100 bg-white p-10 flex flex-col lg:flex-row gap-10 items-center lg:items-end justify-between shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-sky-500/20"
          >
            {worker.name.split(" ").map((n: string) => n[0]).join("")}
          </motion.div>
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-sky-100">
              <ShieldCheck size={12} /> Authenticated Field Officer
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                {worker.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500 font-bold text-sm">
                <span className="flex items-center gap-1.5"><Star className="text-amber-500" size={16} fill="currentColor" /> {worker.rating} Rating</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 size={16} /> {worker.status}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <Edit2 size={12} /> Edit Officer Profile
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 relative z-10">
          <div className="rounded-[2.5rem] bg-slate-50/50 p-8 border border-slate-100 space-y-5">
            <div className="flex justify-between items-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolution Impact</div>
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</div>
            </div>
            <div className="text-5xl font-black text-slate-900 tracking-tighter">
              {worker.tasksCompleted}
            </div>
            <div className="space-y-3">
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "84%" }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Monthly Target</span>
                <span>84% Achieved</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {/* Information Matrix */}
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { label: "Official Email", value: worker.email, icon: Mail, color: "text-sky-600" },
              { label: "Contact Number", value: worker.phone, icon: Phone, color: "text-emerald-600" },
              { label: "Assigned Area", value: worker.area, icon: MapPin, color: "text-amber-600" },
              { label: "Duty Status", value: "Active Response", icon: Activity, color: "text-indigo-600" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-sm group hover:border-sky-100 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center ${item.color} group-hover:bg-sky-50 transition-colors`}>
                    <item.icon size={18} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {item.label}
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">
                  {item.value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Service Protocols */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                <ShieldCheck className="text-sky-600" /> Service Protocols
              </h2>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Standard Operations</div>
            </div>
            <div className="space-y-4">
              {[
                { step: "01", text: "Prioritize GPS-verified resolution evidence" },
                { step: "02", text: "Maintain 95%+ SLA compliance score" },
                { step: "03", text: "Real-time field status synchronization" },
              ].map((protocol) => (
                <div key={protocol.step} className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                  <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-900 shadow-sm">
                    {protocol.step}
                  </div>
                  <div className="flex-1 font-bold text-slate-700">{protocol.text}</div>
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Join Badge */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
               <Award className="text-white" size={100} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200/60">Career Tenure</div>
                <div className="space-y-1">
                  <div className="text-3xl font-black text-white tracking-tight italic">Since {new Date(worker.joinDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}</div>
                  <div className="text-indigo-200/80 text-xs font-bold">Veteran Field Responder</div>
                </div>
                <div className="h-0.5 w-full bg-white/10" />
                <div className="flex items-center gap-3 text-white font-bold text-xs">
                   <Calendar size={14} className="text-indigo-200" /> Registered Certificate Active
                </div>
             </div>
          </div>

          {/* Efficiency Sidebar */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Efficiency Matrix</h3>
             <div className="space-y-4">
                {[
                  { label: "SLA Response", value: 98, color: "bg-emerald-500" },
                  { label: "Public Feedback", value: 92, color: "bg-sky-500" },
                  { label: "On-field Safety", value: 100, color: "bg-indigo-500" },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span>{stat.label}</span>
                      <span>{stat.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        className={`h-full ${stat.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative z-10 border border-slate-100"
            >
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-8">Update Officer Info</h2>
              <div className="space-y-6">
                {[
                  { label: "Full Name", key: "name", type: "text" },
                  { label: "Official Email", key: "email", type: "email" },
                  { label: "Contact Phone", key: "phone", type: "tel" },
                  { label: "Assigned Ward", key: "area", type: "text" },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={formData[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 h-14 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
