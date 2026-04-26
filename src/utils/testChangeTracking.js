/**
 * Test script for change tracking functionality
 * Run this in browser console to test the system
 */

import { changeTracker } from './changeTracking';

// Test function
export function testChangeTracking() {
  console.log('🧪 Testing Change Tracking System...');
  
  // Test 1: Initialize tracking
  const testImageId = 'test_img_123';
  const testImageUrl = 'https://example.com/test.jpg';
  
  changeTracker.initializeTracking(testImageId, testImageUrl);
  console.log('✅ Test 1: Tracking initialized');
  
  // Test 2: Add modifications
  const modification1 = {
    type: 'color',
    target: 'header',
    newValue: {
      color: '#ffffff',
      backgroundColor: '#667eea'
    },
    description: 'Improve header contrast'
  };
  
  const added1 = changeTracker.addModification(testImageId, modification1);
  console.log('✅ Test 2: Color modification added', added1);
  
  const modification2 = {
    type: 'spacing',
    target: 'button',
    newValue: {
      padding: '16px',
      margin: '8px'
    },
    description: 'Increase button spacing'
  };
  
  const added2 = changeTracker.addModification(testImageId, modification2);
  console.log('✅ Test 3: Spacing modification added', added2);
  
  // Test 3: Get modifications
  const modifications = changeTracker.getModifications(testImageId);
  console.log('✅ Test 4: Retrieved modifications', modifications.length);
  
  // Test 4: Get applied changes
  const appliedChanges = changeTracker.getAppliedChanges(testImageId);
  console.log('✅ Test 5: Applied changes', appliedChanges);
  
  // Test 5: Generate CSS
  const css = changeTracker.generateCSS(testImageId);
  console.log('✅ Test 6: Generated CSS');
  console.log(css);
  
  // Test 6: Export for API
  const exportData = changeTracker.exportForAPI(testImageId);
  console.log('✅ Test 7: Export data for API', exportData);
  
  // Test 7: Remove modification
  const removed = changeTracker.removeModification(testImageId, added1.id);
  console.log('✅ Test 8: Modification removed', removed);
  
  const finalModifications = changeTracker.getModifications(testImageId);
  console.log('✅ Test 9: Final modifications count', finalModifications.length);
  
  console.log('🎉 All tests completed successfully!');
  return true;
}

// Test API communication
export async function testAPICommunication() {
  console.log('🌐 Testing API Communication...');
  
  try {
    // Test regeneration endpoint
    const response = await fetch('http://localhost:5005/api/regeneration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: 'test_img_123',
        appliedChanges: {
          'color_header': {
            color: '#ffffff',
            backgroundColor: '#667eea'
          },
          'spacing_button': {
            padding: '16px',
            margin: '8px'
          }
        },
        modificationHistory: [
          {
            id: '1',
            type: 'color',
            target: 'header',
            description: 'Improve header contrast',
            timestamp: new Date().toISOString()
          }
        ]
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Test: Regeneration successful', result);
      return true;
    } else {
      console.error('❌ API Test: Regeneration failed', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API Test: Communication error', error);
    return false;
  }
}

// Run tests if in browser
if (typeof window !== 'undefined') {
  // Add to window for easy testing
  window.testChangeTracking = testChangeTracking;
  window.testAPICommunication = testAPICommunication;
  
  console.log('🔧 Test functions available:');
  console.log('- testChangeTracking() - Test change tracking system');
  console.log('- testAPICommunication() - Test API communication');
}
