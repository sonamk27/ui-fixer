import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Home, Upload, BarChart3, Eye, MessageCircle } from 'lucide-react';

const Navigation = ({ currentSection, onReset }) => {
  const navItems = [
    { id: 'landing', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload', icon: <Upload className="w-4 h-4" /> },
    { id: 'results', label: 'Results', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'comparison', label: 'Compare', icon: <Eye className="w-4 h-4" /> }
  ];

  const getSectionIndex = (section) => {
    const sectionMap = {
      'landing': 0,
      'upload': 1,
      'analysis': 1,
      'results': 2,
      'comparison': 3
    };
    return sectionMap[section] || 0;
  };

  const currentIndex = getSectionIndex(currentSection);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AI UI Fixer</span>
          </motion.div>

          {/* Progress indicator */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item, index) => (
              <div key={item.id} className="flex items-center">
                <motion.div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300
                    ${index <= currentIndex 
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50' 
                      : 'bg-gray-700 text-gray-400'
                    }
                  `}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {item.icon}
                </motion.div>
                {index < navItems.length - 1 && (
                  <motion.div
                    className={`
                      w-12 h-0.5 mx-1 transition-all duration-300
                      ${index < currentIndex ? 'bg-purple-500' : 'bg-gray-700'}
                    `}
                    initial={{ width: 0 }}
                    animate={{ width: index < currentIndex ? 48 : 12 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              className="p-2 rounded-lg glass-dark border border-white/10 hover:border-purple-500/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle className="w-5 h-5" />
            </motion.button>
            
            {currentSection !== 'landing' && (
              <motion.button
                onClick={onReset}
                className="px-4 py-2 rounded-lg glass-dark border border-white/10 hover:border-purple-500/30 transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                New Analysis
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
