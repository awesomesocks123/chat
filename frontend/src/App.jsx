import "./App.css";
import { Navbar } from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import { LoginPage } from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { useAuthStore } from "./store/useAuthStore.js";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js";
import { HelpPage } from "./pages/HelpPage";
import ExplorePage from "./pages/ExplorePage.jsx";
import PublicRoomPage from "./pages/PublicRoomPage.jsx";
import FriendRequestsPage from "./pages/FriendRequestsPage.jsx";

function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/friend-requests"
          element={authUser ? <FriendRequestsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/explore"
          element={authUser ? <ExplorePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/explore/room/:roomId"
          element={authUser ? <PublicRoomPage /> : <Navigate to="/login" />}
        />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
