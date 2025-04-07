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

<<<<<<< Updated upstream
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
=======
// Fixed Redux action for image upload
export const UploadProfileImage = (formData) => async (dispatch) => {
  console.log('[ACTION] UploadProfileImage', 'Starting upload process');
  
  // Ensure auth headers are set correctly
  checkAuthHeaders();
  
  dispatch(setRefresh(true));
  
  try {
    // Add better debugging for FormData
    console.log('[ACTION] UploadProfileImage FormData contains picture:', 
      formData.has('picture') ? 'Yes' : 'No');
    
    // Improved error handling for the request
    const res = await axios.post("/api/images", formData, {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
    
    console.log('[ACTION] UploadProfileImage Success', res.data);
    
    // Check for proper response structure
    if (!res.data || !res.data.data) {
      throw new Error('Invalid response from server');
    }
    
    const { data } = res.data;
    
    // Success notification
    swal("Success", "Profile image updated successfully", "success");
    
    // Update the current user in Redux store with the new data
    dispatch(_setCurrentUser(data));
    dispatch(setRefresh(false));
    
    return data;
  } catch (err) {
    console.error('[ACTION] UploadProfileImage Error', err);
    
    // More detailed error message
    const errorDetail = err.response?.data?.message || err.message || "Unknown error";
    console.error('[ACTION] UploadProfileImage Error details:', errorDetail);
    
    dispatch(setErrors(err?.response?.data || { message: `Error uploading image: ${errorDetail}` }));
    swal("Error", `Failed to upload profile image: ${errorDetail}`, "error");
    dispatch(setRefresh(false));
    
    throw err;
  }
>>>>>>> Stashed changes
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