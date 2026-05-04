import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingSection from './components/LandingSection';
import UploadSection from './components/UploadSection';
import AnalysisSection from './components/AnalysisSection';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import Navigation from './components/Navigation';
import './index.css';

function App() {
  const [currentSection, setCurrentSection] = useState('landing');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  // Called by UploadSection once the backend returns results
  // result = { type, score, suggestions, boxes }
  const handleImageUpload = (file, preview, result) => {
    setUploadedImage(preview);

    // Show the animated analysis screen briefly, then go to results
    setCurrentSection('analysis');

    setTimeout(() => {
      setAnalysisData(result);
      setCurrentSection('results');
    }, 1500);
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