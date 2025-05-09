// components/ExportReportCard.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LogoDark from "../images/logo/logo-dark.svg"; // Import the logo directly for fallback

const ExportReportCard = () => {
  const [exportType, setExportType] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [includeComponents, setIncludeComponents] = useState({
    persona: true,
    activity: true,
    charts: true,
    insights: true
  });
  const { user } = useSelector(state => state.auth);
  const { activities, stats, persona } = useSelector(state => state.activity);
  
  // Function to export current view as PDF
  const exportAsPDF = async () => {
    setIsExporting(true);
    
    try {
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add Header with Taskify Logo
      await addHeaderWithLogo(pdf);
      
      // Add title
      pdf.setFontSize(22);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Activity Dashboard Report", pageWidth / 2, 30, { align: 'center' });
      
      // Add user info
      pdf.setFontSize(14);
      pdf.text(`User: ${user?.fullName || user?.name || 'Current User'}`, 20, 40);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 47);
      
      let currentY = 55;
      
      // Add Technical Persona section
      if (includeComponents.persona && persona) {
        pdf.setFontSize(16);
        pdf.setTextColor(41, 128, 185); // Blue
        pdf.text("Technical Persona", 20, currentY);
        
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text(`${persona.emoji || '🧑‍💻'} ${persona.title}`, 20, currentY + 7);
        
        // Add description with wrapping
        pdf.setFontSize(11);
        pdf.setTextColor(75, 85, 99);
        const descriptionLines = pdf.splitTextToSize(persona.description, pageWidth - 40);
        pdf.text(descriptionLines, 20, currentY + 14);
        
        // Add skill distribution if available
        if (persona.distribution && persona.distribution.length > 0) {
          currentY += 14 + (descriptionLines.length * 5);
          pdf.setFontSize(12);
          pdf.setTextColor(44, 62, 80);
          pdf.text("Technical Focus Distribution:", 20, currentY);
          
          currentY += 5;
          persona.distribution.forEach((dist, index) => {
            currentY += 5;
            pdf.text(`• ${dist}`, 25, currentY);
          });
        } else {
          currentY += 14 + (descriptionLines.length * 5);
        }
        
        // Add strengths if available
        if (persona.strengths && persona.strengths.length > 0) {
          currentY += 7;
          pdf.setFontSize(12);
          pdf.setTextColor(44, 62, 80);
          pdf.text("Technical Strengths:", 20, currentY);
          
          currentY += 5;
          const strengthsText = persona.strengths.join(', ');
          const strengthLines = pdf.splitTextToSize(strengthsText, pageWidth - 45);
          pdf.text(strengthLines, 25, currentY);
          
          currentY += (strengthLines.length * 5) + 5;
        }
        
        // Add separator
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, currentY, pageWidth - 20, currentY);
        currentY += 10;
      }
      
      // Check if we need to add a new page
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = 20;
      }
      
      // Add Activity Summary section
      if (includeComponents.activity && activities && activities.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(41, 128, 185);
        pdf.text("Recent Activity Summary", 20, currentY);
        
        pdf.setFontSize(11);
        pdf.setTextColor(75, 85, 99);
        
        currentY += 8;
        
        // Get activity distribution by type
        const activityTypes = {};
        activities.forEach(act => {
          const type = act.type;
          if (!activityTypes[type]) {
            activityTypes[type] = 0;
          }
          activityTypes[type]++;
        });
        
        // Show activity distribution
        pdf.setFontSize(12);
        pdf.setTextColor(44, 62, 80);
        pdf.text("Activity Distribution by Type:", 20, currentY);
        
        currentY += 5;
        Object.entries(activityTypes).forEach(([type, count]) => {
          pdf.setFontSize(11);
          pdf.text(`• ${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${count} activities`, 25, currentY);
          currentY += 5;
        });
        
        // Add recent activities
        currentY += 5;
        pdf.setFontSize(12);
        pdf.setTextColor(44, 62, 80);
        pdf.text("Recent Activities:", 20, currentY);
        
        currentY += 5;
        const recentActivities = activities.slice(0, 5);
        recentActivities.forEach((activity, index) => {
          const actDate = new Date(activity.timestamp).toLocaleString();
          const actText = `${actDate} - ${activity.action}${activity.details ? ': ' + activity.details : ''}`;
          const actLines = pdf.splitTextToSize(actText, pageWidth - 45);
          
          pdf.setFontSize(10);
          pdf.text(actLines, 25, currentY);
          
          currentY += (actLines.length * 4) + 3;
          
          // Check if we need to add a new page
          if (index < recentActivities.length - 1 && currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = 20;
          }
        });
        
        // Add separator
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, currentY, pageWidth - 20, currentY);
        currentY += 10;
      }
      
      // Check if we need to add a new page
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = 20;
      }
      
      // Add Chart Visualizations
      if (includeComponents.charts && stats) {
        // Capture charts - use ID to ensure we get the right component
        const chartsElement = document.getElementById('activity-summary-chart');
        
        if (chartsElement) {
          try {
            // Use better html2canvas options for more reliable capture
            const chartsCanvas = await html2canvas(chartsElement, { 
              scale: 2,
              useCORS: true,
              allowTaint: true,
              logging: false, // Disable logging for cleaner console
              backgroundColor: null // Preserve transparency
            });
            
            const chartsImgData = chartsCanvas.toDataURL('image/png');
            
            // Add charts with title
            pdf.setFontSize(16);
            pdf.setTextColor(41, 128, 185);
            pdf.text("Activity Analytics", 20, currentY);
            
            // Adjust the height to maintain aspect ratio
            const imgWidth = pageWidth - 40;
            const imgHeight = (chartsCanvas.height * imgWidth) / chartsCanvas.width;
            
            // Check if image fits on current page
            if (currentY + 10 + imgHeight > pageHeight - 20) {
              pdf.addPage();
              currentY = 20;
            }
            
            pdf.addImage(chartsImgData, 'PNG', 20, currentY + 10, imgWidth, imgHeight);
            
            currentY += imgHeight + 20;
            
            // Add separator
            pdf.setDrawColor(200, 200, 200);
            pdf.line(20, currentY, pageWidth - 20, currentY);
            currentY += 10;
          } catch (error) {
            console.error("Error capturing charts:", error);
            // Continue with the PDF generation even if chart capture fails
            pdf.setFontSize(12);
            pdf.setTextColor(200, 0, 0);
            pdf.text("Charts could not be captured for this report.", 20, currentY + 5);
            currentY += 15;
          }
        }
      }
      
      // Check if we need to add a new page
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = 20;
      }
      
      // Add AI Insights
      if (includeComponents.insights) {
        const insightsElement = document.getElementById('ai-insights');
        
        if (insightsElement) {
          try {
            const insightsCanvas = await html2canvas(insightsElement, { 
              scale: 2,
              useCORS: true,
              allowTaint: true,
              logging: false,
              backgroundColor: null
            });
            
            const insightsImgData = insightsCanvas.toDataURL('image/png');
            
            // Add insights with title
            pdf.setFontSize(16);
            pdf.setTextColor(41, 128, 185);
            pdf.text("AI Insights", 20, currentY);
            
            // Adjust the height to maintain aspect ratio
            const imgWidth = pageWidth - 40;
            const imgHeight = (insightsCanvas.height * imgWidth) / insightsCanvas.width;
            
            // Check if image fits on current page
            if (currentY + 10 + imgHeight > pageHeight - 20) {
              pdf.addPage();
              currentY = 20;
            }
            
            pdf.addImage(insightsImgData, 'PNG', 20, currentY + 10, imgWidth, imgHeight);
            
            currentY += imgHeight + 20;
          } catch (error) {
            console.error("Error capturing insights:", error);
            // Continue without the insights image
            pdf.setFontSize(12);
            pdf.setTextColor(200, 0, 0);
            pdf.text("AI Insights could not be captured for this report.", 20, currentY + 5);
            currentY += 15;
          }
        }
      }
      
      // Add footer on each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Generated with Taskify - ${new Date().toLocaleString()}`, 
          pageWidth / 2, 
          pageHeight - 10, 
          { align: 'center' }
        );
        
        // Page numbers
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      }
      
      // Save the PDF
      pdf.save(`Taskify_Activity_Report_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("There was an error generating your PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  
  // Function to add header with Taskify logo
  const addHeaderWithLogo = async (pdf) => {
    try {
      // Multiple selectors to find logo in different potential locations
      // We look for the logo in the sidebar, by class name, or by alt text containing "logo"
      const logoElement = document.querySelector(
        'NavLink[to="/auth/SignIn"] img,  img[src$="logo-dark.svg"], img[src*="logo"], img[alt*="logo" i]'
      );
      
      if (logoElement) {
        // Create a canvas from the image element
        try {
          const logoCanvas = await html2canvas(logoElement, { 
            scale: 3,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: null
          });
          const logoUrl = logoCanvas.toDataURL('image/png');
          
          // Add logo to PDF
          const pageWidth = pdf.internal.pageSize.getWidth();
          
          // Size and position the logo appropriately
          pdf.addImage(logoUrl, 'PNG', 20, 10, 40, 15);
          
          // Add a horizontal line under the header
          pdf.setDrawColor(200, 200, 200);
          pdf.line(20, 30, pageWidth - 20, 30);
          
          return true;
        } catch (logoError) {
          console.error("Error capturing logo:", logoError);
          // Fall through to next approach
        }
      }
      
      // Fallback 1: Try to use an alternative DOM approach - directly get the image src
      const logoImg = document.querySelector(
        'NavLink[to="/"] img, .sidebar img, img[src*="logo"], img[alt*="logo" i], a img'
      );
      
      if (logoImg && logoImg.src) {
        try {
          // Add logo to PDF directly from src
          const pageWidth = pdf.internal.pageSize.getWidth();
          pdf.addImage(logoImg.src, 'PNG', 20, 10, 40, 15);
          
          // Add a horizontal line under the header
          pdf.setDrawColor(200, 200, 200);
          pdf.line(20, 30, pageWidth - 20, 30);
          
          return true;
        } catch (srcError) {
          console.error("Error adding logo from src:", srcError);
          // Fall through to next approach
        }
      }
      
      // Fallback 2: Use imported logo if available
      if (LogoDark) {
        try {
          // Create an image element from the imported logo
          const img = new Image();
          img.src = LogoDark;
          
          // Wait for image to load
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // Set a timeout in case the image doesn't load
            setTimeout(resolve, 3000);
          });
          
          const pageWidth = pdf.internal.pageSize.getWidth();
          pdf.addImage(img.src, 'PNG', 20, 10, 40, 15);
          
          // Add a horizontal line under the header
          pdf.setDrawColor(200, 200, 200);
          pdf.line(20, 30, pageWidth - 20, 30);
          
          return true;
        } catch (importError) {
          console.error("Error using imported logo:", importError);
          // Fall through to text fallback
        }
      }
      
      // Final fallback: Add a text header if logo not found or all approaches failed
      pdf.setFontSize(24);
      pdf.setTextColor(41, 128, 185);
      pdf.text("Taskify", 20, 25);
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 30, pageWidth - 20, 30);
      
      return true;
    } catch (error) {
      console.error("Error adding logo:", error);
      
      // Text fallback if all else fails
      pdf.setFontSize(24);
      pdf.setTextColor(41, 128, 185);
      pdf.text("Taskify", 20, 25);
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 30, pageWidth - 20, 30);
      
      return true;
    }
  };
  
  // Function to export as JSON
  const exportAsJSON = () => {
    setIsExporting(true);
    
    try {
      // Prepare data for export
      const exportData = {
        user: {
          id: user?._id,
          name: user?.fullName || user?.name,
          email: user?.email
        },
        timestamp: new Date().toISOString(),
        activities: activities || [],
        activityStats: stats || {},
        persona: persona || {},
        generatedBy: 'Taskify Activity Dashboard'
      };
      
      // Create blob and download link
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const dataUrl = URL.createObjectURL(dataBlob);
      
      // Create and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `Taskify_Activity_Data_${Date.now()}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error exporting JSON:", error);
      alert("There was an error generating your JSON export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle export button click
  const handleExport = () => {
    if (exportType === 'pdf') {
      exportAsPDF();
    } else {
      exportAsJSON();
    }
  };
  
  // Toggle component inclusion
  const toggleComponent = (component) => {
    setIncludeComponents({
      ...includeComponents,
      [component]: !includeComponents[component]
    });
  };
  
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex flex-wrap items-center justify-between border-b border-stroke dark:border-strokedark">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Export Activity Report
        </h4>
      </div>
      
      <div className="p-4 md:p-6 xl:p-7.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-gray-2 dark:bg-meta-4 rounded-lg p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="text-base font-medium text-black dark:text-white">
                    {exportType === 'pdf' ? 'Activity Report PDF' : 'Activity Data JSON'}
                  </h4>
                  <p className="text-sm text-bodydark mt-1">
                    {exportType === 'pdf' 
                      ? 'Complete visual report with charts and insights' 
                      : 'Raw activity data for further analysis'}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-bodydark2 space-y-2 ml-11">
                <p>✓ User activity history</p>
                <p>✓ Activity pattern visualization</p>
                <p>✓ AI-generated technical persona</p>
                <p>✓ Task analytics and insights</p>
                <p>✓ Taskify branding</p>
              </div>
            </div>
            
            {exportType === 'pdf' && (
              <div className="mb-6">
                <h5 className="text-base font-medium text-black dark:text-white mb-3">
                  Include in Report:
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-persona"
                      checked={includeComponents.persona}
                      onChange={() => toggleComponent('persona')}
                      className="form-checkbox h-5 w-5 text-primary rounded border-stroke dark:border-strokedark"
                    />
                    <label htmlFor="include-persona" className="ml-2 text-sm text-bodydark">
                      Technical Persona
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-activity"
                      checked={includeComponents.activity}
                      onChange={() => toggleComponent('activity')}
                      className="form-checkbox h-5 w-5 text-primary rounded border-stroke dark:border-strokedark"
                    />
                    <label htmlFor="include-activity" className="ml-2 text-sm text-bodydark">
                      Activity Summary
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-charts"
                      checked={includeComponents.charts}
                      onChange={() => toggleComponent('charts')}
                      className="form-checkbox h-5 w-5 text-primary rounded border-stroke dark:border-strokedark"
                    />
                    <label htmlFor="include-charts" className="ml-2 text-sm text-bodydark">
                      Analytics Charts
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-insights"
                      checked={includeComponents.insights}
                      onChange={() => toggleComponent('insights')}
                      className="form-checkbox h-5 w-5 text-primary rounded border-stroke dark:border-strokedark"
                    />
                    <label htmlFor="include-insights" className="ml-2 text-sm text-bodydark">
                      AI Insights
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-between">
            <div>
              <h5 className="text-base font-medium text-black dark:text-white mb-3">
                Export Format:
              </h5>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="format-pdf"
                    name="format"
                    value="pdf"
                    checked={exportType === 'pdf'}
                    onChange={() => setExportType('pdf')}
                    className="form-radio h-5 w-5 text-primary border-stroke dark:border-strokedark"
                  />
                  <label htmlFor="format-pdf" className="ml-2 text-sm text-bodydark">
                    PDF Report
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="format-json"
                    name="format"
                    value="json"
                    checked={exportType === 'json'}
                    onChange={() => setExportType('json')}
                    className="form-radio h-5 w-5 text-primary border-stroke dark:border-strokedark"
                  />
                  <label htmlFor="format-json" className="ml-2 text-sm text-bodydark">
                    JSON Data
                  </label>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="mt-6 flex items-center justify-center w-full py-3 px-4 rounded-lg bg-primary text-white font-medium transition hover:bg-opacity-90 disabled:bg-opacity-70"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {exportType === 'pdf' ? 'Download PDF Report' : 'Export JSON Data'}
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* This is a hidden element that contains the logo specifically for PDF export */}
        <div style={{ display: 'none' }}>
        <img 
  src={LogoDark} 
  alt="Taskify Logo for PDF" 
  id="pdf-export-logo" 
  className="pdf-export-logo" 
/>

        </div>
        
        <p className="mt-6 text-xs text-bodydark text-center">
          Note: The export captures the current state of your activity dashboard. Make sure all data is loaded before exporting.
        </p>
      </div>
    </div>
  );
};

export default ExportReportCard;