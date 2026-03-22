import React, { useState } from "react";

const DOMAIN_COLORS = {
  "Water Supply": "bg-blue-100 text-blue-700",
  "Sanitation": "bg-purple-100 text-purple-700",
  "Road Repair": "bg-orange-100 text-orange-700",
  "Power Supply": "bg-yellow-100 text-yellow-700",
  "Healthcare": "bg-green-100 text-green-700",
  "Education": "bg-pink-100 text-pink-700",
  "Drainage": "bg-cyan-100 text-cyan-700",
};

const WorkersSection = ({ workers, managerName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const uniqueDomains = [...new Set(workers.map((w) => w.domain))];

  return (
    <div>
      {/* Divider */}
      <div className="border-t border-gray-100 mt-2" />

      {/* Section Header — always visible, clickable */}
      <div
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-label={`Toggle field workers for ${managerName}`}
      >
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
          👷 Field Workers ({workers.length})
        </span>
        <span className="text-gray-400 text-xs">
          {isExpanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Collapsed — summary line */}
      {!isExpanded && (
        <p className="text-xs text-gray-400 mt-1">
          {workers.length} workers · {uniqueDomains.join(", ")}
        </p>
      )}

      {/* Expanded — full worker list */}
      {isExpanded && (
        <div className="mt-1">
          {workers.map((worker) => {
            const dotColor =
              worker.status === "Available"
                ? "bg-green-400"
                : worker.status === "Busy"
                ? "bg-yellow-400"
                : "bg-gray-300";

            const badgeColor =
              DOMAIN_COLORS[worker.domain] || "bg-gray-100 text-gray-600";

            return (
              <div
                key={worker.id || worker.name}
                className="flex items-center justify-between py-1"
              >
                {/* Left: dot + name */}
                <div className="flex items-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${dotColor}`}
                  />
                  <span className="text-sm text-gray-700 ml-2">
                    {worker.name}
                  </span>
                </div>

                {/* Right: domain badge */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}
                >
                  {worker.domain}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkersSection;
