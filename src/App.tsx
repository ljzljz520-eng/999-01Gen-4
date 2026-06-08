import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Result from "@/pages/Result";
import ReviewApply from "@/pages/ReviewApply";
import ReviewStatus from "@/pages/ReviewStatus";
import Login from "@/pages/Login";
import DealerDashboard from "@/pages/DealerDashboard";
import DealerDevices from "@/pages/DealerDevices";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminReviews from "@/pages/AdminReviews";
import AdminDevices from "@/pages/AdminDevices";
import AdminDealers from "@/pages/AdminDealers";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<Result />} />
            <Route path="/review/apply" element={<ReviewApply />} />
            <Route path="/review/status" element={<ReviewStatus />} />
            <Route path="/login" element={<Login />} />

            <Route path="/dealer" element={
              <ProtectedRoute allowedRoles={["dealer"]}>
                <DealerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dealer/devices" element={
              <ProtectedRoute allowedRoles={["dealer"]}>
                <DealerDevices />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/reviews" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReviews />
              </ProtectedRoute>
            } />
            <Route path="/admin/devices" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDevices />
              </ProtectedRoute>
            } />
            <Route path="/admin/dealers" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDealers />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
