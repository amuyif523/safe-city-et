import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminPortal from "./pages/admin/AdminPortal";
import FirePortal from "./pages/fire/FirePortal";
import MedicalPortal from "./pages/medical/MedicalPortal";
import MilitaryPortal from "./pages/military/MilitaryPortal";
import PolicePortal from "./pages/police/PolicePortal";
import PublicPortal from "./pages/public/PublicPortal";
import ProfilePage from "./pages/profile/ProfilePage";

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route index element={<PublicPortal />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          element={<ProtectedRoute allowedRoles={["police", "admin", "super_admin"]} />}
        >
          <Route path="police" element={<PolicePortal />} />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={["fire", "admin", "super_admin"]} />}
        >
          <Route path="fire" element={<FirePortal />} />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={["medical", "admin", "super_admin"]} />}
        >
          <Route path="medical" element={<MedicalPortal />} />
        </Route>
        <Route
          element={
            <ProtectedRoute allowedRoles={["military", "admin", "super_admin"]} />
          }
        >
          <Route path="military" element={<MilitaryPortal />} />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={["admin", "super_admin"]} />}
        >
          <Route path="admin" element={<AdminPortal />} />
        </Route>
      </Route>
    </Route>
  </Routes>
);

export default App;
