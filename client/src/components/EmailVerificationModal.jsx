import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { sendEmailVerificationCode, verifyEmailAndLogin } from '../redux/actions/auth';
import InputGroup from './form/InputGroup';

const EmailVerificationModal = ({ open, email, password, onClose }) => {
  const dispatch = useDispatch();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const modal = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!modal.current) return;
      if (!open || modal.current.contains(target)) return;
      onClose();
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [open, onClose]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!open || keyCode !== 27) return;
      onClose();
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [open, onClose]);

  useEffect(() => {
    if (open && email && !codeSent) {
      handleSendCode();
    }
  }, [open, email]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await dispatch(sendEmailVerificationCode(email));
      
      if (result.error) {
        setError(result.message);
      } else {
        setCodeSent(true);
        setTimeLeft(60); // 60 seconds cooldown
        
        // Handle development mode where the code is returned
        if (result.code) {
          console.log('Development mode: Verification code received:', result.code);
          setVerificationCode(result.code);
          // Optional: Show a message to the user that this is dev mode
          setError(`Development mode: Code auto-filled (${result.code})`);
        }
      }
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await dispatch(verifyEmailAndLogin(email, password, verificationCode));
      if (result?.error) {
        setError(result.message);
      }
      // On success, the redux action will handle redirection
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    if (timeLeft === 0) {
      handleSendCode();
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        open ? 'block' : 'hidden'
      }`}
    >
      <div
        ref={modal}
        className='w-full max-w-142.5 rounded-lg bg-white py-12 px-8 text-center dark:bg-boxdark md:py-15 md:px-17.5'
      >
        <h3 className='pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl'>
          Email Verification
        </h3>
        <span className='mx-auto mb-6 inline-block h-1 w-22.5 rounded bg-primary'></span>
        <p className='mb-10'>
          A verification code has been sent to {email}. 
          Please enter the 6-digit code to continue.
        </p>
        
        {error && (
          <div className="bg-danger text-white p-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleVerifyCode}>
          <InputGroup
            label="Verification Code"
            type="text"
            name="verificationCode"
            placeholder="Enter 6-digit code"
            action={(e) => setVerificationCode(e.target.value)}
            errors=""
            maxLength={6}
          />
          
          <div className='-mx-3 flex flex-wrap gap-y-4 mt-8'>
            <div className='w-full px-3 2xsm:w-1/2'>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading || timeLeft > 0}
                className={`block w-full rounded border border-stroke ${
                  timeLeft > 0 ? 'bg-gray-200 text-gray-500' : 'bg-gray hover:border-meta-1 hover:bg-meta-1 hover:text-white'
                } p-3 text-center font-medium text-black transition dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1`}
              >
                {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Code'}
              </button>
            </div>
            <div className='w-full px-3 2xsm:w-1/2'>
              <button 
                type="submit"
                disabled={loading || !verificationCode}
                className='block w-full rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90'
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
