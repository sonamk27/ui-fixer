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
    const { report, redesignedHtml } = this.generateSimulatedSuggestions(analysisType);

    return {
      id: uuidv4(),
      imageId: imageMetadata.id,
      analysisType: analysisType,
      analyzedAt: new Date().toISOString(),
      processingTime: Math.floor(Math.random() * 3000) + 1000,
      confidence: Math.floor(Math.random() * 20) + 75, // 75-95% confidence
      report: report,
      redesignedHtml: redesignedHtml,
      metadata: {
        filename: imageMetadata.filename,
        originalName: imageMetadata.originalName,
        fileSize: imageMetadata.size,
        analysisMethod: 'simulation'
      }
    };
  }

  createAIPrompt(analysisType) {
    return `You are an expert UI/UX designer and frontend developer.

The user has uploaded a screenshot of their website or app UI.

Your job has TWO parts:

─────────────────────────────────────────
PART 1 — VISUAL ANALYSIS REPORT
─────────────────────────────────────────
Analyze the uploaded UI screenshot and return a structured JSON report with:

1. "overallScore": A number from 0–100 rating the UI quality overall.

2. "grades": An object scoring these 6 dimensions (each 0–100):
   - layout, typography, colorContrast, spacing, accessibility, responsiveness

3. "annotations": An array of issues found on the screenshot. Each annotation:
   {
     "id": "issue_1",
     "zone": "header | hero | nav | form | footer | card | button | general",
     "severity": "critical | warning | suggestion",
     "title": "Short issue title",
     "description": "What the problem is and why it matters",
     "fix": "Exact, actionable fix with specific values (e.g. change #ccc to #333, add 16px padding)"
   }

4. "summary": 2–3 sentence plain-English verdict for beginners.

5. "developerNotes": 2–3 technical notes for developers (CSS properties, WCAG rules, etc.).

6. "designerNotes": 2–3 visual/aesthetic notes for designers (grid, hierarchy, visual weight, etc.).

─────────────────────────────────────────
PART 2 — REDESIGNED UI CODE
─────────────────────────────────────────
After the JSON, output a COMPLETE redesigned version of the uploaded UI as a single self-contained HTML file.

Rules for the redesigned code:
- Use only HTML + Tailwind CSS (via CDN) + vanilla JS if needed
- Fix ALL the issues you annotated in Part 1
- Keep the same page purpose and content — just improve the design
- Use a clean modern design system: consistent spacing (8pt grid), proper contrast ratios (WCAG AA), clear visual hierarchy
- Add a top banner inside the page that says: "✨ UI Fixer — Redesigned Version" so users know it's the improved output
- The HTML must be fully functional and render correctly in a browser with no external dependencies except Tailwind CDN

─────────────────────────────────────────
OUTPUT FORMAT (strictly follow this):
─────────────────────────────────────────
Return your response in this exact structure:

===JSON_START===
{ ...the full JSON report object... }
===JSON_END===

===HTML_START===
<!DOCTYPE html>
...full redesigned HTML file...
===HTML_END===

Do not add any text or explanation outside these delimiters.`;
  }

  parseAIResponse(aiResponse, imageId, analysisType) {
    try {
      const jsonMatch = aiResponse.match(/===JSON_START===([\s\S]*?)===JSON_END===/);
      const htmlMatch = aiResponse.match(/===HTML_START===([\s\S]*?)===HTML_END===/);

      if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON block');
      }

      const report = JSON.parse(jsonMatch[1].trim());
      const redesignedHtml = htmlMatch ? htmlMatch[1].trim() : '<html><body>Redesign failed to generate</body></html>';

      return {
        id: uuidv4(),
        imageId: imageId,
        analysisType: analysisType,
        analyzedAt: new Date().toISOString(),
        processingTime: 2500,
        confidence: 95,
        report: report,
        redesignedHtml: redesignedHtml,
        metadata: {
          analysisMethod: 'ai',
          rawResponse: aiResponse
        }
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw error;
    }
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

  generateSimulatedSuggestions(analysisType) {
    const randomScore = Math.floor(Math.random() * 31) + 60; // 60-90
    const report = {
      overallScore: randomScore,
      grades: {
        layout: Math.floor(Math.random() * 31) + 60,
        typography: Math.floor(Math.random() * 31) + 60,
        colorContrast: Math.floor(Math.random() * 31) + 60,
        spacing: Math.floor(Math.random() * 31) + 60,
        accessibility: Math.floor(Math.random() * 31) + 60,
        responsiveness: Math.floor(Math.random() * 31) + 60
      },
      annotations: [
        {
          id: "issue_1",
          zone: "button",
          severity: "critical",
          title: "Low Color Contrast",
          description: "The primary button text has poor contrast against the background.",
          fix: "Change background color to #1D4ED8 and text to #FFFFFF."
        },
        {
          id: "issue_2",
          zone: "general",
          severity: "warning",
          title: "Inconsistent Spacing",
          description: "Margins and paddings vary across sections, creating a disjointed feel.",
          fix: "Apply a standardized 8px-based spacing system."
        },
        {
          id: "issue_3",
          zone: "general",
          severity: "suggestion",
          title: "Add Hover States",
          description: "Interactive elements lack visual feedback when hovered.",
          fix: "Add :hover styles with a subtle brightness shift."
        },
        {
          id: "issue_4",
          zone: "hero",
          severity: "warning",
          title: "Poor Visual Hierarchy",
          description: "The main headline doesn't stand out enough from the subtext.",
          fix: "Increase headline font-weight to 800 and size to 4rem."
        }
      ].sort(() => 0.5 - Math.random()).slice(0, 3),
      summary: "Your UI has a solid foundation but suffers from accessibility and spacing inconsistencies. Improving contrast and standardizing gaps will greatly enhance professional feel.",
      developerNotes: [
        "Use Tailwind 'space-y' utilities for consistent vertical rhythm.",
        "Check WCAG contrast ratios for all custom color palettes."
      ],
      designerNotes: [
        "Stick to a 4pt/8pt grid system for all layout dimensions.",
        "Increase visual hierarchy by making headings bolder and larger."
      ]
    };

    const dummyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>UI Fixer - Redesigned Version</title>
</head>
<body class="bg-gray-50 text-gray-900 font-sans">
    <div class="bg-blue-600 text-white py-2 px-4 text-center font-bold">
        ✨ UI Fixer — Redesigned Version
    </div>
    
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div class="text-2xl font-bold text-blue-600">BrandName</div>
        <div class="space-x-6 hidden md:flex">
            <a href="#" class="hover:text-blue-600 transition">Features</a>
            <a href="#" class="hover:text-blue-600 transition">Pricing</a>
            <a href="#" class="hover:text-blue-600 transition">About</a>
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition font-medium">Get Started</button>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto mt-16 px-6 pb-20">
        <div class="text-center">
            <h1 class="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">Build your future with confidence</h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-10">Our platform helps you manage projects and collaborate with your team in real-time, all in one place.</p>
            <div class="flex justify-center space-x-4">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-bold transition shadow-lg hover:shadow-xl">Start Free Trial</button>
                <button class="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-3 rounded-xl text-lg font-bold transition">Watch Demo</button>
            </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mt-24">
            <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 class="text-xl font-bold mb-3">Lightning Fast</h3>
                <p class="text-gray-600">Optimized for speed so you can get things done without waiting.</p>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <div class="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 class="text-xl font-bold mb-3">Secure by Default</h3>
                <p class="text-gray-600">Your data is encrypted and protected with industry standards.</p>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 class="text-xl font-bold mb-3">Team Friendly</h3>
                <p class="text-gray-600">Built for teams to collaborate seamlessly across the globe.</p>
            </div>
        </div>
    </main>
</body>
</html>`;

    return { report, redesignedHtml: dummyHtml };
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
  /**
   * Save redesigned HTML results
   */
  async saveRedesignedHtml(imageId, html) {
    try {
      const redesignedDir = path.join(__dirname, '../../uploads/redesigned');
      await fs.mkdir(redesignedDir, { recursive: true });
      
      const filePath = path.join(redesignedDir, `${imageId}.html`);
      await fs.writeFile(filePath, html);
    } catch (error) {
      console.error('Error saving redesigned HTML:', error);
      throw error;
    }
  }
}

module.exports = new AnalysisService();
