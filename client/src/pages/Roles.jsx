<<<<<<< HEAD
import React, { useState } from "react";
=======
import React, { useEffect } from "react";
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
import DefaultLayout from "../layout/DefaultLayout";
import Breadcrumb from "../components/Breadcrumb";
import UserHeader from "../components/UserHeader";
import { Link } from "react-router-dom";
import { ROLES } from "../data/roles";
import { UseAuth } from "../hooks/useAuth";
<<<<<<< HEAD

const Roles = () => {
  const [isFormOpen, setIsFormOpen] = useState(false); // ✅ State for modal visibility
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({
    createUser: false,
    updateUser: false,
    deleteUser: false,
    viewReports: false,
  });

  const handleCheckboxChange = (event) => {
    setPermissions({
      ...permissions,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("New Role:", { roleName, permissions });

    // Close the modal
    setIsFormOpen(false);
  };

=======
const Roles = () => {
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Roles" />
      <UserHeader status={false} />
<<<<<<< HEAD
      <br />

      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-2">
        {ROLES.map((role) => (
          <div
            key={role.title}
            className="rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark"
          >
            <div className="border-b border-stroke p-5 px-7.5 dark:border-strokedark">
              <h4 className="text-xl font-semibold text-black hover:text-primary dark:text-white dark:hover:text-primary">
                <div className="flex items-center justify-between">
                  <Link to="#" className="text-md">
                    {role.title}
                  </Link>
                  <span className="rounded-full p-2 text-sm shadow-md">
                    {role.avatar}
                  </span>
                </div>
              </h4>
            </div>
            <div className="px-7.5 pb-9 pt-6">
              <p>{role.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Role Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsFormOpen(true)} // ✅ Open modal on click
          className="rounded bg-primary px-4.5 py-2 text-white hover:bg-opacity-90"
        >
          Add New Role
        </button>
      </div>

      {/* Add Role Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Add New Role</h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2">
                Role Name:
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="mt-1 w-full p-2 border rounded"
                  required
                />
              </label>

              {/* Checkboxes for permissions */}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Permissions:</label>
                {Object.keys(permissions).map((perm) => (
                  <label key={perm} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      name={perm}
                      checked={permissions[perm]}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    {perm.replace(/([A-Z])/g, " $1")} {/* Format text */}
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)} // ✅ Close modal
                  className="bg-gray-400 px-4 py-2 rounded text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary px-4 py-2 rounded text-white"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
=======
      <br></br>
      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-2">
        {ROLES.map((role) => {
          return (
            <div className="rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke p-5 px-7.5 dark:border-strokedark">
                <h4 className="text-xl font-semibold text-black hover:text-primary dark:text-white dark:hover:text-primary">
                  <div className="flex items-center justify-between">
                    <Link to="#" className="text-md">
                      {role.title}
                    </Link>
                    {
                      <span className="rounded-full p-2 text-sm shadow-md">
                        {role.avatar}
                      </span>
                    }
                  </div>
                </h4>
              </div>
              <div className="px-7.5 pb-9 pt-6">
                <p>{role.description}</p>
              </div>
            </div>
          );
        })}
      </div>
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
    </DefaultLayout>
  );
};

export default UseAuth(Roles, ["ADMIN"]);
