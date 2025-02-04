import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../utils/authUtils";

const PrivateRoute = ({ children }) => {
  const token = getToken();
  const role = getRole();

  if (!token || role !== "Store Owner") {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
