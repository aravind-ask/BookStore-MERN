import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const LoginProtected = ({ children }) => {
  const { currentUser } = useSelector((state) => state.user);

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default LoginProtected;


