import React, { useEffect, useState } from "react";
import InputGroup from "./form/InputGroup";
import { useDispatch, useSelector } from "react-redux";
import { AddRole, UpdateRole } from "../redux/actions/roles";
import { _FindOneRole } from "../redux/reducers/roles";
import { setRefresh } from "../redux/reducers/commons";

const PERMISSIONS = [
  "Create User",
  "Update User",
  "Delete User",
  "View Users",
  "Manage Roles",
];

const RolePopup = (props) => {
  const { refresh } = useSelector((state) => state.commons);
  const { _ONE } = useSelector((state) => state.roles);
  const dispatch = useDispatch();
  
  const [form, setForm] = useState({ roleName: "", permissions: [] });

  useEffect(() => {
    if (_ONE) setForm(_ONE);
  }, [_ONE]);

  const onChangeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onCheckboxChange = (permission) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (!Object.keys(_ONE).length) {
      dispatch(AddRole(form, props.setPopupOpen));
    } else {
      dispatch(UpdateRole(form, _ONE?._id, props.setPopupOpen));
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 z-99999 flex h-screen w-full justify-center overflow-y-scroll bg-black/80 px-4 py-5 ${
        props.popupOpen ? "block" : "hidden"
      }`}
    >
      <div className="relative m-auto w-full max-w-180 rounded-sm border border-stroke bg-gray p-4 shadow-default dark:border-strokedark dark:bg-meta-4 sm:p-8 xl:p-10">
        <button
          onClick={() => {
            props.setPopupOpen(false);
            dispatch(_FindOneRole({}));
            setTimeout(() => dispatch(setRefresh(false)), 2000);
          }}
          className="absolute right-1 top-1 sm:right-5 sm:top-5"
        >
          ✖
        </button>

        <form onSubmit={onSubmitHandler}>
          {!refresh ? (
            <div className="p-6.5">
              <InputGroup
                label={"Role Name"}
                name={"roleName"}
                type={"text"}
                placeholder={"Enter role name"}
                required={true}
                action={onChangeHandler}
                defaultValue={form.roleName}
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                  Permissions
                </label>
                {PERMISSIONS.map((perm) => (
                  <div key={perm} className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id={perm}
                      checked={form.permissions.includes(perm)}
                      onChange={() => onCheckboxChange(perm)}
                      className="mr-2"
                    />
                    <label htmlFor={perm} className="text-gray-600 dark:text-white">
                      {perm}
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray"
              >
                Save Role
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <p className="text-white">Saving...</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RolePopup;
