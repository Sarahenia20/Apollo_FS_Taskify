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
    },
    marketing: {
      keywords: ["market", "marketing", "brand", "social", "media", "content", "seo", "advertising", "promotion"],
      responsibilities: [
        "developing marketing strategies",
        "creating promotional materials",
        "managing social media presence",
        "analyzing market trends",
        "measuring campaign effectiveness",
        "building brand awareness",
        "coordinating marketing initiatives"
      ]
    },
    support: {
      keywords: ["support", "help", "service", "customer", "client", "care", "ticket", "assistance"],
      responsibilities: [
        "responding to customer inquiries",
        "resolving customer issues",
        "documenting support interactions",
        "escalating complex problems",
        "providing technical assistance",
        "maintaining customer satisfaction",
        "following up on support tickets"
      ]
    },
    sales: {
      keywords: ["sales", "sell", "account", "business", "client", "revenue", "deal", "lead"],
      responsibilities: [
        "generating sales leads",
        "meeting sales targets",
        "maintaining client relationships",
        "negotiating contracts",
        "presenting product solutions",
        "identifying new business opportunities",
        "closing sales deals"
      ]
    },
    finance: {
      keywords: ["finance", "financial", "account", "budget", "audit", "tax", "treasury", "fiscal"],
      responsibilities: [
        "managing financial records",
        "preparing budget reports",
        "analyzing financial data",
        "ensuring regulatory compliance",
        "processing financial transactions",
        "conducting financial forecasting",
        "handling tax matters"
      ]
    },
    hr: {
      keywords: ["hr", "human", "resource", "recruit", "talent", "personnel", "staff", "employee"],
      responsibilities: [
        "recruiting and hiring talent",
        "maintaining employee records",
        "handling benefit administration",
        "conducting performance reviews",
        "addressing employee concerns",
        "ensuring policy compliance",
        "coordinating training programs"
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
    "viewer": "Has read-only access to content. Cannot make changes to the system.",
    "engineer": "Responsible for designing, developing, and implementing technical solutions. Works on technical problems and contributes to product development.",
    "frontend developer": "Specializes in building user interfaces and client-side functionality. Works with HTML, CSS, JavaScript and related frameworks.",
    "backend developer": "Focuses on server-side logic, databases, and application integration. Develops APIs and system architecture."
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
    console.log("Starting description generation for:", name);
    
    // Convert to lowercase for matching
    const lowercaseName = name.toLowerCase().trim();
    
    // STEP 1: Try local generation first (frontend)
    // =============================================
    
    console.log("Trying local generation first");
    
    // Check if we have an exact match in our specific roles
    if (roleKnowledgeBase.specificRoles[lowercaseName]) {
      console.log("EXACT MATCH found in specificRoles:", lowercaseName);
      setRoleDescription(roleKnowledgeBase.specificRoles[lowercaseName]);
      setIsLoading(false);
      return;
    }
    
    // Check for partial matches in specificRoles
    const partialMatches = [];
    Object.keys(roleKnowledgeBase.specificRoles).forEach(key => {
      if (lowercaseName.includes(key) || key.includes(lowercaseName)) {
        partialMatches.push(key);
      }
    });
    
    if (partialMatches.length > 0) {
      // Sort by length (prefer longer matches)
      partialMatches.sort((a, b) => b.length - a.length);
      const bestMatch = partialMatches[0];
      console.log("PARTIAL MATCH found:", bestMatch);
      setRoleDescription(roleKnowledgeBase.specificRoles[bestMatch]);
      setIsLoading(false);
      return;
    }
    
    // No exact or partial matches, try keyword matching
    console.log("No exact/partial matches, trying keyword matching");
    
    // Split into words for better matching
    const roleWords = lowercaseName.split(/\s+/);
    console.log("Role words:", roleWords);
    
    const matchingCategories = [];
    
    // Manual debug - check each role category and its keywords
    console.log("Available categories for matching:");
    Object.entries(roleKnowledgeBase.roles).forEach(([category, data]) => {
      console.log(`- ${category}: ${data.keywords.join(", ")}`);
    });
    
    // Analyze the role name to find relevant categories
    Object.entries(roleKnowledgeBase.roles).forEach(([category, data]) => {
      // Simple matching logic - check if any keyword is found
      let score = 0;
      const matchedKeywords = [];
      
      // Check full name against each keyword
      data.keywords.forEach(keyword => {
        if (lowercaseName.includes(keyword)) {
          console.log(`Found keyword "${keyword}" in full name "${lowercaseName}" for category "${category}"`);
          score += 2;
          matchedKeywords.push(keyword);
        }
      });
      
      // Check each word against the keywords
      roleWords.forEach(word => {
        if (word.length < 3) return; // Skip very short words
        
        data.keywords.forEach(keyword => {
          if (keyword.length < 3) return; // Skip very short keywords
          
          // Exact match
          if (word === keyword) {
            console.log(`Exact word match: "${word}" = "${keyword}" for category "${category}"`);
            score += 3;
            matchedKeywords.push(keyword);
          } 
          // Word contains keyword
          else if (word.includes(keyword)) {
            console.log(`Word "${word}" contains keyword "${keyword}" for category "${category}"`);
            score += 1;
            matchedKeywords.push(keyword);
          }
          // Keyword contains word
          else if (keyword.includes(word)) {
            console.log(`Keyword "${keyword}" contains word "${word}" for category "${category}"`);
            score += 1;
            matchedKeywords.push(keyword);
          }
        });
      });
      
      if (score > 0) {
        matchingCategories.push({
          category,
          score,
          matchedKeywords: [...new Set(matchedKeywords)] // Remove duplicates
        });
      }
    });
    
    console.log("Matching categories found:", matchingCategories);
    
    // Generate description based on matching categories
    if (matchingCategories.length > 0) {
      // Sort by score in descending order
      matchingCategories.sort((a, b) => b.score - a.score);
      
      // Get primary category
      const primaryCategory = matchingCategories[0].category;
      console.log("Using primary category:", primaryCategory);
      
      // Get responsibilities
      const responsibilities = roleKnowledgeBase.roles[primaryCategory].responsibilities;
      
      // Take 3 random responsibilities
      const selected = [...responsibilities]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(3, responsibilities.length));
      
      console.log("Selected responsibilities:", selected);
      
      // Create description
      const roleTitle = name.charAt(0).toUpperCase() + name.slice(1);
      let description = `${roleTitle} is responsible for `;
      
      if (selected.length === 1) {
        description += selected[0] + '.';
      } else if (selected.length === 2) {
        description += `${selected[0]} and ${selected[1]}.`;
      } else {
        const last = selected.pop();
        description += selected.join(', ') + ', and ' + last + '.';
      }
      
      console.log("Generated description:", description);
      setRoleDescription(description);
      setIsLoading(false);
      return;
    }
    
    // STEP 2: If no local matches, try the backend API
    // ================================================
    
    console.log("No local matches found, trying backend API");
    try {
      const response = await axios.post('/api/roles/generate-description', { roleName: name });
      
      if (response.data && response.data.description) {
        console.log("Using description from API:", response.data.description);
        setRoleDescription(response.data.description);
        setIsLoading(false);
        return;
      } else {
        console.log("API response didn't contain a description:", response.data);
      }
    } catch (error) {
      console.log('API error:', error.message);
    }
    
    // STEP 3: Fallback - if both local and API generation fail
    // ========================================================
    
    console.log("Both local and API generation failed, using fallback");
    
    // Extract domain from role name if possible for better fallback
    const domainWords = roleWords.filter(word => word.length > 3);
    if (domainWords.length > 0) {
      const domain = domainWords[0].charAt(0).toUpperCase() + domainWords[0].slice(1);
      const fallbackDesc = `Responsible for ${domain.toLowerCase()} activities, including planning, managing, and executing tasks related to ${name}.`;
      console.log("Using domain fallback:", fallbackDesc);
      setRoleDescription(fallbackDesc);
    } else {
      // Generic fallback
      const fallbackDesc = `Responsible for ${lowercaseName} related activities in the system.`;
      console.log("Using generic fallback:", fallbackDesc);
      setRoleDescription(fallbackDesc);
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
      description: roleDescription || `Role for ${roleName}`, // Ensure description is never empty
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