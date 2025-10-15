import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Tickets from "./pages/Tickets";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import Settings from "./pages/Settings";
import { useAuth } from "./context/AuthProvider";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/tickets"
        element={user ? <Tickets /> : <Navigate to="/login" />}
      />
      <Route
        path="/tickets/new"
        element={user ? <CreateTicket /> : <Navigate to="/login" />}
      />
      <Route
        path="/tickets/:id"
        element={user ? <TicketDetails /> : <Navigate to="/login" />}
      />
      <Route
        path="/settings"
        element={user ? <Settings /> : <Navigate to="/login" />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/tickets" : "/login"} />}
      />
    </Routes>
  );
}
