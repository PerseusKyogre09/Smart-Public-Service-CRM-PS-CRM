import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Clock3,
  FileText,
  LocateFixed,
  MapPin,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../components/ui/skeleton";

const statusColor: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-700",
  Assigned: "bg-sky-100 text-sky-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
  Escalated: "bg-red-100 text-red-700",
};

function formatComplaintDate(value: any) {
  if (!value) return "Today";
  const date =
    typeof value === "string"
      ? new Date(value)
      : new Date((value.seconds || 0) * 1000);

  if (Number.isNaN(date.getTime())) return "Today";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFirstName(name?: string) {
  return name?.trim()?.split(" ")?.[0] || "Citizen";
}

export default function CitizenHome() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [userComplaints, setUserComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>({});
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [userState, setUserState] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
          );
          const data = await response.json();
          if (data.address?.state) {
            setUserState(data.address.state);
          }
        } catch (error) {
          console.error("Failed to fetch state name:", error);
        }
      },
      () => {
        console.warn("Location access denied or unavailable.");
      },
    );
  }, []);

  useEffect(() => {
    account
      .get()
      .then((currentUser) => {
        const labels = currentUser.labels || [];

        // Safety Redirect: If a worker or manager lands here, send them to their portal
        if (labels.includes("worker")) {
          navigate("/worker", { replace: true });
          return;
        }
        if (labels.includes("manager")) {
          navigate("/manager", { replace: true });
          return;
        }
        if (labels.includes("admin")) {
          navigate("/admin", { replace: true });
          return;
        }

        const userData = {
          name:
            currentUser.name || currentUser.email?.split("@")[0] || "Citizen",
          email: currentUser.email,
          uid: currentUser.$id,
        };
        setUser(userData);

        // Initial fetch for immediate data
        const fetchAll = () => {
          appwriteService
            .getAllComplaints(coords?.lat, coords?.lng, 10)
            .then((data) => {
              setComplaints(data);
              setLoading(false);
            })
            .catch(() => setLoading(false));

          appwriteService
            .getComplaintsByUser(userData.uid)
            .then((data) => setUserComplaints(data))
            .catch(() => { });
        };

        fetchAll();

        // Subscribe for updates
        const unsubscribeAll = appwriteService.subscribeToComplaints(
          (data) => {
            setComplaints(data);
            setLoading(false);
          },
          coords?.lat,
          coords?.lng,
          10,
        );

        const unsubscribeUser = appwriteService.subscribeToUserComplaints(
          userData.uid,
          (data) => setUserComplaints(data),
        );

        return () => {
          unsubscribeAll();
          unsubscribeUser();
        };
      })
      .catch(() => {
        navigate("/login");
      });
  }, [coords, navigate]);

  const activeCount = userComplaints.filter(
    (c) => !["Resolved", "Closed"].includes(c.status) && c.status !== "Deleted",
  ).length;
  const resolvedCount = userComplaints.filter((complaint) =>
    ["Resolved", "Closed"].includes(complaint.status),
  ).length;

  const nearbyOpenCount = complaints.filter((complaint) => {
    const isStatusOpen = !["Resolved", "Closed"].includes(complaint.status);
    const isNearby =
      complaint.distance_km !== undefined ? complaint.distance_km <= 10 : true;
    return isStatusOpen && isNearby;
  }).length;

  const recentComplaints = [...userComplaints]
    .filter((c) => c.status !== "Deleted")
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 5);

  const nearbyComplaints = complaints
    .filter((complaint) => {
      const isStatusOpen = !["Resolved", "Closed"].includes(complaint.status);
      const isNearby =
        complaint.distance_km !== undefined
          ? complaint.distance_km <= 10
          : true;
      return isStatusOpen && isNearby;
    })
    .slice(0, 4);

  const quickLinks = [
    {
      label: "Report a new issue",
      description: "Start a complaint with location and category details.",
      action: () => navigate("/dashboard/report"),
    },
    {
      label: "Check my complaints",
      description: "Track status updates and response timelines in one place.",
      action: () => navigate("/dashboard/complaints"),
    },
    {
      label: "Open my profile",
      description: "Review your details and account information.",
      action: () => navigate("/dashboard/profile"),
    },
  ];

  if (loading && complaints.length === 0) {
    return (
      <div className="space-y-8 px-2 animate-pulse">
        {/* Header Skeleton */}
        <div className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <Skeleton className="h-4 w-32 rounded-full mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4 max-w-xl rounded-2xl" />
              <Skeleton className="h-4 w-full max-w-2xl rounded-lg" />
            </div>
            <div className="flex gap-4 mt-8">
              <Skeleton className="h-14 w-40 rounded-full" />
              <Skeleton className="h-14 w-40 rounded-full" />
            </div>
          </div>
          <div className="absolute top-0 right-0 p-10">
             <Skeleton className="h-24 w-24 rounded-3xl opacity-20" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-50 shadow-sm space-y-4">
              <Skeleton className="h-3 w-20 uppercase" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
          {/* Main List Skeleton */}
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex-shrink-0 flex items-center justify-center">
                    <Skeleton className="h-6 w-6 rounded-md" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-1/3 rounded-lg" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-1/4 rounded-md" />
                      <Skeleton className="h-3 w-1/5 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
              Citizen dashboard
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Hello, {formatFirstName(user.name)}
              </h1>
              <p className="text-sm leading-6 text-slate-600">
                Everything important is on one screen: create a complaint,
                follow your updates, and track your reported issues without
                extra visual clutter.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              {/* <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                <LocateFixed className="h-4 w-4 text-sky-600" />
                {coords ? "Nearby updates enabled" : "Location not shared yet"}
              </span> */}
              {/* <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                {userState || "Local area feed"}
              </span> */}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard/report")}
              className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-sky-800 shadow-xl shadow-sky-700/20"
            >
              <Plus className="h-4 w-4" />
              Report issue
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard/complaints")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 premium-shadow"
            >
              View complaints
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            label: "Reported by you",
            value: userComplaints.length,
            note: "Total complaints created",
            icon: FileText,
            color: "bg-sky-50 text-sky-600"
          },
          {
            label: "Active now",
            value: activeCount,
            note: "Still being worked on",
            icon: Clock,
            color: "bg-amber-50 text-amber-600"
          },
          {
            label: "Resolved",
            value: resolvedCount,
            note: "Completed or closed",
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600"
          },
        ].map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-[32px] border border-slate-100 bg-white p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {item.label}
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">
                  {item.value}
                </div>
              </div>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.color} shadow-inner`}>
                <item.icon size={24} />
              </div>
            </div>
            <div className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-tight">{item.note}</div>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent complaints
              </h2>
              <p className="text-sm text-slate-500">
                Your latest updates in a clean list.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/complaints")}
              className="text-sm font-medium text-sky-700 hover:text-sky-800"
            >
              See all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentComplaints.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  You have not reported any issues yet.
                </p>
                <button
                  onClick={() => navigate("/dashboard/report")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                >
                  <Plus className="h-4 w-4" />
                  Create first report
                </button>
              </div>
            ) : (
              recentComplaints.map((complaint) => (
                <button
                  key={complaint.id}
                  onClick={() =>
                    navigate(`/dashboard/complaints/${complaint.id}`)
                  }
                  className="flex w-full items-center gap-6 px-8 py-6 text-left transition-all hover:bg-slate-50 group"
                >
                  <div className="h-14 w-14 shrink-0 rounded-[1.25rem] bg-slate-50 flex items-center justify-center text-sky-700 shadow-inner group-hover:bg-white group-hover:shadow-lg transition-all">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-bold text-slate-900 tracking-tight">
                        {complaint.category || "Complaint"}
                        {complaint.subcategory
                          ? ` - ${complaint.subcategory}`
                          : ""}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusColor[complaint.status] || "bg-slate-100 text-slate-700 shadow-sm"}`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-sky-500" />
                        <span className="truncate max-w-[200px]">{complaint.address}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-sky-500" />
                        {new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-sky-600 transition-all">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Quick actions
            </h2>
            <div className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50/60"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {link.label}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {link.description}
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
