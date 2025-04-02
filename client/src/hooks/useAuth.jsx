/*import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const UseAuth = (Component, inRole) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const { isConnected, user } = useSelector((state) => state.auth);
    useEffect(() => {
      if (!isConnected) {
        return navigate("/auth/SignIn");
      } else {
        if (
          !inRole ||
          (inRole && !inRole.some((role) => user.roles.includes(role)))
        ) {
          return navigate("/unauthorized");
        }
      }
    }, [navigate]);
    return <Component {...props} />;
  };
  return AuthComponent;
};*/
// src/hooks/useAuth.js
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const UseAuth = (Component, inRole) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const { isConnected, user } = useSelector((state) => state.auth);

    useEffect(() => {
      // If user is not connected, redirect to login
      if (!isConnected) {
        return navigate("/auth/SignIn");
      } 
      
      // If user is an ADMIN, always grant access regardless of specific roles
      if (user && user.roles && user.roles.includes("ADMIN")) {
        // Admin has access to everything, no redirect needed
        return;
      }
      
      // For non-admin users, check if they have any of the required roles
      if (inRole && inRole.length > 0) {
        // Check if user has at least one of the required roles
        const hasRequiredRole = inRole.some((role) => 
          user && user.roles && user.roles.includes(role)
        );
        
        if (!hasRequiredRole) {
          return navigate("/unauthorized");
        }
      }
    }, [navigate, isConnected, user, inRole]);

    return <Component {...props} />;
  };

  return AuthComponent;
};
