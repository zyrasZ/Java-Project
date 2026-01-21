import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import UserManagement from "./pages/admin/UserManagement";
import ClassManagement from "./pages/admin/ClassManagement";
import ProjectManagement from "./pages/admin/ProjectManagement";
import TeamManagement from "./pages/admin/TeamManagement";
import StaffLayout from "./layouts/StaffLayout";
import ImportUsers from "./pages/staff/ImportUsers";
import ImportClassrooms from "./pages/staff/ImportClassrooms";
import LecturerLayout from "./layouts/LecturerLayout";
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerClassManagement from "./pages/lecturer/ClassManagement";
import LecturerProjectManagement from "./pages/lecturer/ProjectManagement";
import LecturerTeamManagement from "./pages/lecturer/TeamManagement";
import TaskManagement from "./pages/lecturer/TaskManagement";
import GradingManagement from "./pages/lecturer/GradingManagement";
import StudentLayout from "./layouts/StudentLayout";
import {
  StudentDashboard,
  MyProjects,
  ProjectDetail,
  MyTeams,
  MyTasks,
  TeamChat,
  Whiteboard,
  MyGrades,
} from "./pages/student";

const theme = {
  token: {
    colorPrimary: "#1890ff",
    borderRadius: 6,
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="classes" element={<ClassManagement />} />
              <Route path="projects" element={<ProjectManagement />} />
              <Route path="teams" element={<TeamManagement />} />
            </Route>

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute requiredRole="STAFF">
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route path="import/users" element={<ImportUsers />} />
              <Route path="import/classrooms" element={<ImportClassrooms />} />
              <Route index element={<ImportUsers />} />
            </Route>

            {/* Lecturer Routes */}
            <Route
              path="/lecturer"
              element={
                <ProtectedRoute requiredRole="LECTURER">
                  <LecturerLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/lecturer/dashboard" replace />}
              />
              <Route path="dashboard" element={<LecturerDashboard />} />
              <Route path="classes" element={<LecturerClassManagement />} />
              <Route path="projects" element={<LecturerProjectManagement />} />
              <Route path="teams" element={<LecturerTeamManagement />} />
              <Route path="tasks" element={<TaskManagement />} />
              <Route path="grading" element={<GradingManagement />} />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="STUDENT">
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/student/dashboard" replace />}
              />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="projects" element={<MyProjects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="teams" element={<MyTeams />} />
              <Route path="tasks" element={<MyTasks />} />
              <Route path="chat" element={<TeamChat />} />
              <Route path="whiteboard" element={<Whiteboard />} />
              <Route path="grades" element={<MyGrades />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
