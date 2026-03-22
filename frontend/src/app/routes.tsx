import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import CitizenHome from "./pages/CitizenHome";
import ReportIssue from "./pages/ReportIssue";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetail from "./pages/ComplaintDetail";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import AdminPanel from "./modules/admin-panel/index.jsx";
import ManagerLayout from "./components/manager/ManagerLayout";
import ManagerOverview from "./pages/manager/ManagerOverview";
import ManagerWorkers from "./pages/manager/ManagerWorkers";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./pages/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  { path: "/auth/callback", Component: OAuthCallback },
  {
    element: <ProtectedRoute allowedRoles={["citizen", "admin", "manager"]} />,
    children: [
      {
        path: "/dashboard",
        Component: DashboardLayout,
        children: [
          { index: true, Component: CitizenHome },
          { path: "report", Component: ReportIssue },
          { path: "complaints", Component: MyComplaints },
          { path: "complaints/:id", Component: ComplaintDetail },
          { path: "leaderboard", Component: Leaderboard },
          { path: "profile", Component: Profile },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["manager"]} />,
    children: [
      {
        path: "/manager/:managerId?",
        Component: ManagerLayout,
        children: [
          { index: true, Component: ManagerOverview },
          { path: "workers", Component: ManagerWorkers },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin",
        Component: AdminPanel,
      },
    ],
  },
  { path: "*", Component: NotFound },
]);
