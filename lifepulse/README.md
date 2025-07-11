# LifePulse - Personal Wellness & Productivity Tracker

A beautiful, modern web application for tracking your personal wellness goals, hydration, meditation, and daily schedule. Built with Next.js 15, TypeScript, and MongoDB.

## Features

- 🎯 **Goal Tracking** - Set and monitor both simple and progress-based goals
- 💧 **Hydration Monitoring** - Track your daily water intake with visual progress
- 🧘 **Meditation & Breathing** - Guided breathing exercises and session tracking  
- 📅 **Schedule Management** - Organize your daily events and tasks
- 📊 **Dashboard Analytics** - Beautiful insights into your wellness journey
- 🌓 **Dark/Light Mode** - Toggle between themes for comfortable viewing
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔐 **Secure Authentication** - Built-in user authentication with NextAuth.js

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with native MongoDB driver
- **Authentication**: NextAuth.js v4
- **State Management**: TanStack Query (React Query) + Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- MongoDB database (local or Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lifepulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/lifepulse
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   
   # Generate secret with: openssl rand -base64 32
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

#### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/lifepulse` as your MONGODB_URI

#### Option 2: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Get your connection string
4. Replace `<username>`, `<password>`, and `<cluster-url>` in:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/lifepulse?retryWrites=true&w=majority
   ```

## Project Structure

```
lifepulse/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── goals/             # Goals management
│   │   ├── hydration/         # Hydration tracking
│   │   ├── breathe/           # Breathing exercises
│   │   ├── schedule/          # Schedule management
│   │   └── profile/           # User profile
│   ├── components/            # Reusable components
│   │   ├── auth/              # Authentication components
│   │   └── ui/                # UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── mongodb.ts         # MongoDB connection
│   │   └── db/                # Database operations
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features Overview

### Dashboard
- Real-time progress tracking for all activities
- Beautiful charts and statistics
- Quick action buttons for common tasks
- Personalized greetings and insights

### Goals Management
- Create simple checkbox goals or progress-based goals
- Set target values with custom units
- Track completion percentage
- Filter by category and status
- Set deadlines and priorities

### Hydration Tracking
- Log water intake in customizable amounts
- Visual progress bars and statistics
- Daily goals and achievement tracking
- Historical data viewing

### Meditation & Breathing
- Guided breathing exercises with different patterns
- Session duration tracking
- Progress statistics and history
- Calming animations and visual feedback

### Schedule Management
- Create and manage daily events
- Categorize events by type
- Set priorities and completion status
- Calendar view with filtering options

## Authentication

The app uses NextAuth.js for secure authentication:
- Credential-based login with email/password
- Secure password hashing with bcrypt
- JWT-based sessions
- Protected API routes

## Database Models

- **Users** - User accounts and profiles
- **Goals** - Goal tracking with progress
- **Hydration** - Water intake entries
- **Meditation** - Meditation session records
- **Schedule** - Calendar events and tasks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository.
