import axios from "axios";
import { setErrors, clearErrors } from "../reducers/errors";
import { setUser, setEmailVerificationRequired, clearEmailVerificationRequired, logoutUser } from "../reducers/auth";
import swal from "sweetalert";

/* login action */
export const LoginRegister = (form) => async (dispatch) => {
  const { email, password } = form;
  const body = { email, password };

  try {
    const res = await axios.post("/api/auth/login", body);
    
    // Check if email verification is required
    if (res.data.requireEmailVerification) {
      dispatch(setEmailVerificationRequired({ email }));
      return res;
    }
    
    dispatch(setUser(res.data));
    dispatch(clearErrors());
    window.location.href = "/projects/task-list";
  } catch (error) {
    const errors = error.response?.data;
    if (errors) {
      dispatch(setErrors(errors));
    }
  }
};

/* send email verification code */
export const sendEmailVerificationCode = (email) => async (dispatch) => {
  try {
    const res = await axios.post("/api/auth/2fa/send-email-code", { email });
    
    // If we're in development mode or there was an email error, the code might be included
    if (res.data.code) {
      console.log('Code received from server (development mode or email error)');
      return { 
        ...res.data,
        error: false
      };
    }
    
    return res.data;
  } catch (error) {
    const errors = error.response?.data;
    if (errors) {
      dispatch(setErrors(errors));
    }
    return { error: true, message: errors?.error || "Failed to send verification code" };
  }
};

/* verify email code and proceed with login */
export const verifyEmailAndLogin = (email, password, code) => async (dispatch) => {
  try {
    // First verify the email code
    const verifyRes = await axios.post("/api/auth/2fa/verify-email-code", { 
      email, 
      code 
    });
    
    if (verifyRes.data.verified) {
      // If verification successful, clear the requirement
      dispatch(clearEmailVerificationRequired());
      
      // Call login again, but this time with emailVerified flag
      const loginRes = await axios.post("/api/auth/login", { 
        email, 
        password, 
        emailVerified: true 
      });
      
      dispatch(setUser(loginRes.data));
      dispatch(clearErrors());
      window.location.href = "/projects/task-list";
      
      return loginRes;
    }
    
    return { error: true, message: "Verification failed" };
  } catch (error) {
    const errors = error.response?.data;
    if (errors) {
      dispatch(setErrors(errors));
    }
    return { error: true, message: errors?.error || "Verification failed" };
  }
};

/* check mail action for reset password */
export const CheckMail = (form) => async (dispatch) => {
  try {
    dispatch(clearErrors());
    const res = await axios.post("/api/auth/__check_mail", form);
    if (res.status === 200) {
      swal({
        title: "Reset link sent!",
        text: "Check your email for the password reset link.",
        icon: "success",
        button: "Great!",
      });
    }
    return res;
  } catch (error) {
    const errors = error.response?.data;
    if (errors) {
      dispatch(setErrors(errors));
    }
  }
};

/* forgot password action */
export const ForgotPassword = (email) => async (dispatch) => {
  try {
    dispatch(clearErrors());
    const res = await axios.post("/api/auth/__check_mail", { email });
    if (res.status === 200) {
      swal({
        title: "Reset link sent!",
        text: "Check your email for the password reset link.",
        icon: "success",
        button: "Great!",
      });
    }
  } catch (error) {
    dispatch(
      setErrors({
        email: "Email not found!",
      })
    );
  }
};

/* reset password action */
export const ResetPassword = (form) => async (dispatch) => {
  try {
    const res = await axios.post("/api/auth/__reset_password", form);
    if (res.status === 200) {
      swal({
        title: "Success!",
        text: "Your password has been reset.",
        icon: "success",
        button: "Let's login!",
      }).then(() => {
        window.location.href = "/signin";
      });
    }
  } catch (error) {
    dispatch(
      setErrors({
        email: "Reset failed. Please try again.",
      })
    );
  }
};

export const Logout = () => (dispatch) => {
  dispatch(logoutUser());
};
