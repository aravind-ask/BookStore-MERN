import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function OnlyAdminPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  console.log('Current User:', currentUser); // Debugging line
  return currentUser && currentUser.isAdmin ? (
    // <Outlet />
    <Navigate to='/dashboard' />
  ) : (
    <Navigate to='/sign-in' />
  );
}
