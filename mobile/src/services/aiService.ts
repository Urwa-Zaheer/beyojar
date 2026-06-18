import axios from 'axios';

export interface AIServiceConfig {
  apiKey: string;
  apiUrl: string;
  model?: string;
}

export interface TaskExtractionResult {
  tasks: Array<{
    title: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    dueDate?: string;
  }>;
  summary: string;
}

export interface PlanningInsight {
  insight: string;
  recommendation: string;
  priority: number;
}

export interface DailyReport {
  tasksCompleted: number;
  tasksInProgress: number;
  insights: PlanningInsight[];
  productivityScore: number;
  suggestions: string[];
}

class AIService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(config: AIServiceConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4';
  }

  /**
   * Extract tasks from voice/text notes using AI
   */
  async extractTasks(noteContent: string): Promise<TaskExtractionResult> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are a productivity assistant that extracts tasks and actionable items from notes.
              Parse the given text and extract tasks with titles, descriptions, priorities, and due dates.
              Return a JSON object with tasks array and summary.
              Format: { "tasks": [{ "title": string, "description"?: string, "priority"?: "high"|"medium"|"low", "dueDate"?: string }], "summary": string }`,
            },
            {
              role: 'user',
              content: `Extract tasks from this note: "${noteContent}"`,
            },
          ],
          temperature: 0.5,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error extracting tasks:', error);
      throw new Error('Failed to extract tasks from note');
    }
  }

  /**
   * Generate daily planning insights and productivity recommendations
   */
  async generateDailyInsights(notes: string[], tasksData: any[]): Promise<DailyReport> {
    try {
      const notesText = notes.join('\n');
      const tasksText = tasksData.map(t => `- ${t.title}`).join('\n');

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are a productivity coach. Analyze the user's daily notes and tasks.
              Provide insights, recommendations, and a productivity score (0-100).
              Return JSON: { "insights": [{ "insight": string, "recommendation": string, "priority": number }], "productivityScore": number, "suggestions": string[] }`,
            },
            {
              role: 'user',
              content: `Here are my daily notes:\n${notesText}\n\nMy tasks:\n${tasksText}\n\nProvide insights and recommendations.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;
      const parsed = JSON.parse(content);

      return {
        tasksCompleted: tasksData.filter(t => t.completed).length,
        tasksInProgress: tasksData.filter(t => t.inProgress).length,
        insights: parsed.insights || [],
        productivityScore: parsed.productivityScore || 0,
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      console.error('Error generating daily insights:', error);
      throw new Error('Failed to generate daily insights');
    }
  }

  /**
   * Generate a summary from voice/text notes
   */
  async generateSummary(noteContent: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are a note summarization expert. Provide a concise, clear summary of the given note.
              Focus on key points and main ideas.`,
            },
            {
              role: 'user',
              content: `Summarize this note: "${noteContent}"`,
            },
          ],
          temperature: 0.5,
          max_tokens: 300,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }
}

export default AIService;
