import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle,
  Copy,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import ChangeTracker from './ChangeTracker';
import ModificationOverlay from './ModificationOverlay';
import { changeTracker as changeTrackerUtil } from '../utils/changeTracking';

const ComparisonSection = ({ originalImage, redesignedImage, onReset }) => {
  const [viewMode, setViewMode] = useState('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showHighlights, setShowHighlights] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [appliedChanges, setAppliedChanges] = useState({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showChangeTracker, setShowChangeTracker] = useState(false);
  const [modificationsApplied, setModificationsApplied] = useState(false);

  useEffect(() => {
    // Generate a unique ID for this image session
    if (originalImage && !imageId) {
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setImageId(id);
      changeTrackerUtil.initializeTracking(id, originalImage);
    }
  }, [originalImage, imageId]);

  const handleChangesUpdate = (changes) => {
    setAppliedChanges(changes);
    // Reset modificationsApplied when changes are updated
    setModificationsApplied(false);
  };

  const handleRegenerate = async () => {
    if (!imageId || Object.keys(appliedChanges).length === 0) {
      alert('No changes to apply. Please add some modifications first.');
      return;
    }

    setIsRegenerating(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/regeneration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          appliedChanges,
          modificationHistory: changeTrackerUtil.getModifications(imageId)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // In a real app, you would update the redesignedImage with the new one
        console.log('Regeneration successful:', result.data);
        
        // Set modificationsApplied to show visual changes
        setModificationsApplied(true);
        
        alert('Image regenerated successfully with your changes!');
        
        // Update the redesigned image (in real app, this would be the actual regenerated image)
        // For now, we'll simulate it
        setTimeout(() => {
          setIsRegenerating(false);
        }, 2000);
      } else {
        throw new Error(result.message || 'Regeneration failed');
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      alert('Failed to regenerate image. Please try again.');
      setIsRegenerating(false);
    }
  };

  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleCopyCSS = async () => {
    let cssCode;
    
    if (Object.keys(appliedChanges).length > 0) {
      // Use CSS from tracked changes
      cssCode = changeTrackerUtil.generateCSS(imageId);
    } else {
      // Use default CSS
      cssCode = `/* AI-Generated CSS Improvements */
.improved-ui {
  /* Color improvements */
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  /* Spacing fixes */
  padding: 16px;
  margin: 24px;
  
  /* Typography */
  font-size: 16px;
  line-height: 1.6;
  
  /* Enhanced UX */
  transition: all 0.3s ease;
  cursor: pointer;
}

.improved-ui:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(147, 51, 234, 0.3);
}`;
    }
    
    await navigator.clipboard.writeText(cssCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const improvements = [
    { area: 'Header', type: 'color', description: 'Improved contrast and readability' },
    { area: 'Buttons', type: 'spacing', description: 'Better padding and hover states' },
    { area: 'Typography', type: 'typography', description: 'Enhanced font hierarchy' },
    { area: 'Layout', type: 'spacing', description: 'Optimized white space' }
  ];

  // Get dynamic improvements from applied changes
  const getAppliedImprovements = () => {
    if (!modificationsApplied || Object.keys(appliedChanges).length === 0) {
      return improvements;
    }

    return Object.entries(appliedChanges).map(([key, change]) => {
      const [type, target] = key.split('_');
      const typeDescriptions = {
        color: 'Color improvements',
        spacing: 'Spacing adjustments',
        typography: 'Typography enhancements',
        layout: 'Layout optimizations'
      };

      return {
        area: target.charAt(0).toUpperCase() + target.slice(1),
        type: type,
        description: typeDescriptions[type] || 'Applied modification'
      };
    });
  };

  return (
    <section className="min-h-screen px-6 py-20">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-green-500/30 mb-6">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">AI Redesign Complete</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Before & After</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Compare your original design with the AI-enhanced version
          </p>
        </motion.div>

        {/* View mode toggle */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex p-1 glass rounded-lg">
            <button
              onClick={() => setViewMode('slider')}
              className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                viewMode === 'slider'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Slider View
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                viewMode === 'side-by-side'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Side by Side
            </button>
          </div>
        </motion.div>

        {/* Comparison container */}
        <motion.div
          className="glass-dark rounded-2xl p-8 border border-purple-500/30 mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {viewMode === 'slider' ? (
              <motion.div
                key="slider"
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="relative rounded-xl overflow-hidden cursor-ew-resize"
                  onMouseMove={handleSliderMove}
                  style={{ height: '500px' }}
                >
                  {/* Original image (left side) */}
                  <div
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src={originalImage}
                      alt="Original design"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full glass-dark border border-white/10">
                      <span className="text-xs text-gray-300">Before</span>
                    </div>
                  </div>

                  {/* Redesigned image (right side) */}
                  <div
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                  >
                    <img
                      src={redesignedImage}
                      alt="Redesigned UI"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <span className="text-xs text-green-400">After</span>
                    </div>

                    {/* Modification overlays - show when modifications are applied */}
                    {modificationsApplied && Object.keys(appliedChanges).length > 0 && (
                      <ModificationOverlay 
                        appliedChanges={appliedChanges} 
                        imageDimensions={{ width: '100%', height: '100%' }}
                      />
                    )}

                    {/* Improvement highlights */}
                    {showHighlights && !modificationsApplied && (
                      <div className="absolute inset-0 pointer-events-none">
                        {improvements.map((improvement, index) => (
                          <motion.div
                            key={index}
                            className="absolute w-16 h-16 border-2 border-green-400 rounded-lg animate-pulse"
                            style={{
                              top: `${20 + index * 15}%`,
                              right: `${10 + index * 8}%`
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Slider handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="side-by-side"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Before */}
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={originalImage}
                    alt="Original design"
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full glass-dark border border-white/10">
                    <span className="text-xs text-gray-300">Before</span>
                  </div>
                </div>

                {/* After */}
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={redesignedImage}
                    alt="Redesigned UI"
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <span className="text-xs text-green-400">After</span>
                  </div>

                  {/* Modification overlays - show when modifications are applied */}
                  {modificationsApplied && Object.keys(appliedChanges).length > 0 && (
                    <ModificationOverlay 
                      appliedChanges={appliedChanges} 
                      imageDimensions={{ width: '100%', height: '100%' }}
                    />
                  )}

                  {/* Improvement highlights */}
                  {showHighlights && !modificationsApplied && (
                    <div className="absolute inset-0 pointer-events-none">
                      {improvements.map((improvement, index) => (
                        <motion.div
                          key={index}
                          className="absolute w-12 h-12 border-2 border-green-400 rounded-lg animate-pulse"
                          style={{
                            top: `${20 + index * 15}%`,
                            left: `${10 + index * 8}%`
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle highlights */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowHighlights(!showHighlights)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass-dark border border-white/10 hover:border-purple-500/30 transition-colors"
            >
              {showHighlights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">{showHighlights ? 'Hide' : 'Show'} Improvements</span>
            </button>
          </div>
        </motion.div>

        {/* Improvements list */}
        <motion.div
          className="glass-dark rounded-2xl p-8 border border-purple-500/30 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
              {modificationsApplied ? 'Applied Modifications' : 'Key Improvements'}
            </h3>
            {modificationsApplied && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Applied</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getAppliedImprovements().map((improvement, index) => (
              <motion.div
                key={modificationsApplied ? `${improvement.area}_${improvement.type}` : index}
                className="flex items-start gap-3 p-4 rounded-xl glass border border-white/5 hover:border-purple-500/30 transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  modificationsApplied 
                    ? 'bg-green-500/20' 
                    : 'bg-purple-500/20'
                }`}>
                  <CheckCircle className={`w-5 h-5 ${
                    modificationsApplied 
                      ? 'text-green-400' 
                      : 'text-purple-400'
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">{improvement.area}</h4>
                  <p className="text-sm text-gray-400">{improvement.description}</p>
                  {modificationsApplied && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">Type:</span>
                      <span className="text-xs text-gray-400 capitalize">{improvement.type}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Change Tracker Section */}
        {imageId && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ChangeTracker 
              imageId={imageId} 
              originalImage={originalImage}
              onChangesUpdate={handleChangesUpdate}
            />
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            onClick={handleCopyCSS}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold btn-glow hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {copiedCode ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>CSS Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy CSS Code</span>
              </>
            )}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          </motion.button>

          <motion.button
            onClick={handleRegenerate}
            disabled={isRegenerating || Object.keys(appliedChanges).length === 0}
            className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
              isRegenerating || Object.keys(appliedChanges).length === 0
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
            }`}
            whileHover={{ scale: (isRegenerating || Object.keys(appliedChanges).length === 0) ? 1 : 1.02 }}
            whileTap={{ scale: (isRegenerating || Object.keys(appliedChanges).length === 0) ? 1 : 0.98 }}
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-5 h-5" />
                <span>Regenerate with Changes</span>
              </>
            )}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          </motion.button>

          <motion.button
            className="px-8 py-4 glass-dark rounded-xl font-semibold border border-white/10 hover:border-purple-500/30 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5 inline mr-2" />
            Download Design
          </motion.button>

          <motion.button
            onClick={onReset}
            className="px-8 py-4 glass-dark rounded-xl font-semibold border border-white/10 hover:border-purple-500/30 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Start Over
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ComparisonSection;
