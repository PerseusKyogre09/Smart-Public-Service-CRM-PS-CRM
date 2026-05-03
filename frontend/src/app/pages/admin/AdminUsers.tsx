import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  AlertTriangle,
  Ban,
  Eye,
  Loader2,
} from "lucide-react";
import { appwriteService } from "../../appwriteService";
import { Skeleton } from "../../components/ui/skeleton";
import { Users } from "lucide-react";

const mockUsers = [
  {
    id: "USR-001",
    name: "Rahul Sharma",
    email: "rahul.sharma@citizen.local",
    phone: "+91 98765 43210",
    tier: 2,
    reputation: 420,
    complaints: 18,
    resolved: 15,
    status: "Active",
    ward: "Ward 4",
    badges: 3,
  },
  {
    id: "USR-002",
    name: "Anjali Desai",
    email: "anjali.desai@citizen.local",
    phone: "+91 87654 32109",
    tier: 1,
    reputation: 285,
    complaints: 12,
    resolved: 10,
    status: "Active",
    ward: "Ward 7",
    badges: 2,
  },
  {
    id: "USR-003",
    name: "Mohammed Farouk",
    email: "mohammed.farouk@citizen.local",
    phone: "+91 76543 21098",
    tier: 1,
    reputation: 150,
    complaints: 6,
    resolved: 5,
    status: "Active",
    ward: "Ward 2",
    badges: 1,
  },
  {
    id: "USR-004",
    name: "Priya Singh",
    email: "priya.singh@citizen.local",
    phone: "+91 65432 10987",
    tier: 2,
    reputation: 380,
    complaints: 15,
    resolved: 14,
    status: "Active",
    ward: "Ward 3",
    badges: 2,
  },
  {
    id: "USR-005",
    name: "Kiran Patel",
    email: "kiran.patel@citizen.local",
    phone: "+91 54321 09876",
    tier: 1,
    reputation: 90,
    complaints: 3,
    resolved: 2,
    status: "Active",
    ward: "Ward 1",
    badges: 1,
  },
  {
    id: "USR-006",
    name: "Anonymous User",
    email: "anonymous@citizen.local",
    phone: "N/A",
    tier: 0,
    reputation: 20,
    complaints: 2,
    resolved: 0,
    status: "Active",
    ward: "Ward 5",
    badges: 0,
  },
  {
    id: "USR-007",
    name: "Suresh Nair",
    email: "suresh.nair@citizen.local",
    phone: "+91 43210 98765",
    tier: 2,
    reputation: -10,
    complaints: 8,
    resolved: 2,
    status: "Flagged",
    ward: "Ward 6",
    badges: 0,
  },
  {
    id: "USR-008",
    name: "Meena Kumari",
    email: "meena.kumari@citizen.local",
    phone: "+91 32109 87654",
    tier: 1,
    reputation: 520,
    complaints: 22,
    resolved: 20,
    status: "Active",
    ward: "Ward 4",
    badges: 4,
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await appwriteService.getAllUsers();
        setUsers(data && data.length > 0 ? data : mockUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.ward.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-20 w-full rounded-[2rem]" />
        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
              <Users size={20} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Citizen Registry</h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
            Governance Framework · Stakeholder Management
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          {
            label: "Verified Population",
            value: users.length,
            color: "text-slate-900",
            border: "border-slate-900",
            desc: "Active Registry"
          },
          {
            label: "Elite Tier (2+)",
            value: users.filter((u) => u.tier >= 2).length,
            color: "text-indigo-600",
            border: "border-indigo-500",
            desc: "Priority Citizens"
          },
          {
            label: "Policy Flags",
            value: users.filter((u) => u.status === "Flagged").length,
            color: "text-rose-600",
            border: "border-rose-500",
            desc: "Compliance Alert"
          },
          {
            label: "Civic Reputation",
            value: users.length > 0 ? Math.round(
              users.reduce((a, u) => a + u.reputation, 0) /
              users.length,
            ) : 0,
            color: "text-emerald-600",
            border: "border-emerald-500",
            desc: "Social Health"
          },
        ].map(({ label, value, color, border, desc }) => (
          <div
            key={label}
            className={`bg-white rounded-[2rem] p-7 border border-slate-100 border-l-[6px] ${border} shadow-lg shadow-slate-200/40`}
          >
            <div className={`text-4xl font-black tracking-tighter ${color}`}>{value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
              {label}
            </div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">{desc}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-3 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px] group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search registry by name, identifier, or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-14 pr-6 text-sm font-bold bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-14 px-6 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 rounded-2xl focus:outline-none text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
        >
          <option value="All">Status: Comprehensive</option>
          <option value="Active">Status: Active Only</option>
          <option value="Flagged">Status: Flagged Only</option>
          <option value="Suspended">Status: Suspended Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Stakeholder
                </th>
                <th className="text-center px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Authority
                </th>
                <th className="text-right px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Civic Rep
                </th>
                <th className="text-right px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Engagement
                </th>
                <th className="text-center px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Registry Status
                </th>
                <th className="text-center px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`hover:bg-slate-50 transition-colors ${user.status === "Flagged" ? "bg-amber-50/30" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-[700] ${
                            user.tier === 0
                              ? "bg-slate-400"
                              : user.tier === 1
                                ? "bg-blue-500"
                                : "bg-indigo-600"
                          }`}
                        >
                          {user.name === "Anonymous User"
                            ? "A"
                            : user.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-[600] text-slate-800">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {user.id} · {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`text-xs font-[700] px-2.5 py-1 rounded-full ${
                          user.tier === 2
                            ? "bg-indigo-100 text-indigo-700"
                            : user.tier === 1
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        Tier {user.tier}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`font-[700] ${user.reputation < 0 ? "text-red-600" : user.reputation >= 300 ? "text-emerald-600" : "text-slate-700"}`}
                      >
                        {user.reputation}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-slate-700">{user.complaints}</span>
                      <span className="text-slate-400 text-xs ml-1">
                        ({user.resolved} resolved)
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-slate-600 font-[500]">
                      {user.ward}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-[600] ${
                          user.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : user.status === "Flagged"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status === "Flagged" && "⚠ "}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Flag Account"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Suspend Account"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur-xl rounded-[1.85rem] p-6 max-w-md w-full shadow-[0_24px_60px_rgba(15,23,42,0.28)] border border-white"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-[700] text-slate-900">
                User Profile
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-lg font-[700]">
                {selectedUser.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div className="text-base font-[700] text-slate-900">
                  {selectedUser.name}
                </div>
                <div className="text-sm text-slate-500">{selectedUser.id}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-[600]">
                    Tier {selectedUser.tier}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-[600] ${
                      selectedUser.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Reputation", value: selectedUser.reputation },
                { label: "Total Complaints", value: selectedUser.complaints },
                { label: "Resolved Reports", value: selectedUser.resolved },
                { label: "Badges Earned", value: selectedUser.badges },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-lg font-[800] text-slate-900">
                    {value}
                  </div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-[600] rounded-xl border border-amber-100 transition-colors">
                <AlertTriangle className="w-4 h-4" /> Flag Account
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-[600] rounded-xl border border-red-100 transition-colors">
                <Ban className="w-4 h-4" /> Suspend
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
