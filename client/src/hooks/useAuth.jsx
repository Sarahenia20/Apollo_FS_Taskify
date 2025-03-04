import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const UseAuth = (Component, inRole) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const { isConnected, user } = useSelector((state) => state.auth);
    useEffect(() => {
<<<<<<< HEAD
      console.log("User:", user);
      console.log("User Roles:", user?.roles);
      console.log("Required Roles:", inRole);
    
      if (!isConnected) {
        return navigate("/auth/SignIn");
      } else {
        // Check if user has the required role
        if (
          inRole &&
          (!user?.roles || !inRole.some((role) => user.roles.includes(role)))
        ) {
          console.log("Unauthorized: Redirecting");
          return navigate("/unauthorized");
        }
      }
    }, [isConnected, user, navigate, inRole]);

    useEffect(() => {
      if (!isConnected) {
        return navigate("/auth/SignIn");
      } else {
        // Safely check roles with optional chaining and default empty array
        if (
          inRole &&
          (!user?.roles || !inRole.some((role) => user.roles.includes(role)))
=======
      if (!isConnected) {
        return navigate("/auth/SignIn");
      } else {
        if (
          !inRole ||
          (inRole && !inRole.some((role) => user.roles.includes(role)))
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
        ) {
          return navigate("/unauthorized");
        }
      }
<<<<<<< HEAD
    }, [isConnected, user, navigate, inRole]);

    return <Component {...props} />;
  };

  return AuthComponent;
};
=======
    }, [navigate]);
    return <Component {...props} />;
  };
  return AuthComponent;
};
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
