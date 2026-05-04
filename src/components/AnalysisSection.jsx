import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Zap, Eye, Palette, Layout, CheckCircle } from 'lucide-react';

const AnalysisSection = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    { icon: <Eye className="w-5 h-5" />, label: "Scanning UI elements" },
    { icon: <Palette className="w-5 h-5" />, label: "Analyzing color scheme" },
    { icon: <Layout className="w-5 h-5" />, label: "Evaluating layout structure" },
    { icon: <Brain className="w-5 h-5" />, label: "Processing with AI" },
    { icon: <CheckCircle className="w-5 h-5" />, label: "Generating insights" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(stepInterval);
  }, [analysisSteps.length]);

  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 py-20">
      <motion.div
        className="max-w-4xl w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">AI is Analyzing</span>
          </h2>
          <p className="text-xl text-gray-300">
            Our AI is examining your UI design to provide personalized recommendations
          </p>
        </motion.div>

        {/* Main analysis visualization */}
        <motion.div
          className="glass-dark rounded-3xl p-12 border border-purple-500/30 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent" />
          
          {/* Central AI brain visualization */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-8 relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-2 rounded-full bg-dark-bg flex items-center justify-center">
                <Brain className="w-16 h-16 text-purple-400" />
              </div>
              
              {/* Orbiting elements */}
              <motion.div
                className="absolute w-6 h-6 bg-cyan-400 rounded-full"
                animate={{ 
                  rotate: 360,
                  x: [0, 60, 0, -60, 0],
                  y: [-60, 0, 60, 0, -60]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-4 h-4 bg-blue-400 rounded-full"
                animate={{ 
                  rotate: -360,
                  x: [0, -40, 0, 40, 0],
                  y: [40, 0, -40, 0, 40]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* Progress bar */}
            <div className="w-full max-w-md mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-3">
                <span>Analysis Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-dark-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Current step indicator */}
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  key={currentStep}
                  className="flex items-center gap-3 px-6 py-3 rounded-full glass-dark border border-purple-500/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-purple-400">
                    {analysisSteps[currentStep].icon}
                  </div>
                  <span className="text-white font-medium">
                    {analysisSteps[currentStep].label}
                  </span>
                </motion.div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-between max-w-lg mx-auto">
                {analysisSteps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <motion.div
                      className={`
                        w-3 h-3 rounded-full transition-all duration-300
                        ${index <= currentStep 
                          ? 'bg-purple-500 shadow-lg shadow-purple-500/50' 
                          : 'bg-gray-600'
                        }
                      `}
                      animate={index === currentStep ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                      transition={{ duration: 0.5, repeat: index === currentStep ? 1 : 0 }}
                    />
                    {index < analysisSteps.length - 1 && (
                      <div
                        className={`
                          w-16 h-0.5 mx-2 transition-all duration-300
                          ${index < currentStep ? 'bg-purple-500' : 'bg-gray-700'}
                        `}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="glass-dark rounded-xl p-6 border border-white/5 text-center"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Computer Vision</h3>
            <p className="text-gray-400 text-sm">Advanced algorithms detect UI patterns and elements</p>
          </motion.div>

          <motion.div
            className="glass-dark rounded-xl p-6 border border-white/5 text-center"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">Get results in seconds, not minutes</p>
          </motion.div>

          <motion.div
            className="glass-dark rounded-xl p-6 border border-white/5 text-center"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-400 text-sm">Machine learning models trained on thousands of designs</p>
          </motion.div>
        </motion.div>

        {/* Loading dots animation */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Analyzing</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AnalysisSection;
