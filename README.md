# Expense Manager

A comprehensive team expense management system built with React, Node.js, Express, and MongoDB. Features AI-powered expense categorization, budget monitoring, and email alerts.

## Features

- **Team Management**: Create and manage teams with individual budgets
- **Expense Tracking**: Add, edit, and categorize expenses with AI suggestions
- **Budget Monitoring**: Real-time budget utilization tracking with visual indicators
- **Email Alerts**: Automatic notifications when teams reach 80% and 100% budget thresholds
- **AI Insights**: Smart expense categorization and spending pattern analysis
- **Modern UI**: Built with NextUI components and responsive design
- **Real-time Updates**: TanStack Query for efficient data management

## Tech Stack

### Backend

- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- OpenAI API for AI features
- Nodemailer for email notifications
- Joi for validation

### Frontend

- React 18 with Vite
- NextUI component library
- TanStack Query for data fetching
- React Hook Form for form management
- React Router for navigation
- Tailwind CSS for styling

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Git

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd expense-manager-project
   ```

2. **Run the setup script**

   ```bash
   npm run setup
   ```

   This will install all dependencies and create the environment file.

3. **Configure environment variables**

   Edit `api/.env` with your configuration:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/expense-manager
   JWT_SECRET=your-super-secret-jwt-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FROM_EMAIL=noreply@expensemanager.com
   ```

4. **Set up MongoDB**

   **Option A: Local MongoDB**

   - Install MongoDB locally
   - Start MongoDB service
   - The application will connect to `mongodb://localhost:27017/expense-manager`

   **Option B: MongoDB Atlas (Cloud)**

   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string
   - Update `MONGODB_URI` in your `.env` file

5. **Set up external services**

   **OpenAI API (for AI features)**

   - Sign up at [OpenAI](https://platform.openai.com)
   - Generate an API key
   - Add it to your `.env` file

   **Email Service (for notifications)**

   - Use Gmail SMTP (recommended for development)
   - Enable 2-factor authentication
   - Generate an app password
   - Add credentials to your `.env` file

## Running the Application

1. **Start the development servers**

   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) concurrently.

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Team Endpoints

- `POST /api/teams/search` - Search teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team
- `GET /api/teams/:id/expenses` - Get team expenses
- `POST /api/teams/:id/check-budget` - Check budget alerts

### Expense Endpoints

- `POST /api/expenses/search` - Search expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/:teamId/insights` - Get AI insights

## Project Structure

```
expense-manager-project/
├── api/                          # Backend API
│   ├── src/
│   │   ├── models/              # MongoDB models
│   │   ├── routes/              # API routes
│   │   ├── services/            # External services
│   │   ├── middleware/          # Custom middleware
│   │   └── index.js             # Server entry point
│   ├── package.json
│   └── env.example
├── app/                         # Frontend React app
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── package.json                 # Root package.json
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## Key Features Explained

### AI-Powered Expense Categorization

- Automatically suggests expense categories based on descriptions
- Uses OpenAI's GPT-3.5-turbo model
- Fallback to 'other' category if AI fails

### Budget Monitoring

- Real-time budget utilization calculation
- Visual progress indicators
- Automatic email alerts at 80% and 100% thresholds

### Email Notifications

- Sends alerts to all team members
- Includes budget utilization details
- Configurable via environment variables

### Reusable Components

- Modal system for consistent UI
- Loading spinners and empty states
- Status badges and confirm dialogs
- Centralized API service

## Development

### Adding New Features

1. **Backend**: Add routes in `api/src/routes/`
2. **Frontend**: Add pages in `app/src/pages/`
3. **Components**: Create reusable components in `app/src/components/`

### Database Schema

**Teams Collection**

```javascript
{
  name: String,
  budget: Number,
  members: [{
    user_id: String,
    name: String,
    email: String,
    role: String
  }],
  total_spent: Number,
  budget_alerts_sent: {
    eighty_percent: Boolean,
    hundred_percent: Boolean
  }
}
```

**Expenses Collection**

```javascript
{
  team_id: ObjectId,
  amount: Number,
  description: String,
  category: String,
  ai_suggested_category: String,
  status: String,
  created_by: String,
  expense_date: Date,
  notes: String
}
```

## Deployment

### Backend Deployment (Heroku/Railway)

1. Set environment variables in your hosting platform
2. Deploy the `api` folder
3. Ensure MongoDB connection is accessible

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend: `cd app && npm run build`
2. Deploy the `dist` folder
3. Update API URLs for production

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for cloud MongoDB

2. **OpenAI API Error**

   - Verify API key is correct
   - Check API usage limits
   - Ensure sufficient credits

3. **Email Not Working**

   - Verify SMTP credentials
   - Check Gmail app password
   - Ensure 2FA is enabled

4. **CORS Issues**
   - Check `CLIENT_URL` in backend `.env`
   - Verify frontend URL matches

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@expensemanager.com or create an issue in the repository.

---

Built with ❤️ using modern web technologies
