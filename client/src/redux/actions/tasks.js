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

  if (files && files.length > 0) {
    const formData = new FormData();
    for (const key in form) {
      if (key === 'assigns' || key === 'project' || key === 'priority' || key === 'status' || key === 'type') {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    }
    formData.append('attachment', files[0]);

    await axios
      .post("/api/tasks", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
export const UpdateTaskAction = (form, id, files, setPopupOpen, newStatus = null) => async (dispatch) => {
  dispatch(setRefresh(true));

  // Si un nouveau statut est passé, on met à jour le statut de la tâche
  if (newStatus) {
    form.status = newStatus;
  }

  if (files && files.length > 0) {
    const formData = new FormData();
    for (const key in form) {
      if (key === 'assigns' || key === 'project' || key === 'priority' || key === 'status' || key === 'type') {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    }
    formData.append('attachment', files[0]);

    await axios
      .put(`/api/tasks/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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


// Update your AddCommentAction to be more robust
export const AddCommentAction = (form, id) => async (dispatch) => {
  dispatch(setRefresh(true));

  try {
    let uploaded = "";
    if (form.file) {
      const resizedImage = await resizeImage(form.file, 800, 800);
      uploaded = resizedImage.split(',')[1];
    }

    const response = await axios.post(`/api/tasks/${id}/comments`, { 
      comment: form.comment, 
      file: uploaded 
    });

    dispatch(setErrors({}));
    dispatch(setRefresh(false));

    return response;
  } catch (error) {
    console.error("Error processing comment:", error);

    if (error.response && error.response.data) {
      dispatch(setErrors(error.response.data));
    } else {
      dispatch(setErrors({ comment: "Failed to process comment" }));
    }

    dispatch(setRefresh(false));

    throw error;
  }
};

const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const resizedImage = canvas.toDataURL('image/jpeg', 0.7);
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

  try {
    const response = await axios.get(`/api/tasks/${id}`);

    dispatch(_FindOneTask(response.data));
    
    setTimeout(() => {
      dispatch(setRefresh(false));
    }, 300);
    
    dispatch(setErrors({}));
    
    return response;
  } catch (error) {
    console.error('FindOneTaskAction error:', error);
    dispatch(setErrors(error.response?.data || { message: 'Failed to fetch task' }));
    dispatch(setRefresh(false));
    throw error;
  }
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

export const RescheduleTaskAction = (id, newDates) => async (dispatch) => {
  dispatch(setRefresh(true));

  try {
    const formattedDates = {
      start_date: typeof newDates.start_date === 'string' ? newDates.start_date : new Date(newDates.start_date).toISOString(),
      end_date: typeof newDates.end_date === 'string' ? newDates.end_date : new Date(newDates.end_date).toISOString(),
      is_all_day: newDates.is_all_day
    };

    const response = await axios.patch(`/api/tasks/${id}/reschedule`, formattedDates);

    if (response.data && response.data.success) {
      dispatch(_FindOneTask(response.data.data));
      dispatch(FindTaskAction());
      swal("Success", "Task rescheduled successfully", "success");
    } else {
      swal("Error", response.data?.error || "Failed to reschedule task", "error");
    }
  } catch (error) {
    swal("Error", error.response?.data?.error || "Failed to reschedule task", "error");
    dispatch(setErrors(error.response?.data || { error: "Failed to reschedule task" }));
  } finally {
    setTimeout(() => {
      dispatch(setRefresh(false));
    }, 500);
  }
};

export const GetTaskCommentsAction = (taskId) => async (dispatch) => {
  dispatch(setRefresh(true));

  try {
    const response = await axios.get(`/api/tasks/${taskId}/comments`);
    dispatch(setRefresh(false));
    dispatch(setErrors({}));

    return response.data.comments || [];
  } catch (error) {
    dispatch(setErrors(error.response.data || { message: 'Network error when fetching comments' }));
    dispatch(setRefresh(false));
    return [];
  }
};
