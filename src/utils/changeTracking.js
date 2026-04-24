/**
 * Change Tracking System for UI Modifications
 * Tracks and persists changes made to UI designs
 */

export class ChangeTracker {
  constructor() {
    this.changes = new Map(); // Store changes by image ID
    this.modificationHistory = new Map(); // Track modification history
  }

  /**
   * Initialize tracking for a new image
   */
  initializeTracking(imageId, originalImage) {
    this.changes.set(imageId, {
      originalImage,
      modifications: [],
      appliedChanges: {},
      lastModified: new Date().toISOString()
    });
  }

  /**
   * Add a modification change
   */
  addModification(imageId, modification) {
    const tracking = this.changes.get(imageId);
    if (!tracking) {
      console.error('No tracking found for image:', imageId);
      return false;
    }

    const change = {
      id: Date.now().toString(),
      type: modification.type, // 'color', 'spacing', 'typography', 'layout'
      target: modification.target, // 'header', 'button', 'text', etc.
      originalValue: modification.originalValue,
      newValue: modification.newValue,
      description: modification.description,
      timestamp: new Date().toISOString(),
      applied: false
    };

    tracking.modifications.push(change);
    tracking.lastModified = new Date().toISOString();

    // Update applied changes
    const key = `${modification.type}_${modification.target}`;
    tracking.appliedChanges[key] = modification.newValue;

    this.saveToLocalStorage(imageId);
    return change;
  }

  /**
   * Get all modifications for an image
   */
  getModifications(imageId) {
    const tracking = this.changes.get(imageId);
    return tracking ? tracking.modifications : [];
  }

  /**
   * Get applied changes for regeneration
   */
  getAppliedChanges(imageId) {
    const tracking = this.changes.get(imageId);
    return tracking ? tracking.appliedChanges : {};
  }

  /**
   * Clear all modifications for an image
   */
  clearModifications(imageId) {
    const tracking = this.changes.get(imageId);
    if (tracking) {
      tracking.modifications = [];
      tracking.appliedChanges = {};
      tracking.lastModified = new Date().toISOString();
      this.saveToLocalStorage(imageId);
    }
  }

  /**
   * Remove a specific modification
   */
  removeModification(imageId, modificationId) {
    const tracking = this.changes.get(imageId);
    if (!tracking) return false;

    const index = tracking.modifications.findIndex(m => m.id === modificationId);
    if (index !== -1) {
      const removed = tracking.modifications.splice(index, 1)[0];
      
      // Update applied changes
      const key = `${removed.type}_${removed.target}`;
      delete tracking.appliedChanges[key];
      
      tracking.lastModified = new Date().toISOString();
      this.saveToLocalStorage(imageId);
      return true;
    }
    return false;
  }

  /**
   * Save tracking data to localStorage
   */
  saveToLocalStorage(imageId) {
    try {
      const tracking = this.changes.get(imageId);
      if (tracking) {
        const data = {
          ...tracking,
          originalImage: null // Don't store image data in localStorage
        };
        localStorage.setItem(`ui-fixer-changes-${imageId}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Load tracking data from localStorage
   */
  loadFromLocalStorage(imageId, originalImage) {
    try {
      const stored = localStorage.getItem(`ui-fixer-changes-${imageId}`);
      if (stored) {
        const data = JSON.parse(stored);
        this.changes.set(imageId, {
          ...data,
          originalImage, // Restore the current original image
          modifications: data.modifications || [],
          appliedChanges: data.appliedChanges || {}
        });
        return true;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return false;
  }

  /**
   * Generate CSS from applied changes
   */
  generateCSS(imageId) {
    const changes = this.getAppliedChanges(imageId);
    let css = '/* Generated CSS from UI modifications */\n';

    Object.entries(changes).forEach(([key, value]) => {
      const [type, target] = key.split('_');
      
      switch (type) {
        case 'color':
          css += this.generateColorCSS(target, value);
          break;
        case 'spacing':
          css += this.generateSpacingCSS(target, value);
          break;
        case 'typography':
          css += this.generateTypographyCSS(target, value);
          break;
        case 'layout':
          css += this.generateLayoutCSS(target, value);
          break;
      }
    });

    return css;
  }

  generateColorCSS(target, value) {
    return `
/* Color improvements for ${target} */
.${target} {
  color: ${value.color || '#ffffff'};
  background-color: ${value.backgroundColor || 'transparent'};
  border-color: ${value.borderColor || 'transparent'};
}
`;
  }

  generateSpacingCSS(target, value) {
    return `
/* Spacing improvements for ${target} */
.${target} {
  padding: ${value.padding || '16px'};
  margin: ${value.margin || '0'};
  gap: ${value.gap || '0'};
}
`;
  }

  generateTypographyCSS(target, value) {
    return `
/* Typography improvements for ${target} */
.${target} {
  font-size: ${value.fontSize || '16px'};
  line-height: ${value.lineHeight || '1.6'};
  font-weight: ${value.fontWeight || '400'};
}
`;
  }

  generateLayoutCSS(target, value) {
    return `
/* Layout improvements for ${target} */
.${target} {
  display: ${value.display || 'block'};
  flex-direction: ${value.flexDirection || 'row'};
  align-items: ${value.alignItems || 'stretch'};
  justify-content: ${value.justifyContent || 'flex-start'};
}
`;
  }

  /**
   * Export changes for API request
   */
  exportForAPI(imageId) {
    const tracking = this.changes.get(imageId);
    if (!tracking) return null;

    return {
      imageId,
      modifications: tracking.modifications,
      appliedChanges: tracking.appliedChanges,
      lastModified: tracking.lastModified
    };
  }
}

// Create singleton instance
export const changeTracker = new ChangeTracker();
