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

// Updated Add Task Action with file upload support
export const AddTaskAction = (form, files, setPopupOpen) => async (dispatch) => {
  dispatch(setRefresh(true));
  
  // Check if files are provided
  if (files && files.length > 0) {
    // Create FormData object for file upload
    const formData = new FormData();
    
    // Add all form fields to FormData
    for (const key in form) {
      if (key === 'assigns' || key === 'project' || key === 'priority' || key === 'status' || key === 'type') {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    }
    
    // Add file
    formData.append('attachment', files[0]);
    
    await axios
      .post("/api/tasks", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((res) => {
        dispatch(_AddTask(res.data.data));
        setPopupOpen(false);
        dispatch(setRefresh(false));
        dispatch(setErrors({}));
      })
      .catch((error) => {
        dispatch(setErrors(error.response.data));
        dispatch(setRefresh(false));
      });
  } else {
    // No files, use regular JSON request
    await axios
      .post("/api/tasks", form)
      .then((res) => {
        dispatch(_AddTask(res.data.data));
        setPopupOpen(false);
        dispatch(setRefresh(false));
        dispatch(setErrors({}));
      })
      .catch((error) => {
        dispatch(setErrors(error.response.data));
        dispatch(setRefresh(false));
      });
  }
};

// Updated Update Task Action with file upload support
export const UpdateTaskAction = (form, id, files, setPopupOpen) => async (dispatch) => {
  dispatch(setRefresh(true));
  
  // Check if files are provided
  if (files && files.length > 0) {
    // Create FormData object for file upload
    const formData = new FormData();
    
    // Add all form fields to FormData
    for (const key in form) {
      if (key === 'assigns' || key === 'project' || key === 'priority' || key === 'status' || key === 'type') {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    }
    
    // Add file
    formData.append('attachment', files[0]);
    
    await axios
      .put(`/api/tasks/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((res) => {
        dispatch(_FindOneTask(id));
        dispatch(FindTaskAction());
        setPopupOpen(false);
        dispatch(setRefresh(false));
        dispatch(setErrors({}));
      })
      .catch((error) => {
        dispatch(setErrors(error.response.data));
        dispatch(setRefresh(false));
      });
  } else {
    // No files, use regular JSON request
    await axios
      .put(`/api/tasks/${id}`, form)
      .then((res) => {
        dispatch(_FindOneTask(id));
        dispatch(FindTaskAction());
        setPopupOpen(false);
        dispatch(setRefresh(false));
        dispatch(setErrors({}));
      })
      .catch((error) => {
        dispatch(setErrors(error.response.data));
        dispatch(setRefresh(false));
      });
  }
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export const AddCommentAction = (form, id, setPopupOpen) => async (dispatch) => {
  try {
    let uploaded = "";
    if (form.file) {
      // Resize and convert image to base64 to reduce payload size
      const resizedImage = await resizeImage(form.file, 800, 800); // Max width/height 800px
      uploaded = resizedImage.split(',')[1]; // Remove data URL prefix
    }
    
    await axios
      .post(`/api/tasks/${id}/comments`, { 
        comment: form.comment, 
        file: uploaded 
      })
      .then((res) => {
        dispatch(FindOneTaskAction(id));
        dispatch(setErrors({}));
      })
      .catch((error) => {
        dispatch(setErrors(error.response.data));
      });
  } catch (error) {
    console.error("Error processing comment:", error);
    dispatch(setErrors({ comment: "Failed to process comment" }));
  }
};

// Helper function to resize image before upload
// Helper function to resize image before upload
const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to lower quality JPEG
        const resizedImage = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(resizedImage);
      };
    };
  });
};

export const DeleteCommentAction = (id, id_c) => async (dispatch) => {
  await axios
    .delete(`/api/tasks/${id}/comments/${id_c}`)
    .then((res) => {
      dispatch(FindOneTaskAction(id));
      dispatch(setErrors({}));
    })
    .catch((error) => {
      dispatch(setErrors(error.response.data));
    });
};

export const FindTaskAction = () => async (dispatch) => {
  await axios
    .get("/api/tasks")
    .then((res) => {
      dispatch(_FindTasks(res.data.data));
    })
    .catch((error) => {
      dispatch(setErrors(error.response.data));
    });
};

export const FindOneTaskAction = (id) => async (dispatch) => {
  dispatch(setRefresh(true));
  await axios
    .get(`/api/tasks/${id}`)
    .then((res) => {
      dispatch(_FindOneTask(res.data));
      setTimeout(() => {
        dispatch(setRefresh(false));
      }, 2000);
      dispatch(setErrors({}));
    })
    .catch((error) => {
      dispatch(setErrors(error.response.data));
      dispatch(setRefresh(false));
    });
};

export const DeleteTaskAction = (id) => async (dispatch) => {
  if (window.confirm("Do you want to delete this task?")) {
    await axios
      .delete(`/api/tasks/${id}`)
      .then((res) => {
        dispatch(_DeleteTasks(id));
        swal("Success", "Task deleted successfully", "success");
      })
      .catch((error) => {
        dispatch(setErrors(error.response.data));
      });
  }
};

// Add new action to delete attachment
export const DeleteAttachmentAction = (id) => async (dispatch) => {
  if (window.confirm("Do you want to delete this attachment?")) {
    await axios
      .delete(`/api/tasks/${id}/attachment`)
      .then((res) => {
        dispatch(FindOneTaskAction(id));
        dispatch(FindTaskAction());
      })
      .catch((error) => {
        dispatch(setErrors(error.response.data));
      });
  }
};
// Action to reschedule task via drag and drop
export const RescheduleTaskAction = (id, newDates) => async (dispatch) => {
  console.log("RescheduleTaskAction called with:", { id, newDates });
  dispatch(setRefresh(true));
  
  try {
    // Format dates to ensure they're properly formatted for the API
    const formattedDates = {
      start_date: typeof newDates.start_date === 'string' 
        ? newDates.start_date 
        : new Date(newDates.start_date).toISOString(),
      end_date: typeof newDates.end_date === 'string' 
        ? newDates.end_date 
        : new Date(newDates.end_date).toISOString(),
      is_all_day: newDates.is_all_day
    };
    
    console.log("Making API call with formatted dates:", formattedDates);
    
    // Make API call to reschedule the task
    const response = await axios.patch(`/api/tasks/${id}/reschedule`, formattedDates);
    
    // If successful, update the task in Redux
    if (response.data && response.data.success) {
      console.log("Reschedule successful:", response.data);
      
      // Update the specific task in the state
      dispatch(_FindOneTask(response.data.data));
      
      // Refresh all tasks to ensure the list is up to date
      dispatch(FindTaskAction());
      
      // Show success message
      swal("Success", "Task rescheduled successfully", "success");
    } else {
      // Handle API success but response indicates failure
      console.error("API returned success: false", response.data);
      swal("Error", response.data?.error || "Failed to reschedule task", "error");
    }
  } catch (error) {
    // Log detailed error information
    console.error("Reschedule error:", error);
    console.error("Error details:", error.response?.data);
    
    // Show error message
    swal("Error", error.response?.data?.error || "Failed to reschedule task", "error");
    
    // Set errors in Redux store
    dispatch(setErrors(error.response?.data || { error: "Failed to reschedule task" }));
  } finally {
    // Always reset the refresh state
    setTimeout(() => {
      dispatch(setRefresh(false));
    }, 500);
  }
};