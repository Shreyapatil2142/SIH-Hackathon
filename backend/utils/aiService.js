const axios = require('axios');

class AIService {
  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
      'x-internal-token': process.env.AI_INTERNAL_TOKEN
    };
  }

  async summarizeDocument(text) {
    try {
      const response = await axios.post(
        process.env.AI_SUMMARIZATION_URL || 'http://localhost:8011/summarize',
        { text },
        { 
          headers: this.headers,
          timeout: 30000 // 30 seconds timeout
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Summarization service error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async translateText(text, targetLanguage = 'ml') {
    try {
      const response = await axios.post(
        process.env.AI_TRANSLATION_URL || 'http://localhost:8012/translate',
        { 
          text,
          target_language: targetLanguage
        },
        { 
          headers: this.headers,
          timeout: 30000
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Translation service error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async assignTasksToRoles(documentText, tasks) {
    try {
      const response = await axios.post(
        process.env.AI_ROLE_FILTER_URL || 'http://localhost:8013/assign',
        { 
          document_text: documentText,
          tasks
        },
        { 
          headers: this.headers,
          timeout: 30000
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Role filter service error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processDocument(documentText) {
    try {
      console.log('Starting document processing...');
      
      // Check if AI services are available
      const aiServicesAvailable = process.env.AI_INTERNAL_TOKEN && 
                                 process.env.AI_SUMMARIZATION_URL;
      
      if (!aiServicesAvailable) {
        console.log('AI services not configured, using fallback processing...');
        return this.fallbackProcessing(documentText);
      }
      
      // Step 1: Summarize document
      console.log('Step 1: Summarizing document...');
      const summaryResult = await this.summarizeDocument(documentText);
      
      if (!summaryResult.success) {
        console.warn('AI summarization failed, using fallback processing...');
        return this.fallbackProcessing(documentText);
      }

      const summary = summaryResult.data.summary || summaryResult.data;
      
      // Step 2: Translate summary to Malayalam
      console.log('Step 2: Translating summary...');
      const translationResult = await this.translateText(summary, 'ml');
      
      if (!translationResult.success) {
        console.warn('Translation failed, continuing with English only');
      }

      // Step 3: Extract key points (simplified - in production, this would be AI-generated)
      const keyPoints = this.extractKeyPoints(summary);

      // Step 4: Generate tasks based on document content
      const tasks = this.generateTasksFromDocument(documentText);

      // Step 5: Assign tasks to roles
      console.log('Step 3: Assigning tasks to roles...');
      const assignmentResult = await this.assignTasksToRoles(documentText, tasks);
      
      if (!assignmentResult.success) {
        console.warn('Role assignment failed, using default assignments');
      }

      const assignments = assignmentResult.success ? assignmentResult.data : this.getDefaultAssignments(tasks);

      return {
        success: true,
        data: {
          summary_en: summary,
          summary_ml: translationResult.success ? translationResult.data.translated_text : null,
          key_points: keyPoints,
          tasks: tasks.map((task, index) => ({
            ...task,
            assigned_role: assignments[index] || 'OTHER'
          }))
        }
      };
    } catch (error) {
      console.error('Document processing error:', error);
      console.log('Falling back to basic processing...');
      return this.fallbackProcessing(documentText);
    }
  }

  fallbackProcessing(documentText) {
    console.log('Using fallback document processing...');
    
    // Generate a basic summary
    const summary = this.generateBasicSummary(documentText);
    
    // Generate basic Malayalam translation (simplified)
    const summary_ml = this.generateBasicMalayalamTranslation(summary);
    
    // Extract key points
    const keyPoints = this.extractKeyPoints(summary);
    
    // Generate tasks
    const tasks = this.generateTasksFromDocument(documentText);
    
    return {
      success: true,
      data: {
        summary_en: summary,
        summary_ml: summary_ml,
        key_points: keyPoints,
        tasks: tasks.map((task, index) => ({
          ...task,
          assigned_role: this.getDefaultAssignments(tasks)[index] || 'OTHER'
        }))
      }
    };
  }

  generateBasicSummary(text) {
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const importantSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return lowerSentence.includes('maintenance') || 
             lowerSentence.includes('safety') || 
             lowerSentence.includes('inspection') ||
             lowerSentence.includes('required') ||
             lowerSentence.includes('urgent');
    });
    
    if (importantSentences.length > 0) {
      return importantSentences.slice(0, 3).join('. ').trim() + '.';
    }
    
    // Fallback to first few sentences
    return sentences.slice(0, 2).join('. ').trim() + '.';
  }

  generateBasicMalayalamTranslation(summary) {
    // Basic keyword translation mapping
    const translations = {
      'maintenance': 'പരിപാലനം',
      'safety': 'സുരക്ഷ',
      'inspection': 'പരിശോധന',
      'required': 'ആവശ്യമാണ്',
      'urgent': 'അടിയന്തിര',
      'track': 'ട്രാക്ക്',
      'electrical': 'ഇലക്ട്രിക്കൽ',
      'system': 'സിസ്റ്റം',
      'protocols': 'നടപടികൾ',
      'training': 'പരിശീലനം'
    };
    
    let malayalamSummary = summary;
    Object.entries(translations).forEach(([en, ml]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      malayalamSummary = malayalamSummary.replace(regex, ml);
    });
    
    return malayalamSummary;
  }

  extractKeyPoints(summary) {
    // Simplified key point extraction
    // In production, this would be handled by AI
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 5).map(sentence => sentence.trim());
  }

  generateTasksFromDocument(text) {
    // Simplified task generation based on keywords
    // In production, this would be AI-generated
    const tasks = [];
    
    // Look for common task indicators
    const taskKeywords = [
      'inspect', 'check', 'verify', 'review', 'maintain', 'repair',
      'replace', 'update', 'install', 'configure', 'test', 'monitor'
    ];

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();
      const hasKeyword = taskKeywords.some(keyword => lowerSentence.includes(keyword));
      
      if (hasKeyword && tasks.length < 10) { // Limit to 10 tasks
        tasks.push({
          title: `Task ${tasks.length + 1}: ${sentence.trim().substring(0, 100)}...`,
          description_en: sentence.trim(),
          due_date: this.calculateDueDate(index)
        });
      }
    });

    // If no tasks found, create a default one
    if (tasks.length === 0) {
      tasks.push({
        title: 'Review Document',
        description_en: 'Please review the uploaded document and take necessary action',
        due_date: this.calculateDueDate(0)
      });
    }

    return tasks;
  }

  calculateDueDate(taskIndex) {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + (taskIndex + 1) * 7); // 1 week per task
    return dueDate.toISOString().split('T')[0];
  }

  getDefaultAssignments(tasks) {
    // Default role assignment logic
    const roles = ['ENGINEER', 'SUB_DIV_OFFICER', 'DEPOT_MANAGER', 'OTHER'];
    return tasks.map((_, index) => roles[index % roles.length]);
  }
}

module.exports = new AIService();
