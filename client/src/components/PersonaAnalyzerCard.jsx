// components/PersonaAnalyzerCard.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserPersona } from '../redux/actions/activityActions';

const PersonaAnalyzerCard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { persona, loading } = useSelector(state => state.activity);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Function to trigger a fresh analysis
  const refreshAnalysis = () => {
    setIsAnalyzing(true);
    dispatch(fetchUserPersona(user?._id)).finally(() => {
      setIsAnalyzing(false);
    });
  };
  
  // Default data if persona hasn't loaded yet
  const defaultPersona = {
    type: "loading",
    title: "Analyzing Your Technical Profile",
    description: "Our AI is analyzing your task history to determine your technical persona...",
    emoji: "⏳"
  };
  
  const personaData = persona || defaultPersona;
  
  // Function to get badge styling based on persona type
  const getBadgeStyles = (type) => {
    const styles = {
      security: "bg-danger/10 text-danger",
      infrastructure: "bg-primary/10 text-primary",
      architecture: "bg-meta-5/10 text-meta-5",
      development: "bg-success/10 text-success",
      networking: "bg-meta-7/10 text-meta-7",
      versatile: "bg-meta-8/10 text-meta-8",
      default: "bg-bodydark/10 text-bodydark"
    };
    
    return styles[type] || styles.default;
  };
  
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Technical Persona Analysis
        </h3>
        
        <button
          onClick={refreshAnalysis}
          disabled={isAnalyzing || loading}
          className="inline-flex items-center justify-center rounded-full bg-primary/10 py-2 px-4 text-sm font-medium text-primary hover:bg-opacity-90 disabled:bg-opacity-50"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Analysis
            </>
          )}
        </button>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-bodydark">Analyzing your task history...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Persona Icon/Visual */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-24 w-24 rounded-xl bg-primary/10 text-4xl mb-2">
                {personaData.emoji}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeStyles(personaData.type)}`}>
                {personaData.type}
              </span>
            </div>
            
            {/* Persona Details */}
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-black dark:text-white mb-2">
                {personaData.title}
              </h4>
              
              <div className="h-0.5 w-20 bg-primary mb-4"></div>
              
              <p className="text-base text-black dark:text-white opacity-90 mb-4">
                {personaData.description}
              </p>
              
              {/* Skill Distribution */}
              {personaData.distribution && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-black dark:text-white mb-2">Technical Focus Distribution</h5>
                  <div className="space-y-2">
                    {personaData.distribution.map((item, index) => {
                      const [category, percentStr] = item.split(': ');
                      const percent = parseInt(percentStr, 10) || 0;
                      
                      return (
                        <div key={index} className="flex flex-col">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize">{category}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="h-2 w-full bg-bodydark2/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500" 
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Technical Strengths */}
              {personaData.strengths && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-black dark:text-white mb-2">Technical Strengths</h5>
                  <div className="flex flex-wrap gap-2">
                    {personaData.strengths.map((strength, index) => (
                      <span key={index} className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tasks Analyzed */}
              <div className="mt-4 text-xs text-bodydark">
                <span>Analysis based on {personaData.tasksAnalyzed || '?'} completed tasks</span>
                <span className="ml-2 text-primary">{personaData.confidenceLevel || 'moderate'} confidence</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex items-center bg-gray-2 dark:bg-meta-4 rounded-lg p-4">
          <svg className="w-8 h-8 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <p className="text-sm text-black dark:text-white">
              This AI-powered analysis examines your task history to determine your technical strengths and work patterns.
              Your persona will evolve as you complete more diverse tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaAnalyzerCard;