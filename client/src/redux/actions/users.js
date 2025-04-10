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

// Auth header helper
const checkAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const currentHeader = axios.defaults.headers.common["Authorization"];
  
  if (token && (!currentHeader || currentHeader !== `Bearer ${token}`)) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// Debug helper
const logAction = (action, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[USER ACTION] ${action}`, data || '');
  }
};

export const AddUser = (form, setPopupOpen) => async (dispatch, getState) => {
  const { commons: { refresh } } = getState();
  if (refresh) return;

  logAction('AddUser', form);
  dispatch(setRefresh(true));
  
  try {
    const res = await axios.post("/api/users", form);
    logAction('AddUser Response', res.data);
    
    swal("Success", "User Added successfully", "success");
    dispatch(_AddUser(res.data.data || res.data));
    
    // Only refresh list if popup will close
    if (typeof setPopupOpen === 'function') {
      await dispatch(FindUsers());
      setPopupOpen(false);
    }
    
  } catch (err) {
    logAction('AddUser Error', err);
    dispatch(setErrors(err?.response?.data || { message: "Error adding user" }));
    swal("Error", err?.response?.data?.message || "Failed to add user", "error");
  } finally {
    dispatch(setRefresh(false));
  }
};

export const FindUsers = () => async (dispatch, getState) => {
  const { commons: { refresh }, users: { list } } = getState();
  if (refresh || list.length > 0) return;

  logAction('FindUsers');
  checkAuthHeaders();
  dispatch(setRefresh(true));
  
  try {
    const res = await axios.get("/api/users");
    logAction('FindUsers Response', res.data);
    dispatch(_FindUsers(res.data.data || []));
  } catch (err) {
    logAction('FindUsers Error', err);
    dispatch(setErrors(err?.response?.data || { message: "Error fetching users" }));
  } finally {
    dispatch(setRefresh(false));
  }
};

export const FindOneUser = (id) => async (dispatch, getState) => {
  const { commons: { refresh }, users: { _ONE } } = getState();
  if (refresh || (_ONE && _ONE._id === id)) return;

  logAction('FindOneUser', id);
  if (!id) {
    dispatch(_FindOneUser({}));
    return;
  }

  dispatch(setRefresh(true));
  
  try {
    const res = await axios.get(`/api/users/${id}`);
    logAction('FindOneUser Response', res.data);
    dispatch(_FindOneUser(res.data));
  } catch (err) {
    logAction('FindOneUser Error', err);
    dispatch(setErrors(err?.response?.data || { message: 'Failed to fetch user' }));
  } finally {
    dispatch(setRefresh(false));
  }
};

export const UpdateUser = (form, id, setPopupOpen) => async (dispatch, getState) => {
  const { commons: { refresh } } = getState();
  if (refresh) return;

  logAction('UpdateUser', { id, form });
  if (!id) {
    swal("Error", "User ID is missing", "error");
    return;
  }

  checkAuthHeaders();
  dispatch(setRefresh(true));
  
  try {
    const res = await axios.put(`/api/users/${id}`, form);
    logAction('UpdateUser Response', res.data);
    
    swal("Success", "User Updated successfully", "success");
    dispatch(_FindOneUser(res.data.data));
    
    // Only refresh full list if critical fields changed
    if (form.roles || form.email) {
      await dispatch(FindUsers());
    }
    
    if (typeof setPopupOpen === 'function') {
      setPopupOpen(false);
    }
  } catch (err) {
    logAction('UpdateUser Error', err);
    dispatch(setErrors(err?.response?.data || { message: "Error updating user" }));
    swal("Error", err?.response?.data?.message || "Failed to update user", "error");
  } finally {
    dispatch(setRefresh(false));
  }
};

export const DeleteUsers = (id) => async (dispatch, getState) => {
  const { commons: { refresh } } = getState();
  if (refresh) return;

  logAction('DeleteUsers', id);
  if (!id) return;

  if (window.confirm("Do you want to delete this user?")) {
    dispatch(setRefresh(true));
    
    try {
      const res = await axios.delete(`/api/users/${id}`);
      logAction('DeleteUsers Response', res.data);
      
      swal("Success", "User deleted successfully", "success");
      dispatch(_FilterUser(id));
      await dispatch(FindUsers());
    } catch (err) {
      logAction('DeleteUsers Error', err);
      dispatch(setErrors(err?.response?.data || { message: 'Failed to delete user' }));
      swal("Error", err?.response?.data?.message || "Failed to delete user", "error");
    } finally {
      dispatch(setRefresh(false));
    }
  }
};

export const UploadProfileImage = (formData) => async (dispatch, getState) => {
  const { commons: { refresh } } = getState();
  if (refresh) return;

  logAction('UploadProfileImage');
  checkAuthHeaders();
  dispatch(setRefresh(true));
  
  try {
    const res = await axios.post("/api/images", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    logAction('UploadProfileImage Response', res.data);
    swal("Success", "Profile image updated successfully", "success");
    dispatch(_setCurrentUser(res.data.data));
    return res.data;
  } catch (err) {
    logAction('UploadProfileImage Error', err);
    const errorDetail = err.response?.data?.message || err.message;
    dispatch(setErrors(err?.response?.data || { message: `Error uploading image` }));
    swal("Error", `Failed to upload image: ${errorDetail}`, "error");
    throw err;
  } finally {
    dispatch(setRefresh(false));
  }
};

export const UpdateMyProfile = (form) => async (dispatch, getState) => {
  const { commons: { refresh } } = getState();
  if (refresh) return;

  logAction('UpdateMyProfile', form);
  checkAuthHeaders();
  dispatch(setRefresh(true));
  
  try {
    const res = await axios.put('/api/profile', form);
    logAction('UpdateMyProfile Response', res.data);
    
    if (!res.data.data) throw new Error('No user data returned');
    
    swal("Success", "Profile Updated successfully", "success");
    dispatch(_setCurrentUser(res.data.data));
    return res.data;
  } catch (err) {
    logAction('UpdateMyProfile Error', err);
    const errorMessage = err.response?.data?.message || err.message;
    dispatch(setErrors(err.response?.data || { message: errorMessage }));
    swal("Error", errorMessage, "error");
    throw err;
  } finally {
    dispatch(setRefresh(false));
  }
};