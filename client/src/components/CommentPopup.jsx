import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  AddCommentAction, 
  DeleteCommentAction,
  FindOneTaskAction
} from "../redux/actions/tasks";

const CommentPopup = ({ popupOpen, setPopupOpen, popup, taskId }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [localComments, setLocalComments] = useState([]);
  const [optimisticCommentId, setOptimisticCommentId] = useState(null);
  
  const dispatch = useDispatch();
  const { content } = useSelector((state) => state.errors);
  const { _ONE } = useSelector((state) => state.tasks);
  const { refresh } = useSelector((state) => state.commons);
  const { user } = useSelector((state) => state.auth);
  
  const ref = useRef();
  const fileInputRef = useRef();
  const [selectedfile, setselectedfile] = useState(null);

  // Determine the correct task ID
  const effectiveTaskId = taskId || (_ONE && _ONE._id);
  
  // When the popup opens, try to get existing comments from the response that came with AddComment
  useEffect(() => {
    if (popupOpen && effectiveTaskId && _ONE && _ONE.comments) {
      console.log("Setting comments from _ONE:", _ONE.comments);
      setLocalComments(_ONE.comments);
    }
  }, [popupOpen, effectiveTaskId, _ONE]);

  const OnChangeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    
    if (!effectiveTaskId) {
      console.error("Cannot add comment: No task ID available");
      return;
    }
    
    // Get comment text
    const commentText = ref.current.value;
    if (!commentText || commentText.trim() === '') {
      return;
    }
    
    console.log("Submitting comment for task:", effectiveTaskId);
    setLoading(true);
    
    // Create a temporary ID for optimistic UI update
    const tempId = `temp-${Date.now()}`;
    setOptimisticCommentId(tempId);
    
    // Add comment optimistically to local state
    const optimisticComment = {
      _id: tempId,
      content: commentText,
      by: user || {
        fullName: "You",
        email: "",
        picture: null
      },
      createdAt: new Date(),
      image: selectedfile ? URL.createObjectURL(selectedfile) : null
    };
    
    setLocalComments(prev => [...prev, optimisticComment]);
    
    // Clear form fields
    ref.current.value = "";
    
    // Prepare form data for the API
    const commentData = {
      comment: commentText,
      file: selectedfile
    };
    
    // Send to server
    dispatch(AddCommentAction(commentData, effectiveTaskId))
      .then((response) => {
        console.log("Comment added successfully");
        setselectedfile(null);
        setLoading(false);
        setOptimisticCommentId(null);
        
        // If we get a full task response with comments, update local state
        if (response && response.data && response.data.data && response.data.data.comments) {
          setLocalComments(response.data.data.comments);
        }
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
        setLoading(false);
        
        // Keep the optimistic comment but mark it as failed
        setLocalComments(prev => 
          prev.map(comment => 
            comment._id === tempId
              ? { ...comment, failed: true }
              : comment
          )
        );
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Just now";
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Just now";
    }
  };

  // Fix image URL by ensuring no double slashes
  const fixImageUrl = (url) => {
    if (!url) return "/assets/images/user/user-default.png"; // Use a local default image
    if (url.includes("https")) return url;
    return `http://localhost:5500${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
  // Get project name from different formats
  const getProjectName = () => {
    if (!_ONE) return "Task";
    
    if (typeof _ONE.project === 'object' && _ONE.project?.name) {
      return _ONE.project.name;
    }
    
    if (typeof _ONE.project === 'string') {
      return _ONE.project;
    }
    
    return "Task";
  };

  // Handle deleting a comment properly
  const handleDeleteComment = (commentId) => {
    // If it's a temporary/optimistic comment, just remove it from local state
    if (commentId.startsWith('temp-')) {
      setLocalComments(prev => prev.filter(c => c._id !== commentId));
      return;
    }
    
    // Otherwise, call the API
    dispatch(DeleteCommentAction(effectiveTaskId, commentId))
      .then(response => {
        // If we get back full data with comments, update the local state
        if (response && response.data && response.data.data && response.data.data.comments) {
          setLocalComments(response.data.data.comments);
        } else {
          // Otherwise just remove it from local state
          setLocalComments(prev => prev.filter(c => c._id !== commentId));
        }
      })
      .catch(error => {
        console.error("Error deleting comment:", error);
        // Show error but don't change UI (keep the comment visible)
      });
  };

  return (
    <div
      className={`fixed left-0 top-0 z-99999 flex h-screen w-full justify-center overflow-y-scroll bg-black/80 px-4 py-5 ${
        popupOpen === true ? "block" : "hidden"
      }`}
    >
      <div className="relative m-auto w-full max-w-4xl rounded-sm border border-stroke bg-gray p-4 shadow-default dark:border-strokedark dark:bg-meta-4 sm:p-8 xl:p-10">
        {/* Close button */}
        <button
          onClick={() => setPopupOpen(false)}
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

        <div className="flex flex-col gap-6">
          {/* Task Details Section - Simplified */}
          <div className="rounded-lg border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark">
            <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
              {_ONE?.title || "Task Comments"}
              {(loading || refresh) && <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>}
            </h2>
            
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {getProjectName()}
              </span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="rounded-lg border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Comments & Discussion
            </h3>

            {/* Comments List */}
            <div className="mb-6 max-h-96 space-y-4 overflow-y-auto">
              {localComments && localComments.length > 0 ? (
                localComments.map((c) => (
                  <div
                    key={c._id}
                    className={`rounded-lg border border-stroke p-4 dark:border-strokedark ${c._id === optimisticCommentId ? 'bg-blue-50 dark:bg-blue-900/10' : ''} ${c.failed ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={fixImageUrl(c.by?.picture)}
                          alt="User"
                          className="h-10 w-10 rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/images/user/user-default.png";
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">
                            {c.by?.fullName || "You"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatDate(c.createdAt)}
                            {c.failed && <span className="ml-2 text-red-500">Failed to send</span>}
                            {c._id === optimisticCommentId && <span className="ml-2 text-blue-500">Sending...</span>}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-700 dark:text-gray-300">{c.content}</p>
                      {c.image && (
                        <div className="mt-2">
                          <img
                            src={typeof c.image === 'string' ? c.image : URL.createObjectURL(c.image)}
                            alt="Comment attachment"
                            className="max-h-40 rounded-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <svg
                    className="mb-3 h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-gray-500">No comments yet</p>
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="sticky bottom-0 border-t border-stroke bg-white px-6 py-5 dark:border-strokedark dark:bg-boxdark">
              <form
                className="flex flex-col space-x-4.5"
                onSubmit={onSubmitHandler}
              >
                <div className="relative flex w-full items-center gap-2">
                  <div className="relative flex w-full items-center">
                    <input
                      name="comment"
                      ref={ref}
                      onChange={OnChangeHandler}
                      type="text"
                      placeholder="Type something here"
                      className="h-13 w-full rounded-md border border-stroke bg-gray pl-5 pr-19 text-black placeholder-body outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
                    />
                    <input
                      name="file"
                      onChange={(e) => {
                        if (e.target.files.length > 0) {
                          setselectedfile(e.target.files[0]);
                        } else {
                          setselectedfile(null);
                        }
                      }}
                      ref={fileInputRef}
                      type="file"
                      style={{
                        display: "none",
                      }}
                    />
                    <div
                      className="absolute right-5 top-1/2 inline-flex -translate-y-1/2 items-center justify-end space-x-4"
                      onClick={(e) => {
                        e.preventDefault();
                        fileInputRef.current.click();
                      }}
                    >
                      <button className="hover:text-primary">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          className="fill-current"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.835 1.79102C11.2378 1.79102 10.6651 2.02824 10.2428 2.45051L3.3503 9.34302C2.64657 10.0467 2.25122 11.0012 2.25122 11.9964C2.25122 12.9917 2.64657 13.9461 3.3503 14.6499C4.05403 15.3536 5.0085 15.7489 6.00372 15.7489C6.99895 15.7489 7.95341 15.3536 8.65714 14.6499L15.5496 7.75736C15.8425 7.46446 16.3174 7.46446 16.6103 7.75736C16.9032 8.05025 16.9032 8.52512 16.6103 8.81802L9.7178 15.7105C8.73277 16.6956 7.39677 17.2489 6.00372 17.2489C4.61067 17.2489 3.27468 16.6956 2.28964 15.7105C1.30461 14.7255 0.751221 13.3895 0.751221 11.9964C0.751221 10.6034 1.30461 9.26739 2.28964 8.28236L9.18214 1.38985C9.88572 0.686279 10.84 0.291016 11.835 0.291016C12.83 0.291016 13.7842 0.686279 14.4878 1.38985C15.1914 2.09343 15.5866 3.04768 15.5866 4.04268C15.5866 5.03769 15.1914 5.99194 14.4878 6.69552L7.5878 13.588C7.16569 14.0101 6.59318 14.2473 5.99622 14.2473C5.39926 14.2473 4.82676 14.0101 4.40464 13.588C3.98253 13.1659 3.74539 12.5934 3.74539 11.9964C3.74539 11.3995 3.98253 10.827 4.40464 10.4049L10.7725 4.04454C11.0655 3.75182 11.5404 3.7521 11.8331 4.04517C12.1258 4.33823 12.1256 4.81311 11.8325 5.10583L5.4653 11.4655C5.32469 11.6063 5.24539 11.7974 5.24539 11.9964C5.24539 12.1956 5.32449 12.3865 5.4653 12.5274C5.60611 12.6682 5.79709 12.7473 5.99622 12.7473C6.19535 12.7473 6.38633 12.6682 6.52714 12.5274L13.4271 5.63486C13.8492 5.21261 14.0866 4.63973 14.0866 4.04268C14.0866 3.4455 13.8494 2.87278 13.4271 2.45051C13.0049 2.02824 12.4321 1.79102 11.835 1.79102Z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex h-13 w-full max-w-13 items-center justify-center rounded-md bg-primary text-white hover:bg-opacity-90"
                    disabled={loading || refresh}
                  >
                    {loading || refresh ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
                    ) : (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 2L11 13"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 2L15 22L11 13L2 9L22 2Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {content.comment && (
                  <div className="flex justify-start text-sm text-red mt-2">
                    {content.comment}
                  </div>
                )}
                {selectedfile ? (
                  <div className="mt-2 flex items-center">
                    <img
                      style={{ width: 100, height: 100, objectFit: "contain" }}
                      src={URL.createObjectURL(selectedfile)}
                      alt="Selected attachment"
                      className="rounded"
                    />
                    <button 
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => setselectedfile(null)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 10.1l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8l2.1 2.1z" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentPopup;