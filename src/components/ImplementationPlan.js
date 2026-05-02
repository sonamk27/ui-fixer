import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Copy,
  Target
} from 'lucide-react';

const ImplementationPlan = ({ report, originalImage, implementationPlan }) => {
  const [activePhase, setActivePhase] = useState('immediate');
  const [copiedItem, setCopiedItem] = useState(null);

  if (!report) {
    return (
      <div className="glass-dark rounded-3xl p-8 border border-white/10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading Implementation Plan...</p>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text, item) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const generateCodeFix = (annotation) => {
    const fixes = {
      button: `/* Fix for ${annotation.title} */
.button {
  background-color: #1D4ED8;
  color: #FFFFFF;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.button:hover {
  background-color: #1E40AF;
  transform: translateY(-1px);
}

.button:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}`,
      form: `/* Fix for ${annotation.title} */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}`,
      nav: `/* Fix for ${annotation.title} */
.nav-link {
  padding: 0.5rem 1rem;
  color: #6B7280;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link:focus {
  color: #3B82F6;
  background-color: #F3F4F6;
}

.nav-link:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}`
    };
    
    return fixes[annotation.zone] || `/* Fix for ${annotation.title} */
/* ${annotation.fix} */
.element {
  /* Apply the recommended fix here */
}`;
  };

  const calculateEffort = (annotation) => {
    const efforts = {
      button: "Low",
      form: "Medium", 
      nav: "Medium",
      hero: "High",
      card: "Medium",
      general: "Low"
    };
    return efforts[annotation.zone] || "Medium";
  };

  const generateStaticPhases = (report) => {
    // Fallback static implementation plan for backward compatibility
    return {
      immediate: {
        title: "Immediate Fixes (Critical Issues)",
        icon: AlertCircle,
        color: "red",
        priority: "high",
        estimatedTime: "2-4 hours",
        description: `Address critical issues identified in the analysis (${report.overallScore}/100).`,
        tasks: report.annotations
          .filter(ann => ann.severity === 'critical')
          .map(ann => ({
            id: ann.id,
            title: ann.title,
            description: ann.description,
            fix: ann.fix,
            zone: ann.zone,
            code: generateCodeFix(ann),
            effort: calculateEffort(ann)
          }))
      },
      short: {
        title: "Short-term Improvements (1-2 weeks)",
        icon: Clock,
        color: "yellow",
        priority: "medium",
        estimatedTime: "1-2 weeks",
        description: `Implement medium-priority improvements (${report.overallScore}/100).`,
        tasks: report.annotations
          .filter(ann => ann.severity === 'warning')
          .map(ann => ({
            id: ann.id,
            title: ann.title,
            description: ann.description,
            fix: ann.fix,
            zone: ann.zone,
            code: generateCodeFix(ann),
            effort: calculateEffort(ann)
          }))
      },
      long: {
        title: "Long-term Enhancements (1-2 months)",
        icon: Target,
        color: "blue",
        priority: "low",
        estimatedTime: "1-2 months",
        description: `Add advanced features and optimizations (${report.overallScore}/100).`,
        tasks: report.annotations
          .filter(ann => ann.severity === 'suggestion')
          .map(ann => ({
            id: ann.id,
            title: ann.title,
            description: ann.description,
            fix: ann.fix,
            zone: ann.zone,
            code: generateCodeFix(ann),
            effort: calculateEffort(ann)
          }))
      }
    };
  };

  // Use dynamic implementation plan from backend, fallback to static if not available
  const phases = implementationPlan || generateStaticPhases(report);
  
  const currentPhase = phases[activePhase];
  const PhaseIcon = currentPhase.icon;

  const getEffortColor = (effort) => {
    switch(effort) {
      case 'Low': return 'text-green-400 bg-green-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'High': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <motion.div 
      className="glass-dark rounded-3xl p-8 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-purple-400" />
              Implementation Plan
            </h3>
            <p className="text-gray-400">
              Step-by-step guide to improve your UI based on analysis results
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => copyToClipboard(JSON.stringify(phases, null, 2), 'plan')}
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm font-bold hover:bg-white/10 transition"
            >
              {copiedItem === 'plan' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Download className="w-4 h-4" />}
              {copiedItem === 'plan' ? 'Copied!' : 'Export Plan'}
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(phases).map(([key, phase]) => (
            <button
              key={key}
              onClick={() => setActivePhase(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activePhase === key 
                  ? 'bg-blue-600 text-white' 
                  : 'glass hover:bg-white/10 text-gray-300'
              }`}
            >
              <phase.icon className="w-4 h-4" />
              {phase.title.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 glass rounded-xl border border-white/10">
              <PhaseIcon className={`w-8 h-8 text-${currentPhase.color}-400`} />
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{currentPhase.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentPhase.estimatedTime}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    currentPhase.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    currentPhase.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {currentPhase.priority} priority
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {currentPhase.tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  className="glass rounded-xl p-6 border border-white/10"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h5 className="font-semibold text-lg mb-2">{task.title}</h5>
                      <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                          {task.zone}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getEffortColor(task.effort)}`}>
                          {task.effort} effort
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(task.code, task.id)}
                      className="p-2 glass rounded-lg hover:bg-white/10 transition"
                    >
                      {copiedItem === task.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-300 mb-2">Recommended Fix:</div>
                      <div className="p-3 bg-black/40 rounded-lg text-sm text-gray-200">
                        {task.fix}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-300 mb-2">Implementation Code:</div>
                      <div className="relative">
                        <pre className="bg-black/40 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto">
                          <code>{task.code}</code>
                        </pre>
                        <button 
                          onClick={() => copyToClipboard(task.code, `code-${task.id}`)}
                          className="absolute top-2 right-2 p-2 glass rounded-lg hover:bg-white/10 transition"
                        >
                          {copiedItem === `code-${task.id}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ImplementationPlan;
