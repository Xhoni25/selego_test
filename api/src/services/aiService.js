const OpenAI = require('openai');

class AIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async suggestExpenseCategory(description) {
    try {
      const prompt = `
        Analyze this expense description and suggest the most appropriate category.
        Description: "${description}"
        
        Choose from these categories: travel, food, supplies, software, marketing, office, other
        
        Respond with only the category name, nothing else.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      });

      const suggestedCategory = response.choices[0].message.content
        .trim()
        .toLowerCase();

      // Validate the response
      const validCategories = [
        'travel',
        'food',
        'supplies',
        'software',
        'marketing',
        'office',
        'other',
      ];
      return validCategories.includes(suggestedCategory)
        ? suggestedCategory
        : 'other';
    } catch (error) {
      console.error('AI category suggestion failed:', error);
      return 'other';
    }
  }

  async generateSpendingInsights(expenses) {
    try {
      if (!expenses || expenses.length === 0) {
        return 'No expenses to analyze.';
      }

      const totalAmount = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const categoryBreakdown = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});

      const topCategory = Object.entries(categoryBreakdown).sort(
        ([, a], [, b]) => b - a
      )[0];

      const prompt = `
        Analyze these expense data and provide brief insights:
        - Total expenses: $${totalAmount.toFixed(2)}
        - Number of expenses: ${expenses.length}
        - Top spending category: ${topCategory ? topCategory[0] : 'N/A'} ($${
        topCategory ? topCategory[1].toFixed(2) : '0'
      })
        - Categories: ${Object.keys(categoryBreakdown).join(', ')}
        
        Provide 2-3 brief, actionable insights about spending patterns. Keep it concise and professional.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.3,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI insights generation failed:', error);
      return 'Unable to generate insights at this time.';
    }
  }
}

module.exports = new AIService();
