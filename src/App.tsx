import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Dashboard } from "./components/Dashboard";
import SpendingAnalytics from "./components/SpendingAnalytics";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { ExpenseProvider } from "./contexts/ExpenseContext";
import { CategoryProvider } from "./contexts/CategoryContext";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./contexts/AuthContext";
import { ExpenseDetail } from "./components/ExpenseDetail";
import { AuthLayout } from "./components/AuthLayout";

function App() {
  return (
    <ExpenseProvider>
      <CategoryProvider>
        <AppContent />
        <Toaster position="top-right" />
      </CategoryProvider>
    </ExpenseProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  // Redirect to dashboard if user is already logged in and trying to access login/signup
  if (
    user &&
    (location.pathname === "/login" || location.pathname === "/signup")
  ) {
    return <Navigate to="/" replace />;
  }

  // Redirect to login if user is not logged in and trying to access protected routes
  if (
    !user &&
    location.pathname !== "/login" &&
    location.pathname !== "/signup"
  ) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AuthLayout>
              <Dashboard />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <AuthLayout>
              <SpendingAnalytics />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/expense/:id"
        element={
          <PrivateRoute>
            <AuthLayout>
              <ExpenseDetail />
            </AuthLayout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
