import React, { useEffect, useRef, useState } from "react";
 import { useDispatch, useSelector } from "react-redux";
 import { _FindOneTask } from "../redux/reducers/tasks";
import Select from "react-select";
import axios from "axios";

export default function TaskGenerator({setGenerateTask}){
 const [selectedProjectId,setProjectId]=useState(null);
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const [suggestions,setSuggestions]=useState([]);
  useEffect(()=>{ 
    console.log(projects);
  },[projects])
  const [suggestionIndex,setSuggestionIndex]=useState(0);
  const [form, setForm] = useState({});
  const { refresh } = useSelector((state) => state.commons);
  const [step,setStep]=useState(0)
  const dispatch = useDispatch();

  const fetchSuggestions = async () => {
    await axios.post(`/api/generateTasks`,{
      "projectId":selectedProjectId
    }).then((res) => {
      setSuggestions(res.data.result);
    
    });
  };
  
  useEffect(()=>{
    if(step===1 && selectedProjectId!=null) {
    fetchSuggestions();
     }
  },[step])
   
  const clearForm = () => {
    dispatch(_FindOneTask({}));
    setForm({});
  };
  const handleCreate=async (suggestion)=>{
    const data={
      title:suggestion.title,
      description:suggestion.description,
      project:selectedProjectId,
    }
    await axios.post("/api/tasks/addFromSuggestion",data);
    if(suggestionIndex<suggestions.length-1){
      setSuggestionIndex((prev)=>prev+1);
    }else {
      setGenerateTask(false);
    }

  }
  const handleIgnore=()=>{
    if(suggestionIndex<suggestions.length-1){
      setSuggestionIndex((prev)=>prev+1);
    }else {
      setGenerateTask(false);
    }
  }

   
  return (
    <div
    className={`fixed left-0 top-0 z-99999 flex h-screen w-full justify-center overflow-y-scroll bg-black/80 px-4 py-5`}
  >
    <div className="relative m-auto w-full max-w-180 rounded-sm border border-stroke bg-gray p-4 shadow-default dark:border-strokedark dark:bg-meta-4 sm:p-8 xl:p-10">
      <button
        onClick={() => {
          setGenerateTask(false);
          clearForm();
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
          />
        </svg>
      </button>
  
      {!refresh ? (
        <>
          {step === 0 ? (
            <div className="p-4">
              <Select
                options={projects?.map((e) => ({
                  label: e.project_name,
                  value: e._id,
                }))}
                onChange={(e) => setProjectId(e.value)}
                placeholder="Choose a project..."
              />
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setStep((prev) => prev + 1)}
              >
                Generate Tasks
              </button>
            </div>
          ) : step === 1 ? (
            <div className="p-4">
              {suggestions &&
                suggestions.map((s, key) =>
                  suggestionIndex === key ? (
                    <div key={key}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          type="text"
                          defaultValue={s.title}
                          className="w-full border border-gray-300 p-2 rounded mt-1"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          defaultValue={s.description}
                          className="w-full border border-gray-300 p-2 rounded mt-1"
                        />
                      </div>
                      <div className="flex gap-4 justify-end">
                        <button
                          type="button"
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          onClick={()=>handleCreate(s)}
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                          onClick={()=>handleIgnore()}
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ) : null
                )}
            </div>
          ) : null}
        </>
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
    </div>
  </div>
  )}