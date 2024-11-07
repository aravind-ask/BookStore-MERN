import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  console.log("Current User: ", currentUser);
  if(currentUser?.isAdmin){
    <Navigate to="/dashboard" />
  }
  return currentUser ? <Outlet /> : <Navigate to="/sign-in" />;
}
