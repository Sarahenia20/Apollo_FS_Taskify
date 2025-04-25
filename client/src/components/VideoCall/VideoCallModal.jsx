import React, { useEffect, useRef, useState } from "react";

const VideoCallModal = ({ roomName, onClose }) => {
  const jitsiContainerRef = useRef(null);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [recognitionActive, setRecognitionActive] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [microphoneStatus, setMicrophoneStatus] = useState("waiting"); // 'waiting', 'active', 'error'

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

    // Demander explicitement l'autorisation du microphone
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log("Microphone access granted");
          setMicrophoneStatus("active");
          if (recognitionActive) {
            setupSpeechRecognition();
          }
        })
        .catch(error => {
          console.error("Microphone access denied:", error);
          setMicrophoneStatus("error");
          setTranscript("Erreur: Accès au microphone refusé. Veuillez autoriser l'accès au microphone dans les paramètres de votre navigateur.");
        });
    } else {
      console.error("getUserMedia not supported");
      setMicrophoneStatus("error");
      setTranscript("Erreur: La fonction getUserMedia n'est pas prise en charge par ce navigateur.");
    }

    return () => {
      // Nettoyer
      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = "";
      }
      
      // Arrêter la reconnaissance vocale lorsque le composant est démonté
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Erreur lors de l'arrêt de la reconnaissance:", e);
        }
      }
    };
  }, [roomName]); // Uniquement lors du montage initial et si roomName change

  // Effet séparé pour gérer la reconnaissance vocale
  useEffect(() => {
    if (microphoneStatus === "active" && recognitionActive) {
      setupSpeechRecognition();
    }
    
    // Nettoyage si l'état change
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Erreur lors de l'arrêt de la reconnaissance:", e);
        }
      }
    };
  }, [recognitionActive, targetLanguage, microphoneStatus]);

  function setupSpeechRecognition() {
    // Vérifier si le navigateur prend en charge la reconnaissance vocale
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setTranscript("La reconnaissance vocale n'est pas prise en charge par ce navigateur");
      return;
    }

    // Si une reconnaissance est déjà en cours, l'arrêter
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Erreur lors de l'arrêt de la reconnaissance précédente:", e);
      }
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Configurer la reconnaissance vocale
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Définir la langue en fonction de la langue cible
    switch(targetLanguage) {
      case "en": 
        recognition.lang = 'en-US';
        break;
      case "ar":
        recognition.lang = 'ar-SA';
        break;
      default:
        recognition.lang = 'fr-FR';
    }
    
    recognition.maxAlternatives = 1;

    // Gestionnaires d'événements
    recognition.onstart = () => {
      console.log("Reconnaissance vocale démarrée");
      setMicrophoneStatus("active");
    };

    recognition.onresult = (event) => {
      console.log("Résultat de reconnaissance reçu", event);
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Mettre à jour la transcription avec le texte final
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      
      // Réinitialiser le compteur d'erreurs en cas de succès
      setErrorCount(0);
    };

    recognition.onerror = (event) => {
      console.error("Erreur de reconnaissance vocale", event.error);
      
      // Gérer des types d'erreurs spécifiques
      if (event.error === 'aborted') {
        setErrorCount(prevCount => {
          const newCount = prevCount + 1;
          // Si trop d'erreurs d'abandon en succession, suggérer une réinitialisation
          if (newCount > 3) {
            return 0; // Réinitialiser le compteur
          }
          return newCount;
        });
      } else if (event.error === 'network') {
        setTranscript(prev => prev + " [Erreur de réseau. Vérifiez votre connexion.] ");
      } else if (event.error === 'not-allowed') {
        setTranscript(prev => prev + " [Accès au microphone refusé. Vérifiez les permissions.] ");
        setMicrophoneStatus("error");
        setRecognitionActive(false); // Arrêter d'essayer si l'autorisation est refusée
      } else {
        setTranscript(prev => prev + ` [Erreur: ${event.error}] `);
      }
    };

    // Gérer la fin de la reconnaissance et redémarrer avec un retard exponentiel
    recognition.onend = () => {
      console.log("Reconnaissance vocale terminée");
      
      // Redémarrer la reconnaissance si elle se termine et que nous la voulons active
      if (recognitionActive && microphoneStatus === "active") {
        const delay = Math.min(100 * Math.pow(2, errorCount), 5000); // Retard exponentiel jusqu'à 5 secondes
        
        setTimeout(() => {
          try {
            if (recognitionRef.current && recognitionActive) {
              recognitionRef.current.start();
              console.log("Reconnaissance redémarrée après délai");
            }
          } catch (e) {
            console.error("Échec du redémarrage de la reconnaissance:", e);
            setErrorCount(prev => prev + 1);
          }
        }, delay);
      }
    };

    // Démarrer la reconnaissance
    try {
      recognition.start();
      console.log("Reconnaissance vocale initialisée");
    } catch (e) {
      console.error("Échec du démarrage de la reconnaissance:", e);
      setTranscript(prev => prev + " [Erreur d'initialisation de la reconnaissance vocale] ");
      setMicrophoneStatus("error");
    }
  }

  // Activer/désactiver la reconnaissance vocale
  const toggleRecognition = () => {
    if (recognitionActive) {
      // Arrêter la reconnaissance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Erreur lors de l'arrêt de la reconnaissance:", e);
        }
      }
    } else {
      // Réinitialiser le compteur d'erreurs lors du redémarrage manuel
      setErrorCount(0);
    }
    setRecognitionActive(!recognitionActive);
  };

  // Changer la langue cible et effacer la transcription
  const changeTargetLanguage = (lang) => {
    setTargetLanguage(lang);
    setTranscript(""); // Effacer la transcription lors du changement de langue
    
    // Redémarrer la reconnaissance avec la nouvelle langue
    if (recognitionActive && microphoneStatus === "active") {
      setTimeout(() => {
        setupSpeechRecognition();
      }, 100);
    }
  };

  // Fonction pour générer et télécharger le PDF
  const generatePDF = () => {
    // Charger jsPDF si ce n'est pas déjà fait
    if (!window.jsPDF) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = createPDF;
      document.body.appendChild(script);
    } else {
      createPDF();
    }

    function createPDF() {
      // Créer un nouveau document PDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Ajouter un titre
      doc.setFontSize(16);
      const title = targetLanguage === "fr" ? 
        `Transcription de la réunion: ${roomName}` : 
        targetLanguage === "en" ? 
          `Meeting Transcript: ${roomName}` : 
          `نص الاجتماع: ${roomName}`;
          
      doc.text(title, 20, 20);
      
      // Ajouter la date
      const today = new Date();
      doc.setFontSize(12);
      const dateText = targetLanguage === "fr" ? 
        `Date: ${today.toLocaleDateString('fr-FR')}` : 
        targetLanguage === "en" ? 
          `Date: ${today.toLocaleDateString('en-US')}` : 
          `التاريخ: ${today.toLocaleDateString('ar-SA')}`;
          
      doc.text(dateText, 20, 30);
      
      // Ajouter le contenu de la transcription avec retour à la ligne
      doc.setFontSize(12);
      
      // Gérer le texte de droite à gauche pour l'arabe
      if (targetLanguage === "ar") {
        doc.setR2L(true);
      }
      
      const textToUse = transcript || (targetLanguage === "fr" ? 
        "Aucune transcription disponible" : 
        targetLanguage === "en" ? 
          "No transcript available" : 
          "لا يوجد نص متاح");
          
      const splitText = doc.splitTextToSize(textToUse, 170);
      doc.text(splitText, 20, 40);
      
      // Enregistrer le PDF
      doc.save(`transcription-${roomName}-${today.toISOString().split('T')[0]}.pdf`);
    }
  };

  // Obtenir le titre basé sur la langue sélectionnée
  const getTranscriptionTitle = () => {
    switch (targetLanguage) {
      case "en": return "Real-time Transcript:";
      case "ar": return "النص المباشر:";
      default: return "Transcription en direct:";
    }
  };

  // Obtenir le message de statut du microphone
  const getMicrophoneStatusMessage = () => {
    if (microphoneStatus === "error") {
      return targetLanguage === "fr" 
        ? "⚠️ Problème d'accès au microphone"
        : targetLanguage === "en"
          ? "⚠️ Microphone access issue"
          : "⚠️ مشكلة في الوصول إلى الميكروفون";
    }
    if (microphoneStatus === "waiting") {
      return targetLanguage === "fr"
        ? "En attente d'accès au microphone..."
        : targetLanguage === "en"
          ? "Waiting for microphone access..."
          : "في انتظار الوصول إلى الميكروفون...";
    }
    return null;
  };

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
        
        {/* Section de transcription */}
        <div className="mt-4 border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <h3 className="font-medium">{getTranscriptionTitle()}</h3>
              {microphoneStatus !== "active" && (
                <span className="ml-2 text-sm text-red-500">{getMicrophoneStatusMessage()}</span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleRecognition}
                className={`py-1 px-3 rounded text-sm flex items-center ${
                  recognitionActive 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                disabled={microphoneStatus === "error"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {recognitionActive ? (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" 
                    />
                  ) : (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                    />
                  )}
                </svg>
                {recognitionActive ? "Pause" : "Reprendre"}
              </button>
              <button
                onClick={generatePDF}
                className="bg-black hover:bg-gray-800 text-white py-1 px-3 rounded text-sm flex items-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                  />
                </svg>
                {targetLanguage === "fr" ? "Télécharger en PDF" : 
                targetLanguage === "en" ? "Download as PDF" : 
                "تنزيل كملف PDF"}
              </button>
            </div>
          </div>
          
          {/* Sélecteur de langue */}
          <div className="mb-3 flex space-x-2">
            <button
              onClick={() => changeTargetLanguage("fr")}
              className={`px-3 py-1 rounded text-sm ${
                targetLanguage === "fr"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Français
            </button>
            <button
              onClick={() => changeTargetLanguage("en")}
              className={`px-3 py-1 rounded text-sm ${
                targetLanguage === "en"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeTargetLanguage("ar")}
              className={`px-3 py-1 rounded text-sm ${
                targetLanguage === "ar"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              العربية
            </button>
          </div>
          
          <div 
            className={`bg-gray-100 p-3 rounded-lg h-32 overflow-y-auto ${
              targetLanguage === "ar" ? "text-right" : "text-left"
            }`}
          >
            {transcript || (
              microphoneStatus === "active" ? (
                targetLanguage === "fr" ? 
                  "Parlez maintenant, la transcription apparaîtra ici..." : 
                targetLanguage === "en" ? 
                  "Speak now, the transcript will appear here..." : 
                  "تحدث الآن، سيظهر النص هنا..."
              ) : (
                getMicrophoneStatusMessage()
              )
            )}
          </div>
          
          {/* Instructions d'utilisation */}
          {microphoneStatus === "active" && !transcript && (
            <div className="mt-2 text-xs text-gray-500">
              {targetLanguage === "fr" ? 
                "Conseil: Parlez clairement dans votre microphone. La transcription s'affichera automatiquement." :
              targetLanguage === "en" ? 
                "Tip: Speak clearly into your microphone. The transcription will display automatically." :
                "نصيحة: تحدث بوضوح في الميكروفون. سيظهر النص تلقائيًا."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;