import axios from "axios";
import { setErrors } from "../reducers/errors";
import swal from "sweetalert";
import {
  _AddUser,
  _FilterUser,
  _FindOneUser,
  _FindUsers,
  _setCurrentUser,
} from "../reducers/users";
import { setRefresh } from "../reducers/commons";

export const AddUser = (form, setPopupOpen) => async (dispatch) => {
  await axios
    .post("/api/register", form)
    .then((res) => {
      swal("Success", "User Added successfully", "success");
      dispatch(_AddUser(res.data));

      setPopupOpen(false);
    })
    .catch((err) => {
      dispatch(setErrors(err?.response?.data));
    });
};

export const FindUsers = () => async (dispatch) => {
  await axios
    .get("/api/users")
    .then((res) => {
      const { data } = res.data;
      dispatch(_FindUsers(data));
    })
    .catch((err) => {
      dispatch(setErrors(err?.response?.data));
    });
};

export const FindOneUser = (id) => async (dispatch) => {
  dispatch(setRefresh(true));
  await axios
    .get(`/api/users/${id}`)
    .then((res) => {
      const data = res.data;
      dispatch(_FindOneUser(data));
      setTimeout(() => {
        dispatch(setRefresh(false));
      }, 2000);
    })
    .catch((err) => {
      dispatch(setErrors(err?.response?.data));
    });
};

export const UpdateUser = (form, id, setPopupOpen) => async (dispatch) => {
  dispatch(setRefresh(true));
  await axios
    .put(`/api/users/${id}`, form)
    .then((res) => {
      const { data } = res.data;
      swal("Success", "User Updated successfully" ,"success");
      dispatch(_FindOneUser(data));
      dispatch(FindUsers());
      setTimeout(() => {
        dispatch(setRefresh(false));
      }, 2000);
      setPopupOpen(false);
    })
    .catch((err) => {
      dispatch(setErrors(err?.response?.data));
      dispatch(setRefresh(false));
    });
};

export const DeleteUsers = (id) => async (dispatch) => {
  if (window.confirm("Do you want to delete this user?")) {
    await axios
      .delete(`/api/users/${id}`)
      .then((res) => {
        swal("Success", "User deleted successfully" , "success");
        dispatch(_FilterUser(id));
      })
      .catch((err) => {
        dispatch(setErrors(err?.response?.data));
      });
  }
};
// Add this to your user actions.js file
export const UploadProfileImage = (formData) => async (dispatch) => {
  await axios
    .post("/api/images", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((res) => {
      const { data } = res.data;
      swal("Success", "Profile image updated successfully", "success");
      dispatch(_setCurrentUser(data));
      return data; // Return data for component usage
    })
    .catch((err) => {
      dispatch(setErrors(err?.response?.data));
      throw err; // Rethrow for component error handling
    });
};
export const UpdateMyProfile = (form) => async (dispatch) => {
  try {
    console.log('Updating profile with:', form); // Debug logging

    const response = await axios.put('/api/profile', form);
    
    console.log('Profile update response:', response.data);
    
    // Destructure carefully
    const { data } = response.data;

    if (!data) {
      throw new Error('No user data returned');
    }
    
    // Show success notification
    swal("Success", "Profile Updated successfully", "success");
    
    // Update current user in Redux store
    dispatch(_setCurrentUser(data));
    
    return data; // Optional: return data for any additional handling
  } catch (err) {
    console.error('Profile Update Error:', err);
    
    // More detailed error handling
    const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "Failed to update profile";
    
    // Dispatch errors
    dispatch(setErrors(err.response?.data || {}));
    
    // Show error notification
    swal("Error", errorMessage, "error");
    
    throw err; // Rethrow to allow component to handle
  }
};