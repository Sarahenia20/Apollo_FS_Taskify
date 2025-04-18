import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AddUser } from "../redux/actions/users";
import { useDispatch, useSelector } from "react-redux";
import jwtDecode from "jwt-decode";
import { setErrors } from "../redux/reducers/errors";
import { setUser } from "../redux/reducers/auth";
import { setAuthToken } from "../lib/setAuthToken";

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

const AuthGithub = () => { 

    const dispatch = useDispatch();
    const [rerender, setrerender] = useState(false);

    function loginwithgithub() {
        const scope = 'user:email'; // Request email scope
        window.location.assign(`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${scope}`);
      };
      
      useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const codeParam = urlParams.get('code');
    
        if (codeParam && localStorage.getItem('token') === null) {
          async function handleGitHubAuth() {
            try {
              // Step 1: Get the access token using the 'code' parameter
              const response = await axios.get(`/api/getAccessToken`, {
                params: { code: codeParam }, // Pass the code as a query parameter
              });
      
              const data = response.data;
              if (data.access_token) {
                // Step 2: Store the access token in localStorage
                localStorage.setItem('accesstoken', data.access_token);
                console.log(data);
                setAuthToken(data.access_token);
                setrerender(!rerender); // Trigger a rerender to update state
      
                // Step 3: Fetch user data from GitHub using the access token
                const tokenResponse = await axios.get('/api/getUserData', {
                  headers: {
                    'Authorization': 'Bearer ' + data.access_token,
                  },
                });
      
                const tokenData = tokenResponse.data;
                console.log(tokenData);
    
                const decoded = jwtDecode(tokenData.token);
                localStorage.setItem("token", tokenData.token);
                dispatch(setUser(decoded));
                setAuthToken(tokenData.token);
                dispatch(setErrors({}));
                
      
                // If the user doesn't exist in the database, add them
                if (tokenData.user) {
                  await dispatch(AddUser(tokenData.user)); 
                  window.location.href = "/"; // Save user data (no password needed)
                }
    
              }
            } catch (error) {
              console.error('Error during GitHub authentication or fetching user data:', error);
            }
          }
      
          handleGitHubAuth(); // Call the function
        }
      }, [rerender]);

return (
    <div>
        
        <button onClick={loginwithgithub} className='flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-black text-white p-4 hover:bg-gray-800 dark:border-strokedark dark:bg-gray-900 dark:hover:bg-gray-700'>
                <span>
                  <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  xmlns='http://www.w3.org/2000/svg'
                  >
                  <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.165c-3.338.724-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.091-.746.083-.73.083-.73 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.807 1.304 3.492.997.108-.775.419-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.311.469-2.381 1.237-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.525 11.525 0 013.003-.403c1.018.005 2.044.137 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.119 3.176.771.84 1.237 1.91 1.237 3.221 0 4.612-2.807 5.623-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.693.799.574C20.565 21.796 24 17.303 24 12 24 5.373 18.627 0 12 0z'
                  />
                  </svg>
                </span>
                    Connect with GitHub
              </button>
        
    </div>
);
};
export default AuthGithub;
