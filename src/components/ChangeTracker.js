import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Save, 
  Eye, 
  EyeOff,
  Palette,
  Move,
  Type,
  Grid
} from 'lucide-react';
import { changeTracker } from '../utils/changeTracking';

const ChangeTracker = ({ imageId, originalImage, onChangesUpdate }) => {
  const [modifications, setModifications] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [newModification, setNewModification] = useState({
    type: 'color',
    target: '',
    description: '',
    newValue: {}
  });

  useEffect(() => {
    if (imageId) {
      // Load existing modifications
      changeTracker.loadFromLocalStorage(imageId, originalImage);
      const existingMods = changeTracker.getModifications(imageId);
      setModifications(existingMods);
    }
  }, [imageId, originalImage]);

  const handleAddModification = () => {
    if (!newModification.target || !newModification.description) {
      alert('Please fill in all fields');
      return;
    }

    const modification = {
      type: newModification.type,
      target: newModification.target,
      description: newModification.description,
      newValue: newModification.newValue,
      originalValue: getOriginalValue(newModification.type, newModification.target)
    };

    const added = changeTracker.addModification(imageId, modification);
    if (added) {
      const updatedMods = changeTracker.getModifications(imageId);
      setModifications(updatedMods);
      onChangesUpdate && onChangesUpdate(changeTracker.getAppliedChanges(imageId));
      
      // Reset form
      setNewModification({
        type: 'color',
        target: '',
        description: '',
        newValue: {}
      });
    }
  };

  const handleRemoveModification = (modificationId) => {
    changeTracker.removeModification(imageId, modificationId);
    const updatedMods = changeTracker.getModifications(imageId);
    setModifications(updatedMods);
    onChangesUpdate && onChangesUpdate(changeTracker.getAppliedChanges(imageId));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all modifications?')) {
      changeTracker.clearModifications(imageId);
      setModifications([]);
      onChangesUpdate && onChangesUpdate({});
    }
  };

  const getOriginalValue = (type, target) => {
    // In a real app, this would analyze the original image
    // For now, return placeholder values
    switch (type) {
      case 'color':
        return { color: '#333333', backgroundColor: '#ffffff' };
      case 'spacing':
        return { padding: '8px', margin: '0' };
      case 'typography':
        return { fontSize: '14px', lineHeight: '1.4' };
      case 'layout':
        return { display: 'block', flexDirection: 'column' };
      default:
        return {};
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'color': return <Palette className="w-4 h-4" />;
      case 'spacing': return <Move className="w-4 h-4" />;
      case 'typography': return <Type className="w-4 h-4" />;
      case 'layout': return <Grid className="w-4 h-4" />;
      default: return <Plus className="w-4 h-4" />;
    }
  };

  const renderModificationForm = () => {
    return (
      <div className="space-y-4 p-4 glass-dark rounded-xl border border-white/10">
        <h4 className="font-semibold text-white mb-3">Add New Modification</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={newModification.type}
              onChange={(e) => setNewModification({...newModification, type: e.target.value})}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500/30 focus:outline-none"
            >
              <option value="color">Color</option>
              <option value="spacing">Spacing</option>
              <option value="typography">Typography</option>
              <option value="layout">Layout</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Element</label>
            <input
              type="text"
              value={newModification.target}
              onChange={(e) => setNewModification({...newModification, target: e.target.value})}
              placeholder="e.g., header, button, text"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500/30 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={newModification.description}
            onChange={(e) => setNewModification({...newModification, description: e.target.value})}
            placeholder="Describe the change you want to make..."
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500/30 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">New Values</label>
          {renderValueInputs()}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddModification}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Modification
          </button>
        </div>
      </div>
    );
  };

  const renderValueInputs = () => {
    const { type } = newModification;
    
    switch (type) {
      case 'color':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="color"
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, color: e.target.value }
              })}
              className="w-full h-10 bg-white/5 border border-white/10 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              placeholder="Background color"
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, backgroundColor: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Border color"
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, borderColor: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
            />
          </div>
        );
      
      case 'spacing':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Padding"
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, padding: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Margin"
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, margin: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Gap"
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, gap: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
            />
          </div>
        );
      
      case 'typography':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Font size"
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, fontSize: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Line height"
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, lineHeight: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Font weight"
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, fontWeight: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
            />
          </div>
        );
      
      case 'layout':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <select
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, display: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="block">Block</option>
              <option value="flex">Flex</option>
              <option value="grid">Grid</option>
              <option value="inline">Inline</option>
            </select>
            <select
              onChange={(e) => setNewModification({
                ...newModification,
                newValue: { ...newModification.newValue, flexDirection: e.target.value }
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
            </select>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-purple-400" />
          Change Tracking
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 glass-dark rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {modifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 glass-dark rounded-lg border border-white/10 hover:border-red-500/30 transition-colors text-red-400"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modifications count */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>{modifications.length} modification{modifications.length !== 1 ? 's' : ''} tracked</span>
      </div>

      {/* Modifications list */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {renderModificationForm()}
            
            {modifications.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-white">Current Modifications</h4>
                {modifications.map((mod, index) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 glass-dark rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        {getTypeIcon(mod.type)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{mod.target}</div>
                        <div className="text-sm text-gray-400">{mod.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveModification(mod.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChangeTracker;
