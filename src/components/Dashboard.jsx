import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, BarChart3, FileText, AlertCircle, Info,
  Layers, Type, Palette, Maximize, Accessibility,
  Smartphone, ChevronRight, Tag, Eye, MousePointer, AlignLeft,
} from 'lucide-react';

const ScoreCircle = ({ score, label, icon, delay = 0 }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const getColor = (s) => {
    if (s >= 80) return { stroke: '#4ade80', text: 'text-green-400' };
    if (s >= 60) return { stroke: '#60a5fa', text: 'text-blue-400' };
    if (s >= 40) return { stroke: '#facc15', text: 'text-yellow-400' };
    return { stroke: '#f87171', text: 'text-red-400' };
  };
  const colors = getColor(score);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/8"
    >
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <motion.circle
            cx="44" cy="44" r={radius} fill="none"
            stroke={colors.stroke} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${colors.stroke}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black ${colors.text}`}>{Math.round(score)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-gray-300 text-xs font-semibold">
        <span className="text-gray-400">{icon}</span>
        <span>{label}</span>
      </div>
    </motion.div>
  );
};

const SeverityBadge = ({ severity }) => {
  const config = {
    high:   { label: 'Critical',   cls: 'text-red-400 bg-red-400/10 border-red-400/30' },
    medium: { label: 'Warning',    cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
    low:    { label: 'Suggestion', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  }[severity] ?? { label: severity, cls: 'text-gray-400 bg-gray-400/10 border-gray-400/30' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${config.cls}`}>
      {config.label}
    </span>
  );
};

const Dashboard = ({ originalImage, results, onReset }) => {
  const overallScore    = results?.overall_score   ?? results?.score       ?? 0;
  const suggestions     = results?.suggestions     ?? [];
  const boxes           = results?.boxes           ?? [];
  const uiType          = results?.ui_type         ?? results?.type        ?? 'Unknown Screen';
  const uiConfidence    = results?.ui_type_confidence ?? null;
  const dimensionScores = results?.dimension_scores ?? null;
  const errors          = results?.errors          ?? [];

  const [severityFilter, setSeverityFilter] = useState('all');

  const getScoreLabel = (s) => {
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Needs Work';
    return 'Poor';
  };

  const getScoreColor = (s) => {
    if (s >= 85) return 'text-green-400';
    if (s >= 70) return 'text-blue-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSeverityFromConf = (confidence) => {
    if (confidence >= 0.80) return 'high';
    if (confidence >= 0.60) return 'medium';
    return 'low';
  };

  const getSeverityCardColor = (sev) => ({
    high:   'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    low:    'text-blue-400 bg-blue-400/10 border-blue-400/20',
  }[sev] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/20');

  const dimensionConfig = {
    visual_hierarchy: { label: 'Hierarchy',   icon: <Layers className="w-3.5 h-3.5" /> },
    color_contrast:   { label: 'Contrast',    icon: <Palette className="w-3.5 h-3.5" /> },
    whitespace:       { label: 'Whitespace',  icon: <Maximize className="w-3.5 h-3.5" /> },
    typography:       { label: 'Typography',  icon: <Type className="w-3.5 h-3.5" /> },
    alignment:        { label: 'Alignment',   icon: <AlignLeft className="w-3.5 h-3.5" /> },
    cta_clarity:      { label: 'CTA Clarity', icon: <MousePointer className="w-3.5 h-3.5" /> },
    consistency:      { label: 'Consistency', icon: <Eye className="w-3.5 h-3.5" /> },
    accessibility:    { label: 'A11y',        icon: <Accessibility className="w-3.5 h-3.5" /> },
  };

  const fallbackDimensions = {
    layout:        { score: Math.min(100, overallScore + 5), label: 'Layout',        icon: <Layers className="w-3.5 h-3.5" /> },
    typography:    { score: Math.min(100, overallScore - 3), label: 'Typography',    icon: <Type className="w-3.5 h-3.5" /> },
    contrast:      { score: Math.min(100, overallScore + 2), label: 'Contrast',      icon: <Palette className="w-3.5 h-3.5" /> },
    spacing:       { score: Math.min(100, overallScore - 6), label: 'Spacing',       icon: <Maximize className="w-3.5 h-3.5" /> },
    accessibility: { score: Math.min(100, overallScore - 8), label: 'Accessibility', icon: <Accessibility className="w-3.5 h-3.5" /> },
    responsive:    { score: Math.min(100, overallScore + 1), label: 'Responsive',    icon: <Smartphone className="w-3.5 h-3.5" /> },
  };

  const scoreCircleData = dimensionScores
    ? Object.entries(dimensionScores).map(([key, score]) => ({
        key, score,
        label: dimensionConfig[key]?.label ?? key,
        icon:  dimensionConfig[key]?.icon  ?? <BarChart3 className="w-3.5 h-3.5" />,
      }))
    : Object.entries(fallbackDimensions).map(([key, val]) => ({
        key, score: val.score, label: val.label, icon: val.icon,
      }));

  const annotatedBoxes = boxes.map((box, idx) => ({
    ...box, id: idx, severity: getSeverityFromConf(box.confidence),
  }));

  const filteredBoxes = annotatedBoxes.filter(box =>
    severityFilter === 'all' || box.severity === severityFilter
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Overall Score + Dimension Circles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="glass-dark rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
            <div className="relative w-36 h-36 mb-4">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <motion.circle
                  cx="72" cy="72" r="60" fill="none"
                  stroke={overallScore >= 80 ? '#4ade80' : overallScore >= 60 ? '#60a5fa' : overallScore >= 40 ? '#facc15' : '#f87171'}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 60}
                  initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 60 - (overallScore / 100) * 2 * Math.PI * 60 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-400 mb-1" />
                <span className={`text-4xl font-black ${getScoreColor(overallScore)}`}>{Math.round(overallScore)}</span>
              </div>
            </div>
            <div className="text-lg text-gray-400 font-medium">Overall UI Score</div>
            <div className="mt-2 px-4 py-1 rounded-full bg-white/5 text-sm text-gray-300 font-semibold">
              {getScoreLabel(overallScore)}
            </div>
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Tag className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">{uiType.replace(/_/g, ' ')}</span>
              {uiConfidence && <span className="text-xs text-purple-400/70">({Math.round(uiConfidence)}%)</span>}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-2 glass-dark rounded-3xl p-8 border border-white/10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold">Design Dimensions</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {scoreCircleData.map((item, idx) => (
                <ScoreCircle key={item.key} score={item.score} label={item.label} icon={item.icon} delay={idx * 0.08} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Errors cards */}
        {errors.length > 0 && (
          <motion.div
            className="glass-dark rounded-3xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-bold">Detected Issues</h3>
              <span className="ml-auto text-sm text-gray-400">{errors.length} issue{errors.length !== 1 ? 's' : ''} found</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {errors.map((err, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`p-5 rounded-2xl border flex flex-col gap-3 ${getSeverityCardColor(err.severity)}`}
                >
                  <div className="flex items-center justify-between">
                    <SeverityBadge severity={err.severity} />
                    <span className="text-xs font-bold opacity-70">{Math.round(err.score)}/100</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug">{err.message}</p>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: err.severity === 'high' ? '#f87171' : err.severity === 'medium' ? '#facc15' : '#60a5fa' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${err.score}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.07 + 0.3 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Suggestions */}
        <motion.div
          className="glass-dark rounded-3xl p-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold">AI Suggestions</h3>
            {suggestions.length > 0 && <span className="ml-auto text-xs text-gray-500">{suggestions.length} tips</span>}
          </div>
          {suggestions.length === 0 ? (
            <p className="text-gray-400">No suggestions — your UI looks great! 🎉</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((tip, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/8 hover:border-white/15 transition-all"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <ChevronRight className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 leading-relaxed">{tip}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Screenshot — no bounding boxes */}
        {originalImage && (
          <motion.div
            className="glass-dark rounded-3xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold">Uploaded Screenshot</h3>
            </div>
            <img
              src={originalImage}
              alt="Analyzed UI"
              className="w-full h-auto rounded-xl"
            />
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/20"
          >
            New Analysis
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
