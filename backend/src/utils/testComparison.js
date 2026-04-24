/**
 * Test script for comparison functionality
 * Run this in browser console to test comparison system
 */

export async function testComparisonAPIs() {
  console.log('🧪 Testing Comparison APIs...\n');

  const baseURL = 'http://localhost:5000/api/comparison';

  // Test 1: Generate modified UI
  console.log('📋 Test 1: Generate Modified UI');
  try {
    const generateResponse = await fetch(`${baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalImageId: 'test_original_123',
        modifications: [
          {
            type: 'color',
            target: 'header',
            newValue: {
              color: '#ffffff',
              backgroundColor: '#667eea'
            },
            description: 'Improve header contrast'
          },
          {
            type: 'spacing',
            target: 'button',
            newValue: {
              padding: '16px',
              margin: '8px'
            },
            description: 'Increase button spacing'
          }
        ],
        comparisonType: 'detailed'
      })
    });

    if (generateResponse.ok) {
      const result = await generateResponse.json();
      console.log('✅ Generate Modified UI Success:', result);
    } else {
      console.error('❌ Generate Modified UI Failed:', generateResponse.status);
    }
  } catch (error) {
    console.error('❌ Generate Modified UI Error:', error);
  }

  // Test 2: Save comparison
  console.log('\n📋 Test 2: Save Comparison');
  try {
    const saveResponse = await fetch(`${baseURL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalImageId: 'test_original_123',
        modifiedImageUrl: '/uploads/modified_test.jpg',
        analysis: {
          colorImprovements: [
            { issue: 'Low contrast', suggestion: 'Increase text brightness' }
          ],
          spacingIssues: [
            { issue: 'Poor padding', suggestion: 'Add 16px padding' }
          ]
        },
        appliedModifications: [
          {
            type: 'color',
            target: 'header',
            newValue: { color: '#ffffff', backgroundColor: '#667eea' },
            description: 'Improved header contrast'
          }
        ]
      })
    });

    if (saveResponse.ok) {
      const result = await saveResponse.json();
      console.log('✅ Save Comparison Success:', result);
    } else {
      console.error('❌ Save Comparison Failed:', saveResponse.status);
    }
  } catch (error) {
    console.error('❌ Save Comparison Error:', error);
  }

  // Test 3: Get comparison
  console.log('\n📋 Test 3: Get Comparison');
  try {
    const getResponse = await fetch(`${baseURL}/test_comparison_123`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (getResponse.ok) {
      const result = await getResponse.json();
      console.log('✅ Get Comparison Success:', result);
    } else {
      console.error('❌ Get Comparison Failed:', getResponse.status);
    }
  } catch (error) {
    console.error('❌ Get Comparison Error:', error);
  }

  // Test 4: Get comparisons by original image
  console.log('\n📋 Test 4: Get Comparisons by Original');
  try {
    const getByOriginalResponse = await fetch(`${baseURL}/original/test_original_123`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (getByOriginalResponse.ok) {
      const result = await getByOriginalResponse.json();
      console.log('✅ Get Comparisons by Original Success:', result);
    } else {
      console.error('❌ Get Comparisons by Original Failed:', getByOriginalResponse.status);
    }
  } catch (error) {
    console.error('❌ Get Comparisons by Original Error:', error);
  }

  // Test 5: Get comparison chain
  console.log('\n📋 Test 5: Get Comparison Chain');
  try {
    const getChainResponse = await fetch(`${baseURL}/chain/test_original_123`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (getChainResponse.ok) {
      const result = await getChainResponse.json();
      console.log('✅ Get Comparison Chain Success:', result);
    } else {
      console.error('❌ Get Comparison Chain Failed:', getChainResponse.status);
    }
  } catch (error) {
    console.error('❌ Get Comparison Chain Error:', error);
  }

  // Test 6: Add feedback
  console.log('\n📋 Test 6: Add Feedback');
  try {
    const feedbackResponse = await fetch(`${baseURL}/test_comparison_123/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: 5,
        comments: 'Great comparison system! Very useful for UI improvements.',
        preferred: 'modified'
      })
    });

    if (feedbackResponse.ok) {
      const result = await feedbackResponse.json();
      console.log('✅ Add Feedback Success:', result);
    } else {
      console.error('❌ Add Feedback Failed:', feedbackResponse.status);
    }
  } catch (error) {
    console.error('❌ Add Feedback Error:', error);
  }

  // Test 7: Create new version
  console.log('\n📋 Test 7: Create New Version');
  try {
    const versionResponse = await fetch(`${baseURL}/test_comparison_123/version`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modifications: [
          {
            type: 'layout',
            target: 'container',
            newValue: {
              display: 'grid',
              flexDirection: 'column'
            },
            description: 'Switch to grid layout'
          }
        ],
        comparisonType: 'comprehensive'
      })
    });

    if (versionResponse.ok) {
      const result = await versionResponse.json();
      console.log('✅ Create New Version Success:', result);
    } else {
      console.error('❌ Create New Version Failed:', versionResponse.status);
    }
  } catch (error) {
    console.error('❌ Create New Version Error:', error);
  }

  // Test 8: Get statistics
  console.log('\n📋 Test 8: Get Statistics');
  try {
    const statsResponse = await fetch(`${baseURL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (statsResponse.ok) {
      const result = await statsResponse.json();
      console.log('✅ Get Statistics Success:', result);
    } else {
      console.error('❌ Get Statistics Failed:', statsResponse.status);
    }
  } catch (error) {
    console.error('❌ Get Statistics Error:', error);
  }

  console.log('\n🎉 All comparison API tests completed!');
  return true;
}

// Test data validation
export function testComparisonDataValidation() {
  console.log('🔍 Testing Comparison Data Validation...\n');

  const testCases = [
    {
      name: 'Valid comparison data',
      data: {
        originalImageId: 'test_123',
        modifiedImageUrl: '/uploads/modified.jpg',
        analysis: { colorImprovements: [] },
        appliedModifications: [{ type: 'color', target: 'header', newValue: {}, description: 'Test' }]
      },
      shouldPass: true
    },
    {
      name: 'Missing original image ID',
      data: {
        modifiedImageUrl: '/uploads/modified.jpg',
        analysis: { colorImprovements: [] },
        appliedModifications: []
      },
      shouldPass: false
    },
    {
      name: 'Invalid modification type',
      data: {
        originalImageId: 'test_123',
        modifiedImageUrl: '/uploads/modified.jpg',
        analysis: { colorImprovements: [] },
        appliedModifications: [{ type: 'invalid', target: 'header', newValue: {}, description: 'Test' }]
      },
      shouldPass: false
    },
    {
      name: 'Valid comprehensive comparison',
      data: {
        originalImageId: 'test_123',
        modifiedImageUrl: '/uploads/modified.jpg',
        analysis: {
          colorImprovements: [],
          spacingIssues: [],
          accessibilityIssues: [],
          responsiveDesign: []
        },
        appliedModifications: [
          { type: 'color', target: 'header', newValue: {}, description: 'Color fix' },
          { type: 'spacing', target: 'button', newValue: {}, description: 'Spacing fix' },
          { type: 'typography', target: 'text', newValue: {}, description: 'Typography fix' },
          { type: 'layout', target: 'container', newValue: {}, description: 'Layout fix' }
        ],
        comparisonType: 'comprehensive'
      },
      shouldPass: true
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\nTest ${index + 1}: ${testCase.name}`);
    console.log('Expected to pass:', testCase.shouldPass);
    
    // In a real implementation, you would validate against Joi schemas
    // For now, just check basic structure
    const hasRequired = testCase.data.originalImageId && 
                      testCase.data.modifiedImageUrl && 
                      testCase.data.analysis && 
                      testCase.data.appliedModifications;
    
    const passed = hasRequired === testCase.shouldPass;
    
    console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!passed) {
      if (!testCase.data.originalImageId) {
        console.log('  - Missing: originalImageId');
      }
      if (!testCase.data.modifiedImageUrl) {
        console.log('  - Missing: modifiedImageUrl');
      }
      if (!testCase.data.analysis) {
        console.log('  - Missing: analysis');
      }
      if (!testCase.data.appliedModifications) {
        console.log('  - Missing: appliedModifications');
      }
    }
  });

  console.log('\n🎉 Data validation tests completed!');
  return testCases;
}

// Test comparison chain logic
export function testComparisonChainLogic() {
  console.log('🔗 Testing Comparison Chain Logic...\n');

  const mockChain = [
    {
      id: 'comp_1',
      version: 1,
      originalImage: { url: '/uploads/original.jpg' },
      modifiedImage: { url: '/uploads/modified_v1.jpg' },
      parentComparison: null,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'comp_2',
      version: 2,
      originalImage: { url: '/uploads/original.jpg' },
      modifiedImage: { url: '/uploads/modified_v2.jpg' },
      parentComparison: 'comp_1',
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 'comp_3',
      version: 3,
      originalImage: { url: '/uploads/original.jpg' },
      modifiedImage: { url: '/uploads/modified_v3.jpg' },
      parentComparison: 'comp_2',
      createdAt: '2024-01-03T00:00:00Z'
    }
  ];

  console.log('Mock comparison chain:');
  mockChain.forEach((comp, index) => {
    console.log(`  Version ${comp.version}: ${comp.modifiedImage.url}`);
    console.log(`    Parent: ${comp.parentComparison ? `Version ${comp.parentComparison}` : 'None'}`);
    console.log(`    Created: ${comp.createdAt}`);
  });

  // Test chain logic
  const latestVersion = mockChain.reduce((latest, current) => 
    current.version > latest.version ? current : latest
  , mockChain[0]);

  console.log(`\nLatest version: ${latestVersion.version}`);
  console.log(`Total versions: ${mockChain.length}`);

  // Test version hierarchy
  const hasCorrectHierarchy = mockChain.every(comp => 
    !comp.parentComparison || 
    mockChain.find(parent => parent.id === comp.parentComparison)
  );

  console.log(`Version hierarchy correct: ${hasCorrectHierarchy ? '✅' : '❌'}`);

  return mockChain;
}

// Run all tests
export function runAllComparisonTests() {
  console.log('Running All Comparison Tests...\n');
  
  const results = {
    apiTests: await testComparisonAPIs(),
    dataValidation: testComparisonDataValidation(),
    chainLogic: testComparisonChainLogic()
  };

  console.log('\n🎉 All comparison tests completed!');
  console.log('Results summary:', results);

  return results;
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  window.testComparisonAPIs = testComparisonAPIs;
  window.testComparisonDataValidation = testComparisonDataValidation;
  window.testComparisonChainLogic = testComparisonChainLogic;
  window.runAllComparisonTests = runAllComparisonTests;

  console.log('Comparison test functions available:');
  console.log('- testComparisonAPIs() - Test all comparison APIs');
  console.log('- testComparisonDataValidation() - Test data validation');
  console.log('- testComparisonChainLogic() - Test comparison chain logic');
  console.log('- runAllComparisonTests() - Run all tests');
}
