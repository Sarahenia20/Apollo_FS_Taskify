import React, { useState, useEffect } from "react";
import axios from "axios";

const SmartAssignModal = ({ isOpen, onClose, onSelect, taskDescription, currentAssignees }) => {
  const [description, setDescription] = useState(taskDescription || "");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [assignees, setAssignees] = useState(currentAssignees || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && (description || requiredSkills)) {
      fetchRecommendations();
    }
  }, [isOpen, description, requiredSkills]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Parse requiredSkills into an array
      const skillsArray = requiredSkills
        .split(",")
        .map(skill => skill.trim().toLowerCase())
        .filter(skill => skill);
      
      const response = await axios.post(
        "http://localhost:3000/api/smart-assign",
        { description, requiredSkills: skillsArray },
        { withCredentials: true }
      );
      setRecommendedUsers(response.data.recommendedUsers);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("Failed to load recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssignee = (user) => {
    if (!assignees.some(assignee => assignee._id === user._id)) {
      setAssignees([...assignees, user]);
    }
  };

  const handleRemoveAssignee = (userId) => {
    setAssignees(assignees.filter(assignee => assignee._id !== userId));
  };

  const handleSubmit = () => {
    const formattedAssignees = assignees.map(user => ({
      value: user._id,
      label: user.fullName
    }));
    onSelect(formattedAssignees);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-boxdark">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black dark:text-white">Smart Assign</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-black dark:text-white">
            Task Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 p-3 border rounded dark:bg-boxdark dark:border-strokedark dark:text-white"
            placeholder="Describe the task requirements..."
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-black dark:text-white">
            Required Skills (comma-separated)
          </label>
          <input
            type="text"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            className="w-full p-3 border rounded dark:bg-boxdark dark:border-strokedark dark:text-white"
            placeholder="e.g., javascript, react, node"
          />
        </div>

        {isLoading ? (
          <div className="text-center text-black dark:text-white">Loading recommendations...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-black dark:text-white">
                Recommended Personnel
              </label>
              {recommendedUsers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No matching users found.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto">
                  {recommendedUsers.map(user => (
                    <div
                      key={user._id}
                      className="flex justify-between items-center p-3 mb-2 bg-gray-100 rounded dark:bg-gray-700"
                    >
                      <div>
                        <p className="font-medium text-black dark:text-white">{user.fullName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Match: {user.matchScore}%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Skills: {user.matchedSkills.join(", ")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddAssignee(user)}
                        disabled={assignees.some(assignee => assignee._id === user._id)}
                        className={`px-3 py-1 rounded text-white ${
                          assignees.some(assignee => assignee._id === user._id)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary hover:bg-primary-dark"
                        }`}
                      >
                        {assignees.some(assignee => assignee._id === user._id) ? "Added" : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium text-black dark:text-white">
                Current Assignees
              </label>
              {assignees.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No assignees selected.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto">
                  {assignees.map(user => (
                    <div
                      key={user._id}
                      className="flex justify-between items-center p-3 mb-2 bg-gray-100 rounded dark:bg-gray-700"
                    >
                      <p className="font-medium text-black dark:text-white">{user.fullName}</p>
                      <button
                        onClick={() => handleRemoveAssignee(user._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartAssignModal;