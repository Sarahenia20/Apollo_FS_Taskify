import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import InputGroup from './form/InputGroup';

const TwoFactorSettings = ({ userId }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  // Fetch 2FA status on component mount
  useEffect(() => {
    const fetchTwoFactorStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = JSON.parse(atob(token.split('.')[1]));
        
        const response = await axios.post('/api/2fa/check', {
          email: decoded.email
        });
        
        setIsEnabled(response.data.twoFactorEnabled);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching 2FA status:', error);
        setIsLoading(false);
      }
    };

    fetchTwoFactorStatus();
  }, []);

  const handleEnableTwoFactor = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/2fa/generate', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setShowSetup(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      swal('Error', error.response?.data?.error || 'Failed to generate 2FA secret', 'error');
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/api/2fa/verify-enable', {
        token: verificationCode
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setIsEnabled(true);
      setShowSetup(false);
      setVerificationCode('');
      setError('');
      swal('Success', 'Two-factor authentication has been enabled', 'success');
      setIsLoading(false);
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      setError(error.response?.data?.error || 'Invalid verification code');
      setIsLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    try {
      setIsLoading(true);
      await axios.post('/api/2fa/disable', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setIsEnabled(false);
      swal('Success', 'Two-factor authentication has been disabled', 'success');
      setIsLoading(false);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      swal('Error', error.response?.data?.error || 'Failed to disable 2FA', 'error');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Two-Factor Authentication
      </h4>
      
      {!showSetup ? (
        <div>
          <p className="mb-4">
            {isEnabled 
              ? 'Two-factor authentication is currently enabled for your account.' 
              : 'Protect your account with two-factor authentication. When enabled, you\'ll be required to enter a verification code from your authenticator app when signing in.'}
          </p>
          
          {isEnabled ? (
            <button
              onClick={handleDisableTwoFactor}
              className="inline-flex items-center justify-center rounded-md bg-danger py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
              disabled={isLoading}
            >
              Disable Two-Factor Authentication
            </button>
          ) : (
            <button
              onClick={handleEnableTwoFactor}
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
              disabled={isLoading}
            >
              Enable Two-Factor Authentication
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-4">
            Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.) or enter the secret key manually.
          </p>
          
          <div className="flex justify-center mb-6">
            <img src={qrCode} alt="QR Code" className="border border-stroke p-2 rounded" />
          </div>
          
          <div className="mb-6">
            <p className="mb-2 font-medium">Manual entry key:</p>
            <div className="p-3 bg-gray-100 dark:bg-meta-4 rounded font-mono text-center select-all">
              {secret}
            </div>
          </div>
          
          <div className="mb-6">
            <InputGroup
              label="Verification Code"
              type="text"
              name="verificationCode"
              placeholder="Enter 6-digit code"
              action={(e) => setVerificationCode(e.target.value)}
              errors={error}
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSetup(false)}
              className="inline-flex items-center justify-center rounded-md border border-stroke py-2 px-6 text-center font-medium text-black hover:bg-opacity-90 dark:border-strokedark dark:text-white"
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              onClick={handleVerifyAndEnable}
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
              disabled={isLoading}
            >
              Verify and Enable
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;
