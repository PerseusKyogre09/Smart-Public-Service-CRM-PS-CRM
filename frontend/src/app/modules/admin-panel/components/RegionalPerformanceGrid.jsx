import React from "react";
import RegionalManagerCard from "./RegionalManagerCard";
import { ALL_WORKERS } from "../data/mockData";

const RegionalPerformanceGrid = ({ managers }) => {
  const getWorkersForManager = (manager) => {
    return ALL_WORKERS.filter((w) =>
      manager.managedAreas.some((area) => area === w.area)
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
        Regional Performance Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {managers.map((manager) => (
          <RegionalManagerCard
            key={manager.id}
            manager={manager}
            workers={getWorkersForManager(manager)}
          />
        ))}
      </div>
    </div>
  );
};

export default RegionalPerformanceGrid;
