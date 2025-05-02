import React, { useEffect, useRef, useState } from "react";

const VideoCallModal = ({ roomName, onClose }) => {
  const jitsiContainerRef = useRef(null);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const [targetLanguage, setTargetLanguage] = useState("fr"); // Langue de reconnaissance
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [microphoneStatus, setMicrophoneStatus] = useState("waiting");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [translateTo, setTranslateTo] = useState("fr"); // Langue de traduction
  const [showTranslateOptions, setShowTranslateOptions] = useState(false);
  const [originalTextLanguage, setOriginalTextLanguage] = useState("fr");

  // Liste des langues disponibles pour la traduction
  const languages = [
    { code: "fr", name: "Français", displayName: "Français" },
    { code: "en", name: "English", displayName: "English" },
    { code: "ar", name: "العربية", displayName: "العربية" },
    { code: "es", name: "Español", displayName: "Español" },
    { code: "de", name: "Deutsch", displayName: "Deutsch" },
    { code: "zh", name: "中文", displayName: "中文" },
    { code: "ru", name: "Русский", displayName: "Русский" },
    { code: "ja", name: "日本語", displayName: "日本語" },
    { code: "it", name: "Italiano", displayName: "Italiano" },
    { code: "pt", name: "Português", displayName: "Português" },
  ];

  // Initialisation de Jitsi et du microphone
  useEffect(() => {
    // Charger Jitsi
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

    // Vérifier l'accès au microphone
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          console.log("Microphone access granted");
          setMicrophoneStatus("active");
          setRecognitionActive(true); // Activer la reconnaissance vocale
        })
        .catch((error) => {
          console.error("Microphone access denied:", error);
          setMicrophoneStatus("error");
          setTranscript(
            targetLanguage === "fr"
              ? "Erreur: Accès au microphone refusé."
              : targetLanguage === "en"
              ? "Error: Microphone access denied."
              : "خطأ: تم رفض الوصول إلى الميكروفون."
          );
        });
    } else {
      console.error("getUserMedia not supported");
      setMicrophoneStatus("error");
      setTranscript(
        targetLanguage === "fr"
          ? "Erreur: getUserMedia non supporté."
          : targetLanguage === "en"
          ? "Error: getUserMedia not supported."
          : "خطأ: getUserMedia غير مدعوم."
      );
    }

    // Nettoyage
    return () => {
      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = "";
      }
      stopRecognition();
    };
  }, [roomName, targetLanguage]);

  // Configurer la reconnaissance vocale lorsque la langue ou l'état change
  useEffect(() => {
    if (microphoneStatus === "active" && recognitionActive) {
      setupSpeechRecognition();
    }
    return () => stopRecognition();
  }, [recognitionActive, targetLanguage, microphoneStatus]);

  // Fonction pour arrêter la reconnaissance vocale
  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (e) {
        console.error("Erreur lors de l'arrêt de la reconnaissance:", e);
      }
    }
  };

  // Configurer la reconnaissance vocale
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript(
        targetLanguage === "fr"
          ? "Reconnaissance vocale non supportée."
          : targetLanguage === "en"
          ? "Speech recognition not supported."
          : "التعرف على الصوت غير مدعوم."
      );
      return;
    }

    stopRecognition(); // Arrêter toute reconnaissance précédente

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;

    // Définir la langue de reconnaissance
    recognition.lang = getRecognitionLanguage(targetLanguage);

    recognition.onstart = () => {
      console.log(`Reconnaissance vocale démarrée en ${recognition.lang}`);
      setMicrophoneStatus("active");
      setOriginalTextLanguage(targetLanguage);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        if (!isTranslating) setTranslatedText(""); // Réinitialiser la traduction si pas en cours
      }
      setErrorCount(0);
    };

    recognition.onerror = (event) => {
      console.error("Erreur de reconnaissance vocale", event.error);
      if (event.error === "aborted") {
        setErrorCount((prev) => Math.min(prev + 1, 3));
      } else if (event.error === "network") {
        setTranscript((prev) => prev + " [Erreur de réseau] ");
      } else if (event.error === "not-allowed") {
        setTranscript((prev) => prev + " [Accès au microphone refusé] ");
        setMicrophoneStatus("error");
        setRecognitionActive(false);
      } else {
        setTranscript((prev) => prev + ` [Erreur: ${event.error}] `);
      }
    };

    recognition.onend = () => {
      console.log("Reconnaissance vocale terminée");
      if (recognitionActive && microphoneStatus === "active") {
        const delay = Math.min(100 * Math.pow(2, errorCount), 5000);
        setTimeout(() => {
          try {
            if (recognitionRef.current && recognitionActive) {
              recognitionRef.current.start();
              console.log("Reconnaissance redémarrée");
            }
          } catch (e) {
            console.error("Échec du redémarrage:", e);
            setErrorCount((prev) => prev + 1);
          }
        }, delay);
      }
    };

    try {
      recognition.start();
      console.log(`Reconnaissance vocale initialisée en ${recognition.lang}`);
    } catch (e) {
      console.error("Échec du démarrage:", e);
      setTranscript((prev) => prev + " [Erreur d'initialisation] ");
      setMicrophoneStatus("error");
    }
  }

  // Obtenir le code de langue pour la reconnaissance vocale
  const getRecognitionLanguage = (lang) => {
    switch (lang) {
      case "en": return "en-US";
      case "fr": return "fr-FR";
      case "ar": return "ar-SA";
      case "es": return "es-ES";
      case "de": return "de-DE";
      case "zh": return "zh-CN";
      case "ru": return "ru-RU";
      case "ja": return "ja-JP";
      case "it": return "it-IT";
      case "pt": return "pt-PT";
      default: return "en-US";
    }
  };

  // Basculer la reconnaissance vocale
  const toggleRecognition = () => {
    setRecognitionActive((prev) => !prev);
  };

  // Changer la langue de reconnaissance
  const changeTargetLanguage = (lang) => {
    if (lang !== targetLanguage) {
      setTranscript("");
      setTranslatedText("");
      setTargetLanguage(lang);
      setRecognitionActive(true); // Redémarrer la reconnaissance
    }
  };

  // Générer un PDF
  const generatePDF = () => {
    if (!window.jsPDF) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = createPDF;
      document.body.appendChild(script);
    } else {
      createPDF();
    }

    function createPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(16);
      const title =
        targetLanguage === "fr"
          ? `Transcription de la réunion: ${roomName}`
          : targetLanguage === "en"
          ? `Meeting Transcript: ${roomName}`
          : `نص الاجتماع: ${roomName}`;
      doc.text(title, 20, 20);
      doc.setFontSize(12);
      const date = new Date().toLocaleDateString(
        targetLanguage === "fr" ? "fr-FR" : targetLanguage === "en" ? "en-US" : "ar-SA"
      );
      doc.text(`Date: ${date}`, 20, 30);
      doc.setFontSize(12);
      
      // Support pour les langues RTL comme l'arabe
      if (targetLanguage === "ar" || translateTo === "ar") doc.setR2L(true);
      
      const textToUse =
        translatedText ||
        transcript ||
        (targetLanguage === "fr"
          ? "Aucune transcription disponible"
          : targetLanguage === "en"
          ? "No transcript available"
          : "لا يوجد نص متاح");
      const splitText = doc.splitTextToSize(textToUse, 170);
      doc.text(splitText, 20, 40);
      doc.save(`transcription-${roomName}-${new Date().toISOString().split("T")[0]}.pdf`);
    }
  };

  // Traduire le texte (implémentation similaire à Google Translate)
  const translateText = async (targetLang) => {
    if (!transcript) return;

    setIsTranslating(true);
    setTranslateTo(targetLang);

    try {
      // Intégration d'une API de traduction (à remplacer par une API réelle)
      // Cette section simule une requête API à un service de traduction

      // Pour une implémentation réelle avec l'API Google Cloud Translation:
      // 1. Créer un compte Google Cloud
      // 2. Activer l'API Cloud Translation
      // 3. Obtenir une clé API
      // 4. Créer un point de terminaison backend sur votre serveur pour protéger votre clé API
      
      // Simulation de l'appel API
      const sourceLang = originalTextLanguage;
      const textToTranslate = transcript;
      
      // Simulation de la réponse API
      setTimeout(() => {
        let translatedResult;
        
        // Langues principales (simulation seulement, à remplacer par vraie API)
        if (sourceLang === targetLang) {
          translatedResult = textToTranslate;
        } else {
          // Cette simulation est très basique. Dans une implémentation réelle, 
          // vous appelleriez l'API de traduction de Google ou une alternative.
          translatedResult = `${textToTranslate} [Traduit de ${getLanguageName(sourceLang)} vers ${getLanguageName(targetLang)}]`;
        }
        
        setTranslatedText(translatedResult);
        setIsTranslating(false);
      }, 500); // Simulation du délai de l'API
      
    } catch (error) {
      console.error("Erreur lors de la traduction:", error);
      const errorMessage = getTranslationErrorMessage(targetLanguage);
      setTranslatedText(errorMessage);
      setIsTranslating(false);
    }
    
    setShowTranslateOptions(false);
  };

  // Obtenir le nom de la langue à partir du code
  const getLanguageName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  // Message d'erreur de traduction selon la langue
  const getTranslationErrorMessage = (lang) => {
    switch (lang) {
      case "fr": return "Erreur de traduction. Veuillez réessayer.";
      case "en": return "Translation error. Please try again.";
      case "ar": return "خطأ في الترجمة. يرجى المحاولة مرة أخرى.";
      case "es": return "Error de traducción. Por favor, inténtelo de nuevo.";
      case "de": return "Übersetzungsfehler. Bitte versuchen Sie es erneut.";
      default: return "Translation error. Please try again.";
    }
  };

  // Basculer les options de traduction
  const toggleTranslateOptions = () => {
    setShowTranslateOptions((prev) => !prev);
  };

  // Obtenir le titre de la transcription
  const getTranscriptionTitle = () => {
    switch (targetLanguage) {
      case "fr": return "Transcription en direct :";
      case "en": return "Real-time Transcript:";
      case "ar": return "النص المباشر:";
      case "es": return "Transcripción en vivo:";
      case "de": return "Echtzeit-Transkript:";
      default: return "Real-time Transcript:";
    }
  };

  // Obtenir le message de statut du microphone
  const getMicrophoneStatusMessage = () => {
    if (microphoneStatus === "error") {
      switch (targetLanguage) {
        case "fr": return "⚠️ Problème d'accès au microphone";
        case "en": return "⚠️ Microphone access issue";
        case "ar": return "⚠️ مشكلة في الوصول إلى الميكروفون";
        case "es": return "⚠️ Problema de acceso al micrófono";
        case "de": return "⚠️ Problem mit Mikrofonzugriff";
        default: return "⚠️ Microphone access issue";
      }
    }
    if (microphoneStatus === "waiting") {
      switch (targetLanguage) {
        case "fr": return "En attente d'accès au microphone...";
        case "en": return "Waiting for microphone access...";
        case "ar": return "في انتظار الوصول إلى الميكروفون...";
        case "es": return "Esperando acceso al micrófono...";
        case "de": return "Warte auf Mikrofonzugriff...";
        default: return "Waiting for microphone access...";
      }
    }
    return null;
  };

  // Obtenir le texte des boutons selon la langue
  const getTranslateButtonText = () => {
    switch (targetLanguage) {
      case "fr": return "Traduire";
      case "en": return "Translate";
      case "ar": return "ترجم";
      case "es": return "Traducir";
      case "de": return "Übersetzen";
      default: return "Translate";
    }
  };
  
  const getRecordButtonText = () => {
    if (recognitionActive) {
      switch (targetLanguage) {
        case "fr": return "Pause";
        case "en": return "Pause";
        case "ar": return "إيقاف مؤقت";
        case "es": return "Pausa";
        case "de": return "Pause";
        default: return "Pause";
      }
    } else {
      switch (targetLanguage) {
        case "fr": return "Reprendre";
        case "en": return "Resume";
        case "ar": return "استئناف";
        case "es": return "Reanudar";
        case "de": return "Fortsetzen";
        default: return "Resume";
      }
    }
  };
  
  const getPdfButtonText = () => {
    switch (targetLanguage) {
      case "fr": return "Télécharger en PDF";
      case "en": return "Download as PDF";
      case "ar": return "تنزيل كملف PDF";
      case "es": return "Descargar como PDF";
      case "de": return "Als PDF herunterladen";
      default: return "Download as PDF";
    }
  };

  const getCloseButtonText = () => {
    switch (targetLanguage) {
      case "fr": return "Fermer";
      case "en": return "Close";
      case "ar": return "إغلاق";
      case "es": return "Cerrar";
      case "de": return "Schließen";
      default: return "Close";
    }
  };

  const isRTLLanguage = (lang) => {
    return ["ar", "he", "ur", "fa"].includes(lang);
  };

  const getTranslationPlaceholderText = () => {
    switch (targetLanguage) {
      case "fr": return "Parlez maintenant, la transcription apparaîtra ici...";
      case "en": return "Speak now, the transcript will appear here...";
      case "ar": return "تحدث الآن، سيظهر النص هنا...";
      case "es": return "Hable ahora, la transcripción aparecerá aquí...";
      case "de": return "Sprechen Sie jetzt, das Transkript wird hier angezeigt...";
      default: return "Speak now, the transcript will appear here...";
    }
  };

  const getOriginalTranscriptButtonText = () => {
    switch (translateTo) {
      case "fr": return "Voir transcription originale";
      case "en": return "View original transcript";
      case "ar": return "عرض النص الأصلي";
      case "es": return "Ver transcripción original";
      case "de": return "Original-Transkript anzeigen";
      default: return "View original transcript";
    }
  };

  const getTranslationTitleText = () => {
    switch (translateTo) {
      case "fr": return "Traduction en français :";
      case "en": return "English translation:";
      case "ar": return "الترجمة العربية:";
      case "es": return "Traducción al español:";
      case "de": return "Deutsche Übersetzung:";
      case "zh": return "中文翻译:";
      case "ru": return "Русский перевод:";
      case "ja": return "日本語訳:";
      case "it": return "Traduzione italiana:";
      case "pt": return "Tradução em português:";
      default: return `Translation to ${translateTo}:`;
    }
  };

  const getTipText = () => {
    switch (targetLanguage) {
      case "fr": return "Conseil: Parlez clairement dans votre microphone.";
      case "en": return "Tip: Speak clearly into your microphone.";
      case "ar": return "نصيحة: تحدث بوضوح في الميكروفون.";
      case "es": return "Consejo: Hable claramente en su micrófono.";
      case "de": return "Tipp: Sprechen Sie deutlich in Ihr Mikrofon.";
      default: return "Tip: Speak clearly into your microphone.";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          {getCloseButtonText()}
        </button>
        <div ref={jitsiContainerRef} style={{ width: "100%", height: 500 }} />

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
                {getRecordButtonText()}
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
                {getPdfButtonText()}
              </button>
              <div className="relative">
                <button
                  onClick={toggleTranslateOptions}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm flex items-center"
                  disabled={!transcript}
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
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  {getTranslateButtonText()}
                </button>
                {showTranslateOptions && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-40 max-h-64 overflow-y-auto">
                    <div className="sticky top-0 bg-gray-100 px-4 py-2 text-sm font-medium border-b">
                      {getTranslateButtonText()}
                    </div>
                    <ul>
                      {languages.map((lang) => (
                        <li
                          key={lang.code}
                          className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b ${
                            originalTextLanguage === lang.code ? "opacity-50 bg-gray-50" : ""
                          }`}
                          onClick={() => {
                            if (originalTextLanguage !== lang.code) {
                              translateText(lang.code);
                            }
                          }}
                        >
                          {lang.displayName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {["fr", "en", "ar", "es", "de"].map((lang) => (
              <button
                key={lang}
                onClick={() => changeTargetLanguage(lang)}
                className={`px-3 py-1 rounded text-sm ${
                  targetLanguage === lang
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {languages.find(l => l.code === lang)?.displayName || lang}
              </button>
            ))}
          </div>

          <div
            className={`bg-gray-100 p-3 rounded-lg h-40 overflow-y-auto ${
              isRTLLanguage(targetLanguage) || (isTranslating && isRTLLanguage(translateTo))
                ? "text-right"
                : "text-left"
            }`}
            dir={isRTLLanguage(targetLanguage) || (translatedText && isRTLLanguage(translateTo)) ? "rtl" : "ltr"}
          >
            {isTranslating ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-pulse text-blue-500">Traduction en cours...</div>
              </div>
            ) : translatedText ? (
              <>
                <div className="text-xs text-gray-500 mb-1">
                  {getTranslationTitleText()}
                </div>
                {translatedText}
              </>
            ) : (
              transcript ||
              (microphoneStatus === "active" ? (
                getTranslationPlaceholderText()
              ) : (
                getMicrophoneStatusMessage()
              ))
            )}
          </div>

          {translatedText && (
            <button
              onClick={() => {
                setTranslatedText("");
                setIsTranslating(false);
              }}
              className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              dir={isRTLLanguage(targetLanguage) ? "rtl" : "ltr"}
            >
              {getOriginalTranscriptButtonText()}
            </button>
          )}

          {microphoneStatus === "active" && !transcript && !translatedText && (
            <div className="mt-2 text-xs text-gray-500">
              {getTipText()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;