import React, { useState } from "react";
import WorkersSection from "./WorkersSection";

const RegionalManagerCard = ({ manager, workers }) => {
  const [isHovered, setIsHovered] = useState(false);

  const resolutionRate = Math.round(
    (manager.resolvedIssues / manager.totalIssues) * 100
  );
  const performanceScore = resolutionRate;

  const risk =
    resolutionRate >= 75
      ? "efficient"
      : resolutionRate >= 50
      ? "moderate"
      : "critical";

  const riskConfig = {
    efficient: {
      label: "Efficient Zone",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-700",
      dot: "bg-green-500",
    },
    moderate: {
      label: "Moderate Load",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      badge: "bg-yellow-100 text-yellow-700",
      dot: "bg-yellow-500",
    },
    critical: {
      label: "Critical Region",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      badge: "bg-red-100 text-red-700",
      dot: "bg-red-500",
    },
  };

  const rc = riskConfig[risk];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* A. Card Header */}
      <div className="p-4 pb-3">
        {/* Top row */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: manager.avatarColor }}
            >
              {manager.initials}
            </div>
            {/* Name and Role */}
            <div>
              <p className="text-sm font-bold text-gray-800">{manager.name}</p>
              <p className="text-xs text-gray-500">
                {manager.role} · {manager.region}
              </p>
            </div>
          </div>

          {/* Risk badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${rc.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
            {rc.label}
          </div>
        </div>

        {/* Second row */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {manager.email}
        </div>
      </div>

      {/* B. Metrics Row */}
      <div className="px-4 py-3 bg-gray-50 border-t border-b border-gray-100 grid grid-cols-4 gap-2">
        <div>
          <p className={`text-lg font-bold ${rc.color}`}>
            {performanceScore}/100
          </p>
          <p className="text-[10px] text-gray-400 tracking-wide uppercase mt-0.5">
            SCORE
          </p>
        </div>
        <div>
          <p className={`text-lg font-bold ${rc.color}`}>
            {resolutionRate}%
          </p>
          <p className="text-[10px] text-gray-400 tracking-wide uppercase mt-0.5">
            RES. RATE
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-700">
            {manager.activeIssues}
          </p>
          <p className="text-[10px] text-gray-400 tracking-wide uppercase mt-0.5">
            ACTIVE ISSUES
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-700">
            {manager.projectsHandled}
          </p>
          <p className="text-[10px] text-gray-400 tracking-wide uppercase mt-0.5">
            PROJECTS
          </p>
        </div>
      </div>

      {/* C. Workers Section */}
      <div className="px-4">
        <WorkersSection workers={workers} managerName={manager.name} />
      </div>

      {/* D. SLA Warning Line */}
      {(manager.slaBreaches > 0 || manager.urgentIssues > 0) && (
        <div className="px-4 pt-2">
          <p className="text-xs text-orange-600 font-medium">
            ⚠ {manager.slaBreaches} SLA breach{manager.slaBreaches !== 1 ? "es" : ""} ·{" "}
            {manager.urgentIssues} urgent issue{manager.urgentIssues !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* E. Action Button */}
      <div className="p-4 pt-3 mt-auto">
        <button
          className={`w-full text-sm font-semibold py-2 px-4 rounded-lg border transition-colors duration-200 cursor-pointer ${
            isHovered
              ? `${rc.bg} ${rc.border} ${rc.color}`
              : "bg-white border-gray-300 text-gray-700"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          View Critical Issues →
        </button>
      </div>
    </div>
  );
};

export default RegionalManagerCard;
