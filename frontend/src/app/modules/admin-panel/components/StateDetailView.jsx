import React from "react";
import InsightStrip from "./InsightStrip";
import RegionalPerformanceGrid from "./RegionalPerformanceGrid";

const StateDetailView = ({ stateData, onBack }) => {
  const totalIssues = stateData.managersList.reduce(
    (sum, m) => sum + m.totalIssues,
    0,
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 pb-20">
      {/* 1. Header Block */}
      <div className="bg-[#1f2937] rounded-xl p-8 mb-4 shadow-xl border border-[rgba(19,52,59,0.14)]">
        {/* Top row */}
        <div className="flex justify-between items-start">
          {/* LEFT side */}
          <div>
            <p className="text-[#ff9933] text-xs mb-2 font-bold tracking-widest uppercase">
              Governance / Regions
            </p>
            <h1 className="text-white text-3xl font-bold">
              {stateData.label} — {stateData.hindiLabel}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Administrative Region · National Capital Territory
            </p>
          </div>

          {/* RIGHT side */}
          <div className="flex gap-10">
            <div>
              <p className="text-white font-bold text-4xl tracking-tighter">
                {totalIssues}
              </p>
              <p className="text-slate-400 text-[10px] tracking-widest mt-2 uppercase font-semibold">
                Total Issues
              </p>
            </div>
            <div>
              <p className="text-white font-bold text-4xl tracking-tighter">
                {stateData.managers}
              </p>
              <p className="text-slate-400 text-[10px] tracking-widest mt-2 uppercase font-semibold">
                Active Managers
              </p>
            </div>
          </div>
        </div>

        {/* Second row / Back button */}
        <div className="mt-6">
          <button
            className="text-slate-400 text-sm cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 transition-all duration-200 hover:text-white hover:bg-slate-700 hover:border-slate-600"
            onClick={onBack}
          >
            ← Back to State Overview
          </button>
        </div>
      </div>

      {/* 2. Insight Strip */}
      <div className="mt-4">
        <InsightStrip managers={stateData.managersList} />
      </div>

      {/* 3. Regional Performance Grid */}
      <div className="mt-6">
        <RegionalPerformanceGrid managers={stateData.managersList} />
      </div>
    </div>
  );
};

export default StateDetailView;
