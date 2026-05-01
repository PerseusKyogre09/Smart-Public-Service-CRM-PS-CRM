import { useParams, useNavigate, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";
import { api } from "../api";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import {
  CheckCircle,
  Star,
  MessageSquare,
  ThumbsUp,
  Download,
  Camera,
  Wrench,
  Share2,
  Clock3,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Copy,
  FileText,
  MapPin,
  Share,
  Shield,
  UserCheck,
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { SLATimer } from "../components/SLATimer";


const statusColors: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-600",
  Assigned: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-emerald-100 text-emerald-700 font-black animate-pulse",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-500",
  Escalated: "bg-red-100 text-red-700",
};

const statusSteps = [
  "Submitted",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showEscalate, setShowEscalate] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isReassigning, setIsReassigning] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedReassignManager, setSelectedReassignManager] =
    useState<string>("");
  const [managers, setManagers] = useState<any[]>([]);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  useEffect(() => {
    appwriteService
      .getManagers()
      .then(setManagers)
      .catch(console.error);
  }, []);

  useEffect(() => {
    account
      .get()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
    if (id) {
      setLoading(true);
      appwriteService
        .getComplaintById(id)
        .then((data) => {
          setComplaint(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch complaint:", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse px-4">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>

        {/* Header Section Skeleton */}
        <div className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-12 w-3/4 rounded-2xl" />
              <div className="flex gap-6">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
            </div>
            <div className="shrink-0">
               <Skeleton className="h-14 w-40 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {/* Status Timeline Skeleton */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-8">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <div className="relative pl-8 space-y-10">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-50" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-8 top-0 h-6 w-6 rounded-full bg-slate-100 border-4 border-white" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40 rounded-md" />
                      <Skeleton className="h-3 w-64 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Skeleton */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-6">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-48 rounded-3xl bg-slate-50" />
                <div className="h-48 rounded-3xl bg-slate-50" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* SLA Sidebar Skeleton */}
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

  if (!complaint) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">
        Complaint not found
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(complaint.status);
  const isOverdue =
    (complaint.slaRemainingHours || 0) < 0 &&
    !["Resolved", "Closed"].includes(complaint.status);

  const canEscalate = isOverdue || complaint.status === "Escalated";
  const canReopen = ["Resolved", "Closed"].includes(complaint.status);

  const isReporter =
    currentUser &&
    (complaint.reporterId === currentUser.$id ||
      complaint.userId === currentUser.$id);

  const isAlreadyRated = !!complaint.rating;

  const showRatingSection =
    isReporter &&
    ["Resolved", "Closed"].includes(complaint.status) &&
    !isAlreadyRated;

  const showDeclineOption =
    isReporter && complaint.status === "Resolved";

  const isManager =
    currentUser && sessionStorage.getItem("managerData") !== null;

  const backToListPath = location.pathname.startsWith("/admin/")
    ? "/admin/queue"
    : "/dashboard/complaints";

  const handleCopyId = () => {
    navigator.clipboard.writeText(complaint.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEvidenceImageUrl = () => {
    if (
      typeof complaint?.imageUrl === "string" &&
      complaint.imageUrl.startsWith("http")
    ) {
      return complaint.imageUrl;
    }
    if (
      typeof complaint?.photoUrl === "string" &&
      complaint.photoUrl.startsWith("http")
    ) {
      return complaint.photoUrl;
    }
    const photos = complaint?.photos;
    if (
      Array.isArray(photos) &&
      typeof photos[0] === "string" &&
      photos[0].startsWith("http")
    ) {
      return photos[0];
    }
    if (typeof photos === "string" && photos.startsWith("http")) {
      return photos;
    }
    return "";
  };

  const evidenceImageUrl = getEvidenceImageUrl();

  const visibleTimeline = (complaint?.timeline || []).filter((event: any) => {
    const note = String(event?.note || "").toLowerCase();
    return !(
      note.includes("share_card_url:") ||
      note.includes("share card saved to gallery") ||
      note.includes("automatic report card generation") ||
      note.includes("auto share card saved")
    );
  });

  const generateShareCardDataUrl = async () => {
    if (!shareCardRef.current) {
      throw new Error("Share card not ready");
    }

    await new Promise((r) => setTimeout(r, 120));

    try {
      return await toPng(shareCardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        quality: 1,
        pixelRatio: 2,
        style: {
          opacity: "1",
          visibility: "visible",
          position: "static",
        },
      });
    } catch {
      // Retry without evidence image when third-party image CORS taints canvas.
      return await toPng(shareCardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        quality: 1,
        pixelRatio: 2,
        style: {
          opacity: "1",
          visibility: "visible",
          position: "static",
        },
        filter: (node) =>
          !(
            node instanceof HTMLImageElement &&
            node.getAttribute("data-share-evidence") === "true"
          ),
      });
    }
  };

  const handleDownloadImage = async () => {
    if (!shareCardRef.current) return;
    setIsDownloadingImage(true);
    try {
      const dataUrl = await generateShareCardDataUrl();
      const link = document.createElement("a");
      link.download = `CivicPulse-${complaint.id}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded successfully!");
    } catch (err) {
      console.error("Download image error:", err);
      toast.error("Failed to download image. Please try again.");
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error("Please select a rating (1-5 stars).");
      return;
    }

    setIsSubmittingRating(true);
    try {
      await api.patch(`/api/complaints/${complaint.id}/status`, {
        status: "Closed",
        note: comment || `Closed with ${rating}-star rating`,
        actor: currentUser?.name || "Citizen",
        rating: rating,
        feedback: comment,
      });

      toast.success("Thank you! Your feedback has been submitted.");

      // Refresh complaint data
      const updated = await appwriteService.getComplaintById(complaint.id);
      setComplaint(updated);
      setRating(0);
      setComment("");
    } catch (error: any) {
      console.error("Failed to submit rating:", error);
      toast.error(
        error.message || "Failed to submit rating. Please try again.",
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleDeclineResolution = async () => {
    setIsSubmittingRating(true);
    try {
      await api.patch(`/api/complaints/${complaint.id}/status`, {
        status: "Declined",
        note: "Resolution declined by citizen",
        actor: currentUser?.name || "Citizen",
      });

      toast.success(
        "Resolution declined. Your complaint has been sent back to the manager for re-assignment.",
      );

      // Refresh complaint data
      const updated = await appwriteService.getComplaintById(complaint.id);
      setComplaint(updated);
    } catch (error: any) {
      console.error("Failed to decline resolution:", error);
      toast.error(
        error.message || "Failed to decline resolution. Please try again.",
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCloseComplaint = async () => {
    setIsSubmittingRating(true);
    try {
      await api.patch(`/api/complaints/${complaint.id}/status`, {
        status: "Closed",
        note: "Closed by manager",
        actor: currentUser?.name || "Manager",
      });

      toast.success("Complaint closed successfully.");

      // Refresh complaint data
      const updated = await appwriteService.getComplaintById(complaint.id);
      setComplaint(updated);
    } catch (error: any) {
      console.error("Failed to close complaint:", error);
      toast.error(
        error.message || "Failed to close complaint. Please try again.",
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hidden Share Card */}
      <div
        className="fixed -left-[2000px] top-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          ref={shareCardRef}
          className="w-[800px] bg-white p-12 rounded-[3rem] border-[12px] border-orange-100 shadow-2xl relative overflow-hidden"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          {/* Brand Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

          <div className="relative z-10">
            {/* Brand Header */}
            <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-500 rounded-[1.5rem] flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    CivicPulse
                  </h1>
                  <p className="text-emerald-700 font-bold uppercase tracking-widest text-xs">
                    Official Issue Report
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Report ID
                </span>
                <p className="text-xl font-bold text-slate-900 leading-tight">
                  #{complaint.id}
                </p>
              </div>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-50">
                  {complaint.category === "Garbage"
                    ? "🗑️"
                    : complaint.category === "Streetlight"
                      ? "💡"
                      : complaint.category === "Pothole"
                        ? "🔧"
                        : complaint.category === "Water"
                          ? "💧"
                          : "📍"}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Issue Type
                  </p>
                  <p className="text-xl font-black text-slate-800">
                    {complaint.category}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-50">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <p className="text-xl font-black text-emerald-700">
                    {complaint.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-8">
              <div className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Report Description
                </p>
                <div className="flex gap-6 items-start">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-slate-900 leading-relaxed italic">
                      "{complaint.description}"
                    </p>
                  </div>
                  {evidenceImageUrl && (
                    <div className="shrink-0">
                      <div className="p-2 bg-slate-50 rounded-[2.5rem] border-4 border-white shadow-xl rotate-2">
                        <img
                          src={evidenceImageUrl}
                          alt="Evidence"
                          data-share-evidence="true"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="w-48 h-48 object-cover rounded-[2rem]"
                        />
                      </div>
                      <div className="text-center mt-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Live Evidence Capture
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 border-l-4 border-orange-500 bg-orange-50/60 rounded-r-[2rem]">
                <MapPin className="w-8 h-8 text-orange-600 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Full Location
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {complaint.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer QR / Link Area */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-bold text-slate-500">
                  Validated on{" "}
                  <span className="text-slate-900 font-black">
                    {new Date().toLocaleDateString()}
                  </span>{" "}
                  via CivicPulse Network
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Scanned via Web App
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => navigate(backToListPath)}
          className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-sky-700 transition-all"
        >
          <div className="h-8 w-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-sky-50 group-hover:border-sky-200 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to List
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Update</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_50px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Top Banner */}
        <div
          className={`p-8 border-b border-slate-50 flex items-center justify-between flex-wrap gap-6 ${complaint.escalated ? "bg-red-50/50" : "bg-white"
            }`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                #{complaint.id.slice(-6).toUpperCase()}
              </span>
              <span
                className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${statusColors[complaint.status] || "bg-slate-100 text-slate-500"}`}
              >
                {complaint.status}
              </span>
              {complaint.escalated && (
                <span className="text-[10px] bg-red-100 text-red-700 px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                  Escalated
                </span>
              )}
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              {complaint.category} <ArrowRight className="w-3 h-3" /> {complaint.subcategory}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopyId}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy ID"}
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isDownloadingImage}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-700 hover:text-sky-800 px-5 py-2.5 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all border border-sky-100 shadow-sm shadow-sky-600/5 active:scale-95"
            >
              {isDownloadingImage ? (
                <div className="w-3.5 h-3.5 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
              Share Card
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8 grid md:grid-cols-[1.2fr_1fr] gap-10">
          {/* Left */}
          <div className="space-y-4">
            <div className="p-6 rounded-[24px] bg-slate-50/50 border border-slate-100 shadow-inner">
              <div className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-sky-500" />
                Issue Description
              </div>
              <p className="text-base font-medium text-slate-700 leading-relaxed italic">
                "{complaint.description}"
              </p>
            </div>
            <div className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm">
              <div className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                Incident Location
              </div>
              <div className="text-sm font-bold text-slate-700">
                {complaint.address}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`flex flex-col items-center justify-center p-5 rounded-[24px] border transition-all ${complaint.priorityScore >= 0.75
                  ? "bg-red-50 text-red-600 border-red-100 shadow-[0_10px_30px_rgba(239,68,68,0.1)]"
                  : complaint.priorityScore >= 0.4
                    ? "bg-amber-50 text-amber-600 border-amber-100"
                    : "bg-slate-50 text-slate-600 border-slate-100"
                  }`}
              >
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Priority Index
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tighter leading-none">
                    {(complaint.priorityScore * 10).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm flex flex-col items-center justify-center">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Category
                </div>
                <div className="text-2xl mb-1">
                  {complaint.category === "Garbage" ? "🗑️" : complaint.category === "Streetlight" ? "💡" : complaint.category === "Pothole" ? "🔧" : complaint.category === "Water" ? "💧" : "📍"}
                </div>
                <div className="text-[10px] font-black text-slate-900 uppercase">
                  {complaint.category}
                </div>
              </div>
            </div>
            <div className="bg-sky-50/50 border border-sky-100 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CheckCircle size={48} className="text-sky-600" />
              </div>
              <div className="text-[10px] font-black text-sky-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                <Shield size={14} className="text-sky-600" />
                Verification Status
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-sky-900 uppercase">
                  Authenticated Report
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-sky-600 rounded-full border border-sky-100 shadow-sm text-[10px] font-black uppercase">
                  Trusted
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Assigned Manager */}
            <div
              className={`rounded-[24px] p-6 border ${complaint.assignedManagerName ? "bg-sky-50 border-sky-100" : "bg-slate-50 border-slate-100"}`}
            >
              <div className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-sky-500" />
                Supervising Manager
              </div>
              {complaint.assignedManagerName ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-sky-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-sky-600/20">
                    {complaint.assignedManagerName.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {complaint.assignedManagerName}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Regional Head · {complaint.assignedManagerId}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-bold text-slate-400 italic">
                  Awaiting Oversight Assignment
                </div>
              )}
            </div>

            {/* SLA */}
            <div className="rounded-xl p-4 border bg-slate-50 border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-[700] text-slate-700 uppercase tracking-wider">
                    SLA Tracking
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <SLATimer
                  deadline={complaint.slaDeadline || complaint.createdAt}
                  status={complaint.status}
                />

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Standard SLA</span>
                    <span className="text-slate-900 font-bold">{complaint.slaHours} Hours</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase italic">
                    * Final resolution expected within this window
                  </p>
                </div>
              </div>
            </div>

            {/* Assignment */}
            {complaint.assignedTo && (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-[600] text-slate-400 mb-2 uppercase tracking-wider">
                  Assigned To
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-emerald-600 flex items-center justify-center text-white text-xs font-[700]">
                    {complaint.assignedTo
                      .split(" ")
                      .slice(-2)
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-[600] text-slate-800">
                      {complaint.assignedTo}
                    </div>
                    <div className="text-xs text-slate-400">
                      Field Officer · {complaint.area}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 bg-white rounded-lg p-2.5 border border-slate-100">
                  🔒 GPS-stamped proof will be uploaded on resolution
                </div>
              </div>
            )}

            {/* Escalate / Reopen / Close / Reassign Buttons */}
            <div className="space-y-2">
              {complaint.status === "Rejected" && isManager && (
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-sm font-[600] rounded-xl border border-pink-100 transition-colors"
                >
                  <Wrench className="w-4 h-4" />
                  Reassign to Manager
                </button>
              )}
              {canEscalate && !complaint.escalated && (
                <button
                  onClick={() => setShowEscalate(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-[600] rounded-xl border border-red-100 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  Escalate Complaint
                </button>
              )}
              {showDeclineOption && (
                <button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={isSubmittingRating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 disabled:bg-slate-50 text-rose-700 text-sm font-[600] rounded-xl border border-rose-100 transition-colors disabled:cursor-not-allowed shadow-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {isSubmittingRating ? "Processing..." : "Decline Resolution"}
                </button>
              )}
              {/* The user wants the Re-open button to disappear when closed */}
              {isManager && complaint.status === "Resolved" && (
                <button
                  onClick={handleCloseComplaint}
                  disabled={isSubmittingRating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 disabled:bg-emerald-50 text-emerald-700 text-sm font-[600] rounded-xl border border-emerald-200 transition-colors disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isSubmittingRating ? "Closing..." : "Close Complaint"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Photo */}
        {evidenceImageUrl && (
          <div className="px-5 pb-5">
            <div className="text-xs font-[600] text-slate-400 mb-2 uppercase tracking-wider">
              Evidence Gallery
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50 aspect-square">
                <img
                  src={evidenceImageUrl}
                  alt="Complaint evidence"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">
                    {complaint.category}
                  </span>
                  <span className="text-[10px] text-white/80 font-medium tracking-tighter">
                    #{complaint.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>

              {complaint.status === "Resolved" && (
                <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-100 flex flex-col items-center justify-center gap-2 aspect-square relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6" />
                  <Camera className="w-8 h-8 text-emerald-500 mb-1" />
                  <div className="text-center px-2">
                    <div className="text-[10px] text-emerald-700 font-black uppercase tracking-widest leading-none mb-1">
                      Resolution
                    </div>
                    <div className="text-[9px] text-emerald-500 font-bold">
                      GPS Verified
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleDownloadImage}
                  disabled={isDownloadingImage}
                  className="bg-sky-50 rounded-2xl border-2 border-sky-100 flex flex-col items-center justify-center gap-2 aspect-square group hover:bg-sky-100 transition-all border-dashed"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {isDownloadingImage ? (
                      <div className="w-4 h-4 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
                    ) : (
                      <Download className="w-5 h-5 text-sky-600" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-sky-700 font-black uppercase tracking-widest">
                      Download
                    </div>
                    <div className="text-[9px] text-sky-500 font-bold">
                      PNG File
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-base font-[700] text-slate-900 mb-6">
          Status Timeline
        </h3>

        {/* Step bar */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {statusSteps.map((s, i) => {
            const done =
              i <
              (complaint.status === "Closed"
                ? statusSteps.length
                : currentStepIndex);
            const active =
              statusSteps[i] === complaint.status ||
              (complaint.status === "Escalated" && s === "Assigned");
            return (
              <div key={s} className="flex items-center min-w-0">
                <div className="flex flex-col items-center min-w-[64px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-[700] border-2 ${done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : active
                        ? "bg-orange-500 border-orange-500 text-white ring-4 ring-orange-100"
                        : "bg-white border-slate-200 text-slate-400"
                      }`}
                  >
                    {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 text-center font-[500] whitespace-nowrap ${active
                      ? "text-orange-700"
                      : done
                        ? "text-emerald-600"
                        : "text-slate-400"
                      }`}
                  >
                    {s}
                  </span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 min-w-[20px] ${done ? "bg-emerald-400" : "bg-slate-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Event log */}
        <div className="space-y-4">
          {visibleTimeline.map((event: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                {i < visibleTimeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-slate-100 mt-1" />
                )}
              </div>
              <div className="pb-4">
                <div className="text-sm font-[600] text-slate-900">
                  {event.status}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {event.note}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-400">
                    {new Date(event.timestamp).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs text-emerald-700 font-[500]">
                    by {event.actor}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Rating Section */}
      {showRatingSection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[2rem] border border-orange-100 shadow-2xl p-8"
        >
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -ml-16 -mb-16" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-600 fill-orange-200" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Rate the Resolution
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  How satisfied are you with the service?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((n) => {
                const labels = ["Terrible", "Poor", "Okay", "Good", "Fantastic!"];
                const colors = ["text-red-400", "text-orange-400", "text-amber-400", "text-lime-500", "text-emerald-500"];
                const active = n <= rating;

                return (
                  <motion.button
                    key={n}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRating(n)}
                    className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 ${active ? "bg-orange-50 shadow-sm border-orange-100" : "bg-slate-50 border-transparent hover:bg-slate-100"
                      } border`}
                  >
                    <Star
                      className={`w-8 h-8 transition-all duration-300 ${active ? "fill-orange-400 text-orange-400" : "text-slate-300 group-hover:text-slate-400"
                        }`}
                    />
                    {active && rating === n && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-[10px] font-black uppercase tracking-widest ${colors[n - 1]}`}
                      >
                        {labels[n - 1]}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="relative group">
              <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-orange-400 transition-colors" />
              <textarea
                placeholder="Share your experience (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full pl-12 pr-4 py-4 text-sm font-medium border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-50 focus:border-orange-200 resize-none bg-slate-50 transition-all"
              />
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-300 disabled:to-slate-400 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-orange-200 active:scale-[0.98] disabled:cursor-not-allowed"
              >
                {isSubmittingRating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Feedback"
                )}
              </button>
              <button className="flex items-center gap-2 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-2xl transition-all active:scale-[0.98]">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Already Rated Feedback Display */}
      {isAlreadyRated && isReporter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-emerald-50/50 backdrop-blur-sm rounded-[2rem] border border-emerald-100 p-8 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-[1.5rem] flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-1">Feedback Submitted</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">Thank you for helping us improve!</p>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={`w-5 h-5 ${n <= (complaint.rating || 0) ? "fill-emerald-500 text-emerald-500" : "text-emerald-200"}`} />
            ))}
          </div>
          {complaint.feedback && (
            <p className="text-sm text-emerald-800 font-bold italic bg-white/60 px-6 py-3 rounded-2xl border border-emerald-100">
              "{complaint.feedback}"
            </p>
          )}
        </motion.div>
      )}

      {/* Reassign Complaint Modal */}
      {showReassignModal && complaint.status === "Rejected" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white"
          >
            <h3 className="text-lg font-[700] text-slate-900 mb-2">
              Reassign Rejected Complaint
            </h3>
            <p className="text-xs text-slate-500 mb-4">ID: {complaint.id}</p>
            <div className="text-sm text-slate-700 mb-4 p-3 bg-pink-50 rounded-xl border border-pink-100">
              <strong>Category:</strong> {complaint.category}
              <br />
              <strong>Location:</strong> {complaint.address}
            </div>
            <p className="text-xs text-slate-600 font-[600] mb-3">
              Select a manager to reassign:
            </p>
            <div className="space-y-2 mb-5 max-h-64 overflow-y-auto">
              {managers.map((mgr) => (
                <label
                  key={mgr.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedReassignManager === mgr.id
                    ? "bg-violet-50 border-violet-200"
                    : "border-slate-100 hover:bg-slate-50"
                    }`}
                >
                  <input
                    type="radio"
                    name="reassign-manager"
                    value={mgr.id}
                    checked={selectedReassignManager === mgr.id}
                    onChange={() => setSelectedReassignManager(mgr.id)}
                    className="accent-violet-600"
                  />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center text-xs font-[700]">
                    {mgr.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-[600] text-slate-800">
                      {mgr.name}
                    </div>
                    <div className="text-xs text-slate-400">{mgr.state}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!selectedReassignManager) return;

                  setIsReassigning(true);
                  try {
                    const manager = managers.find(
                      (m) => m.id === selectedReassignManager,
                    );
                    if (!manager) {
                      toast.error("Manager not found");
                      return;
                    }

                    // Reassign complaint to new manager
                    await api.patch(`/api/complaints/${complaint.id}/assign`, {
                      managerId: selectedReassignManager,
                      managerName: manager.name,
                    });

                    // Refresh complaint data
                    const updated = await appwriteService.getComplaintById(
                      complaint.id,
                    );
                    setComplaint(updated);

                    toast.success(`Complaint reassigned to ${manager.name}`);
                    setShowReassignModal(false);
                    setSelectedReassignManager("");
                  } catch (error) {
                    console.error("Reassignment error:", error);
                    toast.error("Failed to reassign complaint");
                  } finally {
                    setIsReassigning(false);
                  }
                }}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-[600] rounded-xl transition-colors disabled:opacity-40"
                disabled={!selectedReassignManager || isReassigning}
              >
                {isReassigning ? "Reassigning..." : "Confirm Reassignment"}
              </button>
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedReassignManager("");
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-[500] rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Escalation Modal */}
      {showEscalate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-[700] text-slate-900 mb-4">
              Escalate Complaint
            </h3>
            <div className="space-y-2 mb-4">
              {[
                "Still not fixed",
                "Wrong resolution",
                "Safety risk",
                "Other reason",
              ].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  <input type="radio" name="reason" className="w-4 h-4" />
                  <span className="text-sm text-slate-700">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEscalate(false)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-[600] rounded-xl transition-colors"
              >
                Submit Escalation
              </button>
              <button
                onClick={() => setShowEscalate(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-[500] rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <AnimatePresence>
        {showDeclineModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className="p-8 text-center">
                <div className="h-16 w-16 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Decline Resolution?
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Are you sure you want to decline this resolution? The
                  complaint will be re-assigned to the manager for further
                  action.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowDeclineModal(false);
                      handleDeclineResolution();
                    }}
                    className="w-full py-4 text-sm font-bold text-white bg-rose-600 rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-[0.98]"
                  >
                    Yes, Decline Resolution
                  </button>
                  <button
                    onClick={() => setShowDeclineModal(false)}
                    className="w-full py-4 text-sm font-bold text-slate-600 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all active:scale-[0.98]"
                  >
                    Go Back
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
