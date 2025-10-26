# Expense Manager

A comprehensive team expense management system built with React, Node.js, Express, and MongoDB. Features AI-powered expense categorization, budget monitoring, email alerts, and modern data visualization.

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Xhoni25/selego_test.git
cd selego_test

# 2. Install dependencies
npm run install-all

# 3. Setup environment files
npm run setup

# 4. Start the application
npm run dev
```

**That's it!** 🎉 
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

> **Note**: The project comes pre-configured with MongoDB Atlas. For AI features and email notifications, you'll need to add your OpenAI API key and Gmail credentials to `api/.env`.

## 🚀 Features

- **Team Management**: Create, edit, and delete teams with individual budgets
- **Expense Tracking**: Add, edit, and categorize expenses with AI suggestions
- **Budget Monitoring**: Real-time budget utilization tracking with visual indicators
- **Email Alerts**: Automatic notifications when teams reach 80% and 100% budget thresholds
- **AI Insights**: Smart expense categorization and spending pattern analysis
- **Data Visualization**: Table, Cards, and Charts views for expense analysis
- **Smart Filtering**: Search, team, and category filters with clear functionality
- **Modern UI**: Built with NextUI components and responsive design
- **Real-time Updates**: TanStack Query for efficient data management
- **TypeScript**: Full-stack TypeScript for type safety and better development experience

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **OpenAI API** for AI features
- **Nodemailer** for email notifications
- **Joi** for validation
- **Helmet** for security
- **CORS** for cross-origin requests

### Frontend
- **React 18** with Vite
- **TypeScript** (TSX) for type safety
- **NextUI** component library
- **TanStack Query** for data fetching
- **React Hook Form** for form management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API requests

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB** (optional for local development) - [Download here](https://www.mongodb.com/try/download/community)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Xhoni25/selego_test.git
cd selego_test
```

### 2. Install Dependencies

```bash
# Install all dependencies (both frontend and backend)
npm run install-all

# Or install manually
npm install
cd api && npm install
cd ../app && npm install
cd ..
```

### 3. Environment Setup

The project includes a setup script that creates the necessary environment files:

```bash
npm run setup
```

This will create:
- `api/.env` - Backend environment variables
- `app/.env` - Frontend environment variables

### 4. Configure Environment Variables

#### Backend Configuration (`api/.env`)

```env
# Server Configuration
PORT=5001
MONGODB_URI=mongodb+srv://developer:XJQ9LxWDdlxpsc2k@cluster0.6tmqpln.mongodb.net/expense-manager?appName=Cluster0

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-here

# OpenAI API (for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@expensemanager.com

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

#### Frontend Configuration (`app/.env`)

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api
```

### 5. Database Setup

#### Option A: MongoDB Atlas (Recommended - Already Configured)

The project is pre-configured with MongoDB Atlas. The connection string is already set in the `.env` file.

#### Option B: Local MongoDB

If you prefer local MongoDB:

1. Install MongoDB locally
2. Start MongoDB service
3. Update `MONGODB_URI` in `api/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/expense-manager
   ```

### 6. External Services Setup

#### OpenAI API (Required for AI Features)

1. Sign up at [OpenAI Platform](https://platform.openai.com)
2. Generate an API key
3. Add it to `api/.env`:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```

#### Email Service (Required for Notifications)

1. Use Gmail SMTP (recommended for development)
2. Enable 2-factor authentication on your Gmail account
3. Generate an app password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
4. Add credentials to `api/.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

## 🏃‍♂️ Running the Application

### Development Mode

Start both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:3000

### Individual Services

#### Backend Only
```bash
npm run server
# or
cd api && npm run dev
```

#### Frontend Only
```bash
npm run client
# or
cd app && npm run dev
```

### Production Build

```bash
# Build both frontend and backend
npm run build

# Start production servers
npm start
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/api/health

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | `{name, email, password, confirmPassword}` |
| `POST` | `/api/auth/login` | Login user | `{email, password}` |
| `GET` | `/api/auth/me` | Get current user | Headers: `Authorization: Bearer <token>` |

### Team Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/api/teams` | Get all teams for user | Headers: `Authorization: Bearer <token>` |
| `POST` | `/api/teams/search` | Search teams | `{query, filters}` |
| `GET` | `/api/teams/:id` | Get team by ID | Headers: `Authorization: Bearer <token>` |
| `POST` | `/api/teams` | Create new team | `{name, budget, members}` |
| `PUT` | `/api/teams/:id` | Update team | `{name, budget}` |
| `DELETE` | `/api/teams/:id` | Delete team | Headers: `Authorization: Bearer <token>` |

### Expense Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/api/expenses` | Get all expenses for user | Query: `?team_id=&category=&search=` |
| `POST` | `/api/expenses/search` | Search expenses | `{query, filters}` |
| `GET` | `/api/expenses/:id` | Get expense by ID | Headers: `Authorization: Bearer <token>` |
| `POST` | `/api/expenses` | Create new expense | `{team_id, amount, description, category, expense_date, notes}` |
| `PUT` | `/api/expenses/:id` | Update expense | `{amount, description, category, status, notes}` |
| `DELETE` | `/api/expenses/:id` | Delete expense | Headers: `Authorization: Bearer <token>` |

### Response Format

All API responses follow this format:

```json
{
  "ok": true,
  "data": { ... },
  "message": "Success message"
}
```

Error responses:

```json
{
  "ok": false,
  "code": "ERROR_CODE",
  "message": "Error description"
}
```

## 📁 Project Structure

```
expense-manager-project/
├── api/                          # Backend API (Node.js/Express/TypeScript)
│   ├── src/
│   │   ├── models/              # MongoDB schemas (Team, Expense, User)
│   │   │   ├── Team.ts
│   │   │   ├── Expense.ts
│   │   │   └── User.ts
│   │   ├── routes/              # API route handlers
│   │   │   ├── auth.ts
│   │   │   ├── teams.ts
│   │   │   └── expenses.ts
│   │   ├── services/            # External service integrations
│   │   │   ├── aiService.ts     # OpenAI integration
│   │   │   └── emailService.ts  # Email notifications
│   │   ├── middleware/          # Custom middleware
│   │   │   └── auth.ts          # JWT authentication
│   │   ├── types/               # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── index.ts             # Server entry point
│   │   └── index.js             # JavaScript fallback
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                     # Environment variables
│   └── env.example
├── app/                         # Frontend React app (TypeScript)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── Layout.tsx
│   │   ├── pages/               # Main application pages
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Teams.tsx
│   │   │   └── Expenses.tsx
│   │   ├── contexts/            # React context providers
│   │   │   └── AuthContext.tsx
│   │   ├── services/            # API service layer
│   │   │   └── api.ts
│   │   ├── types/               # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── tsconfig.json            # TypeScript config
│   ├── tsconfig.node.json       # Node TypeScript config
│   ├── .env                     # Environment variables
│   └── index.html
├── package.json                 # Root package.json (monorepo)
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
├── DEPLOYMENT.md                # Deployment instructions
├── MONGODB_SETUP.md             # Database setup guide
└── setup.js                     # Automated setup script
```

## ✨ Key Features Explained

### 🤖 AI-Powered Expense Categorization

- **Smart Suggestions**: Automatically suggests expense categories based on descriptions
- **OpenAI Integration**: Uses GPT-3.5-turbo model for intelligent categorization
- **Fallback System**: Defaults to 'other' category if AI fails
- **Learning**: Improves suggestions over time with usage patterns

### 📊 Budget Monitoring & Visualization

- **Real-time Tracking**: Live budget utilization calculation
- **Visual Indicators**: Progress bars and color-coded status indicators
- **Multiple Views**: Table, Cards, and Charts views for data analysis
- **Smart Filtering**: Search, team, and category filters with clear functionality
- **Threshold Alerts**: Automatic notifications at 80% and 100% budget usage

### 📧 Email Notifications

- **Multi-threshold Alerts**: Notifications at 80% and 100% budget usage
- **Team-wide Notifications**: Sends alerts to all team members
- **Rich Content**: Includes budget utilization details and visual indicators
- **Configurable**: Easily customizable via environment variables

### 🧩 Reusable Component System

- **Modal System**: Consistent UI for forms and confirmations
- **Loading States**: Spinners and skeleton loaders
- **Empty States**: User-friendly messages when no data is available
- **Status Badges**: Visual indicators for expense and team statuses
- **Centralized API**: Single service layer for all API communications

### 🔐 Security & Authentication

- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Additional security headers
- **Input Validation**: Joi schema validation for all inputs

### 📱 Modern UI/UX

- **NextUI Components**: Beautiful, accessible UI components
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Support**: Built-in dark/light theme support
- **Smooth Animations**: Framer Motion for delightful interactions
- **TypeScript**: Full type safety for better development experience

## 🛠️ Development

### Adding New Features

1. **Backend**: Add routes in `api/src/routes/`
2. **Frontend**: Add pages in `app/src/pages/`
3. **Components**: Create reusable components in `app/src/components/`
4. **Types**: Update TypeScript definitions in `api/src/types/` and `app/src/types/`

### Database Schema

#### Teams Collection

```typescript
{
  _id: ObjectId,
  name: String,
  budget: Number,
  members: [{
    user_id: String,
    name: String,
    email: String,
    role: String
  }],
  total_spent: Number,
  created_by: ObjectId,
  alerts_sent: {
    eighty_percent: Boolean,
    hundred_percent: Boolean
  },
  created_at: Date,
  updated_at: Date
}
```

#### Expenses Collection

```typescript
{
  _id: ObjectId,
  team_id: ObjectId,
  amount: Number,
  description: String,
  category: String,
  ai_suggested_category: String,
  status: String,
  created_by: ObjectId,
  expense_date: Date,
  receipt_url: String,
  notes: String,
  created_at: Date,
  updated_at: Date
}
```

#### Users Collection

```typescript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: String,
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### Available Scripts

#### Root Level
```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build both for production
npm run start        # Start production servers
npm run install-all  # Install all dependencies
npm run setup        # Setup environment files
```

#### Backend (api/)
```bash
npm run dev          # Start with nodemon
npm run build        # Build TypeScript
npm start            # Start production
```

#### Frontend (app/)
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)

1. **Railway (Recommended)**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Heroku**
   ```bash
   # Install Heroku CLI
   # Create new app
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   # ... other variables
   
   # Deploy
   git push heroku main
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Vercel (Recommended)**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   cd app
   vercel
   ```

2. **Netlify**
   ```bash
   # Build the project
   cd app && npm run build
   
   # Deploy dist folder to Netlify
   ```

### Environment Variables for Production

Make sure to set these in your hosting platform:

**Backend:**
- `MONGODB_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `CLIENT_URL` (your frontend URL)

**Frontend:**
- `VITE_API_URL` (your backend API URL)

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Verify connection string
echo $MONGODB_URI
```

#### 2. Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or use different port
PORT=5002 npm run dev
```

#### 3. OpenAI API Error
- Verify API key is correct
- Check API usage limits and billing
- Ensure sufficient credits

#### 4. Email Not Working
- Verify Gmail app password (16 characters)
- Ensure 2FA is enabled
- Check SMTP settings

#### 5. CORS Issues
- Check `CLIENT_URL` in backend `.env`
- Verify frontend URL matches exactly
- Clear browser cache

#### 6. TypeScript Errors
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript config
npx tsc --noEmit
```

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=* npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and the `/docs` folder
- **Issues**: Create an issue on [GitHub](https://github.com/Xhoni25/selego_test/issues)
- **Email**: support@expensemanager.com

## 🙏 Acknowledgments

- [NextUI](https://nextui.org/) for beautiful components
- [TanStack Query](https://tanstack.com/query) for data fetching
- [OpenAI](https://openai.com/) for AI capabilities
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting

---

**Built with ❤️ using modern web technologies**

*Last updated: December 2024*
