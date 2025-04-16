import axios from "axios";
import swal from "sweetalert";
import { setRefresh } from "../reducers/commons";
import { setErrors } from "../reducers/errors";
import {
  _AddTeam,
  _DeleteTeam,
  _FindOneTeam,
  _FindTeams,
  _UpdateTeam,
  _AddTeamMember,
  _RemoveTeamMember,
  _UpdateMemberRole,
  _SetUserTeams
} from "../reducers/teams";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export const CreateTeamAction = (form, setPopupOpen) => async (dispatch) => {
  dispatch(setRefresh(true));
  
  try {
    let pictureprofile = "";
    if (form.pictureprofile) {
      pictureprofile = (await toBase64(form.pictureprofile)).replace(
        "data:image/png;base64,",
        ""
      );
    }

    const payload = {
      ...form,
      pictureprofile
    };

    const res = await axios.post("/api/teams", payload);
    dispatch(_AddTeam(res.data.data));
    setPopupOpen(false);
    dispatch(setRefresh(false));
    dispatch(setErrors({}));
    swal("Success", "Team created successfully", "success");
  } catch (error) {
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
  }
};

export const UpdateTeamAction = (form, id, setPopupOpen) => async (dispatch) => {
  dispatch(setRefresh(true));
  
  try {
    let pictureprofile = form.pictureprofile;
    if (form.pictureprofile instanceof File) {
      pictureprofile = (await toBase64(form.pictureprofile)).replace(
        "data:image/png;base64,",
        ""
      );
    }

    const payload = {
      ...form,
      pictureprofile
    };

    const res = await axios.put(`/api/teams/${id}`, payload);
    dispatch(_UpdateTeam({ id, updates: res.data.data }));
    setPopupOpen(false);
    dispatch(setRefresh(false));
    dispatch(setErrors({}));
    swal("Success", "Team updated successfully", "success");
  } catch (error) {
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
  }
};

export const GetAllTeamsAction = () => async (dispatch) => {
  dispatch(setRefresh(true));
  try {
    const res = await axios.get("/api/teams");
    dispatch(_FindTeams(res.data.data));
    dispatch(setRefresh(false));
  } catch (error) {
    console.error("Error fetching teams:", error);
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
  }
};

export const GetUserTeamsAction = () => async (dispatch) => {
  dispatch(setRefresh(true));
  try {
    const res = await axios.get("/api/teams/user");
    dispatch(_SetUserTeams(res.data.data));
    dispatch(setRefresh(false));
  } catch (error) {
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
  }
};

export const GetTeamAction = (id) => async (dispatch) => {
  dispatch(setRefresh(true));
  try {
    const res = await axios.get(`/api/teams/${id}`);
    dispatch(_FindOneTeam(res.data));
    dispatch(setRefresh(false));
  } catch (error) {
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
  }
};

// In your teams actions file
// src/redux/actions/teams.js
export const DeleteTeamAction = (id) => async (dispatch) => {
  if (window.confirm("Do you want to delete this team?")) {
    try {
      await axios.delete(`/api/teams/${id}`);
      dispatch(_DeleteTeam(id));
      swal("Success", "Team deleted successfully", "success");
      dispatch(GetAllTeamsAction()); // Refresh the list after deletion
    } catch (error) {
      dispatch(setErrors(error.response?.data || { message: "Delete failed" }));
    }
  }
};

export const AddMemberAction = (teamId, userId, role = "ENGINEER") => async (dispatch) => {
  dispatch(setRefresh(true));
  try {
    const res = await axios.post(`/api/teams/${teamId}/members`, { userId, role });
    dispatch(_AddTeamMember({ teamId, member: res.data.member }));
    dispatch(setRefresh(false));
    swal("Success", "Member added successfully", "success");
  } catch (error) {
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
  }
};

export const RemoveMemberAction = (teamId, userId) => async (dispatch) => {
  if (window.confirm("Are you sure you want to remove this member?")) {
    dispatch(setRefresh(true));
    try {
      await axios.delete(`/api/teams/${teamId}/members`, { data: { userId } });
      dispatch(_RemoveTeamMember({ teamId, userId }));
      dispatch(setRefresh(false));
      swal("Success", "Member removed successfully", "success");
    } catch (error) {
      dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
      dispatch(setRefresh(false));
    }
  }
};

export const UpdateMemberRoleAction = (teamId, userId, role) => async (dispatch) => {
  dispatch(setRefresh(true));
  try {
    const res = await axios.put(`/api/teams/${teamId}/members/role`, { userId, role });
    dispatch(_UpdateMemberRole({ teamId, userId, role }));
    dispatch(setRefresh(false));
    swal("Success", "Member role updated successfully", "success");
  } catch (error) {
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
  }
};