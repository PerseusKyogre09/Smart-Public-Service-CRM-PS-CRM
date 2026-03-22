import React from "react";

const InsightStrip = ({ managers }) => {
  const highRiskCount = managers.filter(
    (m) => (m.resolvedIssues / m.totalIssues) * 100 < 50
  ).length;

  const underperformingCount = managers.filter(
    (m) => (m.resolvedIssues / m.totalIssues) * 100 < 65
  ).length;

  const totalSlaBreaches = managers.reduce((sum, m) => sum + m.slaBreaches, 0);

  const totalUrgentIssues = managers.reduce(
    (sum, m) => sum + m.urgentIssues,
    0
  );

  return (
    <div className="w-full bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
      {/* Label */}
      <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">
        ⚡ System Intelligence
      </span>

      {/* Vertical divider */}
      <div className="border-l border-amber-300 h-4" />

      {/* Alert chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Chip 1 — High Risk Regions */}
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
          ⚠️ {highRiskCount} High Risk Region
          {highRiskCount !== 1 ? "s" : ""}
        </span>

        {/* Chip 2 — Underperforming Managers */}
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
          📉 {underperformingCount} Underperforming Manager
          {underperformingCount !== 1 ? "s" : ""}
        </span>

        {/* Chip 3 — SLA Breaches */}
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
          🔴 {totalSlaBreaches} SLA Breach
          {totalSlaBreaches !== 1 ? "es" : ""}
        </span>

        {/* Chip 4 — Urgent Issues */}
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
          🚨 {totalUrgentIssues} Urgent Issue
          {totalUrgentIssues !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
};

export default InsightStrip;
