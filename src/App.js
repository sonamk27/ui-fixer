import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingSection from './components/LandingSection';
import UploadSection from './components/UploadSection';
import AnalysisSection from './components/AnalysisSection';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import Navigation from './components/Navigation';
import './index.css';

const API_BASE_URL = 'http://localhost:5005';

function App() {
  const [currentSection, setCurrentSection] = useState('landing');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const handleImageUpload = async (file, preview) => {
    setUploadedImage(preview);
    setCurrentSection('analysis');

    try {
      // 1. Upload the image
      const formData = new FormData();
      formData.append('image', file);

      let uploadResponse;
      try {
        uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });
      } catch (networkErr) {
        throw new Error(`Cannot reach the backend server at ${API_BASE_URL}. Make sure it is running with "npm run dev" in the /backend folder.`);
      }

      if (!uploadResponse.ok) {
        let errMsg = `Upload failed (HTTP ${uploadResponse.status})`;
        try {
          const errBody = await uploadResponse.json();
          errMsg = errBody?.error?.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const uploadData = await uploadResponse.json();
      const imageId = uploadData?.data?.id;

      if (!imageId) {
        throw new Error('Upload succeeded but no imageId was returned from the backend.');
      }

      console.log('Upload successful, imageId:', imageId);

      // 2. Perform analysis
      const analysisResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, analysisType: 'detailed' }),
      });

      if (!analysisResponse.ok) {
        let errMsg = `Analysis failed (HTTP ${analysisResponse.status})`;
        try {
          const errBody = await analysisResponse.json();
          errMsg = errBody?.error?.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const analysisResult = await analysisResponse.json();
      console.log('Analysis successful:', analysisResult);

      // Give a small delay to allow the animation to feel natural
      setTimeout(() => {
        setAnalysisData(analysisResult.data);
        setCurrentSection('results');
      }, 1500);

    } catch (error) {
      console.error('Error during analysis:', error);
      alert('Error: ' + (error.message || 'Something went wrong. Is the backend server running?'));
      setCurrentSection('upload');
    }
  };

  const handleReset = () => {
    setCurrentSection('landing');
    setUploadedImage(null);
    setAnalysisData(null);
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
              <Dashboard
                originalImage={uploadedImage}
                results={analysisData}
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
