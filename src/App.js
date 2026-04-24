import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingSection from './components/LandingSection';
import UploadSection from './components/UploadSection';
import AnalysisSection from './components/AnalysisSection';
import ResultsDashboard from './components/ResultsDashboard';
import ComparisonSection from './components/ComparisonSection';
import ChatAssistant from './components/ChatAssistant';
import Navigation from './components/Navigation';
import './index.css';

function App() {
  const [currentSection, setCurrentSection] = useState('landing');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [redesignedImage, setRedesignedImage] = useState(null);

  const handleImageUpload = async (file, preview) => {
    setUploadedImage(preview);
    setCurrentSection('analysis');
    
    try {
      // 1. Upload the image
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResponse = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed. Please ensure the backend is running.');
      }
      
      const uploadData = await uploadResponse.json();
      const imageId = uploadData.data.id;
      
      // 2. Perform analysis
      const analysisResponse = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId, analysisType: 'detailed' }),
      });
      
      if (!analysisResponse.ok) {
        throw new Error('Analysis failed. Please try again.');
      }
      
      const analysisData = await analysisResponse.json();
      
      // Give a small delay to allow the animation to feel natural
      setTimeout(() => {
        setAnalysisResults(analysisData.data.suggestions);
        setCurrentSection('results');
      }, 1500);
      
    } catch (error) {
      console.error('Error during analysis:', error);
      alert(error.message || 'Something went wrong. Is the backend server running?');
      setCurrentSection('upload');
    }
  };

  const handleRedesign = () => {
    setCurrentSection('comparison');
    // Simulate redesigned image
    setTimeout(() => {
      setRedesignedImage(uploadedImage); // In real app, this would be the AI-redesigned image
    }, 1000);
  };

  const handleReset = () => {
    setCurrentSection('landing');
    setUploadedImage(null);
    setAnalysisResults(null);
    setRedesignedImage(null);
  };

  return (
    <div className="min-h-screen bg-dark-bg bg-grid text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Navigation */}
      <Navigation currentSection={currentSection} onReset={handleReset} />
      
      {/* Main content */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {currentSection === 'landing' && (
              <LandingSection onGetStarted={() => setCurrentSection('upload')} />
            )}
            
            {currentSection === 'upload' && (
              <UploadSection onImageUpload={handleImageUpload} />
            )}
            
            {currentSection === 'analysis' && (
              <AnalysisSection />
            )}
            
            {currentSection === 'results' && (
              <ResultsDashboard
                originalImage={uploadedImage}
                results={analysisResults}
                onRedesign={handleRedesign}
              />
            )}
            
            {currentSection === 'comparison' && (
              <ComparisonSection
                originalImage={uploadedImage}
                redesignedImage={redesignedImage}
                onReset={handleReset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Chat Assistant - always visible */}
      <ChatAssistant />
    </div>
  );
}

export default App;
