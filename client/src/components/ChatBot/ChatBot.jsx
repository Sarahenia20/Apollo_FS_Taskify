import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update message handler to handle suggestions
  const navigate = useNavigate();

  // Update handleSendMessage to handle navigation
  const handleSendMessage = async (e, suggestionText) => {
    if (e) e.preventDefault();
    const userMessage = suggestionText || inputMessage.trim();
    if (!userMessage) return;

    // Navigation logic for suggestions
    if (userMessage.toLowerCase().includes("create new project")) {
      navigate("/projects/project-list"); // or the route for ProjectList.jsx
      return;
    }
    if (userMessage.toLowerCase().includes("create new task")) {
      navigate("/projects/task-list"); // or the route for TaskList.jsx
      return;
    }

    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chatbot/message', {
        message: userMessage
      });

      setSuggestions(response.data.suggestions || []);

      if (response.data.messages) {
        response.data.messages.forEach((msg, index) => {
          setTimeout(() => {
            setMessages(prev => [...prev, { type: 'bot', text: msg }]);
          }, index * 500);
        });
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: response.data.response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const location = useLocation();
  const hideOnRoutes = ["/auth/signin", "/auth/signup"];

  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col">
          <div className="bg-primary p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center text-white">
              <FaRobot className="mr-2" />
              <h3 className="font-semibold">Taskify Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-gray-500">
                <div className="animate-pulse">Thinking...</div>
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-primary hover:text-white transition"
                    onClick={() => handleSendMessage(null, s)}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {isLoading && (
              <div className="text-center text-gray-500">
                <div className="animate-pulse">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors"
                disabled={isLoading}
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
        >
          <FaRobot size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatBot;