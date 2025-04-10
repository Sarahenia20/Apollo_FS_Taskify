import axios from "axios";
import swal from "sweetalert";
import { setRefresh } from "../reducers/commons";
import { setErrors } from "../reducers/errors";
import {
  _AddTask,
  _DeleteTasks,
  _FindOneTask,
  _FindTasks,
} from "../reducers/tasks";

// Helper function to handle common API response patterns
const handleApiResponse = async (apiCall, dispatch, successCallback) => {
  try {
    const res = await apiCall();
    if (successCallback) successCallback(res);
    dispatch(setErrors({}));
    return res;
  } catch (error) {
    dispatch(setErrors(error.response?.data || { error: "An unexpected error occurred" }));
    throw error;
  } finally {
    dispatch(setRefresh(false));
  }
};

// Common fields that need JSON stringification
const JSON_FIELDS = new Set(['assigns', 'project', 'priority', 'status', 'type']);

// Prepare form data with optional file
const prepareFormData = (form, file) => {
  const formData = new FormData();
  
  Object.entries(form).forEach(([key, value]) => {
    formData.append(key, JSON_FIELDS.has(key) ? JSON.stringify(value) : value);
  });
  
  if (file) {
    formData.append('attachment', file);
  }
  
  return formData;
};

// Add Task Action with file upload support
export const AddTaskAction = (form, files, setPopupOpen) => async (dispatch) => {
  dispatch(setRefresh(true));
  
  const apiCall = files?.length > 0
    ? () => axios.post("/api/tasks", prepareFormData(form, files[0]), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    : () => axios.post("/api/tasks", form);

  await handleApiResponse(apiCall, dispatch, (res) => {
    dispatch(_AddTask(res.data.data));
    setPopupOpen(false);
  });
};

// Update Task Action with file upload support
export const UpdateTaskAction = (form, id, files, setPopupOpen) => async (dispatch) => {
  dispatch(setRefresh(true));
  
  try {
    // Prepare the data for API
    const payload = {
      ...form,
      // Convert selects back to IDs
      project: form.project?.value || form.project,
      assigns: form.assigns?.map(a => a.value) || form.assigns
    };

    const apiCall = files?.length > 0
      ? () => axios.put(`/api/tasks/${id}`, prepareFormData(payload, files[0]), {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      : () => axios.put(`/api/tasks/${id}`, payload);

    const response = await apiCall();
    console.log("Update response:", response.data);

    if (response.data.success) {
      // Refresh both the single task and task list
      await dispatch(FindOneTaskAction(id));
      await dispatch(FindTaskAction());
      
      swal("Success", "Task updated successfully", "success");
      if (setPopupOpen) setPopupOpen(false);
    } else {
      throw new Error(response.data.message || "Update failed");
    }
  } catch (error) {
    console.error("Update error:", error);
    dispatch(setErrors(error.response?.data || { 
      error: error.message || "Failed to update task" 
    }));
    swal("Error", error.response?.data?.message || "Failed to update task", "error");
  } finally {
    dispatch(setRefresh(false));
  }
};

// Image resizing helper
const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  });
};

export const AddCommentAction = (form, id, setPopupOpen) => async (dispatch) => {
  dispatch(setRefresh(true));
  
  try {
    const fileData = form.file 
      ? (await resizeImage(form.file, 800, 800)).split(',')[1]
      : undefined;

    await handleApiResponse(
      () => axios.post(`/api/tasks/${id}/comments`, { 
        comment: form.comment, 
        file: fileData 
      }),
      dispatch,
      () => dispatch(FindOneTaskAction(id))
    );
  } catch (error) {
    dispatch(setErrors({ comment: "Failed to process comment" }));
  }
};

export const DeleteCommentAction = (id, id_c) => async (dispatch) => {
  dispatch(setRefresh(true));
  await handleApiResponse(
    () => axios.delete(`/api/tasks/${id}/comments/${id_c}`),
    dispatch,
    () => dispatch(FindOneTaskAction(id))
  );
};

export const FindTaskAction = () => async (dispatch) => {
  dispatch(setRefresh(true));
  await handleApiResponse(
    () => axios.get("/api/tasks"),
    dispatch,
    (res) => dispatch(_FindTasks(res.data.data))
  );
};

export const FindOneTaskAction = (id) => async (dispatch) => {
  dispatch(setRefresh(true));
  await handleApiResponse(
    () => axios.get(`/api/tasks/${id}`),
    dispatch,
    (res) => {
      dispatch(_FindOneTask(res.data));
      setTimeout(() => dispatch(setRefresh(false)), 2000);
    }
  );
  return res.data;
};

export const DeleteTaskAction = (id) => async (dispatch) => {
  if (window.confirm("Do you want to delete this task?")) {
    dispatch(setRefresh(true));
    await handleApiResponse(
      () => axios.delete(`/api/tasks/${id}`),
      dispatch,
      () => {
        dispatch(_DeleteTasks(id));
        swal("Success", "Task deleted successfully", "success");
      }
    );
  }
};

export const DeleteAttachmentAction = (id) => async (dispatch) => {
  if (window.confirm("Do you want to delete this attachment?")) {
    dispatch(setRefresh(true));
    await handleApiResponse(
      () => axios.delete(`/api/tasks/${id}/attachment`),
      dispatch,
      async () => {
        await dispatch(FindOneTaskAction(id));
        await dispatch(FindTaskAction());
      }
    );
  }
};

export const RescheduleTaskAction = (id, newDates) => async (dispatch) => {
  dispatch(setRefresh(true));
  
  try {
    const formattedDates = {
      start_date: new Date(newDates.start_date).toISOString(),
      end_date: new Date(newDates.end_date).toISOString(),
      is_all_day: newDates.is_all_day
    };
    
    const response = await axios.patch(`/api/tasks/${id}/reschedule`, formattedDates);
    
    if (response.data?.success) {
      dispatch(_FindOneTask(response.data.data));
      await dispatch(FindTaskAction());
      swal("Success", "Task rescheduled successfully", "success");
    } else {
      swal("Error", response.data?.error || "Failed to reschedule task", "error");
    }
  } catch (error) {
    dispatch(setErrors(error.response?.data || { error: "Failed to reschedule task" }));
    swal("Error", error.response?.data?.error || "Failed to reschedule task", "error");
  } finally {
    setTimeout(() => dispatch(setRefresh(false)), 500);
  }
};