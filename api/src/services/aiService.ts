import OpenAI from 'openai';
import { ExpenseCategory } from '../types';

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY'],
    });
  }

  async categorizeExpense(
    description: string
  ): Promise<{ ok: boolean; category?: ExpenseCategory; error?: string }> {
    try {
      const prompt = `Categorize this expense description into one of these categories: travel, food, supplies, software, marketing, office, other. Only respond with the category name.

Description: "${description}"

Category:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      });

      const category = response.choices[0]?.message?.content
        ?.trim()
        .toLowerCase() as ExpenseCategory;

      const validCategories: ExpenseCategory[] = [
        'travel',
        'food',
        'supplies',
        'software',
        'marketing',
        'office',
        'other',
      ];

      if (validCategories.includes(category)) {
        return { ok: true, category };
      } else {
        return { ok: true, category: 'other' };
      }
    } catch (error) {
      console.error('AI categorization failed:', error);
      return { ok: false, error: (error as Error).message };
    }
  }

  async generateInsights(
    expenses: any[]
  ): Promise<{ ok: boolean; insights?: string; error?: string }> {
    try {
      const expenseSummary = expenses.map(exp => ({
        amount: exp.amount,
        category: exp.category,
        description: exp.description,
        date: exp.expense_date,
      }));

      const prompt = `Analyze these expense data and provide insights in 2-3 sentences. Focus on spending patterns, category distribution, and any notable trends.

Expenses: ${JSON.stringify(expenseSummary, null, 2)}

Insights:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3,
      });

      const insights = response.choices[0]?.message?.content?.trim();
      return { ok: true, insights: insights || 'No insights available' };
    } catch (error) {
      console.error('AI insights generation failed:', error);
      return { ok: false, error: (error as Error).message };
    }
  }
}

export default new AIService();
