const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Image Analysis Service
 * Provides UI improvement suggestions using AI or simulated analysis
 */
class AnalysisService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiModel = process.env.OPENAI_MODEL || 'gpt-4-vision-preview';
  }

  /**
   * Analyze uploaded image for UI improvements
   * @param {string} imageId - ID of the uploaded image
   * @param {string} analysisType - Type of analysis (basic, detailed, comprehensive)
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeImage(imageId, analysisType = 'basic') {
    try {
      // Get image metadata
      const imageMetadata = await this.getImageMetadata(imageId);
      if (!imageMetadata) {
        throw new Error('Image not found');
      }

      // Check if using real AI or simulation
      if (this.openaiApiKey && this.openaiApiKey !== 'your_openai_api_key_here') {
        return await this.analyzeWithAI(imageMetadata, analysisType);
      } else {
        return await this.analyzeWithSimulation(imageMetadata, analysisType);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  /**
   * Analyze image using OpenAI Vision API
   */
  async analyzeWithAI(imageMetadata, analysisType) {
    try {
      // Read image file and convert to base64
      const imageBuffer = await fs.readFile(imageMetadata.uploadPath);
      const base64Image = imageBuffer.toString('base64');

      // Create prompt based on analysis type
      const prompt = this.createAIPrompt(analysisType);

      // Call OpenAI Vision API
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.openaiModel,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageMetadata.mimetype};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Parse AI response
      const aiResponse = response.data.choices[0].message.content;
      return this.parseAIResponse(aiResponse, imageMetadata.id, analysisType);

    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to simulation if AI fails
      console.log('Falling back to simulation analysis...');
      return await this.analyzeWithSimulation(imageMetadata, analysisType);
    }
  }

  /**
   * Analyze image using simulated logic
   */
  async analyzeWithSimulation(imageMetadata, analysisType) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Generate realistic UI improvement suggestions based on analysis type
    const suggestions = this.generateSimulatedSuggestions(analysisType);

    return {
      id: uuidv4(),
      imageId: imageMetadata.id,
      analysisType: analysisType,
      analyzedAt: new Date().toISOString(),
      processingTime: Math.floor(Math.random() * 3000) + 1000,
      confidence: Math.floor(Math.random() * 20) + 75, // 75-95% confidence
      suggestions: suggestions,
      metadata: {
        filename: imageMetadata.filename,
        originalName: imageMetadata.originalName,
        fileSize: imageMetadata.size,
        analysisMethod: 'simulation'
      }
    };
  }

  /**
   * Create AI prompt based on analysis type
   */
  createAIPrompt(analysisType) {
    const basePrompt = 'Analyze this UI screenshot and provide specific improvement suggestions. ';
    
    const prompts = {
      basic: basePrompt + 'Focus on obvious issues like color contrast, alignment, and spacing. Provide 3-5 key improvements.',
      detailed: basePrompt + 'Provide comprehensive analysis covering layout, typography, colors, spacing, and user experience. Include specific CSS-like suggestions.',
      comprehensive: basePrompt + 'Provide an in-depth UX audit covering accessibility, responsive design, user flow, visual hierarchy, and micro-interactions. Suggest specific implementation details.'
    };

    return prompts[analysisType] || prompts.basic;
  }

  /**
   * Parse AI response into structured format
   */
  parseAIResponse(aiResponse, imageId, analysisType) {
    // This is a simplified parser - in production, you'd want more sophisticated parsing
    return {
      id: uuidv4(),
      imageId: imageId,
      analysisType: analysisType,
      analyzedAt: new Date().toISOString(),
      processingTime: 1500,
      confidence: 90,
      suggestions: {
        colorImprovements: this.extractSuggestions(aiResponse, ['color', 'contrast', 'palette']),
        spacingIssues: this.extractSuggestions(aiResponse, ['spacing', 'padding', 'margin', 'gap']),
        typographyFixes: this.extractSuggestions(aiResponse, ['font', 'text', 'typography', 'readability']),
        layoutProblems: this.extractSuggestions(aiResponse, ['layout', 'alignment', 'grid', 'flex']),
        uxSuggestions: this.extractSuggestions(aiResponse, ['user', 'interaction', 'button', 'navigation'])
      },
      metadata: {
        analysisMethod: 'ai',
        rawResponse: aiResponse
      }
    };
  }

  /**
   * Extract suggestions from AI response based on keywords
   */
  extractSuggestions(response, keywords) {
    const suggestions = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        suggestions.push({
          issue: line.trim(),
          suggestion: this.extractSuggestion(line)
        });
      }
    });

    return suggestions.length > 0 ? suggestions : this.getDefaultSuggestions(keywords[0]);
  }

  /**
   * Extract suggestion from a line of text
   */
  extractSuggestion(line) {
    // Simple extraction - in production, use more sophisticated NLP
    if (line.toLowerCase().includes('improve') || line.toLowerCase().includes('increase')) {
      return line.trim();
    }
    return `Consider: ${line.trim()}`;
  }

  /**
   * Generate simulated suggestions based on analysis type
   */
  generateSimulatedSuggestions(analysisType) {
    const baseSuggestions = {
      colorImprovements: [
        {
          issue: 'Low contrast between text and background',
          suggestion: 'Increase text brightness to #ffffff or darken background to improve readability (WCAG AA compliance)'
        },
        {
          issue: 'Inconsistent color palette',
          suggestion: 'Establish a consistent color palette with primary, secondary, and accent colors to improve brand recognition'
        },
        {
          issue: 'Vibrant colors causing eye strain',
          suggestion: 'Use more muted tones for large background areas and save vibrant colors for call-to-action elements'
        }
      ],
      spacingIssues: [
        {
          issue: 'Insufficient padding between elements',
          suggestion: 'Add 16-24px padding between components for better visual separation and "breathing room"'
        },
        {
          issue: 'Uneven margins causing misalignment',
          suggestion: 'Standardize margins using a consistent 8pt grid scale (8px, 16px, 24px, 32px)'
        },
        {
          issue: 'Elements feel cramped in the viewport',
          suggestion: 'Increase whitespace around the main content container to focus user attention'
        }
      ],
      typographyFixes: [
        {
          issue: 'Inconsistent font sizes across components',
          suggestion: 'Use a modular type scale: 16px for body, 18px for sub-headings, 32px for main headings'
        },
        {
          issue: 'Poor line height for long text blocks',
          suggestion: 'Set line-height to 1.6 for body text to improve scanning and reading speed'
        },
        {
          issue: 'Lack of typographic hierarchy',
          suggestion: 'Use font weight (Bold/Medium) and color (Primary/Secondary) to distinguish between headings and body text'
        }
      ],
      layoutProblems: [
        {
          issue: 'Poor visual hierarchy',
          suggestion: 'Use size, color, and spacing to create a clear "Z-pattern" or "F-pattern" flow for users'
        },
        {
          issue: 'Misaligned elements in the grid',
          suggestion: 'Use CSS Flexbox or Grid for pixel-perfect alignment across all screen sizes'
        },
        {
          issue: 'Content is not balanced',
          suggestion: 'Adjust element positioning to create better visual balance between left and right columns'
        }
      ],
      uxSuggestions: [
        {
          issue: 'Missing interactive states',
          suggestion: 'Add hover, active, and focus states to all buttons and links for better tactile feedback'
        },
        {
          issue: 'Unclear call-to-action (CTA)',
          suggestion: 'Make primary buttons stand out with a contrasting color and subtle drop shadow'
        },
        {
          issue: 'Navigation is difficult to find',
          suggestion: 'Ensure the navigation menu is consistently placed and use recognizable icons'
        }
      ]
    };

    // Helper to shuffle and pick a random number of items
    const getVariety = (arr, count = 2) => {
      return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
    };

    if (analysisType === 'basic') {
      return Object.keys(baseSuggestions).reduce((acc, key) => {
        acc[key] = getVariety(baseSuggestions[key], 1);
        return acc;
      }, {});
    }

    const suggestions = Object.keys(baseSuggestions).reduce((acc, key) => {
      acc[key] = getVariety(baseSuggestions[key], 2);
      return acc;
    }, {});

    if (analysisType === 'comprehensive') {
      suggestions.accessibilityIssues = [
        {
          issue: 'Missing ARIA labels',
          suggestion: 'Add aria-label or aria-labelledby to icon-only buttons for screen reader support'
        },
        {
          issue: 'Small tap targets',
          suggestion: 'Ensure all interactive elements have a minimum size of 44x44px for touch accessibility'
        }
      ];
      suggestions.responsiveDesign = [
        {
          issue: 'Layout breaks on mobile',
          suggestion: 'Implement a mobile-first approach using media queries for common breakpoints'
        },
        {
          issue: 'Fixed pixel widths',
          suggestion: 'Convert fixed widths to relative units like % or rem for better responsiveness'
        }
      ];
    }

    return suggestions;
  }

  /**
   * Get default suggestions for a category
   */
  getDefaultSuggestions(category) {
    const defaults = {
      color: [{ issue: 'Color contrast issues', suggestion: 'Check WCAG contrast ratios' }],
      spacing: [{ issue: 'Inconsistent spacing', suggestion: 'Use a consistent spacing scale' }],
      font: [{ issue: 'Typography issues', suggestion: 'Establish a clear type hierarchy' }],
      layout: [{ issue: 'Layout alignment problems', suggestion: 'Use CSS Grid or Flexbox' }],
      user: [{ issue: 'UX issues', suggestion: 'Improve user interaction feedback' }]
    };
    return defaults[category] || [{ issue: 'General UI issue', suggestion: 'Review design principles' }];
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(imageId) {
    try {
      const metadataPath = path.join(__dirname, '../../uploads/metadata', `${imageId}.json`);
      const metadata = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(metadata);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Save analysis results
   */
  async saveAnalysisResults(analysisId, results) {
    try {
      const resultsDir = path.join(__dirname, '../../uploads/analysis');
      await fs.mkdir(resultsDir, { recursive: true });
      
      const resultsPath = path.join(resultsDir, `${analysisId}.json`);
      await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('Error saving analysis results:', error);
      throw error;
    }
  }

  /**
   * Get analysis results
   */
  async getAnalysisResults(analysisId) {
    try {
      const resultsPath = path.join(__dirname, '../../uploads/analysis', `${analysisId}.json`);
      const results = await fs.readFile(resultsPath, 'utf8');
      return JSON.parse(results);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }
}

module.exports = new AnalysisService();
