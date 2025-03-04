import axios from "axios";
import { setErrors } from "../reducers/errors";
import swal from "sweetalert";
import {
  _AddRole,
  _FindRoles,
  _FindOneRole,
  _FilterRole,
} from "../reducers/roles";
import { setRefresh } from "../reducers/commons";

export const AddRole = (form, setPopupOpen) => async (dispatch) => {
  await axios
    .post("/api/roles", form)
    .then((res) => {
      swal("Success", "Role added successfully", "success");
      dispatch(_AddRole(res.data));
      setPopupOpen(false);
    })
    .catch((err) => {
      dispatch(setErrors(err?.response?.data));
    });
};

export const FindRoles = () => async (dispatch) => {
  await axios
    .get("/api/roles")
    .then((res) => {
      const { data } = res.data;
      dispatch(_FindRoles(data));
    })
    .catch((err) => {
      dispatch(setErrors(err?.response?.data));
    });
};

export const FindOneRole = (id) => async (dispatch) => {
  dispatch(setRefresh(true));
  await axios
    .get(`/api/roles/${id}`)
    .then((res) => {
      const data = res.data;
      dispatch(_FindOneRole(data));
      setTimeout(() => {
        dispatch(setRefresh(false));
      }, 2000);
    })
    .catch((err) => {
      dispatch(setErrors(err?.response?.data));
    });
};

export const UpdateRole = (form, id, setPopupOpen) => async (dispatch) => {
  dispatch(setRefresh(true));
  await axios
    .put(`/api/roles/${id}`, form)
    .then((res) => {
      const { data } = res.data;
      swal("Success", "Role updated successfully", "success");
      dispatch(_FindOneRole(data));
      dispatch(FindRoles());
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

export const DeleteRole = (id) => async (dispatch) => {
  if (window.confirm("Do you want to delete this role?")) {
    await axios
      .delete(`/api/roles/${id}`)
      .then(() => {
        swal("Success", "Role deleted successfully", "success");
        dispatch(_FilterRole(id));
      })
      .catch((err) => {
        dispatch(setErrors(err?.response?.data));
      });
  }
};
