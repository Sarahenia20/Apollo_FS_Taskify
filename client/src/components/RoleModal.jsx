// RoleModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PERMISSIONS = [
  { id: "create_task", label: "Create Task" },
  { id: "view_tasks", label: "View Tasks" },
  { id: "edit_tasks", label: "Edit Tasks" },
  { id: "delete_tasks", label: "Delete Tasks" },
  { id: "manage_users", label: "Manage Users" },
  { id: "view_reports", label: "View Reports" },
  { id: "manage_projects", label: "Manage Projects" }
];

// Enhanced role description generator
// This uses a more sophisticated approach to generate contextual descriptions
const roleKnowledgeBase = {
  // Common role categories
  roles: {
    project: {
      keywords: ["project", "program", "portfolio"],
      responsibilities: [
        "planning and executing projects",
        "tracking project progress",
        "managing project resources",
        "coordinating team efforts",
        "ensuring deliverables meet requirements",
        "managing project timelines and budgets"
      ]
    },
    development: {
      keywords: ["develop", "code", "program", "engineer", "frontend", "backend", "fullstack", "software"],
      responsibilities: [
        "writing and testing code",
        "building software features",
        "fixing bugs and technical issues",
        "implementing technical specifications",
        "participating in code reviews",
        "maintaining software quality"
      ]
    },
    design: {
      keywords: ["design", "ux", "ui", "user", "experience", "interface"],
      responsibilities: [
        "creating user interfaces",
        "designing user experiences",
        "producing visual assets",
        "prototyping solutions",
        "ensuring design consistency",
        "conducting usability tests"
      ]
    },
    qa: {
      keywords: ["qa", "test", "quality", "assurance", "tester"],
      responsibilities: [
        "testing software functionality",
        "identifying and reporting bugs",
        "verifying bug fixes",
        "creating and executing test cases",
        "ensuring quality standards are met",
        "performing regression testing"
      ]
    },
    admin: {
      keywords: ["admin", "administrator", "system", "superuser"],
      responsibilities: [
        "managing system configurations",
        "administering user accounts",
        "maintaining system security",
        "monitoring system performance",
        "implementing system policies",
        "controlling system access"
      ]
    },
    management: {
      keywords: ["manager", "management", "director", "lead", "chief", "head", "hr"],
      responsibilities: [
        "supervising team members",
        "allocating resources effectively",
        "setting team objectives",
        "conducting performance reviews",
        "developing team capabilities",
        "making strategic decisions"
      ]
    },
    product: {
      keywords: ["product", "owner", "manager"],
      responsibilities: [
        "defining product vision",
        "prioritizing features",
        "managing product backlog",
        "gathering user requirements",
        "collaborating with stakeholders",
        "analyzing market trends"
      ]
    },
    viewer: {
      keywords: ["viewer", "read", "guest", "limited"],
      responsibilities: [
        "viewing system data",
        "accessing read-only information",
        "consuming reports and dashboards"
      ],
      limitations: [
        "Cannot modify system data",
        "Has restricted access to sensitive information",
        "Cannot perform administrative functions"
      ]
    }
  },
  
  // Common specific role descriptions
  specificRoles: {
    "project manager": "Responsible for planning, executing, and closing projects. Oversees team members, manages schedules, and ensures projects are completed on time and within budget.",
    "product manager": "Responsible for the product throughout its lifecycle. Defines the product vision, gathers requirements, and works with development teams to deliver user value.",
    "software developer": "Responsible for writing, testing, and maintaining code. Implements features, fixes bugs, and collaborates with team members to deliver quality software.",
    "ui designer": "Creates visual elements and user interfaces for applications. Focuses on aesthetics, layout, and overall user interaction design.",
    "ux designer": "Researches and optimizes user experiences. Creates wireframes, conducts usability tests, and ensures products are intuitive and user-friendly.",
    "admin": "Has full system access and manages system settings, user accounts, and overall platform configuration.",
    "system administrator": "Manages and maintains computer systems and networks. Handles configurations, security, and ensures system availability.",
    "developer": "Responsible for writing, testing, and maintaining code. Works on software features and fixes bugs.",
    "qa tester": "Tests software to identify bugs and ensure quality standards are met. Creates test cases, performs tests, and verifies fixes.",
    "team lead": "Manages a team of developers or other staff members. Provides technical guidance and ensures team productivity.",
    "product owner": "Represents stakeholders and is responsible for maximizing the value of the product by creating and managing the product backlog.",
    "scrum master": "Facilitates Scrum processes and removes impediments for the development team.",
    "viewer": "Has read-only access to content. Cannot make changes to the system."
  }
};

const RoleModal = ({ isOpen, onClose, onSave }) => {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate description based on role name
  useEffect(() => {
    if (roleName.trim().length > 2) {
      generateDescription(roleName);
    } else {
      setRoleDescription('');
    }
  }, [roleName]);

  const generateDescription = async (name) => {
    setIsLoading(true);
    
    try {
      // Try to get description from backend API first
      const response = await axios.post('/api/roles/generate-description', { roleName: name });
      
      if (response.data && response.data.description) {
        setRoleDescription(response.data.description);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log('Using fallback description generator');
      // If API fails, fall back to local generator
    }
    
    // Local generator logic (existing code)
    // Convert to lowercase for matching
    const lowercaseName = name.toLowerCase().trim();
    
    // Check if we have an exact match in our specific roles
    if (roleKnowledgeBase.specificRoles[lowercaseName]) {
      setRoleDescription(roleKnowledgeBase.specificRoles[lowercaseName]);
      setIsLoading(false);
      return;
    }
    
    // No exact match, let's build a more intelligent description
    const matchingCategories = [];
    let highestMatchScore = 0;
    let bestMatchCategory = null;
    
    // Analyze the role name to find relevant categories
    Object.entries(roleKnowledgeBase.roles).forEach(([category, data]) => {
      // Check how many keywords match
      const matchingKeywords = data.keywords.filter(keyword => 
        lowercaseName.includes(keyword)
      );
      
      const score = matchingKeywords.length;
      if (score > 0) {
        matchingCategories.push({
          category,
          score,
          matchedKeywords: matchingKeywords
        });
        
        if (score > highestMatchScore) {
          highestMatchScore = score;
          bestMatchCategory = category;
        }
      }
    });
    
    // Generate description based on matching categories
    if (matchingCategories.length > 0) {
      // Sort by score in descending order
      matchingCategories.sort((a, b) => b.score - a.score);
      
      // Get primary and secondary categories (if available)
      const primaryCategory = matchingCategories[0].category;
      const secondaryCategory = matchingCategories.length > 1 ? matchingCategories[1].category : null;
      
      // Get responsibilities from both categories (unique only)
      const primary = roleKnowledgeBase.roles[primaryCategory];
      let responsibilities = [...primary.responsibilities];
      
      if (secondaryCategory) {
        const secondary = roleKnowledgeBase.roles[secondaryCategory];
        
        // Add unique secondary responsibilities (up to 2)
        const uniqueSecondary = secondary.responsibilities.filter(
          resp => !responsibilities.some(r => r.includes(resp.split(' ')[0]))
        ).slice(0, 2);
        
        responsibilities = [...responsibilities, ...uniqueSecondary];
      }
      
      // Shuffle and limit to 4-5 responsibilities for conciseness
      responsibilities = responsibilities.sort(() => 0.5 - Math.random()).slice(0, 
        responsibilities.length > 6 ? 4 : responsibilities.length > 4 ? 3 : responsibilities.length
      );
      
      // Create description using selected responsibilities
      const roleTitle = name.charAt(0).toUpperCase() + name.slice(1);
      let description = `${roleTitle} is responsible for `;
      
      // Add responsibilities with proper formatting
      if (responsibilities.length === 1) {
        description += responsibilities[0] + '.';
      } else if (responsibilities.length === 2) {
        description += `${responsibilities[0]} and ${responsibilities[1]}.`;
      } else {
        const lastResp = responsibilities.pop();
        description += responsibilities.join(', ') + ', and ' + lastResp + '.';
      }
      
      // Add limitations for viewer-type roles
      if (primaryCategory === 'viewer' && roleKnowledgeBase.roles.viewer.limitations) {
        description += ' ' + roleKnowledgeBase.roles.viewer.limitations[0];
      }
      
      setRoleDescription(description);
    } else {
      // Fallback for roles that don't match any category
      setRoleDescription(`Responsible for ${lowercaseName} related activities in the system.`);
    }
    
    setIsLoading(false);
  };

  const handlePermissionChange = (permissionId) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  const handleSubmit = () => {
    if (!roleName.trim()) return;
    
    // Create the role object in the format your backend expects
    const newRole = {
      name: roleName,
      description: roleDescription,
      permissions: {
        createTask: selectedPermissions.includes("create_task"),
        viewTasks: selectedPermissions.includes("view_tasks"),
        editTasks: selectedPermissions.includes("edit_tasks"),
        deleteTasks: selectedPermissions.includes("delete_tasks"),
        manageUsers: selectedPermissions.includes("manage_users"),
        viewReports: selectedPermissions.includes("view_reports"),
        manageProjects: selectedPermissions.includes("manage_projects")
      }
    };
    
    onSave(newRole);
    resetForm();
  };

  const resetForm = () => {
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-xl bg-white dark:bg-boxdark rounded-sm shadow-default">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Create New Role
          </h3>
        </div>
        <div className="p-6.5">
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Role Name
            </label>
            <input
              type="text"
              placeholder="Enter role name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Role Description
            </label>
            <textarea
              rows={3}
              placeholder="Description will be generated based on role name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
            ></textarea>
            {isLoading && (
              <p className="text-sm text-meta-3">Generating description...</p>
            )}
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Permissions
            </label>
            <div className="rounded border-[1.5px] border-stroke bg-transparent p-4 dark:border-form-strokedark dark:bg-form-input">
              {PERMISSIONS.map((permission) => (
                <div key={permission.id} className="mb-2 flex items-center">
                  <input
                    type="checkbox"
                    id={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                    className="mr-2.5"
                  />
                  <label htmlFor={permission.id} className="text-black dark:text-white">
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4.5">
            <button
              onClick={onClose}
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:shadow-1"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;