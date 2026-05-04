import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Layout, 
  Type, 
  Lightbulb, 
  Download, 
  Copy, 
  Eye, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const ResultsDashboard = ({ originalImage, results, onRedesign }) => {
  const [activeTab, setActiveTab] = useState('colors');
  const [copiedItem, setCopiedItem] = useState(null);

  const tabs = [
    { id: 'colors', label: 'Colors', icon: <Palette className="w-4 h-4" />, count: results.colorImprovements.length },
    { id: 'spacing', label: 'Spacing', icon: <Layout className="w-4 h-4" />, count: results.spacingIssues.length },
    { id: 'typography', label: 'Typography', icon: <Type className="w-4 h-4" />, count: results.typographyFixes.length },
    { id: 'ux', label: 'UX', icon: <Lightbulb className="w-4 h-4" />, count: results.uxSuggestions.length }
  ];

  const tabContent = {
    colors: results.colorImprovements,
    spacing: results.spacingIssues,
    typography: results.typographyFixes,
    ux: results.uxSuggestions
  };

  const handleCopyCSS = (suggestion) => {
    const cssCode = generateCSS(suggestion);
    navigator.clipboard.writeText(cssCode);
    setCopiedItem(suggestion);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const generateCSS = (suggestion) => {
    // Simple CSS generation based on suggestion type
    if (suggestion.includes('color')) {
      return `color: #ffffff; /* High contrast */`;
    } else if (suggestion.includes('padding')) {
      return `padding: 16px; /* Consistent spacing */`;
    } else if (suggestion.includes('font-size')) {
      return `font-size: 16px; /* Readable text size */`;
    }
    return `/* ${suggestion} */`;
  };

  const getSeverityIcon = (issue) => {
    if (issue.toLowerCase().includes('low') || issue.toLowerCase().includes('insufficient')) {
      return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
    if (issue.toLowerCase().includes('missing') || issue.toLowerCase().includes('unclear')) {
      return <AlertCircle className="w-4 h-4 text-orange-400" />;
    }
    return <Info className="w-4 h-4 text-blue-400" />;
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Analysis Results</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Here are the AI-powered recommendations to improve your UI design
          </p>
        </motion.div>

        {/* Main dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Original image preview */}
          <motion.div
            className="glass-dark rounded-2xl p-6 border border-purple-500/30"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Original Design
              </h3>
              <span className="text-sm text-gray-400">Your uploaded UI</span>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-dark-surface">
              <img
                src={originalImage}
                alt="Original UI design"
                className="w-full h-auto max-h-96 object-contain"
              />
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full glass-dark border border-white/10">
                <span className="text-xs text-gray-300">Original</span>
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Object.values(results).flat().length}
                </div>
                <div className="text-xs text-gray-400">Total Issues</div>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Object.values(results).flat().length}
                </div>
                <div className="text-xs text-gray-400">Suggestions</div>
              </div>
            </div>
          </motion.div>

          {/* Right: AI suggestions */}
          <motion.div
            className="glass-dark rounded-2xl p-6 border border-purple-500/30"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Tabs */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">AI Suggestions</h3>
              <div className="flex gap-1 p-1 glass rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200
                      ${activeTab === tab.id 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <motion.div
              className="space-y-4 max-h-96 overflow-y-auto pr-2"
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tabContent[activeTab].map((item, index) => (
                <motion.div
                  key={index}
                  className="glass rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getSeverityIcon(item.issue)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{item.issue}</h4>
                      <p className="text-sm text-gray-400 mb-3">{item.suggestion}</p>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyCSS(item.suggestion)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors text-sm"
                        >
                          {copiedItem === item.suggestion ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy CSS
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={onRedesign}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold btn-glow hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Generate Redesign</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          </motion.button>

          <motion.button
            className="px-8 py-4 glass-dark rounded-xl font-semibold border border-white/10 hover:border-purple-500/30 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5 inline mr-2" />
            Download Report
          </motion.button>
        </motion.div>

        {/* Summary cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="glass-dark rounded-xl p-6 border border-white/5 text-center">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Palette className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{results.colorImprovements.length}</div>
            <div className="text-sm text-gray-400">Color Issues</div>
          </div>

          <div className="glass-dark rounded-xl p-6 border border-white/5 text-center">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Layout className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{results.spacingIssues.length}</div>
            <div className="text-sm text-gray-400">Spacing Issues</div>
          </div>

          <div className="glass-dark rounded-xl p-6 border border-white/5 text-center">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Type className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{results.typographyFixes.length}</div>
            <div className="text-sm text-gray-400">Typography Issues</div>
          </div>

          <div className="glass-dark rounded-xl p-6 border border-white/5 text-center">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{results.uxSuggestions.length}</div>
            <div className="text-sm text-gray-400">UX Improvements</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ResultsDashboard;
