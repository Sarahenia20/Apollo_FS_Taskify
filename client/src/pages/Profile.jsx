import React, { useState } from "react";
import DefaultLayout from "../layout/DefaultLayout";
import Breadcrumb from "../components/Breadcrumb";
import CoverOne from "../images/cover/cover-01.png";
import userSix from "../images/user/user-06.png";
import FileDetailsList from "../components/FileDetailsList";
import { useSelector } from "react-redux";
import { ROLES } from "../data/roles";
import { UseAuth } from "../hooks/useAuth";

// Enhanced SkillBadge with hover effect
const SkillBadge = ({ skill }) => {
  return (
    <span 
      className="inline-block px-3 py-1.5 
                 bg-blue-100 text-blue-800 
                 dark:bg-blue-900 dark:text-blue-200 
                 rounded-full text-sm font-medium mr-2 mb-2 
                 transition-all duration-300 
                 hover:scale-105 hover:rotate-1 
                 hover:bg-blue-500 hover:text-primary 
                 dark:hover:bg-blue-600 dark:hover:text-blue-100
                 hover:shadow-md"
    >
      {skill}
    </span>
  );
};



// Narrative About Me section
const SkillsNarrativeSection = ({ skills, userName }) => {
  // Function to create a natural-sounding narrative from skills
  const generateNarrative = (skillsList, name) => {
    // Default name if not provided
    const userFirstName = name?.split(' ')[0] || "This professional";
    
    // Group similar skills for better narrative flow
    const technicalSkills = [];
    const softSkills = [];
    const domainSkills = [];
    
    // Common soft skills that might be in the skills list
    const softSkillsKeywords = [
      'leadership', 'communication', 'teamwork', 'project management', 
      'problem solving', 'public speaking', 'negotiation', 'time management',
      'collaboration', 'critical thinking', 'creativity', 'adaptability'
    ];
    
    // Domain-specific skills
    const domainKeywords = [
      'marketing', 'finance', 'accounting', 'sales', 'human resources', 
      'healthcare', 'education', 'legal', 'research', 'analytics',
      'consulting', 'strategy', 'operations', 'management'
    ];
    
    // Sort skills into categories for better narrative
    skillsList.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (softSkillsKeywords.some(keyword => lowerSkill.includes(keyword))) {
        softSkills.push(skill);
      } else if (domainKeywords.some(keyword => lowerSkill.includes(keyword))) {
        domainSkills.push(skill);
      } else {
        technicalSkills.push(skill);
      }
    });
    
    // Build the narrative
    let narrative = '';
    
    // Intro sentence based on what types of skills they have
    if (domainSkills.length > 0) {
      narrative += `${userFirstName} is a seasoned professional specializing in ${domainSkills.join(', ')}. `;
    } else {
      narrative += `${userFirstName} is a skilled professional with expertise in various technical domains. `;
    }
    
    // Technical skills section
    if (technicalSkills.length > 0) {
      if (technicalSkills.length <= 2) {
        narrative += `Their technical background includes in-depth knowledge of ${technicalSkills.join(' and ')}. `;
      } else {
        const lastSkill = technicalSkills.pop();
        narrative += `Their technical proficiency spans across ${technicalSkills.join(', ')}, and ${lastSkill}. `;
      }
    }
    
    // Soft skills section
    if (softSkills.length > 0) {
      if (softSkills.length <= 2) {
        narrative += `${userFirstName} excels in ${softSkills.join(' and ')}, `;
      } else {
        const lastSkill = softSkills.pop();
        narrative += `${userFirstName} demonstrates strong ${softSkills.join(', ')}, and ${lastSkill}, `;
      }
      narrative += `which enhances their ability to deliver exceptional results. `;
    }
    
    // Closing statement
    narrative += `With this diverse skill set, ${userFirstName.toLowerCase() === 'this professional' ? 'they bring' : userFirstName + ' brings'} considerable value to projects and teams alike.`;
    
    return narrative;
  };
  
  // Generate the narrative
  const profileNarrative = generateNarrative(skills, userName);
  
  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <div className="h-10 w-1 bg-primary rounded-full mr-3"></div>
        <h4 className="text-lg font-semibold text-black dark:text-white">
          About
        </h4>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
        {profileNarrative}
      </p>
    </div>
  );
};

// Activity Card Component
const ActivityCard = ({ icon, title, description, timeAgo }) => {
  return (
    <div className="flex items-start group">
      <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 mr-3">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-800 dark:text-gray-200">{description} <span className="font-medium">{title}</span></p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
      </div>
    </div>
  );
};

// Simple Image Generation Modal - Included directly in the Profile component
// updated functionality added to ImageGenerationModal in your Profile component
// this version adds support for better keyword detection and fallback

// updated functionality added to ImageGenerationModal in your Profile component
// this version adds support for keyword fallback AND any prompt-based dynamic search

// updated functionality added to ImageGenerationModal in your Profile component
// now supports: keyword fallback, prompt-based search, and real AI fallback API (if configured)

// updated functionality added to ImageGenerationModal in your Profile component
// now supports: keyword fallback, prompt-based search, and real AI fallback API (if configured)

// updated functionality added to ImageGenerationModal in your Profile component
// now supports: keyword fallback, prompt-based search, and real AI fallback API (if configured)

// updated functionality added to ImageGenerationModal in your Profile component
// now supports: keyword fallback, fuzzy matching, prompt-based search, and optional Hugging Face fallback

const ImageGenerationModal = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const keywordImageMap = {
    landscape: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    nature: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    city: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b',
    urban: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b',
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    ocean: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    meal: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    space: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564',
    galaxy: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564',
    office: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    work: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    computer: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    coffee: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df',
    art: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    forest: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    pet: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb',
    cat: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
    dog: 'https://images.unsplash.com/photo-1558788353-f76d92427f16',
    code: 'https://images.unsplash.com/photo-1581090700227-1e8a5b796890',
    sunset: 'https://images.unsplash.com/photo-1501973801540-537f08ccae7b'
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a description for the image");
      return;
    }

    setIsGenerating(true);
    try {
      const promptLower = prompt.toLowerCase();
      const words = promptLower.split(/\s+/);

      const matches = Object.entries(keywordImageMap)
        .filter(([key]) => words.some(w => key.includes(w) || w.includes(key)))
        .map(([, url]) => url);

      let imageUrl;

      if (matches.length > 0) {
        imageUrl = matches[Math.floor(Math.random() * matches.length)];
      } else {
        alert("We didn't recognize that description, so we're searching Unsplash for it.");
        const unsplashUrl = `https://source.unsplash.com/1200x800/?${encodeURIComponent(promptLower)}&_t=${Date.now()}`;

        const valid = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = unsplashUrl;
        });

        if (valid) {
          imageUrl = unsplashUrl;
        } else {
          const response = await fetch("https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: `${prompt}, ultra detailed, 4k, cinematic lighting` })
          });

          if (!response.ok) throw new Error("AI image generation failed");

          const blob = await response.blob();
          if (!blob.type.startsWith("image/")) throw new Error("Returned blob is not an image");

          imageUrl = URL.createObjectURL(blob);
        }
      }

      onGenerate(imageUrl);
      setPrompt("");
    } catch (error) {
      console.error("Image generation error:", error);
      alert("Image generation failed. Try a simpler prompt or check your Hugging Face token.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
        width: '90%', maxWidth: '500px'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '10px' }}>
          Generate Background Image
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '10px' }}>
          Enter a description of the background image you want
        </p>
        <textarea
          style={{
            width: '100%', padding: '10px', border: '1px solid #ccc',
            borderRadius: '4px', marginBottom: '15px', minHeight: '80px'
          }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., 'Kitten with glasses drinking coffee in space'"
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151',
            borderRadius: '4px', border: 'none', cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={handleGenerate} disabled={isGenerating} style={{
            padding: '8px 16px', backgroundColor: '#6366f1', color: 'white',
            borderRadius: '4px', border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center'
          }}>
            {isGenerating ? "Generating..." : "Generate Image"}
          </button>
        </div>
      </div>
    </div>
  );
};





// Main Profile component
const Profile = () => {
  const { _CURRENT } = useSelector((state) => state.users);
  const [coverImage, setCoverImage] = useState(CoverOne);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Handle profile image
  const profileImage = _CURRENT?.picture 
    ? (_CURRENT.picture.startsWith('http') 
       ? _CURRENT.picture 
       : `http://localhost:5500/${_CURRENT.picture}`)
    : userSix;

  // Handle image generation
  const handleGenerateImage = (imageUrl) => {
    setCoverImage(imageUrl);
    setIsModalOpen(false);
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-xl bg-white dark:bg-boxdark shadow-sm">
        {/* Cover Image - Social Media Style */}
        <div className="relative h-52 md:h-72">
          <img
            src={coverImage}
            alt="profile cover"
            className="h-full w-full object-cover object-center"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          
          {/* Profile info overlay */}
          <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 flex items-end">
            <div className="relative z-30 h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-xl hover:shadow-indigo-300/30 transition-shadow duration-300">
              <img
                src={profileImage}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                alt="profile"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = userSix;
                }}
              />
            </div>
            
            <div className="ml-4 pb-1 text-white">
              <h2 className="text-2xl md:text-3xl font-bold drop-shadow-sm">
                {_CURRENT?.fullName || "User"}
              </h2>
              <p className="text-white/90 font-medium drop-shadow-sm">
                {_CURRENT?.roles && _CURRENT.roles.join(", ")}
              </p>
            </div>
            
            {/* Edit profile and Generate Photo buttons */}
            <div className="ml-auto flex space-x-2">
              <label
                htmlFor="profile"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 11.9925 13.4874 12.3207C13.1592 12.6489 12.7141 12.8333 12.25 12.8333H1.75C1.28587 12.8333 0.840752 12.6489 0.512563 12.3207C0.184375 11.9925 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638ZM5.56219 2.33329L4.5687 3.82353C4.46051 3.98582 4.27837 4.08329 4.08333 4.08329H1.75C1.59529 4.08329 1.44692 4.14475 1.33752 4.25415C1.22812 4.36354 1.16667 4.51192 1.16667 4.66663V11.0833C1.16667 11.238 1.22812 11.3864 1.33752 11.4958C1.44692 11.6052 1.59529 11.6666 1.75 11.6666H12.25C12.4047 11.6666 12.5531 11.6052 12.6625 11.4958C12.7719 11.3864 12.8333 11.238 12.8333 11.0833V4.66663C12.8333 4.51192 12.7719 4.36354 12.6625 4.25415C12.5531 4.14475 12.4047 4.08329 12.25 4.08329H9.91667C9.72163 4.08329 9.53949 3.98582 9.4313 3.82353L8.43781 2.33329H5.56219Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.00004 5.83329C6.03354 5.83329 5.25004 6.61679 5.25004 7.58329C5.25004 8.54979 6.03354 9.33329 7.00004 9.33329C7.96654 9.33329 8.75004 8.54979 8.75004 7.58329C8.75004 6.61679 7.96654 5.83329 7.00004 5.83329ZM4.08337 7.58329C4.08337 5.97246 5.38921 4.66663 7.00004 4.66663C8.61087 4.66663 9.91671 5.97246 9.91671 7.58329C9.91671 9.19412 8.61087 10.5 7.00004 10.5C5.38921 10.5 4.08337 9.19412 4.08337 7.58329Z"
                    fill=""
                  />
                </svg>
              </label>
              
              {/* Generate Photo Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative flex items-center justify-center py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
              >
                <span className="z-10 flex items-center">
                  <svg 
                    className="w-5 h-5 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    >
                    </path>
                  </svg>
                  Generate
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Profile Content */}
        <div className="px-4 lg:px-8 pb-8 pt-4 bg-gradient-to-b from-gray-50 to-slate-100 dark:from-gray-800 dark:to-gray-900">
          <div className="mt-6">
            {/* Main content with grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - About and Skills (spans 2 columns on large screens) */}
              <div className="lg:col-span-2">
                {/* Narrative About Me Section */}
                {_CURRENT?.skills && _CURRENT.skills.length > 0 && (
                  <SkillsNarrativeSection 
                    skills={_CURRENT.skills} 
                    userName={_CURRENT?.fullName}
                  />
                )}
                
                {/* Skills Section with simple hover effect */}
                {_CURRENT?.skills && _CURRENT.skills.length > 0 && (
                  <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-1 bg-gradient-to-b from-green-400 to-teal-500 rounded-full mr-3"></div>
                      <h4 className="text-lg font-semibold text-black dark:text-white flex items-center">
                        Professional Skills
                        <span className="ml-2 bg-gradient-to-r from-green-400 to-teal-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {_CURRENT.skills.length}
                        </span>
                      </h4>
                    </div>
                    <div className="flex flex-wrap justify-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      {_CURRENT.skills.map((skill, index) => (
                        <SkillBadge key={index} skill={skill} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right column - Recent Activity */}
              <div className="lg:col-span-1">
                {/* Recent Activity Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full mr-3"></div>
                    <h4 className="text-lg font-semibold text-black dark:text-white">
                      Recent Activity
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <ActivityCard
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                        </svg>
                      }
                      title="Dashboard Design"
                      description="Started a new project"
                      timeAgo="2 days ago"
                    />
                    <ActivityCard
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      }
                      title="API Integration"
                      description="Completed"
                      timeAgo="1 week ago"
                    />
                    <ActivityCard
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                      }
                      title="React"
                      description="Added skill"
                      timeAgo="2 weeks ago"
                    />
                  </div>
                </div>

                {/* Stats Overview */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-1 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full mr-3"></div>
                    <h4 className="text-lg font-semibold text-black dark:text-white">
                      Stats Overview
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="bg-gray-200 dark:bg-gray-600 p-4 rounded-xl text-gray-800 dark:text-gray-100 text-center transition-all duration-300 hover:scale-105 hover:rotate-1 hover:bg-blue-200 hover:text-blue-600 dark:hover:bg-blue-700 dark:hover:text-blue-100 hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50">
                      <h5 className="text-xl font-bold">12</h5>
                      <p className="text-sm">Projects</p>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-600 p-4 rounded-xl text-gray-800 dark:text-gray-100 text-center transition-all duration-300 hover:scale-105 hover:rotate-1 hover:bg-blue-200 hover:text-blue-600 dark:hover:bg-blue-700 dark:hover:text-blue-100 hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50">
                      <h5 className="text-xl font-bold">87%</h5>
                      <p className="text-sm">Completion</p>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-600 p-4 rounded-xl text-gray-800 dark:text-gray-100 text-center transition-all duration-300 hover:scale-105 hover:rotate-1 hover:bg-blue-200 hover:text-blue-600 dark:hover:bg-blue-700 dark:hover:text-blue-100 hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50">
                      <h5 className="text-xl font-bold">5</h5>
                      <p className="text-sm">Teams</p>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-600 p-4 rounded-xl text-gray-800 dark:text-gray-100 text-center transition-all duration-300 hover:scale-105 hover:rotate-1 hover:bg-blue-200 hover:text-blue-600 dark:hover:bg-blue-700 dark:hover:text-blue-100 hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50">
                      <h5 className="text-xl font-bold">34</h5>
                      <p className="text-sm">Tasks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* File Details with enhanced styling */}
          <div className="mt-6">
            <div className="mb-4 flex items-center">
              <div className="h-10 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full mr-3"></div>
              <h4 className="text-lg font-semibold text-black dark:text-white">
                Files & Documents
              </h4>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 bg-gray-100 dark:bg-gray-700">
                <FileDetailsList />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Generator Modal - Directly included in the component */}
      <ImageGenerationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateImage}
      />
    </DefaultLayout>
  );
};

export default UseAuth(
  Profile,
  ROLES.map((r) => r.title)
);