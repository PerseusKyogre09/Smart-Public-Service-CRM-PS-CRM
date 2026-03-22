/**
 * AdminPanel — Standalone Module
 * Administrative Performance & Allocation Panel
 *
 * Integration: Import AdminPanel from 'src/modules/admin-panel'
 * Dependencies: React, Tailwind v4
 * Data: src/modules/admin-panel/data/mockData.js
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { STATE_DATA } from "./data/mockData";
import StateSelectionView from "./components/StateSelectionView";
import StateDetailView from "./components/StateDetailView";
import { authService } from "../../appwriteService";

export default function AdminPanel() {
  const [selectedState, setSelectedState] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4ea] text-[#1f2937]">
      {/* Universal Admin Header */}
      <header className="bg-white border-b border-[rgba(19,52,59,0.14)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ff9933] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Admin Portal
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#d4183d] hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {selectedState ? (
        <StateDetailView
          stateData={STATE_DATA[selectedState]}
          onBack={() => setSelectedState(null)}
        />
      ) : (
        <StateSelectionView onSelectState={(key) => setSelectedState(key)} />
      )}
    </div>
  );
}
