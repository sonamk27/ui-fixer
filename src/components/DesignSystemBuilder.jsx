import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Maximize, 
  Layers, 
  Download, 
  Copy, 
  Eye,
  Code,
  BookOpen,
  Settings,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const DesignSystemBuilder = ({ designSystem, originalImage }) => {
  const [activeTab, setActiveTab] = useState('colors');
  const [copiedSection, setCopiedSection] = useState(null);

  if (!designSystem) {
    return (
      <div className="glass-dark rounded-3xl p-8 border border-white/10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Generating Design System...</p>
            <p className="text-xs text-gray-500 mt-2">Debug: designSystem is {designSystem}</p>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const ColorPalette = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          Color Palette
        </h4>
        <button 
          onClick={() => copyToClipboard(designSystem.implementation.css, 'css')}
          className="flex items-center gap-2 px-3 py-1 glass rounded-lg text-sm hover:bg-white/10 transition"
        >
          {copiedSection === 'css' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copiedSection === 'css' ? 'Copied!' : 'Copy CSS'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(designSystem.colorPalette).map(([colorName, shades]) => (
          <div key={colorName} className="space-y-2">
            <div className="text-xs font-medium text-gray-400 capitalize">{colorName}</div>
            <div className="space-y-1">
              {Object.entries(shades).slice(3, 9).map(([shade, value]) => (
                <div key={shade} className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border border-white/20"
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-xs text-gray-500">{shade}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Typography = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Type className="w-5 h-5 text-blue-400" />
        Typography Scale
      </h4>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-400 mb-3">Font Families</div>
          <div className="space-y-2">
            {Object.entries(designSystem.typography.fontFamily).map(([category, fonts]) => (
              <div key={category} className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm font-medium capitalize">{category}</span>
                <span className="text-xs text-gray-400">{fonts.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-gray-400 mb-3">Font Sizes</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(designSystem.typography.fontSize).map(([size, value]) => (
              <div key={size} className="p-3 glass rounded-lg">
                <div className="text-xs text-gray-400 mb-1">{size}</div>
                <div style={{ fontSize: value }} className="font-medium">Aa</div>
                <div className="text-xs text-gray-500">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Spacing = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Maximize className="w-5 h-5 text-green-400" />
        Spacing System
      </h4>
      
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {Object.entries(designSystem.spacing).map(([size, value]) => (
          <div key={size} className="text-center">
            <div 
              className="w-full bg-blue-500/20 border border-blue-500/30 rounded mb-2"
              style={{ height: value }}
            />
            <div className="text-xs text-gray-400">{size}</div>
            <div className="text-xs text-gray-500">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const Components = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Layers className="w-5 h-5 text-orange-400" />
        Component Library
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {designSystem.components.map((component, index) => (
          <motion.div
            key={index}
            className="glass rounded-xl p-4 border border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <h5 className="font-semibold">{component.name}</h5>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                Component
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{component.description}</p>
            
            {component.props && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-500 mb-1">Props:</div>
                <div className="flex flex-wrap gap-1">
                  {component.props.map(prop => (
                    <span key={prop} className="text-xs px-2 py-1 bg-white/5 rounded">
                      {prop}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {component.variants && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-500 mb-1">Variants:</div>
                <div className="flex flex-wrap gap-1">
                  {component.variants.map(variant => (
                    <span key={variant} className="text-xs px-2 py-1 bg-white/5 rounded">
                      {variant}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {component.accessibility && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Accessibility:</div>
                <div className="space-y-1">
                  {Object.entries(component.accessibility).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-gray-400">{key}: {value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  const Principles = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-purple-400" />
        Design Principles
      </h4>
      
      <div className="space-y-4">
        {designSystem.principles.map((principle, index) => (
          <motion.div
            key={index}
            className="glass rounded-xl p-4 border border-white/10"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-semibold">{principle.title}</h5>
              <span className={`text-xs px-2 py-1 rounded-full ${
                principle.priority === 'high' 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {principle.priority} priority
              </span>
            </div>
            <p className="text-sm text-gray-400">{principle.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const Implementation = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Code className="w-5 h-5 text-cyan-400" />
        Implementation
      </h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h5 className="font-medium text-gray-300">Getting Started</h5>
          <div className="space-y-2">
            {designSystem.implementation.guidelines.gettingStarted.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-blue-400 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h5 className="font-medium text-gray-300">Best Practices</h5>
          <div className="space-y-2">
            {designSystem.implementation.guidelines.bestPractices.map((practice, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span className="text-sm text-gray-400">{practice}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h5 className="font-medium text-gray-300">CSS Variables</h5>
        <div className="relative">
          <pre className="bg-black/40 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto">
            {designSystem.implementation.css}
          </pre>
          <button 
            onClick={() => copyToClipboard(designSystem.implementation.css, 'css-full')}
            className="absolute top-2 right-2 p-2 glass rounded-lg hover:bg-white/10 transition"
          >
            {copiedSection === 'css-full' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette, component: ColorPalette },
    { id: 'typography', label: 'Typography', icon: Type, component: Typography },
    { id: 'spacing', label: 'Spacing', icon: Maximize, component: Spacing },
    { id: 'components', label: 'Components', icon: Layers, component: Components },
    { id: 'principles', label: 'Principles', icon: BookOpen, component: Principles },
    { id: 'implementation', label: 'Implementation', icon: Code, component: Implementation }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ColorPalette;

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
              <Settings className="w-6 h-6 text-purple-400" />
              Design System Builder
            </h3>
            <p className="text-gray-400">
              {designSystem.name} v{designSystem.version} - {designSystem.description}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => copyToClipboard(JSON.stringify(designSystem, null, 2), 'system')}
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm font-bold hover:bg-white/10 transition"
            >
              {copiedSection === 'system' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Download className="w-4 h-4" />}
              {copiedSection === 'system' ? 'Copied!' : 'Export System'}
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'glass hover:bg-white/10 text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default DesignSystemBuilder;
