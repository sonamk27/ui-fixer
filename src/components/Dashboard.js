import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  BarChart3, 
  FileText, 
  AlertCircle, 
  Info,
  Layers,
  Type,
  Palette,
  Maximize,
  Accessibility,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import ImplementationPlan from './ImplementationPlan';

const Dashboard = ({ originalImage, results, onReset }) => {
  const { report, implementationPlan } = results;
  const [activeNoteTab, setActiveNoteTab] = useState('beginner');
  const [severityFilter, setSeverityFilter] = useState('all');

  const gradeItems = [
    { label: 'Layout', score: report.grades.layout, icon: <Layers className="w-4 h-4" /> },
    { label: 'Typography', score: report.grades.typography, icon: <Type className="w-4 h-4" /> },
    { label: 'Contrast', score: report.grades.colorContrast, icon: <Palette className="w-4 h-4" /> },
    { label: 'Spacing', score: report.grades.spacing, icon: <Maximize className="w-4 h-4" /> },
    { label: 'Accessibility', score: report.grades.accessibility, icon: <Accessibility className="w-4 h-4" /> },
    { label: 'Responsiveness', score: report.grades.responsiveness, icon: <Smartphone className="w-4 h-4" /> },
  ];

  const filteredAnnotations = report.annotations.filter(ann => 
    severityFilter === 'all' || ann.severity === severityFilter
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'suggestion': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'suggestion': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Section: Score and Grades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Card */}
          <motion.div 
            className="glass-dark rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
            <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
            <div className="text-7xl font-black gradient-text mb-2">{report.overallScore}</div>
            <div className="text-xl text-gray-400 font-medium">Overall UI Score</div>
            <div className="mt-4 px-4 py-1 rounded-full bg-white/5 text-sm text-gray-300">
              {report.overallScore >= 80 ? 'Excellent' : report.overallScore >= 60 ? 'Good' : 'Needs Work'}
            </div>
          </motion.div>

          {/* Grade Bars */}
          <motion.div 
            className="lg:col-span-2 glass-dark rounded-3xl p-8 border border-white/10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 1 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold">Design Dimensions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {gradeItems.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-300">
                      {item.icon} {item.label}
                    </span>
                    <span className="font-bold text-white">{item.score}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Summary and Tabs */}
        <motion.div 
          className="glass-dark rounded-3xl p-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold">Analysis Summary</h3>
          </div>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed italic">
            "{report.summary}"
          </p>
          
          {/* Tabs */}
          <div className="flex gap-4 border-b border-white/10 mb-6">
            {['beginner', 'dev', 'design'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveNoteTab(tab)}
                className={`pb-4 px-2 text-sm font-medium transition-all relative ${
                  activeNoteTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeNoteTab === tab && (
                  <motion.div 
                    layoutId="tabUnderline"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[100px]">
            <ul className="space-y-3">
              {(activeNoteTab === 'beginner' ? [report.summary] : 
                activeNoteTab === 'dev' ? report.developerNotes : 
                report.designerNotes).map((note, idx) => (
                <motion.li 
                  key={idx}
                  className="flex items-start gap-3 text-gray-400"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ChevronRight className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                  <span>{note}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Annotations List */}
        <motion.div 
          className="glass-dark rounded-3xl p-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-bold">Issues & Annotations</h3>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {['all', 'critical', 'warning', 'suggestion'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSeverityFilter(filter)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    severityFilter === filter 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAnnotations.map((ann) => (
                <motion.div
                  key={ann.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass p-6 rounded-2xl border border-white/5 flex flex-col"
                >
                  <div className={`self-start px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mb-4 border ${getSeverityColor(ann.severity)}`}>
                    <span className="flex items-center gap-1">
                      {getSeverityIcon(ann.severity)}
                      {ann.severity} — {ann.zone}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">{ann.title}</h4>
                  <p className="text-sm text-gray-400 mb-6 flex-grow">{ann.description}</p>
                  <div className="mt-auto p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Recommended Fix</div>
                    <div className="text-xs text-gray-200 leading-relaxed font-mono">{ann.fix}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Implementation Plan */}
        <ImplementationPlan 
          report={report} 
          originalImage={originalImage} 
          implementationPlan={implementationPlan}
        />
        
        {/* Action Buttons */}
        <motion.div 
          className="flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            New Analysis
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
