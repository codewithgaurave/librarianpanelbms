import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";

import LibrarianRoutes from "./route/LibrarianRoutes";
import Layout from "./dashboard/Layout";
import Login from "./pages/Login";
import ViewSingleSeat from "./library/ViewSingleSeat";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "remixicon/fonts/remixicon.css";
import Dashboard from "./dashboard/Dashboard";
import ViewMonthlyBookingSeat from "./library/ViewMonthlyBookingSeat";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";

function App() {
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        {!user ? (
          <>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Login />} />
            {/* Agar user login nahi hai to default me login pe bhej do */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : user?.user.role === "librarian" ? (
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/dashboard/change-password" element={<ChangePassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  {LibrarianRoutes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={<route.component />}
                    />
                  ))}
                  <Route
                    path="/dashboard/view-seat/:id"
                    element={<ViewSingleSeat />}
                  />
                  <Route
                    path="/dashboard/view-seat/:id/monthly-booking-type"
                    element={<ViewMonthlyBookingSeat />}
                  />
                  {/* Agar login hai to unknown route pe /dashboard bhej do */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </>
  );
}

export default App;
