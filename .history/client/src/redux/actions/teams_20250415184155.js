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
  _SetUserTeams,
  _ResetCurrentTeam   // Add this action to reset the current team
} from "../reducers/teams";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

// Add this action to reset the current team
export const ResetCurrentTeamAction = () => (dispatch) => {
  dispatch(_ResetCurrentTeam());
};

export const CreateTeamAction = (form) => async (dispatch) => {
    dispatch(setRefresh(true));
    
    try {
      let pictureprofile = "";
      if (form.pictureprofile && form.pictureprofile instanceof File) {
        pictureprofile = (await toBase64(form.pictureprofile)).replace(
          "data:image/png;base64,",
          ""
        );
      }
  
      // Ensure members is an array of valid ID strings
      const members = Array.isArray(form.members) 
        ? form.members
            .map(m => (typeof m === 'object' ? m?.user : m)) // Handle both object and string IDs
            .filter(id => id && typeof id === 'string') // Remove any null/undefined/invalid IDs
        : [];
  
      const payload = {
        Name: form.Name,
        description: form.description,
        members,
        pictureprofile: pictureprofile || ''
      };
  
      console.log("Final payload:", payload);
  
      const res = await axios.post("/api/teams", payload);
      dispatch(_AddTeam(res.data.data));
      dispatch(setRefresh(false));
      dispatch(setErrors({}));
      swal("Success", "Team created successfully", "success");
      return true;
    } catch (error) {
      console.error("Full error:", error.response?.data || error);
      dispatch(setErrors(error.response?.data || { 
        message: error.message || "An error occurred" 
      }));
      dispatch(setRefresh(false));
      return false;
    }
  };
export const UpdateTeamAction = (id, form) => async (dispatch) => {
  dispatch(setRefresh(true));
  
  try {
    let pictureprofile = form.pictureprofile;
    if (form.pictureprofile instanceof File) {
      pictureprofile = (await toBase64(form.pictureprofile)).replace(
        "data:image/png;base64,",
        ""
      );
    }

    // Make sure members is an array of user IDs
    let members = [];
    if (Array.isArray(form.members)) {
      // If members is already an array of IDs
      members = form.members.map(member => 
        typeof member === 'object' ? (member.value || member._id) : member
      );
    } else if (form.members && typeof form.members === 'object') {
      // If members is an object from react-select
      members = form.members.map(member => member.value || member._id || member);
    }

    const payload = {
      ...form,
      pictureprofile,
      members  // Ensure members is properly formatted
    };

    console.log("Updating team with payload:", payload);

    const res = await axios.put(`/api/teams/${id}`, payload);
    dispatch(_UpdateTeam({ id, updates: res.data.data }));
    dispatch(setRefresh(false));
    dispatch(setErrors({}));
    swal("Success", "Team updated successfully", "success");
    return true; // Return success value
  } catch (error) {
    console.error("Error updating team:", error);
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
    return false; // Return failure
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

export const DeleteTeamAction = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/teams/${id}`);
    dispatch(_DeleteTeam(id));
    swal("Success", "Team deleted successfully", "success");
    return true;
  } catch (error) {
    console.error("Error deleting team:", error);
    dispatch(setErrors(error.response?.data || { message: "Delete failed" }));
    return false;
  }
};

export const AddMemberAction = (teamId, userId, role = "ENGINEER") => async (dispatch) => {
  dispatch(setRefresh(true));
  try {
    const res = await axios.post(`/api/teams/${teamId}/members`, { userId, role });
    dispatch(_AddTeamMember({ teamId, member: res.data.member }));
    dispatch(setRefresh(false));
    swal("Success", "Member added successfully", "success");
    return true;
  } catch (error) {
    console.error("Error adding member:", error);
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
    return false;
  }
};

export const RemoveMemberAction = (teamId, userId) => async (dispatch) => {
  dispatch(setRefresh(true));
  try {
    await axios.delete(`/api/teams/${teamId}/members`, { data: { userId } });
    dispatch(_RemoveTeamMember({ teamId, userId }));
    dispatch(setRefresh(false));
    swal("Success", "Member removed successfully", "success");
    return true;
  } catch (error) {
    console.error("Error removing member:", error);
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
    return false;
  }
};

export const UpdateMemberRoleAction = (teamId, userId, role) => async (dispatch) => {
  dispatch(setRefresh(true));
  try {
    await axios.put(`/api/teams/${teamId}/members/role`, { userId, role });
    dispatch(_UpdateMemberRole({ teamId, userId, role }));
    dispatch(setRefresh(false));
    swal("Success", "Member role updated successfully", "success");
    return true;
  } catch (error) {
    console.error("Error updating member role:", error);
    dispatch(setErrors(error.response?.data || { message: "An error occurred" }));
    dispatch(setRefresh(false));
    return false;
  }
};