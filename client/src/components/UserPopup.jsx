import React, { useEffect, useState } from "react";
import InputGroup from "./form/InputGroup";
import RolesSelectGroup from "./form/RolesSelectGroup"; // Import specialized roles component
import SkillsSelectGroup from "./form/SkillsSelectGroup"; // Import specialized skills component
import { useDispatch, useSelector } from "react-redux";
import { AddUser, UpdateUser } from "../redux/actions/users";
import { _FindOneUser } from "../redux/reducers/users";
import { setRefresh } from "../redux/reducers/commons";

const UserPopup = (props) => {
  const { refresh } = useSelector((state) => state.commons);
  const [form, setForm] = useState({});
  const dispatch = useDispatch();
  const { content } = useSelector((state) => state.errors);
  const { _ONE } = useSelector((state) => state.users);

  const OnChangeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handler for roles selection
  const OnChangeRoles = (selectedRoles) => {
    setForm({
      ...form,
      roles: selectedRoles,
    });
  };

  // Handler for skills selection
  const OnChangeSkills = (selectedSkills) => {
    setForm({
      ...form,
      skills: selectedSkills,
    });
  };

  useEffect(() => {
    setForm(_ONE);
  }, [_ONE]);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    
    // Format both roles and skills data before sending
    const formattedData = {
      ...form,
      // Convert roles from array of objects to array of strings if needed
      roles: form.roles ? 
        (Array.isArray(form.roles) ? 
          form.roles.map(role => typeof role === 'object' ? role.value : role) : 
          [form.roles]) : 
        [],
      // Convert skills from array of objects to array of strings if needed
      skills: form.skills ? 
        (Array.isArray(form.skills) ? 
          form.skills.map(skill => typeof skill === 'object' ? skill.value : skill) : 
          [form.skills]) : 
        []
    };
    
    // For debugging - check what's being sent
    console.log("Submitting form data:", formattedData);
    
    if (!Object.keys(_ONE).length > 0) {
      // Make sure password is included for new users
      if (!formattedData.password) {
        alert("Password is required for new users");
        return;
      }
      dispatch(AddUser(formattedData, props.setPopupOpen));
    } else {
      dispatch(UpdateUser(formattedData, _ONE?._id, props.setPopupOpen));
    }
  };
  
  return (
    <div
      className={`fixed left-0 top-0 z-99999 flex h-screen w-full justify-center overflow-y-scroll bg-black/80 px-4 py-5 ${
        props.popupOpen === true ? "block" : "hidden"
      }`}
    >
      <div className="relative m-auto w-full max-w-180 rounded-sm border border-stroke bg-gray p-4 shadow-default dark:border-strokedark dark:bg-meta-4 sm:p-8 xl:p-10">
        <button
          onClick={() => {
            props.setPopupOpen(false);
            dispatch(_FindOneUser({}));
            setTimeout(() => {
              dispatch(setRefresh(false));
            }, 2000);
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

        <form onSubmit={onSubmitHandler}>
          {!refresh ? (
            <div className="p-6.5">
              <InputGroup
                label={"Full Name"}
                name={"fullName"}
                type={"text"}
                placeholder={"Enter your full name "}
                required={true}
                action={OnChangeHandler}
                errors={content?.fullName ?? ""}
                defaultValue={form?.fullName ?? ""}
              />
              <InputGroup
                label={"Email"}
                name={"email"}
                type={"email"}
                placeholder={"Enter your email "}
                required={true}
                action={OnChangeHandler}
                errors={content?.email ?? ""}
                defaultValue={form?.email ?? ""}
              />
              <InputGroup
                label={"Phone"}
                name={"phone"}
                type={"phone"}
                placeholder={"Enter your phone "}
                required={true}
                action={OnChangeHandler}
                errors={content?.phone ?? ""}
                defaultValue={form?.phone ?? ""}
              />
              
              {/* Add password field for new users */}
              {!Object.keys(_ONE).length > 0 && (
                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Password <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    required
                    onChange={OnChangeHandler}
                    className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:text-white outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input"
                  />
                  {content?.password && (
                    <p className="text-meta-1">{content.password}</p>
                  )}
                </div>
              )}
              
              {/* Using the specialized RolesSelectGroup */}
              <RolesSelectGroup
                label="Roles"
                name="roles"
                required={true}
                action={OnChangeRoles}
                errors={content?.roles ?? ""}
                defaultValue={form?.roles || []}
              />
              
              {/* Using the SkillsSelectGroup from your friend */}
              <SkillsSelectGroup
                label="Skills"
                name="skills"
                required={false}
                action={OnChangeSkills}
                errors={content?.skills ?? ""}
                defaultValue={form?.skills || []}
                maxSkills={10}
              />

              <button
                type="submit"
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray"
              >
                Save User
              </button>
            </div>
          ) : (
            <div className="bg-gray-900 flex min-h-screen items-center justify-center">
              <div className="w-[200px]">
                <div className="space-y-5 rounded-2xl bg-white/5 p-4 shadow-xl shadow-black/5">
                  <div className="bg-rose-100/10 h-24 rounded-lg"></div>
                  <div className="space-y-3">
                    <div className="bg-rose-100/10 h-3 w-3/5 rounded-lg"></div>
                    <div className="bg-rose-100/20 h-3 w-4/5 rounded-lg"></div>
                    <div className="bg-rose-100/20 h-3 w-2/5 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserPopup;