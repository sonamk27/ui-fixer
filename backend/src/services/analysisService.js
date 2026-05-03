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
    // Generate more realistic and varied analysis results
    const baseScore = analysisType === 'comprehensive' ? 55 : analysisType === 'detailed' ? 65 : 75;
    const randomScore = baseScore + Math.floor(Math.random() * 20); // 55-95 range
    
    // Generate correlated grades that make sense together
    const layoutScore = randomScore + Math.floor(Math.random() * 11) - 5;
    const typographyScore = randomScore + Math.floor(Math.random() * 11) - 5;
    const colorContrastScore = Math.min(95, Math.max(40, randomScore + Math.floor(Math.random() * 11) - 8)); // Often lower
    const spacingScore = randomScore + Math.floor(Math.random() * 11) - 5;
    const accessibilityScore = Math.min(95, Math.max(40, colorContrastScore + Math.floor(Math.random() * 11) - 5)); // Correlated with contrast
    const responsivenessScore = randomScore + Math.floor(Math.random() * 11) - 3;
    
    const overallScore = Math.min(100, Math.max(40, randomScore));
    
    const report = {
      overallScore: overallScore,
      grades: {
        layout: Math.min(100, Math.max(40, layoutScore)),
        typography: Math.min(100, Math.max(40, typographyScore)),
        colorContrast: Math.min(100, Math.max(40, colorContrastScore)),
        spacing: Math.min(100, Math.max(40, spacingScore)),
        accessibility: Math.min(100, Math.max(40, accessibilityScore)),
        responsiveness: Math.min(100, Math.max(40, responsivenessScore))
      },
      annotations: this.generateRealisticAnnotations(overallScore, analysisType),
      summary: this.generateContextualSummary(overallScore, analysisType),
      developerNotes: this.generateDeveloperNotes(overallScore, analysisType),
      designerNotes: this.generateDesignerNotes(overallScore, analysisType)
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

    const designSystem = this.generateDesignSystem(report, analysisType);
    const implementationPlan = this.generateImplementationPlan(report.overallScore, report.annotations, analysisType);
    
    console.log('Generated design system:', JSON.stringify(designSystem, null, 2));
    console.log('Generated implementation plan:', Object.keys(implementationPlan));
    
    return { 
      report, 
      redesignedHtml: this.generateImprovedRedesign(report, analysisType),
      designSystem: designSystem,
      implementationPlan: implementationPlan
    };
  }

  generateRealisticAnnotations(score, analysisType) {
    console.log(`Generating annotations for score: ${score}, type: ${analysisType}`);
    
    const issuePool = [
      // Critical issues - for poor scores
      {
        id: "critical_1",
        zone: "button",
        severity: "critical",
        title: "Insufficient Color Contrast",
        description: `Primary action button fails WCAG AA contrast standards (${score}/100), making it difficult for users with visual impairments to identify.`,
        fix: "Increase contrast ratio to 4.5:1 minimum. Try #1D4ED8 background with #FFFFFF text, or use a darker text color."
      },
      {
        id: "critical_2",
        zone: "form",
        severity: "critical",
        title: "Missing Form Labels",
        description: `Input fields lack proper labels (${score}/100), preventing screen reader users from understanding form requirements.`,
        fix: "Add <label> elements with matching 'for' attributes to all form inputs. Include placeholder text as supplementary info only."
      },
      {
        id: "critical_3",
        zone: "nav",
        severity: "critical",
        title: "Keyboard Navigation Broken",
        description: `Navigation cannot be accessed using Tab key (${score}/100), excluding keyboard-only users from the interface.`,
        fix: "Ensure all interactive elements have tabindex='0' and visible focus states. Test navigation with Tab and Enter keys."
      },
      {
        id: "critical_4",
        zone: "general",
        severity: "critical",
        title: "Missing Alt Text",
        description: `Images lack descriptive alt text (${score}/100), breaking accessibility for screen reader users.`,
        fix: "Add meaningful alt attributes to all images. Use empty alt='' for decorative images only."
      },
      // Warning issues - for fair scores
      {
        id: "warning_1",
        zone: "hero",
        severity: "warning",
        title: "Weak Visual Hierarchy",
        description: `Headline and subheading have similar visual weight (${score}/100), making it hard to scan content quickly.`,
        fix: "Increase headline font-size to 3rem+ and font-weight to 800. Reduce subheading to 1.125rem with lighter weight."
      },
      {
        id: "warning_2",
        zone: "general",
        severity: "warning",
        title: "Inconsistent Spacing Scale",
        description: `Margins and paddings don't follow a consistent rhythm (${score}/100), creating visual dissonance.`,
        fix: "Implement an 8px grid system: use multiples of 8px (8, 16, 24, 32, 40, 48px) for all spacing."
      },
      {
        id: "warning_3",
        zone: "card",
        severity: "warning",
        title: "Poor Touch Targets",
        description: `Buttons and links are smaller than 44px (${score}/100), making them difficult to tap on mobile devices.`,
        fix: "Ensure minimum touch target size of 44x44px. Increase padding or use larger buttons for mobile-first design."
      },
      {
        id: "warning_4",
        zone: "general",
        severity: "warning",
        title: "Missing Hover States",
        description: `Interactive elements don't provide visual feedback on hover (${score}/100), reducing perceived responsiveness.`,
        fix: "Add :hover pseudo-classes with subtle transformations (scale: 1.02) or color changes. Use transition for smooth effects."
      },
      {
        id: "warning_5",
        zone: "typography",
        severity: "warning",
        title: "Poor Line Height",
        description: `Text has inadequate line height (${score}/100), reducing readability and creating visual strain.`,
        fix: "Set line-height to 1.5-1.6 for body text and 1.2-1.3 for headings. Use relative units (em, rem)."
      },
      // Suggestions - for good scores
      {
        id: "suggestion_1",
        zone: "general",
        severity: "suggestion",
        title: "Add Micro-interactions",
        description: `Interface lacks subtle animations (${score}/100) that enhance user engagement and provide feedback.`,
        fix: "Add CSS transitions for hover states, button clicks, and form submissions. Keep animations under 300ms."
      },
      {
        id: "suggestion_2",
        zone: "footer",
        severity: "suggestion",
        title: "Enhanced Footer Content",
        description: `Footer could provide more value (${score}/100) with additional navigation and trust signals.`,
        fix: "Add quick links, contact info, social media, and trust badges (SSL, payment methods, certifications)."
      },
      {
        id: "suggestion_3",
        zone: "general",
        severity: "suggestion",
        title: "Loading States",
        description: `Users see blank screens during data loading (${score}/100), leading to perceived slow performance.`,
        fix: "Add skeleton screens or loading spinners for async operations. Use shimmer effects for content loading."
      },
      {
        id: "suggestion_4",
        zone: "performance",
        severity: "suggestion",
        title: "Optimize Images",
        description: `Images could be better optimized for performance (${score}/100) to improve load times.`,
        fix: "Compress images using WebP format, implement lazy loading, and use responsive images with srcset."
      },
      {
        id: "suggestion_5",
        zone: "accessibility",
        severity: "suggestion",
        title: "Enhanced Focus Management",
        description: `Focus management could be improved (${score}/100) for better keyboard navigation experience.`,
        fix: "Implement focus trapping in modals, skip links for navigation, and logical tab order throughout the interface."
      }
    ];

    // Enhanced score-based issue selection with granular ranges
    let selectedIssues = [];
    const issueCount = analysisType === 'comprehensive' ? 6 : analysisType === 'detailed' ? 4 : 3;
    
    if (score < 65) {
      // Poor scores (65 and below) - mostly critical issues
      selectedIssues = [
        ...issuePool.filter(i => i.severity === 'critical').slice(0, 3),
        ...issuePool.filter(i => i.severity === 'warning').slice(0, 2),
        ...issuePool.filter(i => i.severity === 'suggestion').slice(0, 1)
      ];
    } else if (score < 80) {
      // Fair scores (65-79) - mixed critical and warning issues
      selectedIssues = [
        ...issuePool.filter(i => i.severity === 'critical').slice(0, 1),
        ...issuePool.filter(i => i.severity === 'warning').slice(0, 3),
        ...issuePool.filter(i => i.severity === 'suggestion').slice(0, 2)
      ];
    } else if (score < 90) {
      // Good scores (80-89) - mostly warnings and suggestions
      selectedIssues = [
        ...issuePool.filter(i => i.severity === 'warning').slice(0, 2),
        ...issuePool.filter(i => i.severity === 'suggestion').slice(0, 4)
      ];
    } else {
      // Excellent scores (90+) - mostly suggestions for enhancement
      selectedIssues = [
        ...issuePool.filter(i => i.severity === 'warning').slice(0, 1),
        ...issuePool.filter(i => i.severity === 'suggestion').slice(0, 5)
      ];
    }

    const finalIssues = selectedIssues
      .sort(() => 0.5 - Math.random())
      .slice(0, issueCount);
    
    console.log(`Generated ${finalIssues.length} annotations for score ${score}:`, finalIssues.map(i => i.title));
    return finalIssues;
  }

  generateContextualSummary(score, analysisType) {
    // Enhanced score level detection with more granular ranges
    let scoreLevel;
    if (score >= 90) scoreLevel = 'excellent';
    else if (score >= 80) scoreLevel = 'good';
    else if (score >= 65) scoreLevel = 'fair';
    else scoreLevel = 'poor';
    
    console.log(`Generating summary for score: ${score}, level: ${scoreLevel}, type: ${analysisType}`);
    
    const summaries = {
      excellent: {
        basic: `Your interface demonstrates excellent design fundamentals with a score of ${score}. The implementation plan focuses on advanced micro-interactions, enhanced accessibility features, and performance optimizations to achieve industry-leading standards.`,
        detailed: `Outstanding UI quality (${score}/100) with comprehensive accessibility compliance and professional visual design. The implementation plan addresses advanced enhancements including sophisticated animations, comprehensive component library, and enterprise-level accessibility features.`,
        comprehensive: `Exceptional design execution (${score}/100) with near-perfect scores across all metrics. The implementation plan provides strategic enhancements for cutting-edge interactions, advanced design system implementation, and future-proof scalability improvements.`
      },
      good: {
        basic: `Your UI shows solid design foundations with a score of ${score}. The implementation plan targets specific improvements in color contrast consistency, spacing refinement, and enhanced interactive elements for a more polished user experience.`,
        detailed: `Strong design foundation (${score}/100) with consistent visual patterns and decent accessibility. The implementation plan focuses on systematic improvements including typography hierarchy, spacing standardization, and component refinement for professional-grade quality.`,
        comprehensive: `Well-structured interface (${score}/100) with good design consistency. The implementation plan provides comprehensive improvements addressing systematic spacing, enhanced accessibility features, and scalable component architecture for enterprise adoption.`
      },
      fair: {
        basic: `Your interface needs core usability and accessibility improvements with a score of ${score}. The implementation plan prioritizes critical fixes including color contrast, navigation enhancement, and spacing consistency to significantly improve user experience.`,
        detailed: `Mixed design quality (${score}/100) with some good elements but critical usability issues. The implementation plan addresses fundamental problems including accessibility compliance, visual hierarchy establishment, and systematic design improvements.`,
        comprehensive: `Inconsistent design quality (${score}/100) requiring systematic improvements. The implementation plan provides step-by-step solutions for accessibility compliance, design system establishment, and user experience enhancement across all touchpoints.`
      },
      poor: {
        basic: `Your UI requires substantial improvements to meet modern standards with a score of ${score}. The implementation plan focuses on critical accessibility fixes, fundamental spacing systems, and basic visual hierarchy establishment.`,
        detailed: `Significant design and accessibility issues (${score}/100) requiring comprehensive overhaul. The implementation plan addresses critical problems including contrast compliance, navigation redesign, and systematic design improvements from the ground up.`,
        comprehensive: `Major design and usability challenges (${score}/100) requiring complete rethinking. The implementation plan provides comprehensive solutions for accessibility compliance, design system implementation, and user experience transformation.`
      }
    };
    
    const summary = summaries[scoreLevel][analysisType];
    console.log(`Generated summary: ${summary.substring(0, 100)}...`);
    return summary;
  }

  generateDeveloperNotes(score, analysisType) {
    const baseNotes = [
      "Use semantic HTML5 elements (<main>, <section>, <nav>) for better accessibility and SEO.",
      "Add proper ARIA labels and roles for screen reader compatibility."
    ];

    if (score < 70) {
      return [
        "Critical: Run axe-core or lighthouse accessibility audit to identify WCAG violations.",
        "Implement responsive design with mobile-first approach using CSS Grid and Flexbox.",
        "Add proper form validation with HTML5 attributes and JavaScript fallbacks.",
        ...baseNotes.slice(0, 1)
      ];
    } else if (score < 85) {
      return [
        "Optimize images with WebP format and implement lazy loading for better performance.",
        "Add CSS containment to improve rendering performance for complex layouts.",
        "Implement proper error boundaries and loading states for better UX.",
        ...baseNotes.slice(0, 2)
      ];
    } else {
      return [
        "Consider implementing a design system with component-based architecture.",
        "Add progressive enhancement with service worker for offline functionality.",
        "Implement proper meta tags and structured data for better SEO.",
        ...baseNotes
      ];
    }
  }

  generateDesignerNotes(score, analysisType) {
    const baseNotes = [
      "Establish a clear visual hierarchy with consistent font sizes and weights.",
      "Use a limited color palette with sufficient contrast ratios for accessibility.",
      "Apply the 8-point grid system for consistent spacing throughout the design."
    ];

    if (score < 70) {
      return [
        "Focus on creating clear call-to-action buttons that stand out from other elements.",
        "Improve whitespace usage to reduce cognitive load and improve readability.",
        "Establish consistent typography scale (base, h1-h6) with proper line heights.",
        ...baseNotes.slice(0, 1)
      ];
    } else if (score < 85) {
      return [
        "Add subtle micro-interactions and transitions to enhance user engagement.",
        "Implement consistent iconography style (filled, outline, weight) throughout.",
        "Use visual feedback (loading states, hover effects) for all interactive elements.",
        ...baseNotes.slice(0, 2)
      ];
    } else {
      return [
        "Consider implementing dark mode with proper color contrast adjustments.",
        "Add personality through custom illustrations or photography that aligns with brand.",
        "Implement advanced interactions like drag-and-drop or gesture-based controls.",
        ...baseNotes
      ];
    }
  }

  generateImprovedRedesign(report, analysisType) {
    // Generate improved HTML based on the analysis results
    const hasCriticalIssues = report.annotations.some(a => a.severity === 'critical');
    const hasContrastIssues = report.annotations.some(a => a.title.toLowerCase().includes('contrast'));
    const hasSpacingIssues = report.annotations.some(a => a.title.toLowerCase().includes('spacing'));
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>UI Fixer - Redesigned Version</title>
    <style>
        /* Custom styles for improved contrast and spacing */
        .btn-primary { 
            background-color: #1D4ED8; 
            color: #FFFFFF; 
            transition: all 0.2s ease;
        }
        .btn-primary:hover { 
            background-color: #1E40AF; 
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
        }
        .text-high-contrast { color: #111827; }
        .bg-section { background-color: #F9FAFB; }
        .spacing-consistent { margin: 0; padding: 0; }
        .spacing-y-8 > * + * { margin-top: 2rem; }
        .focus-visible:focus { outline: 2px solid #1D4ED8; outline-offset: 2px; }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased">
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-center font-bold text-sm">
        ✨ UI Fixer — Redesigned Version | Fixed ${report.annotations.length} Issues
    </div>
    
    <!-- Improved Navigation with better contrast and spacing -->
    <nav class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="text-2xl font-bold text-blue-600 focus-visible:rounded" tabindex="0">BrandName</div>
            <div class="hidden md:flex items-center space-x-8">
                <a href="#features" class="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium focus-visible:rounded focus-visible">Features</a>
                <a href="#pricing" class="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium focus-visible:rounded focus-visible">Pricing</a>
                <a href="#about" class="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium focus-visible:rounded focus-visible">About</a>
                <button class="btn-primary px-6 py-3 rounded-xl font-semibold text-base focus-visible:rounded focus-visible">
                    Get Started
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero Section with improved hierarchy and contrast -->
    <main class="max-w-7xl mx-auto px-6 py-20">
        <section class="text-center spacing-y-8">
            <h1 class="text-5xl md:text-6xl font-extrabold text-high-contrast mb-6 leading-tight">
                Build your future with confidence
            </h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
                Our platform helps you manage projects and collaborate with your team in real-time, all in one place with powerful tools designed for modern workflows.
            </p>
            <div class="flex flex-col sm:flex-row justify-center items-center gap-4 spacing-y-4 sm:spacing-y-0">
                <button class="btn-primary px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl focus-visible:rounded focus-visible min-h-[44px] min-w-[44px]">
                    Start Free Trial
                </button>
                <button class="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200 hover:bg-gray-50 focus-visible:rounded focus-visible min-h-[44px] min-w-[44px]">
                    Watch Demo
                </button>
            </div>
        </section>

        <!-- Features Grid with consistent spacing -->
        <section id="features" class="mt-24 spacing-y-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-high-contrast mb-4">Everything you need to succeed</h2>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">Powerful features that help teams work better together</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 spacing-y-8">
                <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-high-contrast">Lightning Fast</h3>
                    <p class="text-gray-600 leading-relaxed">Optimized for speed so you can get things done without waiting around.</p>
                </div>
                
                <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div class="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-high-contrast">Secure by Default</h3>
                    <p class="text-gray-600 leading-relaxed">Your data is encrypted and protected with industry-leading security standards.</p>
                </div>
                
                <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-high-contrast">Team Friendly</h3>
                    <p class="text-gray-600 leading-relaxed">Built for teams to collaborate seamlessly across the globe with real-time updates.</p>
                </div>
            </div>
        </section>

        <!-- Call to Action with improved accessibility -->
        <section class="mt-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 class="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p class="text-xl mb-8 opacity-90">Join thousands of teams already using our platform</p>
            <button class="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all duration-200 focus-visible:rounded focus-visible min-h-[44px] min-w-[44px]">
                Start Your Free Trial
            </button>
        </section>
    </main>

    <!-- Footer with enhanced content -->
    <footer class="bg-gray-900 text-gray-300 px-6 py-12 mt-24">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <h4 class="text-white font-bold mb-4">Product</h4>
                <ul class="space-y-2">
                    <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Security</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-bold mb-4">Company</h4>
                <ul class="space-y-2">
                    <li><a href="#" class="hover:text-white transition-colors">About</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-bold mb-4">Resources</h4>
                <ul class="space-y-2">
                    <li><a href="#" class="hover:text-white transition-colors">Documentation</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">API</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Support</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-bold mb-4">Legal</h4>
                <ul class="space-y-2">
                    <li><a href="#" class="hover:text-white transition-colors">Privacy</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Terms</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Cookies</a></li>
                </ul>
            </div>
        </div>
        <div class="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 BrandName. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
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
   * Generate Design System based on analysis results
   */
  generateDesignSystem(report, analysisType) {
    try {
      console.log('Starting design system generation with report:', report);
      const score = report.overallScore;
      
      // Generate color palette based on accessibility needs
      const colorPalette = this.generateColorPalette(score, report.grades.colorContrast);
      console.log('Generated color palette');
      
      // Generate typography scale based on typography score
      const typography = this.generateTypographyScale(score, report.grades.typography);
      console.log('Generated typography');
      
      // Generate spacing system based on spacing score
      const spacing = this.generateSpacingSystem(score, report.grades.spacing);
      console.log('Generated spacing');
      
      // Generate component library based on identified issues
      const components = this.generateComponentLibrary(report.annotations, score);
      console.log('Generated components');
      
      // Generate design principles based on overall analysis
      const principles = this.generateDesignPrinciples(score, report.grades);
      console.log('Generated principles');
      
      const designSystem = {
        name: "UI Fixer Design System",
        version: "1.0.0",
        description: "A mini design system generated based on your UI analysis results",
        colorPalette,
        typography,
        spacing,
        components,
        principles,
        implementation: {
          css: this.generateCSSVariables(colorPalette, typography, spacing),
          tailwind: this.generateTailwindConfig(colorPalette, typography, spacing),
          guidelines: this.generateImplementationGuidelines(report)
        }
      };
      
      console.log('Design system generation complete');
      return designSystem;
    } catch (error) {
      console.error('Error generating design system:', error);
      // Return a basic fallback design system
      return {
        name: "UI Fixer Design System",
        version: "1.0.0",
        description: "A mini design system generated based on your UI analysis results",
        colorPalette: { primary: { 500: '#3B82F6' } },
        typography: { fontSize: { base: '16px' } },
        spacing: { 4: '16px' },
        components: [],
        principles: [],
        implementation: { css: '', tailwind: {}, guidelines: {} }
      };
    }
  }

  /**
   * Generate Implementation Plan based on analysis results
   */
  generateImplementationPlan(overallScore, annotations, analysisType) {
    try {
      console.log('Starting implementation plan generation with score:', overallScore);
      
      // Define phases based on score and analysis type
      const phases = {
        immediate: {
          title: "Immediate Fixes (Critical Issues)",
          icon: "AlertCircle",
          color: "red",
          priority: "high",
          estimatedTime: "2-4 hours",
          description: `Address critical issues identified in the analysis (${overallScore}/100).`,
          tasks: this.generateTasksForPhase(annotations, 'critical', overallScore)
        },
        short: {
          title: "Short-term Improvements (1-2 weeks)",
          icon: "Clock",
          color: "yellow",
          priority: "medium",
          estimatedTime: "1-2 weeks",
          description: `Implement medium-priority improvements (${overallScore}/100).`,
          tasks: this.generateTasksForPhase(annotations, 'warning', overallScore)
        },
        long: {
          title: "Long-term Enhancements (1-2 months)",
          icon: "Target",
          color: "blue",
          priority: "low",
          estimatedTime: "1-2 months",
          description: `Add advanced features and optimizations (${overallScore}/100).`,
          tasks: this.generateTasksForPhase(annotations, 'suggestion', overallScore)
        }
      };

      // Adjust phases based on analysis type
      if (analysisType === 'basic') {
        // Basic analysis gets fewer tasks
        Object.keys(phases).forEach(phase => {
          phases[phase].tasks = phases[phase].tasks.slice(0, 2);
        });
      } else if (analysisType === 'comprehensive') {
        // Comprehensive analysis gets more detailed tasks
        Object.keys(phases).forEach(phase => {
          phases[phase].tasks = phases[phase].tasks.concat(
            this.generateAdditionalTasks(phase, overallScore)
          );
        });
      }

      console.log('Implementation plan generation complete');
      return phases;
    } catch (error) {
      console.error('Error generating implementation plan:', error);
      // Return a basic fallback implementation plan
      return {
        immediate: {
          title: "Immediate Fixes (Critical Issues)",
          icon: "AlertCircle",
          color: "red",
          priority: "high",
          estimatedTime: "2-4 hours",
          description: `Address critical issues identified in the analysis (${overallScore}/100).`,
          tasks: []
        },
        short: {
          title: "Short-term Improvements (1-2 weeks)",
          icon: "Clock",
          color: "yellow",
          priority: "medium",
          estimatedTime: "1-2 weeks",
          description: `Implement medium-priority improvements (${overallScore}/100).`,
          tasks: []
        },
        long: {
          title: "Long-term Enhancements (1-2 months)",
          icon: "Target",
          color: "blue",
          priority: "low",
          estimatedTime: "1-2 months",
          description: `Add advanced features and optimizations (${overallScore}/100).`,
          tasks: []
        }
      };
    }
  }

  /**
   * Generate tasks for a specific phase based on annotations
   */
  generateTasksForPhase(annotations, severity, overallScore) {
    const filteredAnnotations = annotations.filter(ann => ann.severity === severity);
    
    return filteredAnnotations.map(ann => ({
      id: ann.id,
      title: ann.title,
      description: ann.description,
      fix: ann.fix,
      zone: ann.zone,
      code: this.generateCodeFix(ann),
      effort: this.calculateEffort(ann),
      priority: severity === 'critical' ? 'high' : severity === 'warning' ? 'medium' : 'low'
    }));
  }

  /**
   * Generate additional tasks for comprehensive analysis
   */
  generateAdditionalTasks(phase, overallScore) {
    const additionalTasks = {
      immediate: [
        {
          id: 'add_a11y_testing',
          title: 'Implement Accessibility Testing',
          description: 'Set up automated accessibility testing in your CI/CD pipeline',
          fix: 'Add axe-core testing to your test suite and configure accessibility audits',
          zone: 'general',
          code: `// Add to your test setup
import { injectAxe, checkA11y } from 'axe-core';

// Accessibility testing configuration
const a11yConfig = {
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true }
  }
};`,
          effort: 'Medium',
          priority: 'high'
        }
      ],
      short: [
        {
          id: 'performance_optimization',
          title: 'Performance Optimization',
          description: 'Optimize images and implement lazy loading for better performance',
          fix: 'Compress images, implement lazy loading, and add performance monitoring',
          zone: 'performance',
          code: `// Lazy loading implementation
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});`,
          effort: 'Medium',
          priority: 'medium'
        }
      ],
      long: [
        {
          id: 'design_system_docs',
          title: 'Design System Documentation',
          description: 'Create comprehensive documentation for your design system',
          fix: 'Document all components, tokens, and usage guidelines',
          zone: 'documentation',
          code: `# Design System Documentation

## Color Palette
- Primary: Used for main actions and branding
- Secondary: Used for secondary actions
- Neutral: Used for text and backgrounds

## Typography
- Use consistent font sizes and weights
- Maintain proper line heights for readability

## Spacing
- Follow 8px grid system
- Use consistent margins and padding`,
          effort: 'Low',
          priority: 'low'
        }
      ]
    };

    return additionalTasks[phase] || [];
  }

  /**
   * Generate code fix for an annotation
   */
  generateCodeFix(annotation) {
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
}`,
      nav: `/* Fix for ${annotation.title} */
.nav-link {
  padding: 0.5rem 1rem;
  color: #6B7280;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #1D4ED8;
  background-color: #F3F4F6;
}`,
      hero: `/* Fix for ${annotation.title} */
.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  color: #111827;
}

.hero-subtitle {
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.6;
  color: #6B7280;
}`,
      card: `/* Fix for ${annotation.title} */
.card {
  background: #FFFFFF;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}`,
      general: `/* Fix for ${annotation.title} */
.general-fix {
  margin: 1rem 0;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}`
    };

    return fixes[annotation.zone] || fixes.general;
  }

  /**
   * Calculate effort for an annotation
   */
  calculateEffort(annotation) {
    const efforts = {
      button: "Low",
      form: "Medium", 
      nav: "Medium",
      hero: "High",
      card: "Medium",
      general: "Low"
    };
    return efforts[annotation.zone] || "Medium";
  }

  generateColorPalette(score, contrastGrade) {
    const baseColors = {
      primary: contrastGrade < 70 ? '#1D4ED8' : '#3B82F6', // Higher contrast for poor contrast grades
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    };
    
    // Generate color variations
    const palette = {};
    Object.entries(baseColors).forEach(([name, base]) => {
      palette[name] = {
        50: this.lightenColor(base, 0.95),
        100: this.lightenColor(base, 0.9),
        200: this.lightenColor(base, 0.8),
        300: this.lightenColor(base, 0.7),
        400: this.lightenColor(base, 0.6),
        500: base,
        600: this.darkenColor(base, 0.1),
        700: this.darkenColor(base, 0.2),
        800: this.darkenColor(base, 0.3),
        900: this.darkenColor(base, 0.4)
      };
    });
    
    return palette;
  }

  generateTypographyScale(score, typographyGrade) {
    const baseSize = typographyGrade < 70 ? 16 : 14; // Larger base for poor typography
    const scale = [1, 1.125, 1.25, 1.375, 1.5, 1.75, 2, 2.25, 3];
    
    return {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      fontSize: {
        xs: `${baseSize * scale[0]}px`,
        sm: `${baseSize * scale[1]}px`,
        base: `${baseSize * scale[2]}px`,
        lg: `${baseSize * scale[3]}px`,
        xl: `${baseSize * scale[4]}px`,
        '2xl': `${baseSize * scale[5]}px`,
        '3xl': `${baseSize * scale[6]}px`,
        '4xl': `${baseSize * scale[7]}px`,
        '5xl': `${baseSize * scale[8]}px`
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    };
  }

  generateSpacingSystem(score, spacingGrade) {
    const baseUnit = spacingGrade < 70 ? 8 : 4; // Larger base for poor spacing
    
    return {
      0: '0px',
      1: `${baseUnit}px`,
      2: `${baseUnit * 2}px`,
      3: `${baseUnit * 3}px`,
      4: `${baseUnit * 4}px`,
      5: `${baseUnit * 5}px`,
      6: `${baseUnit * 6}px`,
      8: `${baseUnit * 8}px`,
      10: `${baseUnit * 10}px`,
      12: `${baseUnit * 12}px`,
      16: `${baseUnit * 16}px`,
      20: `${baseUnit * 20}px`,
      24: `${baseUnit * 24}px`,
      32: `${baseUnit * 32}px`,
      40: `${baseUnit * 40}px`,
      48: `${baseUnit * 48}px`,
      56: `${baseUnit * 56}px`,
      64: `${baseUnit * 64}px`
    };
  }

  generateComponentLibrary(annotations, score) {
    const components = [];
    
    // Analyze annotations to determine needed components
    const hasButtonIssues = annotations.some(a => a.zone === 'button');
    const hasFormIssues = annotations.some(a => a.zone === 'form');
    const hasNavIssues = annotations.some(a => a.zone === 'nav');
    
    if (hasButtonIssues) {
      components.push({
        name: 'Button',
        description: 'Accessible button component with proper contrast and focus states',
        props: ['variant', 'size', 'disabled', 'loading'],
        variants: ['primary', 'secondary', 'outline', 'ghost'],
        sizes: ['sm', 'md', 'lg'],
        accessibility: {
          'aria-label': 'Required for icon-only buttons',
          'role': 'button',
          'tabindex': '0'
        }
      });
    }
    
    if (hasFormIssues) {
      components.push({
        name: 'FormInput',
        description: 'Form input with proper labels and validation states',
        props: ['type', 'label', 'error', 'disabled', 'required'],
        variants: ['default', 'error', 'success'],
        accessibility: {
          'aria-label': 'Required if no visible label',
          'aria-required': 'For required fields',
          'aria-invalid': 'For validation errors'
        }
      });
    }
    
    if (hasNavIssues) {
      components.push({
        name: 'Navigation',
        description: 'Responsive navigation with keyboard support',
        props: ['items', 'variant', 'mobile'],
        variants: ['horizontal', 'vertical'],
        accessibility: {
          'role': 'navigation',
          'aria-label': 'Main navigation'
        }
      });
    }
    
    // Always include core components
    components.push(
      {
        name: 'Card',
        description: 'Flexible container for content sections',
        props: ['variant', 'padding', 'shadow'],
        variants: ['default', 'elevated', 'outlined']
      },
      {
        name: 'Badge',
        description: 'Small status indicators',
        props: ['variant', 'size'],
        variants: ['default', 'success', 'warning', 'error']
      }
    );
    
    return components;
  }

  generateDesignPrinciples(score, grades) {
    const principles = [
      {
        title: 'Accessibility First',
        description: 'Ensure all interactive elements meet WCAG AA standards',
        priority: grades.accessibility < 70 ? 'high' : 'medium'
      },
      {
        title: 'Consistent Spacing',
        description: 'Use the 8-point grid system for all layout decisions',
        priority: grades.spacing < 70 ? 'high' : 'medium'
      },
      {
        title: 'Clear Visual Hierarchy',
        description: 'Establish clear information hierarchy through typography and color',
        priority: grades.typography < 70 ? 'high' : 'medium'
      },
      {
        title: 'Responsive Design',
        description: 'Design for mobile-first with progressive enhancement',
        priority: grades.responsiveness < 70 ? 'high' : 'medium'
      }
    ];
    
    return principles.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  generateCSSVariables(colors, typography, spacing) {
    let css = ':root {\n';
    
    // Color variables
    Object.entries(colors).forEach(([colorName, shades]) => {
      Object.entries(shades).forEach(([shade, value]) => {
        css += `  --color-${colorName}-${shade}: ${value};\n`;
      });
    });
    
    // Typography variables
    Object.entries(typography.fontSize).forEach(([size, value]) => {
      css += `  --font-size-${size}: ${value};\n`;
    });
    
    // Spacing variables
    Object.entries(spacing).forEach(([size, value]) => {
      css += `  --spacing-${size}: ${value};\n`;
    });
    
    css += '}';
    return css;
  }

  generateTailwindConfig(colors, typography, spacing) {
    return {
      theme: {
        extend: {
          colors: Object.fromEntries(
            Object.entries(colors).map(([name, shades]) => [
              name,
              Object.fromEntries(
                Object.entries(shades).map(([shade, value]) => [shade, value])
              )
            ])
          ),
          fontSize: typography.fontSize,
          spacing: spacing
        }
      }
    };
  }

  generateImplementationGuidelines(report) {
    return {
      gettingStarted: [
        '1. Install the design system package',
        '2. Import CSS variables in your main stylesheet',
        '3. Start using the component library',
        '4. Follow the design principles for consistency'
      ],
      bestPractices: [
        'Always test color combinations for accessibility',
        'Use semantic HTML elements',
        'Implement proper focus management',
        'Test with keyboard navigation',
        'Validate with screen readers'
      ],
      migration: [
        'Gradually replace existing components',
        'Maintain backward compatibility during transition',
        'Document any breaking changes',
        'Provide training for team members'
      ]
    };
  }

  // Helper functions for color manipulation
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
      (G > 0 ? G : 0) * 0x100 +
      (B > 0 ? B : 0))
      .toString(16).slice(1);
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
