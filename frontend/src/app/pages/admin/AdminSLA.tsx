import { Clock, Edit3, Save, X, Info, AlertTriangle, ShieldCheck, Settings2 } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { slaConfig } from "../../data/mockData";

export default function AdminSLA() {
  const [configs, setConfigs] = useState(
    slaConfig.map((s, i) => ({ ...s, id: i, editing: false })),
  );
  const [editValues, setEditValues] = useState<Record<number, any>>({});

  const startEdit = (id: number, config: any) => {
    setEditValues({ ...editValues, [id]: { ...config } });
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, editing: true } : c)),
    );
  };

  const cancelEdit = (id: number) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, editing: false } : c)),
    );
  };

  const saveEdit = (id: number) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...editValues[id], editing: false } : c,
      ),
    );
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for skeleton beauty
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-20 w-full rounded-[2rem]" />
          <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="p-8 space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-10 pb-12">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <Settings2 size={20} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                  SLA Governance
                </h1>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">
                Service Level Protocols · Response Optimization
              </p>
            </div>
          </div>

      {/* Info Banner */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-50 rounded-[2.5rem] p-8 flex gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)] group">
        <div className="h-14 w-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
          <ShieldCheck size={28} />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Policy Transparency</div>
          <div className="text-lg font-black text-slate-900 tracking-tight">
            Public Response Commitments
          </div>
          <div className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">
            Citizens see these deadlines in real-time. Changes to protocols will apply to <span className="text-sky-600">newly registered tickets</span> only, preserving legacy data integrity.
          </div>
        </div>
      </div>

      {/* SLA Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-[0_20px_60px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-slate-50">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Protocol Matrix</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Rules by Category</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full uppercase tracking-widest">
            Unit: Hours
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-8 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Category sector
                </th>
                <th className="text-center px-6 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Standard Response
                </th>
                <th className="text-center px-6 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Escalation Window
                </th>
                <th className="text-center px-6 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Critical Breach
                </th>
                <th className="text-center px-8 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Operational Controls
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {configs.map((config) => (
                <motion.tr
                  key={config.id}
                  layout
                  className={`hover:bg-slate-50 transition-colors ${config.editing ? "bg-blue-50/30" : ""}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          config.emergencySLA ? "bg-red-500" : "bg-amber-400"
                        }`}
                      />
                      <span className="font-[600] text-slate-800">
                        {config.category}
                      </span>
                    </div>
                  </td>

                  {config.editing ? (
                    <>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          value={
                            editValues[config.id]?.defaultSLA ||
                            config.defaultSLA
                          }
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [config.id]: {
                                ...prev[config.id],
                                defaultSLA: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-16 text-center text-sm border border-blue-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          value={
                            editValues[config.id]?.escalationSLA ||
                            config.escalationSLA
                          }
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [config.id]: {
                                ...prev[config.id],
                                escalationSLA: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-16 text-center text-sm border border-blue-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        {config.emergencySLA !== null ? (
                          <input
                            type="number"
                            value={
                              editValues[config.id]?.emergencySLA ??
                              config.emergencySLA
                            }
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [config.id]: {
                                  ...prev[config.id],
                                  emergencySLA: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-16 text-center text-sm border border-red-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-400 bg-white"
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => saveEdit(config.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-[600] rounded-lg transition-colors"
                          >
                            <Save className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={() => cancelEdit(config.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-[500] rounded-lg transition-colors"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-[700] text-slate-800">
                            {config.defaultSLA}h
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-amber-600 font-[700]">
                          {config.escalationSLA}h
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {config.emergencySLA ? (
                          <span className="text-red-600 font-[700] flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {config.emergencySLA}h
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => startEdit(config.id, config)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-[600] rounded-lg transition-colors mx-auto"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
