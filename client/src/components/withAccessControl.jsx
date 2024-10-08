import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { setUserBlocked } from "../features/userSlice";
import io from "socket.io-client";


const socket = io("http://localhost:3000"); // assuming you have a socket connection established

const withAccessControl = (WrappedComponent) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  socket.on("blocked", (blockedUserId) => {
    if (user.id === blockedUserId) {
      dispatch(setUserBlocked()); // dispatch the setUserBlocked action
    }
  });

  if (user.isBlocked) {
    return <Redirect to="/blocked" />;
  }

  return <WrappedComponent />;
};

export default withAccessControl;