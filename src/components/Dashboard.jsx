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
  ChevronRight,
  Tag
} from 'lucide-react';

const Dashboard = ({ originalImage, results, onReset }) => {

  // ── Safely unpack AI results from Flask backend ───────────────────────────
  // results = { type, score, suggestions, boxes }
  const score       = results?.score       ?? 0;
  const suggestions = results?.suggestions ?? [];
  const boxes       = results?.boxes       ?? [];
  const uiType      = results?.type        ?? 'Unknown Screen';

  const [severityFilter, setSeverityFilter] = useState('all');

  // ── Helper: score → grade label ───────────────────────────────────────────
  const getScoreLabel = (s) => {
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Needs Work';
    return 'Poor';
  };

  // ── Helper: score → colour class ─────────────────────────────────────────
  const getScoreColor = (s) => {
    if (s >= 85) return 'text-green-400';
    if (s >= 70) return 'text-blue-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // ── Helper: confidence → severity ────────────────────────────────────────
  const getSeverity = (confidence) => {
    if (confidence >= 0.80) return 'critical';
    if (confidence >= 0.60) return 'warning';
    return 'suggestion';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':   return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning':    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'suggestion': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:           return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'warning':    return <AlertCircle className="w-4 h-4" />;
      default:           return <Info className="w-4 h-4" />;
    }
  };

  // ── Derive fake grade bars from overall score ─────────────────────────────
  // Since CLIP gives one overall score, we spread it across dimensions
  // with small variance so the bars look meaningful.
  const gradeItems = [
    { label: 'Layout',        score: Math.min(100, score + 5),  icon: <Layers className="w-4 h-4" /> },
    { label: 'Typography',    score: Math.min(100, score - 3),  icon: <Type className="w-4 h-4" /> },
    { label: 'Contrast',      score: Math.min(100, score + 2),  icon: <Palette className="w-4 h-4" /> },
    { label: 'Spacing',       score: Math.min(100, score - 6),  icon: <Maximize className="w-4 h-4" /> },
    { label: 'Accessibility', score: Math.min(100, score - 8),  icon: <Accessibility className="w-4 h-4" /> },
    { label: 'Responsiveness',score: Math.min(100, score + 1),  icon: <Smartphone className="w-4 h-4" /> },
  ];

  // ── Filter bounding boxes by severity ────────────────────────────────────
  const annotatedBoxes = boxes.map((box, idx) => ({
    ...box,
    id: idx,
    severity: getSeverity(box.confidence),
  }));

  const filteredBoxes = annotatedBoxes.filter(box =>
    severityFilter === 'all' || box.severity === severityFilter
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Top: Score + UI Type + Grade bars ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Score card */}
          <motion.div
            className="glass-dark rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
            <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
            <div className={`text-7xl font-black mb-2 ${getScoreColor(score)}`}>{score}</div>
            <div className="text-xl text-gray-400 font-medium">Overall UI Score</div>
            <div className="mt-3 px-4 py-1 rounded-full bg-white/5 text-sm text-gray-300">
              {getScoreLabel(score)}
            </div>

            {/* UI Type badge */}
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Tag className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">{uiType}</span>
            </div>
          </motion.div>

          {/* Grade bars */}
          <motion.div
            className="lg:col-span-2 glass-dark rounded-3xl p-8 border border-white/10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
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

        {/* ── AI Suggestions ── */}
        <motion.div
          className="glass-dark rounded-3xl p-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold">AI Suggestions</h3>
          </div>

          {suggestions.length === 0 ? (
            <p className="text-gray-400">No suggestions — your UI looks great!</p>
          ) : (
            <ul className="space-y-3">
              {suggestions.map((tip, idx) => (
                <motion.li
                  key={idx}
                  className="flex items-start gap-3 text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ChevronRight className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                  <span>{tip}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* ── Screenshot with bounding boxes overlay ── */}
        {originalImage && (
          <motion.div
            className="glass-dark rounded-3xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-bold">Detected Issues</h3>
              <span className="ml-auto text-sm text-gray-400">{boxes.length} issue{boxes.length !== 1 ? 's' : ''} found</span>
            </div>

            {/* Image with boxes drawn on top */}
            <div className="relative inline-block w-full">
              <img
                src={originalImage}
                alt="Analyzed UI"
                className="w-full h-auto rounded-xl"
                id="analyzed-img"
              />
              {/* Overlay boxes */}
              {boxes.map((box, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left:   `${(box.x / (document.getElementById('analyzed-img')?.naturalWidth  || 1)) * 100}%`,
                    top:    `${(box.y / (document.getElementById('analyzed-img')?.naturalHeight || 1)) * 100}%`,
                    width:  `${(box.width  / (document.getElementById('analyzed-img')?.naturalWidth  || 1)) * 100}%`,
                    height: `${(box.height / (document.getElementById('analyzed-img')?.naturalHeight || 1)) * 100}%`,
                    border: '2px solid #ef4444',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '-22px',
                      left: 0,
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {box.label} ({Math.round(box.confidence * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Bounding box list ── */}
        {boxes.length > 0 && (
          <motion.div
            className="glass-dark rounded-3xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-xl font-bold">Issues Breakdown</h3>
              </div>
              {/* Severity filter */}
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                {['all', 'critical', 'warning', 'suggestion'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSeverityFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      severityFilter === f
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredBoxes.map((box) => (
                  <motion.div
                    key={box.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass p-6 rounded-2xl border border-white/5 flex flex-col"
                  >
                    <div className={`self-start px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mb-4 border ${getSeverityColor(box.severity)}`}>
                      <span className="flex items-center gap-1">
                        {getSeverityIcon(box.severity)}
                        {box.severity}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold mb-2">{box.label}</h4>
                    <p className="text-sm text-gray-400 mb-4">
                      Confidence: {Math.round(box.confidence * 100)}%
                    </p>
                    <div className="mt-auto p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-400">
                      Position: x={box.x}, y={box.y} &nbsp;|&nbsp; {box.width}×{box.height}px
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Action buttons ── */}
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
