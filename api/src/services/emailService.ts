import nodemailer, { Transporter } from 'nodemailer';
import { ITeam } from '../types';

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env['EMAIL_HOST'],
      port: parseInt(process.env['EMAIL_PORT'] || '587'),
      secure: false,
      auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASS'],
      },
    });
  }

  async sendBudgetAlert(
    team: ITeam,
    alertType: 'eighty' | 'hundred'
  ): Promise<{ ok: boolean; messageId?: string; error?: string }> {
    try {
      const utilization = team.budget_utilization;
      const subject = `Budget Alert: ${team.name} - ${
        alertType === 'eighty' ? '80%' : '100%'
      } threshold reached`;

      const message = `
        <h2>Budget Alert for ${team.name}</h2>
        <p>Your team has reached ${utilization.toFixed(1)}% of its budget.</p>
        <p><strong>Budget:</strong> $${team.budget.toFixed(2)}</p>
        <p><strong>Spent:</strong> $${team.total_spent.toFixed(2)}</p>
        <p><strong>Remaining:</strong> $${(
          team.budget - team.total_spent
        ).toFixed(2)}</p>
        ${
          alertType === 'hundred'
            ? '<p style="color: red;"><strong>⚠️ Your team has exceeded its budget!</strong></p>'
            : ''
        }
      `;

      const mailOptions = {
        from: process.env['FROM_EMAIL'],
        to: team.members.map(member => member.email).join(', '),
        subject,
        html: message,
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { ok: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { ok: false, error: (error as Error).message };
    }
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<{ ok: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: process.env['FROM_EMAIL'],
        to: userEmail,
        subject: 'Welcome to Expense Manager',
        html: `
          <h2>Welcome to Expense Manager, ${userName}!</h2>
          <p>You can now start managing your team expenses efficiently.</p>
          <p>Login to your account to get started.</p>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { ok: true, messageId: result.messageId };
    } catch (error) {
      console.error('Welcome email failed:', error);
      return { ok: false, error: (error as Error).message };
    }
  }
}

export default new EmailService();
