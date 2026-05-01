import { useState, useEffect, useMemo } from "react";
import { appwriteService } from "../../appwriteService";
import {
  CircleMarker,
  MapContainer,
  Rectangle,
  TileLayer,
  Tooltip as MapTooltip,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  Cell,
} from "recharts";
import {
  Activity,
  LayoutDashboard,
  Map as MapIcon,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Smile,
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { mockAreaStats } from "../../data/mockData";

type DelhiZoneId =
  | "south"
  | "central_new"
  | "east_shahdara"
  | "west"
  | "north_nw";

type ZoneStats = {
  id: DelhiZoneId;
  name: string;
  localities: string[];
  target: string;
  total: number;
  pending: number;
  resolved: number;
  escalated: number;
};

type DelhiSubZone = {
  id: string;
  name: string;
  parent: DelhiZoneId;
  bounds: [[number, number], [number, number]];
};

const DELHI_BOUNDS = {
  minLat: 28.39,
  maxLat: 28.89,
  minLng: 76.84,
  maxLng: 77.35,
};

const DELHI_ZONE_CONFIG: Array<{
  id: DelhiZoneId;
  name: string;
  localities: string[];
  target: string;
  keywords: string[];
  center: [number, number];
  bounds: [[number, number], [number, number]];
  x: number;
  y: number;
  w: number;
  h: number;
}> = [
  {
    id: "south",
    name: "South Delhi",
    localities: ["Saket", "GK", "Hauz Khas", "Vasant Vihar"],
    target: "High-income households, expats, luxury consumers",
    keywords: [
      "south delhi",
      "saket",
      "gk",
      "greater kailash",
      "hauz khas",
      "vasant vihar",
      "malviya nagar",
      "defence colony",
    ],
    center: [28.535, 77.19],
    bounds: [
      [28.465, 77.09],
      [28.605, 77.31],
    ],
    x: 10,
    y: 58,
    w: 38,
    h: 30,
  },
  {
    id: "central_new",
    name: "Central & New Delhi",
    localities: ["Connaught Place", "Karol Bagh", "Daryaganj", "Civil Lines"],
    target: "Corporates, high-street shoppers, tourists, government employees",
    keywords: [
      "central delhi",
      "new delhi",
      "connaught place",
      "cp",
      "karol bagh",
      "daryaganj",
      "civil lines",
      "paharganj",
    ],
    center: [28.64, 77.205],
    bounds: [
      [28.6, 77.14],
      [28.69, 77.25],
    ],
    x: 30,
    y: 38,
    w: 32,
    h: 20,
  },
  {
    id: "east_shahdara",
    name: "East Delhi & Shahdara",
    localities: ["Laxmi Nagar", "Preet Vihar", "Mayur Vihar", "Gandhi Nagar"],
    target: "Young professionals, students, mid-income families",
    keywords: [
      "east delhi",
      "shahdara",
      "laxmi nagar",
      "preet vihar",
      "mayur vihar",
      "gandhi nagar",
      "anand vihar",
      "vivek vihar",
    ],
    center: [28.645, 77.285],
    bounds: [
      [28.585, 77.225],
      [28.73, 77.35],
    ],
    x: 62,
    y: 42,
    w: 28,
    h: 34,
  },
  {
    id: "west",
    name: "West Delhi",
    localities: ["Rajouri Garden", "Punjabi Bagh", "Janakpuri", "Patel Nagar"],
    target: "Retail consumers, residential communities, family businesses",
    keywords: [
      "west delhi",
      "rajouri garden",
      "punjabi bagh",
      "janakpuri",
      "patel nagar",
      "tilak nagar",
      "vikaspuri",
      "dwarka",
    ],
    center: [28.655, 77.07],
    bounds: [
      [28.58, 76.96],
      [28.72, 77.14],
    ],
    x: 8,
    y: 28,
    w: 28,
    h: 30,
  },
  {
    id: "north_nw",
    name: "North & North-West Delhi",
    localities: ["Rohini", "Model Town", "Delhi University Campus", "Narela"],
    target: "Students, tech-enabled youth, industrial professionals",
    keywords: [
      "north delhi",
      "north west delhi",
      "north-west delhi",
      "rohini",
      "model town",
      "narela",
      "delhi university",
      "du campus",
      "burari",
      "pitampura",
    ],
    center: [28.77, 77.14],
    bounds: [
      [28.69, 77.02],
      [28.87, 77.26],
    ],
    x: 26,
    y: 8,
    w: 42,
    h: 28,
  },
];

const DEFAULT_ZONE = DELHI_ZONE_CONFIG.find((z) => z.id === "central_new")!;
const DELHI_CENTER: [number, number] = [28.6139, 77.209];
const DELHI_ZONES_FRAME_BOUNDS: [[number, number], [number, number]] = [
  [28.46, 76.96],
  [28.87, 77.35],
];

const DELHI_SUBZONES: DelhiSubZone[] = [
  {
    id: "south-saket-gk",
    name: "Saket / GK",
    parent: "south",
    bounds: [
      [28.49, 77.17],
      [28.57, 77.26],
    ],
  },
  {
    id: "south-hauz-vasant",
    name: "Hauz Khas / Vasant Vihar",
    parent: "south",
    bounds: [
      [28.53, 77.09],
      [28.6, 77.18],
    ],
  },
  {
    id: "central-cp-karol",
    name: "Connaught Place / Karol Bagh",
    parent: "central_new",
    bounds: [
      [28.62, 77.17],
      [28.67, 77.23],
    ],
  },
  {
    id: "central-civil-darya",
    name: "Civil Lines / Daryaganj",
    parent: "central_new",
    bounds: [
      [28.6, 77.14],
      [28.69, 77.19],
    ],
  },
  {
    id: "east-laxmi-preet",
    name: "Laxmi Nagar / Preet Vihar",
    parent: "east_shahdara",
    bounds: [
      [28.61, 77.25],
      [28.69, 77.31],
    ],
  },
  {
    id: "east-mayur-shahdara",
    name: "Mayur Vihar / Shahdara",
    parent: "east_shahdara",
    bounds: [
      [28.62, 77.29],
      [28.73, 77.35],
    ],
  },
  {
    id: "west-rajouri-punjabi",
    name: "Rajouri / Punjabi Bagh",
    parent: "west",
    bounds: [
      [28.63, 77.03],
      [28.7, 77.12],
    ],
  },
  {
    id: "west-janak-vikaspuri",
    name: "Janakpuri / Vikaspuri",
    parent: "west",
    bounds: [
      [28.58, 76.98],
      [28.66, 77.07],
    ],
  },
  {
    id: "north-rohini-model",
    name: "Rohini / Model Town",
    parent: "north_nw",
    bounds: [
      [28.72, 77.08],
      [28.81, 77.18],
    ],
  },
  {
    id: "north-narela-burari",
    name: "Narela / Burari",
    parent: "north_nw",
    bounds: [
      [28.79, 77.12],
      [28.87, 77.26],
    ],
  },
];

function ZoomLevelWatcher({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  useMapEvents({
    zoomend(event) {
      onZoomChange(event.target.getZoom());
    },
  });

  return null;
}

function isDelhiComplaint(complaint: any): boolean {
  const searchable = [
    complaint?.state,
    complaint?.address,
    complaint?.area,
    complaint?.ward,
    complaint?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    searchable.includes("delhi") ||
    searchable.includes("new delhi") ||
    searchable.includes("nct")
  ) {
    return true;
  }

  const coords = complaint?.coordinates;
  if (coords && typeof coords === "object") {
    const lat = Number(coords.lat ?? coords.latitude);
    const lng = Number(coords.lng ?? coords.longitude);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return (
        lat >= DELHI_BOUNDS.minLat &&
        lat <= DELHI_BOUNDS.maxLat &&
        lng >= DELHI_BOUNDS.minLng &&
        lng <= DELHI_BOUNDS.maxLng
      );
    }
  }

  return false;
}

function inferDelhiZone(complaint: any): DelhiZoneId {
  const searchable = [
    complaint?.area,
    complaint?.ward,
    complaint?.address,
    complaint?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const zone of DELHI_ZONE_CONFIG) {
    if (zone.keywords.some((keyword) => searchable.includes(keyword))) {
      return zone.id;
    }
  }

  const coords = complaint?.coordinates;
  if (coords && typeof coords === "object") {
    const lat = Number(coords.lat ?? coords.latitude);
    const lng = Number(coords.lng ?? coords.longitude);

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      if (lat >= 28.72) return "north_nw";
      if (lat <= 28.56) return "south";
      if (lng >= 77.23) return "east_shahdara";
      if (lng <= 77.08) return "west";
    }
  }

  return DEFAULT_ZONE.id;
}

// Live interactive map heatmap component
function CityHeatmap({
  activeCategory,
  zoneStats,
}: {
  activeCategory: string;
  zoneStats: ZoneStats[];
}) {
  const [mapZoom, setMapZoom] = useState(10);

  const totalOpen = useMemo(
    () => zoneStats.reduce((sum, zone) => sum + zone.pending, 0),
    [zoneStats],
  );
  const totalSolved = useMemo(
    () => zoneStats.reduce((sum, zone) => sum + zone.resolved, 0),
    [zoneStats],
  );
  const totalReceived = useMemo(
    () => zoneStats.reduce((sum, zone) => sum + zone.total, 0),
    [zoneStats],
  );

  const zoneById = useMemo(() => {
    const map: Record<DelhiZoneId, ZoneStats> = {
      south: {
        id: "south",
        name: "South Delhi",
        localities: [],
        target: "",
        total: 0,
        pending: 0,
        resolved: 0,
        escalated: 0,
      },
      central_new: {
        id: "central_new",
        name: "Central & New Delhi",
        localities: [],
        target: "",
        total: 0,
        pending: 0,
        resolved: 0,
        escalated: 0,
      },
      east_shahdara: {
        id: "east_shahdara",
        name: "East Delhi & Shahdara",
        localities: [],
        target: "",
        total: 0,
        pending: 0,
        resolved: 0,
        escalated: 0,
      },
      west: {
        id: "west",
        name: "West Delhi",
        localities: [],
        target: "",
        total: 0,
        pending: 0,
        resolved: 0,
        escalated: 0,
      },
      north_nw: {
        id: "north_nw",
        name: "North & North-West Delhi",
        localities: [],
        target: "",
        total: 0,
        pending: 0,
        resolved: 0,
        escalated: 0,
      },
    };

    zoneStats.forEach((zone) => {
      map[zone.id] = zone;
    });
    return map;
  }, [zoneStats]);

  const [selectedZoneId, setSelectedZoneId] = useState<DelhiZoneId>(
    DEFAULT_ZONE.id,
  );

  const maxZoneLoad = useMemo(
    () => Math.max(...zoneStats.map((z) => z.pending + z.escalated), 1),
    [zoneStats],
  );

  const getZonePalette = (score: number) => {
    if (score >= 0.85) return { stroke: "#ef4444", fill: "#fb7185" };
    if (score >= 0.65) return { stroke: "#f97316", fill: "#fb923c" };
    if (score >= 0.45) return { stroke: "#eab308", fill: "#facc15" };
    return { stroke: "#14b8a6", fill: "#2dd4bf" };
  };

  const subZoneStats = useMemo(() => {
    const stats: Record<string, number> = {};

    DELHI_SUBZONES.forEach((subZone) => {
      const parentZoneStats = zoneById[subZone.parent];
      const baselineLoad = parentZoneStats.pending + parentZoneStats.escalated;
      const weight = (Math.abs(subZone.name.length * 13) % 35) / 100 + 0.32;
      stats[subZone.id] = Math.max(1, Math.round(baselineLoad * weight));
    });

    return stats;
  }, [zoneById]);

  const maxSubZoneLoad = useMemo(
    () => Math.max(...Object.values(subZoneStats), 1),
    [subZoneStats],
  );

  const topZoneId = useMemo(() => {
    return [...zoneStats].sort(
      (a, b) => b.pending + b.escalated - (a.pending + a.escalated),
    )[0]?.id;
  }, [zoneStats]);

  useEffect(() => {
    if (!topZoneId) return;
    setSelectedZoneId((prev) => (zoneById[prev] ? prev : topZoneId));
  }, [topZoneId, zoneById]);

  const showDeepRegions = mapZoom >= 12;

  const selectedZone = zoneById[selectedZoneId] || zoneById[DEFAULT_ZONE.id];

  const deepRegionText = showDeepRegions
    ? `Zoom ${mapZoom}: showing ${selectedZone.name} deep regions`
    : `Zoom ${mapZoom}: zoom in to 12+ for deep regions`;

  return (
    <div className="relative grid gap-3 lg:grid-cols-[1.55fr_0.8fr]">
      <div className="relative h-[560px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_22px_40px_rgba(15,23,42,0.12)]">
        <div className="pointer-events-none absolute left-4 top-4 z-[450] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-slate-800 shadow-sm backdrop-blur-md">
          <p className="text-[11px] font-[800] uppercase tracking-[0.18em] text-slate-500">
            Delhi Zone Overview
          </p>
          <p className="mt-1 text-sm font-[700] text-slate-900">
            {activeCategory ? activeCategory : "All Categories"}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Received {totalReceived} · Solved {totalSolved} · Pending{" "}
            {totalOpen}
          </p>
          <p className="mt-1 text-[10px] font-[600] text-slate-500">
            {deepRegionText}
          </p>
        </div>

        <MapContainer
          bounds={DELHI_ZONES_FRAME_BOUNDS}
          boundsOptions={{ padding: [28, 28] }}
          minZoom={10}
          maxZoom={16}
          maxBounds={[
            [DELHI_BOUNDS.minLat, DELHI_BOUNDS.minLng],
            [DELHI_BOUNDS.maxLat, DELHI_BOUNDS.maxLng],
          ]}
          maxBoundsViscosity={0.8}
          className="h-full w-full"
          zoomControl={false}
        >
          <ZoomLevelWatcher onZoomChange={setMapZoom} />
          <ZoomControl position="bottomleft" />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {DELHI_ZONE_CONFIG.map((zone) => {
            const zoneMetrics = zoneById[zone.id];
            const areaLoad = zoneMetrics.pending + zoneMetrics.escalated;
            const loadScore = areaLoad / maxZoneLoad;
            const zoneColor = getZonePalette(loadScore);
            const isSelected = selectedZoneId === zone.id;

            return (
              <Rectangle
                key={`zone-${zone.id}`}
                bounds={zone.bounds}
                pathOptions={{
                  color: isSelected ? zoneColor.stroke : "#64748b",
                  weight: isSelected ? 2 : 1.2,
                  dashArray: isSelected ? undefined : "5 5",
                  fillColor: zoneColor.fill,
                  fillOpacity: isSelected ? 0.2 + loadScore * 0.22 : 0.08,
                }}
                eventHandlers={{
                  click: () => setSelectedZoneId(zone.id),
                }}
              >
                <MapTooltip direction="top" sticky opacity={0.95}>
                  <div className="min-w-[170px]">
                    <p className="text-[11px] font-[700] text-slate-900">
                      {zone.name}
                    </p>
                    <p className="text-[11px] text-slate-700">
                      Received {zoneMetrics.total} · Solved{" "}
                      {zoneMetrics.resolved} · Pending {zoneMetrics.pending}
                    </p>
                  </div>
                </MapTooltip>
              </Rectangle>
            );
          })}

          {DELHI_ZONE_CONFIG.map((zone) => {
            const zoneMetrics = zoneById[zone.id];
            const areaLoad = zoneMetrics.pending + zoneMetrics.escalated;
            const loadScore = areaLoad / maxZoneLoad;
            const zoneColor = getZonePalette(loadScore);
            const isSelected = selectedZoneId === zone.id;

            return (
              <CircleMarker
                key={`zone-center-${zone.id}`}
                center={zone.center}
                radius={isSelected ? 11 : 7}
                pathOptions={{
                  color: isSelected ? "#0f172a" : "#ffffff",
                  fillColor: zoneColor.stroke,
                  fillOpacity: isSelected ? 0.95 : 0.82,
                  weight: isSelected ? 2 : 1,
                }}
                eventHandlers={{
                  click: () => setSelectedZoneId(zone.id),
                }}
              >
                <MapTooltip direction="top" offset={[0, -6]} opacity={0.95}>
                  <div className="min-w-[170px]">
                    <p className="text-[11px] font-[700] text-slate-900">
                      {zone.name}
                    </p>
                    <p className="text-[11px] text-slate-700">
                      Received {zoneMetrics.total} · Solved{" "}
                      {zoneMetrics.resolved} · Pending {zoneMetrics.pending}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Click to focus this zone
                    </p>
                  </div>
                </MapTooltip>
              </CircleMarker>
            );
          })}

          {showDeepRegions &&
            DELHI_SUBZONES.filter(
              (subZone) => subZone.parent === selectedZoneId,
            ).map((subZone) => {
              const subZoneLoad = subZoneStats[subZone.id] || 1;
              const intensity = subZoneLoad / maxSubZoneLoad;
              const tone =
                intensity >= 0.8
                  ? { stroke: "#ef4444", fill: "#fda4af" }
                  : intensity >= 0.6
                    ? { stroke: "#f97316", fill: "#fdba74" }
                    : intensity >= 0.45
                      ? { stroke: "#eab308", fill: "#fde68a" }
                      : { stroke: "#14b8a6", fill: "#99f6e4" };

              return (
                <Rectangle
                  key={`subzone-${subZone.id}`}
                  bounds={subZone.bounds}
                  pathOptions={{
                    color: tone.stroke,
                    weight: 1.5,
                    dashArray: "6 4",
                    fillColor: tone.fill,
                    fillOpacity: 0.16 + intensity * 0.18,
                  }}
                >
                  <MapTooltip direction="top" sticky opacity={0.95}>
                    <div className="min-w-[170px]">
                      <p className="text-[11px] font-[700] text-slate-900">
                        {subZone.name}
                      </p>
                      <p className="text-[11px] text-slate-700">
                        Parent: {zoneById[subZone.parent].name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Pending (est.) {subZoneLoad}
                      </p>
                    </div>
                  </MapTooltip>
                </Rectangle>
              );
            })}
        </MapContainer>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.1)]">
        <h4 className="text-sm font-[800] text-slate-900">Zone Focus</h4>
        <p className="mt-1 text-xs text-slate-500">
          Selected:{" "}
          <span className="font-[700] text-slate-700">{selectedZone.name}</span>
        </p>
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[11px] text-slate-500">Complaint Received</p>
          <p className="text-xl font-[800] text-slate-900">
            {selectedZone.total}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">Solved</p>
          <p className="text-lg font-[800] text-emerald-600">
            {selectedZone.resolved}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">Pending</p>
          <p className="text-xl font-[800] text-rose-600">
            {selectedZone.pending}
          </p>
        </div>

        <div className="mt-3 space-y-2">
          {DELHI_ZONE_CONFIG.map((zone) => {
            const zoneMetrics = zoneById[zone.id];
            const isSelected = selectedZoneId === zone.id;
            return (
              <button
                key={`panel-${zone.id}`}
                type="button"
                onClick={() => setSelectedZoneId(zone.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <p className="text-[11px] font-[700] leading-tight">
                  {zone.name}
                </p>
                <p
                  className={`mt-1 text-[10px] ${isSelected ? "text-slate-200" : "text-slate-500"}`}
                >
                  Received {zoneMetrics.total} · Solved {zoneMetrics.resolved} ·
                  Pending {zoneMetrics.pending}
                </p>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-[10px] text-slate-500">
          Tip: click a zone marker or card, then zoom in to see its deeper
          regions.
        </p>
      </div>
    </div>
  );
}

const resolutionTimeData = DELHI_ZONE_CONFIG.map((zone) => ({
  zone: zone.name,
  avgTime: 0,
  target: 72,
}));

// These will be replaced with dynamic calculations in the component
const defaultSlaHistoryData = [
  { month: "Oct", compliance: 71 },
  { month: "Nov", compliance: 74 },
  { month: "Dec", compliance: 77 },
  { month: "Jan", compliance: 79 },
  { month: "Feb", compliance: 80 },
  { month: "Mar", compliance: 82 },
];

const defaultKpiData = {
  mtta: 2.5,
  mttr: 48,
  slaCompliance: 82,
  satisfactionScore: 4.1,
};

export default function AdminAnalytics() {
  const [activeCategory, setActiveCategory] = useState("");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = appwriteService.subscribeToComplaints((data) => {
      setComplaints(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredComplaints = useMemo(() => complaints, [complaints]);

  // Calculate SLA history from actual data - last 6 months
  const slaHistoryData = useMemo(() => {
    const monthData: Record<string, { total: number; met: number }> = {};

    filteredComplaints.forEach((c) => {
      if (!c.createdAt) return;
      const date = new Date(c.createdAt);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (!monthData[monthKey]) {
        monthData[monthKey] = { total: 0, met: 0 };
      }

      if (["Resolved", "Closed"].includes(c.status)) {
        monthData[monthKey].total++;
        if ((c.slaRemainingHours || 1) >= 0) {
          monthData[monthKey].met++;
        }
      }
    });

    // Get last 6 months
    const months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const data = monthData[key] || { total: 0, met: 0 };
      months.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        compliance:
          data.total > 0 ? Math.round((data.met / data.total) * 100) : 0,
      });
    }
    return months;
  }, [filteredComplaints]);

  const delhiComplaints = useMemo(
    () => filteredComplaints.filter((c) => isDelhiComplaint(c)),
    [filteredComplaints],
  );

  const zoneStats = useMemo<ZoneStats[]>(() => {
    const statsByZone: Record<DelhiZoneId, ZoneStats> =
      DELHI_ZONE_CONFIG.reduce(
        (acc, zone) => {
          acc[zone.id] = {
            id: zone.id,
            name: zone.name,
            localities: zone.localities,
            target: zone.target,
            total: 0,
            pending: 0,
            resolved: 0,
            escalated: 0,
          };
          return acc;
        },
        {} as Record<DelhiZoneId, ZoneStats>,
      );

    delhiComplaints
      .filter((c) => !activeCategory || c.category === activeCategory)
      .forEach((complaint) => {
        const zoneId = inferDelhiZone(complaint);
        const zone = statsByZone[zoneId];
        zone.total += 1;

        if (["Resolved", "Closed"].includes(complaint.status)) {
          zone.resolved += 1;
        } else {
          zone.pending += 1;
        }

        if (complaint.escalated) {
          zone.escalated += 1;
        }
      });

    return DELHI_ZONE_CONFIG.map((zone) => statsByZone[zone.id]);
  }, [activeCategory, delhiComplaints]);

  // Calculate performance metrics from actual data
  const { kpiData, resolutionByZone, areaStats } = useMemo(() => {
    if (filteredComplaints.length === 0) {
      return {
        kpiData: {
          mtta: 0,
          mttr: 0,
          slaCompliance: 0,
          satisfactionScore: 0,
        },
        resolutionByZone: [],
        areaStats: [],
      };
    }

    // Calculate MTTA - mean time to assignment (hours from submission to assigned)
    const assignmentTimes = filteredComplaints
      .filter((c) => c.assignedAt || c.createdAt)
      .map((c) => {
        const created = new Date(c.createdAt).getTime();
        const assigned = c.assignedAt
          ? new Date(c.assignedAt).getTime()
          : created;
        return (assigned - created) / (1000 * 60 * 60);
      });
    const mtta =
      assignmentTimes.length > 0
        ? Math.round(
            (assignmentTimes.reduce((a, b) => a + b, 0) /
              assignmentTimes.length) *
              10,
          ) / 10
        : defaultKpiData.mtta;

    // Calculate MTTR - mean time to resolution
    const resolutionTimes = filteredComplaints
      .filter((c) => ["Resolved", "Closed"].includes(c.status))
      .map((c) => {
        const created = new Date(c.createdAt).getTime();
        const updated = new Date(c.updatedAt).getTime();
        return (updated - created) / (1000 * 60 * 60);
      });
    const mttr =
      resolutionTimes.length > 0
        ? Math.round(
            (resolutionTimes.reduce((a, b) => a + b, 0) /
              resolutionTimes.length) *
              10,
          ) / 10
        : defaultKpiData.mttr;

    // Calculate SLA Compliance
    const resolved = filteredComplaints.filter((c) =>
      ["Resolved", "Closed"].includes(c.status),
    );
    const slaMet = resolved.filter(
      (c) => (c.slaRemainingHours || 1) >= 0,
    ).length;
    const slaCompliance =
      resolved.length > 0 ? Math.round((slaMet / resolved.length) * 100) : 0;

    // Calculate Satisfaction Score from ratings
    const ratings = filteredComplaints
      .filter((c) => c.rating)
      .map((c) => c.rating);
    const satisfactionScore =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
          ) / 10
        : defaultKpiData.satisfactionScore;

    // Group by area with full stats
    const areaStatsMap: Record<string, any> = {};
    filteredComplaints.forEach((c) => {
      const area = c.area || c.ward || "Other";
      if (!areaStatsMap[area]) {
        areaStatsMap[area] = {
          area,
          totalComplaints: 0,
          resolved: 0,
          times: [],
        };
      }
      areaStatsMap[area].totalComplaints++;
      if (["Resolved", "Closed"].includes(c.status)) {
        areaStatsMap[area].resolved++;
        const created = new Date(c.createdAt).getTime();
        const updated = new Date(c.updatedAt).getTime();
        const hours = (updated - created) / (1000 * 60 * 60);
        areaStatsMap[area].times.push(hours);
      }
    });

    const areaStatsWithMetrics = Object.values(areaStatsMap)
      .map((stat: any) => ({
        ...stat,
        avgResolutionHours:
          stat.times.length > 0
            ? Math.round(
                stat.times.reduce((a: number, b: number) => a + b, 0) /
                  stat.times.length,
              )
            : 0,
        civicHealthScore: Math.max(
          40,
          Math.min(
            100,
            Math.round(
              (stat.resolved / Math.max(stat.totalComplaints, 1)) * 80 +
                (Math.max(
                  0,
                  72 -
                    (stat.times.length > 0
                      ? stat.times.reduce((a: number, b: number) => a + b, 0) /
                        stat.times.length
                      : 0),
                ) /
                  72) *
                  20,
            ),
          ),
        ),
      }))
      .sort((a, b) => b.totalComplaints - a.totalComplaints);

    const zoneStatsMap: Record<
      DelhiZoneId,
      { totalHours: number; count: number }
    > = DELHI_ZONE_CONFIG.reduce(
      (acc, zone) => {
        acc[zone.id] = { totalHours: 0, count: 0 };
        return acc;
      },
      {} as Record<DelhiZoneId, { totalHours: number; count: number }>,
    );

    filteredComplaints.forEach((c) => {
      if (!["Resolved", "Closed"].includes(c.status)) return;
      if (!c.createdAt || !c.updatedAt) return;

      const created = new Date(c.createdAt).getTime();
      const updated = new Date(c.updatedAt).getTime();
      if (Number.isNaN(created) || Number.isNaN(updated) || updated < created)
        return;

      const zoneId = inferDelhiZone(c);
      zoneStatsMap[zoneId].totalHours += (updated - created) / (1000 * 60 * 60);
      zoneStatsMap[zoneId].count += 1;
    });

    const resolutionByZoneData = DELHI_ZONE_CONFIG.map((zone) => ({
      zone: zone.name,
      avgTime:
        zoneStatsMap[zone.id].count > 0
          ? Math.round(
              zoneStatsMap[zone.id].totalHours / zoneStatsMap[zone.id].count,
            )
          : 0,
      target: 72,
    }));

    return {
      kpiData: { mtta, mttr, slaCompliance, satisfactionScore },
      resolutionByZone: resolutionByZoneData,
      areaStats: areaStatsWithMetrics,
    };
  }, [filteredComplaints]);

  const summaryCounts = useMemo(() => {
    const received = filteredComplaints.length;
    const solved = filteredComplaints.filter((c) =>
      ["Resolved", "Closed"].includes(c.status),
    ).length;
    const pending = Math.max(0, received - solved);

    return { received, solved, pending };
  }, [filteredComplaints]);

  if (loading && complaints.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <Skeleton className="h-[560px] w-full rounded-[2.5rem]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-[2rem]" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-[2.5rem]" />
          <Skeleton className="h-80 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12" id="analytics-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
              <Activity size={20} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Intelligence Center
            </h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
            NCT Delhi Operational Metrics · Command Heatmap
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="h-14 px-8 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-2xl focus:outline-none text-slate-900 cursor-pointer hover:bg-slate-50 transition-all shadow-sm"
          >
            <option value="">Global Operations</option>
            {[
              "Pothole",
              "Garbage",
              "Water",
              "Streetlight",
              "Safety",
              "Sanitation",
              "Construction",
              "Other",
            ].map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()} SECTOR
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="space-y-6">
        <div className="px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Live Heatmap Overview
          </h2>
        </div>
        <CityHeatmap activeCategory={activeCategory} zoneStats={zoneStats} />
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Complaint Received",
            value: `${summaryCounts.received}`,
            target: "All Registry",
            ok: true,
            desc: "Operational Load",
            color: "border-slate-900"
          },
          {
            label: "Solved",
            value: `${summaryCounts.solved}`,
            target: "80% Threshold",
            ok:
              summaryCounts.solved >=
              Math.max(1, Math.round(summaryCounts.received * 0.5)),
            desc: "Resolution Rate",
            color: "border-emerald-500"
          },
          {
            label: "Pending",
            value: `${summaryCounts.pending}`,
            target: "< 20% Backlog",
            ok:
              summaryCounts.pending <=
              Math.max(3, Math.round(summaryCounts.received * 0.4)),
            desc: "Queue Backlog",
            color: "border-rose-500"
          },
          {
            label: "SLA Compliance",
            value: `${kpiData.slaCompliance}%`,
            target: "95% Target",
            ok: kpiData.slaCompliance > 80,
            desc: "Protocol Fidelity",
            color: "border-violet-600"
          },
        ].map(({ label, value, target, ok, desc, color }) => (
          <div
            key={label}
            className={`bg-white rounded-[1.75rem] p-6 border border-slate-100 border-l-[6px] ${color} shadow-lg shadow-slate-200/40`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{desc}</span>
              <span
                className={`w-2 h-2 rounded-full mt-1 ${ok ? "bg-emerald-500" : "bg-red-500"}`}
              />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">
              {value}
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Benchmark: {target}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* SLA Compliance Trend */}
        <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] p-5">
          <h3 className="text-base font-[700] text-slate-900 mb-1">
            SLA Compliance Trend
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            6-month view based on complaints in selected range
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={slaHistoryData}>
              <defs>
                <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                domain={[60, 90]}
              />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
                labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                itemStyle={{ color: "#f8fafc" }}
                formatter={(value: number) => [
                  <span style={{ color: "#f8fafc", fontWeight: 700 }}>
                    {value}h
                  </span>,
                  <span style={{ color: "#f8fafc" }}>Avg Time</span>,
                ]}
              />
              <Area
                type="monotone"
                dataKey="compliance"
                stroke="#7c3aed"
                strokeWidth={3}
                fill="url(#slaGrad)"
                dot={{ fill: "#7c3aed", strokeWidth: 0, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={() => 80}
                stroke="#10B981"
                strokeDasharray="4 4"
                strokeWidth={1}
                dot={false}
                name="Target 80%"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Time by Area */}
        <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] p-5">
          <h3 className="text-base font-[700] text-slate-900 mb-1">
            Avg Resolution Time by Zone
          </h3>
          <p className="text-xs text-slate-400 mb-4">Hours · Target: 72h</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resolutionByZone} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="zone"
                type="category"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
                labelStyle={{ color: "#f8fafc", fontWeight: 600 }}
                itemStyle={{ color: "#f8fafc" }}
                formatter={(value: number) => [`${value}h`, "Avg Time"]}
              />
              <Bar dataKey="avgTime" name="Avg Time" radius={[0, 4, 4, 0]}>
                {resolutionByZone.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.avgTime > 72
                        ? "#be123c"
                        : entry.avgTime > 48
                          ? "#d97706"
                          : "#4f46e5"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area Stats Table */}
      <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-[700] text-slate-900">
            Area Performance Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-8 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Operational Sector
                </th>
                <th className="text-right px-6 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Registry
                </th>
                <th className="text-right px-6 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Authenticated
                </th>
                <th className="text-right px-6 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Backlog
                </th>
                <th className="text-right px-8 py-5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  Efficiency (Avg)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {areaStats.map((w) => (
                <tr
                  key={w.area}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 font-[600] text-slate-800">
                    {w.area}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {w.totalComplaints}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-emerald-600 font-[600]">
                      {w.resolved}
                    </span>
                    <span className="text-slate-400 text-xs ml-1">
                      ({Math.round((w.resolved / w.totalComplaints) * 100)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-rose-600 font-[600]">
                      {Math.max(0, w.totalComplaints - w.resolved)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        w.avgResolutionHours > 72
                          ? "text-red-600 font-[600]"
                          : w.avgResolutionHours > 48
                            ? "text-amber-600 font-[600]"
                            : "text-emerald-600 font-[600]"
                      }
                    >
                      {w.avgResolutionHours}h
                    </span>
                  </td>
                </tr>
              ))}
              {areaStats.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    No area data found in the selected date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

