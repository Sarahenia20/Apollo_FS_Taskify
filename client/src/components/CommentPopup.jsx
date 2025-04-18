import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  AddCommentAction, 
  DeleteCommentAction, 
  DeleteAttachmentAction,
  FindOneTaskAction
} from "../redux/actions/tasks";

const CommentPopup = (props) => {
  const [form, setForm] = useState({});
  const dispatch = useDispatch();
  const { content } = useSelector((state) => state.errors);
  const { _ONE } = useSelector((state) => state.tasks);
  const ref = useRef();
  const fileInputRef = useRef();
  const [selectedfile, setselectedfile] = useState(null);

  // Load task data when popup opens
  useEffect(() => {
    if (props.popupOpen && props.taskId) {
      dispatch(FindOneTaskAction(props.taskId));
    }
  }, [props.popupOpen, props.taskId, dispatch]);

  // Update form when task data changes
  useEffect(() => {
    setForm(_ONE);
  }, [_ONE]);

  // Add this useEffect to properly handle task data
useEffect(() => {
  if (props.popupOpen && props.taskId) {
    console.log("Fetching task data for ID:", props.taskId);
    dispatch(FindOneTaskAction(props.taskId))
      .then((action) => {
        console.log("Task fetch completed:", action.payload);
        setForm(action.payload || {});
      })
      .catch((error) => {
        console.error("Failed to fetch task:", error);
      });
  }
}, [props.popupOpen, props.taskId, dispatch]);

// Modify how you display comments to handle loading state
{!_ONE ? (
  <div className="flex justify-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
) : (
  (_ONE?.comments || []).map((c) => (
    <div key={c._id} className="comment">
      <p>{c.content}</p>
    </div>
  ))
)}
  const OnChangeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (!_ONE?._id) return;
    
    dispatch(AddCommentAction(form, _ONE._id, props.setPopupOpen));
    ref.current.value = "";
    setselectedfile(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`fixed left-0 top-0 z-99999 flex h-screen w-full justify-center overflow-y-scroll bg-black/80 px-4 py-5 ${
        props.popupOpen === true ? "block" : "hidden"
      }`}
    >
      <div className="relative m-auto w-full max-w-4xl rounded-sm border border-stroke bg-gray p-4 shadow-default dark:border-strokedark dark:bg-meta-4 sm:p-8 xl:p-10">
        <button
          onClick={() => {
            props.setPopupOpen(false);
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

        <div className="flex flex-col gap-6">
          {/* Task Details Section */}
          <div className="rounded-lg border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark">
            <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
              {_ONE?.title || "Task Details"}
            </h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {_ONE?.project?.name || "No Project"}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {_ONE?.description || "No description provided"}
                  </p>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</h3>
                  <div className="mt-1 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Start: {formatDate(_ONE?.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>End: {formatDate(_ONE?.end_date)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignees</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(_ONE?.assigns || []).map((assignee, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <img
                          src={assignee.picture?.includes("https") 
                            ? assignee.picture 
                            : `http://localhost:5500/${assignee.picture}`}
                          alt={assignee.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <span>{assignee.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="rounded-lg border border-stroke bg-white p-6 dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Comments & Discussion
            </h3>

            {/* Comments List */}
            <div className="mb-6 max-h-96 space-y-4 overflow-y-auto">
              {(_ONE?.comments || []).length > 0 ? (
                (_ONE.comments || []).map((c) => (
                  <div
                    key={c._id}
                    className="rounded-lg border border-stroke p-4 dark:border-strokedark"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.by?.picture?.includes("https")
                            ? c.by.picture
                            : `http://localhost:5500/${c.by?.picture}`}
                          alt="User"
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <h4 className="font-medium text-black dark:text-white">
                            {c.by?.name || "Unknown User"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch(DeleteCommentAction(_ONE._id, c._id))}
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
                            src={c.image}
                            alt="Comment attachment"
                            className="max-h-40 rounded-md"
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

            {/* Add Comment Form (Original Structure Preserved) */}
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
                        setForm((f) => ({
                          ...f,
                          file:
                            e.target.files.length > 0
                              ? e.target.files[0]
                              : null,
                        }));
                        setselectedfile(
                          e.target.files.length === 0 ? null : e.target.files[0]
                        );
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
                  >
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
                  </button>
                </div>
                {content.comment && (
                  <div className="flex justify-start text-sm text-red">
                    {content.comment}
                  </div>
                )}
                {selectedfile ? (
                  <img
                    style={{ width: 100, height: 100, objectFit: "contain" }}
                    src={URL.createObjectURL(selectedfile)}
                  />
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