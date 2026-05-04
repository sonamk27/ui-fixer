import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Move, Type, Grid } from 'lucide-react';

/**
 * ModificationOverlay Component
 * Shows visual overlays for applied changes on the comparison image
 */
const ModificationOverlay = ({ appliedChanges, imageDimensions }) => {
  if (!appliedChanges || Object.keys(appliedChanges).length === 0) {
    return null;
  }

  // Calculate overlay positions based on change types
  const getOverlayPosition = (changeKey, index) => {
    const positions = {
      color_header: { top: '10%', left: '50%' },
      color_button: { top: '60%', left: '30%' },
      color_text: { top: '40%', left: '50%' },
      spacing_header: { top: '15%', left: '45%', width: '60%', height: '15%' },
      spacing_button: { top: '55%', left: '25%', width: '20%', height: '12%' },
      spacing_content: { top: '35%', left: '15%', width: '70%', height: '40%' },
      typography_header: { top: '12%', left: '50%' },
      typography_text: { top: '45%', left: '50%' },
      layout_container: { top: '25%', left: '10%', width: '80%', height: '60%' },
      layout_flex: { top: '35%', left: '20%', width: '60%', height: '30%' }
    };

    const basePosition = positions[changeKey] || {
      top: `${20 + (index * 15)}%`,
      left: `${10 + (index * 10)}%`
    };

    return basePosition;
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'color': return <Palette className="w-4 h-4" />;
      case 'spacing': return <Move className="w-4 h-4" />;
      case 'typography': return <Type className="w-4 h-4" />;
      case 'layout': return <Grid className="w-4 h-4" />;
      default: return null;
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'color': return 'border-blue-400 bg-blue-400/20';
      case 'spacing': return 'border-green-400 bg-green-400/20';
      case 'typography': return 'border-purple-400 bg-purple-400/20';
      case 'layout': return 'border-orange-400 bg-orange-400/20';
      default: return 'border-gray-400 bg-gray-400/20';
    }
  };

  const renderOverlay = (changeKey, change, index) => {
    const [type, target] = changeKey.split('_');
    const position = getOverlayPosition(changeKey, index);
    const icon = getChangeIcon(type);
    const colorClass = getChangeColor(type);

    return (
      <motion.div
        key={changeKey}
        className={`absolute border-2 ${colorClass} rounded-lg pointer-events-none`}
        style={{
          top: position.top,
          left: position.left,
          width: position.width || 'auto',
          height: position.height || 'auto',
          transform: 'translate(-50%, -50%)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ delay: 0.5 + index * 0.1 }}
      >
        {/* Icon and label */}
        <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${colorClass.replace('border-', 'bg-').replace('/20', '/60')}`}>
          {icon}
          <span>{target}</span>
        </div>

        {/* Animated pulse effect */}
        <motion.div
          className={`absolute inset-0 border-2 ${colorClass.replace('border-', 'bg-').replace('/20', '/40')} rounded-lg`}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Change details tooltip */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
          {getChangeDescription(type, target, change)}
        </div>
      </motion.div>
    );
  };

  const getChangeDescription = (type, target, change) => {
    const descriptions = {
      color: `Color: ${change.color || '#ffffff'}`,
      spacing: `Padding: ${change.padding || '16px'}`,
      typography: `Font: ${change.fontSize || '16px'}`,
      layout: `Display: ${change.display || 'flex'}`
    };
    return descriptions[type] || 'Modified';
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Object.entries(appliedChanges).map(([changeKey, change], index) => 
        renderOverlay(changeKey, change, index)
      )}
    </div>
  );
};

export default ModificationOverlay;
