import { createBrowserRouter } from "react-router";
import { lazy } from "react";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const CitizenHome = lazy(() => import("./pages/CitizenHome"));
const ReportIssue = lazy(() => import("./pages/ReportIssue"));
const MyComplaints = lazy(() => import("./pages/MyComplaints"));
const ComplaintDetail = lazy(() => import("./pages/ComplaintDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminQueue = lazy(() => import("./pages/admin/AdminQueue"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSLA = lazy(() => import("./pages/admin/AdminSLA"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminManagers = lazy(() => import("./pages/admin/AdminManagers"));
const ManagerLayout = lazy(() => import("./components/manager/ManagerLayout"));
const ManagerOverview = lazy(() => import("./pages/manager/ManagerOverview"));
const ManagerWorkers = lazy(() => import("./pages/manager/ManagerWorkers"));
const WorkerLayout = lazy(() => import("./components/worker/WorkerLayout"));
const WorkerDashboard = lazy(() => import("./pages/worker/WorkerDashboard"));
const WorkerResolved = lazy(() => import("./pages/worker/WorkerResolved"));
const WorkerProfile = lazy(() => import("./pages/worker/WorkerProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  { path: "/auth/callback", Component: OAuthCallback },
  {
    element: <ProtectedRoute allowedRoles={["citizen"]} />,
    children: [
      {
        path: "/dashboard",
        Component: DashboardLayout,
        children: [
          { index: true, Component: CitizenHome },
          { path: "report", Component: ReportIssue },
          { path: "complaints", Component: MyComplaints },
          { path: "complaints/:id", Component: ComplaintDetail },
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
    element: <ProtectedRoute allowedRoles={["worker"]} />,
    children: [
      {
        path: "/worker",
        Component: WorkerLayout,
        children: [
          { index: true, Component: WorkerDashboard },
          { path: "resolved", Component: WorkerResolved },
          { path: "profile", Component: WorkerProfile },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminOverview },
          { path: "queue", Component: AdminQueue },
          { path: "queue/:id", Component: ComplaintDetail },
          { path: "analytics", Component: AdminAnalytics },
          { path: "sla", Component: AdminSLA },
          { path: "users", Component: AdminUsers },
          { path: "managers", Component: AdminManagers },
        ],
      },
    ],
  },
  { path: "*", Component: NotFound },
]);
