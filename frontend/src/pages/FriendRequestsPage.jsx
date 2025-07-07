import React, { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Navigate } from "react-router-dom";
import FriendRequests from "../components/FriendRequests";

const FriendRequestsPage = () => {
  const { authUser } = useAuthStore();

  // Redirect to login if not authenticated
  if (!authUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <div className="max-w-4xl mx-auto">
        <FriendRequests />
      </div>
    </div>
  );
};

export default FriendRequestsPage;
