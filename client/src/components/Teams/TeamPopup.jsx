import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FindUsers } from "../../redux/actions/users";
import InputGroup from "../form/InputGroup";
import SelectGroup from "../form/SelectGroup";
import { CreateTeamAction, UpdateTeamAction } from "../../redux/actions/teams";
import { _FindOneTeam } from "../../redux/reducers/teams";
import { setRefresh } from "../../redux/reducers/commons";
import { setErrors } from "../../redux/reducers/errors";

const TeamPopup = ({ popupOpen, setPopupOpen, editingId, popup }) => {
  const dispatch = useDispatch();
  const { _ALL: allUsers = [] } = useSelector((state) => state.users);
  const { _ONE: currentTeam = {} } = useSelector((state) => state.teams);
  const { content: errors } = useSelector((state) => state.errors);
  const { refresh } = useSelector((state) => state.commons);
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    Name: "",
    description: "",
    members: [],
    pictureprofile: null
  });

  const [usersOptions, setUsersOptions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // Role options for team members
  const roleOptions = [
    { value: "ADMIN", label: "Admin" },
    { value: "MANAGER", label: "Manager" },
    { value: "ENGINEER", label: "Engineer" },
    { value: "GUEST", label: "Guest" }
  ];

  useEffect(() => {
    dispatch(FindUsers());
  }, [dispatch]);

  // Initialize form with team data when editing
  useEffect(() => {
    if (editingId && currentTeam?._id === editingId) {
      setForm({
        Name: currentTeam.Name || "",
        description: currentTeam.description || "",
        members: currentTeam.members?.map(m => ({
          user: m.user._id,
          role: m.role
        })) || [],
        pictureprofile: currentTeam.pictureprofile || null
      });
      if (currentTeam.pictureprofile) {
        setPreviewImage(`data:image/png;base64,${currentTeam.pictureprofile}`);
      }
    } else if (!editingId) {
      // For new team, automatically add current user as admin
      setForm({
        Name: "",
        description: "",
        members: [{
          user: user._id,
          role: "ADMIN"
        }],
        pictureprofile: null
      });
      setPreviewImage(null);
    }
  }, [currentTeam, editingId, user]);

  useEffect(() => {
    console.log("Form state updated:", form);
  }, [form]);
  // Format user options for select component
  /*useEffect(() => {
    const options = allUsers.map(u => ({
      value: u._id,
      label: (
        <div className="flex items-center gap-2">
          {u.picture ? (
            <img 
              src={u.picture.includes('https') ? u.picture : `http://localhost:5500/${u.picture}`}
              className="h-6 w-6 rounded-full object-cover"
              alt={u.fullName}
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs">{u.fullName.charAt(0)}</span>
            </div>
          )}
          <span>{u.fullName}</span>
        </div>
      ),
      userData: u
    }));
    setUsersOptions(options);
  }, [allUsers]);*/

  useEffect(() => {
    const options = allUsers.map(u => ({
      value: u._id, // This must be the user's ID
      label: u.fullName,
      user: u // Include full user data if needed
    }));
    setUsersOptions(options);
  }, [allUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Debug log to verify changes
    console.log(`Changing ${name} to:`, value);
    
    setForm(prevForm => ({
      ...prevForm,
      [name]: value // Ensure this matches your input's name attribute
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        pictureprofile: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMemberChange = (selectedOptions) => {
    const selectedMembers = selectedOptions || [];
    
    const members = selectedMembers.map(option => ({
      user: option.value,
      role: form.members.find(m => m.user === option.value)?.role || "ENGINEER"
    }));
  
    // Always include current user as admin if not editing
    if (!editingId && user?._id) {
      const creatorExists = members.some(m => m.user === user._id);
      if (!creatorExists) {
        members.push({
          user: user._id,
          role: "ADMIN"
        });
      }
    }
  
    setForm(prev => ({
      ...prev,
      members
    }));
  };

  const handleRoleChange = (userId, newRole) => {
    setForm({
      ...form,
      members: form.members.map(member => 
        member.user === userId ? { ...member, role: newRole } : member
      )
    });
  };

  

  const clearForm = () => {
    dispatch(_FindOneTeam({}));
    setForm({
      Name: "",
      description: "",
      members: [{
        user: user._id,
        role: "ADMIN"
      }],
      pictureprofile: null
    });
    setPreviewImage(null);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.Name.trim()) {
      dispatch(setErrors({ Name: "Team name is required" }));
      return;
    }
  
    const teamData = {
      Name: form.Name.trim(),
      description: form.description,
      members: form.members.filter(m => m.user), // Remove empty members
      creatorid: user._id
    };
  
    console.log('Final submission data:', teamData); // Debug log
  
    if (editingId) {
      dispatch(UpdateTeamAction(teamData, editingId, setPopupOpen));
    } else {
      dispatch(CreateTeamAction(teamData, setPopupOpen));
    }
  };

  const getSelectedMembers = () => {
    return form.members
      .map(member => {
        const user = allUsers.find(u => u._id === member.user);
        return user ? {
          value: user._id,
          label: user.fullName
        } : null;
      })
      .filter(Boolean); // Remove any null entries
  };

  const isDisabled = (field) => {
    // Add any role-based restrictions here if needed
    return false;
  };

  const removeImage = () => {
    setForm({
      ...form,
      pictureprofile: null
    });
    setPreviewImage(null);
  };

  return (
    <div
      ref={popup}
      className={`fixed left-0 top-0 z-99999 flex h-screen w-full justify-center overflow-y-scroll bg-black/80 px-4 py-5 ${
        popupOpen ? "block" : "hidden"
      }`}
    >
      <div className="relative m-auto w-full max-w-180 rounded-sm border border-stroke bg-gray p-4 shadow-default dark:border-strokedark dark:bg-meta-4 sm:p-8 xl:p-10">
      <button
  onClick={() => {
    setPopupOpen(false);
    clearForm();
    dispatch(setRefresh(false));
    dispatch(setErrors({})); // Clear any errors
  }}
  className="absolute right-1 top-1 sm:right-5 sm:top-5"
>
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.8913 9.99599L19.5043 2.38635C20.032 1.85888 20.032 1.02306 19.5043 0.495589C18.9768 -0.0317329 18.141 -0.0317329 17.6135 0.495589L10.0001 8.10559L2.38673 0.495589C1.85917 -0.0317329 1.02343 -0.0317329 0.495873 0.495589C-0.0318274 1.02306 -0.0318274 1.85888 0.495873 2.38635L8.10887 9.99599L0.495873 17.6056C-0.0318274 18.1331 -0.0318274 18.9689 0.495873 19.4964C0.717307 19.7177 1.05898 19.9001 1.4413 19.9001C1.75372 19.9001 2.13282 19.7971 2.40606 19.4771L10.0001 11.8864L17.6135 19.4964C17.8349 19.7177 18.1766 19.9001 18.5589 19.9001C18.8724 19.9001 19.2531 19.7964 19.5265 19.4737C20.0319 18.9452 20.0245 18.1256 19.5043 17.6056L11.8913 9.99599Z"
              fill=""
            />
          </svg>
        </button>

        {!refresh ? (
          <form onSubmit={onSubmitHandler}>
            <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
              {editingId ? "Edit Team" : "Create New Team"}
            </h2>

            {/* Team Profile Picture */}
            <div className="mb-5 flex flex-col items-center">
              <div className="relative mb-4 h-24 w-24 rounded-full border-2 border-primary">
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt="Team Preview"
                      className="h-full w-full rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <label className="cursor-pointer rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90">
                <span>{previewImage ? "Change Image" : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <InputGroup
              label="Team Name"
              name="Name"
              placeholder="Enter team name"
              value={form.Name}        // Now properly bound to form state
              onChange={handleChange}  // Now properly connected
              required
              error={errors.Name}      // Now properly passed
              disabled={isDisabled("Name")}
              className="mb-4"
            />

            <div className="mb-5">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Description <span className="text-meta-1">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter team description"
                disabled={isDisabled("description")}
                className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
              />
              {errors.description && (
                <div className="text-sm text-red">{errors.description}</div>
              )}
            </div>

            <div className="mb-5">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Team Members <span className="text-meta-1">*</span>
              </label>
              <SelectGroup
                options={usersOptions}
                isMulti
                value={getSelectedMembers()}
                onChange={handleMemberChange}
                placeholder="Select team members..."
                disabled={isDisabled("members")}
                className="react-select-container" // Add this
                classNamePrefix="react-select"    // Add this
                menuPortalTarget={document.body}  // Add this to render menu outside popup
                styles={{
                          menuPortal: base => ({ ...base, zIndex: 99999 })
                        }}
              />
              {errors.members && (
                <div className="text-sm text-red">{errors.members}</div>
              )}
            </div>

            {form.members.length > 0 && (
              <div className="mb-5">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Member Roles
                </label>
                <div className="space-y-3">
                  {form.members.map(member => {
                    const user = allUsers.find(u => u._id === member.user);
                    if (!user) return null;
                    
                    return (
                      <div key={member.user} className="flex items-center justify-between rounded-sm border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark">
                        <div className="flex items-center gap-3">
                          {user.picture ? (
                            <img 
                              src={user.picture.includes('https') ? user.picture : `http://localhost:5500/${user.picture}`}
                              className="h-8 w-8 rounded-full object-cover"
                              alt={user.fullName}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs">{user.fullName.charAt(0)}</span>
                            </div>
                          )}
                          <span>{user.fullName}</span>
                          {member.user === user._id && !editingId && (
                            <span className="text-xs text-primary">(Creator)</span>
                          )}
                        </div>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user, e.target.value)}
                          disabled={member.user === user._id && !editingId}
                          className="rounded-sm border border-stroke bg-white px-3 py-1 dark:border-strokedark dark:bg-boxdark"
                        >
                          {roleOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded bg-primary px-4.5 py-2.5 font-medium text-white hover:bg-opacity-90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
              {editingId ? "Update Team" : "Create Team"}
            </button>
          </form>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPopup;