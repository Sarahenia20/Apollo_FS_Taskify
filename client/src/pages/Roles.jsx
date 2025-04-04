/*import React, { useEffect } from "react";
import DefaultLayout from "../layout/DefaultLayout";
import Breadcrumb from "../components/Breadcrumb";
import UserHeader from "../components/UserHeader";
import { Link } from "react-router-dom";
import { ROLES } from "../data/roles";
import { UseAuth } from "../hooks/useAuth";
const Roles = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Roles" />
      <UserHeader status={false} />
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
    </DefaultLayout>
  );
};

export default UseAuth(Roles, ["ADMIN"]);*/
import React, { useState } from "react";
import DefaultLayout from "../layout/DefaultLayout";
import Breadcrumb from "../components/Breadcrumb";
import UserHeader from "../components/UserHeader";
import { Link } from "react-router-dom";
import { ROLES } from "../data/roles";
import { UseAuth } from "../hooks/useAuth";
import RoleModal from "../components/RoleModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
// Import icons for delete button
import { BiTrash } from "react-icons/bi";

const Roles = () => {
  // Initialize with default roles and mark them as "default" so they can't be deleted
  const [roles, setRoles] = useState(ROLES.map(role => ({ ...role, isDefault: true })));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const handleSaveRole = (newRole) => {
    // Add new role with isDefault set to false, meaning it can be deleted
    setRoles([...roles, { ...newRole, isDefault: false }]);
    setIsModalOpen(false);
  };
  
  const openDeleteModal = (index) => {
    setRoleToDelete(index);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteRole = () => {
    // Create a new array without the deleted role
    const updatedRoles = [...roles];
    updatedRoles.splice(roleToDelete, 1);
    setRoles(updatedRoles);
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Roles" />
      <UserHeader status={false} />
      
      {/* Add New Role Button */}
     */  <div className="mb-6 flex items-center justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Manage Roles
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          Add New Role
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-2">
        {roles.map((role, index) => {
          return (
            <div key={index} className="rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke p-5 px-7.5 dark:border-strokedark">
                <h4 className="text-xl font-semibold text-black hover:text-primary dark:text-white dark:hover:text-primary">
                  <div className="flex items-center justify-between">
                    <Link to="#" className="text-md">
                      {role.title}
                    </Link>
                    <div className="flex items-center gap-3">
                      {!role.isDefault && (
                        <button 
                          onClick={() => openDeleteModal(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Role"
                        >
                          <BiTrash size={18} />
                        </button>
                      )}
                      {role.avatar && (
                        <span className="rounded-full bg-gray-200 p-2 text-sm shadow-md">
                          {role.avatar}
                        </span>
                      )}
                    </div>
                  </div>
                </h4>
              </div>
              <div className="px-7.5 pb-9 pt-6">
                <p>{role.description}</p>
                
                {role.permissions && role.permissions.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-2 text-sm font-medium text-black dark:text-white">
                      Permissions:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded bg-primary bg-opacity-10 py-1 px-3 text-xs font-medium text-primary"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Role Creation Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRole}
        roleName={roleToDelete !== null ? roles[roleToDelete]?.title : ''}
      />
    </DefaultLayout>
  );
};

export default UseAuth(Roles, ["ADMIN"]);
// src/pages/Roles.jsx
/*import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BiTrash } from "react-icons/bi";

import DefaultLayout from "../layout/DefaultLayout";
import Breadcrumb from "../components/Breadcrumb";
import UserHeader from "../components/UserHeader";
import RoleModal from "../components/RoleModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { UseAuth } from "../hooks/useAuth";
import { 
  fetchRolesAction, 
  createRoleAction, 
  deleteRoleAction 
} from "../redux/actions/roles";

const Roles = () => {
  const dispatch = useDispatch();
  const { roles, loadedRoles } = useSelector((state) => state.roles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Fetch roles on component mount
  useEffect(() => {
    if (!loadedRoles) {
      dispatch(fetchRolesAction());
    }
  }, [dispatch, loadedRoles]);

  const handleSaveRole = async (newRole) => {
    try {
      await dispatch(createRoleAction(newRole));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };
  
  const openDeleteModal = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteRole = async () => {
    try {
      if (roleToDelete) {
        await dispatch(deleteRoleAction(roleToDelete._id));
        setIsDeleteModalOpen(false);
        setRoleToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Roles" />
      <UserHeader status={false} />
      
      {/* Add New Role Button *//*}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Manage Roles
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          Add New Role
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-2">
        {roles.map((role, index) => {
          return (
            <div key={role._id || index} className="rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke p-5 px-7.5 dark:border-strokedark">
                <h4 className="text-xl font-semibold text-black hover:text-primary dark:text-white dark:hover:text-primary">
                  <div className="flex items-center justify-between">
                    <Link to="#" className="text-md">
                      {role.title}
                    </Link>
                    <div className="flex items-center gap-3">
                      {!role.isDefault && (
                        <button 
                          onClick={() => openDeleteModal(role)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Role"
                        >
                          <BiTrash size={18} />
                        </button>
                      )}
                      {role.avatar && (
                        <span className="rounded-full bg-gray-200 p-2 text-sm shadow-md">
                          {role.avatar}
                        </span>
                      )}
                    </div>
                  </div>
                </h4>
              </div>
              <div className="px-7.5 pb-9 pt-6">
                <p>{role.description}</p>
                
                {role.permissions && role.permissions.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-2 text-sm font-medium text-black dark:text-white">
                      Permissions:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded bg-primary bg-opacity-10 py-1 px-3 text-xs font-medium text-primary"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Role Creation Modal *//*}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
      />
      
      {/* Delete Confirmation Modal *//*}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRole}
        roleName={roleToDelete ? roleToDelete.title : ''}
      />
    </DefaultLayout>
  );
};

export default UseAuth(Roles, ["ADMIN"]);*/