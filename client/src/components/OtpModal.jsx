import React, { useState, useEffect, useRef } from 'react';
import InputGroup from './form/InputGroup';

const OtpModal = ({ isOpen, onClose, onVerify, email }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const modal = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!modal.current) return;
      if (!isOpen || modal.current.contains(target)) return;
      onClose();
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [isOpen, onClose]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!isOpen || keyCode !== 27) return;
      onClose();
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    setError('');
    onVerify(otp);
  };

  return (
    <div
      className={`fixed top-0 left-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <div
        ref={modal}
        className='w-full max-w-142.5 rounded-lg bg-white py-12 px-8 text-center dark:bg-boxdark md:py-15 md:px-17.5'
      >
        <h3 className='pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl'>
          Two-Factor Authentication
        </h3>
        <span className='mx-auto mb-6 inline-block h-1 w-22.5 rounded bg-primary'></span>
        <p className='mb-10'>
          Please enter the verification code from your authenticator app
        </p>
        
        <form onSubmit={handleSubmit}>
          <InputGroup
            label="Verification Code"
            type="text"
            name="otp"
            placeholder="Enter 6-digit code"
            action={(e) => setOtp(e.target.value)}
            errors={error}
          />
          
          <div className='-mx-3 flex flex-wrap gap-y-4 mt-8'>
            <div className='w-full px-3 2xsm:w-1/2'>
              <button
                type="button"
                onClick={onClose}
                className='block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1'
              >
                Cancel
              </button>
            </div>
            <div className='w-full px-3 2xsm:w-1/2'>
              <button 
                type="submit"
                className='block w-full rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90'
              >
                Verify
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpModal;
