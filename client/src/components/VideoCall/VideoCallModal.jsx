import React, { useEffect, useRef } from "react";

const VideoCallModal = ({ roomName, onClose }) => {
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    // Charger le script Jitsi si ce n'est pas déjà fait
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = startConference;
      document.body.appendChild(script);
    } else {
      startConference();
    }

    function startConference() {
      if (!window.JitsiMeetExternalAPI) return;
      const domain = "meet.jit.si";
      const options = {
        roomName: roomName,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: 500,
      };
      new window.JitsiMeetExternalAPI(domain, options);
    }

    return () => {
      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = "";
      }
    };
  }, [roomName]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          Close
        </button>
        <div ref={jitsiContainerRef} style={{ width: "100%", height: 500 }} />
      </div>
    </div>
  );
};

export default VideoCallModal;